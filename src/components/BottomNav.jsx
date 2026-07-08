import { useNavigate, useLocation } from 'react-router-dom';
import { Home as HomeIcon, Compass, BarChart2 } from 'lucide-react';
import { scrollToTop } from '../lib/scrollToTop';

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isActive = (path) => (path === '/' ? pathname === '/' : pathname.startsWith(path));
  const labelClass = (path) =>
    `text-[12px] font-semibold leading-tight text-center px-0.5 ${
      isActive(path) ? 'text-[#FF2D85]' : 'text-gray-400'
    }`;

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] min-h-[80px] h-auto py-2 bg-white border-t-2 border-black flex items-center justify-around z-50 box-border">
      <div className={`nav-item-col ${isActive('/') && pathname === '/' ? 'active' : ''}`} onClick={() => { scrollToTop(); if (pathname !== '/') navigate('/'); }}>
        <HomeIcon size={24} strokeWidth={isActive('/') && pathname === '/' ? 2.5 : 2} color={isActive('/') && pathname === '/' ? '#FF2D85' : '#94A3B8'} />
        <span className={labelClass('/')}>Trang chủ</span>
      </div>
      <div className={`nav-item-col ${isActive('/explore') ? 'active' : ''}`} onClick={() => navigate('/explore')}>
        <Compass size={24} color={isActive('/explore') ? '#FF2D85' : '#94A3B8'} />
        <span className={labelClass('/explore')}>Khám phá</span>
      </div>
      <div className="w-12" />
      <div className={`nav-item-col ${isActive('/leaderboard') ? 'active' : ''}`} onClick={() => navigate('/leaderboard')}>
        <BarChart2 size={24} color={isActive('/leaderboard') ? '#FF2D85' : '#94A3B8'} />
        <span className={labelClass('/leaderboard')}>BXH</span>
      </div>
      <div className={`nav-item-col ${isActive('/brands') ? 'active' : ''}`} onClick={() => navigate('/brands')}>
        <span style={{ fontSize: '20px', lineHeight: 1 }}>🎯</span>
        <span className={labelClass('/brands')}>Thương hiệu</span>
      </div>
    </div>
  );
}
