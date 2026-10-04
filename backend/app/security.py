import time
import base64
from typing import Dict, List
from fastapi import Request
from app.config import get_settings
from app.errors import InvalidInputError

class InMemoryRateLimiter:
    def __init__(self, default_rpm: int = 20):
        self.default_rpm = default_rpm
        self.window = 60.0
        self.requests: Dict[str, List[float]] = {}

    def check_rate_limit(self, client_key: str, rpm: int | None = None) -> int | None:
        limit = rpm if rpm is not None else self.default_rpm
        now = time.time()
        cutoff = now - self.window

        client_history = [t for t in self.requests.get(client_key, []) if t > cutoff]
        self.requests[client_key] = client_history

        if len(client_history) >= limit:
            oldest = client_history[0]
            retry_after = max(1, int(oldest + self.window - now))
            return retry_after

        client_history.append(now)
        return None

def get_client_ip(request: Request, trust_proxy: bool = False) -> str:
    if trust_proxy:
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "127.0.0.1"

def sniff_image_mime(data: bytes) -> str | None:
    if len(data) < 12:
        return None
    # JPEG: starts with FF D8 FF
    if data[:3] == b"\xff\xd8\xff":
        return "image/jpeg"
    # PNG: starts with 89 50 4E 47 0D 0A 1A 0A
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        return "image/png"
    # WEBP: starts with RIFF ... WEBP
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "image/webp"
    return None

def decode_base64_image(base64_str: str) -> bytes:
    try:
        data = base64.b64decode(base64_str, validate=True)
        return data
    except Exception:
        raise InvalidInputError("Invalid base64 image encoding")
