export const ZIP_NOT_IN_SERVICE = "Zipcode not within service area.";

/** Normalize to 5-digit US zip (strips ZIP+4). */
export function normalizeZipCode(input: string): string {
  const digits = input.replace(/\D/g, "").slice(0, 5);
  return digits;
}

export function parseAcceptedZipcodes(json: string): string[] {
  try {
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed)) {
      const zips = parsed
        .map((z) => normalizeZipCode(String(z)))
        .filter((z) => z.length === 5);
      return [...new Set(zips)];
    }
  } catch {
    /* fall through */
  }
  return [];
}

/** Parse admin textarea: one zip per line or comma-separated. */
export function zipcodesFromText(text: string): string[] {
  const parts = text.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
  const zips = parts
    .map((z) => normalizeZipCode(z))
    .filter((z) => z.length === 5);
  return [...new Set(zips)];
}

export function zipcodesToText(zips: string[]): string {
  return zips.join("\n");
}

export function isZipAccepted(zip: string, accepted: string[]): boolean {
  const normalized = normalizeZipCode(zip);
  if (normalized.length !== 5) return false;
  if (accepted.length === 0) return false;
  return accepted.includes(normalized);
}
