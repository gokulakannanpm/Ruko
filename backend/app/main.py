import time
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, Response, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import get_settings
from app.logging_setup import setup_logging
from app.errors import AppError, InvalidInputError, RateLimitedError, PayloadTooLargeError, InternalServerError
from app.schemas import HealthResponse, HealthFeatures, AnalyzeRequest, AnalyzeResponse, ApiErrorBody, ApiErrorDetail
from app.security import InMemoryRateLimiter, get_client_ip
from app.ai.base import AIProvider, NullProvider
from app.ai.groq import GroqProvider
from app.ai.gemini import GeminiProvider
from app.pipeline.analyze import run_analysis_pipeline

setup_logging()
logger = logging.getLogger("ruko.api")

rate_limiter = InMemoryRateLimiter()

def get_ai_provider() -> AIProvider:
    settings = get_settings()
    if settings.ai_enabled and settings.groq_api_key:
        return GroqProvider()
    if settings.ai_enabled and settings.gemini_api_key:
        return GeminiProvider()
    return NullProvider()

@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    has_key = bool(settings.groq_api_key or settings.gemini_api_key)
    logger.info(
        "Ruko Backend Starting: ENV=%s, AI_ENABLED=%s, KEY_PRESENT=%s",
        settings.env,
        settings.ai_enabled,
        has_key,
    )
    app.state.ai_provider = get_ai_provider()
    yield

def create_app() -> FastAPI:
    settings = get_settings()

    is_prod = settings.env.lower() == "production"

    app = FastAPI(
        title="Ruko Backend",
        version="1.0",
        docs_url=None if is_prod else "/docs",
        redoc_url=None if is_prod else "/redoc",
        openapi_url=None if is_prod else "/openapi.json",
        lifespan=lifespan,
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Content-Type"],
        allow_credentials=False,
        max_age=600,
    )

    # Middleware for Security Headers, Rate Limiting & Body Size Check
    @app.middleware("http")
    async def security_and_limits_middleware(request: Request, call_next):
        # 1. Rate Limiting
        client_ip = get_client_ip(request, settings.trust_proxy)
        if request.url.path == "/api/analyze":
            retry_after = rate_limiter.check_rate_limit(
                client_ip, settings.rate_limit_per_min
            )
            if retry_after is not None:
                resp = Response(
                    content=ApiErrorBody(
                        error=ApiErrorDetail(code="rate_limited", retryable=True)
                    ).model_dump_json(),
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    media_type="application/json",
                    headers={"Retry-After": str(retry_after)},
                )
                return resp

        # 2. Content Length / Body Size Check
        content_length = request.headers.get("content-length")
        if content_length and content_length.isdigit():
            if int(content_length) > settings.max_body_bytes:
                resp = Response(
                    content=ApiErrorBody(
                        error=ApiErrorDetail(code="payload_too_large", retryable=False)
                    ).model_dump_json(),
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    media_type="application/json",
                )
                return resp

        # Process request
        response: Response = await call_next(request)

        # 3. Security Headers
        response.headers["Cache-Control"] = "no-store"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Referrer-Policy"] = "no-referrer"

        return response

    # Exception Handlers
    @app.exception_handler(AppError)
    async def app_error_handler(request: Request, exc: AppError):
        headers = {}
        if isinstance(exc, RateLimitedError) and exc.retry_after is not None:
            headers["Retry-After"] = str(exc.retry_after)

        return Response(
            content=ApiErrorBody(
                error=ApiErrorDetail(code=exc.code, retryable=exc.retryable)
            ).model_dump_json(),
            status_code=exc.http_status,
            media_type="application/json",
            headers=headers,
        )

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(request: Request, exc: RequestValidationError):
        return Response(
            content=ApiErrorBody(
                error=ApiErrorDetail(code="invalid_input", retryable=False)
            ).model_dump_json(),
            status_code=status.HTTP_400_BAD_REQUEST,
            media_type="application/json",
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        code_map = {
            400: ("invalid_input", False),
            413: ("payload_too_large", False),
            429: ("rate_limited", True),
        }
        code, retryable = code_map.get(exc.status_code, ("internal_error", True))
        return Response(
            content=ApiErrorBody(
                error=ApiErrorDetail(code=code, retryable=retryable)
            ).model_dump_json(),
            status_code=exc.status_code,
            media_type="application/json",
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        logger.error("Unhandled Exception: %s", type(exc).__name__)
        return Response(
            content=ApiErrorBody(
                error=ApiErrorDetail(code="internal_error", retryable=True)
            ).model_dump_json(),
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            media_type="application/json",
        )

    # Routes
    @app.get("/health", response_model=HealthResponse)
    async def health_check():
        ai_enabled = settings.ai_enabled and bool(settings.groq_api_key or settings.gemini_api_key)
        image_input = settings.enable_image_input and ai_enabled
        return HealthResponse(
            status="ok",
            schema_version="1.0",
            ai_enabled=ai_enabled,
            features=HealthFeatures(image_input=image_input),
        )

    @app.post("/api/analyze", response_model=AnalyzeResponse)
    async def analyze_endpoint(req: AnalyzeRequest, request: Request):
        start_time = time.time()
        ai_prov = getattr(request.app.state, "ai_provider", None) or get_ai_provider()

        response = await run_analysis_pipeline(req, ai_provider=ai_prov)

        latency_ms = int((time.time() - start_time) * 1000)

        # Permitted metadata logging ONLY - NO message text, quotes, or sensitive info
        logger.info(
            "Analysis complete: request_id=%s, mode=%s, input_kind=%s, tier=%s, indicator_ids=%s, latency_ms=%d",
            response.request_id,
            response.mode,
            response.input_kind,
            response.tier.level if response.tier else "none",
            response.tier.contributing_rule_ids if response.tier else [],
            latency_ms,
        )

        return response

    return app

app = create_app()
