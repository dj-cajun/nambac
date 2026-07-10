import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { MATCHES, getGiaoAnsForMatch } from '../../../shared/lienquan/giaoAns.js';
import { LQ_UI } from '../../../shared/lienquan/uiText.js';
import GiaoAnCard from './components/GiaoAnCard.jsx';
import './lienquan.css';

export default function GiaoAnPage() {
  return (
    <div className="lienquan-page">
      <Helmet>
        <title>{LQ_UI.tabGiaoAn} — Sao chép build | Liên Quân nambac</title>
        <meta
          name="description"
          content="Sao chép giáo án item + arcana từ meta mẫu SGP, 1S. Một chạm dán vào game."
        />
      </Helmet>

      <Link to="/lienquan" className="lq-back">← Liên Quân</Link>

      <header className="lq-hero-block">
        <h1>{LQ_UI.tabGiaoAn}</h1>
        <p>{LQ_UI.copyButton} — item, ngọc, rune</p>
      </header>

      {MATCHES.map((match) => {
        const builds = getGiaoAnsForMatch(match.id);
        return (
          <section key={match.id} className="lq-match">
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
    </div>
  );
}
