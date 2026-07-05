import { apiUrl } from './apiConfig';

const ADMIN_KEY = import.meta.env.VITE_ADMIN_API_KEY || '';

/** @deprecated Use api.generateQuizImages() — full Gemini + OpenRouter pipeline */
async function generateImageViaApi(prompt, { raw = true } = {}) {
  const res = await fetch(apiUrl('/generate-image'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Key': ADMIN_KEY,
    },
    body: JSON.stringify({ prompt, raw }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Image generation failed (${res.status})`);
  return data.b64_json;
}

export async function generateCoverImage(quizTitle, category, description) {
  const { coverPrompt } = await import('../../shared/imagePrompts.js');
  return generateImageViaApi(coverPrompt({ title: quizTitle, description, category }), { raw: true });
}

export async function generateResultImage(resultType, description, quizTitle, category) {
  const { resultPrompt } = await import('../../shared/imagePrompts.js');
  return generateImageViaApi(
    resultPrompt({ title: resultType, description, quizTitle, category }),
    { raw: true },
  );
}

export function base64ToFile(base64Str, filename) {
  const byteCharacters = atob(base64Str);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'image/png' });
  return new File([blob], filename, { type: 'image/png' });
}
