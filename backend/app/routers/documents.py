from fastapi import APIRouter
from app.models.schemas import DocumentRequest, DocumentResponse
from app.services.document_service import render_template

router = APIRouter(prefix="/generate-document", tags=["Documents"])

def llm_document_generation_placeholder(doc_type: str, params: dict):
    # Mock generation process
    return None # Return None to trigger fallback

@router.post("", response_model=DocumentResponse)
async def generate_document(request: DocumentRequest):
    # Try LLM generation first
    llm_content = llm_document_generation_placeholder(request.doc_type, request.parameters)
    
    if llm_content:
        return DocumentResponse(html_content=llm_content, template_used="llm_generated")
        
    # Fallback to Jinja2 templates
    fallback_content = render_template(request.doc_type, request.parameters)
    return DocumentResponse(html_content=fallback_content, template_used=request.doc_type)
