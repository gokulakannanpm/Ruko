import { describe, it, expect } from "vitest";
import { isSafeUrl } from "../src/lib/safeUrl";

describe("isSafeUrl", () => {
  it("accepts allowlisted https hosts", () => {
    expect(isSafeUrl("https://siportal.sebi.gov.in/intermediary/sebi-check")).toBe(true);
    expect(isSafeUrl("https://investor.sebi.gov.in/")).toBe(true);
    expect(isSafeUrl("https://cybercrime.gov.in/")).toBe(true);
    expect(isSafeUrl("https://sancharsaathi.gov.in/")).toBe(true);
  });

  it("accepts exact tel:1930", () => {
    expect(isSafeUrl("tel:1930")).toBe(true);
  });

  it("rejects non-https, javascript:, and look-alike hosts", () => {
    expect(isSafeUrl("http://siportal.sebi.gov.in/")).toBe(false);
    expect(isSafeUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeUrl("https://siportal.sebi.gov.in.attacker.com/")).toBe(false);
    expect(isSafeUrl("https://fake-sebi.gov.in/")).toBe(false);
    expect(isSafeUrl("tel:100")).toBe(false);
    expect(isSafeUrl(null)).toBe(false);
    expect(isSafeUrl("")).toBe(false);
  });
});
