import os
import sys
from supabase import create_client
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv()

url = os.environ.get("VITE_SUPABASE_URL")
key = os.environ.get("VITE_SUPABASE_ANON_KEY")

if not url or not key:
    print("❌ Error: Missing Supabase credentials in .env")
    sys.exit(1)

supabase = create_client(url, key)

print("🚀 Starting 8-Type Quiz Insertion...")

# 1. Quiz Meta Data (quizzes table)
quiz_meta = {
    "title": "호치민 로컬 생존력 테스트 (8-Type)",
    "description": "당신의 호치민 적응력을 3개의 질문으로 완벽하게 분석합니다. 당신은 현지인일까요, 영원한 관광객일까요?",
    "category": "Survival",
    "image_url": "https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=1000&auto=format&fit=crop",
    "is_active": True,
    "view_count": 0,
    "share_count": 0,
}

try:
    print(f"Adding Quiz: {quiz_meta['title']}...")
    res = supabase.table("quizzes").insert(quiz_meta).execute()

    if not res.data:
        raise Exception("No data returned from quiz insert")

    quiz_id = res.data[0]["id"]
    print(f"✅ Quiz Created! ID: {quiz_id}")

    # 2. Questions Data (questions table) - 3-Bit Binary Logic
    # Q1: Axis 1 (1 point)
    # Q2: Axis 2 (2 points)
    # Q3: Axis 3 (4 points)
    # Q4, Q5: Bonus (0 points)

    questions = [
        {
            "quiz_id": quiz_id,
            "order_number": 1,
            "question_text": "벤탄 시장에서 상인이 '50만동!'을 외쳤다. 당신의 반응은?",
            "option_a": "오케이, 쿨거래 (호구형)",
            "option_b": "'20만동 아니면 안사요' 뒤도 안보고 걷기 (고수형)",
            "score_a": 0,
            "score_b": 1,  # Axis 1 (Bit 0)
            "image_url": "https://images.unsplash.com/photo-1535139262971-c51845709a48?auto=format&fit=crop&w=500&q=60",
        },
        {
            "quiz_id": quiz_id,
            "order_number": 2,
            "question_text": "오토바이 택시(Grab)가 역주행을 시작했다.",
            "option_a": "비명을 지르며 기사님 어깨를 잡는다 (겁쟁이)",
            "option_b": "자연스럽게 풍경을 감상하며 스릴을 즐긴다 (현지인)",
            "score_a": 0,
            "score_b": 2,  # Axis 2 (Bit 1)
            "image_url": "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&w=500&q=60",
        },
        {
            "quiz_id": quiz_id,
            "order_number": 3,
            "question_text": "점심 메뉴로 무엇을 먹을까?",
            "option_a": "에어컨 빵빵한 일본 라멘집 (안전지향)",
            "option_b": "목욕탕 의자에 앉아 먹는 길거리 껌땀 (도전지향)",
            "score_a": 0,
            "score_b": 4,  # Axis 3 (Bit 2)
            "image_url": "https://images.unsplash.com/photo-1511690656952-34342d2c2ace?auto=format&fit=crop&w=500&q=60",
        },
        # Bonus Questions (No Score Effect)
        {
            "quiz_id": quiz_id,
            "order_number": 4,
            "question_text": "[보너스] 콩카페에서 주문할 메뉴는?",
            "option_a": "코코넛 커피",
            "option_b": "쓰어다",
            "score_a": 0,
            "score_b": 0,
            "image_url": "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=500&q=60",
        },
        {
            "quiz_id": quiz_id,
            "order_number": 5,
            "question_text": "[보너스] 갑자기 비가 쏟아진다(스콜). 당신은?",
            "option_a": "건물 안으로 피신한다",
            "option_b": "우비 입고 빗속을 뚫는다",
            "score_a": 0,
            "score_b": 0,
            "image_url": "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=500&q=60",
        },
    ]

    print(f"Adding {len(questions)} Questions...")
    q_res = supabase.table("questions").insert(questions).execute()

    print("\n✨ SUCCESS! 8-Type Quiz Data Inserted.")
    print("--------------------------------------------")
    print(f"Quiz Title: {quiz_meta['title']}")
    print(f"Questions : {len(questions)} items")
    print("Scoring   : Q1(1), Q2(2), Q3(4) -> Max Score 7")
    print("--------------------------------------------")

except Exception as e:
    print(f"\n❌ Error Occurred: {str(e)}")
    sys.exit(1)
