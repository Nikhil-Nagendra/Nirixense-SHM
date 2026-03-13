from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/{node_id}")
def get_node_analytics(node_id: int, tier: str = "basic", db: Session = Depends(get_db)):
    node = db.query(models.Node).filter(models.Node.id == node_id).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
        
    # Mock data depending on subscription tier
    base_data = {
        "node_id": node.id,
        "status": node.status,
        "battery": node.battery_level,
        "signal": node.signal_strength,
    }
    
    if tier.lower() in ["pro", "premium"]:
        base_data["advanced_metrics"] = {
            "vibration_rms": 0.45,
            "peak_acceleration": 2.1,
            "temperature_drift": 0.05,
            "estimated_life_days": 845
        }
        base_data["historical_trend"] = [
            {"day": -3, "avg": 0.41},
            {"day": -2, "avg": 0.43},
            {"day": -1, "avg": 0.44},
            {"day": 0, "avg": 0.45},
        ]
        
    return base_data
