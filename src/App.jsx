import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, useParams } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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
import Contact from './pages/Contact';
import CookiePolicy from './pages/CookiePolicy';
import EditorialPolicy from './pages/EditorialPolicy';
import CompatibilityPage from './pages/CompatibilityPage';
import InstallBanner from './components/InstallBanner';
import PushPrompt from './components/PushPrompt';
import BottomNav from './components/BottomNav';
import BrandsLanding from './pages/BrandsLanding';
import BrandReport from './pages/BrandReport';
import ExplorePage from './pages/ExplorePage';
import CategoryPage from './pages/CategoryPage';
import LeaderboardPage from './pages/LeaderboardPage';
import BlogIndex from './pages/BlogIndex';
import BlogPost from './pages/BlogPost';
import FortunePage from './pages/FortunePage';
import BalancePage from './pages/BalancePage';
import RoastCardPage from './pages/RoastCardPage';
import BrainPage from './pages/BrainPage';
import CookieConsentBanner from './components/CookieConsentBanner';
import { DrawerProvider } from './components/shell/DrawerContext';
import SidebarDrawer from './components/shell/SidebarDrawer';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <DrawerProvider>
          <AppContent />
        </DrawerProvider>
      </Router>
    </AuthProvider>
  );
}

function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname === '/admin' || location.pathname === '/editor';
  const isBrandsPage = location.pathname === '/brands' || location.pathname.startsWith('/brands/');
  const mainTabPaths = ['/', '/explore', '/leaderboard'];
  const showBottomNav = mainTabPaths.includes(location.pathname);
  const hideFooter = showBottomNav || isBrandsPage;
  const showSiteHeader = !isAdminPage && location.pathname !== '/brands';

  return (
    <div
      className={`app-layout ${isAdminPage ? 'wide-layout' : ''}${isBrandsPage ? ' brands-layout' : ''}${showBottomNav ? ' has-bottom-nav' : ''}`}
      style={{ position: 'relative', minHeight: '100vh' }}
    >
      <div className="blob-bg blob-1"></div>
      <div className="blob-bg blob-2"></div>
      <div className="blob-bg blob-3"></div>

      {!showSiteHeader ? null : (
        <>
          <SiteLogoBar />
          <SidebarDrawer />
        </>
      )}

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
        <Route path="/category/:categoryId" element={<CategoryPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/blog" element={<BlogIndex />} />
        <Route path="/blog/saigon-genz-mobile" element={<Navigate to="/blog/xu-huong-di-dong-gen-z-sai-gon" replace />} />
        <Route path="/blog/vietnam-quiz-history" element={<Navigate to="/blog/lich-su-quiz-truc-tuyen-viet-nam" replace />} />
        <Route path="/blog/ai-entertainment-content" element={<Navigate to="/blog/ung-dung-ai-sang-tao-noi-dung-giai-tri" replace />} />
        <Route path="/blog/mem-van-phong-sai-gon" element={<Navigate to="/blog/van-hoa-meme-va-ap-luc-cot-song-gen-z" replace />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/fortune" element={<FortunePage />} />
        <Route path="/fortune/tomorrow" element={<FortunePage dayOffset={1} />} />
        <Route path="/balance" element={<BalancePage />} />
        <Route path="/balance/:questionId" element={<BalancePage />} />
        <Route path="/roast-card" element={<RoastCardPage />} />
        <Route path="/brain" element={<BrainPage />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/editor" element={<QuizEditor />} />
        <Route path="/about" element={<About />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="/editorial-policy" element={<EditorialPolicy />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
      </Routes>
      {!hideFooter && <Footer />}
      {showBottomNav && <BottomNav />}
      <InstallBanner />
      <PushPrompt />
      <CookieConsentBanner />
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
