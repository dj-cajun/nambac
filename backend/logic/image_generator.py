import os
import httpx
from typing import Optional
import time
from datetime import datetime
from PIL import Image, ImageDraw, ImageFont
import textwrap


class ImageGenerator:
    """이미지 생성 유틸리티 - OpenAI DALL-E 3 & PIL OG Generator"""

    def __init__(self):
        # Google Cloud 설정
        self.google_project_id = os.getenv("GOOGLE_CLOUD_PROJECT_ID")
        self.api_key = os.getenv("OPENAI_API_KEY") # 호환성을 위해 남겨둠
        self.base_url = "https://api.openai.com/v1"
        self.images_dir = "data/images"
        self.og_dir = "data/og"

        # 이미지 저장소 디렉토리 확인
        if not os.path.exists(self.images_dir):
            os.makedirs(self.images_dir)
        if not os.path.exists(self.og_dir):
            os.makedirs(self.og_dir)

        if not self.google_project_id:
            print("⚠️ Warning: GOOGLE_CLOUD_PROJECT_ID not found in environment variables.")

    def generate_og_card(self, title: str, description: str, result_type: str) -> Optional[str]:
        """
        PIL을 사용하여 SNS 공유용 OG 이미지 생성 (Glass-Comic Style)
        
        Returns:
            str: 생성된 이미지의 파일명
        """
        try:
            # 1. Base Image Setup (1200x630 - OG Standard)
            width, height = 1200, 630
            
            # Pastel Pink/Purple Gradient Background (Matching Result.jsx)
            image = Image.new('RGB', (width, height), color='#FFF0F5')
            draw = ImageDraw.Draw(image)
            
            # Draw Gradient
            for y in range(height):
                r = 255
                g = int(240 - (y / height) * 40)
                b = int(245 - (y / height) * 20)
                draw.line([(0, y), (width, y)], fill=(r, g, b))

            # 2. Comic Border (Thick Black)
            border_width = 15
            draw.rectangle([0, 0, width, height], outline="black", width=border_width)
            
            # Inner Decorative Border (Thin)
            draw.rectangle([30, 30, width-30, height-30], outline="black", width=2)
            
            # 3. Load Fonts
            try:
                # Try to use a bold font if available (Mac specific path for now or standard)
                title_font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Black.ttf", 65)
                type_font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Courier New Bold.ttf", 90)
                desc_font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 40)
                brand_font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 30)
            except:
                # Fallback to default
                title_font = ImageFont.load_default()
                type_font = ImageFont.load_default()
                desc_font = ImageFont.load_default()
                brand_font = ImageFont.load_default()

            # 4. Content Layout
            
            # Result Type (Top Left Badge)
            draw.rounded_rectangle([60, 60, 500, 160], radius=20, fill="#FF69B4", outline="black", width=5)
            draw.text((90, 85), result_type, font=type_font, fill="white", stroke_width=2, stroke_fill="black")
            
            # Title (Bottom Left)
            draw.text((60, 450), title, font=title_font, fill="#333333")
            
            # Description (Bottom Left - wrapped)
            wrapper = textwrap.TextWrapper(width=45)
            desc_lines = wrapper.wrap(description)
            y_text = 540
            for line in desc_lines[:2]: # Limit to 2 lines
                draw.text((60, y_text), line, font=desc_font, fill="#666666")
                y_text += 50
                
            # Character Placeholder (Right Side Circle)
            # Draw a circle container for character
            circle_x, circle_y, circle_r = 900, 315, 200
            draw.ellipse([circle_x-circle_r, circle_y-circle_r, circle_x+circle_r, circle_y+circle_r], fill="white", outline="black", width=5)
            
            # Add text inside circle
            draw.text((circle_x-50, circle_y-20), "YOU", font=type_font, fill="black")

            # Branding (Top Right)
            draw.text((width - 250, 50), "nambac.xyz", font=brand_font, fill="black")

            # 5. Save
            timestamp = int(time.time())
            filename = f"og_{timestamp}.png"
            filepath = os.path.join(self.og_dir, filename)
            
            image.save(filepath)
            print(f"✅ OG Image generated (Glass-Comic): {filename}")
            
            return filename
            
        except Exception as e:
            print(f"❌ OG Generation Error: {str(e)}")
            return None

    async def generate_image(
        self, prompt: str, style: str = "vivid", size: str = "1024x1024"
    ) -> Optional[dict]:
        """
        DALL-E 3로 이미지 생성

        Args:
            prompt: 이미지 생성 프롬프트
            style: 'vivid' (선명) or 'natural' (자연스러움)
            size: 이미지 크기 ('1024x1024', '1792x1024', '1024x1792')

        Returns:
            dict: {'filename': str, 'url': str} or None
        """
        if not self.api_key:
            print("❌ Error: OPENAI_API_KEY not configured.")
            return None

        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            }

            payload = {
                "model": "dall-e-3",
                "prompt": prompt,
                "n": 1,
                "size": size,
                "style": style,
                "response_format": "b64_json",  # Base64로 직접 받아서 저장
            }

            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{self.base_url}/images/generations", headers=headers, json=payload
                )
                response.raise_for_status()
                data = response.json()

                # Base64 이미지 데이터 추출
                b64_image = data["data"][0]["b64_json"]
                revised_prompt = data["data"][0].get("revised_prompt", prompt)

                # 이미지 파일로 저장
                filename = self._save_image(b64_image, prompt)

                print(f"✅ Image generated: {filename}")

                return {
                    "filename": filename,
                    "url": f"/images/{filename}",
                    "revised_prompt": revised_prompt,
                }

        except httpx.HTTPStatusError as e:
            print(f"❌ OpenAI API Error: {e.response.text}")
            return None
        except Exception as e:
            print(f"❌ Image generation error: {str(e)}")
            return None

    def _save_image(self, b64_image: str, prompt: str) -> str:
        """
        Base64 이미지를 파일로 저장

        Args:
            b64_image: Base64 인코딩된 이미지
            prompt: 원본 프롬프트 (파일명 생성용)

        Returns:
            str: 저장된 파일명
        """
        import base64

        # 타임스탬프 기반 파일명 생성
        timestamp = int(time.time())
        # 프롬프트에서 파일명에 적합한 키워드 추출 (최대 30자)
        keywords = " ".join(prompt.split()[:3])[:30].replace(" ", "_")

        filename = f"img_{timestamp}_{keywords}.png"
        filepath = os.path.join(self.images_dir, filename)

        # Base64 디코딩 및 파일 저장
        image_data = base64.b64decode(b64_image)
        with open(filepath, "wb") as f:
            f.write(image_data)

        return filename

    async def generate_quiz_cover(self, quiz_title: str, category: str, description: str = "") -> Optional[dict]:
        """
        퀴즈 커버 이미지 생성 (질문용)
        
        ... (생략) ...
        """
        if not self.api_key:
            # API Key 없을 때 더미 이미지 반환 (테스트용)
            return {
                "filename": "grandma_roast_standing.png",
                "url": "/images/grandma_roast_standing.png",
                "revised_prompt": "Dummy image used due to missing API Key.",
            }

        content_context = f"\nDescription: {description}" if description else ""
        prompt = f"""
        Create a vibrant, eye-catching 'Korean Webtoon (Manhwa) Style' quiz cover image for:
        Title: {quiz_title}{content_context}
        Category: {category}

        Style Requirements:
        - Korean Webtoon (Manhwa) style: clean lines, vibrant shading, modern digital illustration.
        - The scene should visually represent the quiz content and description.
        - Modern, trendy aesthetic with bold colors.
        - Eye-catching typography for the title (if included).
        - 4K resolution quality, high definition.
        """

        return await self.generate_image(prompt, style="vivid")

    async def generate_question_image(
        self, question_text: str, question_number: int
    ) -> Optional[dict]:
        """
        질문별 이미지 생성
        
        ... (생략) ...
        """
        if not self.api_key:
            # API Key 없을 때 더미 이미지 반환 (테스트용)
            return {
                "filename": "grandma_roast.png",
                "url": "/images/grandma_roast.png",
                "revised_prompt": "Dummy image used due to missing API Key.",
            }

        prompt = f"""
        Create an engaging illustration for a quiz question #{question_number}:
        {question_text}

        Style:
        - Minimalist, clean design
        - Soft pastel colors or vibrant gradients
        - Abstract or metaphorical representation
        - 3D illustration style
        - Eye-catching but not distracting
        - Modern UI/UX aesthetic
        """

        return await self.generate_image(prompt, style="natural")

    async def generate_result_image(
        self, result_type: str, description: str
    ) -> Optional[dict]:
        """
        결과 유형 이미지 생성
        
        ... (생략) ...
        """
        if not self.api_key:
            # API Key 없을 때 더미 이미지 반환 (테스트용)
            return {
                "filename": "grandma_roast_standing.png",
                "url": "/images/grandma_roast_standing.png",
                "revised_prompt": "Dummy image used due to missing API Key.",
            }

        prompt = f"""
        Create a vibrant character illustration for a unique quiz result archetype:
        Type: {result_type}
        Description: {description}

        Critical Requirements:
        - NO TEXT OR LETTERS: The image must contain absolutely no text, letters, or numbers.
        - CHARACTER-CENTRIC: Focus on a single character that embodies the traits of '{result_type}'.
        - Style: 'Korean Webtoon (Manhwa)' style, clean line art, vibrant digital shading.
        - The character's pose, expression, and environment should reflect the '{description}'.
        - Modern, trendy, and expressive.
        - 4K resolution, high-quality illustration.
        """

        return await self.generate_image(prompt, style="vivid")
