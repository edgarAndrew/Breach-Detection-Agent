# run.py
import os
import sys
import subprocess
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent

DATA_ORCHESTRATOR_DIR = BASE_DIR / "DataOrchestrator"
RULE_ENGINE_DIR = BASE_DIR / "RuleEngine"
VALIDATION_SERVICE_DIR = BASE_DIR / "ValidationService"
WEBHOOK_SERVICE_DIR = BASE_DIR / "WebhookService"

# Load environment variables
load_dotenv(BASE_DIR / ".env")

DATA_ORCHESTRATOR_PORT = int(os.getenv("DATA_ORCHESTRATOR_PORT", 8080))
RULE_ENGINE_PORT = int(os.getenv("RULE_ENGINE_PORT", 8081))
VALIDATION_SERVICE_PORT = int(os.getenv("VALIDATION_SERVICE_PORT", 8082))
WEBHOOK_SERVICE_PORT = int(os.getenv("WEBHOOK_SERVICE_PORT", 8083))


def start_service(name: str, cwd: Path, port: int):
    print(f"Starting {name} on port {port}...")
    return subprocess.Popen(
        [
            sys.executable,
            "-m",
            "uvicorn",
            "app.main:app",
            "--host",
            "0.0.0.0",
            "--port",
            str(port),
            "--reload",
        ],
        cwd=cwd,
    )

def start_rule_engine_worker():
    print("Starting Rule Engine Worker...")

    env = os.environ.copy()
    env["PYTHONPATH"] = str(BASE_DIR)  # 👈 project root

    return subprocess.Popen(
        [
            sys.executable,
            "-m",
            "app.rule_engine_worker"
        ],
        cwd=RULE_ENGINE_DIR,
        env=env,
    )


def start_data_orchestrator():
    return start_service("Data Orchestrator",DATA_ORCHESTRATOR_DIR,DATA_ORCHESTRATOR_PORT)

def start_rule_engine():
    return start_service("Rule Engine",RULE_ENGINE_DIR,RULE_ENGINE_PORT)

def start_validation_service():
    return start_service("Validation Service",VALIDATION_SERVICE_DIR,VALIDATION_SERVICE_PORT)

def start_webhook_service():
    return start_service("Webhook Service",WEBHOOK_SERVICE_DIR,WEBHOOK_SERVICE_PORT,)


# Control which services run here
ENABLED_SERVICES = [
    start_data_orchestrator,
    start_rule_engine_worker,
    start_rule_engine,
    start_validation_service,
    start_webhook_service,
    # Comment out any service to skip it
]


def main():
    processes = []

    try:
        for service in ENABLED_SERVICES:
            processes.append(service())

        for process in processes:
            process.wait()

    except KeyboardInterrupt:
        print("\nShutting down services...")
        for process in processes:
            process.terminate()


if __name__ == "__main__":
    main()
