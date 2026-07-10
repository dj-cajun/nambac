import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { SBTI_MBTI_QUESTIONS, computeMbtiType, MBTI_NICKNAMES } from '../../../shared/vbti/index.js';
import { SBTI_UI } from '../../../shared/vbti/ui-text.vi.js';
import './sbti.css';

export default function SbtiMbtiPage() {
  const [answers, setAnswers] = useState([]);
  const [index, setIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [result, setResult] = useState(null);

  const current = SBTI_MBTI_QUESTIONS[index];
  const progress = SBTI_MBTI_QUESTIONS.length
    ? Math.round((index / SBTI_MBTI_QUESTIONS.length) * 100)
    : 0;

  const onPick = (letter) => {
    const next = [...answers, letter];
    setAnswers(next);
    if (index + 1 >= SBTI_MBTI_QUESTIONS.length) {
      const type = computeMbtiType(next);
      setResult(type);
      try {
        localStorage.setItem('nambac:sbti:mbti', type);
      } catch {
        /* ignore */
      }
      return;
    }
    setIndex(index + 1);
  };

  if (!started) {
    return (
      <div className="sbti-page">
        <Helmet>
          <title>{SBTI_UI.mbtiTitle} | nambac</title>
        </Helmet>
        <Link to="/vbti" className="sbti-back">{SBTI_UI.backLabel}</Link>
        <header className="sbti-hero-block">
          <h1>{SBTI_UI.mbtiTitle}</h1>
          <p>{SBTI_UI.mbtiSub}</p>
        </header>
        <button type="button" className="sbti-btn-primary" onClick={() => setStarted(true)}>
          {SBTI_UI.mbtiStart}
        </button>
      </div>
    );
  }

  if (result) {
    return (
      <div className="sbti-page">
        <Link to="/vbti" className="sbti-back">{SBTI_UI.backLabel}</Link>
        <div className="sbti-card">
          <p>{SBTI_UI.mbtiYourType}</p>
          <h1 className="sbti-result-code">{result}</h1>
          <p className="sbti-result-name">{MBTI_NICKNAMES[result]}</p>
        </div>
        <nav className="sbti-nav-chips">
          <Link to="/vbti/x-mbti" className="sbti-chip">{SBTI_UI.tabCrossMbti}</Link>
          <button
            type="button"
            className="sbti-chip"
            onClick={() => {
              setStarted(false);
              setAnswers([]);
              setIndex(0);
              setResult(null);
            }}
          >
            {SBTI_UI.mbtiRetake}
          </button>
        </nav>
      </div>
    );
  }

  return (
    <div className="sbti-page">
      <Link to="/vbti" className="sbti-back">{SBTI_UI.backLabel}</Link>
      <div className="sbti-card">
        <div className="sbti-progress-meta">
          <span>{SBTI_UI.testProgress} {index + 1}{SBTI_UI.testOf}{SBTI_MBTI_QUESTIONS.length}</span>
          <span>{current.dim}</span>
        </div>
        <div className="sbti-progress-bar">
          <div className="sbti-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="sbti-mbti-options">
          <button type="button" className="sbti-option" onClick={() => onPick(current.a[1])}>
            A. {current.a[0]}
          </button>
          <button type="button" className="sbti-option" onClick={() => onPick(current.b[1])}>
            B. {current.b[0]}
          </button>
        </div>
      </div>
    </div>
  );
}
