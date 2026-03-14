from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.config import settings

from app.routers import analyze, chat, documents, blockchain, process, precedents, updates, history, lawyers
from app.routers.auth import router as auth_router
import logging

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s"
)

from app.services.llm_orchestrator import orchestrator
from app.services.blockchain_service import blockchain_service
from app.services.evidence_service import evidence_service
from app.services.firebase_service import firebase_service
from app.services.lawyer_service import lawyer_service

logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.APP_NAME,
    description="Backend infrastructure for NyayMitra",
    version=settings.VERSION,
)

@app.on_event("startup")
async def startup_event():
    print("\n" + "="*50)
    print(" [NYAYMITRA] NyayMitra API v1.0 starting...")
    print("="*50)
    print(f"[OK] LLM Orchestrator: {'ready' if orchestrator else '[FAIL] unavailable'}")
    print(f"{'[OK]' if blockchain_service.is_available() else '[FAIL]'} Blockchain: {'connected' if blockchain_service.is_available() else 'unavailable'}")
    print(f"{'[OK]' if evidence_service.is_available() else '[FAIL]'} Evidence/IPFS: {'connected' if evidence_service.is_available() else 'unavailable'}")
    print(f"{'[OK]' if firebase_service.is_available() else '[FAIL]'} Firebase: {'connected' if firebase_service.is_available() else 'unavailable'}")
    
    if firebase_service.is_available():
        lawyer_service.initialize(firebase_service.db)
        print("[OK] Lawyer Database: initialized")
    else:
        print("[FAIL] Lawyer Database: unavailable")
        
    print("="*50 + "\n")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    return JSONResponse(
        status_code=400,
        content={"error": True, "message": str(exc), "status_code": 400}
    )

@app.exception_handler(TimeoutError)
async def timeout_error_handler(request: Request, exc: TimeoutError):
    return JSONResponse(
        status_code=504,
        content={"error": True, "message": str(exc), "status_code": 504}
    )

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": True, "message": exc.detail, "status_code": exc.status_code}
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": True, "message": "Internal server error", "status_code": 500}
    )

@app.get("/")
async def root():
    return {"app_name": settings.APP_NAME, "version": settings.VERSION}

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "services": {
            "llm": True if orchestrator else False,
            "blockchain": blockchain_service.is_available(),
            "evidence": evidence_service.is_available(),
            "firebase": firebase_service.is_available()
        }
    }

# Register Routers
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(analyze.router, prefix="/api/v1", tags=["analyze"])
app.include_router(chat.router, prefix="/api/v1", tags=["chat"])
app.include_router(documents.router, prefix="/api/v1", tags=["documents"])
app.include_router(blockchain.router, prefix="/api/v1", tags=["blockchain"])
app.include_router(process.router, prefix="/api/v1", tags=["process"])
app.include_router(precedents.router, prefix="/api/v1", tags=["precedents"])
app.include_router(updates.router, prefix="/api/v1", tags=["updates"])
app.include_router(history.router, prefix="/api/v1", tags=["history"])
app.include_router(lawyers.router, prefix="/api/v1", tags=["lawyers"])
