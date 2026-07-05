import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, useParams } from 'react-router-dom';
import SiteLogoBar from './components/SiteLogoBar';
import Footer from './components/Footer';
import Home from './pages/Home';
import QuizPage from './pages/QuizPage';
import Admin from './pages/Admin';
import QuizEditor from './pages/QuizEditor';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import About from './pages/About';
import Result from './pages/Result';
import ShareRedirect from './pages/ShareRedirect';
import FAQ from './pages/FAQ';
import CompatibilityPage from './pages/CompatibilityPage';
import InstallBanner from './components/InstallBanner';
import PushPrompt from './components/PushPrompt';
import BottomNav from './components/BottomNav';
import BrandsLanding from './pages/BrandsLanding';
import BrandReport from './pages/BrandReport';
import ExplorePage from './pages/ExplorePage';
import LeaderboardPage from './pages/LeaderboardPage';

import './App.css';

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname === '/admin' || location.pathname === '/editor';
  const isBrandsPage = location.pathname === '/brands' || location.pathname.startsWith('/brands/');
  const mainTabPaths = ['/', '/explore', '/leaderboard'];
  const showBottomNav = mainTabPaths.includes(location.pathname);
  const hideFooter = showBottomNav || isBrandsPage;

  return (
    <div
      className={`app-layout ${isAdminPage ? 'wide-layout' : ''}${isBrandsPage ? ' brands-layout' : ''}`}
      style={{ position: 'relative', minHeight: '100vh' }}
    >
      <div className="blob-bg blob-1"></div>
      <div className="blob-bg blob-2"></div>
      <div className="blob-bg blob-3"></div>

      {!isAdminPage && location.pathname !== '/brands' && <SiteLogoBar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/quiz/:id" element={<QuizPage />} />
        <Route path="/quiz/:id/result" element={<Result />} />
        <Route path="/quiz/:id/analysis" element={<AnalysisRedirect />} />
        <Route path="/share/:id/:score" element={<ShareRedirect />} />
        <Route path="/share/:id" element={<ShareRedirect />} />
        <Route path="/share-view/:id/:score" element={<ShareRedirect />} />
        <Route path="/share-view/:id" element={<ShareRedirect />} />
        <Route path="/compatibility/:id/:friendScore/:myScore" element={<CompatibilityPage />} />
        <Route path="/brands" element={<BrandsLanding />} />
        <Route path="/brands/report/:quizId/:token" element={<BrandReport />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/editor" element={<QuizEditor />} />
        <Route path="/about" element={<About />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
      </Routes>
      {!hideFooter && <Footer />}
      {showBottomNav && <BottomNav />}
      <InstallBanner />
      <PushPrompt />
    </div>
  );
}

function AnalysisRedirect() {
  const { id: quizId } = useParams();
  const location = useLocation();
  const score = location.state?.score;

  if (quizId && score !== undefined && score !== null) {
    return <Navigate to={`/quiz/${quizId}/result?score=${score}`} replace />;
  }

  return <Navigate to="/" replace />;
}

export default App;
