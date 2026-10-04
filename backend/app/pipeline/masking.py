import re
from app.schemas import MaskKind, MaskReportItem

def _to_base26(n: int) -> str:
    s = ""
    temp = n
    while temp >= 0:
        s = chr(97 + (temp % 26)) + s
        temp = (temp // 26) - 1
    return s

def mask_sensitive_data(input_text: str) -> tuple[str, dict[MaskKind, int]]:
    """
    Server-side idempotent masking matching the client algorithm.
    Returns (masked_text, counts_dict).
    """
    if not input_text:
        return "", {
            "otp": 0, "card": 0, "aadhaar": 0, "pan": 0, "phone": 0, "account": 0
        }

    counts: dict[MaskKind, int] = {
        "otp": 0,
        "card": 0,
        "aadhaar": 0,
        "pan": 0,
        "phone": 0,
        "account": 0,
    }

    # Step 1: Protect tokens with letter-only sentinels
    sentinels: dict[str, str] = {}
    sentinel_idx = 0

    def make_sentinel(original: str) -> str:
        nonlocal sentinel_idx
        key = f"\uE000P{_to_base26(sentinel_idx)}\uE001"
        sentinel_idx += 1
        sentinels[key] = original
        return key

    protected = input_text

    # Protect existing placeholders [hidden:...]
    protected = re.sub(r"\[hidden:[a-z]+\]", lambda m: make_sentinel(m.group(0)), protected)

    # Protect URLs
    protected = re.sub(r"https?://\S+", lambda m: make_sentinel(m.group(0)), protected, flags=re.IGNORECASE)

    # Protect SEBI registration numbers (IN[AHZPM] followed by 9 digits)
    protected = re.sub(r"\bIN[AHZPM]\d{9}\b", lambda m: make_sentinel(m.group(0)), protected, flags=re.IGNORECASE)

    # Protect tokens containing @ (email, UPI IDs)
    protected = re.sub(r"\S+@\S+", lambda m: make_sentinel(m.group(0)), protected)

    # Step 2: Apply masks in order

    # OTP mask
    otp_keywords = r"(?:otp|pin|cvv|cvc|mpin|passcode|password|code|ஓடிபி|பின்)"
    
    # Keyword before number
    otp_before_pattern = re.compile(rf"({otp_keywords}[^\d]{{0,30}})\b(\d{{3,8}})\b", re.IGNORECASE)
    def repl_otp_before(m):
        counts["otp"] += 1
        return m.group(1) + "[hidden:otp]"
    protected = otp_before_pattern.sub(repl_otp_before, protected)

    # Keyword after number
    otp_after_pattern = re.compile(rf"\b(\d{{4,8}})\b([^\d]{{0,20}}{otp_keywords})", re.IGNORECASE)
    def repl_otp_after(m):
        counts["otp"] += 1
        return "[hidden:otp]" + m.group(2)
    protected = otp_after_pattern.sub(repl_otp_after, protected)

    # Card mask: 13 to 19 digits with optional single spaces or hyphens
    account_kw_check = re.compile(r"(?:account|acc|acct|a/c|கணக்கு)[^\d]{0,20}$", re.IGNORECASE)
    card_pattern = re.compile(r"\b(?:\d[ -]?){13,19}\b")

    def repl_card(m):
        start_pos = m.start()
        prefix_str = protected[max(0, start_pos - 25):start_pos]
        if account_kw_check.search(prefix_str):
            return m.group(0)  # Skip account number
        digits_only = re.sub(r"\D", "", m.group(0))
        if 13 <= len(digits_only) <= 19:
            counts["card"] += 1
            return "[hidden:card]"
        return m.group(0)

    protected = card_pattern.sub(repl_card, protected)

    # Aadhaar mask: 12 digits as 4+4+4
    aadhaar_pattern = re.compile(r"\b\d{4}[ -]?\d{4}[ -]?\d{4}\b")
    def repl_aadhaar(m):
        digits_only = re.sub(r"\D", "", m.group(0))
        if len(digits_only) == 12:
            counts["aadhaar"] += 1
            return "[hidden:aadhaar]"
        return m.group(0)
    protected = aadhaar_pattern.sub(repl_aadhaar, protected)

    # PAN mask: [A-Za-z]{5}\d{4}[A-Za-z]
    pan_pattern = re.compile(r"\b[A-Za-z]{5}\d{4}[A-Za-z]\b")
    def repl_pan(m):
        counts["pan"] += 1
        return "[hidden:pan]"
    protected = pan_pattern.sub(repl_pan, protected)

    # Phone mask: optional +91 or 91, 10 digits starting 6 to 9
    phone_pattern = re.compile(r"(?:\+?91[ -]?)?\b[6-9]\d{4}[ -]?\d{5}\b")
    def repl_phone(m):
        counts["phone"] += 1
        return "[hidden:phone]"
    protected = phone_pattern.sub(repl_phone, protected)

    # Account mask: remaining 9 to 18 digit runs
    account_pattern = re.compile(r"\b\d{9,18}\b")
    def repl_account(m):
        counts["account"] += 1
        return "[hidden:account]"
    protected = account_pattern.sub(repl_account, protected)

    # Step 3: Restore sentinels
    final_text = protected
    for s_key, s_orig in sentinels.items():
        final_text = final_text.replace(s_key, s_orig)

    return final_text, counts
