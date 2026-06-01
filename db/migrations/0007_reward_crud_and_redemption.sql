alter table public.reward_items
  add column if not exists category text not null default 'Voucher',
  add column if not exists partner text not null default 'SeaTech',
  add column if not exists image_url text,
  add column if not exists expires_at date;

alter table public.reward_items
  drop constraint if exists reward_items_category_check;

alter table public.reward_items
  add constraint reward_items_category_check
  check (category in ('Voucher', 'Quà tặng', 'Đóng góp', 'Dịch vụ'));

create index if not exists reward_items_active_created_idx on public.reward_items (active, created_at desc);
create index if not exists reward_redemptions_user_created_idx on public.reward_redemptions (user_id, created_at desc);

drop policy if exists "reward items admin write" on public.reward_items;
drop policy if exists "reward redemptions admin update" on public.reward_redemptions;

create policy "reward items admin write" on public.reward_items
  for all
  using (private.is_admin_user(auth.uid()))
  with check (private.is_admin_user(auth.uid()));

create policy "reward redemptions admin update" on public.reward_redemptions
  for update
  using (private.is_admin_user(auth.uid()))
  with check (private.is_admin_user(auth.uid()));

grant insert, update on public.reward_items to authenticated;
grant update on public.reward_redemptions to authenticated;

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

create or replace function public.redeem_reward(reward_id uuid)
returns table (
  redemption_id uuid,
  reward_item_id uuid,
  points_spent integer,
  remaining_points integer,
  remaining_stock integer
)
language sql
security invoker
set search_path = ''
as $$
  select *
  from private.redeem_reward(auth.uid(), reward_id);
$$;

grant execute on function public.redeem_reward(uuid) to authenticated;
