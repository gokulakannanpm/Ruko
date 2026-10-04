function formatICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export function generatePauseICS(hours: number, summaryText?: string, descText?: string): string {
  const now = new Date();
  const start = new Date(now.getTime() + hours * 60 * 60 * 1000);
  const end = new Date(start.getTime() + 30 * 60 * 1000); // 30 min duration

  const summary = summaryText || "Ruko: pause before paying";
  const description = descText || "You chose to wait before sending money. Review the official checks first.";
  const uid = `ruko-pause-${Date.now()}-${Math.random().toString(36).substring(2, 9)}@ruko.local`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Ruko//Financial Safety Utility//EN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${formatICSDate(now)}`,
    `DTSTART:${formatICSDate(start)}`,
    `DTEND:${formatICSDate(end)}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "DESCRIPTION:Reminder to review official checks before moving money",
    "TRIGGER:-PT0M",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");
}

export function downloadPauseICS(hours: number, summaryText?: string, descText?: string) {
  const content = generatePauseICS(hours, summaryText, descText);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `ruko-pause-reminder-${hours}h.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
