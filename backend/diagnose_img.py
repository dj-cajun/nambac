import asyncio
import os
from dotenv import load_dotenv
from logic.image_generator import ImageGenerator

async def diagnostic():
    load_dotenv(dotenv_path="../.env")
    generator = ImageGenerator()
    
    print("--- 🩺 Image Engine Diagnostic ---")
    print(f"ZAI_API_KEY: {os.getenv('ZAI_API_KEY')[:10]}...")
    print(f"OPENROUTER_API_KEY: {os.getenv('OPENROUTER_API_KEY')[:10]}...")
    
    # Test Z.ai
    print("\n1. Testing Z.ai (CogView-3-Plus)...")
    result = await generator.generate_image("A futuristic city in Vietnam, anime style")
    
    if result and "img_" in result['filename']:
        print(f"✅ SUCCESS: Image created: {result['filename']}")
    else:
        print("❌ FAILED: Z.ai could not create image.")

if __name__ == "__main__":
    asyncio.run(diagnostic())
