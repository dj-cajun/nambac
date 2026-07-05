import os
import sys

# Add backend directory to sys.path to allow importing from logic
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(backend_dir)

from logic.json_manager import JSONManager

print("🚀 Starting MZ Gen Z Quiz Insertion (Local JSON)...")

try:
    # Initialize JSON Manager (pointing to backend/data)
    json_manager = JSONManager(data_dir=os.path.join(backend_dir, "data"))

    # 1. Quiz Meta Data
    quiz_meta = {
        "title": "Kiếp Trước Bạn Là Ai Ở Sài Gòn? 🔮",
        "description": "Ngồi cà phê bệt hay rooftop sang chảnh? Check ngay nết của bạn để xem kiếp trước bạn làm nghề gì nhé! Cười ẻ lun á!",
        "category": "Trendy",
        "image_url": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=1000&auto=format&fit=crop",
        "is_active": True,
        "view_count": 8900,
        "share_count": 210,
    }

    # 2. Questions Data (3-Bit Binary Logic)
    questions = [
        {
            "order_number": 1,
            "question_text": "Bạn bè rủ đi cafe bệt Nhà Thờ Đức Bà. Bạn mặc gì?",
            "option_a": "Đồ bộ hoa hòe cho thoải mái (Bà hàng xóm)",
            "option_b": "Outfit cháy phố, makeup sương sương (Idol Tikitok)",
            "score_a": 0,
            "score_b": 1, # Axis 1
            "image_url": "https://images.unsplash.com/photo-1595246140625-573b715e11d3?auto=format&fit=crop&w=500&q=60",
        },
        {
            "order_number": 2,
            "question_text": "Tan làm lúc 5h chiều, trời mưa tầm tã. Bạn nghĩ gì?",
            "option_a": "Về nhà ngủ cho sướng (Team hường nội)",
            "option_b": "Đi nhậu thôi! Mưa càng vui! (Dân chơi không sợ mưa rơi)",
            "score_a": 0,
            "score_b": 2, # Axis 2
            "image_url": "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=500&q=60",
        },
        {
            "order_number": 3,
            "question_text": "Cuối tuần đi đâu?",
            "option_a": "Đi Landmark 81 ngắm view (Sang chảnh)",
            "option_b": "Ra Bùi Viện quẩy tới sáng (Party Animal)",
            "score_a": 0,
            "score_b": 4, # Axis 3
            "image_url": "https://images.unsplash.com/photo-1565057430174-c0477c336b23?auto=format&fit=crop&w=500&q=60",
        },
    ]

    # 3. Results Data (8 Types)
    results = [
        {"result_code": 0, "title": "Người Tối Cổ 🗿", "description": "Bạn sống ở Sài Gòn hay hang động vậy? Trend gì cũng không biết!", "traits": ["Cổ hủ", "Bình yên", "Xa lánh xã hội"]},
        {"result_code": 1, "title": "Mầm Non Gen Z 🌱", "description": "Đang tập tành đu trend. Cố gắng lên, sắp 'slay' rồi!", "traits": ["Ngây thơ", "Học hỏi", "Dễ thương"]},
        {"result_code": 2, "title": "Thánh Sống Ảo 📸", "description": "Đi cafe không uống, chỉ chụp hình. Camera roll 10,000 tấm!", "traits": ["Ăn ảnh", "Nghệ thuật", "Kiên nhẫn"]},
        {"result_code": 3, "title": "Reviewer Ẩm Thực 🍜", "description": "Quán nào ngon, quán nào dở bạn biết hết. Bạn bè toàn hỏi bạn ăn gì!", "traits": ["Sành ăn", "Khó tính", "Đáng tin cậy"]},
        {"result_code": 4, "title": "Chiến Thần Tik Tok 🎵", "description": "Nhạc nổi lên là nhảy. Trend gì cũng bắt kịp tíc tắc!", "traits": ["Năng động", "Sáng tạo", "Nổi tiếng"]},
        {"result_code": 5, "title": "Dân Chill Chính Hiệu 🎧", "description": "Không ồn ào, chỉ thích low-fi và workshop. Vibe cực nghệ!", "traits": ["Sâu sắc", "Nghệ sĩ", "Trầm tính"]},
        {"result_code": 6, "title": "Bà Chúa Tiệc Tùng 🥂", "description": "Bùi Viện là nhà, bar pub là giường. Quẩy banh nóc!", "traits": ["Vui vẻ", "Hết mình", "Không ngủ"]},
        {"result_code": 7, "title": "Tổng Tài Gen Z 💎", "description": "Vừa giỏi kiếm tiền vừa chơi chất. Bạn chính là nhân vật chính của bộ phim này!", "traits": ["Thành công", "Phong cách", "Hoàn hảo"]},
    ]

    saved_quiz = json_manager.save_quiz_complete(quiz_meta, questions, results)

    print("\n✨ SUCCESS! 'MZ Gen Z' Quiz Updated (Local JSON).")
    print(f"Quiz ID: {saved_quiz['id']}")

except Exception as e:
    print(f"\n❌ Error Occurred: {str(e)}")
    sys.exit(1)
