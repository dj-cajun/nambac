import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { LQ_GLOSSARY } from '../../../shared/lienquan/glossary.js';
import { LQ_UI } from '../../../shared/lienquan/uiText.js';
import { buildLienquanOgImageUrl, buildLienquanShareUrl } from '../../lib/siteUrl';
import ShareLinkButton from './components/ShareLinkButton.jsx';
import './lienquan.css';

const SECTIONS = [
  { key: 'physical', label: 'Vật lý' },
  { key: 'magic', label: 'Phép thuật' },
  { key: 'defense', label: 'Giáp & thủ' },
  { key: 'boots_support', label: 'Giày & hỗ trợ' },
  { key: 'lanes', label: 'Đường' },
  { key: 'terms', label: 'Thuật ngữ' },
];

function flattenSection(section) {
  return Object.entries(section || {}).map(([vi, ko]) => ({ vi, ko }));
}

export default function TuDienPage() {
  const [query, setQuery] = useState('');
  const ogImage = buildLienquanOgImageUrl();
  const shareUrl = buildLienquanShareUrl({ page: 'tu-dien' });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SECTIONS.map((sec) => {
      const rows = flattenSection(LQ_GLOSSARY[sec.key]).filter((row) => {
        if (!q) return true;
        return row.vi.toLowerCase().includes(q) || String(row.ko).toLowerCase().includes(q);
      });
      return { ...sec, rows };
    }).filter((sec) => sec.rows.length > 0);
  }, [query]);

  return (
    <div className="lienquan-page">
      <Helmet>
        <title>{LQ_UI.glossaryTitle} | Liên Quân nambac</title>
        <meta name="description" content={LQ_UI.glossarySub} />
        <link rel="canonical" href="https://www.nambac.xyz/lienquan/tu-dien" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${LQ_UI.glossaryTitle} | nambac`} />
        <meta property="og:description" content={LQ_UI.glossarySub} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content={shareUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={ogImage} />
      </Helmet>

      <Link to="/lienquan" className="lq-back">← Liên Quân</Link>

      <header className="lq-hero-block">
        <h1>{LQ_UI.glossaryTitle}</h1>
        <p>{LQ_UI.glossarySub}</p>
      </header>

      <div className="lq-search">
        <label className="lq-search-label" htmlFor="lq-glossary-search">{LQ_UI.glossarySearch}</label>
        <input
          id="lq-glossary-search"
          type="search"
          className="lq-search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={LQ_UI.glossarySearch}
        />
      </div>

      {filtered.map((sec) => (
        <section key={sec.key} className="lq-glossary-section">
          <h2 className="lq-section-title">{sec.label}</h2>
          <ul className="lq-glossary-list">
            {sec.rows.map((row) => (
              <li key={`${sec.key}-${row.vi}`} className="lq-glossary-item">
                <span className="lq-glossary-vi">{row.vi}</span>
                <span className="lq-glossary-ko">{row.ko}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {filtered.length === 0 && (
        <p className="lq-coming">Không tìm thấy mục nào.</p>
      )}

      <div className="lq-nav-chips">
        <ShareLinkButton page="tu-dien" />
      </div>
    </div>
  );
}
