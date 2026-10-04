export function containsTamil(text: string): boolean {
  return /[\u0B80-\u0BFF]/.test(text);
}

export function getScriptLang(text: string): "ta" | "en" {
  return containsTamil(text) ? "ta" : "en";
}
