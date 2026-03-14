import os
import json
from typing import List
from fastapi import APIRouter
from app.models.schemas import LegislativeUpdate

router = APIRouter(prefix="/updates", tags=["Legislative Updates"])

# Data path
DATA_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "legislative_updates.json"))

def load_updates():
    try:
        with open(DATA_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return []

@router.get("", response_model=List[LegislativeUpdate])
async def get_updates():
    updates = load_updates()
    return [LegislativeUpdate(**u) for u in updates]
