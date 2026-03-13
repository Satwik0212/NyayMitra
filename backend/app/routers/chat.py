import json
import asyncio
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.models.schemas import ChatRequest, ChatResponse

router = APIRouter(prefix="/chat", tags=["Chat"])

@router.post("", response_model=ChatResponse)
async def chat_interaction(request: ChatRequest):
    # Use last 6 messages as history
    recent_history = request.history[-6:] if len(request.history) > 6 else request.history
    
    # Mock LLM process
    history_context = " | ".join([m.content for m in recent_history])
    response_text = f"Mock reply to: '{request.message}'. Context: {history_context}"
    
    return ChatResponse(response=response_text)

async def mock_stream_generator(message: str):
    tokens = message.split() + ["<END>"]
    for token in tokens:
        if token == "<END>":
            yield f"data: {json.dumps({'done': True})}\n\n"
        else:
            yield f"data: {json.dumps({'token': token + ' '})}\n\n"
        await asyncio.sleep(0.1)

@router.post("/stream")
async def chat_stream(request: ChatRequest):
    return StreamingResponse(
        mock_stream_generator(request.message),
        media_type="text/event-stream"
    )
