from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/api/subscriptions", tags=["Subscriptions"])

@router.post("/", response_model=schemas.SubscriptionResponse, status_code=status.HTTP_201_CREATED)
def create_subscription(sub: schemas.SubscriptionCreate, db: Session = Depends(get_db)):
    client = db.query(models.Client).filter(models.Client.id == sub.client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
        
    db_sub = models.Subscription(**sub.model_dump())
    db.add(db_sub)
    db.commit()
    db.refresh(db_sub)
    return db_sub

@router.get("/", response_model=List[schemas.SubscriptionResponse])
def get_subscriptions(client_id: Optional[int] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    query = db.query(models.Subscription)
    if client_id:
        query = query.filter(models.Subscription.client_id == client_id)
    return query.offset(skip).limit(limit).all()

@router.put("/{sub_id}", response_model=schemas.SubscriptionResponse)
def update_subscription(sub_id: int, sub_update: schemas.SubscriptionCreate, db: Session = Depends(get_db)):
    sub = db.query(models.Subscription).filter(models.Subscription.id == sub_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
        
    for key, value in sub_update.model_dump().items():
        setattr(sub, key, value)
        
    db.commit()
    db.refresh(sub)
    return sub
