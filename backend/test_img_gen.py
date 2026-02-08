import asyncio
from dotenv import load_dotenv
import os

load_dotenv(override=True)

from logic.image_generator import ImageGenerator

async def test_gen():
    ig = ImageGenerator()
    print("Testing Image Generation with current config...")
    result = await ig.generate_image("A cute robot holding a banana, Korean Webtoon style")
    print(f"Result: {result}")

if __name__ == "__main__":
    asyncio.run(test_gen())
