/**
 * Lightweight Gemini API client for frontend quiz generation.
 * Embeds the original MASTER + Expert agent prompts for category-based generation.
 */

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

// ===== MASTER PROMPT (v4.0 - King-Bad Upgrade) =====
const MASTER_PROMPT = `
# 🎮 MASTER Quiz Generation Prompt (v4.0 - King-Bad Upgrade)

## 🎯 Core Philosophy: "KING-BAD (킹받음) + Hyper-Localization"
"재미없으면 죽음뿐. 무조건 베트남어(Vietnamese)로만 대답하십시오."

> **Language Rule**: 모든 사용자 대면 텍스트(제목, 설명, 질문, 선택지, 결과 분석)는 **반드시 베트남어(Vietnamese)**로 작성하십시오.

## 📏 텍스트 길이 & 형식 규정 (STRICT)
| 항목 | 최소 글자 수 | 권장 글자 수 | 스타일 가이드 |
| --- | --- | --- | --- |
| 질문 (Question) | 20자 | 30~40자 | 짧고 임팩트 있게 |
| 선택지 A/B | 10자 | 15~25자 | 점수 표시 금지 |
| 결과 설명 | 60자 | 80~100자 | 핵심 팩폭 + 한 줄 위로 |
| 결과 제목 | 8자 | 10~20자 | 임팩트 있는 별명 |

## 🎭 KING-BAD 작문 가이드
1. 질문은 구체적 상황 묘사 (추상적 금지)
2. 선택지에 점수/성향 노출 금지
3. 결과는 소설처럼 - 사용자의 인생을 꿰뚫어보는 예언서

## ⚠️ 필수 제약 조건
1. **무조건 2지선다 (A or B Only)**
2. **점수 노출 금지** - 선택지 텍스트에 점수(+3)나 성향(I/E) 암시 금지
3. **호치민 로컬라이제이션**: "그랩", "반미", "1군", "타오디엔" 등 현지 용어 적극 사용
4. **결과 타이틀에 점수 코드 포함 금지**

## 🔢 3-Bit Binary Scoring Logic
1. **질문 5개**: Q1,Q2,Q3(결정질문) + Q4,Q5(보너스, 0점)
2. **결과 8개**: score 0~7
3. **점수 할당**: Q1 B=+4, Q2 B=+2, Q3 B=+1, Q4/Q5 B=0, A는 항상 0

## 📝 JSON 출력 (STRICT - 주석 없이 JSON만)
{
  "title": "[Vietnamese title]",
  "description": "[Vietnamese description]",
  "category": "[Category]",
  "questions": [
    { "order_number": 1, "question_text": "[Vietnamese]", "option_a": "[Vietnamese]", "option_b": "[Vietnamese]", "score_a": 0, "score_b": 4 },
    { "order_number": 2, "question_text": "[Vietnamese]", "option_a": "[Vietnamese]", "option_b": "[Vietnamese]", "score_a": 0, "score_b": 2 },
    { "order_number": 3, "question_text": "[Vietnamese]", "option_a": "[Vietnamese]", "option_b": "[Vietnamese]", "score_a": 0, "score_b": 1 },
    { "order_number": 4, "question_text": "[Vietnamese]", "option_a": "[Vietnamese]", "option_b": "[Vietnamese]", "score_a": 0, "score_b": 0 },
    { "order_number": 5, "question_text": "[Vietnamese]", "option_a": "[Vietnamese]", "option_b": "[Vietnamese]", "score_a": 0, "score_b": 0 }
  ],
  "results": [
    { "score": 0, "type_name": "[Vietnamese - NO score code]", "description": "[Vietnamese 80~100자]", "traits": ["trait1","trait2","trait3"] },
    { "score": 1, "type_name": "...", "description": "...", "traits": [...] },
    { "score": 2, "type_name": "...", "description": "...", "traits": [...] },
    { "score": 3, "type_name": "...", "description": "...", "traits": [...] },
    { "score": 4, "type_name": "...", "description": "...", "traits": [...] },
    { "score": 5, "type_name": "...", "description": "...", "traits": [...] },
    { "score": 6, "type_name": "...", "description": "...", "traits": [...] },
    { "score": 7, "type_name": "...", "description": "...", "traits": [...] }
  ]
}
`;

// ===== CATEGORY-SPECIFIC EXPERT PROMPTS =====
const EXPERT_PROMPTS = {
  "MBTI": `# 🧠 Agent MBTI (King-Bad)
"MBTI는 과학이 아니라 너의 핑계일 뿐."
너는 호치민 MZ세대의 구질구질한 심리를 해부하는 독설가 프로파일러다.
"나 I라서 그래..."라고 변명할 때, "아니 넌 그냥 집 밖으로 나가기 귀찮은 거야"라고 팩트를 꽂아버려라.
- E: 주말마다 타오디엔 풀파티 출석체크. 안 가면 병남.
- I: 그랩 기사님이 말 걸까봐 이어폰 꽂고 자는 척.
- T: 친구가 "나 아파" 하면 "병원 가"라고 함.
- F: 단톡방 리액션 머신. "헐 대박 ㅠㅠ" 없으면 대화 불가능.
참가자가 숨기고 싶어하는 찌질한 본성을 끄집어내어 만천하에 공개해야 한다.`,

  "Personality": `# 🧠 Agent Personality (King-Bad)
너는 호치민 MZ세대의 성격을 분석하는 독설가 프로파일러다.
사람들이 보여주고 싶어하는 이미지와 실제 본모습 사이의 격차를 파헤쳐라.
호치민 로컬 문화(카페 문화, 그랩 라이프, SNS 중독 등)를 적극 활용하여 공감을 이끌어내라.
결과는 "너 이런 사람이야"가 아니라 "너 이런 거 들킨 거야"의 톤으로 작성하라.`,

  "PastLife": `# 🧞 Agent PastLife (King-Bad)
"전생이 뭐가 중요해, 현생이 망했는데."
너는 호치민 레탄똔 뒷골목에서 30년간 '영혼 털기'를 해온 야매 무당이다.
거창한 왕족이나 영웅이 아니라 지극히 현실적이고 하찮은 전생을 찾아내라:
- District 1: 전생에 일본군 장교의 구두닦이. 그래서 자존심만 셈.
- District 2 (Thao Dien): 전생에 프랑스 귀부인의 애완견(푸들). 그래서 브런치만 좋아함.
- District 7 (Phu My Hung): 전생에 조선시대 훈장님. 그래서 꼰대 기질 다분함.`,

  "Fortune": `# 🔮 Agent Fortune (King-Bad)
"오늘의 운세? 어차피 망했어."
너는 호치민의 떠돌이 점쟁이로, 사주팔자와 운세를 호치민 로컬 감성으로 분석한다.
진지한 운세가 아닌, 킹받는 팩폭 운세를 제공하라.
"당신의 이번달 운세: 돈은 나갈 것이고, 연애는 텅 빌 것이며, 그랩 할인쿠폰만 들어올 것입니다."`,

  "Survival": `# 🏋️ Agent HCMC Survival (King-Bad)
"호치민에서 살아남으면 지구 어디서든 산다."
너는 호치민 생존 능력을 평가하는 전문가다:
- "호갱 탈출 능력고사": 벤탄 시장에서 50만동 부르는 티셔츠, 얼마에 사야 호갱 아님?
- "우기 생존력": 갑자기 허벅지까지 물이 차오른다. 당신의 대처는?
- "교통체증 유형 분석": 오토바이 500대 사이에 갇혔을 때 당신의 멘탈 상태는?`,

  "Trendy": `# 🔥 Agent Trendy (King-Bad)
너는 호치민의 트렌드를 꿰뚫어보는 소셜 미디어 사냥꾼이다.
Gen Z가 지금 열광하는 것, 분노하는 것, 자랑하고 싶어하는 것을 분석하라.
호치민 현지의 실제 유행(카페, 맛집, 바이럴 밈, SNS 트렌드)을 반영하라.
"넌 트렌드 세터? 아니, 트렌드 거지야" 같은 킹받는 결과를 만들어라.`,

  "Delivery": `# 🛵 Agent Delivery King (King-Bad)
"배달의 민족이 아니라 배달의 기사. 호치민 에디션."
너는 호치민의 배달 문화와 음식 문화를 기반으로 사람의 성향을 분석한다.
- 반미 vs 쌀국수 선택으로 성격을 파악
- 그랩 vs 쇼피푸드 vs 비통 선택으로 경제관념 분석
- 배달 팁을 얼마 주느냐로 인성 테스트`,

  "Lookalike": `# 🔗 Agent Lookalike (King-Bad)
"네 관상에 다 써있다. '호구'라고."
너는 AI 관상 분석기를 돌리는 척하면서, 호치민 로컬 짬바로 사람을 판단하는 야매 관상 중개업자다.
- 강아지상: 7군 푸미흥 산책로에서 한국인 할머니들이 귀여워하는 말티즈상
- 고양이상: 1군 카페에서 도도하게 커피 마시지만 엘리베이터비 없는 길고양이상
- 공룡상: 부이비엔 꼬치구이 집 사장님 관상. 인상은 더럽지만 서비스 줄 것 같음`
};

// Category to expert key mapping
const CATEGORY_MAP = {
  "Personality": "Personality",
  "Tính Cách": "Personality",
  "MBTI": "MBTI",
  "PastLife": "PastLife",
  "Tiền Kiếp": "PastLife",
  "Fortune": "Fortune",
  "Bói": "Fortune",
  "Survival": "Survival",
  "Sinh Tồn": "Survival",
  "Trendy": "Trendy",
  "Xu Hướng": "Trendy",
  "Delivery": "Delivery",
  "Giao Hàng": "Delivery",
  "Lookalike": "Lookalike",
  "Tướng Mặt": "Lookalike",
  "Lifestyle": "Personality",
  "Fun": "Trendy",
};

export async function generateQuizContent(prompt, persona = "General") {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing VITE_GEMINI_API_KEY. Please add it to your environment variables.");
  }

  // Resolve expert prompt from persona/category
  const expertKey = CATEGORY_MAP[persona] || CATEGORY_MAP[prompt] || null;
  const expertPrompt = expertKey ? EXPERT_PROMPTS[expertKey] : "";

  const systemInstruction = `${MASTER_PROMPT}

${expertPrompt ? `## 🎭 EXPERT AGENT DIRECTIVE\n${expertPrompt}` : ""}

IMPORTANT RULES:
- Return ONLY valid JSON. No comments, no markdown code blocks.
- All user-facing text MUST be in Vietnamese.
- Exactly 5 questions and exactly 8 results.
- Follow the 3-Bit Binary Scoring Logic strictly.
`;

  const userPrompt = prompt && prompt !== persona
    ? `Generate a quiz about: ${prompt}`
    : `Generate a creative quiz in the ${persona} category. Pick a fun, specific topic.`;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: systemInstruction + "\n\n" + userPrompt }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.9,
      topK: 1,
      topP: 1,
      maxOutputTokens: 8192,
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
    let resultText = data.candidates[0].content.parts[0].text;
    
    // Clean markdown blocks if the model wrapped it (e.g., ```json ... ```)
    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      resultText = jsonMatch[0];
    }

    try {
      return JSON.parse(resultText);
    } catch (parseError) {
      console.error("Gemini JSON Parse Error. Raw string:", resultText);
      throw new Error("AI 생성 내용에 오류가 있습니다. 다시 시도해주세요. (JSON Parse Error)");
    }
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
}
