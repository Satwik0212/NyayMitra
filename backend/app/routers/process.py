import os
import json
from fastapi import APIRouter, HTTPException
from app.models.schemas import ProcessFlow

router = APIRouter(prefix="/process-flow", tags=["Process Flow"])

# Data path
DATA_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "process_flows.json"))

def load_process_flows():
    try:
        with open(DATA_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return {}

@router.get("/{flow_type}", response_model=ProcessFlow)
async def get_process_flow(flow_type: str):
    flows = load_process_flows()
    if flow_type not in flows:
        raise HTTPException(status_code=404, detail="Process flow not found")
        
    return ProcessFlow(**flows[flow_type])
