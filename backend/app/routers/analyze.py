from fastapi import APIRouter
from app.models.schemas import DisputeRequest, DisputeResponse, UrgencyLevel, LegalDomain
from app.services.language_service import detect_language
from app.services.triage_service import quick_triage
from app.services.contract_detector import detect_contract_context

router = APIRouter(prefix="/analyze", tags=["Analyze"])

# Mock placeholders for RAG and LLM Orchestrator
def retrieve_context_placeholder(text: str):
    return "Mock retrieved legal context based on text."

def generate_json_placeholder(text: str, context: str, lang: str):
    summary = f"Analyzed summary for {text[:30]}..." if text else "Analyzed summary"
    return {
        "summary": summary,
        "domain": LegalDomain.CIVIL,
        "applicable_laws": [],
        "user_rights": [],
        "recommended_actions": []
    }

@router.post("", response_model=DisputeResponse)
async def analyze_dispute(request: DisputeRequest):
    # 1. Detect language
    lang = detect_language(request.text)
    
    # 2. Run Triage
    triage_info = quick_triage(request.text)
    urgency_level = UrgencyLevel(triage_info.get("urgency_level", "normal"))
    
    # 3. Contract context
    is_contract = detect_contract_context(request.text)
    
    # 4. Mock RAG retrieval
    context = retrieve_context_placeholder(request.text)
    
    # 5. Mock LLM JSON Generation
    llm_resp = generate_json_placeholder(request.text, context, lang)
    
    # 6. Construct response
    response = DisputeResponse(
        summary=llm_resp["summary"],
        urgency_level=urgency_level,
        domain=llm_resp["domain"],
        applicable_laws=llm_resp["applicable_laws"],
        user_rights=llm_resp["user_rights"],
        recommended_actions=llm_resp["recommended_actions"],
        is_contract=is_contract,
        triage_info=triage_info
    )
    
    return response
