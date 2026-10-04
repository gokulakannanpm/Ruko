import React from "react";
import type { Claim, Route } from "../api/types";
import { useT } from "../i18n";
import { SeverityLabel } from "./SeverityLabel";
import { getScriptLang } from "../lib/lang";
import { isSafeUrl } from "../lib/safeUrl";

export interface ClaimRowProps {
  claim: Claim;
  displayIndex: number;
  routes: Route[];
  isUnlocated: boolean;
}

export const ClaimRow: React.FC<ClaimRowProps> = ({ claim, displayIndex, routes, isUnlocated }) => {
  const { lang, t } = useT();

  let borderColor = "var(--line)";
  if (claim.severity === "strong") borderColor = "var(--red-line)";
  else if (claim.severity === "medium") borderColor = "var(--amber-line)";

  const quoteLang = getScriptLang(claim.quote);

  const matchedRoutes = routes.filter((r) => claim.verify_through.route_ids.includes(r.id));

  const scrollToMark = () => {
    const markEl = document.getElementById(`mark-span-${claim.span.start}`);
    const container = document.getElementById("marked-message-container");
    if (markEl) {
      markEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
      markEl.focus();
    } else if (container) {
      container.scrollIntoView({ block: "nearest", behavior: "smooth" });
      container.focus();
    }
  };

  return (
    <article
      id={`claim-row-${displayIndex}`}
      tabIndex={-1}
      style={{
        backgroundColor: "var(--surface)",
        border: `1px solid ${borderColor}`,
        borderRadius: "4px",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        outline: "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        <span style={{ fontWeight: 600, fontSize: "1.125rem", minWidth: "24px" }}>
          {displayIndex}.
        </span>
        <SeverityLabel severity={claim.severity} />
        <span style={{ fontWeight: 600, fontSize: "1.0625rem" }}>
          {claim.indicator.label[lang] || claim.indicator.label.en}
        </span>
      </div>

      <dl style={{ margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
        <div>
          <dt style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--ink-muted)", marginBottom: "4px" }}>
            {t("ledger.claim")}
          </dt>
          <dd style={{ margin: 0 }}>
            <div
              lang={quoteLang}
              style={{
                backgroundColor: "var(--sunken)",
                border: "1px solid var(--line)",
                borderRadius: "4px",
                padding: "10px 14px",
                fontFamily: "'Source Serif 4', serif",
                fontSize: "1.125rem",
                fontStyle: "normal",
                lineHeight: quoteLang === "ta" ? 1.75 : 1.6,
              }}
            >
              {claim.quote}
            </div>
            {isUnlocated && (
              <p style={{ margin: "4px 0 0 0", fontSize: "0.875rem", color: "var(--amber-ink)" }}>
                {t("message.notLocated")}
              </p>
            )}
          </dd>
        </div>

        <div>
          <dt style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--ink-muted)", marginBottom: "2px" }}>
            {t("ledger.indicator")}
          </dt>
          <dd style={{ margin: 0, fontSize: "1rem" }}>
            <span>{claim.indicator.label[lang] || claim.indicator.label.en}</span>
            {claim.detail && (
              <p style={{ margin: "4px 0 0 0", fontSize: "0.9375rem", color: "var(--ink-muted)" }}>
                {claim.detail[lang] || claim.detail.en}
              </p>
            )}
          </dd>
        </div>

        <div>
          <dt style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--ink-muted)", marginBottom: "2px" }}>
            {t("ledger.why")}
          </dt>
          <dd style={{ margin: 0, fontSize: "1rem", lineHeight: 1.5 }}>
            {claim.why_it_matters[lang] || claim.why_it_matters.en}
          </dd>
        </div>

        <div>
          <dt style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--ink-muted)", marginBottom: "4px" }}>
            {t("ledger.verify")}
          </dt>
          <dd style={{ margin: 0, fontSize: "1rem" }}>
            <p style={{ margin: "0 0 8px 0" }}>
              {claim.verify_through.text[lang] || claim.verify_through.text.en}
            </p>
            {matchedRoutes.length > 0 && (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {matchedRoutes.map((route) => {
                  const safe = isSafeUrl(route.url);
                  const routeLabel = route.label[lang] || route.label.en;
                  if (safe && route.url) {
                    return (
                      <a
                        key={route.id}
                        href={route.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          color: "var(--green)",
                          textDecoration: "underline",
                          textUnderlineOffset: "3px",
                        }}
                      >
                        {routeLabel} (opens in new tab)
                      </a>
                    );
                  }
                  return (
                    <span key={route.id} style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                      {routeLabel}
                    </span>
                  );
                })}
              </div>
            )}
          </dd>
        </div>

        <div>
          <dt style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--ink-muted)", marginBottom: "2px" }}>
            {t("ledger.limit")}
          </dt>
          <dd style={{ margin: 0, fontSize: "0.9375rem", color: "var(--ink-muted)", lineHeight: 1.5 }}>
            {claim.limit[lang] || claim.limit.en}
          </dd>
        </div>
      </dl>

      <div style={{ marginTop: "4px", borderTop: "1px solid var(--line)", paddingTop: "8px" }}>
        <button
          type="button"
          onClick={scrollToMark}
          style={{
            background: "none",
            border: "none",
            color: "var(--green)",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: "pointer",
            padding: 0,
            textDecoration: "underline",
          }}
        >
          {t("ledger.showInMessage")}
        </button>
      </div>
    </article>
  );
};
