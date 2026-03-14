import httpx
import os
import time

# Create a small test file
test_content = b"This is a test legal document for NyayMitra evidence verification."
test_filename = "test_evidence_final.pdf"

with open(test_filename, "wb") as f:
    f.write(test_content)

def test_upload():
    print(f"--- Testing Evidence Upload ---")
    try:
        with open(test_filename, "rb") as f:
            files = [("files", (test_filename, f, "application/pdf"))]
            data = {"descriptions": ["Test legal document for IPFS/Blockchain verification"]}
            
            # Using port 8001 as per previous sessions
            r = httpx.post(
                "http://127.0.0.1:8001/api/v1/blockchain/evidence",
                files=files,
                data=data,
                timeout=60.0
            )
            
        print(f"Status Code: {r.status_code}")
        if r.status_code == 200:
            res = r.json()
            print("Success: ", res.get("success"))
            print("Evidence ID: ", res.get("evidence_id"))
            
            for file in res.get("files", []):
                print(f"File: {file['filename']}")
                print(f"  IPFS Success: {file['ipfs_success']}")
                if not file['ipfs_success']:
                    print(f"  IPFS Error: {res.get('blockchain', {}).get('error', 'Check server logs')}")
                else:
                    print(f"  IPFS URL: {file['ipfs_url']}")
            
            print(f"Blockchain Success: {res.get('blockchain', {}).get('success')}")
            print(f"TX Hash: {res.get('blockchain', {}).get('tx_hash')}")
        else:
            print(f"Error Response: {r.text}")
            
    except Exception as e:
        print(f"Request failed: {e}")
    finally:
        if os.path.exists(test_filename):
            os.remove(test_filename)

if __name__ == "__main__":
    test_upload()
