import redis.asyncio as aioredis
from app.config import settings
import json

redis_pool = aioredis.ConnectionPool.from_url(
    settings.redis_url, 
    decode_responses=True
)

def get_redis():
    return aioredis.Redis(connection_pool=redis_pool)

async def publish_node_update(redis_client, node_id: int, data: dict):
    message = json.dumps({
        "type": "NODE_UPDATE",
        "node_id": node_id,
        "data": data
    })
    await redis_client.publish("node_updates", message)
    
    # Also update cache
    await redis_client.set(f"node:{node_id}:state", json.dumps(data), ex=3600)
