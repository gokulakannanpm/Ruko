from typing import Protocol, Any
from app.ai.schemas import AIExtraction, AISummary

class AIProvider(Protocol):
    async def transcribe(self, image_bytes: bytes, mime: str) -> str | None:
        ...

    async def extract_claims(self, text: str, nonce: str) -> AIExtraction | None:
        ...

    async def summarize(self, facts: dict[str, Any]) -> AISummary | None:
        ...

class NullProvider:
    """Returns None for all calls (AI disabled or fallback)."""
    async def transcribe(self, image_bytes: bytes, mime: str) -> str | None:
        return None

    async def extract_claims(self, text: str, nonce: str) -> AIExtraction | None:
        return None

    async def summarize(self, facts: dict[str, Any]) -> AISummary | None:
        return None

class FakeProvider:
    """Configurable fake provider for tests."""
    def __init__(
        self,
        transcription: str | None = None,
        extraction: AIExtraction | None = None,
        summary: AISummary | None = None,
        should_fail: bool = False,
    ):
        self.transcription = transcription
        self.extraction = extraction
        self.summary = summary
        self.should_fail = should_fail

    async def transcribe(self, image_bytes: bytes, mime: str) -> str | None:
        if self.should_fail:
            raise RuntimeError("FakeProvider configured to fail")
        return self.transcription

    async def extract_claims(self, text: str, nonce: str) -> AIExtraction | None:
        if self.should_fail:
            raise RuntimeError("FakeProvider configured to fail")
        return self.extraction

    async def summarize(self, facts: dict[str, Any]) -> AISummary | None:
        if self.should_fail:
            raise RuntimeError("FakeProvider configured to fail")
        return self.summary
