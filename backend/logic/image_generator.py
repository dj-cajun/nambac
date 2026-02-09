import os
import httpx
from typing import Optional
import time
from datetime import datetime
from PIL import Image, ImageDraw, ImageFont
import textwrap
import asyncio
import base64
from io import BytesIO


class ImageGenerator:
    """이미지 생성 유틸리티 - Google Imagen 4.0 (Gemini API Direct + Prompt Refinement)"""

    def __init__(self):
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        self.images_dir = "data/images"
        self.og_dir = "data/og"

        if not os.path.exists(self.images_dir):
            os.makedirs(self.images_dir, exist_ok=True)
        if not os.path.exists(self.og_dir):
            os.makedirs(self.og_dir, exist_ok=True)

        if self.gemini_key:
            print("✅ Gemini API Key configured for Google Imagen")
        else:
            print("⚠️ Warning: GEMINI_API_KEY not found. Image generation will fail.")

    async def _refine_prompt(self, user_prompt: str) -> str:
        """
        Gemini 2.0 Flash를 사용하여 사용자 프롬프트를 Imagen 4.0용 상세한 영어 프롬프트로 변환
        """
        if not self.gemini_key:
            return user_prompt

        try:
            print(f"🧠 Refining prompt via Gemini...")
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={self.gemini_key}"
            
            system_instruction = """
            You are a professional AI image prompt engineer. 
            Your task is to convert a simple Korean or English image description into a highly detailed, professional English prompt for 'Google Imagen 4.0'.
            
            Style:
            - Always maintain a 'Korean Webtoon (Manhwa)' style with clean digital line art, semi-realistic shading, and vibrant colors.
            
            Composition Rules:
            1. If the user mentions 'Quiz Cover' or 'Thumbnail': 
               - THE IMAGE MUST INCLUDE THE QUIZ TITLE TEXT in a stylish, legible font as part of the composition. 
               - It should look like a professional webtoon cover with a title.
            2. If the user mentions 'Result Image' or 'Personality Result':
               - THE IMAGE MUST HAVE ABSOLUTELY NO TEXT, LETTERS, OR NUMBERS.
               - THE MAIN CHARACTER/SUBJECT MUST BE POSITIONED ON THE LEFT SIDE OF THE FRAME. 
               - Leave the right side relatively empty or with a simple background so that UI text can be overlaid easily.
            
            General:
            - Focus on aesthetics, composition, lighting, and specific details.
            - Output ONLY the final prompt text.
            """
            
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": f"{system_instruction}\n\nUser Input: {user_prompt}\n\nOptimized Prompt:"}
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.7,
                    "topP": 0.8,
                    "topK": 40
                }
            }

            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(url, json=payload)
                if response.status_code == 200:
                    data = response.json()
                    refined = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "").strip()
                    if refined:
                        print(f"✨ Refined: {refined[:70]}...")
                        return refined
                else:
                    print(f"⚠️ Refinement API Error: {response.status_code}")
            return user_prompt
        except Exception as e:
            print(f"⚠️ Prompt refinement failed: {e}")
            return user_prompt

    async def generate_image(self, prompt: str) -> Optional[dict]:
        """
        1. 프롬프트 다듬기 (Refinement)
        2. Google Imagen 4.0 API를 직접 호출하여 이미지 생성
        """
        if not self.gemini_key:
            return None

        # 1. Prompt Refinement
        refined_prompt = await self._refine_prompt(prompt)

        try:
            print(f"🎨 Google Imagen 4.0 is rendering: {refined_prompt[:50]}...")
            
            # Using Imagen 4.0 Fast for best reliability and speed
            url = f"https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-fast-generate-001:predict?key={self.gemini_key}"
            
            payload = {
                "instances": [{"prompt": refined_prompt}],
                "parameters": {
                    "sampleCount": 1,
                    "aspectRatio": "1:1",
                    "safetyFilterLevel": "BLOCK_ONLY_HIGH"
                }
            }

            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(url, json=payload)
                
                print(f"📡 Response Status: {response.status_code}")
                
                if response.status_code == 200:
                    data = response.json()
                    
                    if "predictions" in data and len(data["predictions"]) > 0:
                        b64_image = data["predictions"][0].get("bytesBase64Encoded")
                        if b64_image:
                            filename = self._save_image(b64_image, prompt)
                            print(f"✅ Google Imagen Success: {filename}")
                            return {
                                "filename": filename,
                                "url": f"/images/{filename}",
                                "revised_prompt": refined_prompt
                            }
                    
                    print(f"⚠️ No predictions in response: {data}")
                else:
                    error_text = response.text[:500]
                    print(f"❌ Google Imagen(4.0) API error: {response.status_code} - {error_text}")
                    
                    # Fallback to standard Imagen 4.0 if Fast fails
                    if response.status_code != 403: # Don't retry if billing error
                        print("🔄 Trying standard imagen-4.0-generate-001...")
                        url2 = f"https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key={self.gemini_key}"
                        response2 = await client.post(url2, json=payload)
                        if response2.status_code == 200:
                            data2 = response2.json()
                            if "predictions" in data2 and len(data2["predictions"]) > 0:
                                b64_image = data2["predictions"][0].get("bytesBase64Encoded")
                                if b64_image:
                                    filename = self._save_image(b64_image, prompt)
                                    print(f"✅ Google Imagen (Standard) Success: {filename}")
                                    return {"filename": filename, "url": f"/images/{filename}", "revised_prompt": refined_prompt}
                
                return None

        except Exception as e:
            print(f"❌ Exception: {str(e)}")
            return None

    def _save_image(self, b64_image: str, prompt: str) -> str:
        """Base64 이미지를 파일로 저장하고 워터마크 추가"""
        timestamp = int(time.time())
        clean_prompt = "".join(c for c in prompt[:30] if c.isalnum() or c==' ').replace(" ", "_")
        filename = f"img_{timestamp}_{clean_prompt}.png"
        filepath = os.path.join(self.images_dir, filename)

        image_data = base64.b64decode(b64_image)
        image = Image.open(BytesIO(image_data))
        
        draw = ImageDraw.Draw(image)
        width, height = image.size
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 24)
        except:
            font = ImageFont.load_default()
            
        text = "nambac.xyz"
        bbox = draw.textbbox((0, 0), text, font=font)
        tw, th = bbox[2]-bbox[0], bbox[3]-bbox[1]
        x, y = width - tw - 20, height - th - 20
        draw.rectangle([x-5, y-5, x+tw+5, y+th+5], fill=(255, 255, 255, 100))
        draw.text((x, y), text, font=font, fill=(0, 0, 0, 180))

        image.save(filepath)
        return filename

    async def generate_quiz_cover(self, quiz_title: str, category: str, description: str = "") -> Optional[dict]:
        prompt = f"Quiz Cover Thumbnail. Include Title: '{quiz_title}'. Style: Korean Webtoon. Theme: {description or category}."
        return await self.generate_image(prompt)

    async def generate_result_image(self, result_type: str, description: str) -> Optional[dict]:
        prompt = f"Result Image. Main Subject: {result_type}. Position character ON THE LEFT. No Text. {description}."
        return await self.generate_image(prompt)
