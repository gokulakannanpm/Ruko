import asyncio
import logging
from typing import Any
from google import genai
from google.genai import types

from app.config import get_settings
from app.ai.schemas import AIExtraction, AISummary, AITranscription
from app.ai.prompts import (
    EXTRACTION_SYSTEM_INSTRUCTION,
    SUMMARY_SYSTEM_INSTRUCTION,
    TRANSCRIPTION_SYSTEM_INSTRUCTION,
    format_extraction_prompt,
)

logger = logging.getLogger("ruko.ai")

def clean_gemini_schema(model_cls) -> dict:
    """
    Cleans Pydantic json_schema for Gemini API compatibility:
    - Removes additionalProperties (which causes HTTP 400 INVALID_ARGUMENT)
    - Removes $schema, $defs, title
    - Dereferences any $ref pointers
    - Flattens anyOf optional types
    """
    raw_schema = model_cls.model_json_schema()
    defs = raw_schema.get("$defs", {})

    def resolve_ref(ref_str: str) -> dict:
        def_name = ref_str.split("/")[-1]
        return clean_node(defs.get(def_name, {}))

    def clean_node(node: dict) -> dict:
        if not isinstance(node, dict):
            return node

        if "$ref" in node:
            return resolve_ref(node["$ref"])

        cleaned = {}
        for k, v in node.items():
            if k in ("additionalProperties", "$schema", "$defs", "title"):
                continue
            if k == "anyOf":
                non_null = [item for item in v if isinstance(item, dict) and item.get("type") != "null"]
                if non_null:
                    return clean_node(non_null[0])
                continue
            if isinstance(v, dict):
                cleaned[k] = clean_node(v)
            elif isinstance(v, list):
                cleaned[k] = [clean_node(item) for item in v]
            else:
                cleaned[k] = v
        return cleaned

    return clean_node(raw_schema)

class GeminiProvider:
    def __init__(self, api_key: str | None = None, model_name: str | None = None):
        settings = get_settings()
        self.api_key = api_key or settings.gemini_api_key
        self.model_name = model_name or settings.gemini_model
        self.timeout = settings.ai_timeout_seconds

        if self.api_key:
            self.client = genai.Client(api_key=self.api_key)
        else:
            self.client = None

    async def transcribe(self, image_bytes: bytes, mime: str) -> str | None:
        if not self.client:
            return None

        try:
            part = types.Part.from_bytes(data=image_bytes, mime_type=mime)
            schema = clean_gemini_schema(AITranscription)
            config = types.GenerateContentConfig(
                system_instruction=TRANSCRIPTION_SYSTEM_INSTRUCTION,
                temperature=0.0,
                max_output_tokens=1500,
                response_mime_type="application/json",
                response_schema=schema,
                automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True),
            )

            response = await asyncio.wait_for(
                self.client.aio.models.generate_content(
                    model=self.model_name,
                    contents=[part, "Transcribe all text from this image as JSON."],
                    config=config,
                ),
                timeout=self.timeout,
            )

            if response and response.text:
                res_obj = AITranscription.model_validate_json(response.text)
                return res_obj.text.strip()
        except Exception as exc:
            err_msg = getattr(exc, "message", str(exc))
            logger.warning("Gemini transcription failed (%s): %s", type(exc).__name__, err_msg[:200])

        return None

    async def extract_claims(self, text: str, nonce: str) -> AIExtraction | None:
        if not self.client:
            return None

        try:
            prompt = format_extraction_prompt(text, nonce)
            schema = clean_gemini_schema(AIExtraction)
            config = types.GenerateContentConfig(
                system_instruction=EXTRACTION_SYSTEM_INSTRUCTION,
                temperature=0.0,
                max_output_tokens=2000,
                response_mime_type="application/json",
                response_schema=schema,
                automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True),
            )

            response = await asyncio.wait_for(
                self.client.aio.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                    config=config,
                ),
                timeout=self.timeout,
            )

            if response and response.text:
                return AIExtraction.model_validate_json(response.text)
        except Exception as exc:
            err_msg = getattr(exc, "message", str(exc))
            logger.warning("Gemini extraction failed (%s): %s", type(exc).__name__, err_msg[:200])

        return None

    async def summarize(self, facts: dict[str, Any]) -> AISummary | None:
        if not self.client:
            return None

        try:
            import json
            facts_str = json.dumps(facts, ensure_ascii=False)
            schema = clean_gemini_schema(AISummary)
            config = types.GenerateContentConfig(
                system_instruction=SUMMARY_SYSTEM_INSTRUCTION,
                temperature=0.0,
                max_output_tokens=1000,
                response_mime_type="application/json",
                response_schema=schema,
                automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True),
            )

            response = await asyncio.wait_for(
                self.client.aio.models.generate_content(
                    model=self.model_name,
                    contents=f"Facts for summary:\n{facts_str}",
                    config=config,
                ),
                timeout=self.timeout,
            )

            if response and response.text:
                return AISummary.model_validate_json(response.text)
        except Exception as exc:
            err_msg = getattr(exc, "message", str(exc))
            logger.warning("Gemini summary failed (%s): %s", type(exc).__name__, err_msg[:200])

        return None
