import os
import asyncio
from dotenv import load_dotenv

# Path adjust
import sys
sys.path.append(os.getcwd())

async def debug_chat():
    load_dotenv()
    from app.services.llm_orchestrator import orchestrator
    
    prompt = "Hello, testing Groq 70B connectivity."
    print("\n=== Chat Debug ===")
    try:
        res = await orchestrator.generate_chat(prompt, task="chat")
        print(f"Success! Content: {res.get('content', '')[:100]}...")
    except Exception as e:
        print(f"FAILED: {e}")

if __name__ == "__main__":
    asyncio.run(debug_chat())
