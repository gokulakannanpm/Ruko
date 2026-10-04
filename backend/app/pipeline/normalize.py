import unicodedata
import re
from app.config import get_settings

def utf16_index(text: str, char_idx: int) -> int:
    """Returns the UTF-16 code unit index for Python string index char_idx."""
    if char_idx <= 0:
        return 0
    sub = text[:char_idx]
    return len(sub.encode("utf-16-le")) // 2

def normalize_text(raw_text: str, max_chars: int | None = None) -> tuple[str, bool]:
    """
    Normalizes input text:
    - Unicode NFC
    - \\r\\n and \\r to \\n
    - Remove zero-width characters \\u200b, \\u2060, \\ufeff (keep \\u200c and \\u200d)
    - Collapse 3 or more newlines to 2
    - Strip ends
    - Truncate to max_chars (or MAX_TEXT_CHARS settings) if necessary
    Returns (normalized_text, was_truncated)
    """
    if not raw_text:
        return "", False

    settings = get_settings()
    limit = max_chars if max_chars is not None else settings.max_text_chars

    # Unicode NFC
    text = unicodedata.normalize("NFC", raw_text)

    # Convert line endings
    text = text.replace("\r\n", "\n").replace("\r", "\n")

    # Remove unwanted zero-width characters
    for ch in ("\u200b", "\u2060", "\ufeff"):
        text = text.replace(ch, "")

    # Collapse 3+ newlines to 2
    text = re.sub(r"\n{3,}", "\n\n", text)

    # Strip ends
    text = text.strip()

    # Truncation check
    was_truncated = False
    if len(text) > limit:
        text = text[:limit]
        was_truncated = True

    return text, was_truncated
