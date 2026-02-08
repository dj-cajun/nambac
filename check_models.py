import requests
import os
from dotenv import load_dotenv

load_dotenv(override=True)

key = os.getenv("OPENROUTER_API_KEY")
if not key:
    print("No key found")
    exit(1)

headers = {"Authorization": f"Bearer {key}"}
response = requests.get("https://openrouter.ai/api/v1/models", headers=headers)
if response.status_code != 200:
    print(f"Error: {response.text}")
    exit(1)
    
models = response.json()["data"]
print("Available Google Models & Image Models:")
for m in models:
    name = m["id"]
    if "google" in name or "image" in name or "flux" in name or "dall-e" in name:
        print(name)
