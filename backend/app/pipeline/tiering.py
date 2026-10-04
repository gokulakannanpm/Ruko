from app.schemas import Claim, TierObj, TierLevel, L10n

TIER_LABELS: dict[TierLevel, L10n] = {
    "several_indicators": L10n(
        en="Several risk indicators found",
        ta="பல ஆபத்து அறிகுறிகள் கண்டறியப்பட்டன"
    ),
    "some_indicators": L10n(
        en="Some risk indicators found",
        ta="சில ஆபத்து அறிகுறிகள் கண்டறியப்பட்டன"
    ),
    "none_found": L10n(
        en="No rule-based indicators found. This is not a safety check.",
        ta="விதிகள் அடிப்படையில் எந்த ஆபத்து அறிகுறியும் கண்டறியப்படவில்லை. இது பாதுகாப்புச் சோதனை அல்ல."
    )
}

def compute_tier(rule_claims: list[Claim]) -> TierObj:
    """
    Computes deterministic risk tier strictly from rule-origin claims.
    AI claims never count. Weak and info severities never contribute.
    """
    strong_indicators: set[str] = set()
    medium_indicators: set[str] = set()

    for claim in rule_claims:
        if claim.origin != "rule":
            continue
        if claim.severity == "strong":
            strong_indicators.add(claim.indicator.id)
        elif claim.severity == "medium":
            medium_indicators.add(claim.indicator.id)

    contributing = sorted(list(strong_indicators | medium_indicators))

    if (
        "sensitive_request" in strong_indicators
        or len(strong_indicators) >= 2
        or (len(strong_indicators) >= 1 and "urgency" in medium_indicators)
    ):
        level: TierLevel = "several_indicators"
    elif len(strong_indicators) == 1 or len(medium_indicators) >= 1:
        level: TierLevel = "some_indicators"
    else:
        level: TierLevel = "none_found"

    return TierObj(
        level=level,
        label=TIER_LABELS[level],
        contributing_rule_ids=contributing,
    )
