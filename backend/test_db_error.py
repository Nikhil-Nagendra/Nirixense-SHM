import sys
import traceback
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import Node

DATABASE_URL = "postgresql://nirixense:nirixense_password@localhost:5432/nirixense_db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

try:
    db = SessionLocal()
    nodes = db.query(Node).all()
    print("Nodes:", nodes)
except Exception as e:
    traceback.print_exc()
