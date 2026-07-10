import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { getAllTypes } from '../../../shared/sbti/scoring.js';
import { SBTI_UI } from '../../../shared/sbti/ui-text.vi.js';
import TypePoster from './components/TypePoster.jsx';
import './sbti.css';

export default function SbtiTypesPage() {
  const types = getAllTypes();

  return (
    <div className="sbti-page">
      <Helmet>
        <title>{SBTI_UI.typesTitle} | nambac</title>
        <meta name="description" content="27 nhân cách SBTI — bộ sưu tập meme personality test tiếng Việt." />
      </Helmet>

      <Link to="/sbti" className="sbti-back">← SBTI</Link>
      <header className="sbti-hero-block">
        <h1>{SBTI_UI.typesTitle}</h1>
        <p>{SBTI_UI.typesSub}</p>
      </header>

      <div className="sbti-types-grid">
        {types.map((type) => (
          <Link
            key={type.code}
            to={`/sbti/types/${encodeURIComponent(type.code)}`}
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
