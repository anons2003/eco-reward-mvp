create extension if not exists postgis with schema public;

create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  district text,
  ward text,
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),
  geography geography(Point, 4326) generated always as (st_setsrid(st_makepoint(lng, lat), 4326)::geography) stored,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.bins
  add column if not exists location_id uuid references public.locations(id) on delete set null;

create index if not exists locations_geography_idx on public.locations using gist (geography);
create index if not exists locations_active_idx on public.locations(active);
create index if not exists bins_location_id_idx on public.bins(location_id);
create unique index if not exists locations_name_address_unique_idx on public.locations(name, address);

alter table public.locations enable row level security;

drop policy if exists "locations readable" on public.locations;
drop policy if exists "locations admin write" on public.locations;
drop policy if exists "locations admin insert" on public.locations;
drop policy if exists "locations admin update" on public.locations;
drop policy if exists "locations admin delete" on public.locations;
drop policy if exists "Admins can read locations" on public.locations;
drop policy if exists "Admins can write locations" on public.locations;
drop policy if exists "Authenticated users can read active locations" on public.locations;

create policy "locations readable"
on public.locations
for select
to authenticated
using (active or public.is_admin());

create policy "locations admin write"
on public.locations
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

grant select on public.locations to authenticated;

create or replace view public.admin_location_summary
with (security_invoker = true) as
select
  l.id,
  l.name,
  l.address,
  l.district,
  l.ward,
  l.lat,
  l.lng,
  l.active,
  l.created_at,
  l.updated_at,
  count(b.id)::integer as bin_count,
  count(b.id) filter (where b.active)::integer as active_bin_count
from public.locations l
left join public.bins b on b.location_id = l.id
group by l.id;

grant select on public.admin_location_summary to authenticated;

insert into public.locations (name, address, district, ward, lat, lng, active)
values
  ('Chung cư Vinhomes Central Park', '208 Nguyễn Hữu Cảnh', 'Quận Bình Thạnh', 'Phường 22', 10.7947, 106.7218, true),
  ('Công viên Tao Đàn', 'Trương Định', 'Quận 1', 'Phường Bến Thành', 10.7757, 106.6921, true),
  ('Đại học Bách Khoa TP.HCM', '268 Lý Thường Kiệt', 'Quận 10', 'Phường 14', 10.7725, 106.6579, true)
on conflict (name, address) do update set
  district = excluded.district,
  ward = excluded.ward,
  lat = excluded.lat,
  lng = excluded.lng,
  active = excluded.active,
  updated_at = now();

update public.bins
set
  location_id = locations.id,
  location_name = locations.name,
  lat = locations.lat,
  lng = locations.lng
from public.locations
where public.bins.qr_code = 'ECO-BIN-A1'
  and locations.name = 'Chung cư Vinhomes Central Park';

update public.bins
set
  location_id = locations.id,
  location_name = locations.name,
  lat = locations.lat,
  lng = locations.lng
from public.locations
where public.bins.qr_code = 'ECO-BIN-B2'
  and locations.name = 'Công viên Tao Đàn';

update public.bins
set
  location_id = locations.id,
  location_name = locations.name,
  lat = locations.lat,
  lng = locations.lng
from public.locations
where public.bins.qr_code = 'ECO-BIN-C3'
  and locations.name = 'Đại học Bách Khoa TP.HCM';
