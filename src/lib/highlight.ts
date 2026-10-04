import type { Claim, Severity } from "../api/types";

export interface ResolvedClaimSpan {
  claimIndex: number;
  claimId: string;
  severity: Severity;
  start: number;
  end: number;
}

export interface HighlightSegment {
  text: string;
  start: number;
  end: number;
  activeClaims: ResolvedClaimSpan[];
  highestSeverity: Severity | "none";
  endingSpans: ResolvedClaimSpan[];
}

const SEVERITY_RANK: Record<Severity, number> = {
  strong: 4,
  medium: 3,
  weak: 2,
  info: 1,
};

export function getHighestSeverity(spans: ResolvedClaimSpan[]): Severity | "none" {
  if (spans.length === 0) return "none";
  let maxSev: Severity = spans[0].severity;
  for (const s of spans) {
    if (SEVERITY_RANK[s.severity] > SEVERITY_RANK[maxSev]) {
      maxSev = s.severity;
    }
  }
  return maxSev;
}

export function buildHighlightSegments(
  analysedText: string,
  claims: Claim[]
): { segments: HighlightSegment[]; unlocatedClaimIds: Set<string> } {
  const unlocatedClaimIds = new Set<string>();
  const resolvedSpans: ResolvedClaimSpan[] = [];

  claims.forEach((claim, idx) => {
    const claimNum = idx + 1;
    const allSpans = [claim.span, ...(claim.extra_spans || [])];
    let foundAny = false;

    for (const span of allSpans) {
      const start = span.start;
      const end = span.end;

      if (start >= 0 && end <= analysedText.length && analysedText.slice(start, end) === claim.quote) {
        resolvedSpans.push({
          claimIndex: claimNum,
          claimId: claim.id,
          severity: claim.severity,
          start,
          end,
        });
        foundAny = true;
      } else {
        const index = analysedText.indexOf(claim.quote);
        if (index !== -1) {
          resolvedSpans.push({
            claimIndex: claimNum,
            claimId: claim.id,
            severity: claim.severity,
            start: index,
            end: index + claim.quote.length,
          });
          foundAny = true;
        }
      }
    }

    if (!foundAny) {
      unlocatedClaimIds.add(claim.id);
    }
  });

  if (analysedText.length === 0) {
    return { segments: [], unlocatedClaimIds };
  }

  const boundariesSet = new Set<number>([0, analysedText.length]);
  resolvedSpans.forEach((s) => {
    boundariesSet.add(s.start);
    boundariesSet.add(s.end);
  });
  const boundaries = Array.from(boundariesSet).sort((a, b) => a - b);

  const segments: HighlightSegment[] = [];

  for (let i = 0; i < boundaries.length - 1; i++) {
    const bStart = boundaries[i];
    const bEnd = boundaries[i + 1];
    const segText = analysedText.slice(bStart, bEnd);

    const active = resolvedSpans.filter((s) => s.start <= bStart && s.end >= bEnd);
    const ending = resolvedSpans.filter((s) => s.end === bEnd);

    segments.push({
      text: segText,
      start: bStart,
      end: bEnd,
      activeClaims: active,
      highestSeverity: getHighestSeverity(active),
      endingSpans: ending,
    });
  }

  return { segments, unlocatedClaimIds };
}
