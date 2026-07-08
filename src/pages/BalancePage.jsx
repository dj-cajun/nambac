import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { apiUrl } from '../lib/apiConfig';
import {
  getQuestionById,
  pickNextUnvoted,
  getQuestionProgress,
  parseSharedChoice,
  buildBalanceShareLink,
} from '../../shared/balanceData.js';
import { readLocalVotes, saveLocalVote, getVotedIds } from '../lib/balanceVotes';
import { markTodayDone } from '../lib/todayDone';
import { scrollToTop } from '../lib/scrollToTop';
import { fetchBalanceSceneImage } from '../lib/balanceApi';
import { buildBalanceOgImageUrl } from '../lib/siteUrl';
import { incrementFeatureStat, trackFeatureViewOnce } from '../lib/featureStats';
import ZaloShareButton from '../components/ZaloShareButton';
import './BalancePage.css';

const REVEAL_MS = 1400;

export default function BalancePage() {
  const { questionId: routeId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryId = searchParams.get('q');
  const friendChoice = parseSharedChoice(searchParams.get('voted'));

  const [question, setQuestion] = useState(null);
  const [stats, setStats] = useState({ pct_a: 50, pct_b: 50, total: 0 });
  const [voted, setVoted] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({ current: 1, total: 40 });
  const [sceneSrc, setSceneSrc] = useState('');
  const [sceneLoading, setSceneLoading] = useState(true);
  const [revealing, setRevealing] = useState(false);

  const resolveQuestionId = useCallback(() => {
    return queryId || routeId || null;
  }, [queryId, routeId]);

  const loadQuestion = useCallback(async (explicitId) => {
    setLoading(true);
    const local = readLocalVotes();
    const votedIds = getVotedIds();

    let q = explicitId ? getQuestionById(explicitId) : null;
    if (explicitId && !q) {
      q = pickNextUnvoted(votedIds);
      navigate(`/balance/${q.id}`, { replace: true });
    }
    if (!q) {
      q = pickNextUnvoted(votedIds);
    }

    setQuestion(q);
    setProgress(getQuestionProgress(q.id));
    setVoted(local[q.id] || null);
    setRevealing(false);

    try {
      const res = await fetch(apiUrl(`balance?id=${encodeURIComponent(q.id)}`));
      if (res.ok) {
        const data = await res.json();
        if (data.stats) setStats(data.stats);
      }
    } catch {
      /* offline fallback */
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const id = resolveQuestionId();
    loadQuestion(id);
  }, [resolveQuestionId, loadQuestion]);

  // Reset scroll to top whenever the question changes (e.g. "Câu tiếp theo"),
  // since the route param changes without unmounting the page.
  useEffect(() => {
    if (question?.id) scrollToTop();
  }, [question?.id]);

  useEffect(() => {
    if (trackFeatureViewOnce('balance')) {
      incrementFeatureStat('balance', 'view').catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!question?.id) return undefined;
    let alive = true;
    setSceneSrc('');
    setSceneLoading(true);
    fetchBalanceSceneImage(question.id)
      .then(({ src }) => {
        if (alive) setSceneSrc(src);
      })
      .catch(() => {
        /* graceful fallback to emoji */
      })
      .finally(() => {
        if (alive) setSceneLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [question?.id]);

  const handleVote = async (choice) => {
    if (!question || voted || revealing) return;
    saveLocalVote(question.id, choice);
    setRevealing(true);

    const votePromise = (async () => {
      try {
        const res = await fetch(apiUrl('balance'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question_id: question.id, choice }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.stats) return data.stats;
        }
      } catch {
        /* keep local vote — fall back to current stats */
      }
      return null;
    })();

    const [nextStats] = await Promise.all([
      votePromise,
      new Promise((resolve) => setTimeout(resolve, REVEAL_MS)),
    ]);

    if (nextStats) setStats(nextStats);
    setVoted(choice);
    setRevealing(false);
    incrementFeatureStat('balance', 'like').catch(() => {});
    markTodayDone('balance');
  };

  const goNext = () => {
    const next = pickNextUnvoted(getVotedIds(), question?.id);
    navigate(`/balance/${next.id}`, { replace: true });
  };

  if (loading || !question) {
    return (
      <div className="balance-game-page">
        <p className="balance-loading">Đang tải… ⚖️</p>
      </div>
    );
  }

  const showChallenge = friendChoice && !voted;
  const aWins = stats.pct_a >= stats.pct_b;

  const ogChoice = voted || friendChoice || null;
  const ogImageUrl = question ? buildBalanceOgImageUrl(question.id, ogChoice) : null;
  const sharePageUrl = question ? buildBalanceShareLink(question.id, ogChoice || 'a') : null;
  const ogTitle = question
    ? `${question.title.slice(0, 80)} — A hay B? ⚖️`
    : 'Chọn 1 trong 2 ⚖️ — nambac.xyz';
  const balanceShareUrl = voted ? buildBalanceShareLink(question.id, voted) : '';

  return (
    <div className="balance-game-page">
      <Helmet>
        <title>Chọn 1 trong 2 ⚖️ — nambac.xyz</title>
        <meta
          name="description"
          content="A hay B? Tình huống Gen Z Sài Gòn — vote 3 giây, xem % cộng đồng, khoe Zalo."
        />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={ogTitle} />
        <meta
          property="og:description"
          content="A hay B? Vote 3 giây, xem % cộng đồng chọn gì — rồi tag bạn bè trên Zalo!"
        />
        {sharePageUrl && <meta property="og:url" content={sharePageUrl} />}
        {ogImageUrl && <meta property="og:image" content={ogImageUrl} />}
        {ogImageUrl && <meta property="og:image:width" content="1200" />}
        {ogImageUrl && <meta property="og:image:height" content="630" />}
        <meta name="twitter:card" content="summary_large_image" />
        {ogImageUrl && <meta name="twitter:image" content={ogImageUrl} />}
      </Helmet>

      <div className="balance-game-top">
        <span className="balance-game-progress">
          {progress.current}/{progress.total}
        </span>
      </div>

      {showChallenge && (
        <div className="balance-challenge-banner">
          Bạn bè chọn <strong>{friendChoice === 'a' ? 'A' : 'B'}</strong> rồi — bạn chọn gì? 👀
        </div>
      )}

      <div className="balance-scenario">
        <div className="balance-scene">
          {sceneSrc ? (
            <img
              src={sceneSrc}
              alt=""
              className="balance-scene-img"
              loading="eager"
              decoding="async"
            />
          ) : sceneLoading ? (
            <div className="balance-scene-skeleton" aria-hidden="true">
              <span className="balance-scene-emoji">{question.emoji || '⚖️'}</span>
            </div>
          ) : (
            <div className="balance-scene-fallback" aria-hidden="true">
              <span className="balance-scene-emoji">{question.emoji || '⚖️'}</span>
            </div>
          )}
        </div>
        <h1 className="balance-scenario-title">{question.title}</h1>
      </div>

      {revealing ? (
        <div className="balance-reveal-loading">
          <div className="balance-reveal-spinner" aria-hidden="true" />
          <p className="balance-reveal-text">Đang thống kê phe của bạn… 📊</p>
          <p className="balance-reveal-sub">Xem có bao nhiêu người cùng gu với bạn 👀</p>
        </div>
      ) : !voted ? (
        <div className="balance-vs-stack">
          <button
            type="button"
            className="balance-giant-option option-a"
            onClick={() => handleVote('a')}
          >
            <span className="balance-option-label">OPTION A</span>
            {question.optionA}
          </button>

          <div className="balance-vs-divider">VS</div>

          <button
            type="button"
            className="balance-giant-option option-b"
            onClick={() => handleVote('b')}
          >
            <span className="balance-option-label">OPTION B</span>
            {question.optionB}
          </button>
        </div>
      ) : (
        <motion.div
          className="balance-result-stack"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="balance-result-row">
            <div className={`balance-result-row-header${aWins ? ' winner-a' : ''}`}>
              <span>OPTION A{voted === 'a' ? ' · Bạn' : ''}</span>
              <span className={`balance-result-pct${aWins ? ' hot' : ''}`}>{stats.pct_a}%</span>
            </div>
            <div className="balance-result-meter">
              <motion.div
                className="balance-result-meter-fill fill-a"
                initial={{ width: 0 }}
                animate={{ width: `${stats.pct_a}%` }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <p className="balance-result-row-text">{question.optionA}</p>
          </div>

          <div className="balance-result-row">
            <div className={`balance-result-row-header${!aWins ? ' winner-b' : ''}`}>
              <span>OPTION B{voted === 'b' ? ' · Bạn' : ''}</span>
              <span className={`balance-result-pct${!aWins ? ' hot' : ''}`}>{stats.pct_b}%</span>
            </div>
            <div className="balance-result-meter">
              <motion.div
                className="balance-result-meter-fill fill-b"
                initial={{ width: 0 }}
                animate={{ width: `${stats.pct_b}%` }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <p className="balance-result-row-text">{question.optionB}</p>
          </div>

          <p className="balance-vote-count">
            {stats.total > 0
              ? `${stats.total.toLocaleString()} lượt vote`
              : 'Bạn là người vote đầu tiên!'}
          </p>
        </motion.div>
      )}

      <div className="balance-game-footer">
        <AnimatePresence>
          {voted && (
            <motion.div
              className="balance-zalo-share"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.3, delay: 0.15 }}
            >
              <ZaloShareButton
                url={balanceShareUrl}
                className="zalo-share-wrap--block"
                onShared={() => incrementFeatureStat('balance', 'share').catch(() => {})}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {voted && (
          <button type="button" className="balance-next-btn" onClick={goNext}>
            Câu tiếp theo
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
