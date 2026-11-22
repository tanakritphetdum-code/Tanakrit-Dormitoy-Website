-- ==============================================================================
-- TANAKRIT DORMITORY — RLS POLICIES & SEED DATA (RUN THIS IN SUPABASE SQL EDITOR)
-- ==============================================================================

-- 1. สร้างนโยบายความปลอดภัย (RLS Policies) อนุญาตให้เว็บเข้าถึงข้อมูลได้
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access rooms" ON public.rooms;
CREATE POLICY "Public access rooms" ON public.rooms FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access tenants" ON public.tenants;
CREATE POLICY "Public access tenants" ON public.tenants FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE public.meter_readings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access meter_readings" ON public.meter_readings;
CREATE POLICY "Public access meter_readings" ON public.meter_readings FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE public.maintenance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access maintenance" ON public.maintenance;
CREATE POLICY "Public access maintenance" ON public.maintenance FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE public.parcels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access parcels" ON public.parcels;
CREATE POLICY "Public access parcels" ON public.parcels FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access announcements" ON public.announcements;
CREATE POLICY "Public access announcements" ON public.announcements FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access settings" ON public.settings;
CREATE POLICY "Public access settings" ON public.settings FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access users" ON public.users;
CREATE POLICY "Public access users" ON public.users FOR ALL TO public USING (true) WITH CHECK (true);

-- 2. ข้อมูลห้องพัก 24 ห้อง (ชั้น 1-3)
INSERT INTO public.rooms (id, room_number, floor, type, price, status, tenant_name, tenant_phone) VALUES
('R101', '101', 1, 'Standard Air', 3500, 'occupied', 'นายกิตติภูมิ รักษ์ดี', '081-111-2233'),
('R102', '102', 1, 'Standard Air', 3500, 'occupied', 'น.ส.วิภาดา สมบูรณ์', '082-222-3344'),
('R103', '103', 1, 'Deluxe Corner', 4200, 'vacant', '', ''),
('R104', '104', 1, 'Standard Air', 3500, 'occupied', 'นายภาณุพงศ์ ทองแท้', '083-333-4455'),
('R105', '105', 1, 'Standard Fan', 2800, 'occupied', 'น.ส.กมลวรรณ ชัยเจริญ', '084-444-5566'),
('R106', '106', 1, 'Standard Fan', 2800, 'maintenance', '', ''),
('R107', '107', 1, 'Standard Air', 3500, 'occupied', 'นายธนาธิป สุวรรณ', '085-555-6677'),
('R108', '108', 1, 'Deluxe Corner', 4200, 'vacant', '', ''),

('R201', '201', 2, 'Standard Air', 3600, 'occupied', 'ณัฐพล ใจดี', '081-234-5678'),
('R202', '202', 2, 'Standard Air', 3600, 'occupied', 'น.ส.สุดารัตน์ พรหมดี', '087-777-8899'),
('R203', '203', 2, 'Deluxe Corner', 4300, 'occupied', 'นายวรพจน์ มณีรัตน์', '088-888-9900'),
('R204', '204', 2, 'Standard Air', 3600, 'vacant', '', ''),
('R205', '205', 2, 'Standard Fan', 2900, 'occupied', 'น.ส.พิมพ์ชนก แสนสุข', '089-999-0011'),
('R206', '206', 2, 'Standard Fan', 2900, 'occupied', 'นายอดิศร วงศ์ษา', '090-000-1122'),
('R207', '207', 2, 'Standard Air', 3600, 'occupied', 'น.ส.ธัญญารัตน์ บุญมา', '091-111-2233'),
('R208', '208', 2, 'Deluxe Corner', 4300, 'occupied', 'นายธีรภัทร ชาญวิทย์', '092-222-3344'),

('R301', '301', 3, 'Standard Air', 3700, 'occupied', 'น.ส.เบญจมาศ สายทอง', '093-333-4455'),
('R302', '302', 3, 'Standard Air', 3700, 'occupied', 'นายสมชาย ธนกฤษฎ์', '089-123-4567'),
('R303', '303', 3, 'Deluxe Corner', 4400, 'vacant', '', ''),
('R304', '304', 3, 'Standard Air', 3700, 'occupied', 'นายเกริกเกียรติ ยิ่งยง', '095-555-6677'),
('R305', '305', 3, 'Standard Fan', 3000, 'occupied', 'น.ส.วรรณวิมล เพียรชอบ', '096-666-7788'),
('R306', '306', 3, 'Standard Fan', 3000, 'occupied', 'นายศักดิ์ดา รุ่งอรุณ', '097-777-8899'),
('R307', '307', 3, 'Standard Air', 3700, 'vacant', '', ''),
('R308', '308', 3, 'Deluxe Corner', 4400, 'occupied', 'น.ส.อารียา คงมั่น', '098-888-9900')
ON CONFLICT (id) DO NOTHING;

-- 3. ทะเบียนผู้พักอาศัย
INSERT INTO public.tenants (id, tenant_id, name, room, phone, email, check_in, role) VALUES
('T-1001', '6512345', 'นายสมชาย ธนกฤษฎ์', '302', '089-123-4567', 'somchai@student.tanakrit.com', '2026-06-01', 'student'),
('T-1002', '6512346', 'ณัฐพล ใจดี', '201', '081-234-5678', 'nattapon.j@student.tanakrit.com', '2026-06-01', 'student'),
('T-1003', '6512347', 'นายกิตติภูมิ รักษ์ดี', '101', '081-111-2233', 'kittiphum@student.tanakrit.com', '2026-06-15', 'student'),
('T-1004', '6512348', 'น.ส.วิภาดา สมบูรณ์', '102', '082-222-3344', 'wiphada@student.tanakrit.com', '2026-06-10', 'student'),
('T-1005', '6512349', 'นายภาณุพงศ์ ทองแท้', '104', '083-333-4455', 'panupong@student.tanakrit.com', '2026-07-01', 'student'),
('T-1006', '6512350', 'น.ส.กมลวรรณ ชัยเจริญ', '105', '084-444-5566', 'kamolwan@student.tanakrit.com', '2026-07-05', 'student'),
('T-1007', '6512351', 'นายวรพจน์ มณีรัตน์', '203', '088-888-9900', 'worapoj@student.tanakrit.com', '2026-06-01', 'student'),
('T-1008', '6512352', 'น.ส.เบญจมาศ สายทอง', '301', '093-333-4455', 'benjamas@student.tanakrit.com', '2026-06-01', 'student')
ON CONFLICT (id) DO NOTHING;

-- 4. บันทึกมิเตอร์และบิล
INSERT INTO public.meter_readings (id, room_number, tenant_name, billing_month, month_label, room_price, prev_water, curr_water, water_unit, water_rate, water_total, prev_electric, curr_electric, electric_unit, electric_rate, electric_total, common_fee, total_price, status, due_date) VALUES
('INV-202610-302', '302', 'นายสมชาย ธนกฤษฎ์', '2026-10', 'ตุลาคม 2569', 3700, 142, 147, 5, 18, 90, 830, 875, 45, 8, 360, 100, 4250, 'pending', '2026-11-05'),
('INV-202610-201', '201', 'ณัฐพล ใจดี', '2026-10', 'ตุลาคม 2569', 3600, 110, 114, 4, 18, 72, 520, 562, 42, 8, 336, 100, 4108, 'paid', '2026-11-05'),
('INV-202610-101', '101', 'นายกิตติภูมิ รักษ์ดี', '2026-10', 'ตุลาคม 2569', 3500, 95, 101, 6, 18, 108, 610, 665, 55, 8, 440, 100, 4148, 'paid', '2026-11-05'),
('INV-202610-104', '104', 'นายภาณุพงศ์ ทองแท้', '2026-10', 'ตุลาคม 2569', 3500, 80, 85, 5, 18, 90, 430, 472, 42, 8, 336, 100, 4026, 'pending', '2026-11-05')
ON CONFLICT (id) DO NOTHING;

-- 5. แจ้งซ่อม
INSERT INTO public.maintenance (id, room_number, requester_name, phone, category, description, urgency, status, technician, created_at) VALUES
('FIX-101', '302', 'นายสมชาย ธนกฤษฎ์', '089-123-4567', 'เครื่องปรับอากาศ', 'แอร์มีน้ำหยดบริเวณท่อด้านในห้อง และมีเสียงดังเวลากลางคืน', 'high', 'in_progress', 'ช่างวิเชียร (แอร์)', '2026-10-20'),
('FIX-102', '106', 'ส่วนกลาง', '075-345-678', 'ระบบประปา', 'ก๊อกน้ำในห้องน้ำรั่วซึม ปิดไม่สนิท กำลังเปลี่ยนชุดวาล์ว', 'medium', 'in_progress', 'ช่างสมบูรณ์', '2026-10-19'),
('FIX-103', '201', 'ณัฐพล ใจดี', '081-234-5678', 'ไฟฟ้า/แสงสว่าง', 'หลอดไฟระเบียงหลังห้องขาด 1 หลอด', 'low', 'completed', 'ช่างวิเชียร', '2026-10-12')
ON CONFLICT (id) DO NOTHING;

-- 6. พัสดุ
INSERT INTO public.parcels (id, tracking_number, courier, recipient_name, room_number, description, status, arrived_at, collected_at) VALUES
('PKG-101', 'TH0129384756', 'Flash Express', 'นายสมชาย ธนกฤษฎ์', '302', 'กล่องพัสดุขนาดกลาง (อุปกรณ์การเรียน)', 'waiting', '2026-10-22', NULL),
('PKG-102', 'KERRY9948271', 'Kerry Express', 'ณัฐพล ใจดี', '201', 'ซองเอกสารสำคัญ', 'waiting', '2026-10-21', NULL),
('PKG-103', 'ED182947192TH', 'ไปรษณีย์ไทย (EMS)', 'น.ส.วิภาดา สมบูรณ์', '102', 'กล่องพัสดุมาตรฐาน', 'collected', '2026-10-18', '2026-10-19')
ON CONFLICT (id) DO NOTHING;

-- 7. ข่าวสารและประกาศ
INSERT INTO public.announcements (id, title, content, category, date, pinned) VALUES
('ANN-01', 'กำหนดการล้างเครื่องปรับอากาศประจำปี', 'หอพักจะดำเนินการล้างแอร์ห้องพักทุกชั้น ระหว่างวันที่ 28-30 ตุลาคม 2569 เจ้าหน้าที่จะติดต่อแจ้งนัดเวลาล่วงหน้า 1 วัน ขอความร่วมมือผู้พักเก็บสัมภาระมีค่าให้เรียบร้อย', 'ซ่อมบำรุง', '2026-10-20', true),
('ANN-02', 'แจ้งกำหนดชำระค่าน้ำ-ค่าไฟ ประจำงวดเดือนตุลาคม', 'ระบบได้ออกบิลค่าน้ำ-ค่าไฟเรียบร้อยแล้ว กรุณาชำระเงินภายในวันที่ 5 พฤศจิกายน 2569 ผ่านระบบ QR Code หรือติดต่อเคาน์เตอร์สำนักงานหอพัก', 'การเงิน', '2026-10-18', true),
('ANN-03', 'แจ้งเวลาเปิด-ปิด ประตูรั่วและระบบคีย์การ์ด', 'เพื่อความปลอดภัยสูงสุด ประตูรั่วใหญ่ปิดเวลา 23:00 น. นักศึกษาสามารถสแกนคีย์การ์ดผ่านประตูด้านข้างได้ตลอด 24 ชั่วโมง', 'กฎระเบียบ', '2026-10-01', false)
ON CONFLICT (id) DO NOTHING;

-- 8. ข้อมูลตั้งค่าหอพัก
INSERT INTO public.settings (id, dorm_name, sub_title, phone, line_id, address, water_rate, electric_rate, common_fee, promptpay_number) VALUES
('default', 'Tanakrit Dormitory', 'หอพักชายธนกฤษฎ์ นครศรีธรรมราช', '075-345-678, 089-999-8877', '@tanakritdorm', '123 หมู่ 4 ต.ท่าเรือ อ.เมือง จ.นครศรีธรรมราช 80000', 18, 8, 100, '0899998877')
ON CONFLICT (id) DO UPDATE SET
dorm_name = EXCLUDED.dorm_name,
sub_title = EXCLUDED.sub_title,
phone = EXCLUDED.phone,
line_id = EXCLUDED.line_id,
address = EXCLUDED.address,
water_rate = EXCLUDED.water_rate,
electric_rate = EXCLUDED.electric_rate,
common_fee = EXCLUDED.common_fee,
promptpay_number = EXCLUDED.promptpay_number;

-- 9. บัญชีผู้ใช้งานระบบ
INSERT INTO public.users (id, username, password, role, name, initial, tenantId, room, phone, email, roleTitle, status) VALUES
('USR-001', 'admin', '66765940', 'admin', 'นายธนกฤษฎ์ เพชรดำ บริหาร (ผู้จัดการหอพัก)', 'ผ', NULL, NULL, '080-043-9972', 'tanakritphetdum@gmail.com', 'ผู้ดูแลระบบสูงสุด', 'active'),
('USR-002', 'staff', 'staff123', 'staff', 'นางสาวสมหญิง เจ้าหน้าที่หอพัก', 'ส', NULL, NULL, '075-345-678', 'staff@tanakrit.com', 'เจ้าหน้าที่ธุรการ/ช่าง', 'active'),
('USR-003', 'student', 'student123', 'student', 'นายสมชาย ธนกฤษฎ์', 'ส', '6512345', '302', '089-123-4567', 'somchai@student.tanakrit.com', 'ผู้พักอาศัย (ห้อง 302)', 'active'),
('USR-004', 'technician', 'tech123', 'staff', 'นายวิเชียร ช่างประจำหอ', 'ว', NULL, NULL, '086-111-2233', 'technician@tanakrit.com', 'ช่างซ่อมบำรุง', 'active'),
('USR-005', 'student201', 'pass123', 'student', 'นายณัฐพล ใจดี', 'ณ', '6512346', '201', '081-234-5678', 'nattapon.j@student.tanakrit.com', 'ผู้พักอาศัย (ห้อง 201)', 'active')
ON CONFLICT (id) DO UPDATE SET
password = EXCLUDED.password,
name = EXCLUDED.name,
phone = EXCLUDED.phone,
email = EXCLUDED.email,
role = EXCLUDED.role,
roleTitle = EXCLUDED.roleTitle,
status = EXCLUDED.status;
