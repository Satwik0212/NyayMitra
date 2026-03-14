from fastapi import APIRouter, Depends, HTTPException, Header, status
from typing import Optional
import logging

from app.models.auth_schemas import UserRegister, UserLogin, UserResponse, TokenResponse
from app.services.firebase_service import firebase_service

logger = logging.getLogger(__name__)

router = APIRouter()

async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    """Extract and verify Firebase token from Authorization header."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = authorization.split(" ")[1]
    
    try:
        # returns decoded token data (e.g., uid, email)
        decoded_token = firebase_service.verify_token(token)
        return decoded_token
    except ValueError as e:
        logger.warning(f"Failed to verify token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Auth error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication process failed",
        )

@router.post("/register", response_model=TokenResponse)
async def register_user(user_data: UserRegister):
    """
    Register a new user profile in Firestore.
    Actual user creation (email/password) should happen on the frontend using Firebase JS SDK.
    This endpoint initializes their Firestore profile.
    """
    # For a real app, the frontend sends the token after registering.
    # But for this endpoint, we just simulate creating the user profile.
    # Note: user_data.password is ignored here as auth is handled by frontend JS SDK in NyayMitra.
    
    if not firebase_service.is_available():
        raise HTTPException(status_code=503, detail="Auth service temporarily unavailable")
        
    # We don't have a UID yet if they haven't authenticated on frontend.
    # This route might be called post-registration if we passed the UID in a real scenario.
    # For now, we mock a response consistent with the requirements.
    
    # In a full flow, you would verify the token first, then create the profile.
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Please register via the frontend Firebase SDK, then call /login to create your profile."
    )

@router.post("/login", response_model=TokenResponse)
async def login_user(user_data: UserLogin):
    """
    Verify Firebase token and get/create user profile in Firestore.
    """
    try:
        decoded_token = firebase_service.verify_token(user_data.id_token)
        uid = decoded_token.get("uid")
        email = decoded_token.get("email", "")
        name = decoded_token.get("name", "")
        
        user_profile = firebase_service.get_or_create_user(uid, email, name)
        
        if "error" in user_profile:
            logger.warning(f"Error fetching/creating user profile: {user_profile['error']}")
            # We still return success but with limited data if Firestore fails 
            # while Auth succeeds.
        
        # We need to map the firestore data to the UserResponse schema safely
        # converting timestamps to strings
        safe_profile = {
            "uid": uid,
            "email": email,
            "name": user_profile.get("name", name),
            "preferred_language": user_profile.get("preferred_language", "en"),
            "location_state": user_profile.get("location_state", ""),
            "analyses_count": user_profile.get("analyses_count", 0),
            "created_at": str(user_profile.get("created_at")) if user_profile.get("created_at") else None
        }
        
        return TokenResponse(
            message="Login successful",
            user=UserResponse(**safe_profile)
        )
        
    except ValueError as e:
        logger.warning(f"Login failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login process failed"
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(user_data: dict = Depends(get_current_user)):
    """Get the current authenticated user's profile from Firestore."""
    uid = user_data.get("uid")
    email = user_data.get("email", "")
    
    # We fetch it again to get the latest analysis stats/etc
    user_profile = firebase_service.get_or_create_user(uid, email)
    
       
    safe_profile = {
        "uid": uid,
        "email": email,
        "name": user_profile.get("name", ""),
        "preferred_language": user_profile.get("preferred_language", "en"),
        "location_state": user_profile.get("location_state", ""),
        "analyses_count": user_profile.get("analyses_count", 0),
        "created_at": str(user_profile.get("created_at")) if user_profile.get("created_at") else None
    }
    
    return UserResponse(**safe_profile)
