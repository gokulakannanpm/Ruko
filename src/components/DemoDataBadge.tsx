import React from "react";
import { useT } from "../i18n";

export const DemoDataBadge: React.FC = () => {
  const { t } = useT();

  return (
    <div
      style={{
        display: "inline-block",
        padding: "4px 10px",
        backgroundColor: "var(--sunken)",
        border: "1px solid var(--line-strong)",
        borderRadius: "4px",
        fontSize: "0.8125rem",
        fontWeight: 600,
        color: "var(--ink-muted)",
        marginBottom: "16px",
      }}
    >
      {t("demo.badge")}
    </div>
  );
};
