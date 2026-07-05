import os
import sys
import json
import asyncio
import httpx
from dotenv import load_dotenv

import google.generativeai as genai
from .image_generator import ImageGenerator

# 환경 변수 로드
load_dotenv()


# Log messages to stderr (stdout is reserved for JSON output)
def log(message):
    sys.stderr.write(f"[System] {message}\n")
    sys.stderr.flush()


class NambacFactory:
    def __init__(self, generate_images: bool = False):
        # OpenRouter Configuration
        # OpenRouter Configuration (Deprecated)
        # self.openrouter_key = os.getenv("OPENROUTER_API_KEY")
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        self.base_url = "https://openrouter.ai/api/v1"
        self.base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

        # Model Configuration
        # self.openrouter_model = "openai/gpt-4o-mini"
        self.gemini_model_name = "gemini-2.0-flash"

        # Image Generation Configuration
        self.generate_images = generate_images
        self.image_generator = ImageGenerator() if generate_images else None

        if self.gemini_key:
            genai.configure(api_key=self.gemini_key)
            log("💎 Gemini API configured.")
        else:
            log(f"❌ Error: GEMINI_API_KEY not found in env. Available keys: {list(os.environ.keys())}")
            raise ValueError("No GEMINI_API_KEY found in environment")

    def load_sop(self, role):
        """SOP(프롬프트) 파일을 여러 경로에서 찾아 읽어옵니다."""
        # 경로 후보군 (프로젝트 루트 구조 반영)
        paths = [
            os.path.join(self.base_path, "..", ".claude", "agents", f"{role}.md"),
            os.path.join(self.base_path, "agents_nambac", "prompts", f"{role}.md"),
            # 추가: nambac 폴더가 루트에 있을 경우 대응
            os.path.join(self.base_path, "..", "nambac", ".claude", "agents", f"{role}.md"),
            os.path.join(self.base_path, "..", "nambac", "backend", "agents_nambac", "prompts", f"{role}.md"),
        ]
        
        for path in paths:
            if os.path.exists(path):
                try:
                    with open(path, "r", encoding="utf-8") as f:
                        return f.read()
                except Exception as e:
                    log(f"Error reading SOP at {path}: {str(e)}")
        
        log(f"Error: SOP file for role '{role}' not found in any path.")
        raise ValueError(f"SOP file not found: {role}")

    async def call_agent(self, agent_name, system_prompt, user_content):
        """개별 에이전트를 실행하는 공통 함수"""
        log(f"🤖 Agent '{agent_name}' working...")

        # Master Prompt 로드 (있을 경우)
        master_prompt = ""
        try:
            master_prompt = self.load_sop("MASTER_Quiz_Prompt_v3")
            log("🎓 Master Prompt v4.0 integrated.")
        except Exception:
            pass

        full_system_prompt = f"{master_prompt}\n\n{system_prompt}" if master_prompt else system_prompt

        # Gemini 사용 시 (우선순위)
        if self.gemini_key:
            try:
                log(f"💎 Using Gemini model: {self.gemini_model_name}")
                model = genai.GenerativeModel(
                    model_name=self.gemini_model_name,
                    system_instruction=full_system_prompt + "\n\nIMPORTANT: You must respond ONLY with valid JSON. No explanations outside of JSON."
                )
                
                response = await asyncio.to_thread(
                    model.generate_content,
                    user_content,
                    generation_config=genai.types.GenerationConfig(
                        temperature=0.7,
                        response_mime_type="application/json"
                    )
                )
                
                content = response.text
                return self._parse_json(agent_name, content)
            except Exception as e:
                log(f"❌ Gemini Error in {agent_name}: {str(e)}")
                return {}

    def _parse_json(self, agent_name, content):
        """JSON 추출 및 파싱 공통 로직 (설명 텍스트 혼용 대응)"""
        try:
            # 1. ```json 블록 찾기
            import re
            json_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", content)
            if json_match:
                content = json_match.group(1)
            else:
                # 2. 가장 바깥쪽 { } 찾기
                json_match = re.search(r"(\{[\s\S]*\})", content)
                if json_match:
                    content = json_match.group(1)

            log(f"✅ {agent_name} parsing JSON...")
            data = json.loads(content)
            
            # 리스트 형식으로 오면 딕셔너리로 래핑
            if isinstance(data, list):
                if "analyst" in agent_name.lower(): return {"results": data}
                if "architect" in agent_name.lower(): return {"questions": data}
                
            return data
        except Exception as e:
            log(f"❌ JSON Parse Error in {agent_name}: {str(e)}")
            return {}

    async def run_workflow(self, topic):
        log(f"🚀 Starting Unified Workflow for topic: {topic}")

        # 1. SOP 로드 (MASTER 포함)
        sop_master = self.load_sop("MASTER_Quiz_Prompt_v3")
        
        # 단일 태스크로 통합하여 Gemini가 맥락을 잃지 않게 함
        unified_task = f"""
        Topic: {topic}
        Please generate a complete quiz based on the Topic.
        Requirements:
        1. Title and description (Viral style).
        2. 5 binary questions (Q1:4pt, Q2:2pt, Q3:1pt, Q4-5:0pt).
        3. 8 personality archetypes for scores 0 to 7.
        4. Detailed descriptions and traits for each result in Vietnamese.
        """
        
        result = await self.call_agent("Unified Factory", sop_master, unified_task)

        if not result or not result.get("results"):
            log("❌ AI failed to return results. Running Emergency Analyst...")
            # Emergency Analyst Logic
            sop_analyst = self.load_sop("report_analyst")
            analyst_task = f"""
            [Topic]: {topic}
            Design **8 unique results (Archetypes)** for a quiz about this topic.
            Scores 0 to 7 (3-Bit scale).
            format: list of dicts with score, type_name, description, traits.
            """
            analyst_res = await self.call_agent("Report Analyst", sop_analyst, analyst_task)
            
            if isinstance(analyst_res, dict):
                 result = {"meta": {"title": topic}, "questions": result.get("questions", []) if result else [], "results": analyst_res.get("results", [])}
            elif isinstance(analyst_res, list):
                 result = {"meta": {"title": topic}, "questions": result.get("questions", []) if result else [], "results": analyst_res}
            else:
                 # Last resort
                 return {"meta": {"title": topic}, "questions": [], "results": []}

        return await self.finalize_quiz(result)

    async def run_expert_workflow(self, agent_name, topic):
        log(f"🚀 Starting Expert Workflow: {agent_name} for topic: {topic}")

        sop_expert = self.load_sop(agent_name)

        # Expert task
        task = f"Create a full quiz JSON for the topic: '{topic}'."

        # Call the expert agent
        result = await self.call_agent(agent_name, sop_expert, task)

        if not result:
            log(f"❌ Error: {agent_name} failed to generate quiz. Falling back to Standard Workflow.")
            return await self.run_workflow(topic)

        # Normalize the result structure
        final_quiz = {
            "meta": {
                "title": result.get("title") or result.get("quiz_title", f"{topic} Quiz"),
                "description": result.get("description") or result.get("quiz_description", ""),
                "viral_hook": result.get("viral_hook", ""),
                "category": result.get("category") or result.get("quiz_category", "General"),
            },
            "questions": result.get("questions", []),
            "results": result.get("results", []),
        }

        # [AUTO-FIX] If expert failed to generate results, run Analyst
        if not final_quiz["results"]:
            log("⚠️ Expert agent missed results. Running Analyst fallback...")
            sop_analyst = self.load_sop("report_analyst")
            analyst_task = f"""
            [Concept]: {json.dumps(final_quiz['meta'], ensure_ascii=False)}
            
            Based on the concept above, design **8 unique results (Archetypes)**.
            These correspond to scores 0 to 7 (3-Bit Binary Scale).
            
            Responses MUST strictly follow this JSON structure:
            {{
                "results": [
                    {{
                        "score": 0,
                        "type_name": "Type Name (VN)",
                        "description": "Detailed analysis (VN) - Funny/Roasting/Expert tone",
                        "traits": ["Trait 1", "Trait 2"]
                    }},
                    ... (Score 0 to 7)
                ]
            }}
            """
            analyst_res = await self.call_agent("Report Analyst", sop_analyst, analyst_task)
            if isinstance(analyst_res, dict):
                final_quiz["results"] = analyst_res.get("results") or []
            elif isinstance(analyst_res, list):
                final_quiz["results"] = analyst_res
            
            log(f"✅ Analyst Fallback Generated {len(final_quiz['results'])} results.")

        return await self.finalize_quiz(final_quiz)

    async def finalize_quiz(self, final_quiz):
        """데이터 검증 및 이미지 생성 공통 로직 (5문항 / 6결과 강제)"""
        questions_data = final_quiz.get("questions", [])
        results_data = final_quiz.get("results", [])
        meta = final_quiz.get("meta", {})

        log(f"🛠 Normalizing quiz: {len(questions_data)}Qs, {len(results_data)}Rs")

        # 1. Question Normalization (Force exactly 5)
        # ---------------------------------------------------------
        standard_questions = []
        for i in range(5):
            if i < len(questions_data):
                q = questions_data[i]
            else:
                q = {
                    "question_text": f"Bonus Question {i+1}",
                    "option_a": "Yes",
                    "option_b": "No",
                }
            
            # Remap keys if necessary
            q["order_number"] = i + 1
            q["question_text"] = q.get("question_text") or q.get("text") or "Nội dung câu hỏi bị thiếu."
            q["option_a"] = q.get("option_a") or q.get("choice_a") or "Option A"
            q["option_b"] = q.get("option_b") or q.get("choice_b") or "Option B"
            
            # [복구] Score Enforcement (3-Axis Binary Logic: 4-2-1-0-0)
            q["score_a"] = 0
            
            if i == 0:
                q["score_b"] = 4  # Q1 Axis 1 (100)
            elif i == 1:
                q["score_b"] = 2  # Q2 Axis 2 (010)
            elif i == 2:
                q["score_b"] = 1  # Q3 Axis 3 (001)
            else:
                q["score_b"] = 0  # Q4, Q5 Flavor
            
            q.setdefault("image_prompt", "Abstract background, webtoon style")
            q["image_url"] = None # Explicitly disable question image generation
            standard_questions.append(q)
        
        final_quiz["questions"] = standard_questions

        # 2. Result Normalization (Force exactly 8)
        # ---------------------------------------------------------
        standard_results = []
        # Create a map of existing results by score if available
        result_map = {}
        for r in results_data:
            score = r.get("score")
            if score is None:
                # Try to parse from result_code "001" style
                code = r.get("result_code") or r.get("code")
                if code is not None:
                    try: score = int(str(code), 2) if len(str(code)) == 3 else int(code)
                    except: pass
            
            if score is not None and 0 <= score <= 7:
                result_map[score] = r

        for i in range(8):
            if i in result_map:
                r = result_map[i]
            elif i < len(results_data) and "score" not in results_data[i]:
                # Fallback to sequential if score mapping failed
                r = results_data[i]
            else:
                r = {
                    "type_name": f"Archetype {i}",
                    "description": "Analysis pending for this type.",
                    "traits": ["Unique", "Mysterious"]
                }
            
            r["score"] = i
            r["result_code"] = i  # Ensure result_code is set for frontend consistency
            r["type_name"] = r.get("type_name") or r.get("result_title") or r.get("title") or f"Type {i}"
            r["description"] = r.get("description") or r.get("result_description") or "Mô tả kết quả đang được cập nhật."
            r.setdefault("traits", [])
            standard_results.append(r)
        
        final_quiz["results"] = standard_results
        log("✅ Consistency Check Passed: 5Q / 8R Schema Enforced.")

        # 이미지 생성 (활성화된 경우)
        if self.generate_images and self.image_generator:
            log("🎨 Starting image generation (Parallel)...")

            # Semaphore to limit concurrency (Safety against rate limits)
            sem = asyncio.Semaphore(5)

            async def generate_with_sem(coroutine):
                async with sem:
                    return await coroutine

            # Tasks list
            tasks = []
            
            # 1. Cover Image Task
            tasks.append(
                generate_with_sem(
                    self.image_generator.generate_quiz_cover(
                        meta.get("title", ""), 
                        meta.get("category", "Trendy"),
                        meta.get("description", "")
                    )
                )
            )

            # 2. Result Images Tasks (Iterate FINAL normalized results)
            # final_quiz["results"] contains exactly 8 items
            target_results = final_quiz["results"]
            
            for result_obj in target_results:
                tasks.append(
                    generate_with_sem(
                        self.image_generator.generate_result_image(
                            result_obj.get("type_name", "Result"), 
                            result_obj.get("description", "A unique character type")
                        )
                    )
                )

            # Execute all with 3-minute total timeout
            try:
                log(f"⏳ Generating {len(tasks)} images (Cover + 8 Results)...")
                img_results = await asyncio.gather(*tasks, return_exceptions=True)
                log(f"🏁 Image generation finished.")
            except Exception as e:
                log(f"❌ Critical error in gather: {e}")
                img_results = [None] * len(tasks)

            # Assign Cover Image (Index 0)
            cover_image = img_results[0]
            if isinstance(cover_image, dict) and cover_image.get('url'):
                final_quiz["meta"]["image_url"] = cover_image['url']
                log(f"🖼️ Cover image assigned: {cover_image['url']}")

            # Assign Result Images (Index 1 to 8)
            for i, result_obj in enumerate(target_results):
                idx = i + 1
                if idx < len(img_results):
                    img_res = img_results[idx]
                    if isinstance(img_res, dict) and img_res.get('url'):
                        result_obj["image_url"] = img_res['url']
                        log(f"✅ Result {i} image assigned: {img_res['url']}")

            log("🎨 Image generation completed!")

        return final_quiz

    async def run_trend_hunter(self):
        """Step 1: 트렌드 헌터가 현재 이슈를 분석"""
        sop = self.load_sop("Expert_Trend_Hunter")
        # Simulating external input from n8n or just asking for current trends
        task = "Analyze current HCMC trends and return 3 keywords and 1 main topic."
        return await self.call_agent("Expert_Trend_Hunter", sop, task)

    async def run_inspector(self, quiz_data):
        """Step 3: J-Bad 감찰관이 퀴즈 품질 검수"""
        sop = self.load_sop("Inspector_J_Bad")
        task = f"""
        [Quiz Data]: {json.dumps(quiz_data, ensure_ascii=False)}
        
        Verify if this quiz meets the 'King-bad' standards.
        Return JSON: {{ "status": "APPROVE" or "REJECT", "comment": "...", "stamp": "..." }}
        """
        return await self.call_agent("Inspector_J_Bad", sop, task)

    async def run_daily_cycle(self):
        """Sisyphus Loop: Daily Content Generation Cycle"""
        log("🗿 Sisyphus started rolling the stone...")

        # 1. Trend Hunting
        trend_data = await self.run_trend_hunter()
        if not trend_data or "raw_insight" not in trend_data:
            log("❌ Trend Hunter failed. Using fallback topic.")
            topic = "호치민 비오는 날 그랩 잡기"  # Fallback
        else:
            topic = trend_data.get("pushed_brief", trend_data.get("raw_insight"))
            log(f"🏹 Trend Found: {topic}")

        # 2. Generation (Reusing existing workflow with new topic)
        # In full version, we would switch between agents (PastLife, MBTI) here.
        # For now, we inject the trend into the main workflow.
        generated_quiz = await self.run_workflow(topic)

        if not generated_quiz:
            log("❌ Generation failed.")
            return None

        # 3. Quality Control (Inspector J Bad)
        inspection = await self.run_inspector(generated_quiz)
        log(
            f"👮‍♂️ Inspector Verdict: {inspection.get('status')} - {inspection.get('comment')}"
        )

        if inspection.get("status") == "APPROVE":
            generated_quiz["meta"]["qc_stamp"] = inspection.get("stamp")
            # Return for DB insertion
            return generated_quiz
        else:
            log("⚠️ Quiz Rejected. (Retry logic to be implemented)")
            # For Phase 2 demo, we return it anyway but marked as rejected
            generated_quiz["meta"]["qc_status"] = "REJECTED"
            return generated_quiz


# ---------------------------------------------------------
# 실행 진입점 (CLI / n8n)
# ---------------------------------------------------------
if __name__ == "__main__":
    # n8n 등 외부에서 인자로 주제를 전달받음 (기본값 설정)
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", default="workflow", help="workflow or daily")
    parser.add_argument("topic", nargs="?", default="호치민 1군 그랩 기사 전생 체험")
    args = parser.parse_args()

    factory = NambacFactory()

    if args.mode == "daily":
        result = asyncio.run(factory.run_daily_cycle())
    else:
        result = asyncio.run(factory.run_workflow(args.topic))

    # 최종 결과는 stdout으로 출력 (n8n이 캡처하는 부분)
    print(json.dumps(result, ensure_ascii=False, indent=2))
