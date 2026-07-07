import { getFortuneByIndex } from '../../../shared/fortuneData.js';
import { buildFortuneResultTitle, isValidFortuneDateLabel } from '../../../shared/fortuneEngine.js';
import { isBot, ogHtml } from './og.js';

function buildFortuneOgImageApiUrl(host, name, fortuneIndex, dateStr) {
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const params = new URLSearchParams({
    name: String(name).trim(),
    idx: String(fortuneIndex),
    date: dateStr,
  });
  return `${protocol}://${host}/api/fortune-og?${params}`;
}

export default async function handler(req, res) {
  try {
    const ua = req.headers['user-agent'] || '';
    const host = req.headers.host || 'nambac.xyz';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const currentBase = `${protocol}://${host}`;

    const name = decodeURIComponent(String(req.query?.name || '')).trim().slice(0, 24);
    const idxRaw = req.query?.idx;
    const fortuneIndex = idxRaw !== undefined && idxRaw !== '' ? Number(idxRaw) : NaN;
    const dateStr = String(req.query?.date || '').trim();
    if (!isValidFortuneDateLabel(dateStr)) {
      return res.redirect(302, `${currentBase}/fortune`);
    }

    if (!name || Number.isNaN(fortuneIndex)) {
      return res.redirect(302, `${currentBase}/fortune`);
    }

    const idx = ((fortuneIndex % 8) + 8) % 8;
    const fortune = getFortuneByIndex(idx);
    const encodedName = encodeURIComponent(name);
    const fullShareUrl = `${currentBase}/share-fortune/${encodedName}/${idx}/${dateStr}`;
    const fortuneQuery = new URLSearchParams({ name, idx: String(idx), date: dateStr });
    const redirectUrl = `${currentBase}/fortune?${fortuneQuery}`;

    if (!isBot(ua)) {
      return res.redirect(302, redirectUrl);
    }

    const title = `${buildFortuneResultTitle({ name, fortune, dateLabel: dateStr })} — Tử vi bóc phốt`;
    const description = `${fortune.body.slice(0, 160)}…`;

    const html = ogHtml({
      title,
      description,
      image: buildFortuneOgImageApiUrl(host, name, idx, dateStr),
      url: fullShareUrl,
      redirectUrl,
    });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).send(html);
  } catch (err) {
    console.error('Fortune share OG Error:', err);
    const errHost = req.headers.host || 'nambac.xyz';
    const errProtocol = errHost.includes('localhost') ? 'http' : 'https';
    return res.redirect(302, `${errProtocol}://${errHost}/fortune`);
  }
}
