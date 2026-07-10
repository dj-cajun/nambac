import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { SBTI_UI } from '../../../shared/vbti/ui-text.vi.js';
import { loadSbtiResult } from '../../lib/vbti/session.js';
import { typePosterSrc } from '../../lib/vbti/assets.js';
import { buildVbtiShareUrl } from '../../lib/siteUrl';
import TypePoster from './components/TypePoster.jsx';
import ShareCard from './components/ShareCard.jsx';
import './sbti.css';

export default function SbtiResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [toast, setToast] = useState('');
  const result = location.state?.result || loadSbtiResult()?.result;

  useEffect(() => {
    if (!result) navigate('/vbti/test', { replace: true });
  }, [result, navigate]);

  if (!result?.finalType) return null;

  const type = result.finalType;
  const ogImage = `https://www.nambac.xyz${typePosterSrc(type.code)}`;
  const shareUrl = buildVbtiShareUrl({ page: 'result', typeCode: type.code });

  return (
    <div className="sbti-page">
      <Helmet>
        <title>{type.code} — {type.name} | VBTI nambac</title>
        <meta name="description" content={`${type.code}: ${type.intro}`} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`Kết quả VBTI: ${type.code} — ${type.name}`} />
        <meta property="og:description" content={type.intro} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:url" content={shareUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={ogImage} />
      </Helmet>

      <Link to="/vbti" className="sbti-back">{SBTI_UI.backLabel}</Link>

      <div className="sbti-card">
        <p className="sbti-result-intro">{result.modeKicker}</p>
        <TypePoster type={type} size="lg" />
        <h1 className="sbti-result-code">{type.code}</h1>
        <p className="sbti-result-name">{type.name}</p>
        <p className="sbti-result-intro">{type.intro}</p>
        <p className="sbti-result-intro">{result.badge}</p>
        <p>{type.desc}</p>
        {result.secondaryType && (
          <p className="sbti-result-intro">
            Gần nhất chuẩn: {result.secondaryType.code} ({result.secondaryType.similarity}%)
          </p>
        )}
      </div>

      <ShareCard
        result={result}
        onCopied={() => {
          setToast(SBTI_UI.copyToast);
          window.setTimeout(() => setToast(''), 2000);
        }}
      />
      {toast && <p className="sbti-toast">{toast}</p>}

      <nav className="sbti-nav-chips">
        <Link to="/vbti/test" className="sbti-chip">{SBTI_UI.resultRetake}</Link>
        <Link to="/vbti/types" className="sbti-chip">{SBTI_UI.resultTypes}</Link>
        <Link to="/vbti/x-mbti" className="sbti-chip">{SBTI_UI.resultCross}</Link>
      </nav>
    </div>
  );
}
