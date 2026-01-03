import asyncio
import logging

from Redis.client import RedisPubSubClient
from Redis.queues import RAWEVENTS_QUEUE
from RuleEngine.app.rule_engine import process_event

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("rule-engine-worker")


async def main():
    client = RedisPubSubClient()

    logger.info("Rule Engine subscribing to RAWEVENTS_QUEUE")

    await client.subscribe(
        RAWEVENTS_QUEUE,
        process_event,  # THIS is where the data flows in
    )

    # keep the worker alive
    while True:
        await asyncio.sleep(1)


if __name__ == "__main__":
    asyncio.run(main())
