import asyncio
import logging
from typing import Any
from groq import AsyncGroq

from app.config import get_settings
from app.ai.schemas import AIExtraction, AISummary
from app.ai.prompts import (
    EXTRACTION_SYSTEM_INSTRUCTION,
    SUMMARY_SYSTEM_INSTRUCTION,
    format_extraction_prompt,
)

logger = logging.getLogger("ruko.ai")

class GroqProvider:
    def __init__(self, api_key: str | None = None, model_name: str | None = None):
        settings = get_settings()
        if api_key is not None:
            self.api_key = api_key
        else:
            self.api_key = settings.groq_api_key

        self.model_name = model_name or settings.groq_model or "llama-3.3-70b-versatile"
        self.timeout = settings.ai_timeout_seconds

        if self.api_key:
            self.client = AsyncGroq(api_key=self.api_key)
        else:
            self.client = None

    async def transcribe(self, image_bytes: bytes, mime: str) -> str | None:
        """Groq text models do not process images directly. Returns None safely."""
        return None

    async def extract_claims(self, text: str, nonce: str) -> AIExtraction | None:
        if not self.client:
            return None

        try:
            prompt = format_extraction_prompt(text, nonce)
            system_instruction = (
                EXTRACTION_SYSTEM_INSTRUCTION
                + "\n\nRespond ONLY with a JSON object matching this schema:\n"
                '{\n'
                '  "claims": [\n'
                '    {\n'
                '      "quote": "verbatim quote string",\n'
                '      "category": "one of: return_promise, registration_claim, payment_request, app_or_link, urgency, secrecy, group_invite, authority_claim, other_financial_claim",\n'
                '      "restatement_en": "neutral English sentence",\n'
                '      "restatement_ta": "neutral Tamil sentence"\n'
                '    }\n'
                '  ]\n'
                '}'
            )
            response = await asyncio.wait_for(
                self.client.chat.completions.create(
                    model=self.model_name,
                    messages=[
                        {"role": "system", "content": system_instruction},
                        {"role": "user", "content": prompt},
                    ],
                    temperature=0.0,
                    max_tokens=1500,
                    response_format={"type": "json_object"},
                ),
                timeout=self.timeout,
            )

            content = response.choices[0].message.content
            if content:
                return AIExtraction.model_validate_json(content)
        except Exception as exc:
            err_msg = getattr(exc, "message", str(exc))
            logger.warning("Groq extraction failed (%s): %s", type(exc).__name__, err_msg[:200])

        return None

    async def summarize(self, facts: dict[str, Any]) -> AISummary | None:
        if not self.client:
            return None

        try:
            import json
            facts_str = json.dumps(facts, ensure_ascii=False)
            response = await asyncio.wait_for(
                self.client.chat.completions.create(
                    model=self.model_name,
                    messages=[
                        {"role": "system", "content": SUMMARY_SYSTEM_INSTRUCTION},
                        {"role": "user", "content": f"Facts for summary:\n{facts_str}"},
                    ],
                    temperature=0.0,
                    max_tokens=1000,
                    response_format={"type": "json_object"},
                ),
                timeout=self.timeout,
            )

            content = response.choices[0].message.content
            if content:
                return AISummary.model_validate_json(content)
        except Exception as exc:
            err_msg = getattr(exc, "message", str(exc))
            logger.warning("Groq summary failed (%s): %s", type(exc).__name__, err_msg[:200])

        return None
