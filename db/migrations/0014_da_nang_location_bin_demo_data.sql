with location_payload(name, address, district, ward, lat, lng, active) as (
  values
    ('Chợ Hàn', '119 Trần Phú, Hải Châu, Đà Nẵng', 'Hải Châu', 'Hải Châu 1', 16.0681, 108.2247, true),
    ('Cầu Rồng', 'Cầu Rồng, Hải Châu, Đà Nẵng', 'Hải Châu', 'An Hải Tây', 16.0612, 108.2278, true),
    ('Công viên Biển Đông', 'Võ Nguyên Giáp, Sơn Trà, Đà Nẵng', 'Sơn Trà', 'Phước Mỹ', 16.0732, 108.2458, true),
    ('Bãi biển Mỹ Khê', 'Mỹ Khê, Sơn Trà, Đà Nẵng', 'Sơn Trà', 'Phước Mỹ', 16.0544, 108.2477, true),
    ('Công viên APEC', 'Bạch Đằng, Hải Châu, Đà Nẵng', 'Hải Châu', 'Bình Hiên', 16.0598, 108.2231, true),
    ('Helio Center', 'Đường 2 Tháng 9, Hải Châu, Đà Nẵng', 'Hải Châu', 'Hòa Cường Bắc', 16.0398, 108.2261, true),
    ('Bến xe Trung tâm Đà Nẵng', '201 Tôn Đức Thắng, Liên Chiểu, Đà Nẵng', 'Liên Chiểu', 'Hòa Minh', 16.0718, 108.1502, true),
    ('Chợ Cồn', '290 Hùng Vương, Hải Châu, Đà Nẵng', 'Hải Châu', 'Vĩnh Trung', 16.0687, 108.2148, true)
),
upserted_locations as (
  insert into public.locations (name, address, district, ward, lat, lng, active)
  select name, address, district, ward, lat, lng, active
  from location_payload
  on conflict (address) do update set
    name = excluded.name,
    district = excluded.district,
    ward = excluded.ward,
    lat = excluded.lat,
    lng = excluded.lng,
    active = excluded.active,
    updated_at = now()
  returning id, name, address, lat, lng
),
bin_payload(name, qr_code, address, active) as (
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
  upserted_locations.id,
  upserted_locations.name,
  upserted_locations.lat,
  upserted_locations.lng,
  bin_payload.active
from bin_payload
join upserted_locations on upserted_locations.address = bin_payload.address
on conflict (qr_code) do update set
  name = excluded.name,
  location_id = excluded.location_id,
  location_name = excluded.location_name,
  lat = excluded.lat,
  lng = excluded.lng,
  active = excluded.active;
