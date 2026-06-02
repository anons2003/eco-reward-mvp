with ranked_locations as (
  select
    id,
    first_value(id) over (
      partition by btrim(address)
      order by active desc, updated_at desc nulls last, created_at desc nulls last, id
    ) as keep_id
  from public.locations
),
duplicates as (
  select id, keep_id
  from ranked_locations
  where id <> keep_id
),
keepers as (
  select l.*
  from public.locations l
  join duplicates d on d.keep_id = l.id
)
update public.bins
set
  location_id = duplicates.keep_id,
  location_name = keepers.name,
  lat = keepers.lat,
  lng = keepers.lng
from duplicates
join keepers on keepers.id = duplicates.keep_id
where public.bins.location_id = duplicates.id;

with ranked_locations as (
  select
    id,
    first_value(id) over (
      partition by btrim(address)
      order by active desc, updated_at desc nulls last, created_at desc nulls last, id
    ) as keep_id
  from public.locations
)
delete from public.locations
using ranked_locations
where public.locations.id = ranked_locations.id
  and ranked_locations.id <> ranked_locations.keep_id;

drop index if exists locations_address_unique_idx;
create unique index if not exists locations_address_unique_idx on public.locations (address);
