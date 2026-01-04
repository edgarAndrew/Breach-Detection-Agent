import secrets
import string
from passlib.context import CryptContext
import os
import hmac
import hashlib

SECRET_KEY = os.environ["API_SECRET_KEY"].encode()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def generate_api_key() -> str:
    """Generate a secure API key like: aB3xK9mQ..."""
    alphabet = string.ascii_letters + string.digits
    suffix = ''.join(secrets.choice(alphabet) for _ in range(32))
    return f"{suffix}"

def hash_api_key(api_key: str) -> str:
    return hmac.new(
        SECRET_KEY,
        api_key.encode(),
        hashlib.sha256
    ).hexdigest()

def verify_api_key(plain_key: str, hashed_key: str) -> bool:
    return pwd_context.verify(plain_key, hashed_key)