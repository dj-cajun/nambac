import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, useParams } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import SiteLogoBar from './components/SiteLogoBar';
import Footer from './components/Footer';
import Home from './pages/Home';
import QuizPage from './pages/QuizPage';
import ExplorePage from './pages/ExplorePage';
import InstallBanner from './components/InstallBanner';
import PushPrompt from './components/PushPrompt';
import BottomNav from './components/BottomNav';
import CookieConsentBanner from './components/CookieConsentBanner';
import { DrawerProvider } from './components/shell/DrawerContext';
import SidebarDrawer from './components/shell/SidebarDrawer';

import './App.css';

const Result = lazy(() => import('./pages/Result'));
const ShareRedirect = lazy(() => import('./pages/ShareRedirect'));
const CompatibilityPage = lazy(() => import('./pages/CompatibilityPage'));
const Admin = lazy(() => import('./pages/Admin'));
const QuizEditor = lazy(() => import('./pages/QuizEditor'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const About = lazy(() => import('./pages/About'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Contact = lazy(() => import('./pages/Contact'));
const CookiePolicy = lazy(() => import('./pages/CookiePolicy'));
const EditorialPolicy = lazy(() => import('./pages/EditorialPolicy'));
const BrandsLanding = lazy(() => import('./pages/BrandsLanding'));
const BrandReport = lazy(() => import('./pages/BrandReport'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));
const BlogIndex = lazy(() => import('./pages/BlogIndex'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const FortunePage = lazy(() => import('./pages/FortunePage'));
const BalancePage = lazy(() => import('./pages/BalancePage'));
const RoastCardPage = lazy(() => import('./pages/RoastCardPage'));
const LienquanHub = lazy(() => import('./pages/lienquan/LienquanHub'));
const LienquanHeroDetail = lazy(() => import('./pages/lienquan/HeroDetailPage'));
const LienquanGiaoAn = lazy(() => import('./pages/lienquan/GiaoAnPage'));
const LienquanKhoe = lazy(() => import('./pages/lienquan/KhoePage'));
const LienquanQuiz = lazy(() => import('./pages/lienquan/LienquanQuizPage'));

function RouteFallback() {
  return <div className="route-fallback" aria-hidden="true" />;
}

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

      <Suspense fallback={<RouteFallback />}>
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
          <Route path="/lienquan" element={<LienquanHub />} />
          <Route path="/lienquan/tuong/:slug" element={<LienquanHeroDetail />} />
          <Route path="/lienquan/giao-an" element={<LienquanGiaoAn />} />
          <Route path="/lienquan/khoe" element={<LienquanKhoe />} />
          <Route path="/lienquan/quiz" element={<LienquanQuiz />} />
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
      </Suspense>
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
