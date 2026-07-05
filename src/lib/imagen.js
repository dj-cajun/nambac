import { apiUrl } from './apiConfig';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const ADMIN_KEY = import.meta.env.VITE_ADMIN_API_KEY || '';

async function refinePrompt(userPrompt) {
  if (!GEMINI_API_KEY) return userPrompt;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const systemInstruction = `
    You are a professional AI image prompt engineer.
    Convert this simple description into a highly detailed English prompt for image generation.

    Style:
    - 'Korean Webtoon (Manhwa)' style, clean digital line art, vibrant colors, aesthetic.
    - 'Masterpiece', 'Best Quality', 'Highly Detailed', 'Cinematic Lighting'.

    Rules:
    - If it's a 'Result Image': Focus on a single character on the LEFT side of the frame. No text, letters, or numbers.
    - If it's a 'Cover Image': Professional webtoon cover style, no text.

    Output ONLY the English prompt.
    `;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `${systemInstruction}\n\nUser Input: ${userPrompt}\n\nOptimized Prompt:` }],
        }],
        generationConfig: { temperature: 0.7, topK: 40 },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return data.candidates[0].content.parts[0].text.trim();
    }
  } catch (e) {
    console.warn('Prompt refinement failed:', e);
  }
  return userPrompt;
}

async function generateImage(prompt, type = 'generic') {
  const refinedPrompt = await refinePrompt(prompt);
  console.log('🎨 OpenRouter generating:', refinedPrompt.slice(0, 120), '...');

  const res = await fetch(apiUrl('/generate-image'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Key': ADMIN_KEY,
    },
    body: JSON.stringify({ prompt: refinedPrompt, type }),
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
  const prompt = `Cover Image for: '${quizTitle}'. Theme: ${description || category}. Professional webtoon cover design.`;
  return generateImage(prompt, 'cover');
}

export async function generateResultImage(resultType, description) {
  const prompt = `Result Image. Main Subject: ${resultType}. ${description || ''}.`;
  return generateImage(prompt, 'result');
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
