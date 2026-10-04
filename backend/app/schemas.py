from typing import Literal
from pydantic import BaseModel, Field, ConfigDict, field_validator

Lang = Literal["en", "ta"]
TierLevel = Literal["several_indicators", "some_indicators", "none_found"]
Severity = Literal["strong", "medium", "weak", "info"]
VerifiableBy = Literal["official_source_by_user", "format_check_only", "not_verifiable_from_message"]
SourceBasis = Literal["regulator_guidance", "reported_pattern", "general_awareness"]
MaskKind = Literal["otp", "card", "aadhaar", "pan", "phone", "account"]
WarningCode = Literal[
    "ai_disabled_by_user",
    "ai_unavailable",
    "ai_skipped_untrusted_instructions",
    "image_unreadable",
    "image_not_processed",
    "text_truncated",
    "masking_changed_text"
]
ErrorCode = Literal["invalid_input", "payload_too_large", "rate_limited", "internal_error"]

class L10n(BaseModel):
    en: str
    ta: str

    @field_validator("en", "ta")
    @classmethod
    def validate_non_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("L10n translation strings must not be empty")
        return v

class MaskReportItem(BaseModel):
    kind: MaskKind
    count: int

class Span(BaseModel):
    start: int
    end: int

class ImagePayload(BaseModel):
    mime: Literal["image/jpeg", "image/png", "image/webp"]
    data_base64: str

class AnalyzeRequest(BaseModel):
    text: str = ""
    image: ImagePayload | None = None
    ui_language: Lang = "en"
    allow_ai: bool = False
    client_mask_report: list[MaskReportItem] = Field(default_factory=list)

    model_config = ConfigDict(extra="forbid")

class IndicatorObj(BaseModel):
    id: str
    label: L10n

class VerifyThroughObj(BaseModel):
    text: L10n
    route_ids: list[str]

class Claim(BaseModel):
    id: str
    quote: str
    span: Span
    extra_spans: list[Span] = Field(default_factory=list)
    indicator: IndicatorObj
    severity: Severity
    origin: Literal["rule", "ai"]
    why_it_matters: L10n
    verify_through: VerifyThroughObj
    limit: L10n
    verifiable_by: VerifiableBy
    source_basis: SourceBasis
    detail: L10n | None = None

class Route(BaseModel):
    id: str
    label: L10n
    description: L10n
    url: str | None = None
    tel: str | None = None

class ChecklistItem(BaseModel):
    id: str
    text: L10n

class PausePactObj(BaseModel):
    suggested_hours: int = 24
    checklist: list[ChecklistItem]

class StepItem(BaseModel):
    id: str
    text: L10n
    tel: str | None = None
    url: str | None = None

class AlreadyPaidObj(BaseModel):
    steps: list[StepItem]

class Actions(BaseModel):
    verification_routes: list[Route]
    pause_pact: PausePactObj
    trusted_person_message: L10n
    already_paid: AlreadyPaidObj

class TierObj(BaseModel):
    level: TierLevel
    label: L10n
    contributing_rule_ids: list[str]

class AiNoticeObj(BaseModel):
    extra_claim_count: int

class MaskingObj(BaseModel):
    applied: list[MaskReportItem]
    text_sent_to_ai: bool = False
    image_sent_to_ai: bool = False

class LanguageObj(BaseModel):
    detected: Literal["en", "ta", "ta_latn", "mixed", "unknown"]
    output: Lang

class SummaryObj(BaseModel):
    text: L10n
    source: Literal["template", "ai"]

class CannotVerifyItem(BaseModel):
    id: str
    text: L10n

class AnalyzeResponse(BaseModel):
    schema_version: Literal["1.0"] = "1.0"
    request_id: str
    mode: Literal["full", "rules_only"]
    input_kind: Literal["solicitation_message", "advice_request", "unreadable"]
    text_source: Literal["user_text", "image_transcription", "both"]
    analysed_text: str
    language: LanguageObj
    tier: TierObj | None = None
    ai_notice: AiNoticeObj | None = None
    masking: MaskingObj
    claims: list[Claim] = Field(default_factory=list)
    cannot_verify: list[CannotVerifyItem] = Field(default_factory=list)
    actions: Actions | None = None
    summary: SummaryObj | None = None
    refusal: L10n | None = None
    warnings: list[WarningCode] = Field(default_factory=list)

class HealthFeatures(BaseModel):
    image_input: bool

class HealthResponse(BaseModel):
    status: Literal["ok"] = "ok"
    schema_version: Literal["1.0"] = "1.0"
    ai_enabled: bool
    features: HealthFeatures

class ApiErrorDetail(BaseModel):
    code: ErrorCode
    retryable: bool

class ApiErrorBody(BaseModel):
    error: ApiErrorDetail
