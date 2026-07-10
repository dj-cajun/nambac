import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { ZODIAC_SIGNS, getCrossZodiac } from '../../../shared/sbti/cross-zodiac.js';
import { getType } from '../../../shared/sbti/scoring.js';
import { SBTI_UI } from '../../../shared/sbti/ui-text.vi.js';
import { loadSbtiResult } from '../../lib/sbti/session.js';
import './sbti.css';

export default function SbtiCrossZodiacPage() {
  const [params] = useSearchParams();
  const saved = loadSbtiResult();
  const initialCode = params.get('type') || saved?.result?.finalType?.code || 'CTRL';
  const sbtiCode = initialCode;
  const [zodiacId, setZodiacId] = useState(ZODIAC_SIGNS[0].id);

  const type = getType(sbtiCode);
  const cross = useMemo(() => getCrossZodiac(sbtiCode, zodiacId), [sbtiCode, zodiacId]);

  return (
    <div className="sbti-page">
      <Helmet>
        <title>{SBTI_UI.zodiacTitle} | nambac</title>
        <meta name="description" content="SBTI × cung hoàng đạo — 324 buff meme." />
      </Helmet>

      <Link to="/sbti" className="sbti-back">← SBTI</Link>
      <header className="sbti-hero-block">
        <h1>{SBTI_UI.zodiacTitle}</h1>
        <p>{SBTI_UI.zodiacSub}</p>
      </header>

      {type && (
        <p className="sbti-result-intro">
          Type: <strong>{type.code}</strong> — {type.name}
        </p>
      )}

      <p className="sbti-result-intro">{SBTI_UI.zodiacPick}</p>
      <div className="sbti-cross-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {ZODIAC_SIGNS.map((sign) => (
          <button
            key={sign.id}
            type="button"
            className={`sbti-cross-pick${zodiacId === sign.id ? ' is-active' : ''}`}
            onClick={() => setZodiacId(sign.id)}
          >
            {sign.emoji} {sign.name}
          </button>
        ))}
      </div>

      {cross && (
        <div className="sbti-card">
          <h2 style={{ margin: '0 0 8px', fontSize: '1.2rem' }}>{cross.title}</h2>
          <p className="sbti-result-name">{cross.buff}</p>
          <p>{cross.desc}</p>
        </div>
      )}

      <nav className="sbti-nav-chips">
        <Link to="/sbti/types" className="sbti-chip">{SBTI_UI.tabTypes}</Link>
        <Link to="/sbti/test" className="sbti-chip">{SBTI_UI.hubCta}</Link>
      </nav>
    </div>
  );
}
