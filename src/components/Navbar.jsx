import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="navbar-container">
      <div className="navbar-pill">
        <div className="nav-left" onClick={() => navigate('/')}>
          <img src="/images/logo.png" alt="NamBắc Logo" className="nav-logo-img" />
        </div>

        <div className="nav-center" />

        <div className="nav-right">
          <button
            className="nav-b2b-btn"
            onClick={() => navigate('/brands')}
            style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FF2D85 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: '900',
              cursor: 'pointer',
              boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>Hợp tác 🎯</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
