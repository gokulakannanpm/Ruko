import pytest
from app.schemas import Claim, Span, IndicatorObj, VerifyThroughObj, L10n
from app.pipeline.tiering import compute_tier

def make_dummy_claim(cid: str, indicator_id: str, severity: str, origin: str = "rule") -> Claim:
    return Claim(
        id=cid,
        quote="dummy quote",
        span=Span(start=0, end=10),
        extra_spans=[],
        indicator=IndicatorObj(id=indicator_id, label=L10n(en="lbl", ta="lbl")),
        severity=severity,
        origin=origin,
        why_it_matters=L10n(en="why", ta="why"),
        verify_through=VerifyThroughObj(text=L10n(en="v", ta="v"), route_ids=[]),
        limit=L10n(en="lim", ta="lim"),
        verifiable_by="official_source_by_user",
        source_basis="general_awareness",
    )

def test_tier_calculation_several():
    # sensitive_request in strong -> several_indicators
    c1 = make_dummy_claim("r1", "sensitive_request", "strong")
    tier1 = compute_tier([c1])
    assert tier1.level == "several_indicators"

    # 2 strong -> several_indicators
    c2 = make_dummy_claim("r1", "assured_return", "strong")
    c3 = make_dummy_claim("r2", "upfront_or_withdrawal_fee", "strong")
    tier2 = compute_tier([c2, c3])
    assert tier2.level == "several_indicators"

    # 1 strong + urgency in medium -> several_indicators
    c4 = make_dummy_claim("r1", "assured_return", "strong")
    c5 = make_dummy_claim("r2", "urgency", "medium")
    tier3 = compute_tier([c4, c5])
    assert tier3.level == "several_indicators"

def test_tier_calculation_some():
    # 1 strong -> some_indicators
    c1 = make_dummy_claim("r1", "assured_return", "strong")
    tier1 = compute_tier([c1])
    assert tier1.level == "some_indicators"

    # 1 medium -> some_indicators
    c2 = make_dummy_claim("r1", "specific_call", "medium")
    tier2 = compute_tier([c2])
    assert tier2.level == "some_indicators"

def test_tier_calculation_none():
    # Only info severity -> none_found
    c1 = make_dummy_claim("r1", "proof_screenshots", "info")
    tier = compute_tier([c1])
    assert tier.level == "none_found"

def test_ai_claims_do_not_alter_tier():
    rule_claims = [make_dummy_claim("r1", "specific_call", "medium")]
    initial_tier = compute_tier(rule_claims)
    assert initial_tier.level == "some_indicators"

    # Add 5 hostile/strong AI claims
    ai_claims = [
        make_dummy_claim("a1", "ai_noticed", "strong", origin="ai"),
        make_dummy_claim("a2", "ai_noticed", "strong", origin="ai"),
    ]

    tier_with_ai = compute_tier(rule_claims + ai_claims)
    assert tier_with_ai.level == initial_tier.level
    assert tier_with_ai.contributing_rule_ids == initial_tier.contributing_rule_ids
