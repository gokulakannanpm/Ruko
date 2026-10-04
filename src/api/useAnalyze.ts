import { useState, useRef, useCallback } from "react";
import type { AnalyzeRequest, AnalyzeResponse, ClientErrorCode, Lang, MaskReportItem, ImagePayload } from "./types";
import { maskText } from "../lib/mask";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export type AnalyzeStatus = "idle" | "analyzing_rules" | "rules_ready_ai_pending" | "done" | "error";

export interface UseAnalyze {
  status: AnalyzeStatus;
  result: AnalyzeResponse | null;
  error: { code: ClientErrorCode; retryable: boolean } | null;
  aiState: "not_requested" | "pending" | "complete" | "unavailable";
  maskedText: string;
  maskReport: MaskReportItem[];
  isMockData: boolean;
  submit(input: { text: string; imageFile: File | null; allowAi: boolean; uiLanguage: Lang }): void;
  retry(): void;
  cancel(): void;
  reset(): void;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      const commaIdx = res.indexOf(",");
      if (commaIdx !== -1) {
        resolve(res.slice(commaIdx + 1));
      } else {
        resolve(res);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export function useAnalyze(): UseAnalyze {
  const [status, setStatus] = useState<AnalyzeStatus>("idle");
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<{ code: ClientErrorCode; retryable: boolean } | null>(null);
  const [aiState, setAiState] = useState<"not_requested" | "pending" | "complete" | "unavailable">("not_requested");
  const [maskedText, setMaskedText] = useState<string>("");
  const [maskReport, setMaskReport] = useState<MaskReportItem[]>([]);
  const [isMockData, setIsMockData] = useState<boolean>(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const lastInputRef = useRef<{ text: string; imageFile: File | null; allowAi: boolean; uiLanguage: Lang } | null>(null);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setStatus("idle");
  }, []);

  const reset = useCallback(() => {
    cancel();
    setStatus("idle");
    setResult(null);
    setError(null);
    setAiState("not_requested");
    setMaskedText("");
    setMaskReport([]);
    setIsMockData(false);
  }, [cancel]);

  const submit = useCallback(async (input: { text: string; imageFile: File | null; allowAi: boolean; uiLanguage: Lang }) => {
    cancel();
    lastInputRef.current = input;
    setError(null);

    const masked = maskText(input.text);
    setMaskedText(masked.text);
    setMaskReport(masked.report);

    if (!masked.text.trim() && !input.imageFile) {
      setError({ code: "invalid_input", retryable: false });
      setStatus("error");
      return;
    }

    setStatus("analyzing_rules");
    setIsMockData(false);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      let imagePayload: ImagePayload | null = null;
      if (input.imageFile) {
        const mimeStr = input.imageFile.type;
        if (mimeStr === "image/jpeg" || mimeStr === "image/png" || mimeStr === "image/webp") {
          const b64 = await fileToBase64(input.imageFile);
          imagePayload = {
            mime: mimeStr,
            data_base64: b64,
          };
        }
      }

      const reqBody: AnalyzeRequest = {
        text: input.text,
        image: imagePayload,
        ui_language: input.uiLanguage,
        allow_ai: input.allowAi,
        client_mask_report: masked.report,
      };

      const res = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reqBody),
        signal: controller.signal,
      });

      if (!res.ok) {
        let code: ClientErrorCode = "internal_error";
        let retryable = true;

        if (res.status === 400) {
          code = "invalid_input";
          retryable = false;
        } else if (res.status === 413) {
          code = "payload_too_large";
          retryable = false;
        } else if (res.status === 429) {
          code = "rate_limited";
          retryable = true;
        } else {
          code = "internal_error";
          retryable = true;
        }

        try {
          const errData = await res.json();
          if (errData && errData.error && errData.error.code) {
            code = errData.error.code as ClientErrorCode;
            if (typeof errData.error.retryable === "boolean") {
              retryable = errData.error.retryable;
            }
          }
        } catch {
          // Ignore JSON parse error on non-JSON error pages
        }

        setError({ code, retryable });
        setStatus("error");
        return;
      }

      const data: AnalyzeResponse = await res.json();
      setResult(data);
      setIsMockData(false);
      setStatus("done");

      if (data.mode === "full" || data.ai_notice) {
        setAiState("complete");
      } else if (data.warnings && data.warnings.includes("ai_unavailable")) {
        setAiState("unavailable");
      } else {
        setAiState("not_requested");
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        return;
      }
      setError({ code: "network", retryable: true });
      setStatus("error");
    } finally {
      abortControllerRef.current = null;
    }
  }, [cancel]);

  const retry = useCallback(() => {
    if (lastInputRef.current) {
      submit(lastInputRef.current);
    }
  }, [submit]);

  return {
    status,
    result,
    error,
    aiState,
    maskedText,
    maskReport,
    isMockData,
    submit,
    retry,
    cancel,
    reset,
  };
}
