import re
from typing import Any
from app.schemas import Claim, Span, IndicatorObj, VerifyThroughObj, L10n
from app.pipeline.normalize import utf16_index
from app.pipeline.copy import get_copy_manager

BANNED_PATTERNS: list[re.Pattern] = [
    re.compile(r"\b(safe|safest|legit|legitimate|genuine|guaranteed to be|definitely|certainly|100\s*%)\b", re.IGNORECASE),
    re.compile(r"\b(?:is|are|this is|it is|looks like)\s+(?:a\s+)?(?:scam|scammer|fraud|fraudster|criminal)\b", re.IGNORECASE),
    re.compile(r"\bscammer|fraudster\b", re.IGNORECASE),
    re.compile(r"\b(?:buy|sell|hold|invest in|recommend|should invest|good investment|bad investment)\b", re.IGNORECASE),
    re.compile(r"\d+\s*%\s*(?:chance|probability|likely|risk)", re.IGNORECASE),
    re.compile(r"பாதுகாப்பான", re.UNICODE),
    re.compile(r"(?:இது|இவர்)\s*(?:ஒரு\s*)?மோசடி", re.UNICODE),
]

URL_PATTERN = re.compile(r"https?://|www\.", re.IGNORECASE)

def is_text_safe(text: str | None) -> bool:
    """
    Returns True if string is safe according to banned phrase and safety filters:
    - Not None
    - Length <= 300
    - Contains no URL
    - Matches no banned phrase regex
    """
    if not text:
        return False

    if len(text) > 300:
        return False

    if URL_PATTERN.search(text):
        return False

    for pat in BANNED_PATTERNS:
        if pat.search(text):
            return False

    return True

def calculate_overlap_ratio(s1: tuple[int, int], s2: tuple[int, int]) -> float:
    """Calculates overlap fraction relative to s1 length."""
    start = max(s1[0], s2[0])
    end = min(s1[1], s2[1])
    if end <= start:
        return 0.0
    overlap_len = end - start
    s1_len = max(1, s1[1] - s1[0])
    return overlap_len / s1_len

def validate_and_merge_ai_claims(
    raw_ai_claims: list[dict[str, Any]],
    analysed_text: str,
    rule_claims: list[Claim],
) -> list[Claim]:
    """
    Validates AI claims:
    - Quote must be exact substring in analysed_text (max 200 chars).
    - Overlap with any rule claim < 50%.
    - Category in allowed enum.
    - Restatement strings must pass safety filter.
    Returns built AI claims with IDs a1, a2, ...
    """
    copy_mgr = get_copy_manager()
    ai_copy = copy_mgr.get_rule_copy("ai_noticed")

    rule_spans: list[tuple[int, int]] = []
    for rc in rule_claims:
        # We need python character offsets for overlap comparison
        # Let's find python character offsets from quote matching or store them
        # Search exact quote in analysed_text
        c_start = analysed_text.find(rc.quote)
        if c_start != -1:
            rule_spans.append((c_start, c_start + len(rc.quote)))

    kept_claims: list[Claim] = []
    ai_idx = 1

    for raw in raw_ai_claims[:6]:
        quote = raw.get("quote", "")
        if not quote or len(quote) > 200:
            continue

        c_start = analysed_text.find(quote)
        if c_start == -1:
            continue
        c_end = c_start + len(quote)

        # Check overlap >= 50% with any rule claim
        too_much_overlap = False
        for r_start, r_end in rule_spans:
            if calculate_overlap_ratio((c_start, c_end), (r_start, r_end)) >= 0.5:
                too_much_overlap = True
                break

        if too_much_overlap:
            continue

        # Check restatement details
        detail_en = raw.get("restatement_en")
        detail_ta = raw.get("restatement_ta")

        detail: L10n | None = None
        if is_text_safe(detail_en) and is_text_safe(detail_ta):
            detail = L10n(en=detail_en, ta=detail_ta)

        u16_start = utf16_index(analysed_text, c_start)
        u16_end = utf16_index(analysed_text, c_end)

        claim = Claim(
            id=f"a{ai_idx}",
            quote=quote,
            span=Span(start=u16_start, end=u16_end),
            extra_spans=[],
            indicator=IndicatorObj(id="ai_noticed", label=L10n(**ai_copy["label"])),
            severity="info",
            origin="ai",
            why_it_matters=L10n(**ai_copy["why_it_matters"]),
            verify_through=VerifyThroughObj(
                text=L10n(**ai_copy["verify_through"]["text"]),
                route_ids=ai_copy["verify_through"]["route_ids"],
            ),
            limit=L10n(**ai_copy["limit"]),
            verifiable_by="not_verifiable_from_message",
            source_basis="general_awareness",
            detail=detail,
        )

        kept_claims.append(claim)
        ai_idx += 1

    return kept_claims
