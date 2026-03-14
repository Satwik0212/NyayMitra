import requests
import json
import time

BASE_URL = "http://localhost:8001/api/v1"

def test_analyze():
    print("\n--- Testing Document Analysis with RAG ---")
    payload = {
        "text": "My landlord is trying to evict me without notice after I complained about a leaking roof and lack of repairs. The contract says he must give 30 days notice. What are my rights under Indian law?",
        "location": "Mumbai, Maharashtra"
    }
    
    start_time = time.time()
    try:
        response = requests.post(f"{BASE_URL}/analyze", json=payload)
        duration = time.time() - start_time
        
        if response.status_code == 200:
            data = response.json()
            print(f"Success! (took {duration:.2f}s)")
            print("\nRetrieved Applicable Laws:")
            for law in data.get("applicable_laws", []):
                print(f" - {law}")
            
            print("\nSummary Snippet:")
            print(data.get("summary")[:300] + "...")
            
            # Check if history shows enrichment
            print("\nTriage Urgency:", data.get("urgency_level"))
        else:
            print(f"Failed: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Error: {e}")

def test_chat():
    print("\n--- Testing Chatbot with RAG ---")
    payload = {
        "message": "What is the penalty for dangerous driving under the Motor Vehicles Act 1988?",
        "history": []
    }
    
    start_time = time.time()
    try:
        response = requests.post(f"{BASE_URL}/chat", json=payload)
        duration = time.time() - start_time
        
        if response.status_code == 200:
            data = response.json()
            print(f"Success! (took {duration:.2f}s)")
            print("\nAI Response:")
            print(data.get("response"))
        else:
            print(f"Failed: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # Give server a moment
    test_analyze()
    print("\n" + "="*50)
    test_chat()
    print("\nVerification Complete.")
