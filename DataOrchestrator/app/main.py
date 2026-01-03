from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import os
from pathlib import Path
from app.database.database import connect_to_mongo, close_mongo_connection,get_database
from app.repositories.rawevent import RawEventRepository
from app.repositories.alert import AlertRepository
from app.consumers.batch_writer import BatchWriter
from app.consumers.redis_consumer import start_raw_event_consumer, start_alert_consumer
from app.routers import (users,organizations,user_orgs,datasources,webhooks,rawevents,rules,alerts,trends)

sys.path.append(str(Path(__file__).resolve().parents[2]))
from Redis import RedisPubSubClient
from Redis.queues import RAWEVENTS_QUEUE,ALERTS_QUEUE

app = FastAPI(title="Data Orchestrator", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(users, prefix="/api/users")
app.include_router(organizations, prefix="/api/organizations")
app.include_router(user_orgs, prefix="/api/memberships")
app.include_router(datasources, prefix="/api/datasources")
app.include_router(webhooks, prefix="/api/webhooks")
app.include_router(rawevents, prefix="/api/events")
app.include_router(rules, prefix="/api/rules")
app.include_router(alerts, prefix="/api/alerts")
app.include_router(trends.router, prefix="/api/trends")

@app.on_event("startup")
async def startup():
    await connect_to_mongo()
    db = get_database()

    redis_client = RedisPubSubClient()
    app.state.redis_client = redis_client

    # repositories
    raw_repo = RawEventRepository(db)
    alert_repo = AlertRepository(db)

    # batch writers
    app.state.raw_batch = BatchWriter(repo=raw_repo, interval=os.getenv("DB_FLUSH_INTERVAL", 5.0))
    app.state.alert_batch = BatchWriter(repo=alert_repo, interval=os.getenv("DB_FLUSH_INTERVAL", 5.0))

    # start batch writers
    await app.state.raw_batch.start()
    await app.state.alert_batch.start()

    # consumers
    await start_raw_event_consumer(redis_client, app.state.raw_batch,RAWEVENTS_QUEUE)
    await start_alert_consumer(redis_client, app.state.alert_batch,ALERTS_QUEUE)

@app.on_event("shutdown")
async def shutdown():
    # Stop batch writers
    if hasattr(app.state, "raw_batch"):
        await app.state.raw_batch.stop()

    if hasattr(app.state, "alert_batch"):
        await app.state.alert_batch.stop()

    # close redis
    if hasattr(app.state, "redis_client"):
        await app.state.redis_client.close()

    # close mongo
    await close_mongo_connection()