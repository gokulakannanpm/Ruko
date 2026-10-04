import { describe, it, expect } from "vitest";
import { buildHighlightSegments } from "../src/lib/highlight";
import { Claim } from "../src/api/types";

describe("buildHighlightSegments", () => {
  const dummyL10n = { en: "test", ta: "சோதனை" };

  it("handles single span", () => {
    const text = "Hello world test message";
    const claims: Claim[] = [
      {
        id: "c1",
        quote: "world",
        span: { start: 6, end: 11 },
        extra_spans: [],
        indicator: { id: "ind1", label: dummyL10n },
        severity: "strong",
        origin: "rule",
        why_it_matters: dummyL10n,
        verify_through: { text: dummyL10n, route_ids: [] },
        limit: dummyL10n,
        verifiable_by: "official_source_by_user",
        source_basis: "regulator_guidance",
        detail: null,
      },
    ];

    const { segments, unlocatedClaimIds } = buildHighlightSegments(text, claims);
    expect(unlocatedClaimIds.size).toBe(0);
    expect(segments.length).toBe(3);
    expect(segments[0].text).toBe("Hello ");
    expect(segments[1].text).toBe("world");
    expect(segments[1].highestSeverity).toBe("strong");
    expect(segments[2].text).toBe(" test message");
  });

  it("handles overlapping and adjacent spans", () => {
    const text = "ABCDEFGH";
    const claims: Claim[] = [
      {
        id: "c1",
        quote: "BCD",
        span: { start: 1, end: 4 },
        extra_spans: [],
        indicator: { id: "ind1", label: dummyL10n },
        severity: "medium",
        origin: "rule",
        why_it_matters: dummyL10n,
        verify_through: { text: dummyL10n, route_ids: [] },
        limit: dummyL10n,
        verifiable_by: "official_source_by_user",
        source_basis: "regulator_guidance",
        detail: null,
      },
      {
        id: "c2",
        quote: "DEF",
        span: { start: 3, end: 6 },
        extra_spans: [],
        indicator: { id: "ind2", label: dummyL10n },
        severity: "strong",
        origin: "rule",
        why_it_matters: dummyL10n,
        verify_through: { text: dummyL10n, route_ids: [] },
        limit: dummyL10n,
        verifiable_by: "official_source_by_user",
        source_basis: "regulator_guidance",
        detail: null,
      },
    ];

    const { segments } = buildHighlightSegments(text, claims);
    expect(segments.map((s) => s.text)).toEqual(["A", "BC", "D", "EF", "GH"]);
    // Segment 'D' (start 3, end 4) is overlapping both c1 and c2, so highest severity is strong
    const segD = segments.find((s) => s.text === "D");
    expect(segD?.highestSeverity).toBe("strong");
  });

  it("handles extra_spans and quote mismatch fallback", () => {
    const text = "Foo Bar Baz";
    const claims: Claim[] = [
      {
        id: "c1",
        quote: "Bar",
        span: { start: 99, end: 102 }, // invalid offset, should fallback to indexOf("Bar")
        extra_spans: [],
        indicator: { id: "ind1", label: dummyL10n },
        severity: "weak",
        origin: "rule",
        why_it_matters: dummyL10n,
        verify_through: { text: dummyL10n, route_ids: [] },
        limit: dummyL10n,
        verifiable_by: "official_source_by_user",
        source_basis: "regulator_guidance",
        detail: null,
      },
    ];

    const { segments, unlocatedClaimIds } = buildHighlightSegments(text, claims);
    expect(unlocatedClaimIds.size).toBe(0);
    const barSeg = segments.find((s) => s.text === "Bar");
    expect(barSeg).toBeDefined();
  });

  it("handles Tamil text UTF-16 code units", () => {
    const text = "உறுதியான லாபம் தினமும் 3%";
    const quote = "உறுதியான லாபம்";
    const claims: Claim[] = [
      {
        id: "c1",
        quote: quote,
        span: { start: 0, end: quote.length },
        extra_spans: [],
        indicator: { id: "ind1", label: dummyL10n },
        severity: "strong",
        origin: "rule",
        why_it_matters: dummyL10n,
        verify_through: { text: dummyL10n, route_ids: [] },
        limit: dummyL10n,
        verifiable_by: "official_source_by_user",
        source_basis: "regulator_guidance",
        detail: null,
      },
    ];

    const { segments } = buildHighlightSegments(text, claims);
    expect(segments[0].text).toBe(quote);
    expect(segments[0].highestSeverity).toBe("strong");
  });
});
