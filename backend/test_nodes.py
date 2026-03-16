import traceback
from app.database import SessionLocal
from app.models import Node

try:
    db = SessionLocal()
    nodes = db.query(Node).all()
    print("Found nodes:", len(nodes))
    for n in nodes:
        print(n.id, n.serial_number, n.name, n.status)
except Exception as e:
    print("Error:")
    traceback.print_exc()
finally:
    db.close()
