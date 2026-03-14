
import asyncio
import json
import os
import sys

# Add backend directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

# Mock dependencies before importing lawyer_service
os.environ["FIREBASE_CREDENTIALS_JSON"] = "{}"

from app.services.lawyer_service import LawyerService

async def test_osm_discovery():
    service = LawyerService()
    
    # Mock Firestore behavior by force-setting db and mocking its methods
    class MockDoc:
        def __init__(self, data):
            self._data = data
        def to_dict(self):
            return self._data
            
    class MockQuery:
        def where(self, *args, **kwargs):
            return self
        def get(self):
            return [MockDoc({
                "id": "firestore_1",
                "name": "Platform Lawyer (Firestore)",
                "specializations": ["GENERAL"],
                "experience_years": 10,
                "location_city": "Delhi",
                "location_state": "Delhi",
                "languages": ["English"],
                "about": "Registered lawyer",
                "hourly_rate": 1000,
                "contact_email": "test@example.com",
                "rating": 5.0,
                "reviews_count": 1,
                "status": "available",
                "verified": True,
                "created_at": "2024-01-01T00:00:00"
            })]
            
    class MockDB:
        def collection(self, name):
            return MockQuery()

    service.db = MockDB()
    service._initialized = True
    
    # Test 1: Fetch from OSM
    print("Testing OSM fetch for Delhi...")
    lawyers_osm = await service.fetch_osm_lawyers("Delhi")
    print(f"Found {len(lawyers_osm)} lawyers from OSM.")
    
    # Test 2: Merging
    print("\nTesting get_all_lawyers merge...")
    all_lawyers = await service.get_all_lawyers(city="Delhi")
    
    print(f"Total merged lawyers: {len(all_lawyers)}")
    print("First 3 lawyers in list:")
    for l in all_lawyers[:3]:
        source = "OSM" if l['id'].startswith("osm_") else "Firestore"
        print(f"- {l['name']} (ID: {l['id']}, Source: {source})")

    # Verify order: Platform first
    if all_lawyers and not all_lawyers[0]['id'].startswith("osm_"):
        print("SUCCESS: Firestore lawyers appear before OSM lawyers.")
    else:
        print("FAILURE: Firestore lawyers did not appear first.")

if __name__ == "__main__":
    asyncio.run(test_osm_discovery())

if __name__ == "__main__":
    asyncio.run(test_osm_discovery())
