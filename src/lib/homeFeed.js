import { getViralScore } from './quizRanking';
import { FORTUNE_BRAND } from '../../shared/fortuneMeta.js';

/** @typedef {'quiz'|'fortune'|'roast'|'brain'|'lienquan'} FeedItemKind */

/**
 * @param {object} params
 * @param {object} params.fortuneStats
 * @param {object} params.featureStats
 * @param {object} params.featureThumbs
 */
export function buildFeatureFeedItems({ fortuneStats, featureStats, featureThumbs }) {
  return [
    {
      kind: 'fortune',
      id: 'fortune-today',
      title: `${FORTUNE_BRAND.emoji} Tình yêu hôm nay`,
      image_url: featureThumbs.fortuneToday.src,
      imageSeed: featureThumbs.fortuneToday.seed,
      to: '/fortune',
      view_count: fortuneStats?.view_count || 0,
      share_count: fortuneStats?.share_count || 0,
      like_count: fortuneStats?.like_count || 0,
      participant_count: 0,
      typeLabel: 'Tử vi',
    },
    {
      kind: 'fortune',
      id: 'fortune-tomorrow',
      title: '🔮 Tình yêu ngày mai',
      image_url: featureThumbs.fortuneTomorrow.src,
      imageSeed: featureThumbs.fortuneTomorrow.seed,
      to: '/fortune/tomorrow',
      view_count: fortuneStats?.view_count || 0,
      share_count: fortuneStats?.share_count || 0,
      like_count: fortuneStats?.like_count || 0,
      participant_count: 0,
      typeLabel: 'Tử vi',
    },
    {
      kind: 'roast',
      id: 'roast-card',
      title: '💳 Thẻ đen bóc phốt',
      image_url: featureThumbs.roast.src,
      imageSeed: featureThumbs.roast.seed,
      to: '/roast-card',
      view_count: featureStats?.roast?.view_count || 0,
      share_count: featureStats?.roast?.share_count || 0,
      like_count: featureStats?.roast?.like_count || 0,
      participant_count: 0,
      typeLabel: 'Bóc phốt',
    },
    {
      kind: 'brain',
      id: 'brain',
      title: '🧠 Trong đầu bạn có gì?',
      image_url: featureThumbs.brain.src,
      imageSeed: featureThumbs.brain.seed,
      to: '/brain',
      view_count: featureStats?.brain?.view_count || 0,
      share_count: featureStats?.brain?.share_count || 0,
      like_count: featureStats?.brain?.like_count || 0,
      participant_count: 0,
      typeLabel: 'Não',
    },
    {
      kind: 'lienquan',
      id: 'lienquan',
      title: '⚔️ Liên Quân — Counter & Giáo Án',
      image_url: featureThumbs.lienquan?.src || '/images/lienquan/hub-thumb.svg',
      imageSeed: featureThumbs.lienquan?.seed || 'lienquan-hub',
      to: '/lienquan',
      view_count: featureStats?.lienquan?.view_count || 0,
      share_count: featureStats?.lienquan?.share_count || 0,
      like_count: featureStats?.lienquan?.like_count || 0,
      participant_count: 0,
      typeLabel: 'Liên Quân',
    },
  ];
}

export function quizToFeedItem(quiz) {
  return {
    kind: 'quiz',
    id: quiz.id,
    title: quiz.title,
    image_url: quiz.image_url,
    imageSeed: quiz.id,
    to: `/quiz/${quiz.id}`,
    view_count: quiz.view_count || 0,
    share_count: quiz.share_count || 0,
    like_count: quiz.like_count || 0,
    participant_count: quiz.participant_count || 0,
    created_at: quiz.created_at,
    typeLabel: 'Quiz',
    quizId: quiz.id,
  };
}

export function sortFeedItems(items, sortMode = 'trending') {
  const list = [...items];

  if (sortMode === 'viral') {
    return list.sort((a, b) => getViralScore(b) - getViralScore(a));
  }

  if (sortMode === 'new') {
    return list.sort((a, b) => {
      const aNew = a.kind === 'quiz' && a.created_at ? new Date(a.created_at).getTime() : 0;
      const bNew = b.kind === 'quiz' && b.created_at ? new Date(b.created_at).getTime() : 0;
      if (bNew !== aNew) return bNew - aNew;
      return getViralScore(b) - getViralScore(a);
    });
  }

  return list.sort((a, b) => {
    const viewDiff = (b.view_count || 0) - (a.view_count || 0);
    if (viewDiff !== 0) return viewDiff;
    return getViralScore(b) - getViralScore(a);
  });
}

export function buildHomeFeed(quizzes, featureItems, sortMode = 'trending') {
  const quizItems = quizzes.map(quizToFeedItem);
  return sortFeedItems([...quizItems, ...featureItems], sortMode);
}

/** Hero carousel — top viral picks across quizzes + mini-apps */
export function pickHeroSlides(quizzes, featureItems, limit = 6) {
  const quizItems = quizzes.map(quizToFeedItem);
  return sortFeedItems([...quizItems, ...featureItems], 'viral').slice(0, limit);
}
