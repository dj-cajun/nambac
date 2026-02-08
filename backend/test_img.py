import asyncio
import os
from dotenv import load_dotenv
from logic.image_generator import ImageGenerator

async def test_image_gen():
    # .env 파일 로드
    load_dotenv(dotenv_path="../.env")
    
    # ImageGenerator 초기화 (내부에서 OPENROUTER_API_KEY 사용하도록 수정됨)
    generator = ImageGenerator()
    
    api_key = os.getenv('OPENROUTER_API_KEY')
    if not api_key:
        print("❌ Error: OPENROUTER_API_KEY not found in .env")
        return

    print(f"🌐 Testing with OpenRouter Key: {api_key[:10]}...")
    
    # 이미지 생성 테스트
    result = await generator.generate_image("A cool cyberpunk cat wearing sunglasses, webtoon style, high quality")
    
    if result:
        print(f"✅ Success! Image created: {result['filename']}")
        print(f"🔗 Local URL: {result['url']}")
    else:
        print("❌ Failed to generate image via OpenRouter.")

if __name__ == "__main__":
    asyncio.run(test_image_gen())
