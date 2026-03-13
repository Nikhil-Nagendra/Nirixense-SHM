import time
import random
import asyncio
import math
from _thread import start_new_thread

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import User, Client, Project, Zone, Node
from app.enums import UserRole, NodeStatus
from app.database import Base

DATABASE_URL = "postgresql://nirixense:nirixense_password@localhost:5432/nirixense_db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def seed_db():
    db = SessionLocal()
    
    # Check if seeded
    user = db.query(User).filter(User.username == "admin").first()
    if not user:
        user = User(username="admin", email="admin@nirixense.com", hashed_password="hashed_pass", role=UserRole.CLIENT_MASTER)
        db.add(user)
        db.commit()
        db.refresh(user)

    client = db.query(Client).filter(Client.name == "Acme Corp").first()
    if not client:
        client = Client(name="Acme Corp", email="contact@acme.com", user_id=user.id)
        db.add(client)
        db.commit()
        db.refresh(client)

    project = db.query(Project).filter(Project.name == "Bridge Alpha").first()
    if not project:
        project = Project(name="Bridge Alpha", client_id=client.id)
        db.add(project)
        db.commit()
        db.refresh(project)

    zone = db.query(Zone).filter(Zone.name == "Zone A").first()
    if not zone:
        zone = Zone(name="Zone A", project_id=project.id)
        db.add(zone)
        db.commit()
        db.refresh(zone)

    nodes = db.query(Node).all()
    if len(nodes) < 2:
        n1 = Node(zone_id=zone.id, battery_level=80, signal_strength=-45, status=NodeStatus.MONITOR)
        n2 = Node(zone_id=zone.id, battery_level=20, signal_strength=-85, status=NodeStatus.SLEEP)
        db.add(n1)
        db.add(n2)
        db.commit()

    db.close()
    print("Database seeded with mock Nodes!")

seed_db()

import requests
BASE_URL = "http://localhost:8000/api"

tick = 0
bat1 = 80.0
sig1 = -45.0
bat2 = 20.0
sig2 = -85.0

print("Sending live Ping data to backend... Check your React Dashboard!")
while True:
    tick += 1
    
    bat1 = max(0, min(100, bat1 - random.uniform(0.0, 0.5)))
    sig1 = -50 + (math.sin(tick * 0.2) * 15) + random.uniform(-5, 5)
    
    bat2 = max(0, min(100, bat2 - random.uniform(0.0, 0.1)))
    sig2 = -85 + random.uniform(-2, 2)
    
    try:
        r1 = requests.post(f"{BASE_URL}/nodes/1/ping?battery={bat1:.1f}&signal={sig1:.1f}")
        r2 = requests.post(f"{BASE_URL}/nodes/2/ping?battery={bat2:.1f}&signal={sig2:.1f}")
        if r1.status_code != 200:
            print(f"Ping Error: {r1.text}")
    except Exception as e:
        pass
        
    time.sleep(1)
