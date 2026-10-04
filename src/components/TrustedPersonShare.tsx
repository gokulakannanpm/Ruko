import React, { useState, useEffect } from "react";
import type { L10n } from "../api/types";
import { useT } from "../i18n";
import { Button } from "./Button";
import { getWhatsAppShareUrl, copyToClipboard, canNativeShare, shareNative } from "../lib/share";

export interface TrustedPersonShareProps {
  initialMessage?: L10n;
}

export const TrustedPersonShare: React.FC<TrustedPersonShareProps> = ({ initialMessage }) => {
  const { lang, t } = useT();
  const defaultText =
    initialMessage?.[lang] ||
    initialMessage?.en ||
    "I received an investment message that showed risk indicators on Ruko. I am pausing before moving any money. Could you look at it with me?";

  const [shareText, setShareText] = useState<string>(defaultText);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (initialMessage) {
      setShareText(initialMessage[lang] || initialMessage.en);
    }
  }, [initialMessage, lang]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(shareText);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    await shareNative(shareText);
  };

  return (
    <section
      aria-labelledby="share-title"
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--line-strong)",
        borderRadius: "4px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      }}
    >
      <div>
        <h2
          id="share-title"
          style={{
            margin: "0 0 4px 0",
            fontSize: "1.25rem",
            fontWeight: 600,
            fontFamily: "'Source Serif 4', serif",
          }}
        >
          {t("share.title")}
        </h2>
        <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--ink-muted)" }}>
          {t("share.note")}
        </p>
      </div>

      <textarea
        value={shareText}
        onChange={(e) => setShareText(e.target.value)}
        rows={3}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "4px",
          border: "1px solid var(--line-strong)",
          backgroundColor: "var(--paper)",
          color: "var(--ink)",
          fontSize: "0.9375rem",
          lineHeight: 1.5,
          resize: "vertical",
          boxSizing: "border-box",
        }}
      />

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <a
          href={getWhatsAppShareUrl(shareText)}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 16px",
            minHeight: "40px",
            fontSize: "0.875rem",
            fontWeight: 600,
            borderRadius: "4px",
            backgroundColor: "var(--green)",
            color: "var(--paper)",
            textDecoration: "none",
          }}
        >
          {t("share.whatsapp")}
        </a>

        <Button type="button" variant="secondary" onClick={handleCopy} style={{ minHeight: "40px", fontSize: "0.875rem" }}>
          {copied ? t("share.copied") : t("share.copy")}
        </Button>

        {canNativeShare() && (
          <Button type="button" variant="secondary" onClick={handleNativeShare} style={{ minHeight: "40px", fontSize: "0.875rem" }}>
            {t("share.native")}
          </Button>
        )}
      </div>
    </section>
  );
};
