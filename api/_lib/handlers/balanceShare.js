import { getQuestionById, parseSharedChoice } from '../../../shared/balanceData.js';
import { buildBalanceOgImageApiUrl } from '../composeOgImage.js';
import { isBot, ogHtml } from './og.js';

export default async function handler(req, res) {
  try {
    const ua = req.headers['user-agent'] || '';
    const host = req.headers.host || 'nambac.xyz';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const currentBase = `${protocol}://${host}`;

    const id = String(req.query?.id || req.query?.q || '').trim();
    const choice = parseSharedChoice(req.query?.voted);
    const question = id ? getQuestionById(id) : null;

    if (!question) {
      return res.redirect(302, `${currentBase}/balance`);
    }

    const side = choice === 'a' ? 'A' : choice === 'b' ? 'B' : '';
    const redirectQuery = new URLSearchParams({ q: id });
    if (side) redirectQuery.set('voted', side);
    const redirectUrl = `${currentBase}/balance?${redirectQuery}`;

    if (!isBot(ua)) {
      return res.redirect(302, redirectUrl);
    }

    const chosen = choice === 'a'
      ? question.optionA || question.option_a
      : choice === 'b'
        ? question.optionB || question.option_b
        : null;
    const title = `${question.title} — A hay B? ⚖️`;
    const description = chosen
      ? `Tôi chọn: ${String(chosen).slice(0, 120)} — Bạn chọn gì? Vote ngay trên nambac.xyz!`
      : 'A hay B? Vote 3 giây, xem % cộng đồng chọn gì — rồi tag bạn bè trên Zalo!';
    const fullShareUrl = side
      ? `${currentBase}/share-balance/${id}/${side}`
      : `${currentBase}/share-balance/${id}`;

    const html = ogHtml({
      title,
      description,
      image: buildBalanceOgImageApiUrl(host, { id, choice }),
      url: fullShareUrl,
      redirectUrl,
    });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).send(html);
  } catch (err) {
    console.error('Balance share OG Error:', err);
    const errHost = req.headers.host || 'nambac.xyz';
    const errProtocol = errHost.includes('localhost') ? 'http' : 'https';
    return res.redirect(302, `${errProtocol}://${errHost}/balance`);
  }
}
