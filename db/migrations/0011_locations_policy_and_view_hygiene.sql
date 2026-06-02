drop policy if exists "locations admin insert" on public.locations;
drop policy if exists "locations admin update" on public.locations;
drop policy if exists "locations admin delete" on public.locations;

alter view public.admin_location_summary set (security_invoker = true);
