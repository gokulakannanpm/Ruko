import re
from typing import Literal

TANGLISH_MARKERS = [
    "pannunga", "anuppunga", "illa", "illai", "innaiku", "inniku",
    "mattum", "vendam", "solla", "vanakkam", "naan", "indha",
    "venum", "irukku", "panna", "la join"
]

DetectedLang = Literal["en", "ta", "ta_latn", "mixed", "unknown"]

def detect_language(text: str) -> DetectedLang:
    if not text or not text.strip():
        return "unknown"

    # Count Tamil vs Latin characters
    tamil_chars = len(re.findall(r"[\u0B80-\u0BFF]", text))
    latin_chars = len(re.findall(r"[A-Za-z]", text))
    total_letters = tamil_chars + latin_chars

    if total_letters == 0:
        return "unknown"

    tamil_ratio = tamil_chars / total_letters
    latin_ratio = latin_chars / total_letters

    if tamil_ratio >= 0.6:
        return "ta"
    elif tamil_ratio > 0.2 and latin_ratio > 0.2:
        return "mixed"
    elif tamil_chars == 0 and latin_chars > 0:
        # Check Tanglish markers
        lower = text.lower()
        marker_hits = sum(1 for m in TANGLISH_MARKERS if m in lower)
        if marker_hits >= 2:
            return "ta_latn"
        else:
            return "en"
    else:
        return "unknown"
