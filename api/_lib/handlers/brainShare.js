import { getBrainResultById, personalizeBrainDescription } from '../../../shared/brainData.js';
import { buildBrainOgImageApiUrl } from '../composeOgImage.js';
import { isBot, ogHtml } from './og.js';

export default async function handler(req, res) {
  try {
    const ua = req.headers['user-agent'] || '';
    const host = req.headers.host || 'nambac.xyz';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const currentBase = `${protocol}://${host}`;

    const name = decodeURIComponent(String(req.query?.name || '')).trim().slice(0, 22);
    const resultId = String(req.query?.result || '').trim();

    if (!name || !resultId) {
      return res.redirect(302, `${currentBase}/brain`);
    }

    const result = getBrainResultById(resultId);
    const redirectQuery = new URLSearchParams({ name, result: resultId });
    const redirectUrl = `${currentBase}/brain?${redirectQuery}`;

    if (!isBot(ua)) {
      return res.redirect(302, redirectUrl);
    }

    const title = `Trong đầu ${name} đang nghĩ gì? 🧠`;
    const description = `${personalizeBrainDescription(name, result.description).slice(0, 150)}… Quét sóng não bạn trên nambac.xyz!`;
    const fullShareUrl = `${currentBase}/share-brain/${encodeURIComponent(name)}/${resultId}`;

    const html = ogHtml({
      title,
      description,
      image: buildBrainOgImageApiUrl(host, { name, result: resultId }),
      url: fullShareUrl,
      redirectUrl,
    });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).send(html);
  } catch (err) {
    console.error('Brain share OG Error:', err);
    const errHost = req.headers.host || 'nambac.xyz';
    const errProtocol = errHost.includes('localhost') ? 'http' : 'https';
    return res.redirect(302, `${errProtocol}://${errHost}/brain`);
  }
}
