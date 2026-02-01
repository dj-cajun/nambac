import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import QuizPage from './pages/QuizPage';

function App() {
  return (
    <Router>
      <div className="app-layout" style={{ background: '#FFF0F5', minHeight: '100vh' }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          {/* 어떤 퀴즈 번호로 들어오든 처리하는 동적 라우팅 */}
          <Route path="/quiz/:id" element={<QuizPage />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}
export default App;
