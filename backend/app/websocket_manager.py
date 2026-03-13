from fastapi import WebSocket
from typing import List
import asyncio
import json
from app.redis_client import get_redis

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass

manager = ConnectionManager()

async def redis_listener():
    redis = get_redis()
    pubsub = redis.pubsub()
    await pubsub.subscribe("node_updates")
    
    try:
        async for message in pubsub.listen():
            print(f"Redis PubSub received: {message}")
            if message["type"] == "message":
                data = message["data"]
                print(f"Broadcasting to {len(manager.active_connections)} clients")
                await manager.broadcast(data)
    except Exception as e:
        print(f"Redis listener error: {e}")
    finally:
        await pubsub.unsubscribe("node_updates")
