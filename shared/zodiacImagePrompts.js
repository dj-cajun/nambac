/**
 * One-time zodiac fortune image prompts (12 western + 12 con giáp = 24 assets).
 * Run: npm run images:zodiac
 */
import { finalizeResultImagePrompt } from './imagePrompts.js';
import { ZODIAC_SIGNS, CHINESE_ZODIAC_ANIMALS } from './zodiacFortune.js';

const WEST_SCENES = {
  aries: 'bold ram constellation mascot, fire element sparks, confident Gen Z warrior energy, Saigon rooftop sunset',
  taurus: 'golden bull constellation mascot with bubble tea and comfort food props, cozy earth tones, District 3 cafe vibe',
  gemini: 'twin constellation mascots chatting on phones, airy pastel split composition, social butterfly comedy',
  cancer: 'crab constellation mascot hugging moon pillow in rainy Saigon apartment, soft watery glow, emotional cozy mood',
  leo: 'lion constellation mascot on mini stage with spotlight, dramatic gold aura, main-character Gen Z energy',
  virgo: 'virgo maiden constellation mascot organizing desk and planner, clean mint palette, perfectionist comedy',
  libra: 'scales constellation mascot choosing between two drinks at cafe, balanced aesthetic, indecisive charm',
  scorpio: 'scorpion constellation mascot with mysterious neon purple aura, intense stare, midnight Zalo drama mood',
  sagittarius: 'archer constellation mascot with travel backpack and motorbike, adventurous fire sky, Bui Vien wanderlust',
  capricorn: 'goat constellation mascot climbing office ladder with coffee, ambitious earth tones, hustle culture roast',
  aquarius: 'water-bearer constellation mascot pouring glowing ideas, futuristic cyan accents, quirky inventor vibe',
  pisces: 'fish constellation mascots swimming in dreamy pastel clouds, romantic soft focus, crush daydream energy',
};

const CN_SCENES = {
  ty: 'cute rat con giáp mascot hoarding lucky coins and Shopee parcels, clever Gen Z saver comedy, red gold accents',
  suu: 'strong ox con giáp mascot carrying heavy grocery bags calmly, patient earth tones, reliable friend energy',
  dan: 'fierce tiger con giáp mascot in streetwear roaring playfully, bold orange stripes, leader aura',
  mao: 'elegant cat con giáp mascot (Vietnamese Mèo) grooming with mirror, graceful pink palette, subtle charisma',
  thin: 'dragon con giáp mascot coiled around glowing pearl, epic gold red clouds, lucky ambitious vibe',
  ran: 'snake con giáp mascot wrapped around tarot cards and phone, sleek jade tones, intuitive mysterious mood',
  ngo: 'horse con giáp mascot galloping past Saigon traffic, free spirited wind motion, adventure comedy',
  mui: 'goat con giáp mascot napping on grass with soft scarf, gentle pastel meadow, healing chill energy',
  than: 'monkey con giáp mascot juggling snacks and memes, playful yellow tones, chaotic genius comedy',
  dau: 'rooster con giáp mascot announcing sunrise with megaphone, proud dawn gold, punctual roast humor',
  tuat: 'loyal dog con giáp mascot guarding friend group chat, warm brown palette, faithful companion vibe',
  hoi: 'pig con giáp mascot enjoying feast with friends, joyful pink feast table, abundance comedy',
};

export function getWesternZodiacImagePrompt(signId) {
  const sign = ZODIAC_SIGNS.find((z) => z.id === signId) || ZODIAC_SIGNS[0];
  const scene = WEST_SCENES[sign.id] || WEST_SCENES.aries;
  return finalizeResultImagePrompt(
    `Zodiac fortune mascot for ${sign.name} (${sign.emoji}). Scene: ${scene}. Vietnamese Gen Z Sài Gòn tarot card aesthetic.`,
    { resultCode: 0, quizTitle: `Cung ${sign.name}`, category: 'fortune', propMode: 'hero' },
  );
}

export function getChineseZodiacImagePrompt(animalId) {
  const animal = CHINESE_ZODIAC_ANIMALS.find((a) => a.id === animalId) || CHINESE_ZODIAC_ANIMALS[0];
  const scene = CN_SCENES[animal.id] || CN_SCENES.ty;
  return finalizeResultImagePrompt(
    `Vietnamese con giáp mascot ${animal.name} (${animal.emoji}). Scene: ${scene}. Lunar new year meets Gen Z Sài Gòn fortune card.`,
    { resultCode: 0, quizTitle: `Tuổi ${animal.name}`, category: 'fortune', propMode: 'hero' },
  );
}

export function listAllZodiacImageJobs() {
  const west = ZODIAC_SIGNS.map((z) => ({
    kind: 'west',
    id: z.id,
    filename: `zodiac_west_${z.id}.webp`,
    prompt: getWesternZodiacImagePrompt(z.id),
    label: z.name,
  }));
  const cn = CHINESE_ZODIAC_ANIMALS.map((a) => ({
    kind: 'cn',
    id: a.id,
    filename: `zodiac_cn_${a.id}.webp`,
    prompt: getChineseZodiacImagePrompt(a.id),
    label: a.name,
  }));
  return [...west, ...cn];
}
