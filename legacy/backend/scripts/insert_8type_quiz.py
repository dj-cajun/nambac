import os
import sys

# Add backend directory to sys.path to allow importing from logic
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(backend_dir)

from logic.json_manager import JSONManager

print("🚀 Starting Saigon Survival Quiz Insertion (Local JSON)...")

try:
    # Initialize JSON Manager (pointing to backend/data)
    json_manager = JSONManager(data_dir=os.path.join(backend_dir, "data"))

    # 1. Quiz Meta Data
    quiz_meta = {
        "title": "Thử Thách Sinh Tồn Sài Gòn (Level MAX)",
        "description": "Bạn là 'Thổ Địa' Sài Gòn hay 'Tấm Chiếu Mới'? Trả lời 3 câu hỏi để biết ngay trình độ thích nghi của bạn tại HCMC! Cười xỉu! 🤣",
        "category": "Survival",
        "image_url": "https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=1000&auto=format&fit=crop",
        "is_active": True,
        "view_count": 1200,
        "share_count": 45,
    }

    # 2. Questions Data (3-Bit Binary Logic)
    questions = [
        {
            "order_number": 1,
            "question_text": "Cô bán hàng ở chợ Bến Thành hét giá '500k'. Bạn làm gì?",
            "option_a": "Chốt đơn luôn cho lẹ (Rich Kid 💸)",
            "option_b": "'100k bán ko cô?' rồi bỏ đi thẳng (Thánh trả giá 😎)",
            "score_a": 0,
            "score_b": 1,  # Axis 1 (Bit 0)
            "image_url": "https://images.unsplash.com/photo-1535139262971-c51845709a48?auto=format&fit=crop&w=500&q=60",
        },
        {
            "order_number": 2,
            "question_text": "Grab Bike chạy ngược chiều trên đường Điện Biên Phủ 😱",
            "option_a": "Hét lên 'Á á á cứu tôi!' (Yếu tim 😭)",
            "option_b": "Ngắm cảnh chill chill, chuyện thường ngày (Dân chơi 🤘)",
            "score_a": 0,
            "score_b": 2,  # Axis 2 (Bit 1)
            "image_url": "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&w=500&q=60",
        },
        {
            "order_number": 3,
            "question_text": "Trưa nay ăn gì cho chuẩn bài?",
            "option_a": "Mì Nhật máy lạnh mát rượi (Team sang chảnh ❄️)",
            "option_b": "Cơm tấm bì chả lề đường, ngồi ghế nhựa (Team bụi 🍖)",
            "score_a": 0,
            "score_b": 4,  # Axis 3 (Bit 2)
            "image_url": "https://images.unsplash.com/photo-1511690656952-34342d2c2ace?auto=format&fit=crop&w=500&q=60",
        },
        # Bonus Questions (No Score Effect)
        {
            "order_number": 4,
            "question_text": "[Bonus] Đi cafe thì chọn quán nào?",
            "option_a": "Starbucks máy lạnh (Sang chảnh)",
            "option_b": "Cà phê bệt Nhà Thờ (Bụi bặm)",
            "score_a": 0,
            "score_b": 0,
            "image_url": "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=500&q=60",
        },
        {
            "order_number": 5,
            "question_text": "[Bonus] Sài Gòn đang mùa nào?",
            "option_a": "Mùa hè",
            "option_b": "Mùa nóng thấy m* & mùa mưa ngập lụt",
            "score_a": 0,
            "score_b": 0,
            "image_url": "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=500&q=60",
        },
    ]

    # 3. Results Data (8 Types)
    results = [
        {"result_code": 0, "title": "Khách Du Lịch Ngáo Ngơ ✈️", "description": "Bạn đến Sài Gòn chỉ để ăn phở 24. Cần 'phổ cập' kiến thức gấp!", "traits": ["Ngây thơ", "Dễ bị lừa", "Yêu màu hồng"]},
        {"result_code": 1, "title": "Tấm Chiếu Mới Trải 🆕", "description": "Biết trả giá nhưng toàn thất bại. Cố lên bạn ơi!", "traits": ["Nhiệt huyết", "Hay bỡ ngỡ", "Cần kinh nghiệm"]},
        {"result_code": 2, "title": "Dân Nhập Cư Tập Sự 🎒", "description": "Biết đường tắt, biết quán ngon. Sắp thành dân local!", "traits": ["Thích nghi", "Ham học hỏi", "Sành ăn"]},
        {"result_code": 3, "title": "Thổ Địa Quận 4 🗺️", "description": "Đường nào cũng biết. Grab driver còn phải nể!", "traits": ["Rành đường", "Thông thạo", "Nhanh nhạy"]},
        {"result_code": 4, "title": "Ninja Lead Huyền Thoại 🛵", "description": "Khả năng luồn lách thượng thừa. Áo chống nắng là trang phục chiến đấu!", "traits": ["Tốc độ", "Bất khả chiến bại", "Che kín mít"]},
        {"result_code": 5, "title": "Chúa Tể Vỉa Hè ☕", "description": "Cà phê bệt là chân ái. Sống 'bụi' mới là chất!", "traits": ["Bình dân", "Thoải mái", "Vui vẻ"]},
        {"result_code": 6, "title": "Master Trả Giá 💸", "description": "Chợ Bến Thành khóc thét khi thấy bạn. Trả giá như nghệ thuật!", "traits": ["Tiết kiệm", "Sắc sảo", "Thuyết phục"]},
        {"result_code": 7, "title": "Trùm Cuối Sài Gòn 👑", "description": "Sài Gòn nằm trong lòng bàn tay bạn!", "traits": ["Quyền lực", "Hiểu biết", "Bá đạo"]},
    ]

    saved_quiz = json_manager.save_quiz_complete(quiz_meta, questions, results)

    print("\n✨ SUCCESS! 'Saigon Survival' Quiz Updated (Local JSON).")
    print(f"Quiz ID: {saved_quiz['id']}")

except Exception as e:
    print(f"\n❌ Error Occurred: {str(e)}")
    sys.exit(1)
