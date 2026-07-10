import { finalizeResultImagePrompt } from './imagePrompts.js';

/**
 * Visual scene briefs for Roast "blacklist" cards (Thẻ đen bóc phốt) — English only, no text in art.
 * One hero share-card image per trait id. Comedic, exaggerated Saigon Gen Z roast energy.
 */
export const ROAST_SCENES = {
  trait_01: 'Vietnamese Gen Z who hyped up a Bui Vien night out then vanished — a ghostly translucent young person fading away at dusk while friends wait, phone showing unread messages, comedic disappearing act',
  trait_02: 'Chronically late Saigon friend still lounging in bed scrolling TikTok under a blanket, texting a rushed half-hearted almost-there excuse, clock exploding, comedic time-elastic gag',
  trait_03: 'Stylish young person posing at a fancy District 1 cafe, then dramatically patting empty pockets when the bill arrives, wallet-forgotten panic comedy',
  trait_04: 'Bubble-tea addict slumped over a cafe table for hours with one sad milk tea, dramatic back-pain aura, healing-trip self-pity comedy',
  trait_05: 'Person leaving someone on read for days — a giant phone with a seen tick, tiny climber struggling up a mountain of unread bubbles, ghosting comedy',
  trait_06: 'Overflowing Shopee shopping cart floating like treasure above a nearly empty wallet, future-self crying present-self grinning, retail-therapy gag',
  trait_07: 'Young office worker joining a Zoom call 12 minutes late with a fake bad-wifi face while a green online dot glows on Discord, workplace comedy',
  trait_08: 'Friend sneakily eating all the bubble-tea toppings from a neighbor cup, magic vanishing pearls, playful buffet-thief comedy',
  trait_09: 'Frustrated person failing a Grab OTP code for the eighth time, phone glitching, delivery rider calling repeatedly, digital-struggle comedy',
  trait_10: 'Unused gym membership card used as a bookmark in an unopened self-help book, dumbbell covered in dust, couch-potato irony comedy',
  trait_11: 'Silent group chat 48 hours after a hotpot dinner, one person tiptoeing away from a floating unpaid bill, split-bill dodging comedy',
  trait_12: 'Person caught in heavy Saigon monsoon rain with no raincoat, makeup melting dramatically, sidewalk runway performance-art comedy',
  trait_13: 'Someone claiming to be in a meeting while secretly posting drama on a social feed, split scene busted by a glowing green online dot',
  trait_14: 'Person snoozing an alarm for the ninth time, mountain of snooze buttons, Olympic five-more-minutes medal, oversleeping comedy',
  trait_15: 'Unofficial group gossip journalist gleefully screenshotting a drama chat, paparazzi flash, leaked-screenshot comedy',
  trait_16: 'Line-cutter appearing at the front of a long bubble-tea queue with a classic excuse, side-eye from the whole crowd, queue-jumping comedy',
  trait_17: 'Person forever saying let us hang out soon with plans floating in a distant future calendar cloud, never-happens comedy',
  trait_18: 'Melancholic person posting sad-lyric stories at 2am with dramatic indie mood lighting, attention-seeking heartbreak comedy',
  trait_19: 'At a shared meal the sneaky friend chopsticks straight for the biggest chicken drumstick and jumbo shrimp, buffet-tactician comedy',
  trait_20: 'Person replying let me think about it tomorrow while a giant calendar page never flips, procrastination time-warp comedy',
  trait_21: 'Serial charger-borrower hoarding a museum of never-returned cables, power banks and earphones, comedic private borrowed-goods collection',
  trait_22: 'Person photographing a plate of food from 40 angles until it goes cold, glossy feed versus tired eye-bags reality, social-media-vs-real comedy',
  trait_23: 'Friend singing karaoke in a steamy bathroom for 45 minutes while the whole group waits at the door, five-minutes time-lie comedy',
  trait_24: 'Person always sipping others drinks and nibbling others snacks but never buying, one-way sharing-economy comedy',
  trait_25: 'Overconfident friend giving wrong directions, whole group hopelessly lost in a maze of Saigon alleys, Google Maps crying, navigation comedy',
  trait_26: 'Person watching your story three seconds ago but ignoring your important message, quirky priority algorithm, selective-attention comedy',
  trait_27: 'Gamer promising last match for the seventh time, glowing rank screen, dinner plans melting away, one-more-game comedy',
  trait_28: 'Person borrowing a friend nice jacket and designer bag for a date and never returning them, closet full of others clothes, comedy',
  trait_29: 'Gossip expert who leaks your secret to the whole group in ten minutes, unlicensed radio broadcast tower on their head, comedy',
  trait_30: 'Friend cancelling plans at the last second claiming too tired, already dressed at the door then flopping back onto the couch, flake-master comedy',
};

const GENERIC_SCENE =
  'Vietnamese Gen Z Saigon friend caught doing a funny toxic-bestie behavior, exaggerated guilty reaction, playful blacklist roast energy, one dramatic comedic scene';

export function getRoastScenePrompt(id, indexHint = 0) {
  const scene = ROAST_SCENES[id] || GENERIC_SCENE;
  const keys = Object.keys(ROAST_SCENES);
  const fromId = keys.indexOf(id);
  const resultCode = fromId >= 0 ? fromId : indexHint;
  return finalizeResultImagePrompt(
    `Roast blacklist card. Scene: ${scene}.`,
    { resultCode, quizTitle: 'Thẻ đen bóc phốt', category: 'roast', propMode: 'roast' },
  );
}
