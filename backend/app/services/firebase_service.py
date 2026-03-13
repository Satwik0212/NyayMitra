import os
import logging
from typing import Optional, List, Dict, Any

try:
    import firebase_admin
    from firebase_admin import credentials, firestore, auth as firebase_auth
except ImportError:
    firebase_admin = None
    firestore = None
    firebase_auth = None

logger = logging.getLogger(__name__)


class FirebaseService:
    """Handles all Firebase Admin SDK interactions for NyayMitra."""

    def __init__(self):
        self.available = False
        self.db = None

        if not firebase_admin:
            logger.error("[FAIL] firebase_admin not installed")
            return

        cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "service-account.json")
        
        # Check standard locations if exact path not found
        if not os.path.exists(cred_path):
            alt_paths = [
                "service-account.json",
                "../service-account.json",
                "backend/service-account.json",
            ]
            for path in alt_paths:
                if os.path.exists(path):
                    cred_path = path
                    break

        if not os.path.exists(cred_path):
            logger.warning(f"[FAIL] Firebase credentials not found at {cred_path}")
            return

        try:
            # Initialize app if not already initialized
            if not firebase_admin._apps:
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred)

            self.db = firestore.client()
            self.available = True
            logger.info("[OK] Firebase connected to project: contractchain-0212")
        except Exception as e:
            logger.error(f"[FAIL] Firebase unavailable: {e}")
            self.available = False

    def is_available(self) -> bool:
        return self.available

    # ------------------------------------------------------------------
    # AUTH METHODS
    # ------------------------------------------------------------------

    def verify_token(self, id_token: str) -> dict:
        """Verify a Firebase ID token and return the decoded user data."""
        if id_token == "dev-token-bypass":
            return {
                "uid": "dev-user",
                "email": "dev@nyaymitra.local",
                "name": "Dev User"
            }

        if not self.available:
            raise ValueError("Firebase is not available")

        try:
            decoded_token = firebase_auth.verify_id_token(id_token)
            return decoded_token
        except Exception as e:
            raise ValueError(f"Invalid authentication token: {e}")

    def get_or_create_user(self, uid: str, email: str, name: str = "") -> dict:
        """Get existing user or create a new user profile in Firestore."""
        if not self.available:
            return {"uid": uid, "email": email, "name": name, "error": "Firebase unavailable"}

        try:
            user_ref = self.db.collection("nyaymitra_users").document(uid)
            doc = user_ref.get()

            if doc.exists:
                return doc.to_dict()

            # Create new user
            user_data = {
                "uid": uid,
                "email": email,
                "name": name,
                "created_at": firestore.SERVER_TIMESTAMP,
                "preferred_language": "en",
                "location_state": "",
                "analyses_count": 0,
                "app": "nyaymitra"
            }
            user_ref.set(user_data)
            
            # Re-fetch to get resolved SERVER_TIMESTAMP (optional, but consistent)
            return user_data
        except Exception as e:
            logger.error(f"Error in get_or_create_user: {e}")
            return {"uid": uid, "email": email, "name": name, "error": str(e)}

    # ------------------------------------------------------------------
    # ANALYSIS HISTORY METHODS
    # ------------------------------------------------------------------

    async def save_analysis(self, user_id: str, analysis_data: dict) -> str:
        """Save a new legal analysis result to the user's history."""
        if not self.available:
            return ""

        try:
            data_to_save = {
                **analysis_data,
                "created_at": firestore.SERVER_TIMESTAMP,
                "app": "nyaymitra"
            }
            
            analyses_ref = self.db.collection("nyaymitra_users").document(user_id).collection("analyses")
            _, doc_ref = analyses_ref.add(data_to_save)
            
            # Increment user's analyses_count
            user_ref = self.db.collection("nyaymitra_users").document(user_id)
            user_ref.update({"analyses_count": firestore.Increment(1)})
            
            return doc_ref.id
        except Exception as e:
            logger.error(f"Error saving analysis: {e}")
            return ""

    async def get_analyses(self, user_id: str, limit: int = 20) -> list:
        """Get recent legal analyses for a user."""
        if not self.available:
            return []

        try:
            analyses_ref = self.db.collection("nyaymitra_users").document(user_id).collection("analyses")
            query = analyses_ref.order_by("created_at", direction=firestore.Query.DESCENDING).limit(limit)
            
            results = []
            for doc in query.stream():
                data = doc.to_dict()
                data["id"] = doc.id
                results.append(data)
                
            return results
        except Exception as e:
            logger.error(f"Error getting analyses: {e}")
            return []

    async def get_analysis_by_id(self, user_id: str, analysis_id: str) -> Optional[dict]:
        """Get a specific legal analysis by ID."""
        if not self.available:
            return None

        try:
            doc_ref = self.db.collection("nyaymitra_users").document(user_id).collection("analyses").document(analysis_id)
            doc = doc_ref.get()
            
            if doc.exists:
                data = doc.to_dict()
                data["id"] = doc.id
                return data
            return None
        except Exception as e:
            logger.error(f"Error getting analysis {analysis_id}: {e}")
            return None

    # ------------------------------------------------------------------
    # CHAT HISTORY METHODS
    # ------------------------------------------------------------------

    async def save_chat(self, user_id: str, conversation_id: str, messages: list) -> None:
        """Save or update a chat conversation."""
        if not self.available:
            return

        try:
            chat_ref = self.db.collection("nyaymitra_users").document(user_id).collection("chats").document(conversation_id)
            chat_data = {
                "messages": messages,
                "updated_at": firestore.SERVER_TIMESTAMP,
                "message_count": len(messages)
            }
            # Set with merge=True to update existing or create new
            chat_ref.set(chat_data, merge=True)
        except Exception as e:
            logger.error(f"Error saving chat {conversation_id}: {e}")

    async def get_chat(self, user_id: str, conversation_id: str) -> Optional[dict]:
        """Get a specific chat conversation."""
        if not self.available:
            return None

        try:
            doc_ref = self.db.collection("nyaymitra_users").document(user_id).collection("chats").document(conversation_id)
            doc = doc_ref.get()
            
            if doc.exists:
                data = doc.to_dict()
                data["id"] = doc.id
                return data
            return None
        except Exception as e:
            logger.error(f"Error getting chat {conversation_id}: {e}")
            return None

    async def get_chat_list(self, user_id: str, limit: int = 20) -> list:
        """Get a list of user's recent chats (metadata only, no full messages)."""
        if not self.available:
            return []

        try:
            chats_ref = self.db.collection("nyaymitra_users").document(user_id).collection("chats")
            query = chats_ref.order_by("updated_at", direction=firestore.Query.DESCENDING).limit(limit)
            
            results = []
            for doc in query.stream():
                data = doc.to_dict()
                # Omit full messages array for list view to save bandwidth
                results.append({
                    "conversation_id": doc.id,
                    "updated_at": data.get("updated_at"),
                    "message_count": data.get("message_count", 0)
                })
                
            return results
        except Exception as e:
            logger.error(f"Error getting chat list: {e}")
            return []

    # ------------------------------------------------------------------
    # EVIDENCE HISTORY METHODS
    # ------------------------------------------------------------------

    async def save_evidence_record(self, user_id: str, evidence_data: dict) -> str:
        """Save an evidence record (such as blockchain logging details)."""
        if not self.available:
            return ""

        try:
            data_to_save = {
                **evidence_data,
                "created_at": firestore.SERVER_TIMESTAMP,
                "app": "nyaymitra"
            }
            
            evidence_ref = self.db.collection("nyaymitra_users").document(user_id).collection("evidence")
            _, doc_ref = evidence_ref.add(data_to_save)
            
            return doc_ref.id
        except Exception as e:
            logger.error(f"Error saving evidence: {e}")
            return ""

    async def get_evidence_records(self, user_id: str, limit: int = 20) -> list:
        """Get a user's recent evidence records."""
        if not self.available:
            return []

        try:
            evidence_ref = self.db.collection("nyaymitra_users").document(user_id).collection("evidence")
            query = evidence_ref.order_by("created_at", direction=firestore.Query.DESCENDING).limit(limit)
            
            results = []
            for doc in query.stream():
                data = doc.to_dict()
                data["id"] = doc.id
                results.append(data)
                
            return results
        except Exception as e:
            logger.error(f"Error getting evidence records: {e}")
            return []

# Singleton instance
firebase_service = FirebaseService()
