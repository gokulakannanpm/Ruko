import re
from app.schemas import Claim, L10n

ADVICE_PATTERNS: list[re.Pattern] = [
    re.compile(r"(?:which|what)\s+(?:stock|share|fund|mutual\s+fund|crypto|coin)s?\s+(?:should|to|do)\s+(?:i\s+)?(?:buy|sell|invest|hold)", re.IGNORECASE),
    re.compile(r"should\s+i\s+(?:buy|sell|hold|invest)", re.IGNORECASE),
    re.compile(r"best\s+(?:stock|share|mutual\s+fund|crypto)", re.IGNORECASE),
    re.compile(r"will\s+\w+\s+(?:go\s+up|rise|fall|reach)", re.IGNORECASE),
    re.compile(r"எந்த\s*(?:பங்கு|ஷேர்)", re.UNICODE),
    re.compile(r"(?:வாங்களா|விற்கலாமா|முதலீடு\s*செய்யலாமா)", re.UNICODE),
]

ADVICE_REFUSAL = L10n(
    en="Ruko does not recommend what to buy, sell or hold, and it cannot predict prices. If someone has sent you an investment message, paste that message here and Ruko will show which claims in it need checking.",
    ta="எதை வாங்க, விற்க அல்லது வைத்திருக்க வேண்டும் என்று ருகோ பரிந்துரைக்காது; விலைகளையும் கணிக்காது. யாராவது உங்களுக்கு முதலீடு தொடர்பான செய்தி அனுப்பியிருந்தால், அதை இங்கே ஒட்டவும்; அதிலுள்ள எந்தக் கூற்றுகளைச் சரிபார்க்க வேண்டும் என்று ருகோ காட்டும்."
)

def check_advice_request(analysed_text: str, rule_claims: list[Claim]) -> bool:
    """
    Returns True if:
    - Zero rule claims found
    - Analysed text is under 300 characters
    - Text matches any advice pattern
    """
    if len(rule_claims) > 0:
        return False

    if len(analysed_text) >= 300:
        return False

    text_lower = analysed_text.lower()
    for pat in ADVICE_PATTERNS:
        if pat.search(text_lower):
            return True

    return False
