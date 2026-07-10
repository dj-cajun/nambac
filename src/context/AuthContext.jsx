import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchCurrentUser, googleLoginUrl, loginAdmin, logoutUser } from '../lib/authApi';
import { markOwnerDevice } from '../lib/siteVisit';

const AuthContext = createContext(null);

const AUTH_ERROR_MESSAGES = {
  login_failed: 'Đăng nhập Google thất bại. Vui lòng thử lại.',
  oauth_not_configured: 'Đăng nhập Google chưa được cấu hình trên server.',
  missing_code: 'Phiên đăng nhập hết hạn. Bấm Đăng nhập và thử lại.',
  email_required: 'Cần quyền truy cập email Google để đăng nhập.',
  redirect_uri_mismatch: 'Lỗi cấu hình OAuth (redirect URI). Liên hệ admin.',
  access_denied: 'Bạn đã hủy đăng nhập Google.',
};

function readAuthErrorFromUrl() {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const code = params.get('auth_error');
  if (!code) return null;

  params.delete('auth_error');
  const nextSearch = params.toString();
  const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}${window.location.hash}`;
  window.history.replaceState({}, '', nextUrl);

  return AUTH_ERROR_MESSAGES[code] || `Đăng nhập thất bại (${code}).`;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(() => readAuthErrorFromUrl());

  const refreshUser = useCallback(async () => {
    try {
      const current = await fetchCurrentUser();
      setUser(current);
      return current;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const current = await fetchCurrentUser();
        if (active) setUser(current);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const loginWithGoogle = useCallback((returnTo = '/') => {
    setAuthError(null);
    window.location.href = googleLoginUrl(returnTo);
  }, []);

  const clearAuthError = useCallback(() => setAuthError(null), []);

  const loginWithAdminPassword = useCallback(async (username, password) => {
    const adminUser = await loginAdmin(username, password);
    setUser(adminUser);
    // Register this browser (phone/laptop) so future visits never count
    markOwnerDevice().catch(() => {});
    return adminUser;
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    authError,
    isLoggedIn: Boolean(user),
    isAdmin: user?.role === 'admin',
    isPasswordAdmin: user?.auth_kind === 'admin_password',
    loginWithGoogle,
    loginWithAdminPassword,
    logout,
    refreshUser,
    clearAuthError,
  }), [user, loading, authError, loginWithGoogle, loginWithAdminPassword, logout, refreshUser, clearAuthError]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
