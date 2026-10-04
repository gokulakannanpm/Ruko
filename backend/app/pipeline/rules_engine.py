import json
import os
import re
from typing import Any

ENG_NEGATION_BEFORE = re.compile(
    r"(?:\b(?:no|not|never|without|cannot|can't|cant|don't|dont|nor)\b|n't)",
    re.IGNORECASE
)
AFTER_NEGATION_TERMS = re.compile(
    r"(?:\b(?:illa|illai|nahi|nahin|not)\b|இல்லை)",
    re.IGNORECASE
)
CLAUSE_STOPS = re.compile(r"[.,;!?\n]")

def is_negated(text: str, start: int, end: int) -> bool:
    """Checks negation window 25 chars before, or 14 chars clause-stop after."""
    # Check 25 chars before
    pre_window = text[max(0, start - 25):start]
    if ENG_NEGATION_BEFORE.search(pre_window):
        return True

    # Check after match (max 14 chars, stop at clause punctuation)
    post_window = text[end:end + 14]
    stop_match = CLAUSE_STOPS.search(post_window)
    if stop_match:
        post_window = post_window[:stop_match.start()]
        
    if AFTER_NEGATION_TERMS.search(post_window):
        return True

    return False

class PatternMatch:
    def __init__(self, start: int, end: int, quote: str):
        self.start = start
        self.end = end
        self.quote = quote

def merge_close_matches(matches: list[PatternMatch], text: str) -> list[PatternMatch]:
    if not matches:
        return []

    sorted_m = sorted(matches, key=lambda m: m.start)
    merged: list[PatternMatch] = []
    curr = sorted_m[0]

    for next_m in sorted_m[1:]:
        # If overlapping or gap <= 2 chars
        if next_m.start <= curr.end + 2:
            new_end = max(curr.end, next_m.end)
            curr = PatternMatch(curr.start, new_end, text[curr.start:new_end])
        else:
            merged.append(curr)
            curr = next_m

    merged.append(curr)
    return merged

class RulesEngine:
    def __init__(self):
        rules_path = os.path.join(os.path.dirname(__file__), "..", "data", "rules.json")
        with open(rules_path, "r", encoding="utf-8") as f:
            self._rules: list[dict[str, Any]] = json.load(f)

    def run(self, text: str) -> list[dict[str, Any]]:
        """
        Runs pattern rules against normalized text.
        Returns a list of raw match dicts.
        """
        raw_matches = []

        for rule in self._rules:
            indicator_id = rule["indicator_id"]
            severity = rule["severity"]
            max_matches = rule.get("max_matches", 3)

            matched_spans: list[PatternMatch] = []

            for pat in rule["patterns"]:
                pattern_re = re.compile(pat["re"], re.IGNORECASE | re.UNICODE)
                negatable = pat.get("negatable", False)

                for m in pattern_re.finditer(text):
                    m_start, m_end = m.span()
                    if negatable and is_negated(text, m_start, m_end):
                        continue
                    matched_spans.append(PatternMatch(m_start, m_end, text[m_start:m_end]))

            if not matched_spans:
                continue

            # Merge close matches (gap <= 2 chars)
            merged = merge_close_matches(matched_spans, text)
            if not merged:
                continue

            primary = merged[0]
            extra = merged[1:max_matches]

            raw_matches.append({
                "indicator_id": indicator_id,
                "severity": severity,
                "start": primary.start,
                "end": primary.end,
                "quote": primary.quote,
                "extra_spans": [(m.start, m.end) for m in extra],
            })

        return raw_matches

_engine = RulesEngine()

def run_pattern_rules(text: str) -> list[dict[str, Any]]:
    return _engine.run(text)
