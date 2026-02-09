import asyncio
import os
from dotenv import load_dotenv

load_dotenv(override=True)

# Add backend to path
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from logic.image_generator import ImageGenerator

async def test():
    print("=" * 50)
    print("🧪 Testing Image Generation with Pollinations.ai")
    print("=" * 50)
    
    ig = ImageGenerator()
    
    result = await ig.generate_image("A cute robot mascot holding a banana, Korean Webtoon style, vibrant colors")
    
    print("=" * 50)
    if result:
        print(f"✅ SUCCESS! Image saved: {result}")
    else:
        print("❌ FAILED! No image generated")
    print("=" * 50)

if __name__ == "__main__":
    asyncio.run(test())
