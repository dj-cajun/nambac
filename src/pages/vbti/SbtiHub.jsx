import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { SBTI_UI } from '../../../shared/vbti/ui-text.vi.js';
import { incrementFeatureStat, trackFeatureViewOnce } from '../../lib/featureStats';
import { trackFeatureView } from '../../lib/analytics';
import { buildVbtiOgImageUrl, buildVbtiShareUrl } from '../../lib/siteUrl';
import VbtiShareButton from './components/VbtiShareButton.jsx';
import './sbti.css';

const CATEGORY_BOXES = [
  { to: '/vbti/types', icon: '🗂️', labelKey: 'tabTypes' },
  { to: '/vbti/mbti', icon: '🧩', labelKey: 'tabMbti' },
  { to: '/vbti/x-mbti', icon: '🔗', labelKey: 'tabCrossMbti' },
  { to: '/vbti/x-cung', icon: '✨', labelKey: 'tabCrossZodiac' },
];

export default function SbtiHub() {
  const [heroImgFailed, setHeroImgFailed] = useState(false);

  useEffect(() => {
    if (trackFeatureViewOnce('sbti')) {
      trackFeatureView('sbti');
      incrementFeatureStat('sbti', 'view').catch(() => {});
    }
  }, []);

  const metaDescription =
    'VBTI — Vietnam Behavior Type Indicator. Test tiếng Việt: 30 câu, 27 nhãn meme, nhánh ẩn DRUNK. Giải trí trên nambac.xyz.';
  const ogImage = buildVbtiOgImageUrl({
    title: SBTI_UI.brand,
    subtitle: '27 nhãn meme · test tiếng Việt',
  });
  const shareUrl = buildVbtiShareUrl();

  return (
    <div className="sbti-page">
      <Helmet>
        <title>{SBTI_UI.brandFull} | nambac</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href="https://www.nambac.xyz/vbti" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${SBTI_UI.brand} — ${SBTI_UI.brandFull} | nambac`} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content={shareUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={ogImage} />
      </Helmet>

      <Link to="/" className="sbti-back">← nambac</Link>

      <div className="sbti-hero-card">
        {!heroImgFailed ? (
          <img
            src="/images/sbti_hub.webp"
            alt={SBTI_UI.brand}
            className="sbti-hero-card-img"
            loading="eager"
            onError={() => setHeroImgFailed(true)}
          />
        ) : (
          <div className="sbti-hero-card-img sbti-hero-card-img--fallback" aria-hidden>
            <img src="/vbti/logo.svg" alt="" width="48" height="48" />
          </div>
        )}
        <div className="sbti-hero-card-body">
          <p className="sbti-hero-kicker">{SBTI_UI.brandFull}</p>
          <h1 className="sbti-hero-title">{SBTI_UI.hubTitle}</h1>
          <p className="sbti-hero-sub">{SBTI_UI.hubSub}</p>
          <Link to="/vbti/test" className="sbti-btn-primary">{SBTI_UI.hubCta}</Link>
          <VbtiShareButton />
        </div>
      </div>

      <div className="sbti-box-grid" aria-label={`${SBTI_UI.brand} menu`}>
        {CATEGORY_BOXES.map((box) => (
          <Link key={box.to} to={box.to} className="sbti-box">
            <span className="sbti-box-icon" aria-hidden>{box.icon}</span>
            <span className="sbti-box-label">{SBTI_UI[box.labelKey]}</span>
          </Link>
        ))}
      </div>

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
