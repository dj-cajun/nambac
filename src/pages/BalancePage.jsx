import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AnimatePresence, motion } from 'framer-motion';
import { Share2, ChevronRight } from 'lucide-react';
import { apiUrl } from '../lib/apiConfig';
import {
  getQuestionById,
  pickNextUnvoted,
  getQuestionProgress,
  parseSharedChoice,
  buildShareUrl,
} from '../../shared/balanceData.js';
import { readLocalVotes, saveLocalVote, getVotedIds } from '../lib/balanceVotes';
import './BalancePage.css';

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
  const [progress, setProgress] = useState({ current: 1, total: 20 });

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

  const handleVote = async (choice) => {
    if (!question || voted) return;
    saveLocalVote(question.id, choice);
    setVoted(choice);

    try {
      const res = await fetch(apiUrl('balance'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question_id: question.id, choice }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.stats) setStats(data.stats);
      }
    } catch {
      /* keep local vote */
    }
  };

  const goNext = () => {
    const next = pickNextUnvoted(getVotedIds(), question?.id);
    navigate(`/balance/${next.id}`, { replace: true });
  };

  const shareResult = async () => {
    if (!question || !voted) return;
    const url = buildShareUrl(question.id, voted);
    const side = voted === 'a' ? 'A' : 'B';
    const text = `⚖️ ${question.title.slice(0, 90)}… — Tôi chọn ${side}! Bạn chọn gì?`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Chọn 1 trong 2 — nambac.xyz', text, url });
        return;
      } catch {
        /* cancelled */
      }
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      alert('Đã copy link — gửi Zalo nhé!');
    } catch {
      alert(url);
    }
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

  return (
    <div className="balance-game-page">
      <Helmet>
        <title>Chọn 1 trong 2 ⚖️ — nambac.xyz</title>
        <meta
          name="description"
          content="A hay B? Tình huống Gen Z Sài Gòn — vote 3 giây, xem % cộng đồng, khoe Zalo."
        />
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
        {question.emoji && (
          <div className="balance-scenario-emoji" aria-hidden="true">{question.emoji}</div>
        )}
        <h1 className="balance-scenario-title">{question.title}</h1>
      </div>

      {!voted ? (
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
            <motion.button
              type="button"
              className="balance-share-slide"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              onClick={shareResult}
            >
              <Share2 size={18} />
              Khoe với bạn bè
            </motion.button>
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
