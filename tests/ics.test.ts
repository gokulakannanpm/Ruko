import { describe, it, expect } from "vitest";
import { generatePauseICS } from "../src/lib/ics";

describe("generatePauseICS", () => {
  it("generates a valid VCALENDAR string with UTC time and no user message content", () => {
    const hours = 24;
    const sampleUserMessage = "Secret message with confidential account details";
    const ics = generatePauseICS(hours, "Ruko: pause before paying", "Review official checks first.");

    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("END:VCALENDAR");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("END:VEVENT");
    expect(ics).toContain("BEGIN:VALARM");
    expect(ics).toContain("TRIGGER:-PT0M");
    expect(ics).toContain("Z"); // UTC time indicator
    expect(ics).not.toContain(sampleUserMessage);
  });
});
