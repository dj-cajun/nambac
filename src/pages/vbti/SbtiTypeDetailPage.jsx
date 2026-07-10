import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { getType } from '../../../shared/vbti/scoring.js';
import { SBTI_UI } from '../../../shared/vbti/ui-text.vi.js';
import { typePosterSrc } from '../../lib/vbti/assets.js';
import { buildVbtiShareUrl } from '../../lib/siteUrl';
import TypePoster from './components/TypePoster.jsx';
import VbtiShareButton from './components/VbtiShareButton.jsx';
import './sbti.css';

export default function SbtiTypeDetailPage() {
  const { code } = useParams();
  const type = getType(decodeURIComponent(code || ''));

  if (!type) {
    return (
      <div className="sbti-page">
        <Link to="/vbti/types" className="sbti-back">{SBTI_UI.typeDetailBack}</Link>
        <p>Không tìm thấy type.</p>
      </div>
    );
  }

  const shareUrl = buildVbtiShareUrl({ typeCode: type.code });
  const ogImage = `https://www.nambac.xyz${typePosterSrc(type.code)}`;

  return (
    <div className="sbti-page">
      <Helmet>
        <title>{type.code} — {type.name} | VBTI nambac</title>
        <meta name="description" content={type.intro} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${type.code} — ${type.name} | VBTI`} />
        <meta property="og:description" content={type.intro} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:url" content={shareUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={ogImage} />
      </Helmet>

        <Link to="/vbti/types" className="sbti-back">{SBTI_UI.typeDetailBack}</Link>

      <div className="sbti-card">
        <TypePoster type={type} size="lg" />
        <h1 className="sbti-result-code">{type.code}</h1>
        <p className="sbti-result-name">{type.name}</p>
        <p className="sbti-result-intro">{type.intro}</p>
        <p>{type.desc}</p>
        <VbtiShareButton typeCode={type.code} />
      </div>

      <nav className="sbti-nav-chips">
        <Link to="/vbti/test" className="sbti-chip">{SBTI_UI.hubCta}</Link>
        <Link to="/vbti/x-mbti" className="sbti-chip">{SBTI_UI.tabCrossMbti}</Link>
        <Link to={`/vbti/x-cung?type=${encodeURIComponent(type.code)}`} className="sbti-chip">
          {SBTI_UI.tabCrossZodiac}
        </Link>
      </nav>
    </div>
  );
}
