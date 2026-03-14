import httpx
import os
import json
from dotenv import load_dotenv

load_dotenv()

jwt = os.getenv("PINATA_JWT")
print(f"JWT exists: {bool(jwt)}")
print(f"JWT first 20 chars: {jwt[:20] if jwt else 'MISSING'}")

# Test 1: Check Pinata authentication
headers = {"Authorization": f"Bearer {jwt}"}
try:
    r = httpx.get("https://api.pinata.cloud/data/testAuthentication", headers=headers, timeout=10)
    print(f"\nAuth test status: {r.status_code}")
    print(f"Auth test response: {r.text}")
except Exception as e:
    print(f"\nAuth test failed with exception: {e}")

# Test 2: Try uploading a small file
test_content = b"Test file for NyayMitra evidence upload"
files = {"file": ("test.txt", test_content, "text/plain")}
metadata = json.dumps({"name": "test.txt", "keyvalues": {"app": "nyaymitra"}})
options = json.dumps({"cidVersion": 1})

try:
    r2 = httpx.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        headers=headers,
        files=files,
        data={"pinataMetadata": metadata, "pinataOptions": options},
        timeout=30
    )
    print(f"\nUpload status: {r2.status_code}")
    print(f"Upload response: {r2.text}")
except Exception as e:
    print(f"\nUpload failed with exception: {e}")
