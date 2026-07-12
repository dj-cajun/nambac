import { getQuizBundle } from '../quizDb.js';
import { generateJsonViaLlm, parseJsonFromLlm } from '../../../shared/llmJson.js';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'OPTIONS') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { quizId, resultCode } = req.query;
  if (!quizId || resultCode === undefined) {
    return res.status(400).json({ error: 'quizId and resultCode are required' });
  }

  try {
    const bundle = await getQuizBundle(quizId);
    if (!bundle) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const code = parseInt(resultCode, 10);
    const result = bundle.results.find((r) => parseInt(r.result_code, 10) === code) || bundle.results[0];

    if (!result) {
      return res.status(404).json({ error: 'Result not found' });
    }

    const systemPrompt = `
You are a witty, trend-savvy AI companion that talks like a Gen Z from Sài Gòn (Vietnamese MZ style).
Your tone is playful, humorous, sometimes slightly roasty (cà khịa), but ultimately friendly and insightful.
Use popular Vietnamese Gen Z slangs naturally (e.g., 'thả thính', 'flex', 'cột sống', 'flop', 'ét ô ét', 'lụy', 'chầm kảm').
Do not use dry academic language. Do not output English unless it is slang.
You must output a JSON object containing the exact fields requested.
    `;

    const userPrompt = `
We have a quiz titled "${bundle.quiz.title}".
The user finished the quiz and got the result archetype: "${result.title}" (Type: "${result.type_name || ''}").
The standard description for this result is: "${result.description}".
The traits associated with this result are: ${JSON.stringify(result.traits || [])}.

Please provide a deeper AI analysis of this result for the user. Return a JSON object with the following fields:
1. "detailedAnalysis": A paragraph (3-4 sentences) explaining why they got this, pointing out their unique behaviors or habits in a witty, humorous way (add some light roasts/cà khịa).
2. "compatibilityTip": 1-2 funny sentences on how they behave in relationships or friendships (e.g., "In a relationship, you are the one who...").
3. "careerVibe": 1-2 sentences on their work/study vibe (e.g., "Your study/work method is basically...").
4. "tagline": A punchy 1-sentence summary or slang.

Ensure the output is 100% valid JSON matching the system instructions.
    `;

    const { text } = await generateJsonViaLlm({
      system: systemPrompt,
      user: userPrompt,
      temperature: 0.9,
      label: 'aiInterpretResult',
    });

    const parsed = parseJsonFromLlm(text);
    return res.status(200).json(parsed);
  } catch (err) {
    console.error('[AI Interpret Result]', err);
    return res.status(500).json({ error: 'Failed to generate AI analysis', details: err.message });
  }
}
