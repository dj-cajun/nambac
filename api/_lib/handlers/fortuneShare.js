import { FORTUNE_COUNT, getFortuneByIndex } from '../../../shared/fortuneData.js';
import { buildFortuneResultTitle, getDateStr, isValidFortuneDateLabel } from '../../../shared/fortuneEngine.js';
import { FORTUNE_BRAND } from '../../../shared/fortuneMeta.js';
import { buildFortuneOgImageApiUrl } from '../composeOgImage.js';
import { isBot, ogHtml } from './og.js';

export default async function handler(req, res) {
  try {
    const ua = req.headers['user-agent'] || '';
    const host = req.headers.host || 'nambac.xyz';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const currentBase = `${protocol}://${host}`;

    const name = decodeURIComponent(String(req.query?.name || '')).trim().slice(0, 24);
    const idxRaw = req.query?.idx;
    const fortuneIndex = idxRaw !== undefined && idxRaw !== '' ? Number(idxRaw) : NaN;
    const rawDate = String(req.query?.date || '').trim();
    const hasExplicitDate = isValidFortuneDateLabel(rawDate);
    const dateStr = hasExplicitDate ? rawDate : getDateStr();

    if (!name || Number.isNaN(fortuneIndex)) {
      return res.redirect(302, `${currentBase}/fortune`);
    }

    const idx = ((fortuneIndex % FORTUNE_COUNT) + FORTUNE_COUNT) % FORTUNE_COUNT;
    const fortune = getFortuneByIndex(idx);
    const encodedName = encodeURIComponent(name);
    const fullShareUrl = hasExplicitDate
      ? `${currentBase}/share-fortune/${encodedName}/${idx}/${dateStr}`
      : `${currentBase}/share-fortune/${encodedName}/${idx}`;
    const fortuneQuery = new URLSearchParams({ name, idx: String(idx), date: dateStr });
    const redirectUrl = `${currentBase}/fortune?${fortuneQuery}`;

    if (!isBot(ua)) {
      return res.redirect(302, redirectUrl);
    }

    const title = `${buildFortuneResultTitle({ name, fortune, dateLabel: dateStr })} — ${FORTUNE_BRAND.label}`;
    const description = `${fortune.body.slice(0, 160)}…`;

    const html = ogHtml({
      title,
      description,
      image: buildFortuneOgImageApiUrl(host, { name, idx, date: dateStr }),
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
