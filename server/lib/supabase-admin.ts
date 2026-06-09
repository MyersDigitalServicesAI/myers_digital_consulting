import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.SUPABASE_URL ?? "https://biiusbjjuulgomzwtjzz.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

if (!serviceRoleKey) {
  console.warn(
    "[supabase-admin] SUPABASE_SERVICE_ROLE_KEY is not set — portal API will return 503"
  );
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export function isSupabaseConfigured(): boolean {
  return serviceRoleKey.length > 0;
}
