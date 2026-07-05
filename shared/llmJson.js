/**
 * Gemini first → OpenRouter text model fallback (quota / outage).
 */
import { generateOpenRouterText, getOpenRouterTextModel } from './openrouterText.js';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export function getGeminiKey() {
  return process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
}

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
    throw new Error(err.error?.message || `Gemini failed (${response.status})`);
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
  const gKey = geminiKey ?? getGeminiKey();
  const orKey = openrouterKey ?? getOpenRouterKey();
  const combined = prompt ?? (system ? `${system}\n\n${user}` : user);

  if (!combined?.trim()) {
    throw new Error(`${label}: empty prompt`);
  }

  if (gKey) {
    try {
      const text = await callGeminiText({
        apiKey: gKey,
        prompt: combined,
        temperature,
        maxOutputTokens,
      });
      return { text, provider: 'gemini' };
    } catch (err) {
      if (!orKey) throw err;
      console.warn(`[${label}] Gemini failed → OpenRouter ${getOpenRouterTextModel()} (${err.message})`);
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
