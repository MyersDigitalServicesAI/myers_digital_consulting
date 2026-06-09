import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ?? "https://biiusbjjuulgomzwtjzz.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpaXVzYmpqdXVsZ29tend0anp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyNjA5MjksImV4cCI6MjA5NTgzNjkyOX0.GZsDJhjcmK3aN0oQUVlnLjWIU6t9qszcZXjxARPwzYo";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
