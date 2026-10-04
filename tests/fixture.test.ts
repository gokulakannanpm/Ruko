import { describe, it, expect } from "vitest";
import { sampleTanglishResponse, sampleTamilPitchResponse } from "../src/mock/sampleResponse";

describe("Fixture span validation", () => {
  it("verifies every span slice equals its quote in sampleTanglishResponse", () => {
    const text = sampleTanglishResponse.analysed_text;
    sampleTanglishResponse.claims.forEach((claim) => {
      const slice = text.slice(claim.span.start, claim.span.end);
      expect(slice).toBe(claim.quote);
    });
  });

  it("verifies every span slice equals its quote in sampleTamilPitchResponse", () => {
    const text = sampleTamilPitchResponse.analysed_text;
    sampleTamilPitchResponse.claims.forEach((claim) => {
      const slice = text.slice(claim.span.start, claim.span.end);
      expect(slice).toBe(claim.quote);
    });
  });
});
