from typing import List
from uuid import uuid4
from datetime import datetime
from fastapi import APIRouter
from app.models.schemas import AnalysisHistoryItem, LegalDomain, UrgencyLevel

router = APIRouter(prefix="/history", tags=["History"])

@router.get("", response_model=List[AnalysisHistoryItem])
async def get_history(user_id: str):
    # Mock placeholder list
    mock_history = [
        AnalysisHistoryItem(
            id=uuid4(),
            user_id=user_id,
            timestamp=datetime.utcnow(),
            input_text="My landlord sent me an eviction notice...",
            domain=LegalDomain.PROPERTY,
            urgency_level=UrgencyLevel.URGENT
        ),
        AnalysisHistoryItem(
            id=uuid4(),
            user_id=user_id,
            timestamp=datetime.utcnow(),
            input_text="I want to file for a divorce.",
            domain=LegalDomain.FAMILY,
            urgency_level=UrgencyLevel.NORMAL
        )
    ]
    return mock_history
