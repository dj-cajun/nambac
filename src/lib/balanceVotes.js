const VOTE_KEY = 'nambac_balance_votes';

/** @returns {Record<string, 'a'|'b'>} */
export function readLocalVotes() {
  try {
    const raw = JSON.parse(localStorage.getItem(VOTE_KEY) || '{}');
    const out = {};
    Object.entries(raw).forEach(([id, choice]) => {
      if (choice === 'a' || choice === 'b') out[id] = choice;
    });
    return out;
  } catch {
    return {};
  }
}

/** @param {string} questionId @param {'a'|'b'} choice */
export function saveLocalVote(questionId, choice) {
  const all = readLocalVotes();
  all[questionId] = choice;
  localStorage.setItem(VOTE_KEY, JSON.stringify(all));
}

export function getVotedIds() {
  return Object.keys(readLocalVotes());
}
