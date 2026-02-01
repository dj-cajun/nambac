import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  return (
    <nav className="navbar-container">
      <div className="navbar-pill">
        <div className="nav-left" onClick={() => navigate('/')}>
          <div className="nav-logo-circle">
            <span className="logo-cloud">☁️</span>
          </div>
          <span className="nav-brand-text">nambac.xyz</span>
        </div>

        <div className="nav-center">
          <div className="nav-links">
            <button className="nav-item active">📋 Quizzes</button>
            <button className="nav-item">📊 Leaderboard</button>
            <button className="nav-item">🔥 Streaks</button>
          </div>
          <div className="nav-search-bar">
            <Search size={16} className="search-icon" />
            <input type="text" placeholder="Find a vibe..." />
          </div>
        </div>

        <div className="nav-right">
          <button className="icon-btn bell-btn">
            <Bell size={20} fill="#FF477E" color="#FF477E" />
            <div className="notification-dot"></div>
          </button>
          <div className="nav-profile-circle">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Coco" alt="profile" />
          </div>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
