from enum import Enum
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from uuid import UUID, uuid4
from datetime import datetime

class UrgencyLevel(str, Enum):
    NORMAL = "normal"
    URGENT = "urgent"
    EMERGENCY = "emergency"

class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class DocumentType(str, Enum):
    LEGAL_NOTICE = "legal_notice"
    CONSUMER_COMPLAINT = "consumer_complaint"
    RTI_APPLICATION = "rti_application"
    FIR_HELPER = "fir_helper"

class LegalDomain(str, Enum):
    CIVIL = "civil"
    CRIMINAL = "criminal"
    CORPORATE = "corporate"
    FAMILY = "family"
    PROPERTY = "property"
    LABOR = "labor"
    CONSUMER = "consumer"
    CONSTITUTIONAL = "constitutional"

class ApplicableLaw(BaseModel):
    law_name: str
    section: Optional[str] = None
    description: str

class UserRight(BaseModel):
    right: str
    description: str

class RecommendedAction(BaseModel):
    action: str
    description: str
    is_immediate: bool = False

class PartyAnalysis(BaseModel):
    obligations: List[str]
    rights: List[str]
    liabilities: List[str]

class DualPartyAnalysis(BaseModel):
    party_one: PartyAnalysis
    party_two: PartyAnalysis

class DisputeRequest(BaseModel):
    text: str
    language: str = "en"

class DisputeResponse(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    summary: str
    urgency_level: UrgencyLevel
    domain: LegalDomain
    applicable_laws: List[ApplicableLaw]
    user_rights: List[UserRight]
    recommended_actions: List[RecommendedAction]
    is_contract: bool = False
    contract_analysis: Optional[DualPartyAnalysis] = None
    triage_info: Optional[Dict[str, Any]] = None

class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []

class ChatResponse(BaseModel):
    response: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class DocumentRequest(BaseModel):
    doc_type: DocumentType
    parameters: Dict[str, Any]

class DocumentResponse(BaseModel):
    html_content: str
    template_used: str

class BlockchainLogRequest(BaseModel):
    record_data: str

class BlockchainLogResponse(BaseModel):
    tx_hash: str
    block_number: int
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ProcessStep(BaseModel):
    step_number: int
    title: str
    description: str
    duration_estimate: Optional[str] = None

class ProcessFlow(BaseModel):
    flow_type: str
    title: str
    steps: List[ProcessStep]

class CasePrecedent(BaseModel):
    case_name: str
    citation: str
    year: int
    domain: LegalDomain
    summary: str
    relevance: str

class LegislativeUpdate(BaseModel):
    act_name: str
    year: int
    summary: str
    key_changes: List[str]
    effective_date: Optional[str] = None

class AnalysisHistoryItem(BaseModel):
    id: UUID
    user_id: str
    timestamp: datetime
    input_text: str
    domain: LegalDomain
    urgency_level: UrgencyLevel
