#!/usr/bin/env python3
"""
데이터 마이그레이션: 기존 퀴즈에 quiz_type + 카테고리 정리
실행: python3 tools/migrate_quiz_types.py
"""
import json
import os
import shutil
from datetime import datetime

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "backend", "data")
QUIZZES_FILE = os.path.join(DATA_DIR, "quizzes.json")

# 카테고리 매핑: 기존 → 새 카테고리
CATEGORY_MAP = {
    "Fun_PastLife": "personality",
    "fun_pastlife": "personality",
    "PastLife": "personality",
    "pastlife": "personality",
    "MBTI": "mbti",
    "mbti": "mbti",
    "Fortune": "fortune",
    "fortune": "fortune",
    "Fun": "fun",
    "fun": "fun",
    "Trend": "trend",
    "trend": "trend",
}

def migrate():
    # 백업
    backup_path = QUIZZES_FILE + f".backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    shutil.copy2(QUIZZES_FILE, backup_path)
    print(f"✅ Backup: {backup_path}")

    with open(QUIZZES_FILE, "r", encoding="utf-8") as f:
        quizzes = json.load(f)

    updated = 0
    for quiz in quizzes:
        changed = False

        # quiz_type 추가
        if "quiz_type" not in quiz:
            quiz["quiz_type"] = "binary_5q"
            changed = True

        # 카테고리 정리
        old_cat = quiz.get("category", "")
        new_cat = CATEGORY_MAP.get(old_cat, "fun")
        if old_cat != new_cat:
            quiz["category"] = new_cat
            changed = True

        if changed:
            updated += 1
            print(f"  📦 {quiz['title'][:40]}... → type={quiz['quiz_type']}, category={quiz['category']}")

    with open(QUIZZES_FILE, "w", encoding="utf-8") as f:
        json.dump(quizzes, f, ensure_ascii=False, indent=2)

    print(f"\n🎉 Migration complete! {updated}/{len(quizzes)} quizzes updated.")

if __name__ == "__main__":
    migrate()
