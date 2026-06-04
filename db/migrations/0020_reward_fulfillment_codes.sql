alter table public.reward_redemptions
  add column if not exists redemption_code text,
  add column if not exists fulfilled_at timestamptz;

update public.reward_redemptions
set redemption_code = 'ST-' || upper(substr(replace(id::text, '-', ''), 1, 10))
where redemption_code is null;

alter table public.reward_redemptions
  alter column redemption_code set not null;

create unique index if not exists reward_redemptions_redemption_code_key
  on public.reward_redemptions (redemption_code);

drop function if exists public.redeem_reward(uuid);
drop function if exists private.redeem_reward(uuid, uuid);

create or replace function private.redeem_reward(user_id uuid, reward_id uuid)
returns table (
  redemption_id uuid,
  reward_item_id uuid,
  points_spent integer,
  remaining_points integer,
  remaining_stock integer,
  redemption_code text,
  redemption_status text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_reward public.reward_items%rowtype;
  selected_profile public.profiles%rowtype;
  new_redemption_id uuid;
  new_redemption_code text;
  attempt integer := 0;
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

  loop
    attempt := attempt + 1;
    new_redemption_code := 'ST-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));

    begin
      insert into public.reward_redemptions (user_id, reward_item_id, points_spent, status, redemption_code)
      values (user_id, reward_id, selected_reward.points_required, 'issued', new_redemption_code)
      returning id, public.reward_redemptions.redemption_code into new_redemption_id, new_redemption_code;
      exit;
    exception
      when unique_violation then
        if attempt >= 5 then
          raise;
        end if;
    end;
  end loop;

  insert into public.point_transactions (user_id, points, reason)
  values (user_id, -selected_reward.points_required, 'Đổi thưởng: ' || selected_reward.title || ' • Mã ' || new_redemption_code);

  return query
  select new_redemption_id, reward_id, selected_reward.points_required, remaining_points, remaining_stock, new_redemption_code, 'issued'::text;
end;
$$;

revoke all on function private.redeem_reward(uuid, uuid) from public;
grant execute on function private.redeem_reward(uuid, uuid) to authenticated;

create or replace function public.redeem_reward(reward_id uuid)
returns table (
  redemption_id uuid,
  reward_item_id uuid,
  points_spent integer,
  remaining_points integer,
  remaining_stock integer,
  redemption_code text,
  redemption_status text
)
language sql
security invoker
set search_path = ''
as $$
  select *
  from private.redeem_reward(auth.uid(), reward_id);
$$;

grant execute on function public.redeem_reward(uuid) to authenticated;
