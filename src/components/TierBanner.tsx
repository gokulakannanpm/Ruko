import React from "react";
import type { AnalyzeResponse } from "../api/types";
import { useT } from "../i18n";
import { ReadAloudButton } from "./ReadAloudButton";

export interface TierBannerProps {
  response: AnalyzeResponse;
}

export const TierBanner: React.FC<TierBannerProps> = ({ response }) => {
  const { lang, t } = useT();
  const { tier, ai_notice, summary } = response;

  if (!tier) return null;

  const level = tier.level;

  let bg = "var(--surface)";
  let border = "var(--line-strong)";
  let textColor = "var(--ink)";

  if (level === "several_indicators") {
    bg = "var(--red-bg)";
    border = "var(--red-line)";
  } else if (level === "some_indicators") {
    bg = "var(--amber-bg)";
    border = "var(--amber-line)";
  }

  const headline = tier.label[lang] || tier.label.en;
  const summaryText = summary?.text[lang] || summary?.text.en || "";
  const combinedSpeechText = `${headline}. ${summaryText}`;

  return (
    <section
      aria-label="Risk indicators summary banner"
      style={{
        backgroundColor: bg,
        border: `1px solid ${border}`,
        borderRadius: "4px",
        padding: "24px",
        color: textColor,
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <h2
        style={{
          margin: 0,
          fontSize: "1.75rem",
          fontWeight: 600,
          fontFamily: "'Source Serif 4', serif",
          lineHeight: 1.25,
        }}
      >
        {headline}
      </h2>

      <p style={{ margin: 0, fontSize: "0.9375rem", color: "var(--ink-muted)", lineHeight: 1.5 }}>
        {t("tier.note")}
      </p>

      {ai_notice && ai_notice.extra_claim_count > 0 && (
        <p style={{ margin: 0, fontSize: "0.9375rem", fontWeight: 600 }}>
          {t("tier.ai", { n: ai_notice.extra_claim_count })}
        </p>
      )}

      {summaryText && (
        <p style={{ margin: 0, fontSize: "1.0625rem", lineHeight: 1.6 }}>{summaryText}</p>
      )}

      <div style={{ marginTop: "4px" }}>
        <ReadAloudButton textToSpeak={combinedSpeechText} />
      </div>
    </section>
  );
};
