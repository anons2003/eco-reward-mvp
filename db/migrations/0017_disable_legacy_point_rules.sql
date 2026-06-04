update public.point_rules
set active = false,
    updated_at = now()
where waste_type in ('cardboard', 'organic', 'hazardous');
