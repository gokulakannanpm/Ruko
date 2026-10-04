import React, { useState, useEffect } from "react";
import { useT } from "../i18n";
import { Button } from "./Button";
import { SampleSelect } from "./SampleSelect";
import { ImagePicker } from "./ImagePicker";
import { AiToggle } from "./AiToggle";

export interface MessageInputProps {
  inputText: string;
  onTextChange: (text: string) => void;
  imageFile: File | null;
  onImageChange: (file: File | null) => void;
  allowAi: boolean;
  onToggleAi: (val: boolean) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  aiAvailable: boolean;
  showImageFeature: boolean;
  onNavigatePaid?: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  inputText,
  onTextChange,
  imageFile,
  onImageChange,
  allowAi,
  onToggleAi,
  onSubmit,
  isSubmitting,
  aiAvailable,
  showImageFeature,
}) => {
  const { t } = useT();
  const [selectedSampleKey, setSelectedSampleKey] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  // If image is attached, force AI toggle ON
  useEffect(() => {
    if (imageFile) {
      onToggleAi(true);
    }
  }, [imageFile, onToggleAi]);

  const handleSampleSelect = (key: string, sampleText: string) => {
    setSelectedSampleKey(key);
    onTextChange(sampleText);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length <= 4000) {
      onTextChange(val);
      if (selectedSampleKey) setSelectedSampleKey(null);
    }
  };

  const isCheckDisabled = isSubmitting || (!inputText.trim() && !imageFile);

  return (
    <div
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--line-strong)",
        borderRadius: "4px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label htmlFor="message-textarea" style={{ fontSize: "1.125rem", fontWeight: 600 }}>
          {t("input.title")}
        </label>
        <div style={{ position: "relative" }}>
          <textarea
            id="message-textarea"
            value={inputText}
            onChange={handleTextChange}
            placeholder={t("input.placeholder")}
            disabled={isSubmitting}
            style={{
              width: "100%",
              minHeight: "240px",
              padding: "14px",
              borderRadius: "4px",
              border: "1px solid var(--line-strong)",
              backgroundColor: "var(--paper)",
              color: "var(--ink)",
              fontSize: "1.0625rem",
              lineHeight: 1.5,
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />
          <div
            style={{
              textAlign: "right",
              fontSize: "0.8125rem",
              color: "var(--ink-muted)",
              marginTop: "4px",
            }}
          >
            {inputText.length} / 4000
          </div>
        </div>
        <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--ink-muted)" }}>
          {t("input.never")}
        </p>
      </div>

      <SampleSelect onSelectSample={handleSampleSelect} selectedSampleKey={selectedSampleKey} />

      {selectedSampleKey && (
        <div
          style={{
            display: "inline-block",
            alignSelf: "flex-start",
            padding: "4px 8px",
            backgroundColor: "var(--sunken)",
            border: "1px solid var(--line)",
            borderRadius: "4px",
            fontSize: "0.8125rem",
            fontWeight: 600,
          }}
        >
          {t("sample.badge")}
        </div>
      )}

      {showImageFeature && (
        <ImagePicker
          imageFile={imageFile}
          onImageChange={onImageChange}
          imageError={imageError}
          setImageError={setImageError}
        />
      )}

      <AiToggle
        allowAi={allowAi}
        onToggleAi={onToggleAi}
        disabled={isSubmitting || !aiAvailable || !!imageFile}
        forcedReason={
          imageFile
            ? t("input.ai.forced")
            : !aiAvailable
            ? t("input.ai.off")
            : null
        }
      />

      <Button
        type="button"
        variant="primary"
        onClick={onSubmit}
        disabled={isCheckDisabled}
        style={{ width: "100%", minHeight: "48px" }}
      >
        {t("input.check")}
      </Button>

      <details
        style={{
          borderTop: "1px solid var(--line)",
          paddingTop: "16px",
          marginTop: "4px",
        }}
      >
        <summary
          style={{
            cursor: "pointer",
            fontWeight: 600,
            color: "var(--green)",
            fontSize: "0.9375rem",
          }}
        >
          {t("paid.title")}
        </summary>
        <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.875rem" }}>
          <p style={{ margin: 0, fontWeight: 600, color: "var(--ink-muted)" }}>{t("paid.note")}</p>
          <ol style={{ margin: 0, paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <li>
              {t("paid.steps.1")}{" "}
              <a href="tel:1930" style={{ color: "var(--green)", fontWeight: 600, marginLeft: "4px" }}>
                {t("paid.call")}
              </a>
            </li>
            <li>{t("paid.steps.2")}</li>
            <li>{t("paid.steps.3")}</li>
            <li>{t("paid.steps.4")}</li>
            <li>{t("paid.steps.5")}</li>
          </ol>
        </div>
      </details>
    </div>
  );
};
