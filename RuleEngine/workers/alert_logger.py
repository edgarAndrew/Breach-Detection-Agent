import asyncio
from Redis.client import RedisPubSubClient
from Redis.queues import ALERTS_QUEUE

async def handler(message: str):
    print("ALERT RECEIVED:", message)

async def main():
    client = RedisPubSubClient()
    await client.subscribe(ALERTS_QUEUE, handler)
    print("Alert logger listening...")
    while True:
        await asyncio.sleep(1)

if __name__ == "__main__":
    asyncio.run(main())