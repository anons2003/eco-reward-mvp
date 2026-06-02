alter table public.locations
  alter column district drop not null,
  alter column ward drop not null;
