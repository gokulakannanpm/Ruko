import React, { useState } from "react";
import type { Actions } from "../api/types";
import { useT } from "../i18n";
import { Button } from "./Button";
import { downloadPauseICS } from "../lib/ics";
import { copyToClipboard } from "../lib/share";

export interface PausePactProps {
  pausePactData?: Actions["pause_pact"];
}

export const PausePact: React.FC<PausePactProps> = ({ pausePactData }) => {
  const { lang, t } = useT();
  const [hoursOption, setHoursOption] = useState<"24" | "48" | "ask">("24");
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<boolean>(false);

  const checklist = pausePactData?.checklist || [];
  const doneCount = Object.values(checkedItems).filter(Boolean).length;
  const totalCount = checklist.length;

  const handleCopyNote = async () => {
    const text = t("pause.noteText");
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadICS = () => {
    const hours = hoursOption === "48" ? 48 : 24;
    const summary = t("pause.icsTitle");
    const desc = t("pause.icsDesc");
    downloadPauseICS(hours, summary, desc);
  };

  return (
    <section
      aria-labelledby="pause-title"
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--line-strong)",
        borderRadius: "4px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <div>
        <h2
          id="pause-title"
          style={{
            margin: "0 0 4px 0",
            fontSize: "1.25rem",
            fontWeight: 600,
            fontFamily: "'Source Serif 4', serif",
          }}
        >
          {t("pause.title")}
        </h2>
        <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--ink-muted)", lineHeight: 1.5 }}>
          {t("pause.note")}
        </p>
      </div>

      <fieldset style={{ border: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
        <legend style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--ink-muted)", marginBottom: "4px" }}>
          {t("pause.hours")}
        </legend>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.9375rem" }}>
          <input
            type="radio"
            name="pause-hours"
            value="24"
            checked={hoursOption === "24"}
            onChange={() => setHoursOption("24")}
            style={{ accentColor: "var(--green)" }}
          />
          {t("pause.h24")}
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.9375rem" }}>
          <input
            type="radio"
            name="pause-hours"
            value="48"
            checked={hoursOption === "48"}
            onChange={() => setHoursOption("48")}
            style={{ accentColor: "var(--green)" }}
          />
          {t("pause.h48")}
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.9375rem" }}>
          <input
            type="radio"
            name="pause-hours"
            value="ask"
            checked={hoursOption === "ask"}
            onChange={() => setHoursOption("ask")}
            style={{ accentColor: "var(--green)" }}
          />
          {t("pause.hAsk")}
        </label>
      </fieldset>

      {checklist.length > 0 && (
        <div style={{ borderTop: "1px solid var(--line)", paddingTop: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", fontWeight: 600 }}>
            <span>Verification Checklist</span>
            <span>{t("pause.count", { done: doneCount, total: totalCount })}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {checklist.map((item) => (
              <label key={item.id} style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer", fontSize: "0.875rem" }}>
                <input
                  type="checkbox"
                  checked={!!checkedItems[item.id]}
                  onChange={(e) => setCheckedItems({ ...checkedItems, [item.id]: e.target.checked })}
                  style={{ marginTop: "3px", accentColor: "var(--green)" }}
                />
                <span>{item.text[lang] || item.text.en}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", paddingTop: "8px" }}>
        {hoursOption !== "ask" && (
          <Button type="button" variant="secondary" onClick={handleDownloadICS} style={{ minHeight: "40px", fontSize: "0.875rem" }}>
            {t("pause.ics")}
          </Button>
        )}
        <Button type="button" variant="secondary" onClick={handleCopyNote} style={{ minHeight: "40px", fontSize: "0.875rem" }}>
          {copied ? t("share.copied") : t("pause.copy")}
        </Button>
      </div>
    </section>
  );
};
