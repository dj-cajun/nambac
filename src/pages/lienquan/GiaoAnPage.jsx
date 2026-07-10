import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { MATCHES, getGiaoAnsForMatch } from '../../../shared/lienquan/giaoAns.js';
import { LQ_UI } from '../../../shared/lienquan/uiText.js';
import GiaoAnCard from './components/GiaoAnCard.jsx';
import ShareLinkButton from './components/ShareLinkButton.jsx';
import { buildLienquanOgImageUrl, buildLienquanShareUrl } from '../../lib/siteUrl';
import './lienquan.css';

export default function GiaoAnPage() {
  const ogImage = buildLienquanOgImageUrl({
    title: LQ_UI.tabGiaoAn,
    subtitle: 'Sao chép build pro · meta AOG',
  });
  const shareUrl = buildLienquanShareUrl({ page: 'giao-an' });
  const metaDescription =
    'Sao chép giáo án item + arcana từ meta mẫu SGP, 1S. Một chạm dán vào game.';
  return (
    <div className="lienquan-page">
      <Helmet>
        <title>{LQ_UI.tabGiaoAn} — Sao chép build | Liên Quân nambac</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href="https://www.nambac.xyz/lienquan/giao-an" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${LQ_UI.tabGiaoAn} | Liên Quân nambac`} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content={shareUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={ogImage} />
      </Helmet>

      <Link to="/lienquan" className="lq-back">← Liên Quân</Link>

      <header className="lq-hero-block">
        <h1>{LQ_UI.tabGiaoAn}</h1>
        <p>{LQ_UI.copyButton} — item, ngọc, rune</p>
      </header>

      {MATCHES.map((match) => {
        const builds = getGiaoAnsForMatch(match.id);
        return (
          <section key={match.id} id={`match-${match.id}`} className="lq-match">
            <h2>
              {LQ_UI.matchLabel} {match.title}
            </h2>
            <span className="lq-match-date">
              {match.date} · {match.note}
            </span>
            {builds.map((ga) => (
              <GiaoAnCard key={ga.id} giaoAn={ga} />
            ))}
          </section>
        );
      })}

      <p className="lq-disclaimer">
        Giáo án mang tính tham khảo. Meta thay đổi theo patch — kiểm tra lại trước khi leo rank.
      </p>

      <div className="lq-nav-chips">
        <ShareLinkButton page="giao-an" className="lq-chip lq-chip-btn" />
      </div>
    </div>
  );
}
