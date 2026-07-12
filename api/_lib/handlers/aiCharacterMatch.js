import { generateJsonViaLlm, parseJsonFromLlm } from '../../../shared/llmJson.js';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST' && req.method !== 'OPTIONS') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const mbti = req.query?.mbti || req.body?.mbti || 'ENFP';
  const traits = req.query?.traits || req.body?.traits || '';

  try {
    const systemPrompt = `
You are a pop-culture and anime geek AI who speaks Sài Gòn Gen Z slang in Vietnamese.
You specialize in typing anime, game, and movie characters.
Your tone is funny, witty, and highly relatable.
    `;

    const userPrompt = `
Based on the user's personality profile (MBTI/VBTI: "${mbti}", Traits: "${traits}"), match them to exactly 3 popular pop-culture, anime, or gaming characters (e.g., Luffy from One Piece, Naruto, Iron Man, Florentino from Liên Quân Mobile).

Return a JSON object containing a "matches" array of exactly 3 objects. Each object must have:
1. "name": the character's name.
2. "franchise": the show, game, or franchise they are from (e.g. "One Piece", "Liên Quân Mobile").
3. "matchRate": an integer compatibility score from 0 to 100.
4. "reason": 2 sentences explaining why they match in a witty, MZ Sài Gòn style.

Ensure the output is 100% valid JSON matching the instructions.
    `;

    const { text } = await generateJsonViaLlm({
      system: systemPrompt,
      user: userPrompt,
      temperature: 0.9,
      label: 'aiCharacterMatch',
    });

    const parsed = parseJsonFromLlm(text);
    return res.status(200).json(parsed);
  } catch (err) {
    console.error('[AI Character Match]', err);
    return res.status(500).json({ error: 'Failed to generate character matches', details: err.message });
  }
}
