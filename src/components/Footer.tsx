import React from "react";
import { useT } from "../i18n";
import { TextLink } from "./TextLink";

export interface FooterProps {
  onNavigatePrivacy: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigatePrivacy }) => {
  const { t } = useT();

  return (
    <footer
      role="contentinfo"
      style={{
        borderTop: "1px solid var(--line)",
        backgroundColor: "var(--surface)",
        padding: "32px 24px",
        marginTop: "56px",
        fontSize: "0.875rem",
        color: "var(--ink-muted)",
      }}
    >
      <div
        style={{
          maxWidth: "1120px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <p style={{ margin: 0, lineHeight: 1.6 }}>{t("footer.independent")}</p>
        <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
          <TextLink
            href="#/privacy"
            onClick={(e) => {
              e.preventDefault();
              onNavigatePrivacy();
            }}
          >
            {t("nav.privacy")}
          </TextLink>
          <span style={{ fontSize: "0.875rem", color: "var(--ink-muted)" }}>•</span>
          <span>{t("footer.demo")}</span>
        </div>
      </div>
    </footer>
  );
};
