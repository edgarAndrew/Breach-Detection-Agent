ALERTS_QUEUE = "alerts"
RAWEVENTS_QUEUE = "rawevents"
TEST_QUEUE = "test"

QUEUES = {ALERTS_QUEUE, RAWEVENTS_QUEUE, TEST_QUEUE}

def validate_queue(queue: str) -> None:
    if queue not in QUEUES:
        raise ValueError(f"Queue '{queue}' is not allowed. Allowed queues: {sorted(QUEUES)}")