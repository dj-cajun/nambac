import { finalizeResultImagePrompt } from './imagePrompts.js';
import { FORTUNE_BRAND } from './fortuneMeta.js';

/** Visual scene briefs for daily fortune archetypes (0–7) — English only, no text in art */
const FORTUNE_SCENES = [
  'Vietnamese Gen Z in Saigon apartment anxiously refreshing phone, glowing Shopee delivery box stuck in flooded District 7 street visible through window, rain and motorbikes in water, comedy panic energy',
  'Office worker in HCMC skyscraper clutching lower back in pain, boss silhouette looming with speech-free sticky notes flying, dramatic corporate roast comedy',
  'Young person staring at phone showing read receipt ghosting, heartbreak aura, neon pink room in Binh Thanh, dramatic lonely Gen Z mood',
  'Stylish cafe in District 1, empty wallet flying open like magic trick, expensive latte on table, shocked face checking ZaloPay fail gesture, comedy broke moment',
  'Introvert at Bui Vien nightlife overwhelmed, social battery icon metaphor as glowing empty battery above head, crowd blur, wanting to escape',
  'Stuck in legendary Saigon rush-hour traffic at Hang Xanh intersection, motorbike helmet, endless red brake lights, comedic despair hourglass prop',
  'Person overthinking in bed at 3am, phone glow on face, thought spiral visual metaphor, messy room, Binh Thanh night window',
  'Mirror selfie illusion shattered — confident morning outfit vs afternoon friend roast reaction split mood in one cinematic scene, comedy vanity roast',
];

export function getFortuneScenePrompt(fortuneIndex) {
  const idx = ((Number(fortuneIndex) % 8) + 8) % 8;
  const scene = FORTUNE_SCENES[idx];
  return finalizeResultImagePrompt(
    `Daily love fortune share-card poster ${idx}. Center-framed Vietnamese Gen Z character, expressive romantic roast comedy reaction. Scene: ${scene}. Ho Chi Minh City Gen Z love drama humor aesthetic, premium viral quiz share energy.`,
    { resultCode: idx, quizTitle: FORTUNE_BRAND.labelFull, category: 'fortune' },
  );
}
