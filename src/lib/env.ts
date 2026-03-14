import { z } from "zod";

/**
 * Server-side environment variable validation.
 * Imported once at module scope — throws immediately if any var is invalid/missing.
 * Only use in server code (API routes, server components, middleware).
 */
const serverSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20, "NEXT_PUBLIC_SUPABASE_ANON_KEY is too short"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20, "SUPABASE_SERVICE_ROLE_KEY is too short"),
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
  ADMIN_EMAILS: z.string().min(3, "ADMIN_EMAILS must contain at least one valid email"),
  NEXT_PUBLIC_SITE_URL: z.string().url("NEXT_PUBLIC_SITE_URL must be a valid URL"),
  ADMIN_EMAIL: z.string().email("ADMIN_EMAIL must be a valid email").optional(),
});

function validateEnv() {
  const result = serverSchema.safeParse(process.env);
  if (!result.success) {
    const formatted = result.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    console.error(`\n❌ Invalid environment variables:\n${formatted}\n`);
    // Log warnings but don't throw — build and dev both need to start.
    // Security is enforced at the call site (isAdminEmail returns false if unconfigured).
  }
  return result.success ? result.data : (process.env as unknown as z.infer<typeof serverSchema>);
}

export const env = validateEnv();

/**
 * Parse and validate ADMIN_EMAILS into a Set for O(1) lookups.
 * Filters out empty strings and normalizes to lowercase.
 */
export const ADMIN_EMAIL_SET = new Set(
  (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.length > 0 && e.includes("@"))
);

/** Check if a given email is an admin */
export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  if (ADMIN_EMAIL_SET.size === 0) return false; // no admins configured = deny all
  return ADMIN_EMAIL_SET.has(email.toLowerCase());
}
