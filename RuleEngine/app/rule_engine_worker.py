# rule_engine_worker.py
import asyncio
import logging
from app.rule_cache import rule_refresh_worker
from app.rule_engine import process_event
from Redis.client import RedisPubSubClient
from Redis.queues import RAWEVENTS_QUEUE

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("rule-engine-worker")

async def main():
    # Start the rule refresher first
    logger.info("Starting rule cache refresh worker")
    asyncio.create_task(rule_refresh_worker())

    # Start Redis subscriber
    client = RedisPubSubClient()
    logger.info("Rule Engine subscribing to RAWEVENTS_QUEUE")
    await client.subscribe(RAWEVENTS_QUEUE, process_event)

    # keep worker alive
    while True:
        await asyncio.sleep(1)

if __name__ == "__main__":
    asyncio.run(main())
