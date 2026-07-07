/**
 * Multiple Gemini API keys — rotate on 429 / quota errors.
 *
 * Env (server-only preferred):
 *   GEMINI_API_KEY, GEMINI_API_KEY_2
 *   or GEMINI_API_KEYS=key1,key2
 * Browser fallback: VITE_GEMINI_API_KEY (dev scripts only — not used on Vercel server)
 */

export function getGeminiKeys() {
  const fromList = (process.env.GEMINI_API_KEYS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const singles = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    ...(process.env.VERCEL ? [] : [process.env.VITE_GEMINI_API_KEY]),
  ].filter(Boolean);

  return [...new Set([...fromList, ...singles])];
}

export function getGeminiKey() {
  return getGeminiKeys()[0] || '';
}

export function isRetryableGeminiError(err) {
  const msg = String(err?.message || err).toLowerCase();
  const status = err?.status || err?.statusCode;
  return (
    status === 429
    || msg.includes('429')
    || msg.includes('quota')
    || msg.includes('rate limit')
    || msg.includes('resource exhausted')
    || msg.includes('too many requests')
  );
}

/**
 * Try fn(apiKey) with each key until one succeeds.
 * @template T
 * @param {(apiKey: string, index: number) => Promise<T>} fn
 */
export async function withGeminiKeys(fn) {
  const keys = getGeminiKeys();
  if (!keys.length) {
    throw new Error('GEMINI_API_KEY (or GEMINI_API_KEYS) is not configured');
  }

  let lastErr;
  for (let i = 0; i < keys.length; i += 1) {
    try {
      return await fn(keys[i], i);
    } catch (err) {
      lastErr = err;
      if (isRetryableGeminiError(err) && i < keys.length - 1) {
        console.warn(`[gemini] key #${i + 1} exhausted → trying key #${i + 2} (${err.message})`);
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}
