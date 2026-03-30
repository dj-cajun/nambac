import json
import os
import sys

# Path to questions.json
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_FILE = os.path.join(BASE_DIR, "data", "questions.json")

def clean_text(text):
    if not text:
        return text
    
    # Check if text is repeated exactly (e.g. "ABC ABC" or "ABC. ABC.")
    # Simple heuristic: split by space/punctuation or just check length
    
    mid = len(text) // 2
    # If length is odd, it might be "ABC ABC" (7 chars, mid=3). 
    # Let's try to detect " PartA PartA " pattern more robustly.
    
    # 1. Exact repeat
    # text = "Hello Hello" -> "Hello"
    # text = "Hello. Hello." -> "Hello."
    
    # Try finding the largest repeating substring that covers the whole string
    n = len(text)
    for i in range(1, n // 2 + 1):
        if n % i == 0:
            pattern = text[:i]
            if pattern * (n // i) == text:
                print(f"  > Fixed exact repeat: '{text}' -> '{pattern}'")
                return pattern
                
    # 2. Repeat with separator (high priority for '|')
    if "|" in text:
        parts = text.split("|")
        # If 2 parts and they are roughly equal (ignoring whitespace)
        if len(parts) == 2:
            p1 = parts[0].strip()
            p2 = parts[1].strip()
            if p1 == p2:
                print(f"  > Fixed '|' repeat: '{text[:20]}...' -> '{p1[:20]}...'")
                return p1

    # Split by common separators
    
    # Split by common separators
    separators = [" ", ". ", "? ", "! ", "\n"]
    
    # Try splitting in half
    # Check if first half == second half roughly
    
    # Simple check: string == part + separator + part
    # "A. A." -> part="A.", separator=""? No. "A." + " " + "A."
    
    # Let's try splitting by likely delimiters
    # "Did you know? Did you know?"
    
    # Heuristic: Check if the string consists of two identical halves possibly separated by space
    # Candidate 1: text[:len/2] == text[len/2:] (handled above if no space)
    # Candidate 2: text[:len/2].strip() == text[len/2:].strip()
    
    first_half = text[:len(text)//2].strip()
    second_half = text[len(text)//2:].strip()
    
    # "ABC. ABC." -> len 9. 9//2=4.
    # text[:4] = "ABC."
    # text[4:] = " ABC." -> strip -> "ABC."
    
    if first_half == second_half and len(first_half) > 3:
         print(f"  > Fixed half-split repeat: '{text}' -> '{first_half}'")
         return first_half

    # Check "ABC ABC" with space in middle
    # text index of middle space
    
    # Maybe use regex or just simple string slicing for robustness
    # "Câu hỏi 1? Câu hỏi 1?"
    
    # Another common case: "Text.Text." (typo without space)
    
    return text

def main():
    if not os.path.exists(DATA_FILE):
        print(f"File not found: {DATA_FILE}")
        return

    print(f"Reading {DATA_FILE}...")
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    questions = data
    if isinstance(data, dict) and "questions" in data:
        questions = data["questions"]
    
    count = 0
    updated_questions = []
    
    for q in questions:
        original_q = q.get("question_text", "")
        original_a = q.get("option_a", "")
        original_b = q.get("option_b", "")
        
        new_q = clean_text(original_q)
        new_a = clean_text(original_a)
        new_b = clean_text(original_b)
        
        if new_q != original_q or new_a != original_a or new_b != original_b:
            q["question_text"] = new_q
            q["option_a"] = new_a
            q["option_b"] = new_b
            count += 1
            
        updated_questions.append(q)

    if count > 0:
        print(f"Found and fixed {count} questions with duplicate text.")
        
        # Backup
        backup_file = DATA_FILE + ".bak"
        with open(backup_file, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Backup saved to {backup_file}")
        
        # Save
        if isinstance(data, dict) and "questions" in data:
            data["questions"] = updated_questions
        else:
            data = updated_questions
            
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print("Successfully updated questions.json")
    else:
        print("No duplicates found.")

if __name__ == "__main__":
    main()
