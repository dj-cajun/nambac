import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { getAllTypes } from '../../../shared/vbti/scoring.js';
import { SBTI_UI } from '../../../shared/vbti/ui-text.vi.js';
import { buildVbtiOgImageUrl, buildVbtiShareUrl } from '../../lib/siteUrl';
import TypePoster from './components/TypePoster.jsx';
import './sbti.css';

export default function SbtiTypesPage() {
  const types = getAllTypes();

  return (
    <div className="sbti-page">
      <Helmet>
        <title>{SBTI_UI.typesTitle} | nambac</title>
        <meta name="description" content="27 nhân cách VBTI — Vietnam Behavior Type Indicator, bộ sưu tập meme personality test tiếng Việt." />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${SBTI_UI.typesTitle} | VBTI`} />
        <meta property="og:description" content="27 nhãn meme VBTI — chạm xem chi tiết từng type." />
        <meta property="og:image" content={buildVbtiOgImageUrl({ title: '27 type VBTI', subtitle: 'Bộ sưu tập nhãn meme' })} />
        <meta property="og:url" content={buildVbtiShareUrl({ page: 'types' })} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <Link to="/vbti" className="sbti-back">{SBTI_UI.backLabel}</Link>
      <header className="sbti-hero-block">
        <h1>{SBTI_UI.typesTitle}</h1>
        <p>{SBTI_UI.typesSub}</p>
      </header>

      <div className="sbti-types-grid">
        {types.map((type) => (
          <Link
            key={type.code}
            to={`/vbti/types/${encodeURIComponent(type.code)}`}
            className="sbti-type-card"
          >
            <TypePoster type={type} />
            <div className="sbti-type-card-body">
              <h3>{type.code}</h3>
              <p>{type.name}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
