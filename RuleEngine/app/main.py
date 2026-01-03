from fastapi import FastAPI
import logging
from app.rule_engine import process_event
from pathlib import Path
import sys

sys.path.append(str(Path(__file__).resolve().parents[2]))
from Redis.client import RedisPubSubClient
from Redis.queues import RAWEVENTS_QUEUE


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Rule Engine Service")

# -------------------------
# Background task to listen to Redis events
# -------------------------
@app.on_event("startup")
async def start_redis_listener():
    client = RedisPubSubClient()
    await client.subscribe(RAWEVENTS_QUEUE, process_event)
    logger.info("Subscribed to RAWEVENTS_QUEUE")

# -------------------------
# Health endpoint
# -------------------------
@app.get("/health")
async def health():
    return {"status": "ok"}
