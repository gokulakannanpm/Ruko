import React, { useState, useEffect } from "react";
import type { Actions } from "../api/types";
import { useT } from "../i18n";
import { isSafeUrl } from "../lib/safeUrl";

export interface AlreadyPaidProps {
  paidData?: Actions["already_paid"];
  forceOpen?: boolean;
}

export const AlreadyPaid: React.FC<AlreadyPaidProps> = ({ paidData, forceOpen = false }) => {
  const { lang, t } = useT();
  const [isOpen, setIsOpen] = useState<boolean>(forceOpen);

  useEffect(() => {
    if (forceOpen) setIsOpen(true);
  }, [forceOpen]);

  const steps = paidData?.steps || [
    { id: "1", text: { en: t("paid.steps.1"), ta: t("paid.steps.1") }, tel: "1930", url: null },
    { id: "2", text: { en: t("paid.steps.2"), ta: t("paid.steps.2") }, tel: null, url: null },
    { id: "3", text: { en: t("paid.steps.3"), ta: t("paid.steps.3") }, tel: null, url: "https://cybercrime.gov.in/" },
    { id: "4", text: { en: t("paid.steps.4"), ta: t("paid.steps.4") }, tel: null, url: null },
    { id: "5", text: { en: t("paid.steps.5"), ta: t("paid.steps.5") }, tel: null, url: null },
  ];

  return (
    <section
      id="already-paid-section"
      aria-label="Recovery steps if money was sent"
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--line-strong)",
        borderRadius: "4px",
        padding: "16px",
      }}
    >
      <details
        open={isOpen}
        onToggle={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}
      >
        <summary
          style={{
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "1.125rem",
            color: "var(--red-ink)",
            outline: "none",
          }}
        >
          {t("paid.title")}
        </summary>

        <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <p style={{ margin: 0, fontSize: "0.9375rem", color: "var(--ink-muted)", lineHeight: 1.5 }}>
            {t("paid.note")}
          </p>

          <ol style={{ margin: 0, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {steps.map((step) => {
              const text = step.text[lang] || step.text.en;
              const safeUrl = isSafeUrl(step.url);
              const safeTel = isSafeUrl(step.tel ? `tel:${step.tel}` : null);

              return (
                <li key={step.id} style={{ fontSize: "0.9375rem", lineHeight: 1.5 }}>
                  <span>{text}</span>
                  {(safeTel || safeUrl) && (
                    <div style={{ marginTop: "6px" }}>
                      {safeTel && step.tel && (
                        <a
                          href={`tel:${step.tel}`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "4px 10px",
                            fontSize: "0.8125rem",
                            fontWeight: 600,
                            backgroundColor: "var(--green)",
                            color: "var(--paper)",
                            borderRadius: "4px",
                            textDecoration: "none",
                            marginRight: "8px",
                          }}
                        >
                          {t("paid.call")}
                        </a>
                      )}
                      {safeUrl && step.url && (
                        <a
                          href={step.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "4px 10px",
                            fontSize: "0.8125rem",
                            fontWeight: 600,
                            backgroundColor: "var(--green)",
                            color: "var(--paper)",
                            borderRadius: "4px",
                            textDecoration: "none",
                          }}
                        >
                          {t("routes.open")}
                        </a>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </details>
    </section>
  );
};
