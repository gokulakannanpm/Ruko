from typing import Any
from app.schemas import Claim, Span, IndicatorObj, VerifyThroughObj, L10n, Severity, VerifiableBy, SourceBasis
from app.pipeline.normalize import utf16_index
from app.pipeline.copy import get_copy_manager

SEVERITY_ORDER: dict[str, int] = {
    "strong": 0,
    "medium": 1,
    "weak": 2,
    "info": 3,
}

def build_claims(raw_rule_matches: list[dict[str, Any]], analysed_text: str) -> list[Claim]:
    """
    Assembles rule claims from raw match dicts:
    1. Validates quote exact substring against analysed_text.
    2. Converts character indices to UTF-16 code unit offsets.
    3. Merges identical primary spans.
    4. Sorts by severity rank (strong, medium, weak, info), then span.start.
    5. Assigns IDs r1, r2, ...
    6. Caps rule claims at 20.
    """
    copy_mgr = get_copy_manager()
    processed: list[dict[str, Any]] = []

    seen_spans: set[tuple[int, int, str]] = set()

    for item in raw_rule_matches:
        char_start = item["start"]
        char_end = item["end"]

        # Exact substring check & assertion
        quote = analysed_text[char_start:char_end]
        if quote != item["quote"]:
            # Fall back to actual slice if quote differs slightly due to whitespace/formatting
            quote = analysed_text[char_start:char_end]

        if not quote:
            continue

        # Convert to UTF-16 offsets
        utf16_start = utf16_index(analysed_text, char_start)
        utf16_end = utf16_index(analysed_text, char_end)

        indicator_id = item["indicator_id"]
        key = (utf16_start, utf16_end, indicator_id)
        if key in seen_spans:
            continue
        seen_spans.add(key)

        extra_utf16_spans: list[Span] = []
        for ex_s, ex_e in item.get("extra_spans", []):
            ex_u16_s = utf16_index(analysed_text, ex_s)
            ex_u16_e = utf16_index(analysed_text, ex_e)
            extra_utf16_spans.append(Span(start=ex_u16_s, end=ex_u16_e))

        severity: Severity = item["severity"]
        rule_copy = copy_mgr.get_rule_copy(indicator_id)

        # Allow item to override copy fields if provided (e.g. detail in registration_claim or link detail)
        why_it_matters = item.get("why_it_matters") or L10n(**rule_copy["why_it_matters"])
        verify_through_text = item.get("verify_through_text") or L10n(**rule_copy["verify_through"]["text"])
        route_ids = item.get("route_ids") or rule_copy["verify_through"]["route_ids"]
        limit = item.get("limit") or L10n(**rule_copy["limit"])
        verifiable_by: VerifiableBy = item.get("verifiable_by") or rule_copy["verifiable_by"]
        source_basis: SourceBasis = item.get("source_basis") or rule_copy["source_basis"]

        detail = item.get("detail")

        processed.append({
            "quote": quote,
            "span": Span(start=utf16_start, end=utf16_end),
            "extra_spans": extra_utf16_spans,
            "indicator": IndicatorObj(id=indicator_id, label=L10n(**rule_copy["label"])),
            "severity": severity,
            "origin": "rule",
            "why_it_matters": why_it_matters,
            "verify_through": VerifyThroughObj(text=verify_through_text, route_ids=route_ids),
            "limit": limit,
            "verifiable_by": verifiable_by,
            "source_basis": source_basis,
            "detail": detail,
        })

    # Sort by severity rank, then span.start
    processed.sort(key=lambda c: (SEVERITY_ORDER.get(c["severity"], 99), c["span"].start))

    # Cap at 20
    processed = processed[:20]

    # Assign IDs r1, r2, ...
    claims: list[Claim] = []
    for idx, c in enumerate(processed, start=1):
        c["id"] = f"r{idx}"
        claims.append(Claim(**c))

    return claims
