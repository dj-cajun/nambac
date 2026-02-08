import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'backend'))
from backend.logic.json_manager import JSONManager

jm = JSONManager(data_dir="backend/data")
quizzes = jm.get_all_quizzes()
print(f"Found {len(quizzes)} quizzes in backend/data")
for q in quizzes:
    print(f"- {q.get('title')}")
