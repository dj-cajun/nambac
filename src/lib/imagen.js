import { apiUrl } from './apiConfig';
import { coverPrompt, resultPrompt } from '../../shared/imagePrompts.js';

const ADMIN_KEY = import.meta.env.VITE_ADMIN_API_KEY || '';

async function generateImage(prompt, { raw = true } = {}) {
  console.log('🎨 OpenRouter generating:', prompt.slice(0, 120), '...');

  const res = await fetch(apiUrl('/generate-image'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Key': ADMIN_KEY,
    },
    body: JSON.stringify({ prompt, raw }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Image generation failed (${res.status})`);
  }

  if (data.cost_usd != null) {
    console.log(`💰 OpenRouter cost: $${data.cost_usd} (${data.model})`);
  }

  return data.b64_json;
}

export async function generateCoverImage(quizTitle, category, description) {
  const prompt = coverPrompt({ title: quizTitle, description, category });
  return generateImage(prompt);
}

export async function generateResultImage(resultType, description) {
  const prompt = resultPrompt({ title: resultType, description });
  return generateImage(prompt);
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
