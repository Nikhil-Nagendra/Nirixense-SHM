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
<<<<<<< HEAD
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
=======
        import random as _rnd
        rng = _rnd.Random(node_id * 31337)  # deterministic per node
        vrms   = round(rng.uniform(0.10, 1.20), 2)
        peak   = round(rng.uniform(0.5,  4.5),  2)
        tdrift = round(rng.uniform(0.01, 0.15), 3)
        life   = rng.randint(120, 1200)
        base_trend = round(rng.uniform(0.10, 1.10), 2)
        base_data["advanced_metrics"] = {
            "vibration_rms": vrms,
            "peak_acceleration": peak,
            "temperature_drift": tdrift,
            "estimated_life_days": life,
        }
        base_data["historical_trend"] = [
            {"day": -3, "avg": round(base_trend + rng.uniform(-0.05, 0.05), 3)},
            {"day": -2, "avg": round(base_trend + rng.uniform(-0.05, 0.05), 3)},
            {"day": -1, "avg": round(base_trend + rng.uniform(-0.05, 0.05), 3)},
            {"day":  0, "avg": round(vrms, 3)},
>>>>>>> bc8a547 (latest changes)
        ]
        
    return base_data
