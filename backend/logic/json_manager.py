import json
import os
from typing import Dict, List, Any, Optional
import uuid
from datetime import datetime


class JSONManager:
    """로컬 JSON 파일 관리자 - Local-First 저장소"""

    def __init__(self, data_dir: str = "data"):
        self.data_dir = data_dir
        self.ensure_data_dir()

        # 파일 경로
        self.quizzes_file = os.path.join(data_dir, "quizzes.json")
        self.questions_file = os.path.join(data_dir, "questions.json")
        self.results_file = os.path.join(data_dir, "results.json")

        # 초기 파일 생성
        self.ensure_json_files()

    def ensure_data_dir(self):
        """데이터 디렉토리가 없으면 생성"""
        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir)

    def ensure_json_files(self):
        """JSON 파일이 없으면 초기화"""
        if not os.path.exists(self.quizzes_file):
            self._write_json(self.quizzes_file, [])

        if not os.path.exists(self.questions_file):
            self._write_json(self.questions_file, [])

        if not os.path.exists(self.results_file):
            self._write_json(self.results_file, [])

    def _read_json(self, file_path: str) -> Any:
        """JSON 파일 읽기"""
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError) as e:
            print(f"Error reading {file_path}: {e}")
            return [] if "questions" in file_path or "quizzes" in file_path else {}

    def _write_json(self, file_path: str, data: Any):
        """JSON 파일 쓰기"""
        try:
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"Error writing {file_path}: {e}")
            raise

    # ========== Quizzes CRUD ==========

    def get_all_quizzes(self) -> List[Dict]:
        """모든 퀴즈 목록 조회"""
        return self._read_json(self.quizzes_file)

    def get_quiz(self, quiz_id: str) -> Optional[Dict]:
        """특정 퀴즈 조회"""
        quizzes = self.get_all_quizzes()
        for quiz in quizzes:
            if quiz["id"] == quiz_id:
                return quiz
        return None

    def create_quiz(self, quiz_data: Dict) -> Dict:
        """퀴즈 생성"""
        quizzes = self.get_all_quizzes()

        # ID 생성
        if "id" not in quiz_data:
            quiz_data["id"] = str(uuid.uuid4())

        # created_at 추가
        if "created_at" not in quiz_data:
            quiz_data["created_at"] = datetime.now().isoformat()

        # 기본값 설정
        quiz_data.setdefault("is_active", True)
        quiz_data.setdefault("view_count", 0)
        quiz_data.setdefault("share_count", 0)
        quiz_data.setdefault("quiz_type", "binary_5q")
        quiz_data.setdefault("category", "fun")

        quizzes.append(quiz_data)
        self._write_json(self.quizzes_file, quizzes)

        return quiz_data

    def update_quiz(self, quiz_id: str, updates: Dict) -> Optional[Dict]:
        """퀴즈 수정"""
        quizzes = self.get_all_quizzes()

        for idx, quiz in enumerate(quizzes):
            if quiz["id"] == quiz_id:
                quizzes[idx].update(updates)
                self._write_json(self.quizzes_file, quizzes)
                return quizzes[idx]

        return None

    def increment_view_count(self, quiz_id: str) -> Optional[int]:
        """조회수 증가"""
        quizzes = self.get_all_quizzes()
        for idx, quiz in enumerate(quizzes):
            if quiz["id"] == quiz_id:
                new_count = quiz.get("view_count", 0) + 1
                quizzes[idx]["view_count"] = new_count
                self._write_json(self.quizzes_file, quizzes)
                return new_count
        return None

    def increment_share_count(self, quiz_id: str) -> Optional[int]:
        """공유수 증가"""
        quizzes = self.get_all_quizzes()
        for idx, quiz in enumerate(quizzes):
            if quiz["id"] == quiz_id:
                new_count = quiz.get("share_count", 0) + 1
                quizzes[idx]["share_count"] = new_count
                self._write_json(self.quizzes_file, quizzes)
                return new_count

    def delete_quiz(self, quiz_id: str) -> bool:
        """퀴즈 삭제"""
        quizzes = self.get_all_quizzes()
        original_length = len(quizzes)

        quizzes = [q for q in quizzes if q["id"] != quiz_id]

        if len(quizzes) < original_length:
            self._write_json(self.quizzes_file, quizzes)

            # 연관 질문들도 삭제
            self.delete_questions_by_quiz_id(quiz_id)
            # 연관 결과들도 삭제
            self.delete_results_by_quiz_id(quiz_id)

            return True
        return False

    # ========== Questions CRUD ==========

    def get_questions_by_quiz_id(self, quiz_id: str) -> List[Dict]:
        """퀴즈별 질문 조회"""
        all_questions = self._read_json(self.questions_file)
        return [q for q in all_questions if q["quiz_id"] == quiz_id]

    def create_questions(self, questions: List[Dict]) -> List[Dict]:
        """질문들 일괄 생성"""
        all_questions = self._read_json(self.questions_file)

        for question in questions:
            # ID 생성
            if "id" not in question:
                question["id"] = str(uuid.uuid4())

            # 기본값 설정
            question.setdefault("score_a", 0)
            question.setdefault("score_b", 0)
            question.setdefault("image_url", None)

            all_questions.append(question)

        self._write_json(self.questions_file, all_questions)
        return questions

    def update_question(self, question_id: str, updates: Dict) -> Optional[Dict]:
        """질문 수정"""
        all_questions = self._read_json(self.questions_file)

        for idx, question in enumerate(all_questions):
            if question["id"] == question_id:
                all_questions[idx].update(updates)
                self._write_json(self.questions_file, all_questions)
                return all_questions[idx]

        return None

    def delete_question(self, question_id: str) -> bool:
        """질문 삭제"""
        all_questions = self._read_json(self.questions_file)
        original_length = len(all_questions)

        all_questions = [q for q in all_questions if q["id"] != question_id]

        if len(all_questions) < original_length:
            self._write_json(self.questions_file, all_questions)
            return True
        return False

    def delete_questions_by_quiz_id(self, quiz_id: str):
        """퀴즈 ID로 연관 질문들 삭제"""
        all_questions = self._read_json(self.questions_file)
        all_questions = [q for q in all_questions if q["quiz_id"] != quiz_id]
        self._write_json(self.questions_file, all_questions)

    # ========== Results CRUD ==========

    def get_results_by_quiz_id(self, quiz_id: str) -> List[Dict]:
        """퀴즈별 결과 유형 조회"""
        all_results = self._read_json(self.results_file)
        return [r for r in all_results if r["quiz_id"] == quiz_id]

    def create_results(self, results: List[Dict]) -> List[Dict]:
        """결과 유형들 일괄 생성"""
        all_results = self._read_json(self.results_file)

        for result in results:
            # ID 생성
            if "id" not in result:
                result["id"] = str(uuid.uuid4())

            all_results.append(result)

        self._write_json(self.results_file, all_results)
        return results

    def update_result(self, result_id: str, updates: Dict) -> Optional[Dict]:
        """결과 유형 수정"""
        all_results = self._read_json(self.results_file)

        for idx, result in enumerate(all_results):
            if result["id"] == result_id:
                all_results[idx].update(updates)
                self._write_json(self.results_file, all_results)
                return all_results[idx]

        return None
    
    def delete_results_by_quiz_id(self, quiz_id: str):
        """퀴즈 ID로 연관 결과들 삭제"""
        all_results = self._read_json(self.results_file)
        all_results = [r for r in all_results if r.get("quiz_id") != quiz_id]
        self._write_json(self.results_file, all_results)

    def delete_results_by_code(self, result_code: int) -> bool:
        """특정 결과 코드를 가진 모든 결과 항목을 삭제"""
        all_results = self._read_json(self.results_file)
        original_length = len(all_results)
        
        # result_code가 result_code와 다른 항목들만 남김
        all_results = [r for r in all_results if r.get("result_code") != result_code]

        if len(all_results) < original_length:
            self._write_json(self.results_file, all_results)
            return True
        return False

    # ========== 유틸리티 ==========

    def save_quiz_complete(self, quiz_meta: Dict, questions: List[Dict], results: List[Dict]) -> Dict:
        """퀴즈, 질문, 결과를 한 번에 저장 (Transaction-like)"""
        # 1. Save Quiz
        saved_quiz = self.create_quiz(quiz_meta)
        quiz_id = saved_quiz["id"]

        # 2. Save Questions
        for q in questions:
            q["quiz_id"] = quiz_id
        self.create_questions(questions)

        # 3. Save Results
        for r in results:
            r["quiz_id"] = quiz_id
        self.create_results(results)

        return saved_quiz

    # ========== External Services CRUD ==========

    def get_all_services(self) -> List[Dict]:
        """모든 외부 서비스 목록 조회"""
        # Ensure file exists
        services_file = os.path.join(self.data_dir, "external_services.json")
        if not os.path.exists(services_file):
            self._write_json(services_file, [])
        return self._read_json(services_file)

    def create_service(self, service_data: Dict) -> Dict:
        """외부 서비스 추가"""
        services_file = os.path.join(self.data_dir, "external_services.json")
        services = self.get_all_services()

        if "id" not in service_data or service_data["id"] is None:
            service_data["id"] = str(uuid.uuid4())

        services.append(service_data)
        self._write_json(services_file, services)
        return service_data

    def delete_service(self, service_id: str) -> bool:
        """외부 서비스 삭제"""
        services_file = os.path.join(self.data_dir, "external_services.json")
        services = self.get_all_services()
        original_length = len(services)

        services = [s for s in services if s["id"] != service_id]

        if len(services) < original_length:
            self._write_json(services_file, services)
            return True
        return False

    def get_all_articles(self) -> List[Dict]:
        """잡지 기사 목록 조회"""
        file_path = os.path.join(self.data_dir, "magazine.json")
        data = self._read_json(file_path)
        return data.get("articles", [])
