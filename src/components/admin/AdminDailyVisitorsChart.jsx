import { useMemo, useState } from 'react';

function formatDayLabel(dateStr) {
  if (!dateStr || dateStr.length < 10) return dateStr || '';
  return `${dateStr.slice(5, 7)}/${dateStr.slice(8, 10)}`;
}

/**
 * Daily unique-visitor bar chart for admin analytics (no chart library).
 * @param {{ series?: Array<{ date: string, total: number, loggedIn: number, guest: number }> }} props
 */
export default function AdminDailyVisitorsChart({ series = [] }) {
  const [range, setRange] = useState(14);
  const [hover, setHover] = useState(null);

  const points = useMemo(() => {
    const list = Array.isArray(series) ? series : [];
    if (list.length <= range) return list;
    return list.slice(-range);
  }, [series, range]);

  const maxTotal = useMemo(
    () => Math.max(1, ...points.map((p) => Number(p.total) || 0)),
    [points],
  );

  const rangeTotal = useMemo(
    () => points.reduce((sum, p) => sum + (Number(p.total) || 0), 0),
    [points],
  );

  const today = points[points.length - 1] || null;
  const chartH = 160;
  const padX = 8;
  const barGap = points.length > 20 ? 2 : 4;
  const innerW = 640;
  const barW = Math.max(4, (innerW - padX * 2) / Math.max(points.length, 1) - barGap);

  return (
    <div className="admin-daily-chart">
      <div className="admin-daily-chart-head">
        <div>
          <h3 className="admin-daily-chart-title">일별 조회자</h3>
          <p className="admin-daily-chart-sub">
            고유 방문자(ICT) · 기간 합계 {rangeTotal.toLocaleString()}명
            {today ? ` · 오늘 ${Number(today.total || 0).toLocaleString()}명` : ''}
          </p>
        </div>
        <div className="admin-daily-chart-ranges">
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              type="button"
              className={`admin-filter-chip ${range === d ? 'active' : ''}`}
              onClick={() => setRange(d)}
            >
              {d}일
            </button>
          ))}
        </div>
      </div>

      {points.length === 0 ? (
        <p className="admin-daily-chart-empty">아직 일별 조회 데이터가 없습니다.</p>
      ) : (
        <>
          <div className="admin-daily-chart-legend">
            <span><i className="swatch guest" />비로그인</span>
            <span><i className="swatch login" />로그인</span>
          </div>

          <div className="admin-daily-chart-svg-wrap">
            <svg
              viewBox={`0 0 ${innerW} ${chartH + 36}`}
              className="admin-daily-chart-svg"
              role="img"
              aria-label="일별 조회자 그래프"
            >
              {[0.25, 0.5, 0.75, 1].map((t) => {
                const y = chartH - t * chartH + 4;
                return (
                  <g key={t}>
                    <line x1={padX} x2={innerW - padX} y1={y} y2={y} className="grid" />
                    <text x={padX} y={y - 2} className="axis">{Math.round(maxTotal * t)}</text>
                  </g>
                );
              })}

              {points.map((p, i) => {
                const total = Number(p.total) || 0;
                const loggedIn = Number(p.loggedIn) || 0;
                const guest = Number(p.guest) || 0;
                const x = padX + i * (barW + barGap);
                const hTotal = (total / maxTotal) * chartH;
                const hLogin = (loggedIn / maxTotal) * chartH;
                const hGuest = (guest / maxTotal) * chartH;
                const yGuest = chartH + 4 - hGuest;
                const yLogin = yGuest - hLogin;
                const active = hover === i;

                return (
                  <g
                    key={p.date}
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    {active && (
                      <rect
                        x={x - 1}
                        y={4}
                        width={barW + 2}
                        height={chartH}
                        className="bar-hover-bg"
                      />
                    )}
                    <rect
                      x={x}
                      y={yGuest}
                      width={barW}
                      height={Math.max(0, hGuest)}
                      rx={2}
                      className="bar-guest"
                    />
                    <rect
                      x={x}
                      y={yLogin}
                      width={barW}
                      height={Math.max(0, hLogin)}
                      rx={2}
                      className="bar-login"
                    />
                    {(i === 0 || i === points.length - 1 || i % Math.ceil(points.length / 6) === 0) && (
                      <text
                        x={x + barW / 2}
                        y={chartH + 22}
                        textAnchor="middle"
                        className="tick"
                      >
                        {formatDayLabel(p.date)}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {hover != null && points[hover] && (
              <div className="admin-daily-chart-tooltip">
                <strong>{points[hover].date}</strong>
                <span>전체 {Number(points[hover].total || 0).toLocaleString()}</span>
                <span>로그인 {Number(points[hover].loggedIn || 0).toLocaleString()}</span>
                <span>비로그인 {Number(points[hover].guest || 0).toLocaleString()}</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
