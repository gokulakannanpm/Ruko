import React from "react";
import type { MaskKind } from "../api/types";
import { useT } from "../i18n";

export interface HiddenChipProps {
  kind: MaskKind | string;
}

export const HiddenChip: React.FC<HiddenChipProps> = ({ kind }) => {
  const { t } = useT();

  const keyMap: Record<string, string> = {
    otp: "hidden.otp",
    card: "hidden.card",
    aadhaar: "hidden.aadhaar",
    pan: "hidden.pan",
    phone: "hidden.phone",
    account: "hidden.account",
  };

  const translationKey = keyMap[kind] || `hidden.${kind}`;
  const label = t(translationKey);

  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 6px",
        backgroundColor: "var(--sunken)",
        border: "1px solid var(--line-strong)",
        borderRadius: "4px",
        fontSize: "0.8125rem",
        fontWeight: 600,
        color: "var(--ink-muted)",
        fontFamily: "'Source Sans 3', sans-serif",
        margin: "0 2px",
      }}
    >
      [{label}]
    </span>
  );
};
