from fastapi import APIRouter
from app.models.schemas import DocumentRequest, DocumentResponse
from app.services.document_service import render_template
from app.services.llm_orchestrator import orchestrator
from app.prompts.document_prompts import DOCUMENT_GENERATION_PROMPT
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/generate-document", tags=["Documents"])

@router.post("", response_model=DocumentResponse)
async def generate_document(request: DocumentRequest):
    # Mapping to human-readable document types
    doc_type_mapping = {
        "legal_notice": "Legal Notice",
        "consumer_complaint": "Consumer Complaint for District Consumer Forum",
        "rti_application": "Right to Information (RTI) Application under RTI Act 2005",
        "fir_helper": "FIR/Police Complaint Draft"
    }
    
    readable_doc_type = doc_type_mapping.get(request.doc_type.value if hasattr(request.doc_type, 'value') else request.doc_type, str(request.doc_type))
    
    params = request.parameters or {}
    
    prompt = DOCUMENT_GENERATION_PROMPT.format(
        document_type=readable_doc_type,
        dispute_summary=params.get("dispute_summary", "Not provided"),
        sender_name=params.get("sender_name", "[Sender Name]"),
        sender_address=params.get("sender_address", "[Sender Address]"),
        recipient_name=params.get("recipient_name", "[Recipient Name]"),
        recipient_address=params.get("recipient_address", "[Recipient Address]"),
        date=datetime.now().strftime("%d/%m/%Y"),
        language=params.get("language", "English"),
        additional_details=params.get("additional_details", "None")
    )
    
    try:
        # 1. AI Generation
        html_content = await orchestrator.generate(prompt, task="document")
        if html_content and len(html_content) > 50:
            return DocumentResponse(html_content=html_content, template_used="llm_generated")
    except Exception as e:
        logger.error(f"AI document generation failed: {e}")
        
    # 2. Fallback to basic Jinja templates if AI fails
    try:
        fallback_content = render_template(request.doc_type.value if hasattr(request.doc_type, 'value') else request.doc_type, params)
        return DocumentResponse(html_content=fallback_content, template_used=str(request.doc_type))
    except Exception as e:
        logger.error(f"Template fallback failed: {e}")
        return DocumentResponse(html_content=f"<html><body><h2>Error generating document</h2><p>{str(e)}</p></body></html>", template_used="error")
