const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Prompt Refinement using Gemini
async function refinePrompt(userPrompt) {
  if (!GEMINI_API_KEY) return userPrompt;
  
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const systemInstruction = `
    You are a professional AI image prompt engineer. 
    Convert this simple description into a highly detailed English prompt for Google Imagen.
    
    Style:
    - 'Korean Webtoon (Manhwa)' style, clean digital line art, vibrant colors, aesthetic.
    - 'Masterpiece', 'Best Quality', 'Highly Detailed', 'Cinematic Lighting'.
    
    Rules:
    - If it's a 'Result Image': Focus on a single character on the LEFT side of the frame. The right side should have background elements but NO TEXT, LETTERS, OR NUMBERS.
    - If it's a 'Cover Image': Professional webtoon cover style.
    
    Output ONLY the English prompt.
    `;
    
    const payload = {
      contents: [{
        parts: [{ text: `${systemInstruction}\n\nUser Input: ${userPrompt}\n\nOptimized Prompt:` }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40
      }
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      return data.candidates[0].content.parts[0].text.trim();
    }
  } catch (e) {
    console.warn("Prompt refinement failed:", e);
  }
  return userPrompt;
}

// Generate Image using Imagen 4.0 Fast
async function generateImage(prompt) {
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is missing");

  // Refine the prompt first
  const refinedPrompt = await refinePrompt(prompt);
  console.log("🎨 Imagen generating with prompt:", refinedPrompt);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-fast-generate-001:predict?key=${GEMINI_API_KEY}`;
  
  const payload = {
    instances: [{ prompt: refinedPrompt }],
    parameters: {
      sampleCount: 1,
      aspectRatio: "1:1",
      safetyFilterLevel: "BLOCK_ONLY_HIGH"
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Imagen error:", errText);
    
    // Fallback to standard if fast fails
    const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${GEMINI_API_KEY}`;
    const fallbackRes = await fetch(fallbackUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!fallbackRes.ok) {
        throw new Error(`Imagen 4.0 generation failed: ${fallbackRes.status}`);
    }
    const fallbackData = await fallbackRes.json();
    if (fallbackData.predictions && fallbackData.predictions.length > 0) {
        return fallbackData.predictions[0].bytesBase64Encoded;
    }
    throw new Error("No predictions returned from fallback Imagen");
  }

  const data = await res.json();
  if (data.predictions && data.predictions.length > 0) {
    return data.predictions[0].bytesBase64Encoded;
  }
  
  throw new Error("No predictions returned from Imagen");
}

export async function generateCoverImage(quizTitle, category, description) {
  const prompt = `Cover Image for: '${quizTitle}'. Theme: ${description || category}. Professional webtoon cover design.`;
  return await generateImage(prompt);
}

export async function generateResultImage(resultType, description) {
  const prompt = `Result Image. Main Subject: ${resultType}. Position character ON THE LEFT. No Text. ${description}.`;
  return await generateImage(prompt);
}
// Utility to convert b64 to File object
export function base64ToFile(base64Str, filename) {
  const byteCharacters = atob(base64Str);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], {type: 'image/png'});
  return new File([blob], filename, {type: 'image/png'});
}
