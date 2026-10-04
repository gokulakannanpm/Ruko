import React from "react";
import type { Severity } from "../api/types";
import { useT } from "../i18n";

export interface SeverityLabelProps {
  severity: Severity;
}

export const SeverityLabel: React.FC<SeverityLabelProps> = ({ severity }) => {
  const { t } = useT();

  const config: Record<Severity, { key: string; borderColor: string; textColor: string }> = {
    strong: { key: "sev.strong", borderColor: "var(--red-line)", textColor: "var(--red-ink)" },
    medium: { key: "sev.medium", borderColor: "var(--amber-line)", textColor: "var(--amber-ink)" },
    weak: { key: "sev.weak", borderColor: "var(--line-strong)", textColor: "var(--ink-muted)" },
    info: { key: "sev.info", borderColor: "var(--line-strong)", textColor: "var(--ink-muted)" },
  };

  const item = config[severity] || config.info;

  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        fontSize: "0.8125rem",
        fontWeight: 600,
        borderRadius: "4px",
        border: `1px solid ${item.borderColor}`,
        color: item.textColor,
        backgroundColor: "transparent",
      }}
    >
      {t(item.key)}
    </span>
  );
};
