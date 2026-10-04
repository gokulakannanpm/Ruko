import React from "react";
import type { Claim, Route } from "../api/types";
import { useT } from "../i18n";
import { ClaimRow } from "./ClaimRow";

export interface ClaimLedgerProps {
  claims: Claim[];
  routes: Route[];
  unlocatedClaimIds: Set<string>;
}

export const ClaimLedger: React.FC<ClaimLedgerProps> = ({ claims, routes, unlocatedClaimIds }) => {
  const { t } = useT();

  const ruleClaims = claims.filter((c) => c.origin === "rule");
  const aiClaims = claims.filter((c) => c.origin === "ai");

  let globalIndex = 1;

  return (
    <section aria-labelledby="ledger-title" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div>
        <h2
          id="ledger-title"
          style={{
            margin: "0 0 6px 0",
            fontSize: "1.5rem",
            fontWeight: 600,
            fontFamily: "'Source Serif 4', serif",
          }}
        >
          {claims.length > 0 ? t("ledger.title") : t("ledger.notes")}
        </h2>
        <p style={{ margin: 0, fontSize: "0.9375rem", color: "var(--ink-muted)" }}>
          {t("ledger.intro")}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {ruleClaims.map((claim) => {
          const idx = globalIndex++;
          return (
            <ClaimRow
              key={claim.id}
              claim={claim}
              displayIndex={idx}
              routes={routes}
              isUnlocated={unlocatedClaimIds.has(claim.id)}
            />
          );
        })}
      </div>

      {aiClaims.length > 0 && (
        <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h3
              style={{
                margin: 0,
                fontSize: "1.125rem",
                fontWeight: 600,
                fontFamily: "'Source Serif 4', serif",
              }}
            >
              {t("ledger.ai.title")}
            </h3>
            <span
              style={{
                fontSize: "0.8125rem",
                fontWeight: 600,
                padding: "2px 6px",
                borderRadius: "4px",
                backgroundColor: "var(--sunken)",
                border: "1px dashed var(--line-strong)",
              }}
            >
              {t("ledger.ai.tag")}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {aiClaims.map((claim) => {
              const idx = globalIndex++;
              return (
                <div key={claim.id} style={{ borderStyle: "dashed" }}>
                  <ClaimRow
                    claim={claim}
                    displayIndex={idx}
                    routes={routes}
                    isUnlocated={unlocatedClaimIds.has(claim.id)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
