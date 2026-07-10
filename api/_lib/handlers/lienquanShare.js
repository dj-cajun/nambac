import { getHero } from '../../../shared/lienquan/heroes.js';
import { buildLienquanOgImageApiUrl } from '../composeOgImage.js';
import { isBot, ogHtml } from './og.js';

const PAGE_META = {
  hub: {
    title: 'Cẩm Nang Liên Quân | nambac',
    description:
      'Tìm counter tướng trong 30 giây, sao chép giáo án pro, làm quiz Thông Thạo trên nambac.xyz.',
    path: '/lienquan',
    ogTitle: 'Cẩm Nang Liên Quân',
    ogSubtitle: 'Khắc chế · Giáo án pro · Meta AOG',
  },
  quiz: {
    title: 'Quiz Thông Thạo Liên Quân | nambac',
    description: '10 câu hỏi Liên Quân — lấy mark Thông Thạo 7 trên nambac.',
    path: '/lienquan/quiz',
    ogTitle: 'Quiz Thông Thạo Liên Quân',
    ogSubtitle: '10 câu · Mark Đồng → Thông Thạo 7',
  },
  'giao-an': {
    title: 'Giáo Án Pro Liên Quân | nambac',
    description: 'Sao chép build item + arcana từ meta AOG — một chạm dán vào game.',
    path: '/lienquan/giao-an',
    ogTitle: 'Giáo Án Pro',
    ogSubtitle: 'Sao chép build pro · meta AOG',
  },
  khoe: {
    title: 'Góc Khoe Chiến Tích | Liên Quân nambac',
    description: 'Khoe MVP, quadra, clip Liên Quân — cộng đồng nambac.',
    path: '/lienquan/khoe',
    ogTitle: 'Góc Khoe Chiến Tích',
    ogSubtitle: 'MVP · clip · 🔥 cộng đồng',
  },
  'tu-dien': {
    title: 'Từ Điển Liên Quân | nambac',
    description: 'Trang bị, ngọc, thuật ngữ meta Liên Quân — tham khảo nhanh.',
    path: '/lienquan/tu-dien',
    ogTitle: 'Từ Điển Liên Quân',
    ogSubtitle: 'Item · arcana · thuật ngữ',
  },
};

function resolvePageMeta(req) {
  const page = String(req.query?.page || 'hub').trim().toLowerCase();
  const heroSlug = String(req.query?.hero || '').trim().toLowerCase();

  if (heroSlug) {
    const hero = getHero(heroSlug);
    if (hero) {
      return {
        title: `${hero.name} — Khắc chế & tip | Liên Quân nambac`,
        description: `${hero.name} tier ${hero.tier}. ${hero.tip}`,
        path: `/lienquan/tuong/${hero.id}`,
        ogTitle: `${hero.name} — Counter & tip`,
        ogSubtitle: `${hero.lane} · Tier ${hero.tier}`,
      };
    }
  }

  return PAGE_META[page] || PAGE_META.hub;
}

export default async function handler(req, res) {
  try {
    const ua = req.headers['user-agent'] || '';
    const host = req.headers.host || 'nambac.xyz';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const currentBase = `${protocol}://${host}`;
    const meta = resolvePageMeta(req);
    const redirectUrl = `${currentBase}${meta.path}`;

    if (!isBot(ua)) {
      return res.redirect(302, redirectUrl);
    }

    const sharePath = req.query?.hero
      ? `/share-lienquan/tuong/${encodeURIComponent(req.query.hero)}`
      : req.query?.page && req.query.page !== 'hub'
        ? `/share-lienquan/${req.query.page}`
        : '/share-lienquan';

    const html = ogHtml({
      title: meta.title,
      description: meta.description,
      image: buildLienquanOgImageApiUrl(host, {
        title: meta.ogTitle,
        subtitle: meta.ogSubtitle,
      }),
      url: `${currentBase}${sharePath}`,
    });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).send(html);
  } catch (err) {
    console.error('Liên Quân share OG Error:', err);
    const errHost = req.headers.host || 'nambac.xyz';
    const errProtocol = errHost.includes('localhost') ? 'http' : 'https';
    return res.redirect(302, `${errProtocol}://${errHost}/lienquan`);
  }
}
