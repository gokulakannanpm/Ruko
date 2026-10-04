from typing import Any, Literal
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

AICategory = Literal[
    "return_promise",
    "registration_claim",
    "payment_request",
    "app_or_link",
    "urgency",
    "secrecy",
    "group_invite",
    "authority_claim",
    "other_financial_claim",
]

VALID_CATEGORIES = {
    "return_promise",
    "registration_claim",
    "payment_request",
    "app_or_link",
    "urgency",
    "secrecy",
    "group_invite",
    "authority_claim",
    "other_financial_claim",
}

CATEGORY_MAP = {
    "financial_claim": "other_financial_claim",
    "financial": "other_financial_claim",
    "guaranteed_return": "return_promise",
    "promise": "return_promise",
    "payment": "payment_request",
    "link": "app_or_link",
    "urgent": "urgency",
    "secret": "secrecy",
    "group": "group_invite",
    "authority": "authority_claim",
}

class AIExtractionClaim(BaseModel):
    quote: str
    category: AICategory
    restatement_en: str | None = None
    restatement_ta: str | None = None

    model_config = ConfigDict(extra="forbid")

    @field_validator("category", mode="before")
    @classmethod
    def normalize_category(cls, v: Any) -> str:
        if isinstance(v, str):
            val = v.lower().strip()
            if val in VALID_CATEGORIES:
                return val
            if val in CATEGORY_MAP:
                return CATEGORY_MAP[val]
        return "other_financial_claim"

class AIExtraction(BaseModel):
    claims: list[AIExtractionClaim] = Field(default_factory=list)
    extracted_quotes: list[AIExtractionClaim] | None = None
    quotes: list[AIExtractionClaim] | None = None
    extractions: list[AIExtractionClaim] | None = None

    model_config = ConfigDict(extra="forbid")

    @model_validator(mode="after")
    def reconcile_claims(self) -> "AIExtraction":
        if not self.claims:
            for alt in (self.extracted_quotes, self.quotes, self.extractions):
                if alt:
                    self.claims = alt
                    break
        return self

class AISummary(BaseModel):
    summary_en: str
    summary_ta: str

    model_config = ConfigDict(extra="forbid")

class AITranscription(BaseModel):
    text: str

    model_config = ConfigDict(extra="forbid")
