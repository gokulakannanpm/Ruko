import React from "react";
import type { AnalyzeResponse } from "../api/types";
import { useT } from "../i18n";

export interface ProcessingNoteProps {
  response: AnalyzeResponse;
}

export const ProcessingNote: React.FC<ProcessingNoteProps> = ({ response }) => {
  const { t } = useT();
  const { masking, text_source } = response;

  const hiddenTotal = masking?.applied?.reduce((acc, curr) => acc + curr.count, 0) || 0;
  const usedAi = masking?.text_sent_to_ai || masking?.image_sent_to_ai;
  const usedImage = text_source === "image_transcription" || text_source === "both" || masking?.image_sent_to_ai;

  return (
    <section
      aria-label="Processing disclosure note"
      style={{
        backgroundColor: "var(--sunken)",
        border: "1px solid var(--line)",
        borderRadius: "4px",
        padding: "16px",
        fontSize: "0.875rem",
        color: "var(--ink-muted)",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
      }}
    >
      <div style={{ fontWeight: 600, color: "var(--ink)" }}>{t("note.processing.title")}</div>

      {hiddenTotal > 0 && <div>{t("note.processing.hidden", { n: hiddenTotal })}</div>}

      <div>
        {usedAi ? t("note.processing.ai") : t("note.processing.rulesOnly")}
      </div>

      {usedImage && <div>{t("note.processing.image")}</div>}

      <div>{t("note.processing.saved")}</div>
    </section>
  );
};
