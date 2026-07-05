import { dispatch } from './_lib/router.js';

export default async function handler(req, res) {
  const raw = req.query?.path;
  const segments = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return dispatch(req, res, segments);
}

export const config = {
  maxDuration: 60,
};
