import React from "react";
import { useT } from "../i18n";

export const SkipLink: React.FC = () => {
  const { t } = useT();

  return (
    <a
      href="#main-content"
      style={{
        position: "absolute",
        top: "-100px",
        left: "16px",
        backgroundColor: "var(--green)",
        color: "var(--paper)",
        padding: "8px 16px",
        fontWeight: 600,
        borderRadius: "4px",
        zIndex: 9999,
        textDecoration: "none",
        transition: "top 0.2s",
      }}
      onFocus={(e) => {
        e.currentTarget.style.top = "16px";
      }}
      onBlur={(e) => {
        e.currentTarget.style.top = "-100px";
      }}
    >
      {t("nav.skip")}
    </a>
  );
};
