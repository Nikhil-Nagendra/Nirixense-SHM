from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from app import models, schemas
from app.enums import NodeStatus
from app.database import get_db
from app.redis_client import get_redis, publish_node_update

router = APIRouter(prefix="/api/nodes", tags=["Nodes"])

@router.post("/", response_model=schemas.NodeResponse, status_code=status.HTTP_201_CREATED)
def create_node(node: schemas.NodeCreate, db: Session = Depends(get_db)):
    zone = db.query(models.Zone).filter(models.Zone.id == node.zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
        
    db_node = models.Node(**node.model_dump())
    db.add(db_node)
    db.commit()
    db.refresh(db_node)
    return db_node

@router.get("/", response_model=List[schemas.NodeResponse])
def get_nodes(zone_id: Optional[int] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    query = db.query(models.Node)
    if zone_id:
        query = query.filter(models.Node.zone_id == zone_id)
    return query.offset(skip).limit(limit).all()

@router.get("/{node_id}", response_model=schemas.NodeResponse)
def get_node(node_id: int, db: Session = Depends(get_db)):
    node = db.query(models.Node).filter(models.Node.id == node_id).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    return node

@router.post("/{node_id}/configure", response_model=schemas.NodeResponse)
def configure_node(node_id: int, db: Session = Depends(get_db)):
    node = db.query(models.Node).filter(models.Node.id == node_id).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    node.status = NodeStatus.CONFIGURED
    db.commit()
    db.refresh(node)
    return node

@router.post("/{node_id}/activate", response_model=schemas.NodeResponse)
def activate_node(node_id: int, db: Session = Depends(get_db)):
    node = db.query(models.Node).filter(models.Node.id == node_id).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    node.status = NodeStatus.MONITOR
    db.commit()
    db.refresh(node)
    return node

@router.post("/{node_id}/sleep", response_model=schemas.NodeResponse)
def sleep_node(node_id: int, db: Session = Depends(get_db)):
    node = db.query(models.Node).filter(models.Node.id == node_id).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    node.status = NodeStatus.SLEEP
    db.commit()
    db.refresh(node)
    return node

@router.post("/{node_id}/ping", response_model=schemas.NodeResponse)
async def ping_node(node_id: int, battery: float = 100.0, signal: float = -50.0, db: Session = Depends(get_db)):
    node = db.query(models.Node).filter(models.Node.id == node_id).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    
    node.battery_level = battery
    node.signal_strength = signal
    node.last_ping = datetime.now(timezone.utc)
    
    db.commit()
    db.refresh(node)
    
    redis_client = get_redis()
    await publish_node_update(redis_client, node.id, {
        "id": node.id,
        "battery_level": node.battery_level,
        "signal_strength": node.signal_strength,
        "status": node.status.value,
        "last_ping": node.last_ping.isoformat() if node.last_ping else None
    })
    
    return node

@router.delete("/{node_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_node(node_id: int, db: Session = Depends(get_db)):
    node = db.query(models.Node).filter(models.Node.id == node_id).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    db.delete(node)
    db.commit()
    return None
