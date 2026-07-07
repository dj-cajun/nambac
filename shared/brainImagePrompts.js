import { finalizeResultImagePrompt } from './imagePrompts.js';

/**
 * Visual scene briefs for the "What's in your brain?" mini-app — English only, no text in art.
 * One hero share-card image per result id. Playful X-ray-of-the-mind meme energy.
 */
export const BRAIN_SCENES = {
  brain_01: 'Vietnamese Gen Z head shown as a glowing brain filled almost entirely with floating pink hearts and a dreamy crush silhouette, a tiny sad textbook squeezed in a corner, love-obsessed mind X-ray comedy',
  brain_02: 'Young person head as a brain packed with floating bubble tea, hotpot, banh trang tron and noodles, a small sleepy pillow and an empty wallet in the corner, hungry-mind X-ray comedy',
  brain_03: 'Head as a brain overflowing with floating shopping bags, Shopee parcels and glowing sale tags, a tiny crying empty wallet, broke-shopaholic mind X-ray comedy',
  brain_04: 'Head as a brain full of floating gossip speech clouds, popcorn buckets and phone screenshots, tabloid detective energy, drama-hunter mind X-ray comedy',
  brain_05: 'Head as a brain split between a glowing looming deadline clock and a phone showing endless short videos, a lonely coffee cup, procrastination mind X-ray comedy',
  brain_06: 'Head as a brain packed with floating game controllers, glowing idol light-sticks and TikTok icons, a tiny faded real world in the corner, escapist fan mind X-ray comedy',
  brain_07: 'Head as a brain split in half — one gloomy rainy self-doubt side, one blazing confident superhero side, dramatic mood-swing mind X-ray comedy',
  brain_08: 'Head as a brain with calming candles, Da Lat pastel scenery and meditation aura on one side, a swirling tangle of 1am overthinking thoughts on the other, healing-but-anxious mind X-ray comedy',
};

const GENERIC_SCENE =
  'Vietnamese Gen Z head shown as a glowing brain X-ray filled with funny floating thought icons, playful what-is-in-my-mind meme energy, one dramatic comedic scene';

export function getBrainScenePrompt(id, indexHint = 0) {
  const scene = BRAIN_SCENES[id] || GENERIC_SCENE;
  return finalizeResultImagePrompt(
    `Brain-composition share-card poster. A funny "what is in your head" mind X-ray. Scene: ${scene}. Ho Chi Minh City Gen Z meme humor aesthetic, bold comedic energy, premium viral share look.`,
    { resultCode: indexHint, quizTitle: 'Trong đầu bạn có gì', category: 'brain' },
  );
}
