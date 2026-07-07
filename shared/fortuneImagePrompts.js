import { finalizeResultImagePrompt } from './imagePrompts.js';
import { FORTUNE_BRAND } from './fortuneMeta.js';

/** Visual scene briefs for daily fortune archetypes (0–19) — English only, no text in art */
const FORTUNE_SCENES = [
  'Vietnamese Gen Z in Saigon apartment anxiously refreshing phone, glowing Shopee delivery box stuck in flooded District 7 street visible through window, rain and motorbikes in water, comedy panic energy',
  'Office worker in HCMC skyscraper clutching lower back in pain, boss silhouette looming with speech-free sticky notes flying, dramatic corporate roast comedy',
  'Young person staring at phone showing read receipt ghosting, heartbreak aura, neon pink room in Binh Thanh, dramatic lonely Gen Z mood',
  'Stylish cafe in District 1, empty wallet flying open like magic trick, expensive latte on table, shocked face checking ZaloPay fail gesture, comedy broke moment',
  'Introvert at Bui Vien nightlife overwhelmed, social battery icon metaphor as glowing empty battery above head, crowd blur, wanting to escape',
  'Stuck in legendary Saigon rush-hour traffic at Hang Xanh intersection, motorbike helmet, endless red brake lights, comedic despair hourglass prop',
  'Person overthinking in bed at 3am, phone glow on face, thought spiral visual metaphor, messy room, Binh Thanh night window',
  'Mirror selfie illusion shattered — confident morning outfit vs afternoon friend roast reaction split mood in one cinematic scene, comedy vanity roast',
  'Phone notification panel full of read receipts with no replies, lonely rooftop in Saigon at dusk, subtle romantic anxiety',
  'Scrolling social feed filled with wedding photos, young adult holding coffee in silence, bittersweet smile in small apartment',
  'Daydreaming wedding moodboard floating as holograms over desk, romantic fantasy comedy, pastel city skyline background',
  'Ex-partner story preview glowing on phone in dark room, emotional pull versus self-control visual metaphor',
  'Friends giving conflicting advice around a cafe table, speech bubbles with opposite arrows, social chaos but playful tone',
  'Heavy rain and traffic delay before date night, wet helmet, blinking phone battery, urgency and misunderstanding vibe',
  'Crush appears in perfect golden hour lighting, stunned expression and blushing chaos, cinematic campus courtyard',
  'Rainy bus stop with warm street lights, soft emotional vulnerability, notebook with unfinished confession letter',
  'Argument moment with accidental harsh words, sparks fading into apology gesture, healing transition visual cue',
  'Group chat drama visualization with multiple phones and reactions, central character trying to stay neutral',
  'Calm centered person in noisy environment, cool blue aura, emotional stability contrasted with surrounding chaos',
  'No-signal icon and low battery during important conversation, city street at night, urgency to reconnect',
];

export function getFortuneScenePrompt(fortuneIndex) {
  const total = FORTUNE_SCENES.length;
  const idx = ((Number(fortuneIndex) % total) + total) % total;
  const scene = FORTUNE_SCENES[idx];
  return finalizeResultImagePrompt(
    `Daily love fortune share-card poster ${idx}. Center-framed Vietnamese Gen Z character, expressive romantic roast comedy reaction. Scene: ${scene}. Ho Chi Minh City Gen Z love drama humor aesthetic, premium viral quiz share energy.`,
    { resultCode: idx, quizTitle: FORTUNE_BRAND.labelFull, category: 'fortune' },
  );
}
