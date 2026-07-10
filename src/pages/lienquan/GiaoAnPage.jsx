import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { MATCHES, getGiaoAnsForMatch } from '../../../shared/lienquan/giaoAns.js';
import GiaoAnCard from './components/GiaoAnCard.jsx';
import './lienquan.css';

export default function GiaoAnPage() {
  return (
    <div className="lienquan-page">
      <Helmet>
        <title>Giáo Án Pro — Sao chép build | Liên Quân nambac</title>
        <meta
          name="description"
          content="Sao chép giáo án item + arcana từ meta mẫu SGP, 1S, FL. Một chạm dán vào game."
        />
      </Helmet>

      <Link to="/lienquan" className="lq-back">← Liên Quân</Link>

      <header className="lq-hero-block">
        <h1>Giáo Án Pro</h1>
        <p>Sao chép 1 chạm — item, arcana, spell</p>
      </header>

      {MATCHES.map((match) => {
        const builds = getGiaoAnsForMatch(match.id);
        return (
          <section key={match.id} className="lq-match">
            <h2>{match.title}</h2>
            <span className="lq-match-date">{match.date} · {match.note}</span>
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
