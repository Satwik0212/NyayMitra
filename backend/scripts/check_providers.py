import os
import asyncio
from dotenv import load_dotenv

# Path adjust
import sys
import os
sys.path.append(os.getcwd()) # Should be in /backend

async def diag():
    load_dotenv()
    from app.services.llm_orchestrator import orchestrator
    
    # Check providers
    print("\n=== Provider Diagnostics ===")
    print(f"GROQ:   {'OK' if orchestrator.groq.is_available() else 'FAIL'}")
    print(f"GEMINI: {'OK' if orchestrator.gemini.is_available() else 'FAIL'}")
    
    # Try a small test for Gemini
    if orchestrator.gemini.is_available():
        print("\nTesting Gemini 2.0 Flash...")
        try:
            res = await orchestrator.gemini.generate("Hello, say 'Gemini is online'")
            if res.success:
                print(f"Success: {res.content}")
            else:
                print(f"Failure: {res.error}")
        except Exception as e:
            print(f"Exception: {e}")

if __name__ == "__main__":
    asyncio.run(diag())
