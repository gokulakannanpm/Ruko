import React from "react";
import { useT } from "../i18n";

export const HowItWorks: React.FC = () => {
  const { t } = useT();

  return (
    <section
      aria-labelledby="how-title"
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: "4px",
        padding: "24px",
      }}
    >
      <h2 id="how-title" style={{ marginTop: 0, marginBottom: "16px", fontSize: "1.25rem", fontFamily: "'Source Serif 4', serif" }}>
        {t("how.title")}
      </h2>
      <ol style={{ margin: 0, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <li>{t("how.1")}</li>
        <li>{t("how.2")}</li>
        <li>{t("how.3")}</li>
      </ol>
    </section>
  );
};
