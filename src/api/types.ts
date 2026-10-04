export type Lang = "en" | "ta";
export interface L10n { en: string; ta: string }
export type TierLevel = "several_indicators" | "some_indicators" | "none_found";
export type Severity = "strong" | "medium" | "weak" | "info";
export type VerifiableBy = "official_source_by_user" | "format_check_only" | "not_verifiable_from_message";
export type SourceBasis = "regulator_guidance" | "reported_pattern" | "general_awareness";
export type MaskKind = "otp" | "card" | "aadhaar" | "pan" | "phone" | "account";
export type WarningCode =
  | "ai_disabled_by_user" | "ai_unavailable" | "ai_skipped_untrusted_instructions"
  | "image_unreadable" | "image_not_processed" | "text_truncated" | "masking_changed_text";
export type ErrorCode = "invalid_input" | "payload_too_large" | "rate_limited" | "internal_error";
export type ClientErrorCode = ErrorCode | "network" | "timeout" | "malformed_response" | "mock_no_fixture";

export interface MaskReportItem { kind: MaskKind; count: number }
export interface Span { start: number; end: number }          // UTF-16 code unit offsets into analysed_text

export interface ImagePayload { mime: "image/jpeg" | "image/png" | "image/webp"; data_base64: string }

export interface AnalyzeRequest {
  text: string;                                                // already masked, max 4000 chars
  image: ImagePayload | null;
  ui_language: Lang;
  allow_ai: boolean;
  client_mask_report: MaskReportItem[];
}

export interface Claim {
  id: string;                                                  // "r1".. for rules, "a1".. for AI
  quote: string;                                               // exact substring of analysed_text
  span: Span;
  extra_spans: Span[];
  indicator: { id: string; label: L10n };
  severity: Severity;
  origin: "rule" | "ai";
  why_it_matters: L10n;
  verify_through: { text: L10n; route_ids: string[] };
  limit: L10n;
  verifiable_by: VerifiableBy;
  source_basis: SourceBasis;
  detail: L10n | null;
}
export interface Route { id: string; label: L10n; description: L10n; url: string | null; tel: string | null }
export interface Actions {
  verification_routes: Route[];
  pause_pact: { suggested_hours: number; checklist: { id: string; text: L10n }[] };
  trusted_person_message: L10n;
  already_paid: { steps: { id: string; text: L10n; tel: string | null; url: string | null }[] };
}
export interface AnalyzeResponse {
  schema_version: "1.0";
  request_id: string;
  mode: "full" | "rules_only" | "mock";                        // "mock" is set only by the frontend
  input_kind: "solicitation_message" | "advice_request" | "unreadable";
  text_source: "user_text" | "image_transcription" | "both";
  analysed_text: string;
  language: { detected: "en" | "ta" | "ta_latn" | "mixed" | "unknown"; output: Lang };
  tier: { level: TierLevel; label: L10n; contributing_rule_ids: string[] } | null;
  ai_notice: { extra_claim_count: number } | null;
  masking: { applied: MaskReportItem[]; text_sent_to_ai: boolean; image_sent_to_ai: boolean };
  claims: Claim[];
  cannot_verify: { id: string; text: L10n }[];
  actions: Actions | null;
  summary: { text: L10n; source: "ai" | "template" } | null;
  refusal: L10n | null;
  warnings: WarningCode[];
}
export interface HealthResponse { status: "ok"; schema_version: "1.0"; ai_enabled: boolean; features: { image_input: boolean } }
export interface ApiErrorBody { error: { code: ErrorCode; retryable: boolean } }
