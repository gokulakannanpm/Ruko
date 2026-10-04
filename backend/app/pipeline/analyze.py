import asyncio
import uuid
from typing import Any
from app.config import get_settings
from app.schemas import (
    AnalyzeRequest, AnalyzeResponse, MaskingObj, LanguageObj,
    AiNoticeObj, SummaryObj, L10n, WarningCode, MaskReportItem
)
from app.errors import InvalidInputError, PayloadTooLargeError
from app.security import decode_base64_image, sniff_image_mime
from app.pipeline.normalize import normalize_text
from app.pipeline.masking import mask_sensitive_data
from app.pipeline.language import detect_language
from app.pipeline.rules_engine import run_pattern_rules
from app.pipeline.extractors import run_extractors
from app.pipeline.claims import build_claims
from app.pipeline.tiering import compute_tier
from app.pipeline.advice import check_advice_request, ADVICE_REFUSAL
from app.pipeline.actions import build_actions, build_template_summary, CANNOT_VERIFY_ITEMS
from app.pipeline.validate import validate_and_merge_ai_claims, is_text_safe
from app.ai.base import AIProvider, NullProvider
from app.ai.prompts import make_nonce

async def run_analysis_pipeline(
    req: AnalyzeRequest,
    ai_provider: AIProvider | None = None,
) -> AnalyzeResponse:
    settings = get_settings()
    request_id = str(uuid.uuid4())
    warnings: list[WarningCode] = []

    # 1. Image processing (if present)
    image_text: str = ""
    text_source: str = "user_text"
    image_sent_to_ai: bool = False

    if req.image:
        # Validate base64 & MIME & size
        if req.image.mime not in ("image/jpeg", "image/png", "image/webp"):
            raise InvalidInputError("Unsupported image MIME type")

        img_bytes = decode_base64_image(req.image.data_base64)
        if not img_bytes:
            raise InvalidInputError("Invalid base64 image data")

        if len(img_bytes) > settings.max_image_bytes:
            raise PayloadTooLargeError("Image payload exceeds maximum allowed bytes")

        sniffed_mime = sniff_image_mime(img_bytes)
        if sniffed_mime != req.image.mime:
            raise InvalidInputError("Image magic bytes do not match declared MIME type")

        can_process_image = (
            settings.enable_image_input
            and settings.ai_enabled
            and bool(settings.groq_api_key or settings.gemini_api_key)
            and req.allow_ai
            and ai_provider is not None
            and not isinstance(ai_provider, NullProvider)
        )

        if not can_process_image:
            warnings.append("image_not_processed")
        else:
            image_sent_to_ai = True
            try:
                transcribed = await ai_provider.transcribe(img_bytes, req.image.mime)
                if transcribed:
                    image_text = transcribed
                else:
                    warnings.append("image_unreadable")
            except Exception:
                warnings.append("image_unreadable")

    # 2. Text normalization & truncation
    raw_user_text = req.text or ""
    if len(raw_user_text) > 20000:
        raise PayloadTooLargeError("Text input exceeds maximum limit of 20000 characters")

    norm_user_text, truncated_user = normalize_text(raw_user_text, settings.max_text_chars)
    if truncated_user:
        warnings.append("text_truncated")

    norm_img_text = ""
    if image_text:
        norm_img_text, _ = normalize_text(image_text, settings.max_text_chars)

    # Determine combined text and source
    if norm_user_text and norm_img_text:
        combined_text = f"{norm_user_text}\n\n{norm_img_text}"
        text_source = "both"
    elif norm_img_text:
        combined_text = norm_img_text
        text_source = "image_transcription"
    else:
        combined_text = norm_user_text
        text_source = "user_text"

    # 3. Server-side Masking
    masked_text, server_counts = mask_sensitive_data(combined_text)

    # Check client mask report against server counts
    client_counts_dict = {item.kind: item.count for item in req.client_mask_report}
    for kind, count in server_counts.items():
        if count > client_counts_dict.get(kind, 0):
            warnings.append("masking_changed_text")
            break

    applied_masking_list = [
        MaskReportItem(kind=kind, count=count)
        for kind, count in server_counts.items()
        if count > 0
    ]

    analysed_text = masked_text

    # Check unreadable input (empty text after normalization & masking)
    if not analysed_text.strip():
        return AnalyzeResponse(
            request_id=request_id,
            mode="rules_only",
            input_kind="unreadable",
            text_source=text_source,
            analysed_text=analysed_text,
            language=LanguageObj(detected="unknown", output=req.ui_language),
            tier=None,
            ai_notice=None,
            masking=MaskingObj(
                applied=applied_masking_list,
                text_sent_to_ai=False,
                image_sent_to_ai=image_sent_to_ai,
            ),
            claims=[],
            cannot_verify=[],
            actions=None,
            summary=None,
            refusal=None,
            warnings=warnings,
        )

    # 4. Language Detection
    detected_lang = detect_language(analysed_text)

    # 5. Rules & Extractors
    rule_matches = run_pattern_rules(analysed_text)
    extractor_matches = run_extractors(analysed_text)
    all_raw_matches = rule_matches + extractor_matches

    rule_claims = build_claims(all_raw_matches, analysed_text)

    # 6. Advice Request Detection
    if check_advice_request(analysed_text, rule_claims):
        return AnalyzeResponse(
            request_id=request_id,
            mode="rules_only",
            input_kind="advice_request",
            text_source=text_source,
            analysed_text=analysed_text,
            language=LanguageObj(detected=detected_lang, output=req.ui_language),
            tier=None,
            ai_notice=None,
            masking=MaskingObj(
                applied=applied_masking_list,
                text_sent_to_ai=False,
                image_sent_to_ai=image_sent_to_ai,
            ),
            claims=[],
            cannot_verify=[],
            actions=None,
            summary=None,
            refusal=ADVICE_REFUSAL,
            warnings=warnings,
        )

    # 7. Tiering (Deterministic)
    tier = compute_tier(rule_claims)

    # 8. Template Actions, Summary, Cannot Verify
    actions = build_actions(rule_claims, tier.level)
    summary = build_template_summary(tier.level)
    cannot_verify = CANNOT_VERIFY_ITEMS

    # 9. AI Stage Evaluation
    ai_instruction_fired = any(c.indicator.id == "ai_instruction_text" for c in rule_claims)
    ai_available = (
        settings.ai_enabled
        and (bool(settings.groq_api_key or settings.gemini_api_key) or not isinstance(ai_provider, (NullProvider, type(None))))
        and ai_provider is not None
        and not isinstance(ai_provider, NullProvider)
    )

    should_run_ai = req.allow_ai and ai_available and not ai_instruction_fired

    if not req.allow_ai:
        warnings.append("ai_disabled_by_user")

    if req.allow_ai and not ai_available:
        warnings.append("ai_unavailable")

    if ai_instruction_fired:
        warnings.append("ai_skipped_untrusted_instructions")

    text_sent_to_ai = False
    ai_claims_kept: list[Claim] = []
    ai_notice: AiNoticeObj | None = None
    final_mode: str = "rules_only"

    if should_run_ai:
        text_sent_to_ai = True
        nonce = make_nonce()

        facts = {
            "tier_level": tier.level,
            "indicator_count": len(tier.contributing_rule_ids),
            "indicator_labels_en": [c.indicator.label.en for c in rule_claims if c.origin == "rule"],
        }

        try:
            extraction_res, summary_res = await asyncio.gather(
                ai_provider.extract_claims(analysed_text, nonce),
                ai_provider.summarize(facts),
                return_exceptions=True,
            )

            # Process extraction
            if isinstance(extraction_res, Exception) or extraction_res is None:
                if "ai_unavailable" not in warnings:
                    warnings.append("ai_unavailable")
            elif hasattr(extraction_res, "claims"):
                raw_claims_dicts = [claim_obj.model_dump() for claim_obj in extraction_res.claims]
                ai_claims_kept = validate_and_merge_ai_claims(
                    raw_claims_dicts, analysed_text, rule_claims
                )

            # Process summary
            if isinstance(summary_res, Exception) or summary_res is None:
                pass  # Fall back to template summary
            elif hasattr(summary_res, "summary_en") and hasattr(summary_res, "summary_ta"):
                s_en = summary_res.summary_en
                s_ta = summary_res.summary_ta
                if is_text_safe(s_en) and is_text_safe(s_ta):
                    summary = SummaryObj(
                        text=L10n(en=s_en, ta=s_ta),
                        source="ai"
                    )
        except Exception:
            if "ai_unavailable" not in warnings:
                warnings.append("ai_unavailable")

    all_claims = list(rule_claims)
    if ai_claims_kept:
        all_claims.extend(ai_claims_kept)
        ai_notice = AiNoticeObj(extra_claim_count=len(ai_claims_kept))

    if ai_claims_kept or (summary and summary.source == "ai"):
        final_mode = "full"

    return AnalyzeResponse(
        request_id=request_id,
        mode=final_mode,
        input_kind="solicitation_message",
        text_source=text_source,
        analysed_text=analysed_text,
        language=LanguageObj(detected=detected_lang, output=req.ui_language),
        tier=tier,
        ai_notice=ai_notice,
        masking=MaskingObj(
            applied=applied_masking_list,
            text_sent_to_ai=text_sent_to_ai,
            image_sent_to_ai=image_sent_to_ai,
        ),
        claims=all_claims,
        cannot_verify=cannot_verify,
        actions=actions,
        summary=summary,
        refusal=None,
        warnings=warnings,
    )
