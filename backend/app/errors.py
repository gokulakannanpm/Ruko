from app.schemas import ErrorCode

class AppError(Exception):
    def __init__(self, code: ErrorCode, http_status: int, retryable: bool, headers: dict[str, str] | None = None):
        self.code = code
        self.http_status = http_status
        self.retryable = retryable
        self.headers = headers or {}
        super().__init__(f"{code} (http={http_status})")

class InvalidInputError(AppError):
    def __init__(self, message: str = "Invalid request payload or empty input"):
        super().__init__(code="invalid_input", http_status=400, retryable=False)

class PayloadTooLargeError(AppError):
    def __init__(self, message: str = "Request body or image size exceeds limit"):
        super().__init__(code="payload_too_large", http_status=413, retryable=False)

class RateLimitedError(AppError):
    def __init__(self, retry_after: int = 60):
        super().__init__(
            code="rate_limited",
            http_status=429,
            retryable=True,
            headers={"Retry-After": str(retry_after)}
        )

class InternalServerError(AppError):
    def __init__(self, message: str = "Internal server error"):
        super().__init__(code="internal_error", http_status=500, retryable=True)
