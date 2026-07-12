import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './Home.css';
import { scrollToTop } from '../lib/scrollToTop';
import { fetchFortuneStats } from '../lib/fortuneApi';
import { fetchAllFeatureStats } from '../lib/featureStats';
import { fetchQuizzes, incrementQuizStat } from '../lib/quizApi';
import { getViralScore, trackQuizViewOnce } from '../lib/quizRanking';
import { buildFeatureFeedItems, buildHomeFeed, pickHeroSlides } from '../lib/homeFeed';
import { pickDailyBalanceQuestion } from '../../shared/dailyPicks.js';
import { incrementFeatureStat, trackFeatureViewOnce } from '../lib/featureStats';
import { getFortuneBrand } from '../../shared/fortuneMeta.js';
import AdSenseUnit from '../components/AdSenseUnit';
import HeroCarousel from '../components/HeroCarousel';
import QuizCardThumb from '../components/QuizCardThumb';
import QuizCardTitle from '../components/QuizCardTitle';
import QuizCardStats from '../components/QuizCardStats';
import QuizImage from '../components/QuizImage';
import { useHomeFeatureThumbs } from '../hooks/useHomeFeatureThumbs';
import { AD_SLOTS } from '../lib/adsConfig';

const SORT_OPTIONS = [
  { id: 'trending', emoji: '🔥', label: 'Hot', sortFn: (a, b) => (b.view_count || 0) - (a.view_count || 0) },
  { id: 'viral', emoji: '📤', label: 'Viral', sortFn: (a, b) => getViralScore(b) - getViralScore(a) },
  { id: 'new', emoji: '✨', label: 'Mới', sortFn: (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0) },
];

const SECTION_TITLES = {
  trending: '🔥 Top Thịnh Hành',
  viral: '📤 Viral tuần này',
  new: '✨ Mới hôm nay',
};

const MINI_APP_SHORTCUTS = [
  { key: 'fortune', label: 'Tử vi', hint: 'Hôm nay', to: '/fortune', emoji: null, brand: 'general' },
  { key: 'balance', label: 'Cân não', hint: 'A hay B', to: null, emoji: '⚖️' },
  { key: 'roast', label: 'Bóc phốt', hint: 'Gõ tên', to: '/roast-card', emoji: '💳' },
  { key: 'brain', label: 'Não bạn', hint: 'Meme', to: '/brain', emoji: '🧠' },
  { key: 'lienquan', label: 'Liên Quân', hint: 'Tướng', to: '/lienquan', emoji: '⚔️' },
  { key: 'sbti', label: 'VBTI', hint: '27 type', to: '/vbti', emoji: '🎭' },
];

export default function ExplorePage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortMode, setSortMode] = useState('trending');
  const [fortuneStats, setFortuneStats] = useState({ view_count: 0, share_count: 0, like_count: 0 });
  const [featureStats, setFeatureStats] = useState({
    balance: { view_count: 0, share_count: 0, like_count: 0 },
    roast: { view_count: 0, share_count: 0, like_count: 0 },
    brain: { view_count: 0, share_count: 0, like_count: 0 },
    lienquan: { view_count: 0, share_count: 0, like_count: 0 },
    sbti: { view_count: 0, share_count: 0, like_count: 0 },
  });

  const todayBalance = useMemo(() => pickDailyBalanceQuestion(), []);
  const featureThumbs = useHomeFeatureThumbs();

  useEffect(() => {
    scrollToTop();
  }, []);

  useEffect(() => {
    fetchFortuneStats().then(setFortuneStats).catch(console.error);
    fetchAllFeatureStats().then(setFeatureStats).catch(console.error);
  }, []);

  useEffect(() => {
    fetchQuizzes()
      .then(setQuizzes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const featureFeedItems = useMemo(
    () => buildFeatureFeedItems({ fortuneStats, featureStats, featureThumbs }),
    [fortuneStats, featureStats, featureThumbs],
  );

  const feedItems = useMemo(
    () => buildHomeFeed(quizzes, featureFeedItems, sortMode),
    [quizzes, featureFeedItems, sortMode],
  );

  const heroSlides = useMemo(
    () => pickHeroSlides(quizzes, featureFeedItems, 6),
    [quizzes, featureFeedItems],
  );

  const handleFeedItemClick = (item) => {
    if (item.kind === 'quiz') {
      if (trackQuizViewOnce(item.quizId)) {
        incrementQuizStat(item.quizId, 'view').catch(console.error);
      }
      return;
    }
    if (item.kind === 'roast' || item.kind === 'brain' || item.kind === 'lienquan' || item.kind === 'sbti') {
      if (trackFeatureViewOnce(item.kind)) {
        incrementFeatureStat(item.kind, 'view').catch(console.error);
      }
    }
  };

  const getMiniAppThumb = (key) => {
    if (key === 'fortune') return featureThumbs.fortuneToday;
    if (key === 'balance') return featureThumbs.balance;
    if (key === 'roast') return featureThumbs.roast;
    if (key === 'brain') return featureThumbs.brain;
    if (key === 'lienquan') return featureThumbs.lienquan;
    if (key === 'sbti') return featureThumbs.sbti;
    return null;
  };

  const getMiniAppTo = (shortcut) => {
    if (shortcut.key === 'balance') return `/balance/${todayBalance.id}`;
    return shortcut.to;
  };

  if (loading) {
    return (
      <div className="home-container flex items-center justify-center">
        <div className="text-2xl font-black text-[#1E293B] animate-pulse">Đang tải... ⚡</div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <Helmet>
        <title>Khám phá — nambac.xyz</title>
        <meta
          name="description"
          content="Xem thêm quiz và trò chơi viral trên nambac.xyz — Hot, Viral, Mới mỗi ngày."
        />
      </Helmet>

      <div className="explore-header">
        <h2 className="explore-title">Khám phá</h2>
        <p className="explore-subtitle">Xem thêm quiz &amp; trò chơi</p>
      </div>

      <HeroCarousel slides={heroSlides} onItemClick={handleFeedItemClick} />

      <section className="explore-mini-apps" aria-label="Trò chơi nhanh">
        <h3 className="explore-section-label">Trò chơi nhanh</h3>
        <div className="explore-mini-apps-scroll">
          {MINI_APP_SHORTCUTS.map((shortcut) => {
            const thumb = getMiniAppThumb(shortcut.key);
            const to = getMiniAppTo(shortcut);
            return (
              <Link
                key={shortcut.key}
                to={to}
                className={`explore-mini-app-chip explore-mini-app-${shortcut.key}`}
                onClick={() => {
                  if (shortcut.key === 'roast' || shortcut.key === 'brain' || shortcut.key === 'lienquan' || shortcut.key === 'sbti') {
                    if (trackFeatureViewOnce(shortcut.key === 'sbti' ? 'sbti' : shortcut.key)) {
                      incrementFeatureStat(shortcut.key === 'sbti' ? 'sbti' : shortcut.key, 'view').catch(console.error);
                    }
                  }
                }}
              >
                <span className="explore-mini-app-thumb">
                  {thumb?.src ? (
                    <QuizImage src={thumb.src} alt="" seed={thumb.seed || shortcut.key} />
                  ) : (
                    <span className="explore-mini-app-emoji">
                      {shortcut.brand ? getFortuneBrand(shortcut.brand).emoji : shortcut.emoji}
                    </span>
                  )}
                </span>
                <span className="explore-mini-app-text">
                  <span className="explore-mini-app-label">{shortcut.label}</span>
                  <span className="explore-mini-app-hint">{shortcut.hint}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <AdSenseUnit adSlot={AD_SLOTS.home} location="explore-middle" />

      <section className="home-feed-section" aria-label="Khám phá quiz">
        <div className="home-sort-bar">
          <div className="sort-tabs" role="tablist" aria-label="Sắp xếp quiz">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                role="tab"
                aria-selected={sortMode === opt.id}
                className={`sort-tab ${sortMode === opt.id ? 'active' : ''}`}
                onClick={() => setSortMode(opt.id)}
              >
                <span className="sort-tab-emoji" aria-hidden="true">{opt.emoji}</span>
                <span className="sort-tab-label">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        <h3 className="glass-section-title">{SECTION_TITLES[sortMode]}</h3>
        <div className="glass-list grid-cols-2">
          {feedItems.length === 0 ? (
            <div className="text-center p-8 text-gray-500 font-bold col-span-2">Chưa có quiz nào hết trơn á! 🕸️</div>
          ) : (
            feedItems.map((item) => (
              <Link
                key={`${item.kind}-${item.id}`}
                to={item.to}
                className="glass-card square-card"
                onClick={() => handleFeedItemClick(item)}
              >
                <QuizCardThumb
                  src={item.image_url}
                  seed={item.imageSeed}
                  alt={item.title}
                  typeLabel={item.typeLabel}
                />
                <div className="glass-card-info-bottom">
                  <QuizCardTitle title={item.title} />
                  <QuizCardStats quiz={item} />
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
