from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional, Any, Dict, cast
from datetime import datetime
import sys
import os
from dotenv import load_dotenv

from logic.factory import NambacFactory
from logic.json_manager import JSONManager
from logic.image_generator import ImageGenerator

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../.env"))


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


# --- FastAPI App Initialization ---
app = FastAPI(
    title="Nambac Agent Factory API",
    description="3인의 AI 에이전트(Director, Architect, Analyst)가 협업하는 퀴즈 생성 공장",
    version="1.0.0",
)

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JSON Manager 초기화
json_manager = JSONManager(data_dir="data")

# 정적 파일 서빙 (이미지)
app.mount("/images", StaticFiles(directory="data/images"), name="images")


@app.get("/")
def read_root():
    return {"status": "operational", "system": "Nambac Agent Factory"}


@app.post("/api/quiz/generate")
async def generate_quiz(request: QuizRequest):
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

    # 연관 질문 조회
    questions = json_manager.get_questions_by_quiz_id(quiz_id)
    quiz["questions"] = questions

    return quiz


@app.post("/api/quizzes")
async def create_quiz(request: QuizRequest):
    """
    퀴즈 생성 (AI 에이전트 활용)
    주제를 받아 AI로 퀴즈를 생성하고 로컬 JSON에 저장
    """
    try:
        # AI로 퀴즈 생성 (이미지 생성 옵션 포함)
        factory = NambacFactory(generate_images=request.generate_images)
        print(f"🎨 Creating quiz with topic: {request.topic}")
        if request.generate_images:
            print("🎨 Image generation enabled")

        result = await factory.run_workflow(request.topic)

        if not result:
            raise HTTPException(
                status_code=500, detail="AI workflow returned empty result"
            )

        # 결과 데이터 파싱
        meta = result.get("meta", {})
        questions_data = result.get("questions", [])
        results_data = result.get("results", [])

        # 퀴즈 메타데이터 변환
        quiz_meta = {
            "title": meta.get("title", request.topic),
            "description": meta.get("description", ""),
            "category": meta.get("category", "Trendy"),
            "image_url": meta.get("image_url", None),
        }

        # 질문 데이터 변환
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
                    ),  # image_prompt를 image_url로
                }
            )

        # 결과 데이터 변환
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

        # JSON에 저장
        saved_quiz = json_manager.save_quiz_complete(quiz_meta, questions, results)

        return {"quiz": saved_quiz, "questions": questions, "results": results}

    except Exception as e:
        print(f"❌ Error creating quiz: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/quizzes/{quiz_id}")
def update_quiz(quiz_id: str, updates: Dict):
    """퀴즈 수정"""
    updated_quiz = json_manager.update_quiz(quiz_id, updates)

    if not updated_quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    return updated_quiz


@app.delete("/api/quizzes/{quiz_id}")
def delete_quiz(quiz_id: str):
    """퀴즈 삭제"""
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
def update_question(question_id: str, updates: Dict):
    """질문 수정"""
    updated_question = json_manager.update_question(question_id, updates)

    if not updated_question:
        raise HTTPException(status_code=404, detail="Question not found")

    return updated_question


@app.delete("/api/questions/{question_id}")
def delete_question(question_id: str):
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
def create_service(service: Service):
    """외부 서비스 추가"""
    return json_manager.create_service(service.dict())


@app.delete("/api/services/{service_id}")
def delete_service(service_id: str):
    """외부 서비스 삭제"""
    success = json_manager.delete_service(service_id)
    if not success:
        raise HTTPException(status_code=404, detail="Service not found")
    return {"message": "Service deleted successfully"}


# ========== Automation Endpoints (Phase 2) ==========


@app.post("/api/automation/daily-cycle")
async def run_daily_cycle():
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
            raise HTTPException(status_code=500, detail="Automation Cycle Failed (No Output)")
            
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
            questions.append({
                "order_number": q.get("order_number", len(questions) + 1),
                "question_text": q.get("question_text", ""),
                "option_a": q.get("option_a", ""),
                "option_b": q.get("option_b", ""),
                "score_a": q.get("score_a", 0),
                "score_b": q.get("score_b", 0),
                "image_url": q.get("image_prompt", None) # Fallback to prompt if URL missing
            })

        # Results
        results = []
        for r in results_data:
            results.append({
                "result_code": r.get("score", 0),
                "title": r.get("type_name", ""),
                "description": r.get("description", ""),
                "traits": r.get("traits", []),
                "image_url": None
            })

        # Save
        saved_quiz = json_manager.save_quiz_complete(quiz_meta, questions, results)
        print(f"✅ Daily Quiz Saved: {saved_quiz['id']}")
        
        return {
            "status": "success",
            "message": "Daily cycle completed successfully",
            "quiz_id": saved_quiz["id"],
            "qc_stamp": meta.get("qc_stamp", "NONE")
        }

    except Exception as e:
        print(f"❌ Automation Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)


# ========== Viral & Expansion Endpoints (Phase 3) ==========

@app.get("/api/og/{quiz_id}/{result_code}")
async def get_og_image(quiz_id: str, result_code: int):
    """
    [Dynamic OG Image] SNS 공유용 결과 카드 이미지 생성 및 반환
    """
    # 1. Get Quiz & Result Data
    quiz = json_manager.get_quiz(quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
        
    results = json_manager.get_results_by_quiz_id(quiz_id)
    target_result = next((r for r in results if int(r.get("result_code", -1)) == result_code), None)
    
    if not target_result:
        raise HTTPException(status_code=404, detail="Result type not found")
        
    # 2. Generate Image
    generator = ImageGenerator()
    filename = generator.generate_og_card(
        title=quiz["title"],
        description=target_result["description"], 
        result_type=target_result["title"]
    )
    
    if not filename:
        raise HTTPException(status_code=500, detail="Image generation failed")
    
    file_path = f"data/og/{filename}"
    return FileResponse(file_path)


@app.get("/api/magazine")
def get_magazine_articles():
    """NAMBAC MAG 기사 목록 조회"""
    return {"articles": json_manager.get_all_articles()}
