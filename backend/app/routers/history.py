from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from app.models.schemas import AnalysisHistoryItem, LegalDomain, UrgencyLevel
from app.services.firebase_service import firebase_service
from app.routers.auth import get_current_user
from datetime import datetime
import logging
from uuid import UUID

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/history", tags=["History"])

@router.get("", response_model=List[AnalysisHistoryItem])
async def get_history(current_user: dict = Depends(get_current_user)):
    if not firebase_service.is_available():
        return []
        
    analyses_raw = await firebase_service.get_analyses(current_user["uid"])
    history_items = []
    
    for item in analyses_raw:
        try:
            domain_str = item.get("domain", "CIVIL")
            domain_enum = LegalDomain.CIVIL
            if hasattr(domain_str, 'name'):
                domain_enum = domain_str
            else:
                for d in LegalDomain:
                    if d.name == domain_str or d.value == domain_str:
                        domain_enum = d
                        break

            urgency_str = item.get("urgency_level", "NORMAL")
            urgency_enum = UrgencyLevel.NORMAL
            if hasattr(urgency_str, 'name'):
                urgency_enum = urgency_str
            else:
                for u in UrgencyLevel:
                    if u.name == urgency_str or u.value == urgency_str:
                        urgency_enum = u
                        break

            # Handle UUID formatting
            item_id = item.get("id")
            if isinstance(item_id, str):
                item_id = UUID(item_id)
                
            history_items.append(AnalysisHistoryItem(
                id=item_id,
                user_id=current_user["uid"],
                timestamp=item.get("created_at") or datetime.utcnow(),
                input_text=item.get("dispute_text", item.get("text", "No text provided")),
                domain=domain_enum,
                urgency_level=urgency_enum
            ))
        except Exception as e:
            logger.warning(f"Failed to map history item {item.get('id')}: {e}")
            continue
            
    return history_items

@router.get("/chats")
async def get_chats(current_user: dict = Depends(get_current_user)):
    if not firebase_service.is_available():
        return []
    return await firebase_service.get_chat_list(current_user["uid"])

@router.get("/evidence")
async def get_evidence(current_user: dict = Depends(get_current_user)):
    if not firebase_service.is_available():
        return []
    return await firebase_service.get_evidence_records(current_user["uid"])

@router.get("/{analysis_id}")
async def get_single_analysis(analysis_id: str, current_user: dict = Depends(get_current_user)):
    if not firebase_service.is_available():
        raise HTTPException(status_code=503, detail="History service temporarily offine")
        
    analysis = await firebase_service.get_analysis_by_id(current_user["uid"], analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    return analysis
