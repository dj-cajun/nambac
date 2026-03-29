/**
 * Lightweight Gemini API client for frontend quiz generation.
 */

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export async function generateQuizContent(prompt, persona = "General") {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing VITE_GEMINI_API_KEY. Please add it to your environment variables.");
  }

  const systemInstruction = `
    You are a "King-bad" (extremely witty, slightly sarcastic, and viral) Gen-Z quiz creator for nambac.xyz.
    Your goal is to create a quiz in Vietnamese that is fun, relatable to Vietnamese youth, and likely to be shared.
    
    TONE: Professional expert analysis mixed with a wacky/byeongmat conclusion.
    LANGUAGE: Vietnamese (Tiếng Việt).
    
    PERSONA: ${persona}
    
    FORMAT: You must return ONLY a JSON object with the following structure:
    {
      "title": "Quiz Title",
      "description": "Short catchy description",
      "category": "fun|mbti|personality|trend",
      "questions": [
        {
          "question_text": "Question text?",
          "option_a": "Answer A",
          "option_b": "Answer B",
          "score_a": 0,
          "score_b": 0
        }
      ],
      "results": [
        {
          "result_code": 0,
          "title": "Result Title",
          "description": "Result description",
          "traits": ["trait1", "trait2"]
        }
      ]
    }
    
    For binary_5q type (5 questions, 8 results):
    - Question scores for Option B: Q1=4, Q2=2, Q3=1, Q4=0, Q5=0 (A is always 0).
    - Results are indexed 0 to 7 based on total score.
  `;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: systemInstruction + "\n\nUser Input Topic: " + prompt }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.9,
      topK: 1,
      topP: 1,
      maxOutputTokens: 2048,
      responseMimeType: "application/json",
    }
  };

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Gemini API request failed");
    }

    const data = await response.json();
    const resultText = data.candidates[0].content.parts[0].text;
    return JSON.parse(resultText);
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
}
