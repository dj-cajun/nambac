/**
 * Gemini first (multi-key rotate) → OpenRouter text model fallback (quota / outage).
 */
import { generateOpenRouterText, getOpenRouterTextModel } from './openrouterText.js';
import { getGeminiKey, getGeminiKeys, isRetryableGeminiError } from './geminiKeys.js';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export { getGeminiKey, getGeminiKeys };

export function getOpenRouterKey() {
  return process.env.OPENROUTER_API_KEY || '';
}

export function parseJsonFromLlm(text) {
  let raw = text || '';
  const match = raw.match(/\{[\s\S]*\}/);
  if (match) raw = match[0];
  try {
    return JSON.parse(raw);
  } catch {
    return JSON.parse(raw.replace(/,\s*([}\]])/g, '$1'));
  }
}

async function callGeminiText({ apiKey, prompt, temperature, maxOutputTokens }) {
  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature,
        maxOutputTokens,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const message = err.error?.message || `Gemini failed (${response.status})`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  if (!text.trim()) throw new Error('Gemini returned empty content');
  return text;
}

/**
 * Try Gemini; on failure fall back to OpenRouter (OPENROUTER_TEXT_MODEL).
 * @returns {{ text: string, provider: 'gemini' | 'openrouter' }}
 */
export async function generateJsonViaLlm({
  geminiKey,
  openrouterKey,
  system = '',
  user,
  prompt,
  temperature = 0.85,
  maxOutputTokens = 8192,
  label = 'json',
} = {}) {
  const combined = prompt ?? (system ? `${system}\n\n${user}` : user);
  if (!combined?.trim()) {
    throw new Error(`${label}: empty prompt`);
  }

  const keys = geminiKey ? [geminiKey] : getGeminiKeys();
  const orKey = openrouterKey ?? getOpenRouterKey();

  for (let i = 0; i < keys.length; i += 1) {
    try {
      const text = await callGeminiText({
        apiKey: keys[i],
        prompt: combined,
        temperature,
        maxOutputTokens,
      });
      return { text, provider: 'gemini' };
    } catch (err) {
      const hasNextKey = i < keys.length - 1 && isRetryableGeminiError(err);
      if (hasNextKey) {
        console.warn(`[${label}] Gemini key #${i + 1} failed → key #${i + 2} (${err.message})`);
        continue;
      }
      if (!orKey) throw err;
      console.warn(`[${label}] Gemini failed → OpenRouter ${getOpenRouterTextModel()} (${err.message})`);
      break;
    }
  }

  if (!orKey) {
    throw new Error('GEMINI_API_KEY or OPENROUTER_API_KEY required');
  }

  const text = await generateOpenRouterText({
    apiKey: orKey,
    system,
    user: user ?? combined,
    temperature,
    maxOutputTokens,
  });
  return { text, provider: 'openrouter' };
}
