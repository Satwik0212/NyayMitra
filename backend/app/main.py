from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.config import settings

from app.routers import analyze, chat, documents, blockchain, process, precedents, updates, history

app = FastAPI(
    title=settings.APP_NAME,
    description="Backend infrastructure for NyayMitra",
    version=settings.VERSION,
)

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
    return {"status": "ok"}

# Register Routers
app.include_router(analyze.router, prefix="/api/v1", tags=["analyze"])
app.include_router(chat.router, prefix="/api/v1", tags=["chat"])
app.include_router(documents.router, prefix="/api/v1", tags=["documents"])
app.include_router(blockchain.router, prefix="/api/v1", tags=["blockchain"])
app.include_router(process.router, prefix="/api/v1", tags=["process"])
app.include_router(precedents.router, prefix="/api/v1", tags=["precedents"])
app.include_router(updates.router, prefix="/api/v1", tags=["updates"])
app.include_router(history.router, prefix="/api/v1", tags=["history"])
