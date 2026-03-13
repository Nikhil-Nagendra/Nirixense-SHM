from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/api/zones", tags=["Zones"])

@router.post("/", response_model=schemas.ZoneResponse, status_code=status.HTTP_201_CREATED)
def create_zone(zone: schemas.ZoneCreate, db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.id == zone.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    db_zone = models.Zone(**zone.model_dump())
    db.add(db_zone)
    db.commit()
    db.refresh(db_zone)
    return db_zone

@router.get("/", response_model=List[schemas.ZoneResponse])
def get_zones(project_id: Optional[int] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    query = db.query(models.Zone)
    if project_id:
        query = query.filter(models.Zone.project_id == project_id)
    return query.offset(skip).limit(limit).all()

@router.delete("/{zone_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_zone(zone_id: int, db: Session = Depends(get_db)):
    zone = db.query(models.Zone).filter(models.Zone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    db.delete(zone)
    db.commit()
    return None
