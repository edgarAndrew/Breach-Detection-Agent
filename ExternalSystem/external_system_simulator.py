import csv
import time
import requests
import os
import threading
from typing import Dict
from dotenv import load_dotenv

load_dotenv()

WEBHOOK_URL = "http://localhost:8083/webhook/receive/{org_id}/{webhook_id}"
HTTP_TIMEOUT_SECONDS = int(os.getenv("HTTP_TIMEOUT_SECONDS", 5))

COMPANIES = {
    "os-comp": {
        "api_key": os.getenv("COMP_TEST_API_KEY", "Dummykey"),
        "csv_file": os.getenv("COMP_TEST_CSV", "small_test.csv"),
        "delay": int(os.getenv("COMP_TEST_DELAY", 2)),
        "webhook_id": os.getenv("COMP_TEST_WEBHOOK_ID", "wbh-123")
    }
    # ,"os-comp-2": {
    #     "api_key": os.getenv("COMP_TEST_API_KEY", "Dummykey"),
    #     "csv_file": os.getenv("COMP_TEST_CSV", "small_test2.csv"),
    #     "delay": int(os.getenv("COMP_TEST_DELAY", 2)),
    #     "webhook_id": os.getenv("COMP_TEST_WEBHOOK_ID", "wbh-223")
    # }
}
# COMPANIES = {
#     "COMP-001": {
#         "api_key": os.getenv("COMP_001_API_KEY"),
#         "csv_file": os.getenv("COMP_001_CSV"),
#         "delay": int(os.getenv("COMP_001_DELAY", 2))
#         "webhook_id": os.getenv("COMP_TEST_WEBHOOK_ID", "wbh-123")
#     },
#     "COMP-002": {
#         "api_key": os.getenv("COMP_002_API_KEY"),
#         "csv_file": os.getenv("COMP_002_CSV"),
#         "delay": int(os.getenv("COMP_002_DELAY", 5))
#         "webhook_id": os.getenv("COMP_TEST_WEBHOOK_ID", "wbh-123")
#     }
# }


def build_payload(row: Dict) -> Dict:
    metrics = {}

    for key, value in row.items():

        if value is None or value.strip() == "":
            continue

        try:
            metrics[key] = float(value)
        except ValueError:
            metrics[key] = value # For timestamp field

    return metrics

def send_event(company_id: str, api_key: str,  webhook_id:str, payload: Dict) -> None:
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": api_key
    }

    try:
        response = requests.post(
            WEBHOOK_URL.format(webhook_id=webhook_id, org_id=company_id),
            json=payload,
            headers=headers,
            timeout=HTTP_TIMEOUT_SECONDS
        )

        if response.status_code == 200:
            print(f"SUCCESS [{company_id}] - Success - {response.text}")
        elif response.status_code == 401:
            print(f"AUTH FAILED [{company_id}] - Invalid API Key")
        elif response.status_code == 400:
            print(f"BAD REQUEST [{company_id}] - {response.text}")
        else:
            print(f"UNEXPECTED [{company_id}] {response.status_code} - {response.text}")

    except requests.exceptions.RequestException as e:
        print(f"NETWORK ERROR [{company_id}]: {e}")


def run_company_simulator(company_id: str, config: Dict) -> None:
    api_key = config["api_key"]
    csv_file = config["csv_file"]
    delay = config["delay"]
    webhook_id = config["webhook_id"]

    if not api_key or not csv_file:
        print(f"Missing config for {company_id}")
        return

    print(f"Starting simulator for {company_id} (delay={delay}s)")

    with open(csv_file, newline="") as csvfile:
        reader = csv.DictReader(csvfile)

        for row in reader:
            try:
                payload = build_payload(row)
            except ValueError as e:
                print(f"SKIPPED [{company_id}] - {e}")
                continue

            print(f"[{company_id}] Sending event")
            send_event(company_id, api_key, webhook_id, payload)

            time.sleep(delay)

    print(f"Simulator finished for {company_id}")


def run_simulator():
    threads = []

    for company_id, config in COMPANIES.items():
        thread = threading.Thread(
            target=run_company_simulator,
            args=(company_id, config),
            daemon=True
        )
        threads.append(thread)
        thread.start()

    for thread in threads:
        thread.join()

    print("All company simulations completed.")


if __name__ == "__main__":
    run_simulator()
