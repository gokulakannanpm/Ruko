import React, { useState } from "react";
import type { AnalyzeResponse, MaskReportItem } from "../api/types";
import { useT } from "../i18n";
import { DemoDataBadge } from "./DemoDataBadge";
import { TierBanner } from "./TierBanner";
import { MarkedMessage } from "./MarkedMessage";
import { ClaimLedger } from "./ClaimLedger";
import { CannotVerify } from "./CannotVerify";
import { OfficialRoutes } from "./OfficialRoutes";
import { PausePact } from "./PausePact";
import { TrustedPersonShare } from "./TrustedPersonShare";
import { AlreadyPaid } from "./AlreadyPaid";
import { ProcessingNote } from "./ProcessingNote";
import { AdviceRefusal } from "./AdviceRefusal";
import { Button } from "./Button";
import { TextLink } from "./TextLink";
import { buildHighlightSegments } from "../lib/highlight";

export interface ResultViewProps {
  response: AnalyzeResponse;
  maskReport: MaskReportItem[];
  isMockData: boolean;
  aiUnavailable: boolean;
  onReset: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({
  response,
  maskReport,
  isMockData,
  aiUnavailable,
  onReset,
}) => {
  const { t } = useT();
  const [forceOpenPaid, setForceOpenPaid] = useState<boolean>(false);

  if (response.input_kind === "advice_request") {
    return <AdviceRefusal refusalText={response.refusal} onReset={onReset} />;
  }

  if (response.input_kind === "unreadable") {
    return (
      <div
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
        <p style={{ margin: 0, fontSize: "1.0625rem", color: "var(--red-ink)" }}>
          {t("error.unreadable")}
        </p>
        <div>
          <Button type="button" variant="secondary" onClick={onReset}>
            {t("error.retry")}
          </Button>
        </div>
      </div>
    );
  }

  const { unlocatedClaimIds } = buildHighlightSegments(response.analysed_text, response.claims || []);
  const hiddenCount = maskReport.reduce((acc, curr) => acc + curr.count, 0);

  const handlePaidLinkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setForceOpenPaid(true);
    const el = document.getElementById("already-paid-section");
    if (el) {
      el.scrollIntoView({ block: "nearest", behavior: "smooth" });
      el.focus();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        {isMockData && <DemoDataBadge />}

        {hiddenCount > 0 && (
          <div
            style={{
              fontSize: "0.875rem",
              color: "var(--ink-muted)",
              marginBottom: "12px",
              backgroundColor: "var(--sunken)",
              padding: "8px 12px",
              borderRadius: "4px",
              border: "1px solid var(--line)",
            }}
          >
            {t("masked.notice", { n: hiddenCount })}
          </div>
        )}

        {aiUnavailable && (
          <div
            style={{
              fontSize: "0.875rem",
              color: "var(--amber-ink)",
              marginBottom: "12px",
              backgroundColor: "var(--amber-bg)",
              padding: "8px 12px",
              borderRadius: "4px",
              border: "1px solid var(--amber-line)",
            }}
          >
            {t("ai.unavailable")}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <TextLink href="#already-paid-section" onClick={handlePaidLinkClick}>
            {t("result.paidLink")}
          </TextLink>
        </div>
      </div>

      <div className="result-grid">
        <div className="result-left-col">
          {response.tier && <TierBanner response={response} />}
          <MarkedMessage analysedText={response.analysed_text} claims={response.claims || []} />
        </div>

        <div className="result-right-col">
          <ClaimLedger
            claims={response.claims || []}
            routes={response.actions?.verification_routes || []}
            unlocatedClaimIds={unlocatedClaimIds}
          />

          <CannotVerify items={response.cannot_verify || []} />

          <OfficialRoutes routes={response.actions?.verification_routes || []} />

          <PausePact pausePactData={response.actions?.pause_pact} />

          <TrustedPersonShare initialMessage={response.actions?.trusted_person_message} />

          <AlreadyPaid paidData={response.actions?.already_paid} forceOpen={forceOpenPaid} />

          <ProcessingNote response={response} />

          <div style={{ marginTop: "8px" }}>
            <Button type="button" variant="secondary" onClick={onReset} style={{ width: "100%" }}>
              {t("result.again")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
