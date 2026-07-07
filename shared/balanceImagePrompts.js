import { finalizeResultImagePrompt } from './imagePrompts.js';

/**
 * Visual scene briefs for Balance-game dilemmas (Chọn 1 trong 2) — English only, no text in art.
 * One hero share-card image per question id. Both options blended into ONE dramatic scene.
 */
export const BALANCE_SCENES = {
  sc_001: 'Vietnamese Gen Z couple first date choice in District 1 — split-energy: trendy aesthetic cafe with long queue and pricey latte versus steamy roadside hu tieu noodle cart, playful romantic dilemma',
  sc_002: 'Young office worker stuck at Hang Xanh intersection Monday morning — cool air-conditioned bus versus weaving motorbike through gridlock and exhaust smoke, comedic commute dilemma',
  sc_003: 'Broke weekend Gen Z — lonely introvert scrolling phone alone at home versus chaotic night out at Bui Vien with a money-owing friend, empty wallet visual gag',
  sc_004: 'Heavy flooded Saigon street at rush hour — person pushing broken motorbike through water versus sheltering under a bridge with boss calling, dramatic rainy comedy',
  sc_005: 'Late-night phone glow — crush posted a sad-music story at 2am, one side cool and composed, other side typing a flirty reply, romantic hesitation mood',
  sc_006: 'Hungry at 11pm with almost empty wallet — waiting for delivery rider versus frying instant noodles with egg, cozy survival kitchen comedy',
  sc_007: 'Friday 5:55pm office — boss asking for volunteers, one hand raised eager team-player versus camera-off sneaking out to a Grab ride, workplace comedy',
  sc_008: 'Fresh drama drops online — chaotic Threads feed war with hundreds of comments versus a calm Zalo bestie group summary, digital gossip dilemma',
  sc_009: 'Long bubble-tea queue in District 1 versus quick roadside iced coffee, young person torn between sugar craving and being on time, playful choice',
  sc_010: 'Flooded District 7 traffic before an online meeting — joining Zoom on a motorbike mid-street versus finding a wifi cafe, extreme multitask comedy',
  sc_011: 'Ex liked an old photo — dramatic power-move retaliation versus peacefully muting and healing, emotional social-media tension',
  sc_012: 'Weekend team building — corporate survivor with team headband posting online versus staying home cozy with Netflix, introvert-rights comedy',
  sc_013: 'Grab OTP stuck because Zalo lags — stressed refreshing phone versus calmly walking to buy food, hangry problem-solver moment',
  sc_014: 'Freezing 18C office in tropical Saigon — person in hoodie by the vent versus arguing to switch seats, comedic thermostat war',
  sc_015: '2am doom-scrolling TikTok in bed — endless "five more minutes" versus disciplined phone placed far away, revenge bedtime procrastination',
  sc_016: 'Group hotpot bill splitting for 8 people — fast even-split calculator chaos versus itemized fair accounting, friendship math comedy',
  sc_017: '11/11 mega sale cart overflowing versus disciplined un-checking items, retail-therapy versus adult budgeting dilemma',
  sc_018: 'Viral MBTI quiz appears on feed — instantly taking it and tagging friends versus saving for later and forgetting, procrastination gag',
  sc_019: 'Parents video-call while gaming with friends — answering with fake study background versus letting it ring to mentally prepare, comedic boundary',
  sc_020: 'Tiny 20 square meter rented room — adopting a playful cat with fur everywhere versus a low-maintenance succulent plant, cozy solo-living choice',
  sc_021: 'Crush invites you as a fake date to a friend wedding — glamorous dressed-up couple entering versus nervously declining awkward family questions, romantic comedy',
  sc_022: 'Da Lat pastel trip photoshoot — one friend taking 400 photos as group content farm versus casual selfie stick living-in-the-moment, travel dilemma',
  sc_023: 'Restaurant undercharged the bill — quietly walking away versus honestly returning to pay, good-karma moral moment',
  sc_024: 'Karaoke night forgetting the lyrics — improvising wildly as the entertainer versus passing the mic to escape, comedic spotlight',
  sc_025: '2am deadline with heavy eyelids — powering through with third coffee versus sleeping with a hopeful 5am alarm, student grind comedy',
  sc_026: 'Best friend borrowed your nice shirt for a date and stained it — laughing it off versus demanding fair compensation, friendship boundary',
  sc_027: 'Group dinner where everyone stares at phones — joining the scroll versus proposing phone-stack game, vibe-rescue comedy',
  sc_028: 'Choosing a crush birthday gift — heartfelt handmade DIY versus safe bubble-tea voucher and card, sweet romantic dilemma',
  sc_029: '3am at Bui Vien nightlife, no ride and low cash — booking a Grab home versus waiting for a friend on a motorbike, sleepy survival comedy',
  sc_030: 'Group photo where you look great but a friend looks bad — posting it anyway versus reshooting for everyone, loyalty dilemma',
  sc_031: 'Team assignment with one missing member — silently carrying the whole project versus reporting the truth to the teacher, justice moment',
  sc_032: 'Crush asks to borrow money until end of month — lending instantly as simp economy versus politely declining broke, financial boundary comedy',
  sc_033: 'Partner wants a long road trip but you get motion sickness — going for love clutching a bag versus suggesting a nearby chill cafe, couple comedy',
  sc_034: 'Climbing game rank while partner angrily wants to call — pausing the match for love versus begging for one more round, relationship red-flag gag',
  sc_035: 'Won a trip for two to Phu Quoc island — inviting the crush for a risky level-up versus a drama-free bestie, beach dilemma',
  sc_036: 'On a diet when a coworker offers full-topping bubble tea — indulging YOLO versus disciplined polite refusal, temptation comedy',
  sc_037: 'Spotting a bestie hangout story you were not invited to — directly asking why versus silently overthinking, friendship emotion',
  sc_038: 'High-paying job offer requiring a move to Hanoi — chasing career north versus staying for Saigon sunshine and friends, life-crossroad mood',
  sc_039: 'Ex texts "I miss the old days" while you are happy — curiously replying versus blocking and glowing up, healing dilemma',
  sc_040: 'Solo birthday self-treat — fancy restaurant dining alone in style versus cozy home movie night with fried chicken, self-love comedy',
};

const GENERIC_SCENE =
  'Vietnamese Gen Z in Saigon facing a funny everyday choose-one-of-two dilemma, expressive reaction, two contrasting options blended into one dramatic scene, playful meme energy';

export function getBalanceScenePrompt(id, indexHint = 0) {
  const scene = BALANCE_SCENES[id] || GENERIC_SCENE;
  return finalizeResultImagePrompt(
    `Balance-game share-card poster. A hard "choose one of two" dilemma. Scene: ${scene}. Ho Chi Minh City Gen Z humor aesthetic, bold VS energy, premium viral quiz share look.`,
    { resultCode: indexHint, quizTitle: 'Chọn 1 trong 2', category: 'balance' },
  );
}
