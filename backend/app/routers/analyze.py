from fastapi import APIRouter, Depends, Header
from typing import Optional
from app.models.schemas import DisputeRequest, DisputeResponse, UrgencyLevel, LegalDomain
from app.services.language_service import detect_language, get_response_language_instruction
from app.services.triage_service import quick_triage
from app.services.contract_detector import detect_contract_context
from app.services.llm_orchestrator import orchestrator
from app.services.rag_service import rag_service
from app.prompts.analysis_prompts import DISPUTE_ANALYSIS_PROMPT, URGENCY_CLASSIFICATION_PROMPT
from app.services.firebase_service import firebase_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/analyze", tags=["Analyze"])

async def optional_current_user(authorization: Optional[str] = Header(None)) -> Optional[dict]:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    try:
        token = authorization.split(" ")[1]
        return firebase_service.verify_token(token)
    except Exception as e:
        logger.warning(f"Failed to verify token in optional auth: {e}")
        return None

@router.post("", response_model=DisputeResponse)
async def analyze_dispute(
    request: DisputeRequest,
    current_user: Optional[dict] = Depends(optional_current_user)
):
    # 1. Detect language
    lang = detect_language(request.text)
    
    # 2. Run Triage
    triage_info = quick_triage(request.text)
    
    # 3. Contract context
    is_contract = detect_contract_context(request.text)
    
    # 4. Mock RAG retrieval
    rag_context = await rag_service.retrieve_context(request.text, k=3)
    
    try:
        # 5. Build prompt
        response_language = get_response_language_instruction(lang)
        rag_context_section = "LEGAL KNOWLEDGE CONTEXT:\n" + rag_context if rag_context else "No legal corpus context available yet."
        
        prompt = DISPUTE_ANALYSIS_PROMPT.format(
            dispute_text=request.text,
            location_state="Not specified",
            language=lang,
            dispute_type="Not specified",
            response_language=response_language,
            rag_context_section=rag_context_section
        )

        # 6. Call orchestrator
        analysis = await orchestrator.generate_json(prompt, task="analysis")

        # 7. Merge triage urgency
        triage_urgency = triage_info.get("urgency_level", "normal")
        ai_urgency = analysis.get("urgency", "standard").lower()
        
        final_urgency = UrgencyLevel.NORMAL
        if triage_urgency == "emergency" or ai_urgency == "critical":
            final_urgency = UrgencyLevel.EMERGENCY
            if "emergency_helplines" not in analysis:
                analysis["emergency_helplines"] = triage_info.get("emergency_helplines", {})
        elif triage_urgency == "urgent" or ai_urgency == "urgent":
            final_urgency = UrgencyLevel.URGENT
            
        domain_str = analysis.get("legal_domain", "CIVIL").upper()
        # Clean domain string to match Enum keys
        clean_domain = "CIVIL"
        for d in LegalDomain:
            if d.name in domain_str or d.value.upper() in domain_str:
                clean_domain = d.name
                break
        
        try:
            domain = LegalDomain[clean_domain]
        except KeyError:
            domain = LegalDomain.CIVIL

        # 8. Build response
        response = DisputeResponse(
            summary=analysis.get("summary", "Analysis complete."),
            urgency_level=final_urgency,
            domain=domain,
            applicable_laws=analysis.get("applicable_laws", []),
            user_rights=analysis.get("user_rights", []),
            recommended_actions=analysis.get("recommended_actions", []),
            is_contract=is_contract,
            contract_analysis=analysis.get("dual_party_analysis") if is_contract else None,
            triage_info=triage_info
        )

        # 9. Save if authenticated
        if current_user:
            await firebase_service.save_analysis(current_user["uid"], response.model_dump(mode="json"))
            
        return response

    except Exception as e:
        logger.error(f"Analysis failed: {e}")
        # Partial response if AI fails
        urgency_level = UrgencyLevel(triage_info.get("urgency_level", "normal"))
        response = DisputeResponse(
            summary="Our AI system is currently unavailable. Please check the triage alerts.",
            urgency_level=urgency_level,
            domain=LegalDomain.CIVIL,
            applicable_laws=[],
            user_rights=[],
            recommended_actions=[],
            is_contract=is_contract,
            triage_info=triage_info
        )
        return response
