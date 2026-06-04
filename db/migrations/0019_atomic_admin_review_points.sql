create or replace function private.review_submission_with_points(
  p_admin_id uuid,
  p_submission_id uuid,
  p_decision public.submission_status,
  p_reason text
)
returns table (
  submission_id uuid,
  user_id uuid,
  status public.submission_status,
  points integer,
  reason text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  admin_profile public.profiles%rowtype;
  selected_submission public.submissions%rowtype;
  canonical_waste_type text;
  resolved_points integer := 0;
  old_awarded_points integer := 0;
  new_awarded_points integer := 0;
  points_delta integer := 0;
begin
  if p_admin_id is null or p_submission_id is null or nullif(trim(p_reason), '') is null then
    raise exception 'invalid_review_payload';
  end if;

  if p_decision not in ('approved'::public.submission_status, 'rejected'::public.submission_status) then
    raise exception 'invalid_review_decision';
  end if;

  select *
  into admin_profile
  from public.profiles
  where id = p_admin_id
    and role = 'admin'
    and status = 'active';

  if not found then
    raise exception 'admin_profile_not_found';
  end if;

  select *
  into selected_submission
  from public.submissions
  where id = p_submission_id
  for update;

  if not found then
    raise exception 'submission_not_found';
  end if;

  if selected_submission.status = 'approved'::public.submission_status then
    old_awarded_points := selected_submission.points;
  end if;

  if p_decision = 'approved'::public.submission_status then
    if selected_submission.points > 0 then
      resolved_points := selected_submission.points;
    else
      canonical_waste_type := coalesce(
        selected_submission.ai_result ->> 'wasteType',
        selected_submission.ai_result ->> 'waste_type',
        'unknown'
      );

      canonical_waste_type := case canonical_waste_type
        when 'plastic_bottle' then 'plastic'
        when 'metal_can' then 'metal'
        when 'glass_bottle' then 'glass'
        when 'cardboard' then 'unknown'
        when 'organic' then 'unknown'
        when 'hazardous' then 'unknown'
        else canonical_waste_type
      end;

      select coalesce(point_rules.points, 0)
      into resolved_points
      from public.point_rules
      where waste_type = canonical_waste_type
        and active = true;

      resolved_points := coalesce(resolved_points, 0);
    end if;
  end if;

  if p_decision = 'approved'::public.submission_status then
    new_awarded_points := resolved_points;
  end if;

  points_delta := new_awarded_points - old_awarded_points;

  if points_delta <> 0 then
    perform 1
    from public.profiles
    where id = selected_submission.user_id
      and status = 'active'
    for update;

    if not found then
      raise exception 'profile_not_found';
    end if;

    perform set_config('app.reward_redemption', 'true', true);

    update public.profiles
    set points = points + points_delta
    where id = selected_submission.user_id;

    insert into public.point_transactions (user_id, submission_id, points, reason)
    values (selected_submission.user_id, selected_submission.id, points_delta, p_reason);
  end if;

  update public.submissions
  set
    status = p_decision,
    reason = trim(p_reason),
    reviewed_at = now(),
    reviewed_by = p_admin_id,
    points = new_awarded_points
  where id = selected_submission.id
  returning
    public.submissions.id,
    public.submissions.user_id,
    public.submissions.status,
    public.submissions.points,
    public.submissions.reason
  into
    submission_id,
    user_id,
    status,
    points,
    reason;

  insert into public.audit_logs (actor_id, action, target_id, metadata)
  values (
    p_admin_id,
    'admin.submission.review',
    p_submission_id,
    jsonb_build_object(
      'decision', p_decision,
      'points', new_awarded_points,
      'points_delta', points_delta
    )
  );

  return next;
end;
$$;

revoke all on function private.review_submission_with_points(
  uuid,
  uuid,
  public.submission_status,
  text
) from public;

grant execute on function private.review_submission_with_points(
  uuid,
  uuid,
  public.submission_status,
  text
) to authenticated;

create or replace function public.review_submission_with_points(
  p_admin_id uuid,
  p_submission_id uuid,
  p_decision public.submission_status,
  p_reason text
)
returns table (
  submission_id uuid,
  user_id uuid,
  status public.submission_status,
  points integer,
  reason text
)
language sql
security invoker
set search_path = ''
as $$
  select *
  from private.review_submission_with_points(
    p_admin_id,
    p_submission_id,
    p_decision,
    p_reason
  );
$$;

grant execute on function public.review_submission_with_points(
  uuid,
  uuid,
  public.submission_status,
  text
) to authenticated;
