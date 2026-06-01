create schema if not exists private;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'profile_status'
      and n.nspname = 'public'
  ) then
    create type public.profile_status as enum ('active', 'blocked', 'deleted');
  end if;
end $$;

alter table public.profiles
  add column if not exists status public.profile_status not null default 'active';

create index if not exists profiles_status_idx on public.profiles (status);
create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_created_at_idx on public.profiles (created_at desc);
create index if not exists profiles_search_idx on public.profiles using gin (
  to_tsvector('simple', coalesce(full_name, '') || ' ' || coalesce(email, '') || ' ' || coalesce(location, ''))
);

drop policy if exists "profiles admin insert" on public.profiles;
drop policy if exists "profiles admin update" on public.profiles;
drop policy if exists "profiles self read" on public.profiles;
drop policy if exists "profiles self update" on public.profiles;
drop policy if exists "scan sessions self read" on public.scan_sessions;
drop policy if exists "scan sessions self insert" on public.scan_sessions;
drop policy if exists "submissions self read" on public.submissions;
drop policy if exists "submissions self insert" on public.submissions;
drop policy if exists "reward redemptions self read" on public.reward_redemptions;
drop policy if exists "reward redemptions self insert" on public.reward_redemptions;

grant update on public.profiles to authenticated;
grant update on public.profiles to service_role;

create or replace function private.is_admin_user(user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = user_id
      and role = 'admin'
      and status = 'active'
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select private.is_admin_user(auth.uid());
$$;

create or replace function private.is_active_user(user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = user_id
      and status = 'active'
  );
$$;

create or replace function private.prevent_profile_self_privilege_escalation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if private.is_admin_user(auth.uid())
    or coalesce(current_setting('request.jwt.claim.role', true), '') = 'service_role'
  then
    return new;
  end if;

  if old.id is distinct from new.id
    or old.email is distinct from new.email
    or old.role is distinct from new.role
    or old.status is distinct from new.status
    or old.points is distinct from new.points
    or old.trust_score is distinct from new.trust_score
    or old.created_at is distinct from new.created_at
  then
    raise exception 'Cannot update admin-managed profile fields';
  end if;

  return new;
end;
$$;

revoke all on function private.is_admin_user(uuid) from public;
revoke all on function private.is_active_user(uuid) from public;
revoke all on function private.prevent_profile_self_privilege_escalation() from public;

grant usage on schema private to authenticated, service_role;
grant execute on function private.is_admin_user(uuid) to authenticated, service_role;
grant execute on function private.is_active_user(uuid) to authenticated, service_role;

drop trigger if exists prevent_profile_self_privilege_escalation on public.profiles;
drop function if exists public.prevent_profile_self_privilege_escalation();

create trigger prevent_profile_self_privilege_escalation
  before update on public.profiles
  for each row execute function private.prevent_profile_self_privilege_escalation();

create policy "profiles admin insert" on public.profiles
  for insert
  with check (private.is_admin_user(auth.uid()));

create policy "profiles admin update" on public.profiles
  for update
  using (private.is_admin_user(auth.uid()))
  with check (private.is_admin_user(auth.uid()));

create policy "profiles self read" on public.profiles
  for select
  using (id = auth.uid() or private.is_admin_user(auth.uid()));

create policy "profiles self update" on public.profiles
  for update
  using (id = auth.uid() and private.is_active_user(auth.uid()))
  with check (id = auth.uid() and private.is_active_user(auth.uid()));

create policy "scan sessions self read" on public.scan_sessions
  for select
  using (user_id = auth.uid() or private.is_admin_user(auth.uid()));

create policy "scan sessions self insert" on public.scan_sessions
  for insert
  with check (user_id = auth.uid() and private.is_active_user(auth.uid()));

create policy "submissions self read" on public.submissions
  for select
  using (user_id = auth.uid() or private.is_admin_user(auth.uid()));

create policy "submissions self insert" on public.submissions
  for insert
  with check (user_id = auth.uid() and private.is_active_user(auth.uid()));

create policy "reward redemptions self read" on public.reward_redemptions
  for select
  using (user_id = auth.uid() or private.is_admin_user(auth.uid()));

create policy "reward redemptions self insert" on public.reward_redemptions
  for insert
  with check (user_id = auth.uid() and private.is_active_user(auth.uid()));

grant insert on public.profiles to authenticated;
