from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/api/data-files", tags=["DataFiles"])

@router.post("/", response_model=schemas.DataFileResponse, status_code=status.HTTP_201_CREATED)
def create_data_file(data_file: schemas.DataFileCreate, db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.id == data_file.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    db_file = models.DataFile(**data_file.model_dump())
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    return db_file

@router.get("/", response_model=List[schemas.DataFileResponse])
def get_data_files(project_id: Optional[int] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    query = db.query(models.DataFile)
    if project_id:
        query = query.filter(models.DataFile.project_id == project_id)
    return query.offset(skip).limit(limit).all()

@router.delete("/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_data_file(file_id: int, db: Session = Depends(get_db)):
    data_file = db.query(models.DataFile).filter(models.DataFile.id == file_id).first()
    if not data_file:
        raise HTTPException(status_code=404, detail="DataFile not found")
    db.delete(data_file)
    db.commit()
    return None
