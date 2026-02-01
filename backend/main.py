from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys
import os

# 모듈 경로 문제 해결을 위해 backend 디렉토리를 path에 추가
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from logic.factory import NambacFactory

app = FastAPI(
    title="Nambac Agent Factory API",
    description="3인의 AI 에이전트(Director, Architect, Analyst)가 협업하는 퀴즈 생성 공장",
    version="1.0.0"
)

# CORS 설정 (프론트엔드 및 로컬 개발 환경 허용)
origins = [
    "http://localhost:5173",  # React/Vite 기본 포트
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

# --- Request Models ---
class QuizRequest(BaseModel):
    topic: str

# --- Endpoints ---

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
            raise HTTPException(status_code=500, detail="Workflow returned empty result")
            
        return result
    
    except Exception as e:
        print(f"❌ Server Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
