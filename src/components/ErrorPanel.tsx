import React from "react";
import type { ClientErrorCode } from "../api/types";
import { useT } from "../i18n";
import { Button } from "./Button";

export interface ErrorPanelProps {
  error: { code: ClientErrorCode; retryable: boolean };
  onRetry: () => void;
}

export const ErrorPanel: React.FC<ErrorPanelProps> = ({ error, onRetry }) => {
  const { t } = useT();

  const codeMap: Record<ClientErrorCode, string> = {
    invalid_input: "error.invalid",
    payload_too_large: "error.invalid",
    rate_limited: "error.rate",
    internal_error: "error.server",
    network: "error.network",
    timeout: "error.timeout",
    malformed_response: "error.malformed",
    mock_no_fixture: "error.mock",
  };

  const translationKey = codeMap[error.code] || "error.server";
  const errorMessage = t(translationKey);

  return (
    <div
      role="alert"
      style={{
        backgroundColor: "var(--red-bg)",
        border: "1px solid var(--red-line)",
        borderRadius: "4px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        color: "var(--red-ink)",
        marginTop: "16px",
      }}
    >
      <p style={{ margin: 0, fontSize: "1.0625rem", fontWeight: 600 }}>{errorMessage}</p>

      {error.retryable && (
        <div>
          <Button type="button" variant="secondary" onClick={onRetry} style={{ borderColor: "var(--red-line)", color: "var(--red-ink)" }}>
            {t("error.retry")}
          </Button>
        </div>
      )}
    </div>
  );
};
