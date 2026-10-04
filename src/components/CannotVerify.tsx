import React from "react";
import type { L10n } from "../api/types";
import { useT } from "../i18n";

export interface CannotVerifyProps {
  items: { id: string; text: L10n }[];
}

export const CannotVerify: React.FC<CannotVerifyProps> = ({ items }) => {
  const { lang, t } = useT();

  if (!items || items.length === 0) return null;

  return (
    <section
      aria-labelledby="cannot-title"
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--line-strong)",
        borderRadius: "4px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <h2
        id="cannot-title"
        style={{
          margin: 0,
          fontSize: "1.25rem",
          fontWeight: 600,
          fontFamily: "'Source Serif 4', serif",
        }}
      >
        {t("cannot.title")}
      </h2>

      <ul style={{ margin: 0, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {items.map((item) => (
          <li key={item.id} style={{ fontSize: "0.9375rem", lineHeight: 1.5 }}>
            {item.text[lang] || item.text.en}
          </li>
        ))}
      </ul>
    </section>
  );
};
