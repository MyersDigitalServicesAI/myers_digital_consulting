-- Harden the RLS helper function flagged by the Supabase security advisor:
--   1. Pin search_path (the body is fully schema-qualified, so '' is safe).
--   2. Drop the default PUBLIC/anon EXECUTE grant; only authenticated (RLS
--      policies evaluate as the querying role) and service_role need it.
-- Applied to aios-platform-prod on 2026-06-12 via the Supabase MCP.

alter function public.my_tenant_ids() set search_path = '';

revoke execute on function public.my_tenant_ids() from public, anon;
grant execute on function public.my_tenant_ids() to authenticated, service_role;
