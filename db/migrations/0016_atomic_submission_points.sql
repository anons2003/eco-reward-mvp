create or replace function private.create_submission_with_points(
  p_user_id uuid,
  p_scan_session_id uuid,
  p_image_url text,
  p_ai_result jsonb,
  p_status public.submission_status,
  p_points integer,
  p_reason text,
  p_risk_flags text[],
  p_reviewed_at timestamptz
)
returns table (
  submission_id uuid
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_session public.scan_sessions%rowtype;
  new_submission_id uuid;
begin
  if p_user_id is null then
    raise exception 'authentication_required';
  end if;

  if p_scan_session_id is null or nullif(trim(p_image_url), '') is null then
    raise exception 'invalid_submission_payload';
  end if;

  if p_points < 0 then
    raise exception 'invalid_submission_points';
  end if;

  if p_status is distinct from 'approved'::public.submission_status and p_points > 0 then
    raise exception 'points_require_approved_submission';
  end if;

  select *
  into selected_session
  from public.scan_sessions
  where id = p_scan_session_id
    and user_id = p_user_id
  for update;

  if not found then
    raise exception 'scan_session_not_found';
  end if;

  if selected_session.expires_at <= now() then
    raise exception 'scan_session_expired';
  end if;

  insert into public.submissions (
    user_id,
    bin_id,
    scan_session_id,
    image_url,
    ai_result,
    status,
    points,
    reason,
    risk_flags,
    reviewed_at
  )
  values (
    p_user_id,
    selected_session.bin_id,
    selected_session.id,
    p_image_url,
    p_ai_result,
    p_status,
    p_points,
    p_reason,
    coalesce(p_risk_flags, '{}'::text[]),
    p_reviewed_at
  )
  returning id into new_submission_id;

  if p_status = 'approved'::public.submission_status and p_points > 0 then
    perform 1
    from public.profiles
    where id = p_user_id
      and status = 'active'
    for update;

    if not found then
      raise exception 'profile_not_found';
    end if;

    perform set_config('app.reward_redemption', 'true', true);

    update public.profiles
    set points = points + p_points
    where id = p_user_id;

    insert into public.point_transactions (user_id, submission_id, points, reason)
    values (p_user_id, new_submission_id, p_points, p_reason);
  end if;

  return query
  select new_submission_id;
end;
$$;

revoke all on function private.create_submission_with_points(
  uuid,
  uuid,
  text,
  jsonb,
  public.submission_status,
  integer,
  text,
  text[],
  timestamptz
) from public;

grant execute on function private.create_submission_with_points(
  uuid,
  uuid,
  text,
  jsonb,
  public.submission_status,
  integer,
  text,
  text[],
  timestamptz
) to authenticated;

create or replace function public.create_submission_with_points(
  scan_session_id uuid,
  image_url text,
  ai_result jsonb,
  status public.submission_status,
  points integer,
  reason text,
  risk_flags text[],
  reviewed_at timestamptz
)
returns table (
  submission_id uuid
)
language sql
security invoker
set search_path = ''
as $$
  select *
  from private.create_submission_with_points(
    auth.uid(),
    scan_session_id,
    image_url,
    ai_result,
    status,
    points,
    reason,
    risk_flags,
    reviewed_at
  );
$$;

grant execute on function public.create_submission_with_points(
  uuid,
  text,
  jsonb,
  public.submission_status,
  integer,
  text,
  text[],
  timestamptz
) to authenticated;
