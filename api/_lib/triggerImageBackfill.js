/**
 * Trigger GitHub Actions backfill for a single quiz (after daily cron creates text-only quiz).
 * Requires Vercel env: GITHUB_DISPATCH_TOKEN (PAT, repo scope), GITHUB_REPO (owner/name).
 */
export async function triggerImageBackfill(quizId) {
  const token = process.env.GITHUB_DISPATCH_TOKEN;
  const repo = process.env.GITHUB_REPO || 'dj-cajun/nambac';
  if (!token || !quizId) return { skipped: true, reason: 'GITHUB_DISPATCH_TOKEN not set' };

  const res = await fetch(`https://api.github.com/repos/${repo}/dispatches`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      event_type: 'backfill-quiz',
      client_payload: { quiz_id: quizId },
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`GitHub dispatch failed (${res.status}): ${text.slice(0, 200)}`);
  }

  return { ok: true, quizId, repo };
}
