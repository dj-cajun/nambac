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
    """이미지 생성 유틸리티 - OpenRouter (Google Gemini 3 Pro Image)"""

    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        self.images_dir = "data/images"
        self.og_dir = "data/og"

        if not os.path.exists(self.images_dir):
            os.makedirs(self.images_dir, exist_ok=True)
        if not os.path.exists(self.og_dir):
            os.makedirs(self.og_dir, exist_ok=True)

        if not self.api_key:
             print("⚠️ Warning: OPENROUTER_API_KEY not found. Image generation will fail.")

    async def generate_image(self, prompt: str) -> Optional[dict]:
        """
        OpenRouter API를 통해 이미지를 생성합니다.
        Uses google/gemini-3-pro-image-preview model.
        """
        if not self.api_key:
            return None

        try:
            print(f"🎨 Gemini 3 Pro is rendering: {prompt[:50]}...")
            
            # OpenRouter uses chat completions endpoint for image generation
            url = "https://openrouter.ai/api/v1/chat/completions"
            
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://nambac.xyz",
                "X-Title": "Nambac Quiz"
            }
            
            payload = {
                "model": "google/gemini-3-pro-image-preview",
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                # "modalities": ["image"]
            }

            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(url, json=payload, headers=headers)
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Check for image in choices
                    if "choices" in data and len(data["choices"]) > 0:
                        choice = data["choices"][0]
                        message = choice.get("message", {})
                        
                        # Check for content
                        content = message.get("content", [])
                        
                        # Handle text describing image or image URL
                        # Gemini might return a URL in text or standard format
                        if isinstance(content, list):
                            for item in content:
                                if item.get("type") == "image_url":
                                    img_url = item.get("image_url", {}).get("url", "")
                                    if img_url:
                                        if img_url.startswith("data:image"):
                                            b64_data = img_url.split(",")[1] if "," in img_url else img_url
                                            filename = self._save_image(b64_data, prompt)
                                            print(f"✅ Gemini Success: {filename}")
                                            return {
                                                "filename": filename,
                                                "url": f"/images/{filename}",
                                                "revised_prompt": prompt
                                            }
                                        else:
                                            # Download URL
                                            print(f"📥 Downloading image from URL...")
                                            img_response = await client.get(img_url)
                                            if img_response.status_code == 200:
                                                b64_data = base64.b64encode(img_response.content).decode()
                                                filename = self._save_image(b64_data, prompt)
                                                print(f"✅ Gemini Success: {filename}")
                                                return {
                                                    "filename": filename,
                                                    "url": f"/images/{filename}",
                                                    "revised_prompt": prompt
                                                }
                        elif isinstance(content, str):
                            # Sometimes Gemini returns markdown image
                            if "](" in content and content.endswith(")"):
                                # Extract URL from Markdown
                                import re
                                match = re.search(r'\((http.*?)\)', content)
                                if match:
                                    img_url = match.group(1)
                                    print(f"📥 Downloading image from extracted URL...")
                                    img_response = await client.get(img_url)
                                    if img_response.status_code == 200:
                                        b64_data = base64.b64encode(img_response.content).decode()
                                        filename = self._save_image(b64_data, prompt)
                                        return {"filename": filename, "url": f"/images/{filename}", "revised_prompt": prompt}
                            
                            # Check for base64 data URI
                            if content.startswith("data:image"):
                                b64_data = content.split(",")[1] if "," in content else content
                                filename = self._save_image(b64_data, prompt)
                                print(f"✅ Gemini Success: {filename}")
                                return {"filename": filename, "url": f"/images/{filename}", "revised_prompt": prompt}
                
                print(f"❌ Gemini API error: {response.status_code} - {response.text[:500]}")
                return None

        except Exception as e:
            print(f"❌ Gemini exception: {str(e)}")
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
        prompt = f"Create a high-quality 'Korean Webtoon' style quiz cover art. Subject: {quiz_title}. Theme: {description or category}. Modern illustration, vibrant colors."
        return await self.generate_image(prompt)

    async def generate_result_image(self, result_type: str, description: str) -> Optional[dict]:
        """결과 이미지 생성 - 캐릭터 중심, 텍스트 금지, 웹툰 스타일"""
        prompt = f"""
        Create a character-centric 'Korean Webtoon (Manhwa)' style illustration for a personality profile.
        Archetype: {result_type}
        Character Details: {description}
        
        Strict Rules:
        1. NO TEXT: The image must have absolutely no letters, numbers, or words. 
        2. Style: Clean digital line art, semi-realistic webtoon shading.
        3. Character: Draw a single expressive character that embodies the '{result_type}' energy.
        4. COMPOSITION: Character MUST be positioned on the LEFT SIDE of the image. Keep the RIGHT SIDE of the image empty or with simple background - this area will be used for text overlay.
        5. Layout: Close-up or waist-up character shot on LEFT, expressive background on RIGHT reflecting the mood.
        """
        return await self.generate_image(prompt)
