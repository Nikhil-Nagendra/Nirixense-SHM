from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from contextlib import asynccontextmanager
import asyncio
from app.websocket_manager import redis_listener, manager

from app.routers import clients, projects, zones, nodes, sensors, data_files, subscriptions, analytics

@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(redis_listener())
    yield
    task.cancel()

app = FastAPI(
    title="Nirixense SHM Platform",
    description="Structural Health Monitoring APIs",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; restrict in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(clients.router)
app.include_router(projects.router)
app.include_router(zones.router)
app.include_router(nodes.router)
app.include_router(sensors.router)
app.include_router(data_files.router)
app.include_router(subscriptions.router)
app.include_router(analytics.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Nirixense SHM API"}

@app.websocket("/ws/nodes")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

