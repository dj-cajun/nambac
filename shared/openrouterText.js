/**
 * OpenRouter chat completions — used only when Gemini fails (quota / outage).
 */

const OPENROUTER_CHAT_URL = 'https://openrouter.ai/api/v1/chat/completions';

export function getOpenRouterTextModel() {
  return (
    process.env.OPENROUTER_TEXT_MODEL
    || 'deepseek/deepseek-v4-pro'
  );
}

function openRouterHeaders(apiKey) {
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'https://nambac.vercel.app',
    'X-Title': process.env.OPENROUTER_APP_NAME || 'nambac',
  };
}

/**
 * @param {{ apiKey: string, system?: string, user: string, temperature?: number, maxOutputTokens?: number, model?: string }} opts
 */
export async function generateOpenRouterText({
  apiKey,
  system = '',
  user,
  temperature = 0.85,
  maxOutputTokens = 8192,
  model,
}) {
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not configured');
  if (!user?.trim()) throw new Error('OpenRouter: empty user prompt');

  const messages = [];
  if (system?.trim()) messages.push({ role: 'system', content: system.trim() });
  messages.push({ role: 'user', content: user.trim() });

  const res = await fetch(OPENROUTER_CHAT_URL, {
    method: 'POST',
    headers: openRouterHeaders(apiKey),
    body: JSON.stringify({
      model: model || getOpenRouterTextModel(),
      messages,
      temperature,
      max_tokens: maxOutputTokens,
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err.error?.message || err.message || res.statusText;
    throw new Error(`OpenRouter text failed (${res.status}): ${msg}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content?.trim() || '';
  if (!text) throw new Error('OpenRouter returned empty content');
  return text;
}

/** @deprecated alias */
export const generateOpenRouterJson = generateOpenRouterText;
