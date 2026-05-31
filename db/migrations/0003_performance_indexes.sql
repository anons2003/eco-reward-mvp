create index if not exists submissions_user_created_at_idx
  on public.submissions (user_id, created_at desc);

create index if not exists point_transactions_user_created_at_idx
  on public.point_transactions (user_id, created_at desc);

create index if not exists reward_redemptions_user_created_at_idx
  on public.reward_redemptions (user_id, created_at desc);

create index if not exists scan_sessions_user_created_at_idx
  on public.scan_sessions (user_id, created_at desc);

create index if not exists reward_items_active_points_required_idx
  on public.reward_items (active, points_required);
