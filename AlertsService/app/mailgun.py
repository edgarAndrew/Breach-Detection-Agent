import requests
import os

MAILGUN_API_KEY = os.getenv("MAILGUN_API_KEY")
MAILGUN_DOMAIN = os.getenv("MAILGUN_DOMAIN")
MAILGUN_ENABLED = os.getenv("MAILGUN_ENABLED", "false").lower()

if MAILGUN_ENABLED.lower() == "true" or MAILGUN_ENABLED == 't':
    print("Mailgun is enabled")

def send_email(to_email: str, subject: str, body: str):
    if MAILGUN_ENABLED != "true":
        print("Message received but mailgun is disabled")
        return
    
    response = requests.post(
        f"https://api.mailgun.net/v3/{MAILGUN_DOMAIN}/messages",
        auth=("api", MAILGUN_API_KEY),
        data={
            "from": f"Alerts <postmaster@{MAILGUN_DOMAIN}>",
            "to": to_email,
            "subject": subject,
            "text": body,
        },
        timeout=10
    )
    response.raise_for_status()