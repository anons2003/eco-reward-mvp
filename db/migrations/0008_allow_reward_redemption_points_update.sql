create or replace function private.prevent_profile_self_privilege_escalation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if private.is_admin_user(auth.uid())
    or auth.uid() is null
    or coalesce(auth.role(), '') = 'service_role'
    or coalesce(current_setting('request.jwt.claim.role', true), '') = 'service_role'
    or coalesce(current_setting('app.reward_redemption', true), '') = 'true'
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

revoke all on function private.prevent_profile_self_privilege_escalation() from public;

create or replace function private.redeem_reward(user_id uuid, reward_id uuid)
returns table (
  redemption_id uuid,
  reward_item_id uuid,
  points_spent integer,
  remaining_points integer,
  remaining_stock integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_reward public.reward_items%rowtype;
  selected_profile public.profiles%rowtype;
  new_redemption_id uuid;
begin
  if user_id is null then
    raise exception 'authentication_required';
  end if;

  select *
  into selected_reward
  from public.reward_items
  where id = reward_id
  for update;

  if not found or not selected_reward.active then
    raise exception 'reward_not_found';
  end if;

  if selected_reward.stock <= 0 then
    raise exception 'reward_out_of_stock';
  end if;

  select *
  into selected_profile
  from public.profiles
  where id = user_id
    and status = 'active'
  for update;

  if not found then
    raise exception 'profile_not_found';
  end if;

  if selected_profile.points < selected_reward.points_required then
    raise exception 'insufficient_points';
  end if;

  perform set_config('app.reward_redemption', 'true', true);

  update public.profiles
  set points = points - selected_reward.points_required
  where id = user_id
  returning points into remaining_points;

  update public.reward_items
  set stock = stock - 1
  where id = reward_id
  returning stock into remaining_stock;

  insert into public.reward_redemptions (user_id, reward_item_id, points_spent, status)
  values (user_id, reward_id, selected_reward.points_required, 'issued')
  returning id into new_redemption_id;

  insert into public.point_transactions (user_id, points, reason)
  values (user_id, -selected_reward.points_required, 'Đổi thưởng: ' || selected_reward.title);

  return query
  select new_redemption_id, reward_id, selected_reward.points_required, remaining_points, remaining_stock;
end;
$$;

revoke all on function private.redeem_reward(uuid, uuid) from public;
grant execute on function private.redeem_reward(uuid, uuid) to authenticated;
