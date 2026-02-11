import os
import httpx
import json
import base64
import asyncio
from io import BytesIO
from PIL import Image
from typing import Optional, Dict, Any

class AIServiceManager:
    """AI 외부 서비스 관리자 (Gemini 연동) - Fallback to Gemini Vision for classification"""

    def __init__(self):
        self.hf_key = os.getenv("HUGGINGFACE_API_KEY")
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        self.cat_dog_model = "akahana/vit-base-cats-vs-dogs"

    async def run_cat_dog_analysis(self, name: str, image_b64: str) -> Optional[Dict[str, Any]]:
        """
        1. Gemini Vision으로 사진 분류 (개 vs 고양이)
        2. Gemini로 병맛 분석 생성
        """
        try:
            # Strip prefix if exists
            if "," in image_b64:
                image_b64 = image_b64.split(",")[1]
            
            # Preprocess image
            processed_b64 = await self._preprocess_image(image_b64)
            
            # 1. Gemini Vision Classification (Fallback since HF API is deprecated)
            classification = await self._classify_image_gemini(processed_b64)
            if not classification:
                # Return default if classification fails
                classification = {"cat": 0.5, "dog": 0.5}

            # 2. Gemini Analysis
            analysis = await self._generate_byeongmat_analysis(name, classification)
            return analysis

        except Exception as e:
            print(f"❌ AI Service Error: {str(e)}")
            return None

    async def _preprocess_image(self, image_b64: str) -> str:
        """이미지 전처리: 224x224로 리사이즈"""
        try:
            image_data = base64.b64decode(image_b64)
            img = Image.open(BytesIO(image_data))
            
            # Convert to RGB if needed (handles RGBA/Grayscale)
            if img.mode != "RGB":
                img = img.convert("RGB")
            img = img.resize((224, 224), Image.Resampling.LANCZOS)
            
            # Save back to bytes
            buffer = BytesIO()
            img.save(buffer, format="JPEG", quality=85)
            return base64.b64encode(buffer.getvalue()).decode("utf-8")
        except Exception as e:
            print(f"⚠️ Image Preprocessing failed: {str(e)}")
            return image_b64  # Fallback to original

    async def _classify_image_gemini(self, image_b64: str) -> Optional[Dict[str, float]]:
        """Gemini Vision으로 이미지 분류 (HF API 대체)"""
        if not self.gemini_key:
            print("⚠️ No GEMINI_API_KEY found.")
            return None

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={self.gemini_key}"
        
        prompt = """Analyze this image and determine if it shows more cat-like or dog-like features.
        
        OUTPUT JSON ONLY:
        {
          "cat": [0.0-1.0 confidence score],
          "dog": [0.0-1.0 confidence score]
        }
        
        The two scores should sum to 1.0. Classify based on visual features - this could be a person, an animal, or any subject.
        If it looks like a cat or has cat-like features (aloof, sleek, independent vibes), score cat higher.
        If it looks like a dog or has dog-like features (friendly, energetic, loyal vibes), score dog higher.
        """
        
        payload = {
            "contents": [{
                "parts": [
                    {"text": prompt},
                    {
                        "inline_data": {
                            "mime_type": "image/jpeg",
                            "data": image_b64
                        }
                    }
                ]
            }],
            "generationConfig": {
                "response_mime_type": "application/json"
            }
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=payload)
            if response.status_code == 200:
                data = response.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                result = json.loads(text)
                print(f"✅ Gemini Classification: {result}")
                return result
            
            print(f"❌ Gemini Classification Error: {response.status_code} - {response.text}")
            return None

    async def _generate_byeongmat_analysis(self, name: str, classification: Dict[str, float]) -> Optional[Dict[str, Any]]:
        """Gemini로 병맛 분석 생성"""
        if not self.gemini_key:
            return None

        # Determine dominant animal (handle both list and float responses)
        cat_score = classification.get("cat", 0)
        dog_score = classification.get("dog", 0)
        
        # Extract from list if needed
        if isinstance(cat_score, list):
            cat_score = cat_score[0] if cat_score else 0
        if isinstance(dog_score, list):
            dog_score = dog_score[0] if dog_score else 0
        
        # Ensure float
        cat_score = float(cat_score)
        dog_score = float(dog_score)
        
        dominant = "Cat" if cat_score > dog_score else "Dog"
        # Prepare percentages for prompt
        cat_percent = int(cat_score * 100)
        dog_percent = int(dog_score * 100)

        prompt = f"""
        User Name: {name}
        AI Analysis: {cat_percent}% Cat-like, {dog_percent}% Dog-like.
        Dominant: {dominant}

        Task: Generate a PLAYFUL, CHEEKY, and AFFECTIONATE ROASTING analysis in VIETNAMESE.
        Tone: Funny, Gen-Z slang, "Sen & Boss" vibe, slightly exaggerated but cute.
        
        If Dog-like: Call them "Good Boy/Girl", "Golden Retriever energy", "Loyal but goofy".
        If Cat-like: Call them "Hoàng Thượng", "Tsundere", "Sassy but sweet".

        Output JSON Format ONLY:
        {{
          "dominant_animal": "{dominant}",
          "cat_percent": {cat_percent},
          "dog_percent": {dog_percent},
          "title": "{name} là {cat_percent}% Mèo \u0026 {dog_percent}% Chó",
          "description": "[Funny & playful description. E.g., 'Nhìn mặt là biết thánh meme...', 'Chắc chắn là trùm phá hoại...']",
          "traits": [
            "✨ [Vibe/Aura description]",
            "❤️ [Love/Affection style]",
            "🤝 [Loyalty/Friendship style]"
          ]
        }}
        """

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={self.gemini_key}"
        
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }],
            "generationConfig": {
                "response_mime_type": "application/json"
            }
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=payload)
            if response.status_code == 200:
                data = response.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                parsed_json = json.loads(text)
                
                # Ensure it returns a dict, not a list
                if isinstance(parsed_json, list):
                    return parsed_json[0] if parsed_json else None
                return parsed_json
            
            print(f"❌ Gemini Error: {response.status_code} - {response.text}")
            return None
