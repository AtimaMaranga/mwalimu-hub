/**
 * Returns a privacy-respecting display name for tutors.
 *
 * - Public (unauthenticated): "Brenda M."
 * - Authenticated: "Brenda Mwangi"
 */
export function getTutorDisplayName(
  tutor: { name: string },
  isAuthenticated: boolean
): string {
  const parts = tutor.name.trim().split(/\s+/);
  const firstName = parts.slice(0, -1).join(" ") || parts[0];
  const lastName = parts.length > 1 ? parts[parts.length - 1] : "";

  if (isAuthenticated) {
    return `${firstName} ${lastName}`.trim();
  }

  return lastName ? `${firstName} ${lastName.charAt(0)}.` : firstName;
}
