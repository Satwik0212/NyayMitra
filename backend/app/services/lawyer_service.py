from typing import List, Optional, Dict, Any
from google.cloud import firestore
import logging
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)

class LawyerService:
    def __init__(self):
        self.db: Optional[Any] = None
        self._initialized = False
        
    def initialize(self, fd_db: Any):
        """Initializes with the active Firestore client from firebase_service"""
        self.db = fd_db
        self._initialized = True
        
    def is_available(self) -> bool:
        return self._initialized and self.db is not None
        
    async def get_all_lawyers(self, city: Optional[str] = None, specialization: Optional[str] = None) -> List[Dict[str, Any]]:
        """Fetch verified lawyers, optionally filtered by city or specialty."""
        if not self.is_available():
            logger.warning("Firestore not initialized for lawyers. Returning mock data.")
            return self._get_mock_lawyers()
            
        try:
            query = self.db.collection('lawyers').where('verified', '==', True)
            
            if city:
                query = query.where('location_city', '==', city)
            
            # Note: Firestore array-contains can only be used on one field at a time
            if specialization:
                query = query.where('specializations', 'array_contains', specialization)
                
            docs = query.get()
            return [doc.to_dict() for doc in docs]
        except Exception as e:
            logger.error(f"Error fetching lawyers: {e}")
            return self._get_mock_lawyers()
            
    async def get_lawyer_by_id(self, lawyer_id: str) -> Optional[Dict[str, Any]]:
        if not self.is_available():
            mocks = self._get_mock_lawyers()
            for m in mocks:
                if m["id"] == lawyer_id:
                    return m
            return None
            
        try:
            doc_ref = self.db.collection('lawyers').document(lawyer_id)
            doc = doc_ref.get()
            if doc.exists:
                return doc.to_dict()
            return None
        except Exception as e:
            logger.error(f"Error fetching lawyer {lawyer_id}: {e}")
            return None
            
    async def register_lawyer(self, lawyer_data: Dict[str, Any]) -> Dict[str, Any]:
        """Registers a new lawyer profile."""
        lawyer_id = str(uuid.uuid4())
        
        data = {
            **lawyer_data,
            "id": lawyer_id,
            "rating": 0.0,
            "reviews_count": 0,
            "status": "available",
            "verified": False, # Requires admin approval
            "created_at": datetime.utcnow()
        }
        
        if self.is_available():
            try:
                self.db.collection('lawyers').document(lawyer_id).set(data)
            except Exception as e:
                logger.error(f"Failed to register lawyer: {e}")
                
        return data
        
    async def create_consultation(self, user_id: str, consultation_data: Dict[str, Any]) -> Dict[str, Any]:
        """Creates a booking request between user and lawyer."""
        consult_id = str(uuid.uuid4())
        
        data = {
            "id": consult_id,
            "user_id": user_id,
            **consultation_data,
            "status": "pending",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        if self.is_available():
            try:
                self.db.collection('consultations').document(consult_id).set(data)
            except Exception as e:
                logger.error(f"Failed to create consultation: {e}")
                
        return data
        
    def _get_mock_lawyers(self) -> List[Dict[str, Any]]:
        """Fallback mock data if Firebase isn't hooked up."""
        return [
            {
                "id": "mock-lawyer-1",
                "name": "Adv. Ramesh Sharma",
                "specializations": ["CIVIL", "PROPERTY", "FAMILY"],
                "experience_years": 15,
                "location_city": "Delhi",
                "location_state": "Delhi",
                "languages": ["English", "Hindi"],
                "about": "Expert in property disputes and civil litigation with 15 years of active practice at the Delhi High Court.",
                "hourly_rate": 2000,
                "contact_email": "ramesh@example.com",
                "rating": 4.8,
                "reviews_count": 124,
                "status": "available",
                "verified": True,
                "created_at": datetime.utcnow()
            },
            {
                "id": "mock-lawyer-2",
                "name": "Adv. Priya Desai",
                "specializations": ["CONSUMER", "CYBER", "CORPORATE"],
                "experience_years": 8,
                "location_city": "Mumbai",
                "location_state": "Maharashtra",
                "languages": ["English", "Marathi", "Hindi"],
                "about": "Specializing in consumer protection and cyber fraud cases. High success rate in consumer tribunal settlements.",
                "hourly_rate": 1500,
                "contact_email": "priya@example.com",
                "rating": 4.9,
                "reviews_count": 86,
                "status": "available",
                "verified": True,
                "created_at": datetime.utcnow()
            },
            {
                "id": "mock-lawyer-3",
                "name": "Adv. Karthik Reddy",
                "specializations": ["CRIMINAL", "CIVIL"],
                "experience_years": 22,
                "location_city": "Bengaluru",
                "location_state": "Karnataka",
                "languages": ["English", "Kannada", "Telugu"],
                "about": "Senior advocate focusing on criminal defense and high-stakes civil litigation. Former public prosecutor.",
                "hourly_rate": 3500,
                "contact_email": "karthik@example.com",
                "rating": 4.7,
                "reviews_count": 210,
                "status": "available",
                "verified": True,
                "created_at": datetime.utcnow()
            }
        ]

# Global instance similar to firebase_service
lawyer_service = LawyerService()
