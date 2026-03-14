from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from enum import Enum
from datetime import datetime
from uuid import UUID

class LawyerStatus(str, Enum):
    AVAILABLE = "available"
    BUSY = "busy"
    OFFLINE = "offline"

class ConsultationStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    COMPLETED = "completed"

class LawyerBase(BaseModel):
    name: str
    specializations: List[str]
    experience_years: int = Field(ge=0)
    location_city: str
    location_state: str
    languages: List[str]
    about: str
    hourly_rate: int
    contact_email: EmailStr

class LawyerCreate(LawyerBase):
    pass

class LawyerProfile(LawyerBase):
    id: str
    rating: float = 0.0
    reviews_count: int = 0
    status: LawyerStatus = LawyerStatus.AVAILABLE
    verified: bool = False
    created_at: datetime
    
class ConsultationCreate(BaseModel):
    lawyer_id: str
    case_summary: str
    urgency: str
    analysis_id: Optional[str] = None
    
class ConsultationRequest(BaseModel):
    id: str
    user_id: str
    lawyer_id: str
    case_summary: str
    urgency: str
    analysis_id: Optional[str] = None
    status: ConsultationStatus = ConsultationStatus.PENDING
    created_at: datetime
    updated_at: datetime
