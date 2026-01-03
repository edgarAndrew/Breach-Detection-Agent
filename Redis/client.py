import asyncio
import json
import redis.asyncio as redis
from typing import Callable, Awaitable, Iterable
import logging

from .queues import validate_queue
from .config import RedisConfig

MessageHandler = Callable[[str], Awaitable[None]]


class RedisPubSubClient:
    def __init__(self, config: RedisConfig = RedisConfig(), logger=None):
        self._redis = redis.Redis(
            host=config.host,
            port=config.port,
            db=config.db,
            password=config.password,
            decode_responses=config.decode_responses,
        )
        self._tasks: set[asyncio.Task] = set()
        self._logger = logger or logging.getLogger(__name__)

    # -------------------------
    # Publish
    # -------------------------
    async def publish(self, channel: str, message: str) -> int:
        validate_queue(channel)
        return await self._redis.publish(channel, message)

    async def publish_json(self, channel: str, payload: dict) -> int:
        return await self.publish(channel, json.dumps(payload))

    # -------------------------
    # Subscribe
    # -------------------------
    async def subscribe(
        self,
        channel: str,
        handler: MessageHandler,
    ) -> None:
        validate_queue(channel)
        pubsub = self._redis.pubsub()
        await pubsub.subscribe(channel)

        async def _listen():
            async for msg in pubsub.listen():
                if msg["type"] != "message":
                    continue

                try:
                    await handler(msg["data"])
                except Exception as exc:
                    self._logger.exception(
                        "Redis handler failed for channel '%s'",
                        channel,
                        exc_info=exc,
                    )

        task = asyncio.create_task(_listen(), name=f"redis-sub-{channel}")
        self._tasks.add(task)
        task.add_done_callback(self._tasks.discard)

    # Subscribe to multiple channels at once
    async def subscribe_many(
        self,
        channels: Iterable[str],
        handler: MessageHandler,
    ) -> None:
        for channel in channels:
            await self.subscribe(channel, handler)

    # -------------------------
    # Health / Lifecycle
    # -------------------------
    async def ping(self) -> bool:
        try:
            return await self._redis.ping()
        except Exception:
            return False

    async def close(self):
        for task in self._tasks:
            task.cancel()

        await self._redis.close()
