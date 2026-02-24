from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
from pydantic import BaseModel
from typing import List, Optional, Any, Dict, cast
from datetime import datetime
import sys
import os
from dotenv import load_dotenv

from logic.factory import NambacFactory
from logic.json_manager import JSONManager
from logic.image_generator import ImageGenerator
from logic.ai_service_manager import AIServiceManager


# Log messages to stderr (Updated for result fix)
def log(message):
    sys.stderr.write(f"[System] {message}\n")
    sys.stderr.flush()


load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../.env"))

# --- Admin API Key Authentication ---
ADMIN_API_KEY = os.getenv("ADMIN_API_KEY", "")


async def verify_admin_key(x_admin_key: str = Header(default="")):
    """Verify the admin API key from X-Admin-Key header."""
    if not ADMIN_API_KEY:
        log("⚠️ ADMIN_API_KEY is not set in .env — all admin requests are BLOCKED.")
        raise HTTPException(status_code=500, detail="Server misconfigured: admin key not set")
    if x_admin_key != ADMIN_API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid admin key")
    return True


# --- Pydantic Models (Response Schemas) ---
class Question(BaseModel):
    id: str
    quiz_id: str
    order_number: int
    question_text: str
    option_a: str
    option_b: str
    score_a: int
    score_b: int
    image_url: Optional[str] = None

    class Config:
        from_attributes = True


class QuizResponse(BaseModel):
    id: str
    title: str
    description: str
    category: str
    image_url: Optional[str] = None
    is_active: bool
    view_count: int
    share_count: int
    created_at: datetime
    questions: List[Question] = []

    class Config:
        from_attributes = True


# --- Request Models ---
class QuizRequest(BaseModel):
    topic: str
    generate_images: bool = False
    category: Optional[str] = None
    agent_name: Optional[str] = None


# --- FastAPI App Initialization ---
# cPanel 배포 환경(ENV=production)일 때만 root_path="/api" 설정
# 로컬 개발 환경(ENV=development 또는 없음)에서는 root_path="" (기본값)
is_production = os.getenv("ENV") == "production"
root_path = "/api" if is_production else ""

app = FastAPI(
    title="Nambac Agent Factory API",
    description="3인의 AI 에이전트(Director, Architect, Analyst)가 협업하는 퀴즈 생성 공장",
    version="1.0.0",
    root_path=root_path,
    # Disable docs in production
    docs_url=None if is_production else "/docs",
    redoc_url=None if is_production else "/redoc",
)

# CORS: Environment-aware origins
if os.getenv("ALLOWED_ORIGINS"):
    origins = os.getenv("ALLOWED_ORIGINS").split(",")
elif is_production:
    origins = [
        "https://nambac.xyz",
        "http://nambac.xyz",
    ]
else:
    origins = [
        "https://nambac.xyz",
        "http://nambac.xyz",
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:8000",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "X-Admin-Key", "Authorization"],
)

# JSON Manager 초기화
json_manager = JSONManager(data_dir="data")

# 정적 파일 서빙 (이미지)
app.mount("/images", StaticFiles(directory="data/images"), name="images")


@app.get("/")
def read_root():
    return {"status": "operational", "system": "Nambac Agent Factory"}


@app.get("/api/admin/agents")
def get_available_agents(admin: bool = Depends(verify_admin_key)):
    """Available agents in .claude/agents/ and agents_nambac/prompts/"""
    base_path = os.path.dirname(os.path.abspath(__file__))
    directories = [
        os.path.join(base_path, "..", ".claude", "agents"),
        os.path.join(base_path, "agents_nambac", "prompts")
    ]
    
    agents = []
    seen = set()

    for agent_dir in directories:
        if os.path.exists(agent_dir):
            for filename in os.listdir(agent_dir):
                if filename.endswith(".md") and (
                    filename.startswith("Expert_") or filename.startswith("Quiz_")
                ):
                    agent_name = filename[:-3]  # Remove .md
                    if agent_name not in seen:
                        agents.append(agent_name)
                        seen.add(agent_name)
    return {"agents": agents}


@app.post("/api/quiz/generate")
async def generate_quiz(request: QuizRequest, admin: bool = Depends(verify_admin_key)):
    """
    [에이전트 워크플로우 실행]
    주제를 받아 Director -> Visual Architect / Report Analyst 순서로 협업하여
    최종 퀴즈 JSON을 반환합니다.
    """
    try:
        factory = NambacFactory()
        print(f"📡 API Request Received: {request.topic}")

        # 비동기 워크플로우 실행
        result = await factory.run_workflow(request.topic)

        if not result:
            raise HTTPException(
                status_code=500, detail="Workflow returned empty result"
            )

        return result

    except Exception as e:
        print(f"❌ Server Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ========== Quiz CRUD Endpoints ==========


@app.get("/api/quizzes")
def get_all_quizzes():
    """모든 퀴즈 목록 조회"""
    quizzes = json_manager.get_all_quizzes()
    return {"quizzes": quizzes}


@app.get("/api/quizzes/{quiz_id}")
def get_quiz(quiz_id: str):
    """특정 퀴즈 조회 (질문 포함)"""
    quiz = json_manager.get_quiz(quiz_id)

    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    # 연관 질문 및 결과 조회
    questions = json_manager.get_questions_by_quiz_id(quiz_id)
    results = json_manager.get_results_by_quiz_id(quiz_id)
    quiz["questions"] = questions
    quiz["results"] = results

    return quiz


@app.post("/api/quizzes/{quiz_id}/view")
def increment_view_count(quiz_id: str):
    """퀴즈 조회수 증가"""
    new_count = json_manager.increment_view_count(quiz_id)
    if new_count is None:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return {"view_count": new_count}


@app.post("/api/quizzes/{quiz_id}/share")
def increment_share_count(quiz_id: str):
    """퀴즈 공유수 증가"""
    new_count = json_manager.increment_share_count(quiz_id)
    if new_count is None:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return {"share_count": new_count}


@app.get("/share/{quiz_id}/{result_code}", response_class=HTMLResponse)
def share_result_og(quiz_id: str, result_code: int):
    """
    Social Sharing Endpoint (Server-Side Rendering for OG Tags)
    - Returns HTML with dynamic OG tags (Image, Title)
    - Redirects real users to the Frontend SPA
    """
    quiz = json_manager.get_quiz(quiz_id)
    if not quiz:
        return HTMLResponse(content="<html><body>Quiz not found</body></html>", status_code=404)

    # Find specific result
    results = json_manager.get_results_by_quiz_id(quiz_id)
    result = next((r for r in results if int(r.get("result_code")) == result_code), None)
    
    if result:
        title = result.get("title", quiz.get("title", "Nambac Quiz"))
        description = result.get("description", "Check out my result!").replace("\n", " ")
        image_url = result.get("image_url", "")
    else:
        # Fallback to generic quiz info
        title = quiz.get("title", "Nambac Quiz")
        description = quiz.get("summary", "Check out this quiz!")
        image_url = quiz.get("thumbnail", "")

    # Ensure Absolute URL for Image (Critical for FB/Zalo)
    if image_url and not image_url.startswith("http"):
        # If /images/..., prepend domain
        image_url = f"https://nambac.xyz{image_url}"
    elif not image_url:
        image_url = "https://nambac.xyz/og-default.png" # Fallback

    frontend_url = f"https://nambac.xyz/quiz/{quiz_id}/result?score={result_code}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        
        <!-- Open Graph / Facebook -->
        <meta property="og:type" content="website">
        <meta property="og:url" content="{frontend_url}">
        <meta property="og:title" content="{title}">
        <meta property="og:description" content="{description[:300]}...">
        <meta property="og:image" content="{image_url}">
        <meta property="og:image:width" content="800">
        <meta property="og:image:height" content="800">

        <!-- Zalo / Twitter -->
        <meta property="twitter:card" content="summary_large_image">
        <meta property="twitter:title" content="{title}">
        <meta property="twitter:description" content="{description[:300]}...">
        <meta property="twitter:image" content="{image_url}">

        <title>{title}</title>
        
        <script>
            // Redirect to actual SPA page
            window.location.href = "{frontend_url}";
        </script>
    </head>
    <body>
        <p>Redirecting to result...</p>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)


@app.post("/api/quizzes")
async def create_quiz(request: QuizRequest, admin: bool = Depends(verify_admin_key)):
    """
    퀴즈 생성 (AI 에이전트 활용)
    주제를 받아 AI로 퀴즈를 생성하고 로컬 JSON에 저장
    """
    try:
        # AI로 퀴즈 생성 (이미지 생성 옵션 포함)
        factory = NambacFactory(generate_images=request.generate_images)

        if request.agent_name:
            log(f"🧠 Using specialized agent: {request.agent_name}")
            result = await factory.run_expert_workflow(
                request.agent_name, request.topic
            )
        else:
            log(f"🚀 Using standard workflow for topic: {request.topic}")
            result = await factory.run_workflow(request.topic)

        if request.generate_images:
            log("🎨 Image generation enabled")

        if not result:
            raise HTTPException(
                status_code=500, detail="AI workflow returned empty result"
            )

        # 결과 데이터 파싱
        meta = result.get("meta", {})
        questions_data = result.get("questions", [])
        results_data = result.get("results", [])

        # 1. 퀴즈 메타데이터 정제
        quiz_meta = {
            "title": meta.get("title", request.topic),
            "description": meta.get("description", ""),
            "category": request.category or meta.get("category", "Trendy"),
            "image_url": meta.get("image_url") or "/images/grandma_roast_standing.png",
        }

        # 2. 질문 데이터 정제 (4-2-1 점수 로직 강제)
        questions = []
        for i, q in enumerate(questions_data):
            order = i + 1
            score_b = 4 if order == 1 else 2 if order == 2 else 1 if order == 3 else 0
            questions.append({
                "order_number": order,
                "question_text": q.get("question_text", "Câu hỏi mới"),
                "option_a": q.get("option_a", "Lựa chọn A"),
                "option_b": q.get("option_b", "Lựa chọn B"),
                "score_a": 0,
                "score_b": score_b,
                # image_url 제거 (질문 이미지는 생성하지 않음)
            })

        # 3. 결과 데이터 정제 (8개 보장)
        results = []
        for i in range(8):
            # AI가 준 데이터가 있으면 사용, 없으면 기본값
            r = results_data[i] if i < len(results_data) else {}
            
            # Factory에서 이미 생성한 image_url이 있으면 최우선 사용
            final_image_url = r.get("image_url") or "/images/grandma_roast_standing.png"
            
            results.append({
                "result_code": i,
                "title": r.get("type_name") or r.get("title") or f"Type {i}",
                "description": r.get("description") or "Mô tả đang cập nhật...",
                "traits": r.get("traits", ["Độc đáo", "Thú vị"]),
                "image_url": final_image_url
            })

        # 4. JSON 저장
        saved_quiz = json_manager.save_quiz_complete(quiz_meta, questions, results)
        return {"quiz": saved_quiz, "questions": questions, "results": results}

    except Exception as e:
        print(f"❌ Error creating quiz: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.put("/api/quizzes/{quiz_id}")
def update_quiz(quiz_id: str, updates: Dict, admin: bool = Depends(verify_admin_key)):
    """퀴즈, 질문, 결과 수정"""
    # 1. Update/Create Questions if present
    if "questions" in updates:
        questions = updates.pop("questions")
        new_questions = []
        for q in questions:
            if "id" in q and q["id"]:
                json_manager.update_question(q["id"], q)
            else:
                q["quiz_id"] = quiz_id
                new_questions.append(q)
        
        if new_questions:
            json_manager.create_questions(new_questions)

    # 2. Update/Create Results if present
    if "results" in updates:
        results = updates.pop("results")
        new_results = []
        for r in results:
            if "id" in r and r["id"]:
                json_manager.update_result(r["id"], r)
            else:
                r["quiz_id"] = quiz_id
                new_results.append(r)
        
        if new_results:
            json_manager.create_results(new_results)

    # 3. Update Quiz Meta
    updated_quiz = json_manager.update_quiz(quiz_id, updates)

    if not updated_quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    return {"status": "success", "quiz": updated_quiz}


@app.delete("/api/quizzes/{quiz_id}")
def delete_quiz(quiz_id: str, admin: bool = Depends(verify_admin_key)):
    """퀴즈 삭제"""
    log(f"🔥 Attempting to delete quiz: {quiz_id}")
    success = json_manager.delete_quiz(quiz_id)

    if not success:
        raise HTTPException(status_code=404, detail="Quiz not found")

    return {"message": "Quiz deleted successfully"}


# ========== Question CRUD Endpoints ==========


@app.get("/api/quizzes/{quiz_id}/questions")
def get_questions(quiz_id: str):
    """퀴즈별 질문 조회"""
    questions = json_manager.get_questions_by_quiz_id(quiz_id)
    return {"questions": questions}


@app.put("/api/questions/{question_id}")
def update_question(question_id: str, updates: Dict, admin: bool = Depends(verify_admin_key)):
    """질문 수정"""
    updated_question = json_manager.update_question(question_id, updates)

    if not updated_question:
        raise HTTPException(status_code=404, detail="Question not found")

    return updated_question


@app.delete("/api/questions/{question_id}")
def delete_question(question_id: str, admin: bool = Depends(verify_admin_key)):
    """질문 삭제"""
    success = json_manager.delete_question(question_id)

    if not success:
        raise HTTPException(status_code=404, detail="Question not found")

    return {"message": "Question deleted successfully"}


# ========== Result Endpoints ==========


@app.get("/api/quizzes/{quiz_id}/results")
def get_results(quiz_id: str):
    """퀴즈별 결과 유형 조회"""
    results = json_manager.get_results_by_quiz_id(quiz_id)
    return {"results": results}


# ========== External Services Endpoints ==========


class Service(BaseModel):
    id: Optional[str] = None
    title: str
    description: str
    image_url: str
    url: str
    category: str


@app.get("/api/services")
def get_services():
    """모든 외부 서비스 조회"""
    services = json_manager.get_all_services()
    return {"services": services}


@app.post("/api/services")
def create_service(service: Service, admin: bool = Depends(verify_admin_key)):
    """외부 서비스 추가"""
    return json_manager.create_service(service.dict())


@app.delete("/api/services/{service_id}")
def delete_service(service_id: str, admin: bool = Depends(verify_admin_key)):
    """외부 서비스 삭제"""
    success = json_manager.delete_service(service_id)
    if not success:
        raise HTTPException(status_code=404, detail="Service not found")
    return {"message": "Service deleted successfully"}


class CatDogRequest(BaseModel):
    name: str
    image: str


@app.post("/api/ai-service/cats-vs-dog")
async def analyze_cat_dog(request: CatDogRequest, admin: bool = Depends(verify_admin_key)):
    try:
        manager = AIServiceManager()
        result = await manager.run_cat_dog_analysis(request.name, request.image)
        if not result:
            raise HTTPException(status_code=500, detail="AI Analysis failed")
        return result
    except Exception as e:
        print(f"❌ AI Service Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Server Error: {str(e)}")


# ========== Automation Endpoints (Phase 2) ==========


@app.post("/api/automation/daily-cycle")
async def run_daily_cycle(admin: bool = Depends(verify_admin_key)):
    """
    [Sisyphus Loop] 24/7 자동화 파이프라인 트리거
    1. Trend Hunter: 트렌드 분석
    2. Nambac Factory: 퀴즈 생성
    3. Inspector J Bad: 품질 검수
    4. Save: DB 저장
    """
    try:
        factory = NambacFactory()
        print("🗿 Starting Daily Automation Cycle...")

        # 1-3. Run the optimized cycle
        result = await factory.run_daily_cycle()

        if not result:
            raise HTTPException(
                status_code=500, detail="Automation Cycle Failed (No Output)"
            )

        if result.get("meta", {}).get("qc_status") == "REJECTED":
            # In a real scenario, we might just log this and not save.
            # For Phase 2 Demo, we save it but maybe mark as inactive?
            print("⚠️ Saving REJECTED quiz for review.")

        # 4. Save to DB (Reuse Parsing Logic)
        meta = result.get("meta", {})
        questions_data = result.get("questions", [])
        results_data = result.get("results", [])

        # Quiz Meta
        quiz_meta = {
            "title": meta.get("title", "Untitled Trend Quiz"),
            "description": meta.get("description", "Generated by Sisyphus"),
            "category": meta.get("category", "Trendy"),
            "image_url": meta.get("image_url", None),
        }

        # Questions
        questions = []
        for q in questions_data:
            questions.append(
                {
                    "order_number": q.get("order_number", len(questions) + 1),
                    "question_text": q.get("question_text", ""),
                    "option_a": q.get("option_a", ""),
                    "option_b": q.get("option_b", ""),
                    "score_a": q.get("score_a", 0),
                    "score_b": q.get("score_b", 0),
                    "image_url": q.get(
                        "image_prompt", None
                    ),  # Fallback to prompt if URL missing
                }
            )

        # Results
        results = []
        for r in results_data:
            results.append(
                {
                    "result_code": r.get("score", 0),
                    "title": r.get("type_name", ""),
                    "description": r.get("description", ""),
                    "traits": r.get("traits", []),
                    "image_url": None,
                }
            )

        # Save
        saved_quiz = json_manager.save_quiz_complete(quiz_meta, questions, results)
        print(f"✅ Daily Quiz Saved: {saved_quiz['id']}")

        return {
            "status": "success",
            "message": "Daily cycle completed successfully",
            "quiz_id": saved_quiz["id"],
            "qc_stamp": meta.get("qc_stamp", "NONE"),
        }

    except Exception as e:
        print(f"❌ Automation Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/magazine")
def get_magazine_articles():
    """NAMBAC MAG 기사 목록 조회"""
    return {"articles": json_manager.get_all_articles()}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
