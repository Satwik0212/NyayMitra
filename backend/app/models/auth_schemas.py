from pydantic import BaseModel, EmailStr
from typing import Optional

class UserRegister(BaseModel):
    email: str
    password: str  
    name: str = ""
    preferred_language: str = "en"

class UserLogin(BaseModel):
    id_token: str

class UserResponse(BaseModel):
    uid: str
    email: str
    name: str = ""
    preferred_language: str = "en"
    location_state: str = ""
    analyses_count: int = 0
    created_at: Optional[str] = None

class TokenResponse(BaseModel):
    message: str
    user: UserResponse
