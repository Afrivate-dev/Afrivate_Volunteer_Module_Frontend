/**
 * Normalize website for API storage: add https:// when the user omits a scheme.
 * Empty input stays empty; http:// and https:// are left unchanged.
 */
export function normalizeWebsiteForStorage(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return "";
  const lower = s.toLowerCase();
  if (lower.startsWith("http://") || lower.startsWith("https://")) return s;
  return `https://${s}`;
}
