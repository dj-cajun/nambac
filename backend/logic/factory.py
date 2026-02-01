import os
import sys
import json
import asyncio
import httpx
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv()


# n8n 연동을 위해 로그는 stderr로 출력 (stdout은 JSON 데이터 전용)
def log(message):
    sys.stderr.write(f"[System] {message}\n")
    sys.stderr.flush()


class NambacFactory:
    def __init__(self):
        # OpenRouter 설정
        self.api_key = os.getenv("OPENCODE_API_KEY")
        self.base_url = "https://openrouter.ai/api/v1"
        self.base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

        # 모델 설정
        self.model = "google/gemini-2.0-flash-001"

        if not self.api_key:
            log("❌ Error: OPENCODE_API_KEY not found in env.")
            sys.exit(1)

    def load_sop(self, role):
        """SOP(프롬프트) 파일을 읽어옵니다."""
        path = os.path.join(self.base_path, "agents_nambac", "prompts", f"{role}.md")
        try:
            with open(path, "r", encoding="utf-8") as f:
                return f.read()
        except FileNotFoundError:
            log(f"Error: SOP file not found at {path}")
            sys.exit(1)

    async def call_agent(self, agent_name, system_prompt, user_content):
        """개별 에이전트를 실행하는 공통 함수 (httpx 사용)"""
        log(f"🤖 Agent '{agent_name}' working...")

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "HTTP-Referer": "https://nambac.xyz",  # OpenRouter Requirement
            "X-Title": "Nambac Factory",  # OpenRouter Requirement
            "Content-Type": "application/json",
        }

        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content},
            ],
            "response_format": {"type": "json_object"},
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                response = await client.post(
                    f"{self.base_url}/chat/completions", headers=headers, json=payload
                )
                response.raise_for_status()

                data = response.json()
                content = data["choices"][0]["message"]["content"]
                return json.loads(content)

            except httpx.HTTPStatusError as e:
                log(f"❌ API Error in {agent_name}: {e.response.text}")
                return {}
            except Exception as e:
                log(f"❌ Error in {agent_name}: {str(e)}")
                return {}

    async def run_workflow(self, topic):
        log(f"🚀 Starting Workflow for topic: {topic}")

        # 1. SOP 로드
        sop_director = self.load_sop("director_j_bad")
        sop_architect = self.load_sop("visual_architect")
        sop_analyst = self.load_sop("report_analyst")

        # ---------------------------------------------------------
        # STEP 1: Director Agent (기획)
        # ---------------------------------------------------------
        director_task = f"""
        주제 '{topic}'에 대한 퀴즈 컨셉을 기획하세요.
        반드시 JSON 형식으로 출력해야 하며, 키값은 'title', 'description', 'viral_hook', 'category' 입니다.
        category는 'Trendy', 'Survival', 'Personality' 중 하나로 선정하세요.
        """
        director_output = await self.call_agent(
            "Director J-Bad", sop_director, director_task
        )

        if not director_output:
            log("Critical Error: Director failed to generate concept.")
            return

        # Ensure category exists
        if "category" not in director_output:
            director_output["category"] = "Trendy"

        log(f"✅ Concept Created: {director_output.get('title')}")

        # ---------------------------------------------------------
        # STEP 2: Report Analyst (성향 정의)
        # 8가지 성향(Types)을 먼저 정의해야 질문을 설계할 수 있음
        # ---------------------------------------------------------
        analyst_task = f"""
        [Director's Concept]: {json.dumps(director_output, ensure_ascii=False)}
        
        위 기획을 바탕으로 8가지 결과 유형(Archetypes)을 설계하세요.
        3개의 Binary 축(Axis)에 의해 결정되는 8가지 조합(000 ~ 111)입니다.
        
        응답은 반드시 아래 JSON 구조를 따라야 합니다:
        {{
            "results": [
                {{
                    "score": 0,
                    "type_name": "Type 1 이름",
                    "description": "상세 설명 (병맛/전문적 톤)",
                    "traits": ["키워드1", "키워드2"]
                }},
                ... (Score 0 to 7)
            ]
        }}
        """
        analyst_res = await self.call_agent("Report Analyst", sop_analyst, analyst_task)

        results_data = []
        if isinstance(analyst_res, dict):
            results_data = (
                analyst_res.get("results") or analyst_res.get("quiz_results") or []
            )
        elif isinstance(analyst_res, list):
            results_data = analyst_res

        if len(results_data) != 8:
            log(f"⚠️ Warning: Analyst generated {len(results_data)} types. Expected 8.")

        # ---------------------------------------------------------
        # STEP 3: Visual Architect (문제 출제)
        # 정의된 성향을 가르는 3개의 결정적 질문(Binary Switch) 설계
        # ---------------------------------------------------------
        architect_task = f"""
        [Director's Concept]: {json.dumps(director_output, ensure_ascii=False)}
        [Analyst's Archetypes]: {json.dumps(results_data, ensure_ascii=False)}
        
        위 8가지 성향을 구분하기 위한 '3-Bit Binary Scoring' 질문 3개와 보너스 질문 2개를 출제하세요.
        
        [필수 규칙]
        1. 총 5문항 출제.
        2. Q1, Q2, Q3는 반드시 아래 점수 규칙을 따를 것 (성향 결정 문항).
           - Q1: score_b = 1 ($2^0$) -> Axis 1 결정
           - Q2: score_b = 2 ($2^1$) -> Axis 2 결정
           - Q3: score_b = 4 ($2^2$) -> Axis 3 결정
        3. Q4, Q5는 재미용 보너스 문항 (score_b = 0).
        4. 모든 score_a는 0으로 고정.
        5. image_prompt는 각 질문의 상황을 묘사하는 구체적인 프롬프트여야 함. (단조로움 방지)
        
        응답은 반드시 아래 JSON 구조를 따라야 합니다:
        {{
            "questions": [
                {{
                    "order_number": 1,
                    "question_text": "질문 내용",
                    "option_a": "선택지 A",
                    "option_b": "선택지 B",
                    "score_a": 0,
                    "score_b": 1,
                    "image_prompt": "Cinematic shot of [상황 설명], neon lighting, detailed background"
                }},
                ...
            ]
        }}
        """
        architect_res = await self.call_agent(
            "Visual Architect", sop_architect, architect_task
        )

        questions_data = []
        if isinstance(architect_res, dict):
            questions_data = (
                architect_res.get("questions") or architect_res.get("items") or []
            )
        elif isinstance(architect_res, list):
            questions_data = architect_res

        # ---------------------------------------------------------
        # STEP 4: Validation & Finalize (검증 및 병합)
        # ---------------------------------------------------------

        # 데이터 검증 로직 (3-Bit Rule)
        is_valid = True
        if len(questions_data) < 3:
            log("❌ Critical: Less than 3 questions generated.")
            is_valid = False
        else:
            # Q1, Q2, Q3 점수 강제 보정 (AI 실수를 방지하기 위한 안전장치)
            try:
                # 1. Score Enforcement
                questions_data[0]["score_b"] = 1
                questions_data[1]["score_b"] = 2
                questions_data[2]["score_b"] = 4

                # 나머지 문항 0점 처리
                for q in questions_data[3:]:
                    q["score_b"] = 0

                # 모든 문항 score_a 0점 처리
                for q in questions_data:
                    q["score_a"] = 0

                # 2. Schema Enforcement (Consistency)
                # master.md에 정의된 questions 배열 구조를 강제로 맞춤
                for idx, q in enumerate(questions_data):
                    q["order_number"] = idx + 1
                    # Ensure all keys exist
                    q.setdefault("question_text", "질문 내용이 누락되었습니다.")
                    q.setdefault("option_a", "A")
                    q.setdefault("option_b", "B")
                    q.setdefault(
                        "image_prompt", "Abstract background, pink and black theme"
                    )

                log("✅ Consistency Check Passed: Scores & Schema Enforced.")
            except IndexError:
                log("❌ Error during score enforcement.")
                is_valid = False

        final_quiz = {
            "meta": director_output,
            "questions": questions_data,
            "results": results_data,
        }

        # 결과 검증
        if not final_quiz["questions"] or not final_quiz["results"]:
            log(
                f"⚠️ Warning: Missing Data. Questions: {len(questions_data)}, Results: {len(results_data)}"
            )

        return final_quiz


# ---------------------------------------------------------
# 실행 진입점 (CLI / n8n)
# ---------------------------------------------------------
if __name__ == "__main__":
    # n8n 등 외부에서 인자로 주제를 전달받음 (기본값 설정)
    topic_arg = sys.argv[1] if len(sys.argv) > 1 else "호치민 1군 그랩 기사 전생 체험"

    factory = NambacFactory()

    # 비동기 루프 실행
    result = asyncio.run(factory.run_workflow(topic_arg))

    # 최종 결과는 stdout으로 출력 (n8n이 캡처하는 부분)
    print(json.dumps(result, ensure_ascii=False, indent=2))
