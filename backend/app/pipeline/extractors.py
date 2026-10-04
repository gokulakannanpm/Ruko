import re
import urllib.parse
from typing import Any
from app.schemas import L10n
from app.pipeline.copy import get_copy_manager

REG_NUMBER_PATTERN = re.compile(r"\bIN[AHZPM]\d{9}\b", re.IGNORECASE)

REG_TRIGGERS = re.compile(
    r"(?:\bSEBI\b[^\n.]{0,20}?\b(?:registered|regd|approved|certified|authori[sz]ed|licen[sc]ed)\b|"
    r"\b(?:registered|approved)\s+(?:with|by|under)\s+SEBI\b|"
    r"\bsebi\s+registered\b|"
    r"செபி\s*(?:பதிவு|அங்கீகார))",
    re.IGNORECASE
)

REG_PRE_GUARD = re.compile(
    r"\b(?:always|only|check|verify|deal\s+with|choose|use)\b[^\n.]{0,20}$",
    re.IGNORECASE
)

PAYMENT_CONTEXT = re.compile(
    r"(?:pay|send|transfer|deposit|remit|anuppu\w*|bhej\w*|fee|amount|rs\.?|inr|₹|upi|gpay|phonepe|paytm|அனுப்ப|செலுத்த|கட்டணம்)",
    re.IGNORECASE
)

INVESTMENT_CONTEXT = re.compile(
    r"(?:invest\w*|profit\w*|returns?|advis\w+|trading|trade|stocks?|shares?|ipo|group|signals?|tips?|demat|broker\w*|sebi|market|fund|முதலீடு|லாபம்|பங்கு|ஆலோசக)",
    re.IGNORECASE
)

UPI_HANDLE_PATTERN = re.compile(
    r"(?<![\w.@-])[A-Za-z0-9][A-Za-z0-9._-]{1,49}@[A-Za-z][A-Za-z0-9]{1,30}(?![\w@-]|\.[A-Za-z])"
)

SHORTENER_HOSTS = {
    "bit.ly", "tinyurl.com", "t.co", "goo.gl", "cutt.ly",
    "rb.gy", "is.gd", "shorturl.at", "tiny.cc"
}

ALLOWED_GOV_HOSTS = {
    "sebi.gov.in", "nseindia.com", "bseindia.com",
    "npci.org.in", "cybercrime.gov.in", "sancharsaathi.gov.in"
}

LOOKALIKE_KEYWORDS = ["sebi", "nseindia", "bseindia", "npci", "cybercrime", "sanchar"]

URL_PATTERN = re.compile(
    r"(?<!@)\b(?:https?://[^\s<>'\"\)\]]+|www\.[^\s<>'\"\)\]]+|[a-z0-9-]+\.(?:com|in|co\.in|net|org|io|xyz|top|club|online|site|app|info|me|ly|link|click|live|vip|example)[^\s<>'\"\)\]]*)"
    , re.IGNORECASE
)

def extract_registration_claims(text: str) -> list[dict[str, Any]]:
    claims = []
    reg_numbers = list(REG_NUMBER_PATTERN.finditer(text))
    triggers = list(REG_TRIGGERS.finditer(text))

    valid_triggers = []
    for trg in triggers:
        pre_text = text[max(0, trg.start() - 20):trg.start()]
        if not REG_PRE_GUARD.search(pre_text):
            valid_triggers.append(trg)

    if not valid_triggers and not reg_numbers:
        return []

    if valid_triggers:
        for trg in valid_triggers:
            nearby_num = None
            for num in reg_numbers:
                if abs(num.start() - trg.start()) <= 60:
                    nearby_num = num
                    break

            if nearby_num:
                start = min(trg.start(), nearby_num.start())
                end = max(trg.end(), nearby_num.end())
                quote = text[start:end]
                detail = L10n(
                    en="The number has the shape of a SEBI registration number. Ruko only checks the shape, not whether it exists.",
                    ta="இந்த எண் செபி பதிவு எண்ணின் வடிவில் உள்ளது. ருகோ வடிவத்தை மட்டுமே பார்க்கிறது; அது உள்ளதா என்பதை அல்ல."
                )
            else:
                start, end = trg.span()
                quote = text[start:end]
                detail = L10n(
                    en="No standard registration number was found next to this claim.",
                    ta="இந்தக் கூற்றுடன் நிலையான பதிவு எண் எதுவும் காணப்படவில்லை."
                )

            claims.append({
                "indicator_id": "registration_claim",
                "quote": quote,
                "start": start,
                "end": end,
                "extra_spans": [],
                "severity": "medium",
                "origin": "rule",
                "detail": detail
            })
            break

    elif reg_numbers:
        num = reg_numbers[0]
        start, end = num.span()
        claims.append({
            "indicator_id": "registration_claim",
            "quote": text[start:end],
            "start": start,
            "end": end,
            "extra_spans": [],
            "severity": "medium",
            "origin": "rule",
            "detail": L10n(
                en="The number has the shape of a SEBI registration number. Ruko only checks the shape, not whether it exists.",
                ta="இந்த எண் செபி பதிவு எண்ணின் வடிவில் உள்ளது. ருகோ வடிவத்தை மட்டுமே பார்க்கிறது; அது உள்ளதா என்பதை அல்ல."
            )
        })

    return claims

def extract_payee_handle_claims(text: str) -> list[dict[str, Any]]:
    if not PAYMENT_CONTEXT.search(text) or not INVESTMENT_CONTEXT.search(text):
        return []

    handles = list(UPI_HANDLE_PATTERN.finditer(text))
    if not handles:
        return []

    claims = []
    seen = set()

    for h in handles:
        quote = h.group(0)
        if quote in seen:
            continue
        seen.add(quote)

        domain = quote.split("@")[1].lower()
        if domain.startswith("valid"):
            indicator_id = "payee_handle_valid_format"
            severity = "info"
            verifiable_by = "format_check_only"
        else:
            indicator_id = "payee_handle"
            severity = "strong"
            verifiable_by = "official_source_by_user"

        claims.append({
            "indicator_id": indicator_id,
            "quote": quote,
            "start": h.start(),
            "end": h.end(),
            "extra_spans": [],
            "severity": severity,
            "origin": "rule",
            "verifiable_by": verifiable_by,
        })

        if len(claims) >= 3:
            break

    return claims

def is_subdomain_or_equal(host: str, parent: str) -> bool:
    host = host.lower()
    parent = parent.lower()
    return host == parent or host.endswith("." + parent)

def extract_risky_link_claims(text: str) -> list[dict[str, Any]]:
    copy_mgr = get_copy_manager()
    matches = list(URL_PATTERN.finditer(text))
    if not matches:
        return []

    claims = []
    seen = set()

    for m in matches:
        raw_url = m.group(0).rstrip(".,;:!?)")
        if raw_url in seen:
            continue
        seen.add(raw_url)

        full_url = raw_url if re.match(r"^https?://", raw_url, re.IGNORECASE) else f"http://{raw_url}"

        try:
            parsed = urllib.parse.urlsplit(full_url)
        except Exception:
            continue

        host = parsed.netloc.split(":")[0].lower()
        path = parsed.path.lower()

        flags = []

        if path.endswith(".apk"):
            flags.append(("apk", "strong"))

        if re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$", host):
            flags.append(("ip_literal", "strong"))

        is_allowed = any(is_subdomain_or_equal(host, allowed) for allowed in ALLOWED_GOV_HOSTS)
        if not is_allowed:
            for kw in LOOKALIKE_KEYWORDS:
                if kw in host:
                    flags.append(("lookalike", "strong"))
                    break

        if host in SHORTENER_HOSTS:
            flags.append(("shortener", "medium"))

        if "xn--" in host:
            flags.append(("punycode", "medium"))

        if raw_url.lower().startswith("http://"):
            flags.append(("http_only", "info"))

        if not flags:
            continue

        sev_rank = {"strong": 3, "medium": 2, "info": 1}
        highest_flag, highest_sev = max(flags, key=lambda f: sev_rank[f[1]])

        detail_l10n = copy_mgr.get_link_detail(highest_flag)

        claims.append({
            "indicator_id": "risky_link",
            "quote": raw_url,
            "start": m.start(),
            "end": m.start() + len(raw_url),
            "extra_spans": [],
            "severity": highest_sev,
            "origin": "rule",
            "detail": detail_l10n
        })

        if len(claims) >= 3:
            break

    return claims

def run_extractors(text: str) -> list[dict[str, Any]]:
    claims = []
    claims.extend(extract_registration_claims(text))
    claims.extend(extract_payee_handle_claims(text))
    claims.extend(extract_risky_link_claims(text))
    return claims
