import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
supabase = create_client(os.environ.get("VITE_SUPABASE_URL"), os.environ.get("VITE_SUPABASE_ANON_KEY"))

# 1. 퀴즈 마스터 입고 (디자인 명세 포함)
quiz_data = {
    "title": "호치민 1군 카페 족제비 전생 테스트",
    "description": "에어팟 맥스 끼고 코딩하던 당신... 사실은 콩카페 족제비였다?",
    "category": "병맛/전생",
    "image_url": "https://nambac.xyz/assets/weasel_main.png", # 핑크 키치 이미지
    "is_active": True
}
res = supabase.table("quizzes").insert(quiz_data).execute()
q_id = res.data[0]['id']

# 2. 2지선다 문제 5개 입고
questions = [
    {"quiz_id": q_id, "order_number": 1, "question_text": "카페에 들어서자마자 당신이 찾는 것은?", "option_a": "에어컨 바람 잘 오는 명당", "option_b": "콘센트 옆 구석자리"},
    {"quiz_id": q_id, "order_number": 2, "question_text": "옆자리 사람이 너무 시끄럽다면?", "option_a": "에어팟 맥스 노캔 풀가동", "option_b": "같이 떠들어서 기선제압"},
    {"quiz_id": q_id, "order_number": 3, "question_text": "2시간째 주문을 안 했다면 당신의 선택은?", "option_a": "미안해서 연유커피 추가 주문", "option_b": "직원이랑 눈싸움하며 버티기"},
    {"quiz_id": q_id, "order_number": 4, "question_text": "갑자기 맥북 배터리가 5% 남았다!", "option_a": "침착하게 충전기 꺼내기", "option_b": "코딩하는 척하며 전원 끄기"},
    {"quiz_id": q_id, "order_number": 5, "question_text": "당신의 전생이 느껴지는 순간은?", "option_a": "원두 냄새가 향수처럼 느껴질 때", "option_b": "좁은 자리에 웅크려 앉아있을 때"}
]
supabase.table("questions").insert(questions).execute()
print(f"🎉 성공! {q_id}번 퀴즈와 '검수 완료'된 5문제가 입고되었습니다.")