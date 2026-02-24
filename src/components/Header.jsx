import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Trophy, Flame, Cloud } from 'lucide-react';
import './Header.css';

const Header = () => {
    const navigate = useNavigate(); // Initialize useNavigate

    return (
        <header className="header">
            <div className="container header-content">
                <div className="header-left">
                    <a href="/" className="logo">
                        <img src="/images/logo.png" alt="NamBắc Logo" className="logo-img" />
                    </a>

                    <nav className="main-nav">
                        <a href="/quizzes" className="nav-link active">
                            <span className="nav-icon">📝</span> Quizzes
                        </a>
                        <a href="/leaderboard" className="nav-link">
                            <Trophy size={18} /> Leaderboard
                        </a>
                        <a href="/streaks" className="nav-link">
                            <Flame size={18} /> Streaks
                        </a>
                    </nav>
                </div>

                <div className="header-right">
                    <div className="search-bar">
                        <Search size={18} className="search-icon" />
                        <input type="text" placeholder="Find a vibe..." />
                    </div>

                    <button className="icon-btn">
                        <Bell size={20} />
                    </button>

                    <button className="profile-btn" onClick={() => navigate('/login')}>
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
