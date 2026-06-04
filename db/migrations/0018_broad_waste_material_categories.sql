begin;

alter table public.point_rules
  drop constraint if exists point_rules_waste_type_check;

alter table public.point_rules
  add constraint point_rules_waste_type_check check (
    waste_type in (
      'plastic',
      'metal',
      'paper',
      'glass',
      'plastic_bottle',
      'metal_can',
      'cardboard',
      'glass_bottle',
      'organic',
      'hazardous',
      'unknown'
    )
  );

insert into public.point_rules (waste_type, points, active, updated_at)
select
  case legacy.waste_type
    when 'plastic_bottle' then 'plastic'
    when 'metal_can' then 'metal'
    when 'glass_bottle' then 'glass'
  end,
  legacy.points,
  true,
  now()
from public.point_rules as legacy
where legacy.waste_type in ('plastic_bottle', 'metal_can', 'glass_bottle')
on conflict (waste_type) do update
set
  points = excluded.points,
  active = excluded.active,
  updated_at = excluded.updated_at;

update public.point_rules
set
  active = false,
  updated_at = now()
where waste_type in (
  'plastic_bottle',
  'metal_can',
  'glass_bottle',
  'cardboard',
  'organic',
  'hazardous'
);

update public.submissions
set ai_result = jsonb_set(
  ai_result,
  '{wasteType}',
  to_jsonb(
    case ai_result ->> 'wasteType'
      when 'plastic_bottle' then 'plastic'
      when 'metal_can' then 'metal'
      when 'glass_bottle' then 'glass'
      when 'cardboard' then 'unknown'
      when 'organic' then 'unknown'
      when 'hazardous' then 'unknown'
    end
  ),
  false
)
where ai_result ->> 'wasteType' in ('plastic_bottle', 'metal_can', 'glass_bottle', 'cardboard', 'organic', 'hazardous');

commit;
