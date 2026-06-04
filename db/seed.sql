-- Demo users for local Supabase development.
-- Password for both accounts: EcoReward123!

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  email_change,
  email_change_token_new,
  email_change_token_current,
  phone_change,
  phone_change_token,
  reauthentication_token,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '55555555-5555-5555-5555-555555555555',
    'authenticated',
    'authenticated',
    'anons2003+eco-user@gmail.com',
    crypt('EcoReward123!', gen_salt('bf', 10)),
    now(),
    encode(gen_random_bytes(32), 'hex'),
    now(),
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"sub":"55555555-5555-5555-5555-555555555555","email":"anons2003+eco-user@gmail.com","full_name":"Demo User","email_verified":true,"phone_verified":false}'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '66666666-6666-6666-6666-666666666666',
    'authenticated',
    'authenticated',
    'anons2003+eco-admin@gmail.com',
    crypt('EcoReward123!', gen_salt('bf', 10)),
    now(),
    encode(gen_random_bytes(32), 'hex'),
    now(),
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"sub":"66666666-6666-6666-6666-666666666666","email":"anons2003+eco-admin@gmail.com","full_name":"Demo Admin","email_verified":true,"phone_verified":false}'::jsonb
  )
on conflict (id) do update set
  email = excluded.email,
  encrypted_password = excluded.encrypted_password,
  email_confirmed_at = excluded.email_confirmed_at,
  updated_at = now(),
  raw_app_meta_data = excluded.raw_app_meta_data,
  raw_user_meta_data = excluded.raw_user_meta_data;

insert into public.profiles (id, email, full_name, role, points, trust_score)
values
  ('55555555-5555-5555-5555-555555555555', 'anons2003+eco-user@gmail.com', 'Demo User', 'user', 42, 82),
  ('66666666-6666-6666-6666-666666666666', 'anons2003+eco-admin@gmail.com', 'Demo Admin', 'admin', 0, 100)
on conflict (id) do update set
  email = excluded.email,
  full_name = excluded.full_name,
  role = excluded.role,
  points = excluded.points,
  trust_score = excluded.trust_score;

insert into public.locations (name, address, district, ward, lat, lng, active)
values
  ('Chợ Hàn', '119 Trần Phú, Hải Châu, Đà Nẵng', 'Hải Châu', 'Hải Châu 1', 16.0681, 108.2247, true),
  ('Cầu Rồng', 'Cầu Rồng, Hải Châu, Đà Nẵng', 'Hải Châu', 'An Hải Tây', 16.0612, 108.2278, true),
  ('Công viên Biển Đông', 'Võ Nguyên Giáp, Sơn Trà, Đà Nẵng', 'Sơn Trà', 'Phước Mỹ', 16.0732, 108.2458, true),
  ('Bãi biển Mỹ Khê', 'Mỹ Khê, Sơn Trà, Đà Nẵng', 'Sơn Trà', 'Phước Mỹ', 16.0544, 108.2477, true),
  ('Công viên APEC', 'Bạch Đằng, Hải Châu, Đà Nẵng', 'Hải Châu', 'Bình Hiên', 16.0598, 108.2231, true),
  ('Helio Center', 'Đường 2 Tháng 9, Hải Châu, Đà Nẵng', 'Hải Châu', 'Hòa Cường Bắc', 16.0398, 108.2261, true),
  ('Bến xe Trung tâm Đà Nẵng', '201 Tôn Đức Thắng, Liên Chiểu, Đà Nẵng', 'Liên Chiểu', 'Hòa Minh', 16.0718, 108.1502, true),
  ('Chợ Cồn', '290 Hùng Vương, Hải Châu, Đà Nẵng', 'Hải Châu', 'Vĩnh Trung', 16.0687, 108.2148, true)
on conflict (address) do update set
  name = excluded.name,
  district = excluded.district,
  ward = excluded.ward,
  lat = excluded.lat,
  lng = excluded.lng,
  active = excluded.active,
  updated_at = now();

with bin_payload(name, qr_code, address, active) as (
  values
    ('Thùng Chợ Hàn cổng Trần Phú', 'SEATECH-DN-HAN-01', '119 Trần Phú, Hải Châu, Đà Nẵng', true),
    ('Thùng Chợ Hàn khu ẩm thực', 'SEATECH-DN-HAN-02', '119 Trần Phú, Hải Châu, Đà Nẵng', true),
    ('Thùng Cầu Rồng bờ Tây', 'SEATECH-DN-DRAGON-01', 'Cầu Rồng, Hải Châu, Đà Nẵng', true),
    ('Thùng Cầu Rồng bờ Đông', 'SEATECH-DN-DRAGON-02', 'Cầu Rồng, Hải Châu, Đà Nẵng', true),
    ('Thùng Công viên Biển Đông', 'SEATECH-DN-BIENDONG-01', 'Võ Nguyên Giáp, Sơn Trà, Đà Nẵng', true),
    ('Thùng Mỹ Khê lối xuống biển', 'SEATECH-DN-MYKHE-01', 'Mỹ Khê, Sơn Trà, Đà Nẵng', true),
    ('Thùng APEC ven sông', 'SEATECH-DN-APEC-01', 'Bạch Đằng, Hải Châu, Đà Nẵng', true),
    ('Thùng APEC khu quảng trường', 'SEATECH-DN-APEC-02', 'Bạch Đằng, Hải Châu, Đà Nẵng', true),
    ('Thùng APEC khu sự kiện', 'SEATECH-DN-APEC-03', 'Bạch Đằng, Hải Châu, Đà Nẵng', false),
    ('Thùng Helio cổng chính', 'SEATECH-DN-HELIO-01', 'Đường 2 Tháng 9, Hải Châu, Đà Nẵng', true),
    ('Thùng Bến xe Đà Nẵng', 'SEATECH-DN-BENXE-01', '201 Tôn Đức Thắng, Liên Chiểu, Đà Nẵng', true),
    ('Thùng Chợ Cồn', 'SEATECH-DN-CHOCON-01', '290 Hùng Vương, Hải Châu, Đà Nẵng', true)
)
insert into public.bins (name, qr_code, location_id, location_name, lat, lng, active)
select
  bin_payload.name,
  bin_payload.qr_code,
  locations.id,
  locations.name,
  locations.lat,
  locations.lng,
  bin_payload.active
from bin_payload
join public.locations on locations.address = bin_payload.address
on conflict (qr_code) do update set
  name = excluded.name,
  location_id = excluded.location_id,
  location_name = excluded.location_name,
  lat = excluded.lat,
  lng = excluded.lng,
  active = excluded.active;

insert into auth.identities (
  id,
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
values
  (
    gen_random_uuid(),
    '55555555-5555-5555-5555-555555555555',
    '55555555-5555-5555-5555-555555555555',
    '{"sub":"55555555-5555-5555-5555-555555555555","email":"anons2003+eco-user@gmail.com","full_name":"Demo User","email_verified":true,"phone_verified":false}'::jsonb,
    'email',
    now(),
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    '66666666-6666-6666-6666-666666666666',
    '66666666-6666-6666-6666-666666666666',
    '{"sub":"66666666-6666-6666-6666-666666666666","email":"anons2003+eco-admin@gmail.com","full_name":"Demo Admin","email_verified":true,"phone_verified":false}'::jsonb,
    'email',
    now(),
    now(),
    now()
  )
on conflict (provider_id, provider) do update set
  user_id = excluded.user_id,
  identity_data = excluded.identity_data,
  updated_at = now();

with demo_bin as (
  select id from public.bins where qr_code = 'ECO-BIN-A1'
),
demo_session as (
  insert into public.scan_sessions (
    id,
    user_id,
    bin_id,
    qr_code,
    lat,
    lng,
    expires_at,
    created_at
  )
  select
    '33333333-3333-3333-3333-333333333333',
    '55555555-5555-5555-5555-555555555555',
    demo_bin.id,
    'ECO-BIN-A1',
    10.7769,
    106.7009,
    now() + interval '120 seconds',
    now()
  from demo_bin
  on conflict (id) do update set
    expires_at = excluded.expires_at,
    created_at = excluded.created_at
  returning id, bin_id
),
demo_submission as (
  insert into public.submissions (
    id,
    user_id,
    bin_id,
    scan_session_id,
    image_url,
    ai_result,
    status,
    points,
    reason,
    risk_flags,
    reviewed_at,
    reviewed_by,
    created_at
  )
  select
    '44444444-4444-4444-4444-444444444444',
    '55555555-5555-5555-5555-555555555555',
    demo_session.bin_id,
    demo_session.id,
    '/demo/plastic-bottle.svg',
    '{"wasteType":"plastic","confidence":0.91,"objectCount":1,"imageQuality":"good","notes":"Seed demo result"}'::jsonb,
    'approved',
    10,
    'AI confidence met MVP threshold.',
    '{}'::text[],
    now(),
    '66666666-6666-6666-6666-666666666666',
    now()
  from demo_session
  on conflict (id) do update set
    status = excluded.status,
    points = excluded.points,
    reason = excluded.reason,
    reviewed_at = excluded.reviewed_at,
    reviewed_by = excluded.reviewed_by
  returning id
)
insert into public.point_transactions (id, user_id, submission_id, points, reason, created_at)
select
  '77777777-7777-7777-7777-777777777777',
  '55555555-5555-5555-5555-555555555555',
  demo_submission.id,
  10,
  'Seed approved submission reward.',
  now()
from demo_submission
on conflict (id) do update set
  points = excluded.points,
  reason = excluded.reason,
  created_at = excluded.created_at;
