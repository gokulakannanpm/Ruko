import React from "react";
import { useT } from "../i18n";
import { LanguageToggle } from "./LanguageToggle";
import { TextLink } from "./TextLink";

export interface AppHeaderProps {
  onNavigatePrivacy: () => void;
  onNavigateHome: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onNavigatePrivacy, onNavigateHome }) => {
  const { lang, t } = useT();

  return (
    <header
      role="banner"
      style={{
        borderBottom: "1px solid var(--line)",
        backgroundColor: "var(--surface)",
        padding: "16px 24px",
      }}
    >
      <div
        style={{
          maxWidth: "1120px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
          <a
            href="#/"
            onClick={(e) => {
              e.preventDefault();
              onNavigateHome();
            }}
            style={{
              fontSize: "1.75rem",
              fontWeight: 600,
              fontFamily: "'Source Serif 4', serif",
              color: "var(--ink)",
              textDecoration: "none",
            }}
          >
            Ruko
            {lang === "ta" && <span style={{ marginLeft: "6px", fontSize: "1.5rem" }}>ருகோ</span>}
          </a>
        </div>

        <nav aria-label="Main navigation" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <TextLink
            href="#/privacy"
            onClick={(e) => {
              e.preventDefault();
              onNavigatePrivacy();
            }}
          >
            {t("nav.privacy")}
          </TextLink>
          <LanguageToggle />
        </nav>
      </div>
    </header>
  );
};
