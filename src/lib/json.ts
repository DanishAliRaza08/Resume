// MySQL stores lists as JSON. Read them back defensively as string arrays.
export function strs(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}
