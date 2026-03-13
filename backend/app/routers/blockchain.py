from fastapi import APIRouter
from app.models.schemas import BlockchainLogRequest, BlockchainLogResponse

router = APIRouter(prefix="/blockchain", tags=["Blockchain"])

# Mock Blockchain Service
def log_to_blockchain_placeholder(data: str):
    return {"tx_hash": "0x123abc456def789...", "block_number": 420000}

@router.post("/log", response_model=BlockchainLogResponse)
async def log_record(request: BlockchainLogRequest):
    result = log_to_blockchain_placeholder(request.record_data)
    return BlockchainLogResponse(
        tx_hash=result["tx_hash"],
        block_number=result["block_number"]
    )

@router.get("/verify/{tx_hash}")
async def verify_record(tx_hash: str):
    # Mock verification
    return {"verified": True, "tx_hash": tx_hash, "data": "Mock data from blockchain"}
