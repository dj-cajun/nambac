import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import QuizPage from './pages/QuizPage';
import Admin from './pages/Admin';
import AIServicePage from './pages/AIServicePage';
import './App.css'; // [FIX]: Added missing style import

import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

import AnalysisPage from './pages/AnalysisPage';
import Result from './pages/Result';

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname === '/admin';

  return (
    <div className={`app-layout ${isAdminPage ? 'wide-layout' : ''}`} style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Blurry Blobs Background */}
      <div className="blob-bg blob-1"></div>
      <div className="blob-bg blob-2"></div>
      <div className="blob-bg blob-3"></div>

      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        {/* 어떤 퀴즈 번호로 들어오든 처리하는 동적 라우팅 */}
        <Route path="/quiz/:id" element={<QuizPage />} />
        <Route path="/quiz/:id/analysis" element={<AnalysisPage />} />
        <Route path="/quiz/:id/result" element={<Result />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/service/:id" element={<AIServicePage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
      </Routes>
      <Footer />
    </div>
  );
}
export default App;
