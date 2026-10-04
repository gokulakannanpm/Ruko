import React from "react";
import type { L10n } from "../api/types";
import { useT } from "../i18n";
import { Button } from "./Button";

export interface AdviceRefusalProps {
  refusalText?: L10n | null;
  onReset: () => void;
}

export const AdviceRefusal: React.FC<AdviceRefusalProps> = ({ refusalText, onReset }) => {
  const { lang, t } = useT();

  const text =
    refusalText?.[lang] ||
    refusalText?.en ||
    "Ruko does not provide stock recommendations, investment advice, or buy/sell/hold suggestions. Please consult a SEBI-registered investment adviser.";

  return (
    <section
      aria-labelledby="refusal-title"
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--line-strong)",
        borderRadius: "4px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <h2
        id="refusal-title"
        style={{
          margin: 0,
          fontSize: "1.25rem",
          fontWeight: 600,
          fontFamily: "'Source Serif 4', serif",
        }}
      >
        Investment Advice Not Provided
      </h2>

      <p style={{ margin: 0, fontSize: "1.0625rem", lineHeight: 1.6 }}>{text}</p>

      <div>
        <Button type="button" variant="secondary" onClick={onReset}>
          {t("result.again")}
        </Button>
      </div>
    </section>
  );
};
