import os
import json
from typing import List
from fastapi import APIRouter
from app.models.schemas import CasePrecedent, LegalDomain

router = APIRouter(prefix="/precedents", tags=["Precedents"])

# Data path
DATA_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "landmark_cases.json"))

def load_cases():
    try:
        with open(DATA_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return []

@router.get("/{domain}", response_model=List[CasePrecedent])
async def get_precedents(domain: LegalDomain):
    all_cases = load_cases()
    filtered_cases = [case for case in all_cases if case["domain"] == domain.value]
    return [CasePrecedent(**case) for case in filtered_cases]
