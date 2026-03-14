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
from app.rag import legal_retriever

import hashlib
import logging

logger = logging.getLogger(__name__)

# Simple RAG cache — reuse legal context within same conversation topic
_rag_cache = {}  # key: first_message_hash -> value: rag_context string

def _get_cache_key(message: str, history: list) -> str:
    """Generate cache key from the first message in conversation."""
    if history and len(history) > 0:
        # Use first user message as cache key (topic doesn't change)
        first_msg = next((m.content for m in history if m.role == "user"), message)
    else:
        first_msg = message
    return hashlib.md5(first_msg.encode()).hexdigest()

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
        
        # 3. Optimized Reasoning-based RAG retrieval
        cache_key = _get_cache_key(request.message, request.history)
        
        # Optimization 3: Skip RAG if conversation already has enough context (3+ messages)
        skip_rag = len(request.history) >= 4  # 2 user + 2 assistant messages
        
        if skip_rag:
            rag_context = "" # Context already in prompt history
        elif cache_key in _rag_cache:
            rag_context = _rag_cache[cache_key] # Optimization 1: Cache hit
        else:
            rag_context = await legal_retriever.retrieve(request.message)
            _rag_cache[cache_key] = rag_context
            
            # Limit cache size
            if len(_rag_cache) > 100:
                keys = list(_rag_cache.keys())
                for k in keys[:50]:
                    del _rag_cache[k]

        rag_context_section = (
            "LEGAL KNOWLEDGE CONTEXT (from Indian law corpus):\n" + rag_context 
            if rag_context 
            else ""
        )
        
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
    
    # 2. Build conversation context
    recent_history = request.history[-6:] if len(request.history) > 6 else request.history
    history_context = "\n".join([f"{m.role}: {m.content}" for m in recent_history])
    
    # Optimized RAG Retrieval for stream
    cache_key = _get_cache_key(request.message, request.history)
    skip_rag = len(request.history) >= 4
    
    if skip_rag:
        rag_context = ""
    elif cache_key in _rag_cache:
        rag_context = _rag_cache[cache_key]
    else:
        rag_context = await legal_retriever.retrieve(request.message)
        _rag_cache[cache_key] = rag_context
    
    rag_context_section = (
        "LEGAL KNOWLEDGE CONTEXT (from Indian law corpus):\n" + rag_context 
        if rag_context 
        else ""
    )
    
    prompt = CHAT_STREAM_PROMPT.format(
        response_language=response_language,
        conversation_context=history_context,
        rag_context_section=rag_context_section,
        user_message=request.message
    )
    
    return StreamingResponse(
        stream_generator(prompt),
        media_type="text/event-stream"
    )
