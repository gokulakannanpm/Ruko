import React from "react";
import { useT } from "../i18n";
import { Button } from "./Button";

export interface ProcessingStatusProps {
  status: "analyzing_rules" | "rules_ready_ai_pending";
  onCancel: () => void;
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ status, onCancel }) => {
  const { t } = useT();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        marginBottom: "24px",
      }}
    >
      <div
        aria-live="polite"
        style={{
          fontSize: "1.0625rem",
          fontWeight: 600,
          color: "var(--ink)",
        }}
      >
        {status === "analyzing_rules" ? t("loading.rules") : t("loading.ai")}...
      </div>

      <div>
        <Button type="button" variant="secondary" onClick={onCancel} style={{ minHeight: "38px", padding: "0 14px" }}>
          {t("input.cancel")}
        </Button>
      </div>
    </div>
  );
};
