import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, Search, X } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleSocialLogin = (provider) => {
    alert(`${provider} login coming soon!`);
    setShowLoginModal(false);
  };

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

          {/* RIGHT: Actions */}
          <div className="nav-right">
            {/* Search */}
            <div className="search-container">
              <Search size={14} color="#BBB" />
              <input type="text" placeholder="Find a vibe..." />
            </div>

            <button className="icon-btn" onClick={() => alert('Notifications')}>
              <Bell size={20} />
            </button>

            <button className="btn-profile" onClick={() => setShowLoginModal(true)}>
              Profile
            </button>


          </div>
        </div>
      </nav>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-6 relative">
            {/* Close Button */}
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <span className="text-4xl">☁️</span>
              <h2 className="text-2xl font-black text-gray-800 mt-2">Welcome to Nambac</h2>
              <p className="text-gray-500 text-sm mt-1">Sign in to save your progress</p>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-3">
              {/* Google */}
              <button
                onClick={() => handleSocialLogin('Google')}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>

              {/* Instagram */}
              <button
                onClick={() => handleSocialLogin('Instagram')}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 rounded-xl font-bold text-white hover:opacity-90 transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                Continue with Instagram
              </button>

              {/* TikTok */}
              <button
                onClick={() => handleSocialLogin('TikTok')}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-black rounded-xl font-bold text-white hover:bg-gray-800 transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
                Continue with TikTok
              </button>

              {/* Zalo */}
              <button
                onClick={() => handleSocialLogin('Zalo')}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#0068FF] rounded-xl font-bold text-white hover:bg-[#0055CC] transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 14.91c-.136.41-.545.732-.971.764-.112.009-.225.009-.338 0-1.149-.084-2.181-.513-3.095-1.175a.454.454 0 0 0-.562.039l-1.175 1.175c-.122.122-.32.122-.442 0l-3.03-3.03c-.122-.122-.122-.32 0-.442l1.175-1.175a.454.454 0 0 0 .039-.562c-.662-.914-1.091-1.946-1.175-3.095-.009-.113-.009-.226 0-.338.032-.426.354-.835.764-.971.176-.058.363-.074.546-.046.556.084 1.054.363 1.422.793.153.178.28.378.378.593l.498 1.096c.102.225.032.487-.164.621l-.69.472c-.112.077-.161.219-.12.348.247.779.703 1.479 1.31 2.025.023.02.048.038.073.055.546.413 1.196.699 1.902.808.129.02.26-.031.331-.135l.472-.69c.134-.196.396-.266.621-.164l1.096.498c.215.098.415.225.593.378.43.368.709.866.793 1.422.028.183.012.37-.046.546z" />
                </svg>
                Continue with Zalo
              </button>
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-gray-400 mt-6">
              By continuing, you agree to our Terms & Privacy Policy
            </p>
          </div>
        </div>
      )}
    </>
  );
};
export default Navbar;
