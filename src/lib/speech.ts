import type { Lang } from "../api/types";

export function isSpeechSupported(lang: Lang): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return true;
  const targetPrefix = lang === "ta" ? "ta" : "en";
  return voices.some((v) => v.lang.toLowerCase().startsWith(targetPrefix));
}

export function speakText(text: string, lang: Lang) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const targetPrefix = lang === "ta" ? "ta" : "en";
  
  const voices = window.speechSynthesis.getVoices();
  const voice = voices.find((v) => v.lang.toLowerCase().startsWith(targetPrefix));
  if (voice) {
    utterance.voice = voice;
  }
  utterance.lang = lang === "ta" ? "ta-IN" : "en-IN";
  window.speechSynthesis.speak(utterance);
}
