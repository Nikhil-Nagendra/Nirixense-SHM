"""
Run this once to wipe and re-seed the database with 2 clients + subscriptions.
Usage (from backend/): python reseed.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import User, Client, Project, Zone, Node, Subscription
from app.enums import UserRole, NodeStatus, SubscriptionTier
from datetime import datetime, timezone, timedelta
import random

DATABASE_URL = "postgresql://nirixense:nirixense_password@localhost:5432/nirixense_db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

print("Wiping existing data...")
db.query(Node).delete()
db.query(Zone).delete()
db.query(Subscription).delete()
db.query(Project).delete()
db.query(Client).delete()
db.query(User).delete()
db.commit()

print("Seeding users...")
user = User(username="admin", email="admin@nirixense.com", hashed_password="hashed_pass", role=UserRole.CLIENT_MASTER)
db.add(user)
db.commit()
db.refresh(user)

print("Seeding Client 1: Acme Corp...")
c1 = Client(name="Acme Corp", email="contact@acme.com", phone="+44 7700 900123", user_id=user.id)
db.add(c1)
db.commit()
db.refresh(c1)

p1a = Project(name="Bridge Alpha", description="Suspension bridge SHM deployment", location="Pune, Maharashtra", client_id=c1.id)
p1b = Project(name="Tower Gamma", description="High-rise structural monitoring", location="Pune, Maharashtra", client_id=c1.id)
db.add_all([p1a, p1b])
db.commit()
db.refresh(p1a)

sub1 = Subscription(client_id=c1.id, tier=SubscriptionTier.PRO,
                    expires_at=datetime.now(timezone.utc) + timedelta(days=365))
db.add(sub1)
db.commit()

z1 = Zone(name="Zone A", label="Main span", project_id=p1a.id)
db.add(z1)
db.commit()
db.refresh(z1)

print("Seeding Client 2: Globex Labs...")
c2 = Client(name="Globex Labs", email="ops@globexlabs.io", phone="+1 415 555 0198", user_id=user.id)
db.add(c2)
db.commit()
db.refresh(c2)

p2a = Project(name="Dam Sentinel", description="Hydroelectric dam vibration monitoring", location="Mumbai, Maharashtra", client_id=c2.id)
p2b = Project(name="Pipeline Watch", description="Underground pipeline integrity", location="Mumbai, Maharashtra", client_id=c2.id)
db.add_all([p2a, p2b])
db.commit()
db.refresh(p2a)

sub2 = Subscription(client_id=c2.id, tier=SubscriptionTier.PREMIUM,
                    expires_at=datetime.now(timezone.utc) + timedelta(days=730))
db.add(sub2)
db.commit()

z2 = Zone(name="Zone B", label="Dam face", project_id=p2a.id)
db.add(z2)
db.commit()
db.refresh(z2)

print("Seeding 10 nodes...")
names = ["Alpha", "Beta", "Gamma", "Delta", "Epsilon"]
for i in range(1, 11):
    zone_id = z1.id if i <= 5 else z2.id
    s_num = f"NRX-{i:04d}"
    n_name = f"Node-{names[i % 5]}-{i:03d}"
    if i <= 4:
        stat, bat, sig = NodeStatus.MONITOR, random.uniform(60, 100), random.uniform(-60, -40)
    elif i <= 7:
        stat, bat, sig = NodeStatus.CONFIGURED, random.uniform(40, 80), random.uniform(-80, -50)
    elif i <= 9:
        stat, bat, sig = NodeStatus.SLEEP, random.uniform(10, 30), random.uniform(-90, -70)
    else:
        stat, bat, sig = NodeStatus.NOT_CONFIGURED, 0.0, 0.0
    db.add(Node(zone_id=zone_id, serial_number=s_num, name=n_name,
                battery_level=bat, signal_strength=sig, status=stat))
db.commit()

db.close()
print("Done! 2 clients, 4 projects, 2 subscriptions, 10 nodes seeded.")
