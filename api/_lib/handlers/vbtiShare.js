import { getType } from '../../../shared/vbti/scoring.js';
import { sbtiCodeSlug } from '../../../shared/vbti/imagePrompts.js';
import { buildVbtiOgImageApiUrl } from '../composeOgImage.js';
import { isBot, ogHtml } from './og.js';

const PAGE_META = {
  hub: {
    title: 'VBTI — Vietnam Behavior Type Indicator | nambac',
    description:
      'Test personality tiếng Việt: 30 câu, 27 nhãn meme, nhánh ẩn DRUNK. Giải trí trên nambac.xyz.',
    path: '/vbti',
    ogTitle: 'VBTI',
    ogSubtitle: '27 nhãn meme · test tiếng Việt',
  },
  test: {
    title: 'Làm test VBTI | nambac',
    description: '30 câu hỏi VBTI — Vietnam Behavior Type Indicator trên nambac.',
    path: '/vbti/test',
    ogTitle: 'Test VBTI',
    ogSubtitle: '30 câu · 27 nhãn meme',
  },
  types: {
    title: '27 nhân cách VBTI | nambac',
    description: 'Bộ sưu tập 27 type VBTI — Vietnam Behavior Type Indicator.',
    path: '/vbti/types',
    ogTitle: '27 type VBTI',
    ogSubtitle: 'Bộ sưu tập nhãn meme',
  },
  mbti: {
    title: 'MBTI 16 type | VBTI nambac',
    description: '28 câu MBTI nhanh — ghép với VBTI trên nambac.',
    path: '/vbti/mbti',
    ogTitle: 'MBTI 16 type',
    ogSubtitle: '28 câu · ~5 phút',
  },
  'x-mbti': {
    title: 'VBTI × MBTI | nambac',
    description: 'Ghép nhãn VBTI với MBTI — combo personality meme.',
    path: '/vbti/x-mbti',
    ogTitle: 'VBTI × MBTI',
    ogSubtitle: 'Ghép combo personality',
  },
  'x-cung': {
    title: 'VBTI × Cung hoàng đạo | nambac',
    description: 'Ghép type VBTI với cung hoàng đạo — giải trí Gen Z.',
    path: '/vbti/x-cung',
    ogTitle: 'VBTI × Cung hoàng đạo',
    ogSubtitle: 'Meme zodiac × personality',
  },
};

const SBTI_RESULT_DESC_PREFIX = 'Kết quả test VBTI —';

function typePosterUrl(host, code) {
  const slug = sbtiCodeSlug(code);
  const protocol = host.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}/images/sbti_${slug}.webp`;
}

function resolvePageMeta(req) {
  const resultCode = String(req.query?.result || '').trim();
  const typeCode = String(req.query?.type || resultCode || '').trim();
  if (typeCode) {
    const type = getType(typeCode);
    if (type) {
      const isResult = Boolean(req.query?.result);
      return {
        title: isResult
          ? `Kết quả VBTI: ${type.code} — ${type.name} | nambac`
          : `${type.code} — ${type.name} | VBTI nambac`,
        description: isResult
          ? `${SBTI_RESULT_DESC_PREFIX} ${type.intro}`
          : type.intro,
        path: `/vbti/types/${encodeURIComponent(type.code)}`,
        ogTitle: isResult ? `Kết quả VBTI: ${type.code}` : `${type.code} — ${type.name}`,
        ogSubtitle: isResult ? type.name : type.intro.slice(0, 120),
        posterCode: type.code,
      };
    }
  }

  const page = String(req.query?.page || 'hub').trim().toLowerCase();
  return PAGE_META[page] || PAGE_META.hub;
}

function resolveSharePath(req) {
  if (req.query?.result) {
    return `/share-vbti/result/${encodeURIComponent(req.query.result)}`;
  }
  if (req.query?.type) {
    return `/share-vbti/type/${encodeURIComponent(req.query.type)}`;
  }
  if (req.query?.page && req.query.page !== 'hub') {
    return `/share-vbti/${req.query.page}`;
  }
  return '/share-vbti';
}

export default async function handler(req, res) {
  try {
    const ua = req.headers['user-agent'] || '';
    const host = req.headers.host || 'nambac.xyz';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const currentBase = `${protocol}://${host}`;
    const meta = resolvePageMeta(req);
    const redirectUrl = `${currentBase}${meta.path}`;
    const sharePath = resolveSharePath(req);

    if (!isBot(ua)) {
      return res.redirect(302, redirectUrl);
    }

    const image = meta.posterCode
      ? typePosterUrl(host, meta.posterCode)
      : buildVbtiOgImageApiUrl(host, {
          title: meta.ogTitle,
          subtitle: meta.ogSubtitle,
        });

    const html = ogHtml({
      title: meta.title,
      description: meta.description,
      image,
      url: `${currentBase}${sharePath}`,
      redirectUrl,
    });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).send(html);
  } catch (err) {
    console.error('VBTI share OG Error:', err);
    const errHost = req.headers.host || 'nambac.xyz';
    const errProtocol = errHost.includes('localhost') ? 'http' : 'https';
    return res.redirect(302, `${errProtocol}://${errHost}/vbti`);
  }
}
