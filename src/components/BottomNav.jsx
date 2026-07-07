import { useNavigate, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isActive = (path) => (path === '/' ? pathname === '/' : pathname.startsWith(path));

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] h-[80px] bg-white border-t-2 border-black flex items-center justify-around z-50">
      <div className={`nav-item-col ${isActive('/') && pathname === '/' ? 'active' : ''}`} onClick={() => navigate('/')}>
        <HomeIcon size={24} strokeWidth={isActive('/') && pathname === '/' ? 2.5 : 2} color={isActive('/') && pathname === '/' ? '#FF2D85' : '#94A3B8'} />
        <span className={`text-[10px] font-bold ${isActive('/') && pathname === '/' ? 'text-[#FF2D85]' : 'text-gray-400'}`}>Trang chủ</span>
      </div>
      <div className={`nav-item-col ${isActive('/explore') ? 'active' : ''}`} onClick={() => navigate('/explore')}>
        <Compass size={24} color={isActive('/explore') ? '#FF2D85' : '#94A3B8'} />
        <span className={`text-[10px] font-bold ${isActive('/explore') ? 'text-[#FF2D85]' : 'text-gray-400'}`}>Khám phá</span>
      </div>
      <div className="w-12" />
      <div className={`nav-item-col ${isActive('/leaderboard') ? 'active' : ''}`} onClick={() => navigate('/leaderboard')}>
        <BarChart2 size={24} color={isActive('/leaderboard') ? '#FF2D85' : '#94A3B8'} />
        <span className={`text-[10px] font-bold ${isActive('/leaderboard') ? 'text-[#FF2D85]' : 'text-gray-400'}`}>BXH</span>
      </div>
      <div className={`nav-item-col ${isActive('/brands') ? 'active' : ''}`} onClick={() => navigate('/brands')}>
        <span style={{ fontSize: '22px' }}>🎯</span>
        <span className={`text-[10px] font-bold ${isActive('/brands') ? 'text-[#FF2D85]' : 'text-gray-400'}`}>Thương hiệu</span>
      </div>
    </div>
  );
}
