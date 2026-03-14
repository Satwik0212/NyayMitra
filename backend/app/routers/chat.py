import json
import asyncio
import uuid
import logging
from typing import Optional
from fastapi import APIRouter, Depends, Header
from fastapi.responses import StreamingResponse
from app.models.schemas import ChatRequest, ChatResponse
from app.services.llm_orchestrator import orchestrator
from app.prompts.chat_prompts import CHAT_SYSTEM_PROMPT, CHAT_STREAM_PROMPT
from app.services.language_service import detect_language, get_response_language_instruction
from app.services.firebase_service import firebase_service
from app.services.rag_service import rag_service


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["Chat"])

async def optional_current_user(authorization: Optional[str] = Header(None)) -> Optional[dict]:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    try:
        token = authorization.split(" ")[1]
        return firebase_service.verify_token(token)
    except Exception as e:
        logger.warning(f"Failed to verify token in optional auth: {e}")
        return None

@router.post("", response_model=ChatResponse)
async def chat_interaction(
    request: ChatRequest,
    current_user: Optional[dict] = Depends(optional_current_user)
):
    try:
        # 1. Detect language
        lang = detect_language(request.message)
        response_language = get_response_language_instruction(lang)
        
        # 2. Build conversation context
        recent_history = request.history[-6:] if len(request.history) > 6 else request.history
        history_context = "\n".join([f"{m.role}: {m.content}" for m in recent_history])
        
        # 3. RAG Context placeholder
        rag_context = "" # TODO: Retrieve context
        rag_context_section = "LEGAL KNOWLEDGE CONTEXT:\n" + rag_context if rag_context else ""
        
        # 4. Build prompt
        prompt = CHAT_SYSTEM_PROMPT.format(
            response_language=response_language,
            conversation_context=history_context,
            rag_context_section=rag_context_section,
            user_message=request.message
        )
        
        # 5. Call orchestrator
        response_data = await orchestrator.generate_chat(prompt, task="chat")
        
        # 6. Save chat
        conversation_id = str(uuid.uuid4())
        
        # Update history to save
        new_history = request.history + [{"role": "user", "content": request.message}, {"role": "assistant", "content": response_data.get("content", "")}]
        if current_user:
            await firebase_service.save_chat(current_user["uid"], conversation_id, [m.model_dump(mode="json") if hasattr(m, 'model_dump') else m for m in new_history])
            
        return ChatResponse(response=response_data.get("content", "Error generating response"))
        
    except Exception as e:
        logger.error(f"Chat failed: {e}")
        return ChatResponse(response="I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again later.")

async def stream_generator(prompt: str):
    try:
        async for chunk in orchestrator.stream(prompt, task="stream"):
            yield f"data: {json.dumps({'token': chunk})}\n\n"
        yield f"data: {json.dumps({'done': True})}\n\n"
    except Exception as e:
        logger.error(f"Stream failed: {e}")
        yield f"data: {json.dumps({'error': 'Stream connection lost'})}\n\n"

@router.post("/stream")
async def chat_stream(
    request: ChatRequest,
    current_user: Optional[dict] = Depends(optional_current_user)
):
    lang = detect_language(request.message)
    response_language = get_response_language_instruction(lang)
    
    recent_history = request.history[-6:] if len(request.history) > 6 else request.history
    history_context = "\n".join([f"{m.role}: {m.content}" for m in recent_history])
    
    prompt = CHAT_STREAM_PROMPT.format(
        response_language=response_language,
        conversation_context=history_context,
        user_message=request.message
    )
    
    return StreamingResponse(
        stream_generator(prompt),
        media_type="text/event-stream"
    )
