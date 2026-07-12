/**
 * Fortune text generation prompts — daily pool expansion (cron not wired yet).
 * Engine uses handcrafted pool + axis/DOB hash until AI batch is enabled.
 */
import { generateJsonViaLlm, parseJsonFromLlm } from './llmJson.js';

export const FORTUNE_TEXT_LIMITS = Object.freeze({
  titleMin: 8,
  titleMax: 60,
  descMin: 120,
  descMax: 280,
  remedyMin: 40,
  remedyMax: 180,
});

export const FORTUNE_GENERATOR_SYSTEM = `
# Fortune text generator — nambac (v1)

Write Vietnamese daily fortune archetypes for Gen Z Sài Gòn. Entertainment only — roast + humor, not real astrology.

## Axes
- love: crush, ghosting, Zalo drama, talking stage
- money: ví mỏng, Shopee, GrabFood, tiết kiệm fail
- health: burnout, thiếu ngủ, social battery 0%
- general: tổng vận ngày — mix work/crush/money vibes

## Output JSON array (exactly 5 items)
[
  {
    "title": "Vietnamese hook with emoji",
    "desc": "2–3 sentences, 120–280 chars, situational Sài Gòn",
    "remedy": "1 practical/funny advice line",
    "cuuTinh": "Chỉ số N (short ally label)",
    "baoThu": "Chỉ số N (short rival label)"
  }
]

Rules: Vietnamese only in user-facing text. No wall of text. No duplicate sentences.
`;

export function buildFortuneGeneratorUserPrompt(axis, dateLabel) {
  return `Generate 5 fortune archetypes for axis "${axis}" on date ${dateLabel}. Native Gen Z Sài Gòn tone. Return JSON array only.`;
}

/**
 * Generate fortune archetype batch for one axis (admin/cron future use).
 * @returns {Promise<object[]>}
 */
export async function generateFortuneArchetypes({
  apiKey,
  openrouterKey,
  axis = 'love',
  dateLabel,
}) {
  const maxAttempts = 3;
  let lastErr;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const { text } = await generateJsonViaLlm({
        geminiKey: apiKey,
        openrouterKey,
        system: FORTUNE_GENERATOR_SYSTEM,
        user: buildFortuneGeneratorUserPrompt(axis, dateLabel),
        temperature: attempt > 1 ? 0.7 : 0.82,
        maxOutputTokens: 4096,
        label: 'fortune-text',
      });
      const parsed = parseJsonFromLlm(text);
      const list = Array.isArray(parsed) ? parsed : parsed.archetypes || parsed.items || [];
      if (list.length < 1) throw new Error('fortune generator returned empty array');
      return list;
    } catch (err) {
      lastErr = err;
      if (attempt < maxAttempts) {
        console.warn(`fortune-text attempt ${attempt} failed: ${err.message}`);
      }
    }
  }

  throw lastErr;
}
