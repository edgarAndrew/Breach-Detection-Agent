# app/consumers/batch_writer.py
import asyncio
from typing import List, Dict, Any

class BatchWriter:
    def __init__(
        self,
        repo,
        interval: float = 3.0,  # seconds
    ):
        self.repo = repo
        self.interval = float(interval)

        self._buffer: List[Dict[str, Any]] = []
        self._lock = asyncio.Lock()
        self._task: asyncio.Task | None = None

    async def start(self):
        """Start periodic flush loop"""
        if self._task is None:
            self._task = asyncio.create_task(self._run())

    async def stop(self):
        """Stop loop and flush remaining data"""
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
            self._task = None

        await self.flush()

    async def add(self, doc: Dict[str, Any]):
        async with self._lock:
            self._buffer.append(doc)

    async def flush(self):
        async with self._lock:
            if not self._buffer:
                return
            docs = self._buffer
            self._buffer = []
        await self.repo.create_many(docs)

    async def _run(self):
        while True:
            await asyncio.sleep(self.interval)
            await self.flush()