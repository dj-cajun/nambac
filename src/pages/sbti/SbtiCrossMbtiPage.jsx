import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { getCrossMbti, MBTI_NICKNAMES } from '../../../shared/sbti/cross-mbti.js';
import { SBTI_UI } from '../../../shared/sbti/ui-text.vi.js';
import { loadSbtiResult } from '../../lib/sbti/session.js';
import './sbti.css';

const MBTI_TYPES = Object.keys(MBTI_NICKNAMES);

function loadMbtiPick() {
  try {
    return localStorage.getItem('nambac:sbti:mbti') || '';
  } catch {
    return '';
  }
}

export default function SbtiCrossMbtiPage() {
  const saved = loadSbtiResult();
  const sbtiCode = saved?.result?.finalType?.code;
  const [mbti, setMbti] = useState(loadMbtiPick());

  const cross = useMemo(
    () => (sbtiCode && mbti ? getCrossMbti(sbtiCode, mbti) : null),
    [sbtiCode, mbti],
  );

  return (
    <div className="sbti-page">
      <Helmet>
        <title>{SBTI_UI.crossTitle} | nambac</title>
        <meta name="description" content="Ghép SBTI × MBTI — 432 tổ hợp meme personality." />
      </Helmet>

      <Link to="/sbti" className="sbti-back">← SBTI</Link>
      <header className="sbti-hero-block">
        <h1>{SBTI_UI.crossTitle}</h1>
        <p>{SBTI_UI.crossSub}</p>
      </header>

      {!sbtiCode && (
        <p className="sbti-disclaimer">
          {SBTI_UI.crossNeedResult}{' '}
          <Link to="/sbti/test">{SBTI_UI.hubCta}</Link>
        </p>
      )}

      {sbtiCode && (
        <p className="sbti-result-intro">
          SBTI của bạn: <strong>{sbtiCode}</strong>
        </p>
      )}

      <p className="sbti-result-intro">{SBTI_UI.crossPickMbti}</p>
      <div className="sbti-cross-grid">
        {MBTI_TYPES.map((t) => (
          <button
            key={t}
            type="button"
            className={`sbti-cross-pick${mbti === t ? ' is-active' : ''}`}
            onClick={() => {
              setMbti(t);
              try {
                localStorage.setItem('nambac:sbti:mbti', t);
              } catch {
                /* ignore */
              }
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {cross && (
        <div className="sbti-card">
          <h2 className="sbti-result-code" style={{ fontSize: '1.6rem' }}>{cross.title}</h2>
          <p className="sbti-result-name">{cross.nickname}</p>
          <p>{cross.desc}</p>
          <p className="sbti-result-intro">Độ hợp: {cross.compatibility}/5</p>
        </div>
      )}

      {!mbti && (
        <Link to="/sbti/mbti" className="sbti-chip" style={{ marginTop: 12 }}>
          {SBTI_UI.mbtiStart}
        </Link>
      )}
    </div>
  );
}
