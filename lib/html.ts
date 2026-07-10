/**
 * Escaping helpers for hand-built HTML strings — chiefly the outbound email
 * templates in `server/`, which interpolate user-controlled values (project
 * names, display names, validator labels) into template literals.
 *
 * React escapes for you; template literals do not. Anything a user can type must
 * pass through `escapeHtml` before it reaches an HTML string, or a project named
 * `<a href="https://evil.test">Claim your grant</a>` becomes a phishing link sent
 * from our own sending domain.
 */

/** Escape a string for interpolation into HTML text or a double-quoted attribute. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Return `url` only if it is an absolute http(s) URL, otherwise null. Rejects
 * `javascript:` / `data:` payloads. Callers must still `escapeHtml` the result
 * before interpolating it into an attribute.
 *
 * Normalizes via the URL parser rather than `encodeURI`, which would re-encode
 * the `%` of an already-percent-encoded path: blob uploads keep the user's raw
 * filename (`app/api/file/route.ts`), so `My Banner.png` arrives here as
 * `…/My%20Banner.png` and `encodeURI` would turn it into `…/My%2520Banner.png`.
 */
export function safeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
  return parsed.toString();
}
