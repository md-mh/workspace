const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 60 * 60 * 1000],
  ["month", 30 * 24 * 60 * 60 * 1000],
  ["day", 24 * 60 * 60 * 1000],
  ["hour", 60 * 60 * 1000],
  ["minute", 60 * 1000],
];

/** "3 minutes ago" style labels for the item lists. */
export function formatRelativeTime(timestamp: number, now = Date.now()): string {
  const diff = timestamp - now;
  const absolute = Math.abs(diff);

  if (absolute < 45_000) return "just now";

  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

  for (const [unit, size] of RELATIVE_UNITS) {
    if (absolute >= size) {
      return formatter.format(Math.round(diff / size), unit);
    }
  }

  return "just now";
}

export function formatCharacterCount(content: string): string {
  const characters = content.length;
  if (characters === 0) return "Empty file";
  if (characters === 1) return "1 character";
  return `${characters.toLocaleString()} characters`;
}

export function countWords(content: string): number {
  const trimmed = content.trim();
  if (trimmed.length === 0) return 0;
  return trimmed.split(/\s+/).length;
}

export function countLines(content: string): number {
  return content.split("\n").length;
}
