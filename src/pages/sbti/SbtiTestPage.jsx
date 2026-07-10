import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import {
  SBTI_QUESTIONS,
  SBTI_SPECIAL_QUESTIONS,
  scoreAnswers,
} from '../../../shared/sbti/index.js';
import { SBTI_UI } from '../../../shared/sbti/ui-text.vi.js';
import { shuffleArray } from '../../lib/sbti/shuffle.js';
import { saveSbtiResult } from '../../lib/sbti/session.js';
import './sbti.css';

const QUESTION_MAP = Object.fromEntries(
  [...SBTI_QUESTIONS, ...SBTI_SPECIAL_QUESTIONS].map((q) => [q.id, q]),
);

function createInitialOrder() {
  const gate = SBTI_SPECIAL_QUESTIONS.find((q) => q.id === 'drink_gate_q1');
  const deck = shuffleArray(SBTI_QUESTIONS);
  if (gate) {
    const at = Math.floor(Math.random() * (deck.length + 1));
    deck.splice(at, 0, gate);
  }
  return deck.map((q) => q.id);
}

function resolveDeck(orderIds, answers) {
  const ids = [...orderIds];
  const gateIdx = ids.indexOf('drink_gate_q1');
  if (gateIdx !== -1 && Number(answers.drink_gate_q1) === 3 && !ids.includes('drink_gate_q2')) {
    ids.splice(gateIdx + 1, 0, 'drink_gate_q2');
  }
  return ids.map((id) => QUESTION_MAP[id]).filter(Boolean);
}

export default function SbtiTestPage() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [index, setIndex] = useState(0);
  const [orderIds] = useState(createInitialOrder);

  const deck = useMemo(() => resolveDeck(orderIds, answers), [orderIds, answers]);
  const current = deck[index];
  const progress = deck.length ? Math.round((index / deck.length) * 100) : 0;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [index]);

  const onPick = (value) => {
    if (!current) return;
    const nextAnswers = { ...answers, [current.id]: value };

    const nextDeck = resolveDeck(orderIds, nextAnswers);
    const nextIndex = index + 1;

    if (nextIndex >= nextDeck.length) {
      const result = scoreAnswers(nextAnswers, SBTI_QUESTIONS);
      saveSbtiResult({ result, answers: nextAnswers });
      navigate('/sbti/result', { state: { result } });
      return;
    }

    setAnswers(nextAnswers);
    setIndex(nextIndex);
  };

  const onBack = () => {
    if (index > 0) setIndex(index - 1);
  };

  if (!current) {
    return (
      <div className="sbti-page">
        <p>Đang tải câu hỏi...</p>
      </div>
    );
  }

  return (
    <div className="sbti-page">
      <Helmet>
        <title>Test SBTI | nambac</title>
      </Helmet>

      <Link to="/sbti" className="sbti-back">← SBTI</Link>

      <div className="sbti-card">
        <div className="sbti-progress-meta">
          <span>
            {SBTI_UI.testProgress} {index + 1}{SBTI_UI.testOf}{deck.length}
          </span>
          <span>{current.special ? SBTI_UI.specialLabel : current.dim}</span>
        </div>
        <div className="sbti-progress-bar">
          <div className="sbti-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <h2 className="sbti-q-title">{current.text}</h2>
        <div className="sbti-options">
          {(current.options || []).map((opt) => (
            <button
              key={opt.label}
              type="button"
              className="sbti-option"
              onClick={() => onPick(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {index > 0 && (
          <button type="button" className="sbti-btn-secondary" style={{ marginTop: 14 }} onClick={onBack}>
            {SBTI_UI.testBack}
          </button>
        )}
      </div>
    </div>
  );
}
