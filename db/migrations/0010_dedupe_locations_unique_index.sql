with ranked_locations as (
  select
    id,
    first_value(id) over (partition by name, address order by created_at, id) as keep_id,
    row_number() over (partition by name, address order by created_at, id) as rank
  from public.locations
),
duplicates as (
  select id, keep_id
  from ranked_locations
  where rank > 1
)
update public.bins
set location_id = duplicates.keep_id
from duplicates
where public.bins.location_id = duplicates.id;

with ranked_locations as (
  select
    id,
    row_number() over (partition by name, address order by created_at, id) as rank
  from public.locations
)
delete from public.locations
using ranked_locations
where public.locations.id = ranked_locations.id
  and ranked_locations.rank > 1;

create unique index if not exists locations_name_address_unique_idx on public.locations(name, address);
