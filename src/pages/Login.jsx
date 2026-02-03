import React from 'react';
import { Star, Sparkles, Cloud } from 'lucide-react';
import './Login.css';

const Login = () => {
    const handleGoogleLogin = () => {
        alert('Google 로그인 기능은 로컬 테스트용으로 비활성화되었습니다.');
    };

    return (
        <div className="login-page">
            {/* Background Blobs */}
            <div className="login-bg-blob blob-1"></div>
            <div className="login-bg-blob blob-2"></div>

            <div className="login-card">
                <Sparkles className="sparkle-deco" style={{ top: '20px', left: '20px' }} size={24} />
                <Sparkles className="sparkle-deco" style={{ bottom: '20px', right: '20px', animationDirection: 'reverse' }} size={20} />

                <div className="login-icon-box">
                    <Cloud className="text-pink-500" size={40} fill="#FF4D8D" color="#FF4D8D" />
                </div>

                <h1 className="login-title">Join the Vibe!</h1>
                <p className="login-subtitle">
                    호치민 MZ세대의 필수 앱, Nambac.<br />
                    지금 바로 로그인하고 내 전생을 확인해보세요.
                </p>

                <button className="google-login-btn" onClick={handleGoogleLogin}>
                    <img
                        src="https://www.svgrepo.com/show/475656/google-color.svg"
                        alt="Google"
                        className="google-icon"
                    />
                    <span>Sign in with Google</span>
                    {/* <span className="btn-tag">FAST!</span> */}
                </button>

                <div className="login-footer">
                    By clicking, you agree to our <a href="#">Terms</a> & <a href="#">Privacy Policy</a>.
                </div>
            </div>
        </div>
    );
};

export default Login;
