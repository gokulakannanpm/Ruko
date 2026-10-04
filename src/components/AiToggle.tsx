import React from "react";
import { useT } from "../i18n";

export interface AiToggleProps {
  allowAi: boolean;
  onToggleAi: (val: boolean) => void;
  disabled: boolean;
  forcedReason?: string | null;
}

export const AiToggle: React.FC<AiToggleProps> = ({
  allowAi,
  onToggleAi,
  disabled,
  forcedReason,
}) => {
  const { t } = useT();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <label
        htmlFor="ai-checkbox-toggle"
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "10px",
          cursor: disabled ? "not-allowed" : "pointer",
          fontWeight: 600,
        }}
      >
        <input
          id="ai-checkbox-toggle"
          type="checkbox"
          checked={allowAi}
          disabled={disabled}
          onChange={(e) => onToggleAi(e.target.checked)}
          style={{
            marginTop: "4px",
            width: "18px",
            height: "18px",
            accentColor: "var(--green)",
          }}
        />
        <span>{t("input.ai.label")}</span>
      </label>

      <p style={{ margin: 0, paddingLeft: "28px", fontSize: "0.875rem", color: "var(--ink-muted)" }}>
        {forcedReason || t("input.ai.help")}
      </p>
    </div>
  );
};
