import { finalizeResultImagePrompt } from '../imagePrompts.js';

/** Filesystem-safe slug for /images/sbti_{slug}.webp */
export function sbtiCodeSlug(code) {
  return String(code || '')
    .replace(/!/g, '')
    .replace(/-/g, '_')
    .toLowerCase();
}

export const SBTI_BASE_STYLE = `Cute minimalist vector illustration.
Rounded mascot character with simple geometric shapes.
Soft pastel color palette.
Clean flat design.
Bold readable silhouette.
Large expressive eyes.
Tiny mouth with exaggerated emotions.
Smooth rounded limbs.
Friendly Korean mobile app mascot vibe.
Premium modern illustration.
High-quality vector artwork.
Soft gradients.
Subtle shadows.
Minimal background.
One dominant visual focus.
Playful personality.
Highly shareable social media illustration.
No outlines that are too thin.
Simple but premium.`;

/**
 * Per-type scene briefs — character + hero prop + emotion + setting.
 * English only; app renders type code/name as text overlay.
 */
export const SBTI_TYPE_SCENES = {
  CTRL: {
    personality: 'control freak organizer who runs life like a project manager',
    emotion: 'confident smirk with raised eyebrow',
    heroProp: 'giant clipboard with colorful checkmarks and sticky notes',
    setting: 'neat minimalist desk with color-coded folders',
    palette: 'cool blue and mint pastel',
  },
  'ATM-er': {
    personality: 'generous friend who always pays for the group',
    emotion: 'proud generous smile',
    heroProp: 'giant open wallet with coins spilling out',
    setting: 'trendy cafe table with friends silhouettes',
    palette: 'warm gold and peach pastel',
  },
  'Dior-s': {
    personality: 'underdog on a glow-up comeback arc',
    emotion: 'determined fierce eyes with small confident grin',
    heroProp: 'giant butterfly cocoon cracking open into wings',
    setting: 'gym mirror with soft sunrise glow',
    palette: 'lavender and rose gold pastel',
  },
  BOSS: {
    personality: 'natural leader who grabs the steering wheel',
    emotion: 'bossy confident grin',
    heroProp: 'giant car steering wheel',
    setting: 'driver seat with city skyline blur',
    palette: 'deep navy and coral accent pastel',
  },
  'THAN-K': {
    personality: 'overly grateful person who thanks everything',
    emotion: 'tearful grateful smile with sparkling eyes',
    heroProp: 'giant bouquet of thank-you flowers',
    setting: 'sunny park with gentle light rays',
    palette: 'sunny yellow and soft pink pastel',
  },
  'OH-NO': {
    personality: 'shocked person who cannot believe their quiz result',
    emotion: 'wide shocked eyes and open mouth',
    heroProp: 'giant surprised emoji mirror reflecting their face',
    setting: 'phone screen glow in dark room',
    palette: 'electric purple and cyan pastel',
  },
  GOGO: {
    personality: 'always-ready traveler who never waits for mood',
    emotion: 'excited adventurous grin',
    heroProp: 'giant rolling suitcase with travel stickers',
    setting: 'airport departure gate with soft clouds',
    palette: 'sky blue and orange pastel',
  },
  SEXY: {
    personality: 'main-character confidence who owns the spotlight',
    emotion: 'confident wink with sparkle eyes',
    heroProp: 'giant glowing vanity mirror with sparkles',
    setting: 'soft spotlight stage with bokeh lights',
    palette: 'hot pink and champagne gold pastel',
  },
  'LOVE-R': {
    personality: 'hopeless romantic with heart always full',
    emotion: 'dreamy blush with heart-shaped eyes',
    heroProp: 'giant pink heart bigger than their body',
    setting: 'romantic sunset rooftop with tiny stars',
    palette: 'rose pink and lilac pastel',
  },
  MUM: {
    personality: 'mom-friend who takes care of everyone',
    emotion: 'warm caring smile',
    heroProp: 'giant thermos water bottle and lunch box stack',
    setting: 'cozy kitchen with house plants',
    palette: 'warm green and cream pastel',
  },
  FAKE: {
    personality: 'social chameleon wearing too many masks',
    emotion: 'ambiguous half-smile hiding true feelings',
    heroProp: 'giant theater comedy and tragedy masks',
    setting: 'masquerade party with soft blur crowd',
    palette: 'silver and muted violet pastel',
  },
  OJBK: {
    personality: 'whatever-goes zen person with zero drama',
    emotion: 'peaceful zen smile with half-closed eyes',
    heroProp: 'giant soft shrug pillow',
    setting: 'ultra-minimal empty calm room',
    palette: 'sage green and beige pastel',
  },
  MALO: {
    personality: 'scrappy underdog monkey grinding through life',
    emotion: 'scrappy determined grin',
    heroProp: 'giant pixel-game sword and banana',
    setting: 'cute dungeon with floating XP orbs',
    palette: 'earthy brown and lime pastel',
  },
  'JOKE-R': {
    personality: 'clown who laughs before reality hits',
    emotion: 'laughing eyes with big comedy grin',
    heroProp: 'giant red clown nose and whoopee cushion',
    setting: 'tiny comedy stage with one spotlight',
    palette: 'candy red and yellow pastel',
  },
  'WOC!': {
    personality: 'chaotic WTF energy running two operating systems',
    emotion: 'chaotic screaming-laughing face',
    heroProp: 'giant glowing exclamation mark',
    setting: 'glitchy colorful abstract background',
    palette: 'neon pink and electric blue pastel',
  },
  'THIN-K': {
    personality: 'deep overthinker with endless inner monologue',
    emotion: 'pondering face with one raised brow',
    heroProp: 'giant glowing lightbulb thought cloud',
    setting: 'quiet library corner with floating books',
    palette: 'soft indigo and warm amber pastel',
  },
  SHIT: {
    personality: 'cynical realist who sees life as absurd',
    emotion: 'deadpan cynical side-eye',
    heroProp: 'giant dark storm cloud over a tiny trash can',
    setting: 'rainy minimalist alley with puddle reflection',
    palette: 'storm gray and muted teal pastel',
  },
  ZZZZ: {
    personality: 'sleep-mode expert who dodges drama by napping',
    emotion: 'peaceful sleepy smile with droopy eyes',
    heroProp: 'giant fluffy pillow with floating Zzz bubbles',
    setting: 'cozy blanket burrito bedroom',
    palette: 'sleepy blue and lavender pastel',
  },
  POOR: {
    personality: 'broke but laser-focused minimalist grinder',
    emotion: 'intense focused stare',
    heroProp: 'giant glowing target bullseye',
    setting: 'bare desk with single lamp and empty wallet',
    palette: 'forest green and charcoal pastel',
  },
  MONK: {
    personality: 'detached zen monk free from worldly flex',
    emotion: 'serene closed-eye meditation smile',
    heroProp: 'giant singing meditation bowl',
    setting: 'minimal zen garden with one stone path',
    palette: 'sand beige and soft jade pastel',
  },
  IMSB: {
    personality: 'self-doubting person who roasts themselves first',
    emotion: 'sheepish embarrassed blush',
    heroProp: 'giant question mark mirror',
    setting: 'empty classroom with one desk',
    palette: 'soft gray and blush pink pastel',
  },
  SOLO: {
    personality: 'lone wolf who is independent but secretly lonely',
    emotion: 'lonely teary eyes with small brave smile',
    heroProp: 'giant empty chair beside them',
    setting: 'rainy window with soft blue light',
    palette: 'cool blue and muted purple pastel',
  },
  FUCK: {
    personality: 'unpredictable wild-card chaos agent',
    emotion: 'wild explosive manic grin',
    heroProp: 'giant firecracker with lightning sparks',
    setting: 'chaos burst with colorful sparks',
    palette: 'fire orange and hot red pastel',
  },
  DEAD: {
    personality: 'emotionally flat person who has seen too much',
    emotion: 'completely flat deadpan expression',
    heroProp: 'giant empty battery icon at zero percent',
    setting: 'monochrome gray room with wilted plant',
    palette: 'ash gray and faded blue pastel',
  },
  IMFW: {
    personality: 'fragile sensitive soul who needs gentle care',
    emotion: 'worried fragile eyes with quivering lip',
    heroProp: 'giant delicate glass figurine they are hugging',
    setting: 'soft pastel clouds and gentle light',
    palette: 'baby blue and soft peach pastel',
  },
  HHHH: {
    personality: 'personality library crashed — only laughter remains',
    emotion: 'hysterical laughing face with tears of joy',
    heroProp: 'giant open laughing mouth shape as comedy prop',
    setting: 'confetti burst celebration background',
    palette: 'bright yellow and hot pink pastel',
  },
  DRUNK: {
    personality: 'hidden-type party person with swaying drunk charm',
    emotion: 'dizzy happy swaying smile with spiral eyes',
    heroProp: 'giant soju bottle with spinning stars',
    setting: 'warm neon bar lights with soft bokeh',
    palette: 'warm amber and purple neon pastel',
  },
};

/** Hub landing hero — invites the user to start the test (not a result type). */
export const SBTI_HUB_SCENE = {
  personality: 'curious quiz-show mascot inviting you to discover your personality type',
  emotion: 'excited curious grin with wide sparkling eyes, eyebrows raised in anticipation',
  heroProp: 'giant glowing question mark made of colorful sticky notes and tiny badge icons',
  setting: 'playful minimal stage with soft confetti and floating badge shapes',
  palette: 'coral red and warm cream pastel',
};

function buildSceneCore(scene) {
  return `${SBTI_BASE_STYLE}

Cute minimalist rounded mascot character standing proudly.

Personality: ${scene.personality}.

Expression: ${scene.emotion}.

Holding one oversized symbolic object: ${scene.heroProp}.

Background: Minimal environment suggesting ${scene.setting}.

Visual storytelling: Instantly understandable in one second. Funny. Heartwarming. Slightly exaggerated. Expressive body language.

Color palette: ${scene.palette}.

Character occupies 70% of frame. Hero prop occupies 25%. Background only supports the story.

Premium vector illustration. Rounded geometric design. Friendly mobile app mascot style. Minimal clutter. One hero prop. Strong visual hierarchy.`;
}

export function buildSbtiSceneCore(code) {
  const scene = SBTI_TYPE_SCENES[code];
  if (!scene) throw new Error(`Unknown SBTI type: ${code}`);
  return buildSceneCore(scene);
}

export function getSbtiScenePrompt(code, indexHint = 0) {
  const core = code === 'HUB' ? buildSceneCore(SBTI_HUB_SCENE) : buildSbtiSceneCore(code);
  return finalizeResultImagePrompt(core, {
    resultCode: indexHint,
    category: 'personality',
    propMode: 'hero',
  });
}
