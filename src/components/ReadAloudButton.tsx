import React, { useState, useEffect } from "react";
import { useT } from "../i18n";
import { Button } from "./Button";
import { speakText, isSpeechSupported } from "../lib/speech";

export interface ReadAloudButtonProps {
  textToSpeak: string;
}

export const ReadAloudButton: React.FC<ReadAloudButtonProps> = ({ textToSpeak }) => {
  const { lang, t } = useT();
  const [supported, setSupported] = useState<boolean>(false);

  useEffect(() => {
    const checkSupport = () => {
      setSupported(isSpeechSupported(lang));
    };
    checkSupport();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = checkSupport;
    }
  }, [lang]);

  if (!supported) return null;

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={() => speakText(textToSpeak, lang)}
      style={{ minHeight: "36px", padding: "0 12px", fontSize: "0.875rem" }}
    >
      {t("speak.button")}
    </Button>
  );
};
