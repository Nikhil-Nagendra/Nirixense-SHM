import time
import random
import requests
import math

BASE_URL = "http://localhost:8000/api"

print("Simulating Nodes for Nirixense SHM...")

try:
    print(requests.post(f"{BASE_URL}/clients/", json={"name": "Acme Corp", "email": "a@a.com"}).json())
    print(requests.post(f"{BASE_URL}/projects/", json={"name": "Bridge Alpha", "client_id": 1}).json())
    print(requests.post(f"{BASE_URL}/zones/", json={"name": "Zone A", "project_id": 1}).json())
    print(requests.post(f"{BASE_URL}/nodes/", json={"zone_id": 1}).json())
    print(requests.post(f"{BASE_URL}/nodes/", json={"zone_id": 1}).json())
    print(requests.post(f"{BASE_URL}/nodes/1/activate").json())
    print(requests.post(f"{BASE_URL}/nodes/2/sleep").json())
except Exception as e:
    print("Error setting up data:", e)

tick = 0
bat1 = 80.0
sig1 = -45.0
bat2 = 20.0
sig2 = -85.0

print("Sending data out to WebSockets... Check your React Dashboard!")
while True:
    tick += 1
    
    # Random walk
    bat1 = max(0, min(100, bat1 - random.uniform(0.0, 0.5)))
    sig1 = -50 + (math.sin(tick * 0.2) * 15) + random.uniform(-5, 5)
    
    bat2 = max(0, min(100, bat2 - random.uniform(0.0, 0.1)))
    sig2 = -85 + random.uniform(-2, 2)
    
    try:
        r1 = requests.post(f"{BASE_URL}/nodes/1/ping?battery={bat1:.1f}&signal={sig1:.1f}")
        r2 = requests.post(f"{BASE_URL}/nodes/2/ping?battery={bat2:.1f}&signal={sig2:.1f}")
        if r1.status_code != 200: print(f"Node 1 Ping Error: {r1.text}")
    except Exception as e:
        print("Ping error:", e)
        
    time.sleep(1)
