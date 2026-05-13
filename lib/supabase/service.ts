import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role client. **Cron / server-only.** Bypasses Row-Level Security,
 * so this must never be imported by any client component or route the
 * browser can reach without an authenticated server boundary.
 *
 * Used exclusively by /api/cron/digests so the daily digest generator can
 * iterate every user. All other code paths use lib/supabase/server.ts and
 * rely on RLS for access control.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY (and URL) must be set for the service client",
    );
  }
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
