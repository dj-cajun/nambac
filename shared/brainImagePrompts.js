import { finalizeResultImagePrompt } from './imagePrompts.js';

/**
 * Visual scene briefs for the "What's in your brain?" mini-app — English only, no text in art.
 * One hero share-card image per result id. Playful X-ray-of-the-mind meme energy.
 */
export const BRAIN_SCENES = {
  brain_01: 'Saigon Gen Z head as glowing brain cross-section packed with floating pink hearts and a dreamy crush silhouette, tiny sad textbook in the corner, love-obsessed mind collage',
  brain_02: 'Brain packed with floating bubble tea, hotpot, banh trang tron, Highlands-style iced coffee, sleepy pillow and empty wallet in the corner, hungry-mind collage',
  brain_03: 'Brain overflowing with shopping bags, Shopee-style parcels and sale-tag shapes, tiny crying empty wallet, broke-shopaholic collage',
  brain_04: 'Brain full of gossip cloud shapes, popcorn buckets and phone screenshot panels, tabloid detective energy, drama-hunter collage',
  brain_05: 'Brain split between looming deadline clock and phone with endless short-video scroll, lonely coffee cup, procrastination collage',
  brain_06: 'Brain packed with game controllers, idol light-sticks and TikTok phone glow, tiny faded real world in the corner, escapist fan collage',
  brain_07: 'Brain split in half — gloomy rainy self-doubt side vs blazing confident superhero side, mood-swing collage',
  brain_08: 'Brain with Da Lat pastel calm candles and meditation aura on one side, swirling 1am overthinking tangle on the other, healing-but-anxious collage',
};

const GENERIC_SCENE =
  'Vietnamese Gen Z head shown as a glowing brain X-ray filled with funny floating thought icons, playful what-is-in-my-mind meme energy, one dramatic comedic scene';

export function getBrainScenePrompt(id, indexHint = 0) {
  const scene = BRAIN_SCENES[id] || GENERIC_SCENE;
  const keys = Object.keys(BRAIN_SCENES);
  const fromId = keys.indexOf(id);
  const resultCode = fromId >= 0 ? fromId : indexHint;
  return finalizeResultImagePrompt(
    `Mind X-ray share-card. Scene: ${scene}.`,
    { resultCode, quizTitle: 'Trong đầu bạn có gì', category: 'brain', propMode: 'collage' },
  );
}
