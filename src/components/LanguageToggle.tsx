import React from "react";
import { useT } from "../i18n";

export const LanguageToggle: React.FC = () => {
  const { lang, setLang } = useT();

  const btnStyle = (active: boolean): React.CSSProperties => ({
    padding: "6px 12px",
    fontSize: "0.875rem",
    fontWeight: 600,
    borderRadius: "4px",
    border: "1px solid var(--line-strong)",
    backgroundColor: active ? "var(--green)" : "var(--surface)",
    color: active ? "var(--paper)" : "var(--ink)",
    cursor: "pointer",
  });

  return (
    <div style={{ display: "inline-flex", gap: "4px" }} aria-label="Language selection">
      <button
        type="button"
        aria-pressed={lang === "en"}
        style={btnStyle(lang === "en")}
        onClick={() => setLang("en")}
      >
        English
      </button>
      <button
        type="button"
        aria-pressed={lang === "ta"}
        style={btnStyle(lang === "ta")}
        onClick={() => setLang("ta")}
      >
        தமிழ்
      </button>
    </div>
  );
};
