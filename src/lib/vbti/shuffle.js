export function shuffleArray(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function buildQuestionDeck(mainQuestions, specialQuestions, answers = {}) {
  const gate = specialQuestions.find((q) => q.id === 'drink_gate_q1');
  const trigger = specialQuestions.find((q) => q.id === 'drink_gate_q2');
  const deck = shuffleArray(mainQuestions);
  if (gate) {
    const at = Math.floor(Math.random() * (deck.length + 1));
    deck.splice(at, 0, gate);
  }
  const gateIdx = deck.findIndex((q) => q.id === 'drink_gate_q1');
  if (gateIdx !== -1 && Number(answers.drink_gate_q1) === 3 && trigger) {
    const hasTrigger = deck.some((q) => q.id === 'drink_gate_q2');
    if (!hasTrigger) deck.splice(gateIdx + 1, 0, trigger);
  }
  return deck;
}
