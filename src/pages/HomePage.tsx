import React, { useState } from "react";
import { useT } from "../i18n";
import { useAnalyze } from "../api/useAnalyze";
import { useHealth } from "../api/useHealth";
import { MessageInput } from "../components/MessageInput";
import { HowItWorks } from "../components/HowItWorks";
import { ProcessingStatus } from "../components/ProcessingStatus";
import { SkeletonResult } from "../components/SkeletonResult";
import { ResultView } from "../components/ResultView";
import { ErrorPanel } from "../components/ErrorPanel";

export const HomePage: React.FC = () => {
  const { t, lang } = useT();
  const { health } = useHealth();
  const {
    status,
    result,
    error,
    aiState,
    maskedText: _maskedText,
    maskReport,
    isMockData,
    submit,
    retry,
    cancel,
    reset,
  } = useAnalyze();

  const [inputText, setInputText] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [allowAi, setAllowAi] = useState<boolean>(false);

  const handleSubmit = () => {
    submit({
      text: inputText,
      imageFile,
      allowAi,
      uiLanguage: lang,
    });
  };

  const handleReset = () => {
    reset();
    setInputText("");
    setImageFile(null);
    setAllowAi(false);
  };

  const isProcessing = status === "analyzing_rules" || status === "rules_ready_ai_pending";
  const isDone = status === "done" && result !== null;
  const isError = status === "error" && error !== null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
      {/* Header H1 Tagline */}
      {!isDone && (
        <header>
          <h1
            style={{
              margin: "0 0 12px 0",
              color: "var(--green)",
              fontFamily: "'Source Serif 4', serif",
            }}
          >
            {t("app.tagline")}
          </h1>
          <p style={{ margin: 0, fontSize: "1.125rem", color: "var(--ink-muted)", maxWidth: "720px", lineHeight: 1.5 }}>
            {t("input.help")}
          </p>
        </header>
      )}

      {/* Main Content Area */}
      {!isDone ? (
        <div className="home-input-grid">
          {/* Left Column (Desktop) / Second on Mobile: How It Works */}
          <div className="home-left-col">
            <HowItWorks />
          </div>

          {/* Right Column (Desktop) / First on Mobile: Input Panel */}
          <div className="home-right-col">
            <MessageInput
              inputText={inputText}
              onTextChange={setInputText}
              imageFile={imageFile}
              onImageChange={setImageFile}
              allowAi={allowAi}
              onToggleAi={setAllowAi}
              onSubmit={handleSubmit}
              isSubmitting={isProcessing}
              aiAvailable={health.ai_enabled}
              showImageFeature={health.features.image_input}
            />

            {isProcessing && (
              <div style={{ marginTop: "24px" }}>
                <ProcessingStatus
                  status={status as "analyzing_rules" | "rules_ready_ai_pending"}
                  onCancel={cancel}
                />
                <SkeletonResult />
              </div>
            )}

            {isError && error && (
              <ErrorPanel error={error} onRetry={retry} />
            )}
          </div>
        </div>
      ) : (
        /* Result State */
        <div>
          <ResultView
            response={result}
            maskReport={maskReport}
            isMockData={isMockData}
            aiUnavailable={aiState === "unavailable"}
            onReset={handleReset}
          />
        </div>
      )}

      {/* Below the Fold Explanatory Section (when not showing result) */}
      {!isDone && (
        <section
          style={{
            borderTop: "1px solid var(--line)",
            paddingTop: "40px",
            marginTop: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            maxWidth: "720px",
            fontSize: "1rem",
            lineHeight: 1.6,
            color: "var(--ink-muted)",
          }}
        >
          <p style={{ margin: 0 }}>
            Ruko helps you understand the individual claims in suspicious investment messages. It highlights key risk indicators—such as guaranteed profit promises, non-standard payment handles, or unverified registration numbers—and guides you to official SEBI and government check channels before you transfer any money.
          </p>
          <p style={{ margin: 0 }}>
            Ruko never gives investment advice, never issues safety verdicts or labels messages as "safe", never opens or visits external links automatically, and never stores your pasted message text or sensitive personal information.
          </p>
        </section>
      )}
    </div>
  );
};
