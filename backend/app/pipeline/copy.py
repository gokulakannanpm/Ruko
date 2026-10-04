import json
import os
from typing import Any
from app.schemas import L10n

class CopyManager:
    def __init__(self):
        base_dir = os.path.dirname(__file__)
        copy_path = os.path.join(base_dir, "..", "data", "copy.json")
        routes_path = os.path.join(base_dir, "..", "data", "routes.json")

        with open(copy_path, "r", encoding="utf-8") as f:
            self._copy: dict[str, Any] = json.load(f)

        with open(routes_path, "r", encoding="utf-8") as f:
            routes_list: list[dict[str, Any]] = json.load(f)
            self._routes: dict[str, dict[str, Any]] = {r["id"]: r for r in routes_list}

    def get_rule_copy(self, indicator_id: str) -> dict[str, Any]:
        return self._copy["indicators"].get(indicator_id, {
            "label": {"en": "Indicator", "ta": "அறிகுறி"},
            "why_it_matters": {"en": "Requires verification.", "ta": "சரிபார்க்கப்பட வேண்டும்."},
            "verify_through": {"text": {"en": "Official route", "ta": "அதிகாரப்பூர்வ வழி"}, "route_ids": ["sebi_check"]},
            "limit": {"en": "Verification limit", "ta": "சரிபார்ப்பு எல்லை"},
            "verifiable_by": "official_source_by_user",
            "source_basis": "general_awareness"
        })

    def get_link_detail(self, flag: str) -> L10n:
        raw = self._copy["link_details"].get(flag, {
            "en": "The link needs care.",
            "ta": "இணைப்பிற்கு கவனம் தேவை."
        })
        return L10n(en=raw["en"], ta=raw["ta"])

    def get_route(self, route_id: str) -> dict[str, Any] | None:
        return self._routes.get(route_id)

_copy_mgr = CopyManager()

def get_copy_manager() -> CopyManager:
    return _copy_mgr
