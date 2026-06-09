import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.SUPABASE_URL ?? "https://biiusbjjuulgomzwtjzz.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

if (!serviceRoleKey) {
  console.warn(
    "[supabase-admin] SUPABASE_SERVICE_ROLE_KEY is not set — portal API will return 503"
  );
}

// createClient throws on an empty key; the placeholder keeps imports safe in
// unconfigured environments (tests, local dev) — isSupabaseConfigured() gates
// all real usage behind a 503.
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey || "not-configured", {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export function isSupabaseConfigured(): boolean {
  return serviceRoleKey.length > 0;
}
