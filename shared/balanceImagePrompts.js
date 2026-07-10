import { finalizeQuestionImagePrompt } from './imagePrompts.js';

/**
 * Visual scene briefs for Balance Quiz dilemmas — English only, no text in art.
 * One hero share-card image per question id. Both options blended into ONE dramatic scene.
 * Each brief encodes the real question content (situation + A vs B) so the image matches the quiz.
 */
export const BALANCE_SCENES = {
  sc_001: {
    situation: 'First date with a crush in District 1 Saigon',
    optionA: 'trendy aesthetic cafe with long queue and pricey latte for Instagram',
    optionB: 'steamy roadside hu tieu noodle cart that tastes amazing but looks messy',
  },
  sc_002: {
    situation: 'Monday morning gridlock at Hang Xanh intersection',
    optionA: 'late but safe on a cool air-conditioned bus scrolling phone',
    optionB: 'weaving a motorbike through exhaust smoke to arrive on time sweaty',
  },
  sc_003: {
    situation: 'Broke weekend with empty wallet',
    optionA: 'lonely introvert scrolling alone at home saving money',
    optionB: 'chaotic night out at Bui Vien with a friend who never pays',
  },
  sc_004: {
    situation: 'Heavy flooded Saigon street at rush hour',
    optionA: 'pushing a broken motorbike through deep floodwater',
    optionB: 'sheltering under a bridge while the boss keeps calling',
  },
  sc_005: {
    situation: 'Crush posted a sad-music story at 2am',
    optionA: 'cool composed person watching then scrolling away',
    optionB: 'typing a soft flirty reply in glowing phone light',
  },
  sc_006: {
    situation: 'Hungry at 11pm with almost empty wallet',
    optionA: 'waiting by the door for a delivery rider',
    optionB: 'frying instant noodles with egg in a tiny kitchen',
  },
  sc_007: {
    situation: 'Friday 5:55pm office when boss asks for volunteers',
    optionA: 'eager teammate raising hand to stay late',
    optionB: 'sneaking out camera-off toward a waiting Grab ride',
  },
  sc_008: {
    situation: 'Fresh online drama drops on the feed',
    optionA: 'chaotic comment-war phone screen with hundreds of replies',
    optionB: 'calm bestie group chat summarizing the tea',
  },
  sc_009: {
    situation: 'Choosing a drink while running late in District 1',
    optionA: 'long bubble-tea queue craving sugar',
    optionB: 'quick roadside iced coffee to stay on time',
  },
  sc_010: {
    situation: 'Flooded District 7 traffic before an online meeting',
    optionA: 'joining a video call on a motorbike mid-street',
    optionB: 'ducking into a wifi cafe to join properly',
  },
  sc_011: {
    situation: 'Ex liked an old photo on social media',
    optionA: 'dramatic power-move retaliation energy',
    optionB: 'peaceful mute and heal glow-up mood',
  },
  sc_012: {
    situation: 'Weekend corporate team building invite',
    optionA: 'forced fun with team headband posting online',
    optionB: 'staying home cozy with Netflix and snacks',
  },
  sc_013: {
    situation: 'Food delivery OTP stuck because chat app lags',
    optionA: 'stressed person refreshing the phone endlessly',
    optionB: 'calmly walking out to buy food instead',
  },
  sc_014: {
    situation: 'Freezing 18C office AC in tropical Saigon',
    optionA: 'person in hoodie shivering by the vent',
    optionB: 'arguing to switch seats away from the cold blast',
  },
  sc_015: {
    situation: '2am doom-scrolling TikTok in bed',
    optionA: 'endless five-more-minutes phone glow',
    optionB: 'disciplined phone placed far across the room',
  },
  sc_016: {
    situation: 'Group hotpot bill splitting for eight friends',
    optionA: 'chaotic even-split calculator panic',
    optionB: 'itemized fair accounting with receipts',
  },
  sc_017: {
    situation: 'Mega online sale cart overflowing with deals',
    optionA: 'retail-therapy checkout with full cart',
    optionB: 'adult budgeting un-checking items one by one',
  },
  sc_018: {
    situation: 'Viral personality quiz appears on the feed',
    optionA: 'instantly taking it and tagging friends',
    optionB: 'saving for later then forgetting forever',
  },
  sc_019: {
    situation: 'Parents video-call while gaming with friends',
    optionA: 'answering with a fake study background',
    optionB: 'letting it ring to mentally prepare first',
  },
  sc_020: {
    situation: 'Tiny rented room deciding on a companion',
    optionA: 'playful cat with fur everywhere',
    optionB: 'low-maintenance succulent plant on the desk',
  },
  sc_021: {
    situation: 'Crush invites you as a fake date to a wedding',
    optionA: 'glamorous dressed-up couple entering the venue',
    optionB: 'nervously declining awkward family questions',
  },
  sc_022: {
    situation: 'Da Lat pastel trip photoshoot with friends',
    optionA: 'friend taking hundreds of photos as content farm',
    optionB: 'casual selfie living in the moment',
  },
  sc_023: {
    situation: 'Restaurant undercharged the bill',
    optionA: 'quietly walking away with the mistake',
    optionB: 'honestly returning to pay the correct amount',
  },
  sc_024: {
    situation: 'Karaoke night forgetting the lyrics on stage',
    optionA: 'improvising wildly as the entertainer',
    optionB: 'passing the mic to escape the spotlight',
  },
  sc_025: {
    situation: '2am deadline with heavy eyelids',
    optionA: 'powering through with a third coffee',
    optionB: 'sleeping with a hopeful 5am alarm',
  },
  sc_026: {
    situation: 'Best friend stained your nice shirt after a date',
    optionA: 'laughing it off for friendship',
    optionB: 'demanding fair compensation',
  },
  sc_027: {
    situation: 'Group dinner where everyone stares at phones',
    optionA: 'joining the scroll silence',
    optionB: 'proposing a phone-stack game to rescue the vibe',
  },
  sc_028: {
    situation: 'Choosing a birthday gift for a crush',
    optionA: 'heartfelt handmade DIY craft',
    optionB: 'safe bubble-tea voucher and card',
  },
  sc_029: {
    situation: '3am Bui Vien nightlife with no ride and low cash',
    optionA: 'booking a Grab home alone',
    optionB: 'waiting for a friend on a motorbike',
  },
  sc_030: {
    situation: 'Group photo where you look great but a friend looks bad',
    optionA: 'posting it anyway',
    optionB: 'reshooting so everyone looks good',
  },
  sc_031: {
    situation: 'Team assignment with one missing member',
    optionA: 'silently carrying the whole project',
    optionB: 'reporting the truth to the teacher',
  },
  sc_032: {
    situation: 'Crush asks to borrow money until end of month',
    optionA: 'lending instantly as simp economy',
    optionB: 'politely declining because broke',
  },
  sc_033: {
    situation: 'Partner wants a long road trip but you get motion sickness',
    optionA: 'going for love while clutching a sick bag',
    optionB: 'suggesting a nearby chill cafe instead',
  },
  sc_034: {
    situation: 'Climbing game rank while partner angrily wants to call',
    optionA: 'pausing the match for love',
    optionB: 'begging for one more ranked round',
  },
  sc_035: {
    situation: 'Won a trip for two to Phu Quoc island',
    optionA: 'inviting the crush for a risky level-up',
    optionB: 'inviting a drama-free bestie',
  },
  sc_036: {
    situation: 'On a diet when a coworker offers full-topping bubble tea',
    optionA: 'indulging YOLO and accepting the drink',
    optionB: 'disciplined polite refusal',
  },
  sc_037: {
    situation: 'Spotting a bestie hangout story you were not invited to',
    optionA: 'directly messaging to ask why you were left out',
    optionB: 'silently overthinking while rewatching the story',
  },
  sc_038: {
    situation: 'High-paying job offer requiring a move to Hanoi',
    optionA: 'chasing career north with suitcase',
    optionB: 'staying for Saigon sunshine and friends',
  },
  sc_039: {
    situation: 'Ex texts missing the old days while you are happy',
    optionA: 'curiously replying to the message',
    optionB: 'blocking and glowing up instead',
  },
  sc_040: {
    situation: 'Solo birthday self-treat night',
    optionA: 'fancy restaurant dining alone in style',
    optionB: 'cozy home movie night with fried chicken',
  },
};

const GENERIC_SCENE = {
  situation: 'Vietnamese Gen Z in Saigon facing a funny everyday choose-one-of-two dilemma',
  optionA: 'one tempting chaotic choice',
  optionB: 'the safer opposite choice',
};

function resolveScene(id) {
  const scene = BALANCE_SCENES[id] || GENERIC_SCENE;
  if (typeof scene === 'string') {
    return { situation: scene, optionA: 'choice A energy', optionB: 'choice B energy' };
  }
  return scene;
}

/**
 * Build a content-aware scene prompt from the dilemma (situation + A/B).
 * English only — never inject Vietnamese (image models paint it as glyphs).
 */
export function getBalanceScenePrompt(id, indexHint = 0) {
  const { situation, optionA, optionB } = resolveScene(id);

  return finalizeQuestionImagePrompt(
    [
      'TEXT-FREE balance-game intro thumbnail and page hero. Zero letters, zero words, zero A/B labels, zero captions anywhere in the frame.',
      `Visual situation: ${situation}.`,
      `Left half body language and props convey: ${optionA}.`,
      `Right half body language and props convey: ${optionB}.`,
      'ONE unified watercolor illustration with soft VS energy — two contrasting emotional reactions in the same Saigon street scene, not a comic strip with caption bars.',
      'Expressive Vietnamese Gen Z characters, clear visual metaphor, premium viral quiz look.',
      'Absolutely no typography, no subtitle strips, no option labels — the app renders all text separately below the image.',
    ].join(' '),
    {
      quiz: {
        id: id || `balance_${indexHint}`,
        title: 'Balance Quiz',
        category: 'balance',
      },
    },
  );
}
