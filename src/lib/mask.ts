import type { MaskKind, MaskReportItem } from "../api/types";

function toBase26(n: number): string {
  let s = "";
  let temp = n;
  while (temp >= 0) {
    s = String.fromCharCode(97 + (temp % 26)) + s;
    temp = Math.floor(temp / 26) - 1;
  }
  return s;
}

export function maskText(input: string): { text: string; report: MaskReportItem[] } {
  if (!input) {
    return { text: "", report: [] };
  }

  const counts: Record<MaskKind, number> = {
    otp: 0,
    card: 0,
    aadhaar: 0,
    pan: 0,
    phone: 0,
    account: 0,
  };

  // Step 1: Protect tokens
  const sentinels: Map<string, string> = new Map();
  let sentinelIndex = 0;

  function makeSentinel(original: string): string {
    const key = `\uE000P${toBase26(sentinelIndex++)}\uE001`;
    sentinels.set(key, original);
    return key;
  }

  let protectedText = input;

  // Protect existing placeholders [hidden:...]
  protectedText = protectedText.replace(/\[hidden:[a-z]+\]/g, (match) => makeSentinel(match));

  // Protect URLs
  protectedText = protectedText.replace(/https?:\/\/\S+/gi, (match) => makeSentinel(match));

  // Protect SEBI registration numbers (IN[AHZPM] followed by 9 digits)
  protectedText = protectedText.replace(/\bIN[AHZPM]\d{9}\b/gi, (match) => makeSentinel(match));

  // Protect tokens containing @ (UPI IDs, emails)
  protectedText = protectedText.replace(/\S+@\S+/g, (match) => makeSentinel(match));

  // Step 2: Apply masks in exact order
  const otpKeywords = "(?:otp|pin|cvv|cvc|mpin|passcode|password|code|ஓடிபி|பின்)";
  
  const otpBeforeRegex = new RegExp(`(${otpKeywords}[^\\d]{0,30})\\b(\\d{3,8})\\b`, "gi");
  protectedText = protectedText.replace(otpBeforeRegex, (_match, prefix) => {
    counts.otp++;
    return prefix + "[hidden:otp]";
  });

  const otpAfterRegex = new RegExp(`\\b(\\d{4,8})\\b([^\\d]{0,20}${otpKeywords})`, "gi");
  protectedText = protectedText.replace(otpAfterRegex, (_match, _num, suffix) => {
    counts.otp++;
    return "[hidden:otp]" + suffix;
  });

  // Card mask: 13 to 19 digits with optional single spaces or hyphens between groups
  // But skip if preceded by account keywords (account, acc, acct, a/c, கணக்கு)
  const accountKeywordCheck = /(?:account|acc|acct|a\/c|கணக்கு)[^\d]{0,20}$/i;
  const cardRegex = /\b(?:\d[ -]?){13,19}\b/g;

  protectedText = protectedText.replace(cardRegex, (match, offset, fullStr) => {
    const prefixStr = fullStr.slice(Math.max(0, offset - 25), offset);
    if (accountKeywordCheck.test(prefixStr)) {
      // Preceded by account keyword, leave for account mask
      return match;
    }

    const digitCount = match.replace(/\D/g, "").length;
    if (digitCount >= 13 && digitCount <= 19) {
      counts.card++;
      return "[hidden:card]";
    }
    return match;
  });

  // Aadhaar mask: 12 digits as 4+4+4 with optional space or hyphen
  const aadhaarRegex = /\b\d{4}[ -]?\d{4}[ -]?\d{4}\b/g;
  protectedText = protectedText.replace(aadhaarRegex, (match) => {
    const digitsOnly = match.replace(/\D/g, "");
    if (digitsOnly.length === 12) {
      counts.aadhaar++;
      return "[hidden:aadhaar]";
    }
    return match;
  });

  // PAN mask: [A-Za-z]{5}\d{4}[A-Za-z]
  const panRegex = /\b[A-Za-z]{5}\d{4}[A-Za-z]\b/g;
  protectedText = protectedText.replace(panRegex, () => {
    counts.pan++;
    return "[hidden:pan]";
  });

  // Phone mask: optional +91 or 91 prefix, then number starting 6 to 9 with 10 digits total, allowing space/hyphen
  const phoneRegex = /(?:\+?91[ -]?)?\b[6-9]\d{4}[ -]?\d{5}\b/g;
  protectedText = protectedText.replace(phoneRegex, () => {
    counts.phone++;
    return "[hidden:phone]";
  });

  // Account mask: any remaining 9 to 18 digit run
  const accountRegex = /\b\d{9,18}\b/g;
  protectedText = protectedText.replace(accountRegex, () => {
    counts.account++;
    return "[hidden:account]";
  });

  let finalText = protectedText;
  sentinels.forEach((original, sentinelKey) => {
    finalText = finalText.split(sentinelKey).join(original);
  });

  const report: MaskReportItem[] = (Object.keys(counts) as MaskKind[])
    .filter((k) => counts[k] > 0)
    .map((k) => ({ kind: k, count: counts[k] }));

  return { text: finalText, report };
}
