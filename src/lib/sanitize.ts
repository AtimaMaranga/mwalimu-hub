/**
 * HTML entity escaping for safe interpolation into HTML strings (emails, etc.).
 * Prevents XSS via user-supplied content in email templates.
 */
const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
  "`": "&#96;",
};

const HTML_ESCAPE_RE = /[&<>"'\/`]/g;

/** Escape a string for safe HTML interpolation */
export function escapeHtml(str: string): string {
  return str.replace(HTML_ESCAPE_RE, (char) => HTML_ESCAPE_MAP[char] || char);
}

/** Escape and convert newlines to <br/> for HTML email bodies */
export function escapeHtmlWithBreaks(str: string): string {
  return escapeHtml(str).replace(/\n/g, "<br/>");
}

/**
 * Truncate a string to maxLength, appending ellipsis if needed.
 * Operates on the raw string before escaping.
 */
export function safeTruncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "…";
}
