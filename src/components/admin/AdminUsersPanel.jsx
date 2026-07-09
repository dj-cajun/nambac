import { useCallback, useEffect, useMemo, useState } from 'react';
import { createAdminApi } from '../../lib/adminApi';

function formatDateTime(value) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminUsersPanel({ showToast }) {
  const api = useMemo(() => createAdminApi(), []);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.fetchUsers({
        search: debouncedSearch,
        role: roleFilter,
      });
      setUsers(data.users || []);
      setStats(data.stats || null);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast?.('회원 목록을 불러오지 못했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  }, [api, debouncedSearch, roleFilter, showToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const mailableUsers = useMemo(
    () => users.filter((u) => u.email_opt_in !== false),
    [users],
  );

  const copyEmails = async (list) => {
    const emails = list.map((u) => u.email).filter(Boolean).join(', ');
    if (!emails) {
      showToast?.('복사할 이메일이 없습니다.', 'error');
      return;
    }
    await navigator.clipboard.writeText(emails);
    showToast?.(`${list.length}명 이메일 복사됨`, 'success');
  };

  const exportCsv = () => {
    const header = 'email,name,role,email_opt_in,last_login_at,created_at,admin_note';
    const rows = users.map((u) => [
      u.email,
      `"${(u.name || '').replace(/"/g, '""')}"`,
      u.role || 'user',
      u.email_opt_in === false ? '0' : '1',
      u.last_login_at || '',
      u.created_at || '',
      `"${(u.admin_note || '').replace(/"/g, '""')}"`,
    ].join(','));
    downloadText(`nambac-users-${new Date().toISOString().slice(0, 10)}.csv`, [header, ...rows].join('\n'));
    showToast?.('CSV 다운로드 시작', 'success');
  };

  const patchUser = async (userId, patch) => {
    try {
      const { user } = await api.updateUser(userId, patch);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...user } : u)));
      if (patch.role) showToast?.('권한이 변경되었습니다.', 'success');
      if (patch.email_opt_in !== undefined) showToast?.('메일 수신 설정이 저장되었습니다.', 'success');
      if (patch.admin_note !== undefined) showToast?.('메모가 저장되었습니다.', 'success');
    } catch (error) {
      console.error('Error updating user:', error);
      showToast?.(`저장 실패: ${error.message}`, 'error');
      fetchUsers();
    }
  };

  return (
    <div className="admin-users-panel">
      {stats && (
        <div className="admin-user-stats">
          <div className="admin-user-stat">
            <span className="admin-user-stat-label">전체 회원</span>
            <strong>{stats.total}</strong>
          </div>
          <div className="admin-user-stat">
            <span className="admin-user-stat-label">관리자</span>
            <strong>{stats.admins}</strong>
          </div>
          <div className="admin-user-stat">
            <span className="admin-user-stat-label">오늘 조회자</span>
            <strong>{stats.activeToday}</strong>
            <span className="admin-user-stat-sub">
              로그인 {stats.activeTodayLoggedIn ?? 0} · 비로그인 {stats.activeTodayGuest ?? 0}
            </span>
          </div>
          <div className="admin-user-stat">
            <span className="admin-user-stat-label">7일 내 활동</span>
            <strong>{stats.active7d}</strong>
          </div>
          <div className="admin-user-stat">
            <span className="admin-user-stat-label">메일 발송 가능</span>
            <strong>{stats.mailable}</strong>
          </div>
        </div>
      )}

      <div className="admin-toolbar">
        <input
          type="search"
          className="admin-search"
          placeholder="이름·이메일 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="admin-filters">
          {[
            { id: 'all', label: '전체' },
            { id: 'user', label: 'user' },
            { id: 'admin', label: 'admin' },
          ].map((chip) => (
            <button
              key={chip.id}
              type="button"
              className={`admin-filter-chip ${roleFilter === chip.id ? 'active' : ''}`}
              onClick={() => setRoleFilter(chip.id)}
            >
              {chip.label}
            </button>
          ))}
        </div>
        <div className="admin-user-actions">
          <button type="button" className="admin-btn admin-btn-secondary" onClick={fetchUsers} disabled={loading}>
            {loading ? '…' : '↻'}
          </button>
          <button type="button" className="admin-btn admin-btn-secondary" onClick={() => copyEmails(mailableUsers)}>
            이메일 복사
          </button>
          <button type="button" className="admin-btn admin-btn-secondary" onClick={exportCsv}>
            CSV
          </button>
        </div>
      </div>

      <p className="admin-users-hint">
        표시 {users.length}명 / 전체 {total}명 · 메일 발송 전 수신 동의(✉) 확인 · Gmail에서
        {' '}
        <code>mailto:?bcc=...</code>
        {' '}
        또는 CSV로 활용
      </p>

      {loading ? (
        <div className="p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#FF2D85] border-t-transparent mb-4" />
          <p className="text-gray-500">회원 목록 불러오는 중…</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="admin-users-table w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th>회원</th>
                <th>이메일</th>
                <th className="text-center">권한</th>
                <th className="text-center">수신</th>
                <th className="text-center">로그인</th>
                <th className="text-center">최근 접속</th>
                <th className="text-center">가입</th>
                <th>메모</th>
                <th className="text-center">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-gray-400">
                    조건에 맞는 회원이 없습니다.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-pink-50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3 min-w-[140px]">
                        {u.picture_url ? (
                          <img src={u.picture_url} alt="" className="w-9 h-9 rounded-full border border-gray-200 object-cover" />
                        ) : (
                          <span className="w-9 h-9 rounded-full bg-pink-100 text-pink-600 font-black flex items-center justify-center text-sm">
                            {(u.name || u.email || '?')[0]}
                          </span>
                        )}
                        <span className="font-bold text-gray-900">{u.name || '-'}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-gray-700">
                      <a href={`mailto:${u.email}`} className="admin-user-email">{u.email}</a>
                    </td>
                    <td className="p-3 text-center">
                      <select
                        value={u.role || 'user'}
                        onChange={(e) => patchUser(u.id, { role: e.target.value })}
                        className={`admin-user-role ${u.role === 'admin' ? 'is-admin' : ''}`}
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        className={`admin-user-optin ${u.email_opt_in === false ? 'off' : 'on'}`}
                        title={u.email_opt_in === false ? '수신 거부' : '수신 동의'}
                        onClick={() => patchUser(u.id, { email_opt_in: u.email_opt_in === false })}
                      >
                        {u.email_opt_in === false ? '✕' : '✉'}
                      </button>
                    </td>
                    <td className="p-3 text-center text-sm text-gray-600">{u.login_count || 0}</td>
                    <td className="p-3 text-center text-sm text-gray-600 whitespace-nowrap">{formatDateTime(u.last_login_at)}</td>
                    <td className="p-3 text-center text-sm text-gray-600 whitespace-nowrap">{formatDateTime(u.created_at)}</td>
                    <td className="p-3 min-w-[160px]">
                      <input
                        type="text"
                        className="admin-user-note"
                        defaultValue={u.admin_note || ''}
                        placeholder="내부 메모"
                        onBlur={(e) => {
                          const next = e.target.value.trim();
                          if (next !== (u.admin_note || '')) {
                            patchUser(u.id, { admin_note: next });
                          }
                        }}
                      />
                    </td>
                    <td className="p-3 text-center">
                      <div className="admin-row-actions">
                        <button type="button" className="admin-icon-btn" onClick={() => copyEmails([u])}>복사</button>
                        <a className="admin-icon-btn" href={`mailto:${u.email}`}>메일</a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
