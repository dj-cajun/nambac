import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { getType } from '../../../shared/sbti/scoring.js';
import { SBTI_UI } from '../../../shared/sbti/ui-text.vi.js';
import TypePoster from './components/TypePoster.jsx';
import './sbti.css';

export default function SbtiTypeDetailPage() {
  const { code } = useParams();
  const type = getType(decodeURIComponent(code || ''));

  if (!type) {
    return (
      <div className="sbti-page">
        <Link to="/sbti/types" className="sbti-back">{SBTI_UI.typeDetailBack}</Link>
        <p>Không tìm thấy type.</p>
      </div>
    );
  }

  return (
    <div className="sbti-page">
      <Helmet>
        <title>{type.code} — {type.name} | SBTI nambac</title>
        <meta name="description" content={type.intro} />
      </Helmet>

      <Link to="/sbti/types" className="sbti-back">{SBTI_UI.typeDetailBack}</Link>

      <div className="sbti-card">
        <TypePoster type={type} size="lg" />
        <h1 className="sbti-result-code">{type.code}</h1>
        <p className="sbti-result-name">{type.name}</p>
        <p className="sbti-result-intro">{type.intro}</p>
        <p>{type.desc}</p>
      </div>

      <nav className="sbti-nav-chips">
        <Link to="/sbti/test" className="sbti-chip">{SBTI_UI.hubCta}</Link>
        <Link to="/sbti/x-mbti" className="sbti-chip">{SBTI_UI.tabCrossMbti}</Link>
        <Link to={`/sbti/x-cung?type=${encodeURIComponent(type.code)}`} className="sbti-chip">
          {SBTI_UI.tabCrossZodiac}
        </Link>
      </nav>
    </div>
  );
}
