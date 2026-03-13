from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/api/sensors", tags=["Sensors"])

@router.post("/", response_model=schemas.SensorResponse, status_code=status.HTTP_201_CREATED)
def create_sensor(sensor: schemas.SensorCreate, db: Session = Depends(get_db)):
    node = db.query(models.Node).filter(models.Node.id == sensor.node_id).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
        
    db_sensor = models.Sensor(**sensor.model_dump())
    db.add(db_sensor)
    db.commit()
    db.refresh(db_sensor)
    return db_sensor

@router.get("/", response_model=List[schemas.SensorResponse])
def get_sensors(node_id: Optional[int] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    query = db.query(models.Sensor)
    if node_id:
        query = query.filter(models.Sensor.node_id == node_id)
    return query.offset(skip).limit(limit).all()

@router.post("/{sensor_id}/reading", response_model=schemas.SensorResponse)
def add_reading(sensor_id: int, value: float, db: Session = Depends(get_db)):
    sensor = db.query(models.Sensor).filter(models.Sensor.id == sensor_id).first()
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
        
    sensor.last_value = value
    sensor.last_reading_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(sensor)
    return sensor

@router.delete("/{sensor_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sensor(sensor_id: int, db: Session = Depends(get_db)):
    sensor = db.query(models.Sensor).filter(models.Sensor.id == sensor_id).first()
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    db.delete(sensor)
    db.commit()
    return None
