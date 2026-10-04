const ALLOWED_HOSTS = new Set([
  "siportal.sebi.gov.in",
  "investor.sebi.gov.in",
  "cybercrime.gov.in",
  "sancharsaathi.gov.in"
]);

export function isSafeUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  if (url === "tel:1930") return true;

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    return ALLOWED_HOSTS.has(parsed.hostname);
  } catch {
    return false;
  }
}
