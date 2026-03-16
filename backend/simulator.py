import time
import random
<<<<<<< HEAD
import asyncio
import math
from _thread import start_new_thread

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import User, Client, Project, Zone, Node
from app.enums import UserRole, NodeStatus
=======
import math
import requests

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import User, Client, Project, Zone, Node, Subscription
from app.enums import UserRole, NodeStatus, SubscriptionTier
>>>>>>> bc8a547 (latest changes)
from app.database import Base

DATABASE_URL = "postgresql://nirixense:nirixense_password@localhost:5432/nirixense_db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def seed_db():
    db = SessionLocal()
<<<<<<< HEAD
    
    # Check if seeded
=======

>>>>>>> bc8a547 (latest changes)
    user = db.query(User).filter(User.username == "admin").first()
    if not user:
        user = User(username="admin", email="admin@nirixense.com", hashed_password="hashed_pass", role=UserRole.CLIENT_MASTER)
        db.add(user)
        db.commit()
        db.refresh(user)

<<<<<<< HEAD
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
        
=======
    # --- Client 1: Acme Corp ---
    client1 = db.query(Client).filter(Client.name == "Acme Corp").first()
    if not client1:
        client1 = Client(
            name="Acme Corp",
            email="contact@acme.com",
            phone="+44 7700 900123",
            user_id=user.id,
        )
        db.add(client1)
        db.commit()
        db.refresh(client1)

    proj1 = db.query(Project).filter(Project.name == "Bridge Alpha").first()
    if not proj1:
        proj1 = Project(name="Bridge Alpha", description="Suspension bridge SHM deployment", location="London, UK", client_id=client1.id)
        db.add(proj1)
        db.commit()
        db.refresh(proj1)

    proj1b = db.query(Project).filter(Project.name == "Tower Gamma").first()
    if not proj1b:
        proj1b = Project(name="Tower Gamma", description="High-rise structural monitoring", location="Manchester, UK", client_id=client1.id)
        db.add(proj1b)
        db.commit()
        db.refresh(proj1b)

    sub1 = db.query(Subscription).filter(Subscription.client_id == client1.id).first()
    if not sub1:
        from datetime import datetime, timezone, timedelta
        sub1 = Subscription(client_id=client1.id, tier=SubscriptionTier.PRO,
                            expires_at=datetime.now(timezone.utc) + timedelta(days=365))
        db.add(sub1)
        db.commit()
        db.refresh(sub1)

    zone1 = db.query(Zone).filter(Zone.name == "Zone A").first()
    if not zone1:
        zone1 = Zone(name="Zone A", project_id=proj1.id)
        db.add(zone1)
        db.commit()
        db.refresh(zone1)

    # --- Client 2: Globex Labs ---
    client2 = db.query(Client).filter(Client.name == "Globex Labs").first()
    if not client2:
        client2 = Client(
            name="Globex Labs",
            email="ops@globexlabs.io",
            phone="+1 415 555 0198",
            user_id=user.id,
        )
        db.add(client2)
        db.commit()
        db.refresh(client2)

    proj2 = db.query(Project).filter(Project.name == "Dam Sentinel").first()
    if not proj2:
        proj2 = Project(name="Dam Sentinel", description="Hydroelectric dam vibration monitoring", location="San Francisco, CA", client_id=client2.id)
        db.add(proj2)
        db.commit()
        db.refresh(proj2)

    proj2b = db.query(Project).filter(Project.name == "Pipeline Watch").first()
    if not proj2b:
        proj2b = Project(name="Pipeline Watch", description="Underground pipeline integrity", location="Los Angeles, CA", client_id=client2.id)
        db.add(proj2b)
        db.commit()
        db.refresh(proj2b)

    sub2 = db.query(Subscription).filter(Subscription.client_id == client2.id).first()
    if not sub2:
        from datetime import datetime, timezone, timedelta
        sub2 = Subscription(client_id=client2.id, tier=SubscriptionTier.PREMIUM,
                            expires_at=datetime.now(timezone.utc) + timedelta(days=730))
        db.add(sub2)
        db.commit()
        db.refresh(sub2)

    zone2 = db.query(Zone).filter(Zone.name == "Zone B").first()
    if not zone2:
        zone2 = Zone(name="Zone B", project_id=proj2.id)
        db.add(zone2)
        db.commit()
        db.refresh(zone2)

    # --- Nodes ---
    nodes = db.query(Node).all()
    if len(nodes) < 10:
        db.query(Node).delete()
        db.commit()

        names = ["Alpha", "Beta", "Gamma", "Delta", "Epsilon"]

        for i in range(1, 11):
            s_num = f"NRX-{i:04d}"
            n_name = f"Node-{names[i % 5]}-{i:03d}"
            zone_id = zone1.id if i <= 5 else zone2.id

            if i <= 4:
                stat = NodeStatus.MONITOR
                bat = random.uniform(60.0, 100.0)
                sig = random.uniform(-60.0, -40.0)
            elif i <= 7:
                stat = NodeStatus.CONFIGURED
                bat = random.uniform(40.0, 80.0)
                sig = random.uniform(-80.0, -50.0)
            elif i <= 9:
                stat = NodeStatus.SLEEP
                bat = random.uniform(10.0, 30.0)
                sig = random.uniform(-90.0, -70.0)
            else:
                stat = NodeStatus.NOT_CONFIGURED
                bat = 0.0
                sig = 0.0

            node = Node(zone_id=zone_id, serial_number=s_num, name=n_name,
                        battery_level=bat, signal_strength=sig, status=stat)
            db.add(node)
        db.commit()

    db.close()
    print("Database seeded with 2 clients, 4 projects, 10 nodes!")

seed_db()

BASE_URL = "http://localhost:8000/api"

print("Sending live Ping data to backend... Check your React Dashboard!")
tick = 0
node_states = {}

# Fetch real node IDs from the API instead of hardcoding 1-10
import time as _time
while True:
    try:
        resp = requests.get(f"{BASE_URL}/nodes/?limit=100")
        all_nodes = resp.json()
        break
    except Exception:
        print("Waiting for backend to be ready...")
        _time.sleep(2)

for n in all_nodes:
    node_states[n["id"]] = {
        'bat': n["battery_level"],
        'sig': n["signal_strength"] if n["signal_strength"] != 0 else random.uniform(-90.0, -40.0),
        'active': n["status"] != "NOT_CONFIGURED"
    }

print(f"Tracking {len(node_states)} nodes: {list(node_states.keys())}")

while True:
    tick += 1
    
    for node_id, state in node_states.items():
        if state['active']:
            state['bat'] = max(0, min(100, state['bat'] - random.uniform(0.0, 0.2)))
            
            state['sig'] = state['sig'] + (math.sin(tick * 0.2 + node_id) * 2) + random.uniform(-1, 1)
            state['sig'] = max(-100, min(-30, state['sig']))
            
            try:
                requests.post(f"{BASE_URL}/nodes/{node_id}/ping?battery={state['bat']:.1f}&signal={state['sig']:.1f}")
            except Exception:
                pass
                
>>>>>>> bc8a547 (latest changes)
    time.sleep(1)
