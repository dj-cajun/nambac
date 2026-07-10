import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { SBTI_UI } from '../../../shared/sbti/ui-text.vi.js';
import { incrementFeatureStat, trackFeatureViewOnce } from '../../lib/featureStats';
import { trackFeatureView } from '../../lib/analytics';
import './sbti.css';

export default function SbtiHub() {
  useEffect(() => {
    if (trackFeatureViewOnce('sbti')) {
      trackFeatureView('sbti');
      incrementFeatureStat('sbti', 'view').catch(() => {});
    }
  }, []);

  return (
    <div className="sbti-page">
      <Helmet>
        <title>{SBTI_UI.hubTitle} | nambac</title>
        <meta
          name="description"
          content="Test SBTI tiếng Việt — 30 câu, 27 nhãn meme, nhánh ẩn DRUNK. Giải trí trên nambac.xyz."
        />
        <link rel="canonical" href="https://www.nambac.xyz/sbti" />
      </Helmet>

      <Link to="/" className="sbti-back">← nambac</Link>

      <header className="sbti-hero-block">
        <div className="sbti-logo-row">
          <img src="/sbti/logo.svg" alt="SBTI" width="40" height="40" />
          <div>
            <h1>{SBTI_UI.hubTitle}</h1>
            <p>{SBTI_UI.hubSub}</p>
          </div>
        </div>
      </header>

      <Link to="/sbti/test" className="sbti-btn-primary">{SBTI_UI.hubCta}</Link>

      <nav className="sbti-nav-chips" aria-label="SBTI menu">
        <Link to="/sbti/types" className="sbti-chip">{SBTI_UI.tabTypes}</Link>
        <Link to="/sbti/mbti" className="sbti-chip">{SBTI_UI.tabMbti}</Link>
        <Link to="/sbti/x-mbti" className="sbti-chip">{SBTI_UI.tabCrossMbti}</Link>
        <Link to="/sbti/x-cung" className="sbti-chip">{SBTI_UI.tabCrossZodiac}</Link>
      </nav>

      <section className="sbti-faq">
        {SBTI_UI.faq.map((item) => (
          <div key={item.q}>
            <h3>{item.q}</h3>
            <p>{item.a}</p>
          </div>
        ))}
      </section>

      <p className="sbti-disclaimer">{SBTI_UI.disclaimer}</p>
    </div>
  );
}
