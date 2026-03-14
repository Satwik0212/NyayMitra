import sys
import os
import json
import asyncio
import time

# Setup path so we can import app modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

from app.services.llm_orchestrator import orchestrator

TREE_INDEX_PROMPT = """You are a legal document indexer. Read the following 
Indian law text and create a structured tree index.

LAW TEXT:
{law_text}

Create a JSON index with this EXACT structure (respond with ONLY valid JSON, 
no markdown, no code blocks, no extra text):

{{
  "act_name": "<Full official name of the Act>",
  "act_year": <year as integer>,
  "jurisdiction": "India",
  "total_sections": <approximate number of sections>,
  "chapters": [
    {{
      "chapter_title": "<Chapter name, e.g. Chapter III: Consumer Disputes>",
      "sections_range": "<e.g. 28-42>",
      "section_titles": ["Section 28: Title", "Section 29: Title"],
      "start_line": <approximate start line in text>,
      "end_line": <approximate end line in text>,
      "summary": "<2-3 sentence summary in simple English>",
      "keywords": ["practical", "citizen", "terms", "not", "jargon"],
      "sub_sections": []
    }}
  ]
}}

RULES:
1. Include EVERY chapter in the Act — do not skip any
2. Keywords should be practical terms a common citizen would search for
   (e.g. "deposit", "refund", "landlord", "eviction", "salary", "complaint")
3. Summaries should be in simple English a non-lawyer can understand
4. section_titles should list actual section numbers with their titles
5. start_line and end_line are approximate line numbers to locate text
6. Return ONLY valid JSON"""


async def build_single_index(filename, text):
    # Reduced truncation to 20k chars to guarantee completion on free tier
    truncated = text[:20000] if len(text) > 20000 else text
    prompt = TREE_INDEX_PROMPT.format(law_text=truncated)
    
    try:
        result = await orchestrator.generate_json(prompt, task="analysis")
        return result
    except Exception as e:
        print(f"  [FAIL] {filename}: {e}")
        return None


async def main():
    corpus_dir = os.path.join(os.path.dirname(__file__), "corpus")
    indexes_dir = os.path.join(os.path.dirname(__file__), "indexes")
    os.makedirs(indexes_dir, exist_ok=True)
    
    txt_files = [f for f in os.listdir(corpus_dir) if f.endswith(".txt")]
    
    print(f"Found {len(txt_files)} corpus files")
    print("=" * 50)
    
    success = 0
    total_chapters = 0
    
    for filename in sorted(txt_files):
        filepath = os.path.join(corpus_dir, filename)
        
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            text = f.read()
        
        if len(text) < 500:
            print(f"  [SKIP] {filename} - too short ({len(text)} chars)")
            continue
        
        print(f"  Processing: {filename} ({len(text):,} chars)...")
        
        json_filename = filename.replace(".txt", ".json")
        json_path = os.path.join(indexes_dir, json_filename)
        
        if os.path.exists(json_path):
            print(f"  [SKIP] {json_filename} already exists.")
            success += 1
            continue

        index = await build_single_index(filename, text)
        
        if index and isinstance(index, dict):
            json_filename = filename.replace(".txt", ".json")
            json_path = os.path.join(indexes_dir, json_filename)
            
            with open(json_path, "w", encoding="utf-8") as f:
                json.dump(index, f, indent=2, ensure_ascii=False)
            
            chapters = len(index.get("chapters", []))
            total_chapters += chapters
            success += 1
            act = index.get("act_name", filename)
            print(f"  [OK] {act}: {chapters} chapters")
        else:
            print(f"  [FAIL] {filename}: Invalid response from LLM")
        
        print("  Waiting 60 seconds (aggressive rate limit)...")
        await asyncio.sleep(60)
    
    print("=" * 50)
    print(f"Build Complete: {success}/{len(txt_files)} files indexed")
    print(f"Total chapters: {total_chapters}")
    print(f"Saved to: {indexes_dir}")


if __name__ == "__main__":
    asyncio.run(main())
