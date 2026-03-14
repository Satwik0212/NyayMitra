import httpx
import time
import json

# Test script to measure latency improvements after RAG caching
BASE_URL = "http://localhost:8001/api/v1"

async def run_benchmark():
    async with httpx.AsyncClient(timeout=120.0) as client:
        print("\n=== NyayMitra Chat Latency Benchmark ===")
        
        # Test 1: First message (full RAG — should be ~15-20s)
        print("\n[Test 1] First message (Full RAG)...")
        start = time.time()
        r1 = await client.post(f"{BASE_URL}/chat", 
            json={"message": "What are tenant rights for deposit return?", "history": []})
        t1 = time.time() - start
        print(f"Result: {t1:.1f}s | Status: {r1.status_code}")
        
        # Test 2: Follow-up (cached RAG — should be ~5-10s)
        print("\n[Test 2] Follow-up (Cached RAG)...")
        start = time.time()
        r2 = await client.post(f"{BASE_URL}/chat",
            json={
                "message": "What documents do I need for rent court?",
                "history": [
                    {"role": "user", "content": "What are tenant rights for deposit return?"},
                    {"role": "assistant", "content": r1.json().get("response", "")}
                ]
            })
        t2 = time.time() - start
        print(f"Result: {t2:.1f}s | Status: {r2.status_code}")
        
        # Test 3: Deep follow-up (skip RAG — should be ~3-8s)
        print("\n[Test 3] Deep follow-up (No RAG)...")
        start = time.time()
        r3 = await client.post(f"{BASE_URL}/chat",
            json={
                "message": "How long does the court process take?",
                "history": [
                    {"role": "user", "content": "What are tenant rights for deposit return?"},
                    {"role": "assistant", "content": "Under Transfer of Property Act..."},
                    {"role": "user", "content": "What documents do I need?"},
                    {"role": "assistant", "content": "You need rental agreement..."}
                ]
            })
        t3 = time.time() - start
        print(f"Result: {t3:.1f}s | Status: {r3.status_code}")
        
        print("\n" + "="*40)
        print(f"SUMMARY OF IMPROVEMENTS:")
        print(f"1. First Message:   {t1:.1f}s")
        print(f"2. Cached RAG:      {t2:.1f}s (Ratio: {t1/t2:.1f}x faster)")
        print(f"3. Skipped RAG:     {t3:.1f}s (Ratio: {t1/t3:.1f}x faster)")
        print("="*40)

if __name__ == "__main__":
    import asyncio
    asyncio.run(run_benchmark())
