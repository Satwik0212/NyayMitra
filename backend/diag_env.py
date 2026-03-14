import os
from dotenv import load_dotenv

# Try loading from explicit path
load_dotenv("backend/.env")
print("Try 1 (backend/.env):", os.getenv("PINATA_JWT", "NOT FOUND")[:20] if os.getenv("PINATA_JWT") else "NOT FOUND")

load_dotenv(".env")  
print("Try 2 (.env):", os.getenv("PINATA_JWT", "NOT FOUND")[:20] if os.getenv("PINATA_JWT") else "NOT FOUND")

# Show all env vars that start with PINATA
for key, val in os.environ.items():
    if "PINATA" in key.upper():
        print(f"Found: {key} = {val[:20]}...")

# Show the .env file location
import pathlib
env_path = pathlib.Path(".env")
print(f"\n.env exists at current dir: {env_path.exists()}")
env_path2 = pathlib.Path("backend/.env")
print(f"backend/.env exists: {env_path2.exists()}")
