type ClassValue = string | false | null | undefined;

/** Tiny class-name joiner — enough for conditional Tailwind classes. */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
