import React, { useState } from "react";
import type { Claim, Severity } from "../api/types";
import { useT } from "../i18n";
import { buildHighlightSegments } from "../lib/highlight";
import type { HighlightSegment } from "../lib/highlight";
import { HiddenChip } from "./HiddenChip";

export interface MarkedMessageProps {
  analysedText: string;
  claims: Claim[];
  onSelectClaim?: (claimIndex: number) => void;
}

const SEVERITY_BG: Record<Severity | "none", string> = {
  strong: "var(--red-bg)",
  medium: "var(--amber-bg)",
  weak: "var(--sunken)",
  info: "var(--sunken)",
  none: "transparent",
};

const SEVERITY_UNDERLINE: Record<Severity | "none", string> = {
  strong: "var(--red-line)",
  medium: "var(--amber-line)",
  weak: "var(--line-strong)",
  info: "var(--line-strong)",
  none: "transparent",
};

export const MarkedMessage: React.FC<MarkedMessageProps> = ({ analysedText, claims }) => {
  const { t } = useT();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const { segments } = buildHighlightSegments(analysedText, claims);

  const scrollToLedgerRow = (claimIndex: number) => {
    const el = document.getElementById(`claim-row-${claimIndex}`);
    if (el) {
      el.scrollIntoView({ block: "nearest", behavior: "smooth" });
      el.focus();
    }
  };

  const renderTextWithChips = (text: string) => {
    const placeholderRegex = /(\[hidden:[a-z]+\])/g;
    const parts = text.split(placeholderRegex);

    return parts.map((part, idx) => {
      const match = part.match(/^\[hidden:([a-z]+)\]$/);
      if (match) {
        return <HiddenChip key={idx} kind={match[1]} />;
      }
      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <section
      aria-labelledby="marked-message-title"
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--line-strong)",
        borderRadius: "4px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <h2
        id="marked-message-title"
        style={{
          margin: 0,
          fontSize: "1.125rem",
          fontWeight: 600,
          fontFamily: "'Source Serif 4', serif",
        }}
      >
        {t("message.title")}
      </h2>

      <div
        id="marked-message-container"
        tabIndex={-1}
        style={{
          backgroundColor: "var(--sunken)",
          border: "1px solid var(--line)",
          borderRadius: "4px",
          padding: "16px",
          fontFamily: "'Source Serif 4', serif",
          fontSize: "1.0625rem",
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
          overflowWrap: "anywhere",
          maxHeight: isExpanded ? "none" : "200px",
          overflowY: isExpanded ? "visible" : "hidden",
          position: "relative",
          outline: "none",
        }}
      >
        {segments.map((seg: HighlightSegment, segIdx: number) => {
          const isHighlighted = seg.highestSeverity !== "none";

          return (
            <React.Fragment key={segIdx}>
              {isHighlighted ? (
                <mark
                  id={`mark-span-${seg.start}`}
                  style={{
                    backgroundColor: SEVERITY_BG[seg.highestSeverity],
                    borderBottom: `2px solid ${SEVERITY_UNDERLINE[seg.highestSeverity]}`,
                    color: "var(--ink)",
                    padding: "1px 0",
                  }}
                >
                  {renderTextWithChips(seg.text)}
                </mark>
              ) : (
                renderTextWithChips(seg.text)
              )}

              {seg.endingSpans.map((ending) => (
                <button
                  key={`btn-ending-${ending.claimIndex}-${ending.start}`}
                  type="button"
                  onClick={() => scrollToLedgerRow(ending.claimIndex)}
                  title={`Jump to claim ${ending.claimIndex}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 3px",
                    padding: "0 5px",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    borderRadius: "3px",
                    border: "1px solid var(--line-strong)",
                    backgroundColor: "var(--surface)",
                    color: "var(--green)",
                    cursor: "pointer",
                    lineHeight: "1.2",
                    verticalAlign: "super",
                  }}
                >
                  [{ending.claimIndex}]
                </button>
              ))}
            </React.Fragment>
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            background: "none",
            border: "none",
            color: "var(--green)",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          {isExpanded ? t("message.showLess") : t("message.showFull")}
        </button>
      </div>
    </section>
  );
};
