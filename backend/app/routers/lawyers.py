from fastapi import APIRouter, Depends, HTTPException, Header
from typing import List, Optional
import logging

from app.models.lawyer_schemas import LawyerProfile, LawyerCreate, ConsultationCreate, ConsultationRequest
from app.services.lawyer_service import lawyer_service
from app.routers.auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/lawyers", tags=["Lawyers"])

@router.get("", response_model=List[LawyerProfile])
async def get_lawyers(city: Optional[str] = None, specialization: Optional[str] = None):
    """
    Search available verified lawyers.
    """
    lawyers = await lawyer_service.get_all_lawyers(city, specialization)
    return [LawyerProfile(**l) for l in lawyers]

@router.get("/{lawyer_id}", response_model=LawyerProfile)
async def get_lawyer_details(lawyer_id: str):
    """
    Fetch details for a specific lawyer by ID.
    """
    lawyer = await lawyer_service.get_lawyer_by_id(lawyer_id)
    if not lawyer:
        raise HTTPException(status_code=404, detail="Lawyer not found")
    return LawyerProfile(**lawyer)

@router.post("/register", response_model=LawyerProfile)
async def register_lawyer(lawyer_data: LawyerCreate):
    """
    Register a new lawyer profile on the platform.
    """
    result = await lawyer_service.register_lawyer(lawyer_data.model_dump())
    return LawyerProfile(**result)

@router.post("/connect-lawyer", response_model=ConsultationRequest)
async def request_consultation(
    request: ConsultationCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    User requests a consultation with a specified lawyer.
    Requires authentication.
    """
    # Verify lawyer exists
    lawyer = await lawyer_service.get_lawyer_by_id(request.lawyer_id)
    if not lawyer:
        raise HTTPException(status_code=404, detail="Lawyer not found")
        
    result = await lawyer_service.create_consultation(current_user["uid"], request.model_dump())
    return ConsultationRequest(**result)
