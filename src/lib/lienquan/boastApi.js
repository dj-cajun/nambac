import { apiUrl } from '../apiConfig';
import { getVisitorId } from '../siteVisit';

async function parseJson(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export async function fetchBoasts({ limit = 30, offset = 0 } = {}) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    visitorId: getVisitorId(),
  });
  return parseJson(await fetch(apiUrl(`/lienquan/boast?${params}`), { credentials: 'include' }));
}

export async function createBoast(payload) {
  return parseJson(
    await fetch(apiUrl('/lienquan/boast'), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, visitorId: getVisitorId() }),
    }),
  );
}

export async function likeBoast(boastId) {
  return parseJson(
    await fetch(apiUrl('/lienquan/boast'), {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'like', id: boastId, visitorId: getVisitorId() }),
    }),
  );
}
