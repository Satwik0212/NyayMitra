from fastapi import APIRouter, Depends, Header, UploadFile, File, Form, HTTPException
from typing import List, Optional
from app.models.schemas import BlockchainLogRequest, BlockchainLogResponse
from app.services.blockchain_service import blockchain_service
from app.services.evidence_service import evidence_service
from app.services.firebase_service import firebase_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/blockchain", tags=["Blockchain"])

async def optional_current_user(authorization: Optional[str] = Header(None)) -> Optional[dict]:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    try:
        token = authorization.split(" ")[1]
        return firebase_service.verify_token(token)
    except Exception:
        return None

@router.post("/log", response_model=BlockchainLogResponse)
async def log_record(request: BlockchainLogRequest):
    if not blockchain_service.is_available():
        raise HTTPException(status_code=503, detail="Blockchain service is temporarily unavailable")
        
    hash_hex = blockchain_service.generate_hash(request.record_data)
    result = await blockchain_service.store_on_chain(hash_hex)
    
    if not result.get("success"):
        error_type = result.get("error", "unknown")
        if error_type == "insufficient_balance":
            raise HTTPException(status_code=402, detail="Blockchain wallet requires funding (Insufficient MATIC)")
        elif error_type == "timeout":
            raise HTTPException(status_code=504, detail="Blockchain transaction timed out")
        else:
            raise HTTPException(status_code=500, detail=f"Blockchain error: {result.get('message', 'Unknown error')}")
            
    return BlockchainLogResponse(
        tx_hash=result["tx_hash"],
        block_number=result["block_number"]
    )

@router.get("/verify/{tx_hash}")
async def verify_record(tx_hash: str):
    return await blockchain_service.verify_transaction(tx_hash)

@router.post("/evidence")
async def upload_evidence(
    files: List[UploadFile] = File(...),
    descriptions: List[str] = Form(...),
    current_user: Optional[dict] = Depends(optional_current_user)
):
    if not evidence_service.is_available():
        raise HTTPException(status_code=503, detail="Evidence service is temporarily unavailable")
        
    if len(files) != len(descriptions):
        raise HTTPException(status_code=400, detail="Number of files and descriptions must match")
        
    files_data = []
    for i, file in enumerate(files):
        # Validate file size implicitly by reading, optional explicit check can be added
        file_bytes = await file.read()
        if len(file_bytes) > 10 * 1024 * 1024:
            raise HTTPException(status_code=413, detail=f"File {file.filename} exceeds 10MB limit")
        files_data.append((file.filename, file_bytes, descriptions[i]))
        
    result = await evidence_service.process_evidence(files_data)
    
    if current_user:
        await firebase_service.save_evidence_record(current_user["uid"], result)
        
    return result

@router.post("/verify-evidence")
async def verify_evidence(
    file: UploadFile = File(...),
    expected_hash: str = Form(...)
):
    file_bytes = await file.read()
    return await evidence_service.verify_evidence(file_bytes, expected_hash)

@router.get("/wallet-balance")
async def check_wallet_balance():
    return blockchain_service.get_wallet_balance()
