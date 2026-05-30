create extension if not exists pgcrypto;

create type public.user_role as enum ('user', 'admin');
create type public.submission_status as enum ('approved', 'pending_review', 'rejected');

create schema if not exists private;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  role public.user_role not null default 'user',
  points integer not null default 0,
  trust_score integer not null default 80,
  created_at timestamptz not null default now()
);

create table public.bins (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  qr_code text not null unique,
  location_name text not null,
  lat double precision not null,
  lng double precision not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.scan_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  bin_id uuid not null references public.bins(id) on delete restrict,
  qr_code text not null,
  lat double precision,
  lng double precision,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  bin_id uuid not null references public.bins(id) on delete restrict,
  scan_session_id uuid not null references public.scan_sessions(id) on delete restrict,
  image_url text not null,
  ai_result jsonb not null default '{}'::jsonb,
  status public.submission_status not null default 'pending_review',
  points integer not null default 0,
  reason text not null default '',
  risk_flags text[] not null default '{}',
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.point_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  submission_id uuid references public.submissions(id) on delete set null,
  points integer not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create table public.reward_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  points_required integer not null,
  stock integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.reward_redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  reward_item_id uuid not null references public.reward_items(id) on delete restrict,
  points_spent integer not null,
  status text not null default 'issued',
  created_at timestamptz not null default now()
);

create table public.point_rules (
  waste_type text primary key check (
    waste_type in (
      'plastic_bottle',
      'metal_can',
      'paper',
      'cardboard',
      'glass_bottle',
      'organic',
      'hazardous',
      'unknown'
    )
  ),
  points integer not null check (points >= 0),
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.bins enable row level security;
alter table public.scan_sessions enable row level security;
alter table public.submissions enable row level security;
alter table public.point_transactions enable row level security;
alter table public.reward_items enable row level security;
alter table public.reward_redemptions enable row level security;
alter table public.point_rules enable row level security;
alter table public.audit_logs enable row level security;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    'user'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create policy "profiles self read" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles self update" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "bins readable" on public.bins for select using (active or public.is_admin());
create policy "bins admin write" on public.bins for all using (public.is_admin()) with check (public.is_admin());
create policy "scan sessions self read" on public.scan_sessions for select using (user_id = auth.uid() or public.is_admin());
create policy "scan sessions self insert" on public.scan_sessions for insert with check (user_id = auth.uid());
create policy "submissions self read" on public.submissions for select using (user_id = auth.uid() or public.is_admin());
create policy "submissions self insert" on public.submissions for insert with check (user_id = auth.uid());
create policy "submissions admin update" on public.submissions for update using (public.is_admin()) with check (public.is_admin());
create policy "points self read" on public.point_transactions for select using (user_id = auth.uid() or public.is_admin());
create policy "reward items readable" on public.reward_items for select using (active or public.is_admin());
create policy "reward redemptions self read" on public.reward_redemptions for select using (user_id = auth.uid() or public.is_admin());
create policy "reward redemptions self insert" on public.reward_redemptions for insert with check (user_id = auth.uid());
create policy "point rules readable" on public.point_rules for select using (active or public.is_admin());
create policy "point rules admin write" on public.point_rules for all using (public.is_admin()) with check (public.is_admin());
create policy "audit admin read" on public.audit_logs for select using (public.is_admin());
create policy "audit admin insert" on public.audit_logs for insert with check (public.is_admin());

grant usage on schema public to authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert on public.scan_sessions to authenticated;
grant select, insert, update on public.submissions to authenticated;
grant select on public.bins to authenticated;
grant select on public.point_transactions to authenticated;
grant select on public.reward_items to authenticated;
grant select, insert on public.reward_redemptions to authenticated;
grant select on public.point_rules to authenticated;
grant select, insert on public.audit_logs to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'waste-submissions',
  'waste-submissions',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "submission images user upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'waste-submissions' and owner = auth.uid());

create policy "submission images owner or admin read" on storage.objects
  for select to authenticated
  using (bucket_id = 'waste-submissions' and (owner = auth.uid() or public.is_admin()));

create policy "submission images owner or admin update" on storage.objects
  for update to authenticated
  using (bucket_id = 'waste-submissions' and (owner = auth.uid() or public.is_admin()))
  with check (bucket_id = 'waste-submissions' and (owner = auth.uid() or public.is_admin()));

insert into public.bins (name, qr_code, location_name, lat, lng, active) values
  ('Thùng rác thông minh A1', 'ECO-BIN-A1', 'Sảnh chính tòa nhà A', 10.7769, 106.7009, true),
  ('Thùng rác thông minh B2', 'ECO-BIN-B2', 'Khu cafeteria', 10.7772, 106.7012, true),
  ('Thùng bảo trì C3', 'ECO-BIN-C3', 'Bãi xe tầng hầm', 10.7758, 106.6998, false);

insert into public.reward_items (title, description, points_required, stock) values
  ('Voucher cà phê xanh', 'Đổi điểm lấy một voucher đồ uống tại quầy cafeteria.', 120, 24),
  ('Góp cây cho khuôn viên', 'Đóng góp điểm vào quỹ cây xanh của chiến dịch.', 80, 99);

insert into public.point_rules (waste_type, points, active) values
  ('plastic_bottle', 10, true),
  ('metal_can', 12, true),
  ('paper', 6, true),
  ('cardboard', 8, true),
  ('glass_bottle', 9, true),
  ('organic', 5, true),
  ('hazardous', 0, true),
  ('unknown', 0, true)
on conflict (waste_type) do update set
  points = excluded.points,
  active = excluded.active,
  updated_at = now();
