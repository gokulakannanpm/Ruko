import sys
import os
import json
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__) + "/.."))

from dotenv import load_dotenv
from google import genai
from google.genai import types
from app.ai.schemas import AIExtraction, AISummary, AITranscription
from app.ai.prompts import (
    EXTRACTION_SYSTEM_INSTRUCTION,
    SUMMARY_SYSTEM_INSTRUCTION,
    format_extraction_prompt,
    make_nonce,
)

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
model = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")
client = genai.Client(api_key=api_key)

def clean_gemini_schema(model_cls) -> dict:
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
                # Convert Pydantic Optional (anyOf [type, null]) to single type
                non_null = [item for item in v if item.get("type") != "null"]
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

schema = clean_gemini_schema(AIExtraction)
print("Cleaned Schema:\n", json.dumps(schema, indent=2))

nonce = make_nonce()
prompt = format_extraction_prompt("Daily 3% guaranteed profit", nonce)

cfg = types.GenerateContentConfig(
    system_instruction=EXTRACTION_SYSTEM_INSTRUCTION,
    temperature=0.0,
    max_output_tokens=1500,
    response_mime_type="application/json",
    response_schema=schema,
    automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True),
)

try:
    res = client.models.generate_content(model=model, contents=prompt, config=cfg)
    print("\n--- EXTRACTION RESULT ---")
    print(res.text.encode("ascii", "backslashreplace").decode("ascii"))
except Exception as e:
    print("Error:", type(e).__name__, e)
