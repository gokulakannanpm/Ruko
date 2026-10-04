import logging
import json
import sys
from app.config import get_settings

class JSONFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        log_data = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        # Include permitted extra metadata fields if present
        permitted_extras = [
            "request_id", "mode", "input_kind", "tier", "indicator_ids",
            "ai_status", "latency_ms", "ui_language", "text_len_bucket"
        ]
        for key in permitted_extras:
            if hasattr(record, key):
                log_data[key] = getattr(record, key)

        return json.dumps(log_data)

def setup_logging():
    settings = get_settings()
    logger = logging.getLogger()
    logger.setLevel(getattr(logging, settings.log_level.upper(), logging.INFO))

    # Remove existing handlers
    for handler in list(logger.handlers):
        logger.removeHandler(handler)

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JSONFormatter())
    logger.addHandler(handler)
