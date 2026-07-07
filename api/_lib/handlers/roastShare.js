import { getTraitById } from '../../../shared/roastData.js';
import { buildRoastOgImageApiUrl } from '../composeOgImage.js';
import { isBot, ogHtml } from './og.js';

export default async function handler(req, res) {
  try {
    const ua = req.headers['user-agent'] || '';
    const host = req.headers.host || 'nambac.xyz';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const currentBase = `${protocol}://${host}`;

    const name = decodeURIComponent(String(req.query?.name || '')).trim().slice(0, 22);
    const traitId = String(req.query?.trait || '').trim();

    if (!name || !traitId) {
      return res.redirect(302, `${currentBase}/roast-card`);
    }

    const trait = getTraitById(traitId);
    const redirectQuery = new URLSearchParams({ name, trait: traitId });
    const redirectUrl = `${currentBase}/roast-card?${redirectQuery}`;

    if (!isBot(ua)) {
      return res.redirect(302, redirectUrl);
    }

    const title = `${name} vừa bị bóc phốt: ${trait.title} 💳`;
    const description = `${String(trait.description).slice(0, 150)}… Vào làm thẻ trả đũa trên nambac.xyz!`;
    const fullShareUrl = `${currentBase}/share-roast/${encodeURIComponent(name)}/${traitId}`;

    const html = ogHtml({
      title,
      description,
      image: buildRoastOgImageApiUrl(host, { name, trait: traitId }),
      url: fullShareUrl,
      redirectUrl,
    });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).send(html);
  } catch (err) {
    console.error('Roast share OG Error:', err);
    const errHost = req.headers.host || 'nambac.xyz';
    const errProtocol = errHost.includes('localhost') ? 'http' : 'https';
    return res.redirect(302, `${errProtocol}://${errHost}/roast-card`);
  }
}
