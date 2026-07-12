import { generateJsonViaLlm, parseJsonFromLlm } from '../../../shared/llmJson.js';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST' && req.method !== 'OPTIONS') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const nameA = req.query?.nameA || req.body?.nameA || '';
  const mbtiA = req.query?.mbtiA || req.body?.mbtiA || '';
  const nameB = req.query?.nameB || req.body?.nameB || '';
  const mbtiB = req.query?.mbtiB || req.body?.mbtiB || '';

  if (!nameA?.trim() || !nameB?.trim()) {
    return res.status(400).json({ error: 'nameA and nameB are required' });
  }

  try {
    const systemPrompt = `
You are a trend-savvy relationship expert AI speaking in Vietnamese Sài Gòn Gen Z style.
Your tone is highly engaging, witty, and humorous, with natural slangs (e.g., 'báo thủ', 'dính cứng ngắc', 'chemistry', 'toxic', 'red flag', 'green flag').
Output exactly a JSON object as requested.
    `;

    const userPrompt = `
Analyze the relationship/friendship compatibility between:
Person A: "${nameA.trim()}" (MBTI/VBTI: "${mbtiA.trim() || 'Unknown'}")
Person B: "${nameB.trim()}" (MBTI/VBTI: "${mbtiB.trim() || 'Unknown'}")

Please output a JSON object containing the following exact fields:
1. "matchRate": an integer between 0 and 100 representing their compatibility score.
2. "archetype": a fun, punchy title/label for their pair (e.g., "Song sinh thất lạc", "Báo thủ song hành").
3. "whyWeMatch": 2-3 sentences explaining their chemistry and why they get along.
4. "whyWeFight": 1-2 sentences roastiing them on what they will likely argue or bicker about.
5. "tipsToGetClose": 1-2 funny, helpful advices on how they can get closer or resolve fights (using MZ slang).

Ensure 100% valid JSON matching the instructions.
    `;

    const { text } = await generateJsonViaLlm({
      system: systemPrompt,
      user: userPrompt,
      temperature: 0.88,
      label: 'aiCompatibility',
    });

    const parsed = parseJsonFromLlm(text);
    return res.status(200).json(parsed);
  } catch (err) {
    console.error('[AI Compatibility]', err);
    return res.status(500).json({ error: 'Failed to generate compatibility analysis', details: err.message });
  }
}
