const germanDateFormatter = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

export function formatUtcMsToGermanDate(ms: number): string {
  return germanDateFormatter.format(ms);
}
