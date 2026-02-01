import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

url = os.environ.get("VITE_SUPABASE_URL")
key = os.environ.get("VITE_SUPABASE_ANON_KEY")

if not url or not key:
    print("Error: credentials not found in .env")
    exit(1)

# Initialize Supabase client
supabase: Client = create_client(url, key)

# Define the new quiz data
new_quiz = {
    "title": "호치민 전생의 킹받는 MZ 테스트",
    "category": "Trendy",
    "description": "호치민 1군 카페에서 에어팟 끼고 코딩하는 척하던 너... 전생에는 뭐였을까? 킹받는 결과 주의! ㅋㅋㅋ",
    "is_active": True,
    "image_url": "https://api.dicebear.com/9.x/micah/svg?seed=KingBad"
}

print("--- Supabase Insert Script ---")

# Attempt anonymous sign-in (if enabled)
try:
    print("Attempting to sign in anonymously...")
    auth_response = supabase.auth.sign_in_anonymously()
    if auth_response.user:
        print(f"Signed in as: {auth_response.user.id}")
except Exception as e:
    print(f"Anonymous login warning: {e}")
    print("Proceeding with insert attempt (might fail if RLS requires auth)...")

# Insert data
try:
    print(f"Inserting quiz: {new_quiz['title']}")
    response = supabase.table("quizzes").insert(new_quiz).execute()
    print("SUCCESS! Inserted quiz:")
    print(response)
except Exception as e:
    print(f"ERROR: Failed to insert quiz.")
    print(f"Details: {e}")
    print("\nPossible causes:")
    print("1. Row Level Security (RLS) policies prevent anonymous inserts.")
    print("2. Anonymous authentication is disabled in the project.")
    print("3. 'quizzes' table structure mismatch.")
