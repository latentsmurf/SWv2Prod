import os
from cryptography.fernet import Fernet
from dotenv import load_dotenv

load_dotenv()

# Get or generate a key (in production, this MUST be persistent)
# For dev, we'll use a default if not set, but warn about it.
_key = os.getenv("ENCRYPTION_KEY")
if not _key:
    # Generate a temporary key for dev session if none exists
    # WARNING: Data encrypted with this will be lost on restart if not saved
    _key = Fernet.generate_key().decode()
    print(f"WARNING: ENCRYPTION_KEY not set. Using temporary key: {_key}")

cipher_suite = Fernet(_key.encode())

def encrypt_value(value: str) -> str:
    """Encrypts a string value."""
    if not value:
        return ""
    return cipher_suite.encrypt(value.encode()).decode()

def decrypt_value(token: str) -> str:
    """Decrypts a string token."""
    if not token:
        return ""
    try:
        return cipher_suite.decrypt(token.encode()).decode()
    except Exception:
        return "[Decryption Failed]"
