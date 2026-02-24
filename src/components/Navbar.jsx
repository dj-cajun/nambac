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
            <img src="/images/logo.png" alt="NamBắc Logo" className="nav-logo-img" onClick={() => navigate('/')} />
          </div>

          {/* CENTER: Links Removed */}
          <div className="nav-center">
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
