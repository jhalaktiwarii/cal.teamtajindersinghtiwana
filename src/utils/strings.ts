export const s = (v: unknown) => (typeof v === "string" ? v : v == null ? "" : String(v));
export const lower = (v: unknown) => s(v).toLowerCase();
export const includesCI = (haystack: unknown, needle: unknown) =>
  lower(haystack).includes(lower(needle)); 