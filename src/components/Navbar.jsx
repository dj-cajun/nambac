import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="navbar-container">
        <div className="navbar-pill">
          {/* LEFT: Logo */}
          <div className="nav-left" onClick={() => navigate('/')}>
            {/* Simple Icon placeholder */}
            <div className="w-6 h-6 bg-[#FF2D85] rounded-md flex items-center justify-center mr-2">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
            <span className="nav-brand-text">nambac<span className="nav-brand-suffix">.xyz</span></span>
          </div>

          {/* CENTER: Links */}
          <div className="nav-center">
            <button className={`nav-item ${isActive('/') ? 'active' : ''}`} onClick={() => navigate('/')}>Home</button>
            <button className="nav-item" onClick={() => navigate('/')}>Quizzes</button>
            <button className="nav-item" onClick={() => alert('About Page Coming Soon!')}>About</button>
          </div>

          {/* RIGHT: Actions - Empty or minimal */}
          <div className="nav-right">
            {/* removed search, bell, and profile */}
          </div>
        </div>
      </nav>
    </>
  );
};
export default Navbar;
