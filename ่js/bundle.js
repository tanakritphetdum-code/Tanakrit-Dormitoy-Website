/* Bundled KP Dormitory Application - Standalone & File:// Compatible */
(function() {
"use strict";


/* ========== js/supabase.js ========== */
// js/supabase.js
// ระบบจำลองฐานข้อมูล LocalStorage Engine ที่มี API เลียนแบบ Supabase Client 100%
// ทำให้ระบบทำงานได้ทันทีแบบ Standalone ออฟไลน์ และสามารถต่อเชื่อม Supabase จริงได้ง่ายดาย

const STORAGE_KEY = 'tanakrit_dormitory_db_v1';

// ข้อมูลเริ่มต้นสำหรับระบบหอพัก (Seed Data)
const INITIAL_DATA = {
  rooms: [
    // ชั้น 1 (101 - 108)
    { id: 'R101', room_number: '101', floor: 1, type: 'Standard Air', price: 3500, status: 'occupied', tenant_name: 'นายกิตติภูมิ รักษ์ดี', tenant_phone: '081-111-2233' },
    { id: 'R102', room_number: '102', floor: 1, type: 'Standard Air', price: 3500, status: 'occupied', tenant_name: 'น.ส.วิภาดา สมบูรณ์', tenant_phone: '082-222-3344' },
    { id: 'R103', room_number: '103', floor: 1, type: 'Deluxe Corner', price: 4200, status: 'vacant', tenant_name: '', tenant_phone: '' },
    { id: 'R104', room_number: '104', floor: 1, type: 'Standard Air', price: 3500, status: 'occupied', tenant_name: 'นายภาณุพงศ์ ทองแท้', tenant_phone: '083-333-4455' },
    { id: 'R105', room_number: '105', floor: 1, type: 'Standard Fan', price: 2800, status: 'occupied', tenant_name: 'น.ส.กมลวรรณ ชัยเจริญ', tenant_phone: '084-444-5566' },
    { id: 'R106', room_number: '106', floor: 1, type: 'Standard Fan', price: 2800, status: 'maintenance', tenant_name: '', tenant_phone: '' },
    { id: 'R107', room_number: '107', floor: 1, type: 'Standard Air', price: 3500, status: 'occupied', tenant_name: 'นายธนาธิป สุวรรณ', tenant_phone: '085-555-6677' },
    { id: 'R108', room_number: '108', floor: 1, type: 'Deluxe Corner', price: 4200, status: 'vacant', tenant_name: '', tenant_phone: '' },
    // ชั้น 2 (201 - 208)
    { id: 'R201', room_number: '201', floor: 2, type: 'Standard Air', price: 3600, status: 'occupied', tenant_name: 'ณัฐพล ใจดี', tenant_phone: '081-234-5678' },
    { id: 'R202', room_number: '202', floor: 2, type: 'Standard Air', price: 3600, status: 'occupied', tenant_name: 'น.ส.สุดารัตน์ พรหมดี', tenant_phone: '087-777-8899' },
    { id: 'R203', room_number: '203', floor: 2, type: 'Deluxe Corner', price: 4300, status: 'occupied', tenant_name: 'นายวรพจน์ มณีรัตน์', tenant_phone: '088-888-9900' },
    { id: 'R204', room_number: '204', floor: 2, type: 'Standard Air', price: 3600, status: 'vacant', tenant_name: '', tenant_phone: '' },
    { id: 'R205', room_number: '205', floor: 2, type: 'Standard Fan', price: 2900, status: 'occupied', tenant_name: 'น.ส.พิมพ์ชนก แสนสุข', tenant_phone: '089-999-0011' },
    { id: 'R206', room_number: '206', floor: 2, type: 'Standard Fan', price: 2900, status: 'occupied', tenant_name: 'นายอดิศร วงศ์ษา', tenant_phone: '090-000-1122' },
    { id: 'R207', room_number: '207', floor: 2, type: 'Standard Air', price: 3600, status: 'occupied', tenant_name: 'น.ส.ธัญญารัตน์ บุญมา', tenant_phone: '091-111-2233' },
    { id: 'R208', room_number: '208', floor: 2, type: 'Deluxe Corner', price: 4300, status: 'occupied', tenant_name: 'นายธีรภัทร ชาญวิทย์', tenant_phone: '092-222-3344' },
    // ชั้น 3 (301 - 308)
    { id: 'R301', room_number: '301', floor: 3, type: 'Standard Air', price: 3700, status: 'occupied', tenant_name: 'น.ส.เบญจมาศ สายทอง', tenant_phone: '093-333-4455' },
    { id: 'R302', room_number: '302', floor: 3, type: 'Standard Air', price: 3700, status: 'occupied', tenant_name: 'นายสมชาย ช่างศิลป์', tenant_phone: '089-123-4567' },
    { id: 'R303', room_number: '303', floor: 3, type: 'Deluxe Corner', price: 4400, status: 'vacant', tenant_name: '', tenant_phone: '' },
    { id: 'R304', room_number: '304', floor: 3, type: 'Standard Air', price: 3700, status: 'occupied', tenant_name: 'นายเกริกเกียรติ ยิ่งยง', tenant_phone: '095-555-6677' },
    { id: 'R305', room_number: '305', floor: 3, type: 'Standard Fan', price: 3000, status: 'occupied', tenant_name: 'น.ส.วรรณวิมล เพียรชอบ', tenant_phone: '096-666-7788' },
    { id: 'R306', room_number: '306', floor: 3, type: 'Standard Fan', price: 3000, status: 'occupied', tenant_name: 'นายศักดิ์ดา รุ่งอรุณ', tenant_phone: '097-777-8899' },
    { id: 'R307', room_number: '307', floor: 3, type: 'Standard Air', price: 3700, status: 'vacant', tenant_name: '', tenant_phone: '' },
    { id: 'R308', room_number: '308', floor: 3, type: 'Deluxe Corner', price: 4400, status: 'occupied', tenant_name: 'น.ส.อารียา คงมั่น', tenant_phone: '098-888-9900' }
  ],
  tenants: [
    { id: 'T-1001', tenant_id: '6512345', name: 'นายสมชาย ช่างศิลป์', room: '302', phone: '089-123-4567', email: 'somchai.art@student.kp.ac.th', major: 'วิจิตรศิลป์ ช่างศิลป์ นครศรีฯ', role: 'student', check_in: '2026-06-01' },
    { id: 'T-1002', tenant_id: '6512346', name: 'ณัฐพล ใจดี', room: '201', phone: '081-234-5678', email: 'nattapon.j@student.kp.ac.th', major: 'จิตรกรรมสากล', role: 'student', check_in: '2026-06-01' },
    { id: 'T-1003', tenant_id: '6512347', name: 'นายกิตติภูมิ รักษ์ดี', room: '101', phone: '081-111-2233', email: 'kittiphum@student.kp.ac.th', major: 'ประติมากรรม', role: 'student', check_in: '2026-06-15' },
    { id: 'T-1004', tenant_id: '6512348', name: 'น.ส.วิภาดา สมบูรณ์', room: '102', phone: '082-222-3344', email: 'wiphada@student.kp.ac.th', major: 'ศิลปะไทย', role: 'student', check_in: '2026-06-10' },
    { id: 'T-1005', tenant_id: '6512349', name: 'นายภาณุพงศ์ ทองแท้', room: '104', phone: '083-333-4455', email: 'panupong@student.kp.ac.th', major: 'ภาพพิมพ์', role: 'student', check_in: '2026-07-01' },
    { id: 'T-1006', tenant_id: '6512350', name: 'น.ส.กมลวรรณ ชัยเจริญ', room: '105', phone: '084-444-5566', email: 'kamolwan@student.kp.ac.th', major: 'ศิลปะการออกแบบ', role: 'student', check_in: '2026-07-05' },
    { id: 'T-1007', tenant_id: '6512351', name: 'นายวรพจน์ มณีรัตน์', room: '203', phone: '088-888-9900', email: 'worapoj@student.kp.ac.th', major: 'วิจิตรศิลป์', role: 'student', check_in: '2026-06-01' },
    { id: 'T-1008', tenant_id: '6512352', name: 'น.ส.เบญจมาศ สายทอง', room: '301', phone: '093-333-4455', email: 'benjamas@student.kp.ac.th', major: 'ศิลปะไทย', role: 'student', check_in: '2026-06-01' }
  ],
  requests: [
    {
      id: 'REQ-1089',
      request_id: 'REQ-1089',
      requester_name: 'นายสมชาย ช่างศิลป์',
      requester_id: '6512345',
      current_room: '302',
      target_room: '201',
      reason: 'ต้องการย้ายลงมาอยู่ชั้น 2 เนื่องจากเพื่อนสนิทอยู่ห้องใกล้เคียง และช่วยกันทำงานศิลปนิพนธ์',
      phone: '089-123-4567',
      effective_date: '2026-11-01',
      status: 'pending',
      created_at: '2026-10-18'
    },
    {
      id: 'REQ-1045',
      request_id: 'REQ-1045',
      requester_name: 'น.ส.วิภาดา สมบูรณ์',
      requester_id: '6512348',
      current_room: '102',
      target_room: '103',
      reason: 'ขอเปลี่ยนเป็นห้องหัวมุม (Deluxe) เพื่อความเงียบสงบและมีแสงธรรมชาติวาดรูป',
      phone: '082-222-3344',
      effective_date: '2026-10-15',
      status: 'approved',
      created_at: '2026-10-10'
    },
    {
      id: 'REQ-0992',
      request_id: 'REQ-0992',
      requester_name: 'นายภาณุพงศ์ ทองแท้',
      requester_id: '6512349',
      current_room: '104',
      target_room: '308',
      reason: 'ย้ายชั้นเพื่อรับลมธรรมชาติ',
      phone: '083-333-4455',
      effective_date: '2026-09-30',
      status: 'rejected',
      created_at: '2026-09-20'
    }
  ],
  meter_readings: [
    {
      id: 'INV-202610-302',
      room_number: '302',
      tenant_name: 'นายสมชาย ช่างศิลป์',
      billing_month: '2026-10',
      month_label: 'ตุลาคม 2569',
      room_price: 3700,
      prev_water: 142,
      curr_water: 147,
      water_unit: 5,
      water_rate: 18,
      water_total: 90,
      prev_electric: 830,
      curr_electric: 875,
      electric_unit: 45,
      electric_rate: 8,
      electric_total: 360,
      common_fee: 100,
      total_price: 4250,
      status: 'pending',
      due_date: '2026-11-05'
    },
    {
      id: 'INV-202610-201',
      room_number: '201',
      tenant_name: 'ณัฐพล ใจดี',
      billing_month: '2026-10',
      month_label: 'ตุลาคม 2569',
      room_price: 3600,
      prev_water: 110,
      curr_water: 114,
      water_unit: 4,
      water_rate: 18,
      water_total: 72,
      prev_electric: 520,
      curr_electric: 562,
      electric_unit: 42,
      electric_rate: 8,
      electric_total: 336,
      common_fee: 100,
      total_price: 4108,
      status: 'paid',
      due_date: '2026-11-05'
    },
    {
      id: 'INV-202610-101',
      room_number: '101',
      tenant_name: 'นายกิตติภูมิ รักษ์ดี',
      billing_month: '2026-10',
      month_label: 'ตุลาคม 2569',
      room_price: 3500,
      prev_water: 95,
      curr_water: 101,
      water_unit: 6,
      water_rate: 18,
      water_total: 108,
      prev_electric: 610,
      curr_electric: 665,
      electric_unit: 55,
      electric_rate: 8,
      electric_total: 440,
      common_fee: 100,
      total_price: 4148,
      status: 'paid',
      due_date: '2026-11-05'
    },
    {
      id: 'INV-202610-104',
      room_number: '104',
      tenant_name: 'นายภาณุพงศ์ ทองแท้',
      billing_month: '2026-10',
      month_label: 'ตุลาคม 2569',
      room_price: 3500,
      prev_water: 80,
      curr_water: 85,
      water_unit: 5,
      water_rate: 18,
      water_total: 90,
      prev_electric: 430,
      curr_electric: 472,
      electric_unit: 42,
      electric_rate: 8,
      electric_total: 336,
      common_fee: 100,
      total_price: 4026,
      status: 'pending',
      due_date: '2026-11-05'
    }
  ],
  maintenance: [
    {
      id: 'FIX-101',
      room_number: '302',
      requester_name: 'นายสมชาย ช่างศิลป์',
      phone: '089-123-4567',
      category: 'เครื่องปรับอากาศ',
      description: 'แอร์มีน้ำหยดบริเวณท่อด้านในห้อง และมีเสียงดังเวลากลางคืน',
      urgency: 'high',
      status: 'in_progress',
      technician: 'ช่างวิเชียร (แอร์)',
      created_at: '2026-10-20'
    },
    {
      id: 'FIX-102',
      room_number: '106',
      requester_name: 'ส่วนกลาง',
      phone: '075-345-678',
      category: 'ระบบประปา',
      description: 'ก๊อกน้ำในห้องน้ำรั่วซึม ปิดไม่สนิท กำลังเปลี่ยนชุดวาล์ว',
      urgency: 'medium',
      status: 'in_progress',
      technician: 'ช่างสมบูรณ์',
      created_at: '2026-10-19'
    },
    {
      id: 'FIX-103',
      room_number: '201',
      requester_name: 'ณัฐพล ใจดี',
      phone: '081-234-5678',
      category: 'ไฟฟ้า/แสงสว่าง',
      description: 'หลอดไฟระเบียงหลังห้องขาด 1 หลอด',
      urgency: 'low',
      status: 'completed',
      technician: 'ช่างวิเชียร',
      created_at: '2026-10-12'
    }
  ],
  parcels: [
    {
      id: 'PKG-101',
      tracking_number: 'TH0129384756',
      courier: 'Flash Express',
      recipient_name: 'นายสมชาย ช่างศิลป์',
      room_number: '302',
      description: 'กล่องพัสดุขนาดกลาง (อุปกรณ์วาดรูป)',
      status: 'waiting',
      arrived_at: '2026-10-22'
    },
    {
      id: 'PKG-102',
      tracking_number: 'KERRY9948271',
      courier: 'Kerry Express',
      recipient_name: 'ณัฐพล ใจดี',
      room_number: '201',
      description: 'ซองเอกสารสำคัญ',
      status: 'waiting',
      arrived_at: '2026-10-21'
    },
    {
      id: 'PKG-103',
      tracking_number: 'ED182947192TH',
      courier: 'ไปรษณีย์ไทย (EMS)',
      recipient_name: 'น.ส.วิภาดา สมบูรณ์',
      room_number: '102',
      description: 'กล่องพัสดุมาตรฐาน',
      status: 'collected',
      arrived_at: '2026-10-18',
      collected_at: '2026-10-19'
    }
  ],
  announcements: [
    {
      id: 'ANN-01',
      title: 'กำหนดการล้างเครื่องปรับอากาศประจำปี',
      content: 'หอพักจะดำเนินการล้างแอร์ห้องพักทุกชั้น ระหว่างวันที่ 28-30 ตุลาคม 2569 เจ้าหน้าที่จะติดต่อแจ้งนัดเวลาล่วงหน้า 1 วัน ขอความร่วมมือผู้พักเก็บสัมภาระมีค่าให้เรียบร้อย',
      category: 'ซ่อมบำรุง',
      date: '2026-10-20',
      pinned: true
    },
    {
      id: 'ANN-02',
      title: 'แจ้งกำหนดชำระค่าน้ำ-ค่าไฟ ประจำงวดเดือนตุลาคม',
      content: 'ระบบได้ออกบิลค่าน้ำ-ค่าไฟเรียบร้อยแล้ว กรุณาชำระเงินภายในวันที่ 5 พฤศจิกายน 2569 ผ่านระบบ QR Code หรือติดต่อเคาน์เตอร์สำนักงานหอพัก',
      category: 'การเงิน',
      date: '2026-10-18',
      pinned: true
    },
    {
      id: 'ANN-03',
      title: 'แจ้งเวลาเปิด-ปิด ประตูรั่วและระบบคีย์การ์ด',
      content: 'เพื่อความปลอดภัยสูงสุด ประตูรั่วใหญ่ปิดเวลา 23:00 น. นักศึกษาสามารถสแกนคีย์การ์ดผ่านประตูด้านข้างได้ตลอด 24 ชั่วโมง',
      category: 'กฎระเบียบ',
      date: '2026-10-01',
      pinned: false
    }
  ],
  settings: {
    dorm_name: 'Tanakrit Dormitory',
    sub_title: 'หอพักชายธนกฤษฎ์ นครศรีธรรมราช',
    phone: '075-345-678, 089-999-8877',
    line_id: '@tanakritdorm',
    address: '123 หมู่ 4 ต.ท่าเรือ อ.เมือง จ.นครศรีธรรมราช 80000',
    water_rate: 18,
    electric_rate: 8,
    common_fee: 100,
    promptpay_number: '0899998877'
  }
};

// ดึงข้อมูลทั้งหมดจาก LocalStorage
function getDB() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
      return JSON.parse(JSON.stringify(INITIAL_DATA));
    }
    const parsed = JSON.parse(raw);
    // ตรวจสอบว่ามีคีย์ใหม่ๆ ครบถ้วนหรือไม่
    let changed = false;
    for (const key of Object.keys(INITIAL_DATA)) {
      if (!parsed[key]) {
        parsed[key] = INITIAL_DATA[key];
        changed = true;
      }
    }
    if (changed) localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    return parsed;
  } catch (e) {
    console.error('Database load error:', e);
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }
}

// บันทึกข้อมูลกลับลง LocalStorage
function saveDB(db) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.error('Database save error:', e);
  }
}

// คลาสจำลอง Query Builder ตามสไตล์ Supabase
class QueryBuilder {
  constructor(table) {
    this.table = table;
    this.filters = [];
    this.sortCol = null;
    this.sortAsc = true;
  }

  select(fields = '*') {
    this.fields = fields;
    return this;
  }

  order(column, { ascending = true } = {}) {
    this.sortCol = column;
    this.sortAsc = ascending;
    return this;
  }

  eq(column, value) {
    this.filters.push(item => item[column] === value);
    return this;
  }

  async then(resolve, reject) {
    try {
      const db = getDB();
      let list = Array.isArray(db[this.table]) ? [...db[this.table]] : [];

      // Apply Filters
      for (const f of this.filters) {
        list = list.filter(f);
      }

      // Apply Sort
      if (this.sortCol) {
        list.sort((a, b) => {
          const valA = a[this.sortCol];
          const valB = b[this.sortCol];
          if (valA === valB) return 0;
          if (valA == null) return 1;
          if (valB == null) return -1;
          const res = valA > valB ? 1 : -1;
          return this.sortAsc ? res : -res;
        });
      }

      resolve({ data: list, error: null });
    } catch (err) {
      console.error(`Query error on table [${this.table}]:`, err);
      resolve({ data: null, error: err });
    }
  }

  async insert(rows) {
    try {
      const db = getDB();
      if (!Array.isArray(db[this.table])) db[this.table] = [];
      const newRows = Array.isArray(rows) ? rows : [rows];
      newRows.forEach(r => {
        if (!r.id) r.id = 'ID-' + Math.random().toString(36).substr(2, 9);
        db[this.table].unshift(r);
      });
      saveDB(db);
      return { data: newRows, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  async update(updates) {
    try {
      const db = getDB();
      if (!Array.isArray(db[this.table])) return { data: [], error: null };
      let updatedCount = 0;
      db[this.table] = db[this.table].map(item => {
        let match = true;
        for (const f of this.filters) {
          if (!f(item)) { match = false; break; }
        }
        if (match) {
          updatedCount++;
          return { ...item, ...updates };
        }
        return item;
      });
      saveDB(db);
      return { data: { count: updatedCount }, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  async delete() {
    try {
      const db = getDB();
      if (!Array.isArray(db[this.table])) return { data: [], error: null };
      db[this.table] = db[this.table].filter(item => {
        for (const f of this.filters) {
          if (f(item)) return false; // delete matches
        }
        return true;
      });
      saveDB(db);
      return { data: true, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  }
}

// ส่งออก Supabase Object ที่มีฟังก์ชัน .from(tableName)
const supabase = {
  from(table) {
    return new QueryBuilder(table);
  },
  // ฟังก์ชันช่วยเหลือเพิ่มเติม
  getRawData() {
    return getDB();
  },
  resetToDefaults() {
    localStorage.removeItem(STORAGE_KEY);
    return getDB();
  }
};


/* ========== js/api.js ========== */
// js/api.js
// ระบบรวม SVG Icons, การแจ้งเตือน Toast และระบบ Modal กลาง
const ICONS = {
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/>',
  swap: '<path d="M4 8h13"/><path d="M14 4l4 4-4 4"/><path d="M20 16H7"/><path d="M10 12l-4 4 4 4"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M2 20c0-3.3 3-6 7-6s7 2.7 7 6"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 14.2c2.6.4 4.5 2.4 4.5 5.8"/>',
  door: '<rect x="5" y="3" width="14" height="18" rx="1"/><circle cx="14" cy="12" r="1"/>',
  chart: '<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M2 20h20"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.2-1.6l2-1.4-1.6-2.8-2.3.8a7 7 0 0 0-2.7-1.6L14 3h-4l-.2 2.4a7 7 0 0 0-2.7 1.6l-2.3-.8-1.6 2.8 2 1.4A7 7 0 0 0 5 12c0 .5 0 1.1.2 1.6l-2 1.4 1.6 2.8 2.3-.8a7 7 0 0 0 2.7 1.6L10 21h4l.2-2.4a7 7 0 0 0 2.7-1.6l2.3.8 1.6-2.8-2-1.4c.2-.5.2-1.1.2-1.6z"/>',
  list: '<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
  check: '<path d="M4 12l5 5 11-11"/>',
  x: '<path d="M5 5l14 14"/><path d="M19 5L5 19"/>',
  plus: '<path d="M12 4v16"/><path d="M4 12h16"/>',
  bed: '<path d="M3 18v-7a2 2 0 0 1 2-2h5v5"/><path d="M3 13h18v5"/><path d="M21 18v-3a2 2 0 0 0-2-2h-4v5"/><path d="M3 21v-2"/><path d="M21 21v-2"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  box: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
  bill: '<rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/>',
  bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
  search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  filter: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
  printer: '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
  qr: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/><rect x="18" y="18" width="3" height="3"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  sparkles: '<path d="M12 3l1.91 5.89a1 1 0 0 0 .95.69h6.19l-5.01 3.64a1 1 0 0 0-.36 1.12l1.91 5.89-5.01-3.64a1 1 0 0 0-1.18 0l-5.01 3.64 1.91-5.89a1 1 0 0 0-.36-1.12L1.95 9.58h6.19a1 1 0 0 0 .95-.69L12 3z"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'
};
function ic(name, cls = '') {
  return `<svg class="icon ${cls}" viewBox="0 0 24 24">${ICONS[name] || ''}</svg>`;
}
function toast(msg, type = 'success') {
  let root = document.getElementById('toast-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'toast-root';
    document.body.appendChild(root);
  }
  const el = document.createElement('div');
  el.className = 'toast-item' + (type === 'error' ? ' error' : (type === 'info' ? ' info' : ''));
  const iconName = type === 'error' ? 'x' : (type === 'info' ? 'bell' : 'check');
  el.innerHTML = `${ic(iconName, '')} <span>${msg}</span>`;
  root.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(10px)';
    el.style.transition = 'all 0.3s ease';
    setTimeout(() => el.remove(), 300);
  }, 3500);
}
function fmtDate(d) {
  if (!d) return '-';
  try {
    return new Date(d).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) {
    return d;
  }
}
function fmtCurrency(num) {
  if (num == null || isNaN(num)) return '0 ฿';
  return Number(num).toLocaleString('th-TH') + ' ฿';
}

// ระบบ Global Modal Dialog สวยงาม ไม่ต้องใช้ alert()
function showModal({ title, body, footer = '', maxWidth = '560px' }) {
  let modalBackdrop = document.getElementById('app-modal-backdrop');
  if (!modalBackdrop) {
    modalBackdrop = document.createElement('div');
    modalBackdrop.id = 'app-modal-backdrop';
    modalBackdrop.className = 'modal-backdrop';
    document.body.appendChild(modalBackdrop);
  }

  modalBackdrop.innerHTML = `
    <div class="modal-dialog" style="max-width: ${maxWidth};">
      <div class="modal-header">
        <h3 class="modal-title">${title}</h3>
        <button class="modal-close" id="btn-modal-close">${ic('x')}</button>
      </div>
      <div class="modal-body">${body}</div>
      ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
    </div>
  `;

  modalBackdrop.classList.add('active');

  const closeBtn = document.getElementById('btn-modal-close');
  if (closeBtn) closeBtn.onclick = closeModal;

  modalBackdrop.onclick = (e) => {
    if (e.target === modalBackdrop) closeModal();
  };
}
function closeModal() {
  const modalBackdrop = document.getElementById('app-modal-backdrop');
  if (modalBackdrop) {
    modalBackdrop.classList.remove('active');
  }
}


/* ========== js/auth.js ========== */
// js/auth.js
const USERS = [
  { username: 'admin', password: 'admin123', role: 'admin', name: 'นายเกียรติศักดิ์ บริหาร (ผู้จัดการหอพัก)', initial: 'ผ', tenantId: null, room: null, roleTitle: 'ผู้ดูแลระบบสูงสุด' },
  { username: 'staff', password: 'staff123', role: 'staff', name: 'นางสาวสมหญิง เจ้าหน้าที่หอพัก', initial: 'ส', tenantId: null, room: null, roleTitle: 'เจ้าหน้าที่ธุรการ/ช่าง' },
  { username: 'student', password: 'student123', role: 'student', name: 'นายสมชาย ช่างศิลป์', initial: 'ส', tenantId: '6512345', room: '302', phone: '089-123-4567', roleTitle: 'ผู้พักอาศัย (ห้อง 302)' },
];
let currentUser = null;

// กู้คืน Session อัตโนมัติถ้าเคยล็อกอินไว้
function initAuth() {
  try {
    const saved = localStorage.getItem('kp_current_user');
    if (saved) {
      currentUser = JSON.parse(saved);
      return currentUser;
    }
  } catch (e) {
    currentUser = null;
  }
  return null;
}
function handleLogin(e, onSuccess) {
  if (e) e.preventDefault();
  const u = document.getElementById('login-username').value.trim();
  const p = document.getElementById('login-password').value;
  const found = USERS.find(x => x.username.toLowerCase() === u.toLowerCase() && x.password === p);
  const errBox = document.getElementById('login-error');

  if (!found) {
    if (errBox) {
      errBox.classList.remove('hidden');
      errBox.style.display = 'block';
    }
    toast('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', 'error');
    return;
  }

  if (errBox) {
    errBox.classList.add('hidden');
    errBox.style.display = 'none';
  }

  setCurrentUser(found);
  toggleLoginModal(false);

  if (onSuccess) onSuccess(found);
  toast(`ยินดีต้อนรับ ${found.name}`, 'success');
}
function quickLoginAs(roleName, onSuccess) {
  const found = USERS.find(x => x.role === roleName);
  if (!found) return;
  setCurrentUser(found);
  toggleLoginModal(false);
  if (onSuccess) onSuccess(found);
  toast(`เข้าสู่ระบบในฐานะ ${found.name} (${found.roleTitle})`, 'success');
}
function setCurrentUser(user) {
  currentUser = user;
  localStorage.setItem('kp_current_user', JSON.stringify(user));
  document.getElementById('page-landing').classList.add('hidden');
  document.getElementById('page-app').classList.remove('hidden');
}
function handleLogout() {
  currentUser = null;
  localStorage.removeItem('kp_current_user');
  document.getElementById('page-app').classList.add('hidden');
  document.getElementById('page-landing').classList.remove('hidden');
  const form = document.getElementById('login-form');
  if (form) form.reset();
  toggleLoginModal(false);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  toast('ออกจากระบบเรียบร้อยแล้ว', 'info');
}
function toggleLoginModal(forceOpen) {
  const modal = document.getElementById('login-modal');
  if (!modal) return;
  const isCurrentlyOpen = modal.classList.contains('active') && !modal.classList.contains('hidden');
  const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : !isCurrentlyOpen;
  if (shouldOpen) {
    modal.classList.remove('hidden');
    modal.classList.add('active');
    setTimeout(() => {
      const input = document.getElementById('login-username');
      if (input) input.focus();
    }, 100);
  } else {
    modal.classList.remove('active');
    modal.classList.add('hidden');
  }
}
function toggleSidebar(open) {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  if (sidebar) sidebar.classList.toggle('open', open);
  if (overlay) overlay.style.display = open ? 'block' : 'none';
}


/* ========== js/utilities.js ========== */
// js/utilities.js


let utilityStatusFilter = 'all';
async function renderUtilitiesView() {
  setTimeout(() => {
    bindUtilitiesEvents();
    loadUtilitiesData();
  }, 0);

  return `
    <div class="card">
      <div class="card-header-actions">
        <div>
          <h3>${ic('bill')} ระบบบันทึกมิเตอร์น้ำ-ไฟ และออกใบแจ้งหนี้ (Billing & Utilities)</h3>
          <p style="color: var(--muted); margin-top: 4px; font-size: 0.9rem;">
            คำนวณค่าน้ำ ค่าไฟ ค่าเช่าห้อง ออกใบเสร็จรับเงิน และสร้าง QR Code สแกนจ่าย
          </p>
        </div>
        <button class="btn btn-primary" id="btn-add-meter">
          ${ic('plus')} จดมิเตอร์รอบใหม่
        </button>
      </div>

      <!-- Quick Summary Stats -->
      <div class="room-stats-summary" id="utility-summary-stats">
        <!-- populated via JS -->
      </div>

      <!-- Filters & Actions -->
      <div class="toolbar-filter-grid" style="margin-top: 16px;">
        <div class="filter-tabs" id="utility-status-tabs">
          <button class="filter-tab-btn active" data-status="all">ทั้งหมด</button>
          <button class="filter-tab-btn" data-status="pending">รอชำระเงิน</button>
          <button class="filter-tab-btn" data-status="paid">ชำระแล้ว</button>
        </div>
        <div style="margin-left: auto;">
          <button class="btn btn-outline" id="btn-refresh-utilities">${ic('check')} รีเฟรชข้อมูล</button>
        </div>
      </div>

      <div class="table-responsive" style="margin-top: 16px;">
        <table class="modern-table">
          <thead>
            <tr>
              <th>เลขที่บิล / ห้อง</th>
              <th>รอบประจำเดือน</th>
              <th>ค่าน้ำประปา (18฿/หน่วย)</th>
              <th>ค่าไฟฟ้า (8฿/หน่วย)</th>
              <th>ยอดรวมทั้งสิ้น</th>
              <th>สถานะการชำระ</th>
              <th>จัดการบิล</th>
            </tr>
          </thead>
          <tbody id="utilities-tbody">
            <tr><td colspan="7" style="text-align:center; padding: 30px; color:var(--muted);">กำลังโหลดข้อมูลค่าน้ำ-ค่าไฟ...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function loadUtilitiesData() {
  const tbody = document.getElementById('utilities-tbody');
  const summaryBox = document.getElementById('utility-summary-stats');
  if (!tbody) return;

  const { data: readings, error } = await supabase
    .from('meter_readings')
    .select('*')
    .order('billing_month', { ascending: false });

  if (error || !readings) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--danger); padding: 24px;">ไม่สามารถโหลดข้อมูลค่าน้ำ-ค่าไฟได้</td></tr>`;
    return;
  }

  // Summary counters
  const totalBills = readings.length;
  const pendingBills = readings.filter(r => r.status === 'pending');
  const paidBills = readings.filter(r => r.status === 'paid');
  const totalRevenue = readings.reduce((acc, cur) => acc + (cur.total_price || 0), 0);
  const pendingAmount = pendingBills.reduce((acc, cur) => acc + (cur.total_price || 0), 0);

  if (summaryBox) {
    summaryBox.innerHTML = `
      <div class="rstat-item total">
        <span class="num">${fmtCurrency(totalRevenue)}</span>
        <span class="lbl">ยอดเรียกเก็บรวม (${totalBills} บิล)</span>
      </div>
      <div class="rstat-item vacant">
        <span class="num" style="color:var(--danger);">${fmtCurrency(pendingAmount)}</span>
        <span class="lbl">ค้างชำระ (${pendingBills.length} บิล)</span>
      </div>
      <div class="rstat-item occupied">
        <span class="num">${paidBills.length}</span>
        <span class="lbl">ชำระแล้วเรียบร้อย</span>
      </div>
    `;
  }

  let filtered = readings;
  if (utilityStatusFilter !== 'all') {
    filtered = readings.filter(r => r.status === utilityStatusFilter);
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 30px; color:var(--muted);">ไม่มีรายการบิลในหมวดหมู่นี้</td></tr>`;
    return;
  }

  let html = '';
  filtered.forEach(r => {
    const isPaid = r.status === 'paid';
    const badgeClass = isPaid ? 'approved' : 'pending';
    const badgeText = isPaid ? 'ชำระแล้ว' : 'รอชำระ';

    html += `
      <tr>
        <td>
          <div style="font-weight: 600; color:var(--teal-950);">ห้อง ${r.room_number}</div>
          <small style="color:var(--muted);">${r.tenant_name || '-'} (${r.id})</small>
        </td>
        <td>
          <div style="font-weight: 500;">${r.month_label || r.billing_month}</div>
          <small style="color:var(--muted);">ครบกำหนด: ${fmtDate(r.due_date)}</small>
        </td>
        <td>
          <div>${r.water_unit || 0} หน่วย (${r.prev_water}➔${r.curr_water})</div>
          <small style="color:var(--muted);">${fmtCurrency(r.water_total || (r.water_unit * 18))}</small>
        </td>
        <td>
          <div>${r.electric_unit || 0} หน่วย (${r.prev_electric}➔${r.curr_electric})</div>
          <small style="color:var(--muted);">${fmtCurrency(r.electric_total || (r.electric_unit * 8))}</small>
        </td>
        <td>
          <strong style="color:var(--teal-900); font-size: 1.05rem;">${fmtCurrency(r.total_price)}</strong>
        </td>
        <td><span class="badge ${badgeClass}">${badgeText}</span></td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button class="btn btn-outline btn-sm btn-view-invoice" data-id="${r.id}" title="เปิดดูใบแจ้งหนี้ / สแกนจ่าย">
              ${ic('bill')} ใบแจ้งหนี้
            </button>
            <button class="btn ${isPaid ? 'btn-outline' : 'btn-primary'} btn-sm btn-toggle-pay" data-id="${r.id}" title="${isPaid ? 'เปลี่ยนเป็นยังไม่ชำระ' : 'ยืนยันรับชำระเงิน'}">
              ${isPaid ? ic('x') : ic('check')}
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;

  // View Invoice
  tbody.querySelectorAll('.btn-view-invoice').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      const target = readings.find(x => x.id === id);
      if (target) openInvoiceModal(target);
    };
  });

  // Toggle Payment
  tbody.querySelectorAll('.btn-toggle-pay').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id');
      const target = readings.find(x => x.id === id);
      if (!target) return;
      const nextStatus = target.status === 'paid' ? 'pending' : 'paid';
      await supabase.from('meter_readings').eq('id', id).update({ status: nextStatus });
      toast(`เปลี่ยนสถานะบิล ${target.id} เป็น "${nextStatus === 'paid' ? 'ชำระแล้ว' : 'รอชำระ'}"`, 'success');
      loadUtilitiesData();
    };
  });
}

function bindUtilitiesEvents() {
  const tabs = document.getElementById('utility-status-tabs');
  if (tabs) {
    tabs.querySelectorAll('.filter-tab-btn').forEach(btn => {
      btn.onclick = () => {
        tabs.querySelectorAll('.filter-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        utilityStatusFilter = btn.getAttribute('data-status');
        loadUtilitiesData();
      };
    });
  }

  const btnAdd = document.getElementById('btn-add-meter');
  if (btnAdd) btnAdd.onclick = openAddMeterModal;

  const btnRefresh = document.getElementById('btn-refresh-utilities');
  if (btnRefresh) btnRefresh.onclick = () => {
    toast('รีเฟรชข้อมูลค่าน้ำ-ค่าไฟเรียบร้อย', 'info');
    loadUtilitiesData();
  };
}

// Modal ใบแจ้งหนี้และ QR Code สแกนจ่าย
function openInvoiceModal(bill) {
  const isPaid = bill.status === 'paid';
  const qrMockUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=PROMPTPAY-0899998877-AMOUNT-${bill.total_price}`;

  const body = `
    <div class="invoice-container" id="printable-invoice">
      <div class="invoice-header">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div style="font-family:'Kanit'; font-size: 1.4rem; font-weight: 700; color: var(--teal-950);">
              Tanakrit Dormitory
            </div>
            <div style="font-size: 0.85rem; color: var(--muted);">หอพักชายธนกฤษฎ์ นครศรีธรรมราช</div>
            <div style="font-size: 0.8rem; color: var(--muted);">123 หมู่ 4 ต.ท่าเรือ อ.เมือง จ.นครศรีธรรมราช โทร. 075-345-678</div>
          </div>
          <div style="text-align: right;">
            <div class="invoice-badge ${isPaid ? 'paid' : 'unpaid'}">
              ${isPaid ? '✓ ชำระเงินแล้ว' : 'รอชำระเงิน'}
            </div>
            <div style="font-size: 0.85rem; margin-top: 6px; color: var(--muted);">เลขที่: <strong>${bill.id}</strong></div>
            <div style="font-size: 0.85rem; color: var(--muted);">รอบบิล: <strong>${bill.month_label || bill.billing_month}</strong></div>
          </div>
        </div>
      </div>

      <div class="invoice-tenant-strip">
        <div>
          <span class="lbl">ผู้พักอาศัย / ห้อง:</span>
          <strong>ห้อง ${bill.room_number} - ${bill.tenant_name || 'ไม่ระบุชื่อ'}</strong>
        </div>
        <div>
          <span class="lbl">กำหนดชำระภายใน:</span>
          <strong style="color: ${isPaid ? 'var(--emerald)' : 'var(--danger)'};">${fmtDate(bill.due_date)}</strong>
        </div>
      </div>

      <table class="invoice-items-table">
        <thead>
          <tr>
            <th>รายการ</th>
            <th style="text-align: center;">มิเตอร์ก่อนหน้า - ปัจจุบัน</th>
            <th style="text-align: center;">หน่วยที่ใช้</th>
            <th style="text-align: right;">ราคา/หน่วย</th>
            <th style="text-align: right;">รวมเป็นเงิน</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>ค่าเช่าห้องพักประจำเดือน</strong></td>
            <td style="text-align: center;">-</td>
            <td style="text-align: center;">1 เดือน</td>
            <td style="text-align: right;">${fmtCurrency(bill.room_price)}</td>
            <td style="text-align: right;"><strong>${fmtCurrency(bill.room_price)}</strong></td>
          </tr>
          <tr>
            <td>ค่าน้ำประปา</td>
            <td style="text-align: center;">${bill.prev_water} ➔ ${bill.curr_water}</td>
            <td style="text-align: center;">${bill.water_unit} หน่วย</td>
            <td style="text-align: right;">${bill.water_rate || 18} ฿</td>
            <td style="text-align: right;">${fmtCurrency(bill.water_total)}</td>
          </tr>
          <tr>
            <td>ค่ากระแสไฟฟ้า</td>
            <td style="text-align: center;">${bill.prev_electric} ➔ ${bill.curr_electric}</td>
            <td style="text-align: center;">${bill.electric_unit} หน่วย</td>
            <td style="text-align: right;">${bill.electric_rate || 8} ฿</td>
            <td style="text-align: right;">${fmtCurrency(bill.electric_total)}</td>
          </tr>
          <tr>
            <td>ค่าบริการส่วนกลางและอินเทอร์เน็ต Wi-Fi</td>
            <td style="text-align: center;">-</td>
            <td style="text-align: center;">1 เหมาจ่าย</td>
            <td style="text-align: right;">100 ฿</td>
            <td style="text-align: right;">100 ฿</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td colspan="4" style="text-align: right; font-weight: 700; font-size: 1.1rem; color: var(--teal-950);">
              ยอดชำระทั้งสิ้น:
            </td>
            <td style="text-align: right; font-weight: 700; font-size: 1.25rem; color: var(--teal-900);">
              ${fmtCurrency(bill.total_price)}
            </td>
          </tr>
        </tfoot>
      </table>

      ${!isPaid ? `
        <div class="qr-payment-box">
          <div style="flex: 1;">
            <div style="font-weight: 600; color: var(--teal-950); margin-bottom: 6px; font-size: 1rem;">
              📱 สแกนจ่ายผ่าน Thai QR PromptPay
            </div>
            <p style="font-size: 0.85rem; color: var(--muted); margin: 0 0 8px 0; line-height: 1.5;">
              รองรับทุกแอปพลิเคชันธนาคาร (พร้อมเพย์: 089-999-8877 นายเกียรติศักดิ์ บริหาร)<br>
              เมื่อโอนชำระเรียบร้อย กรุณาส่งสลิปผ่าน Line OA: <strong>@tanakritdorm</strong>
            </p>
          </div>
          <div style="text-align: center;">
            <img src="${qrMockUrl}" alt="PromptPay QR Code" class="qr-img">
            <div style="font-size: 0.75rem; color: var(--muted); margin-top: 4px;">สแกนเพื่อจ่ายเงิน</div>
          </div>
        </div>
      ` : `
        <div style="background: var(--mint-50); border: 1.5px solid var(--emerald); border-radius: 12px; padding: 16px; text-align: center; margin-top: 20px;">
          <div style="color: var(--emerald); font-weight: 600; font-size: 1.1rem;">
            ✓ ได้รับการชำระเงินเรียบร้อยแล้ว
          </div>
          <div style="font-size: 0.85rem; color: var(--muted); margin-top: 4px;">
            ขอบคุณที่ชำระค่าบริการตรงเวลา ออกใบเสร็จโดย Tanakrit Dormitory System
          </div>
        </div>
      `}
    </div>
  `;

  const footer = `
    <button type="button" class="btn btn-outline" onclick="window.printInvoice()">${ic('printer')} พิมพ์ใบแจ้งหนี้ / ใบเสร็จ</button>
    <button type="button" class="btn btn-primary" onclick="window.closeAppModal()">ปิด</button>
  `;

  showModal({
    title: `ใบแจ้งหนี้ค่าเช่าและสาธารณูปโภค — ห้อง ${bill.room_number}`,
    body,
    footer,
    maxWidth: '640px'
  });
}

// Modal จดมิเตอร์ใหม่
async function openAddMeterModal() {
  const { data: rooms } = await supabase.from('rooms').select('*').order('room_number', { ascending: true });
  const roomOptions = (rooms || []).map(r => `
    <option value="${r.room_number}" data-price="${r.price}" data-tenant="${r.tenant_name || ''}">
      ห้อง ${r.room_number} (${r.type}) - ${r.tenant_name || 'ว่าง'}
    </option>
  `).join('');

  const body = `
    <form id="form-meter-reading">
      <div class="field" style="margin-bottom: 14px;">
        <label>เลือกห้องพัก *</label>
        <select id="mr-room" class="form-select">
          ${roomOptions}
        </select>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
        <div class="field">
          <label>รอบเดือนประจำบิล</label>
          <input type="month" id="mr-month" value="2026-10" required>
        </div>
        <div class="field">
          <label>ค่าเช่าห้องพัก (บาท)</label>
          <input type="number" id="mr-room-price" value="3500" required>
        </div>
      </div>

      <!-- Water Section -->
      <div style="background: var(--mint-50); border: 1px solid var(--line); border-radius: 10px; padding: 14px; margin-bottom: 14px;">
        <div style="font-weight: 600; color: var(--teal-950); margin-bottom: 8px;">💧 มิเตอร์น้ำประปา (18 บาท/หน่วย)</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
          <div class="field">
            <label style="font-size:0.8rem;">เลขครั้งก่อน</label>
            <input type="number" id="mr-water-prev" value="100">
          </div>
          <div class="field">
            <label style="font-size:0.8rem;">เลขครั้งนี้ *</label>
            <input type="number" id="mr-water-curr" value="105" required>
          </div>
          <div class="field">
            <label style="font-size:0.8rem;">รวมเงิน (น้ำ)</label>
            <input type="text" id="mr-water-total" disabled value="90 ฿">
          </div>
        </div>
      </div>

      <!-- Electric Section -->
      <div style="background: #fdf8e7; border: 1px solid #f2c14e; border-radius: 10px; padding: 14px; margin-bottom: 14px;">
        <div style="font-weight: 600; color: #8F6B1A; margin-bottom: 8px;">⚡ มิเตอร์ไฟฟ้า (8 บาท/หน่วย)</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
          <div class="field">
            <label style="font-size:0.8rem;">เลขครั้งก่อน</label>
            <input type="number" id="mr-elec-prev" value="500">
          </div>
          <div class="field">
            <label style="font-size:0.8rem;">เลขครั้งนี้ *</label>
            <input type="number" id="mr-elec-curr" value="545" required>
          </div>
          <div class="field">
            <label style="font-size:0.8rem;">รวมเงิน (ไฟ)</label>
            <input type="text" id="mr-elec-total" disabled value="360 ฿">
          </div>
        </div>
      </div>

      <div style="background: var(--sky-100); border-radius: 10px; padding: 12px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 600; color: var(--teal-950);">ยอดรวมทั้งสิ้น (รวมค่าห้อง + ส่วนกลาง 100฿):</span>
        <strong style="font-size: 1.3rem; color: var(--teal-900);" id="mr-grand-total">4,050 ฿</strong>
      </div>
    </form>
  `;

  const footer = `
    <button type="button" class="btn btn-outline" onclick="window.closeAppModal()">ยกเลิก</button>
    <button type="button" class="btn btn-primary" id="btn-submit-meter">บันทึกและสร้างบิล</button>
  `;

  showModal({
    title: 'จดมิเตอร์น้ำ-ไฟ รอบประจำเดือน',
    body,
    footer,
    maxWidth: '560px'
  });

  // Calculate live totals
  const calc = () => {
    const roomPrice = Number(document.getElementById('mr-room-price').value) || 0;
    const wPrev = Number(document.getElementById('mr-water-prev').value) || 0;
    const wCurr = Number(document.getElementById('mr-water-curr').value) || 0;
    const wUnits = Math.max(0, wCurr - wPrev);
    const wCost = wUnits * 18;

    const ePrev = Number(document.getElementById('mr-elec-prev').value) || 0;
    const eCurr = Number(document.getElementById('mr-elec-curr').value) || 0;
    const eUnits = Math.max(0, eCurr - ePrev);
    const eCost = eUnits * 8;

    const grand = roomPrice + wCost + eCost + 100;

    document.getElementById('mr-water-total').value = wCost + ' ฿';
    document.getElementById('mr-elec-total').value = eCost + ' ฿';
    document.getElementById('mr-grand-total').textContent = grand.toLocaleString() + ' ฿';
    return { roomPrice, wPrev, wCurr, wUnits, wCost, ePrev, eCurr, eUnits, eCost, grand };
  };

  document.getElementById('mr-room-price').oninput = calc;
  document.getElementById('mr-water-prev').oninput = calc;
  document.getElementById('mr-water-curr').oninput = calc;
  document.getElementById('mr-elec-prev').oninput = calc;
  document.getElementById('mr-elec-curr').oninput = calc;

  document.getElementById('mr-room').onchange = (e) => {
    const opt = e.target.selectedOptions[0];
    if (opt) {
      const p = opt.getAttribute('data-price');
      if (p) document.getElementById('mr-room-price').value = p;
      calc();
    }
  };

  document.getElementById('btn-submit-meter').onclick = async () => {
    const vals = calc();
    const sel = document.getElementById('mr-room');
    const roomNum = sel.value;
    const tenantName = sel.selectedOptions[0]?.getAttribute('data-tenant') || '';
    const month = document.getElementById('mr-month').value;
    const invId = `INV-${month.replace('-', '')}-${roomNum}`;

    await supabase.from('meter_readings').insert([{
      id: invId,
      room_number: roomNum,
      tenant_name: tenantName,
      billing_month: month,
      month_label: 'รอบ ' + month,
      room_price: vals.roomPrice,
      prev_water: vals.wPrev,
      curr_water: vals.wCurr,
      water_unit: vals.wUnits,
      water_rate: 18,
      water_total: vals.wCost,
      prev_electric: vals.ePrev,
      curr_electric: vals.eCurr,
      electric_unit: vals.eUnits,
      electric_rate: 8,
      electric_total: vals.eCost,
      common_fee: 100,
      total_price: vals.grand,
      status: 'pending',
      due_date: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0]
    }]);

    toast(`ออกบิล ${invId} สำหรับห้อง ${roomNum} สำเร็จ`, 'success');
    closeModal();
    loadUtilitiesData();
  };
}


/* ========== js/rooms.js ========== */
// js/rooms.js


let currentFloorFilter = 'all';
let currentStatusFilter = 'all';
let currentSearch = '';
async function renderRoomsView() {
  setTimeout(() => {
    bindRoomsEvents();
    loadRoomsData();
  }, 0);

  return `
    <div class="card">
      <div class="card-header-actions">
        <div>
          <h3>${ic('door')} สถานะและการจัดการห้องพัก (Floor Plan)</h3>
          <p style="color: var(--muted); margin-top: 4px; font-size: 0.9rem;">
            ตรวจสอบผังห้องพักทุกชั้นแบบเรียลไทม์ พร้อมจัดการข้อมูลการเข้าพัก
          </p>
        </div>
        <div style="display: flex; gap: 10px;">
          <button class="btn btn-primary" id="btn-add-room">${ic('plus')} เพิ่มห้องพักใหม่</button>
        </div>
      </div>

      <!-- Quick Room Stat Counters -->
      <div class="room-stats-summary" id="room-stats-summary">
        <!-- Will be populated via JS -->
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="toolbar-filter-grid">
        <div class="search-box-wrap">
          ${ic('search')}
          <input type="text" id="rooms-search-input" placeholder="ค้นหาเลขห้อง หรือชื่อผู้เช่า...">
        </div>

        <div class="filter-tabs" id="floor-tabs">
          <button class="filter-tab-btn active" data-floor="all">ทุกชั้น</button>
          <button class="filter-tab-btn" data-floor="1">ชั้น 1</button>
          <button class="filter-tab-btn" data-floor="2">ชั้น 2</button>
          <button class="filter-tab-btn" data-floor="3">ชั้น 3</button>
        </div>

        <div class="filter-select-wrap">
          <select id="rooms-status-select" class="form-select">
            <option value="all">สถานะทั้งหมด</option>
            <option value="vacant">เฉพาะห้องว่าง (พร้อมเข้าอยู่)</option>
            <option value="occupied">เฉพาะห้องที่มีผู้เช่าแล้ว</option>
            <option value="maintenance">เฉพาะห้องที่กำลังซ่อมบำรุง</option>
          </select>
        </div>
      </div>

      <!-- Visual Rooms Grid -->
      <div id="rooms-container" class="room-cards-grid">
        <div style="text-align:center; padding: 40px; color: var(--muted); grid-column: 1/-1;">
          กำลังโหลดข้อมูลห้องพัก...
        </div>
      </div>
    </div>
  `;
}

async function loadRoomsData() {
  const container = document.getElementById('rooms-container');
  const summary = document.getElementById('room-stats-summary');
  if (!container) return;

  const { data: rooms, error } = await supabase.from('rooms').select('*').order('room_number', { ascending: true });

  if (error || !rooms) {
    container.innerHTML = `<p style="color:var(--danger); text-align:center; grid-column: 1/-1;">เกิดข้อผิดพลาดในการโหลดข้อมูลห้องพัก</p>`;
    return;
  }

  // Update Summary Stats
  const total = rooms.length;
  const occupied = rooms.filter(r => r.status === 'occupied').length;
  const vacant = rooms.filter(r => r.status === 'vacant').length;
  const maintenance = rooms.filter(r => r.status === 'maintenance').length;
  const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;

  if (summary) {
    summary.innerHTML = `
      <div class="rstat-item total">
        <span class="num">${total}</span>
        <span class="lbl">ห้องทั้งหมด</span>
      </div>
      <div class="rstat-item occupied">
        <span class="num">${occupied}</span>
        <span class="lbl">มีผู้เช่าแล้ว (${occupancyRate}%)</span>
      </div>
      <div class="rstat-item vacant">
        <span class="num">${vacant}</span>
        <span class="lbl">ห้องว่างพร้อมอยู่</span>
      </div>
      <div class="rstat-item maintenance">
        <span class="num">${maintenance}</span>
        <span class="lbl">ปิดปรับปรุง/ซ่อม</span>
      </div>
    `;
  }

  // Filter rooms
  let filtered = rooms.filter(r => {
    // Floor
    if (currentFloorFilter !== 'all' && String(r.floor) !== String(currentFloorFilter)) return false;
    // Status
    if (currentStatusFilter !== 'all' && r.status !== currentStatusFilter) return false;
    // Search
    if (currentSearch) {
      const q = currentSearch.toLowerCase();
      const matchNum = r.room_number.toLowerCase().includes(q);
      const matchTenant = (r.tenant_name || '').toLowerCase().includes(q);
      const matchType = (r.type || '').toLowerCase().includes(q);
      if (!matchNum && !matchTenant && !matchType) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding: 40px; color: var(--muted); grid-column: 1/-1;">
        <div style="font-size: 2rem; margin-bottom: 8px;">🔍</div>
        ไม่พบห้องพักตามเงื่อนไขที่ค้นหา
      </div>
    `;
    return;
  }

  let html = '';
  filtered.forEach(r => {
    let statusClass = 'vacant';
    let statusLabel = 'ห้องว่าง';
    let dotColor = 'var(--emerald)';

    if (r.status === 'occupied') {
      statusClass = 'occupied';
      statusLabel = 'มีผู้เช่า';
      dotColor = 'var(--sky)';
    } else if (r.status === 'maintenance') {
      statusClass = 'maintenance';
      statusLabel = 'กำลังซ่อม';
      dotColor = 'var(--sand-600)';
    }

    html += `
      <div class="room-box-card ${statusClass}" data-room-id="${r.id}">
        <div class="room-top">
          <div>
            <span class="room-badge-floor">ชั้น ${r.floor}</span>
            <div class="room-no">ห้อง ${r.room_number}</div>
          </div>
          <span class="room-status-badge ${statusClass}">
            <span class="status-dot" style="background:${dotColor}"></span>
            ${statusLabel}
          </span>
        </div>

        <div class="room-details-body">
          <div class="room-type">${r.type || 'Standard'}</div>
          <div class="room-price">${fmtCurrency(r.price)} / เดือน</div>
          <div class="room-tenant-info">
            ${r.status === 'occupied' 
              ? `${ic('user')} <span>${r.tenant_name || 'ไม่ระบุชื่อ'}</span>` 
              : `<span class="empty-hint">${r.status === 'maintenance' ? '🔧 อยู่ระหว่างปรับปรุง' : '✨ พร้อมทำสัญญาเข้าอยู่'}</span>`
            }
          </div>
        </div>

        <div class="room-card-footer">
          <button class="btn btn-outline btn-sm btn-manage-room" data-room-id="${r.id}" style="width: 100%;">
            จัดการห้องพัก
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  // Bind clicks to manage room
  container.querySelectorAll('.btn-manage-room').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-room-id');
      const targetRoom = rooms.find(x => x.id === id);
      if (targetRoom) openManageRoomModal(targetRoom);
    };
  });
}

function bindRoomsEvents() {
  const searchInput = document.getElementById('rooms-search-input');
  if (searchInput) {
    searchInput.oninput = (e) => {
      currentSearch = e.target.value.trim();
      loadRoomsData();
    };
  }

  const floorTabs = document.getElementById('floor-tabs');
  if (floorTabs) {
    floorTabs.querySelectorAll('.filter-tab-btn').forEach(btn => {
      btn.onclick = () => {
        floorTabs.querySelectorAll('.filter-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFloorFilter = btn.getAttribute('data-floor');
        loadRoomsData();
      };
    });
  }

  const statusSelect = document.getElementById('rooms-status-select');
  if (statusSelect) {
    statusSelect.onchange = (e) => {
      currentStatusFilter = e.target.value;
      loadRoomsData();
    };
  }

  const btnAdd = document.getElementById('btn-add-room');
  if (btnAdd) {
    btnAdd.onclick = openAddRoomModal;
  }
}

// Modal จัดการห้องพัก
function openManageRoomModal(room) {
  const body = `
    <form id="form-manage-room">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
        <div class="field">
          <label>หมายเลขห้อง</label>
          <input type="text" id="m-room-number" value="${room.room_number}" required>
        </div>
        <div class="field">
          <label>ชั้น (Floor)</label>
          <input type="number" id="m-floor" value="${room.floor}" min="1" max="10" required>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
        <div class="field">
          <label>ประเภทห้อง</label>
          <select id="m-type" class="form-select">
            <option value="Standard Air" ${room.type === 'Standard Air' ? 'selected' : ''}>Standard Air (แอร์)</option>
            <option value="Standard Fan" ${room.type === 'Standard Fan' ? 'selected' : ''}>Standard Fan (พัดลม)</option>
            <option value="Deluxe Corner" ${room.type === 'Deluxe Corner' ? 'selected' : ''}>Deluxe Corner (ห้องมุมกว้าง)</option>
          </select>
        </div>
        <div class="field">
          <label>ราคาค่าเช่าต่อเดือน (บาท)</label>
          <input type="number" id="m-price" value="${room.price}" required>
        </div>
      </div>

      <div class="field" style="margin-bottom: 14px;">
        <label>สถานะห้องพัก</label>
        <select id="m-status" class="form-select">
          <option value="vacant" ${room.status === 'vacant' ? 'selected' : ''}>ว่าง (พร้อมเข้าอยู่)</option>
          <option value="occupied" ${room.status === 'occupied' ? 'selected' : ''}>มีผู้เช่าแล้ว</option>
          <option value="maintenance" ${room.status === 'maintenance' ? 'selected' : ''}>ปิดปรับปรุง / ซ่อมบำรุง</option>
        </select>
      </div>

      <div class="field" style="margin-bottom: 14px;">
        <label>ชื่อผู้เช่าปัจจุบัน</label>
        <input type="text" id="m-tenant-name" value="${room.tenant_name || ''}" placeholder="ระบุชื่อผู้พักอาศัย (ถ้ามี)">
      </div>

      <div class="field" style="margin-bottom: 14px;">
        <label>เบอร์โทรศัพท์ผู้เช่า</label>
        <input type="text" id="m-tenant-phone" value="${room.tenant_phone || ''}" placeholder="08x-xxx-xxxx">
      </div>
    </form>
  `;

  const footer = `
    <button type="button" class="btn btn-outline" id="btn-delete-room" style="color:var(--danger); border-color:var(--danger);">
      ${ic('trash')} ลบห้องพัก
    </button>
    <div style="display: flex; gap: 10px;">
      <button type="button" class="btn btn-outline" onclick="window.closeAppModal()">ยกเลิก</button>
      <button type="button" class="btn btn-primary" id="btn-save-manage-room">บันทึกข้อมูล</button>
    </div>
  `;

  showModal({
    title: `จัดการห้องพัก ${room.room_number}`,
    body,
    footer,
    maxWidth: '540px'
  });

  document.getElementById('btn-save-manage-room').onclick = async () => {
    const num = document.getElementById('m-room-number').value.trim();
    const fl = Number(document.getElementById('m-floor').value);
    const tp = document.getElementById('m-type').value;
    const pr = Number(document.getElementById('m-price').value);
    const st = document.getElementById('m-status').value;
    const tName = document.getElementById('m-tenant-name').value.trim();
    const tPhone = document.getElementById('m-tenant-phone').value.trim();

    await supabase.from('rooms').eq('id', room.id).update({
      room_number: num,
      floor: fl,
      type: tp,
      price: pr,
      status: st,
      tenant_name: st === 'occupied' ? tName : '',
      tenant_phone: st === 'occupied' ? tPhone : ''
    });

    toast(`อัปเดตข้อมูลห้อง ${num} เรียบร้อยแล้ว`, 'success');
    closeModal();
    loadRoomsData();
  };

  document.getElementById('btn-delete-room').onclick = async () => {
    if (confirm(`คุณต้องการลบห้อง ${room.room_number} ออกจากระบบใช่หรือไม่?`)) {
      await supabase.from('rooms').eq('id', room.id).delete();
      toast(`ลบห้อง ${room.room_number} สำเร็จ`, 'info');
      closeModal();
      loadRoomsData();
    }
  };
}

// Modal เพิ่มห้องใหม่
function openAddRoomModal() {
  const body = `
    <form id="form-add-room">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
        <div class="field">
          <label>หมายเลขห้อง (เช่น 309)</label>
          <input type="text" id="add-room-number" placeholder="เช่น 309" required>
        </div>
        <div class="field">
          <label>ชั้น (Floor)</label>
          <input type="number" id="add-floor" value="1" min="1" max="10" required>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
        <div class="field">
          <label>ประเภทห้อง</label>
          <select id="add-type" class="form-select">
            <option value="Standard Air">Standard Air (แอร์)</option>
            <option value="Standard Fan">Standard Fan (พัดลม)</option>
            <option value="Deluxe Corner">Deluxe Corner (ห้องมุมกว้าง)</option>
          </select>
        </div>
        <div class="field">
          <label>ราคาค่าเช่าต่อเดือน (บาท)</label>
          <input type="number" id="add-price" value="3500" required>
        </div>
      </div>

      <div class="field" style="margin-bottom: 14px;">
        <label>สถานะเริ่มต้น</label>
        <select id="add-status" class="form-select">
          <option value="vacant">ห้องว่าง (พร้อมเปิดให้เช่า)</option>
          <option value="occupied">มีผู้เช่าแล้ว</option>
          <option value="maintenance">ปิดปรับปรุง</option>
        </select>
      </div>
    </form>
  `;

  const footer = `
    <button type="button" class="btn btn-outline" onclick="window.closeAppModal()">ยกเลิก</button>
    <button type="button" class="btn btn-primary" id="btn-submit-add-room">เพิ่มห้องพัก</button>
  `;

  showModal({
    title: 'เพิ่มห้องพักใหม่เข้าสู่ผังอาคาร',
    body,
    footer,
    maxWidth: '520px'
  });

  document.getElementById('btn-submit-add-room').onclick = async () => {
    const num = document.getElementById('add-room-number').value.trim();
    const fl = Number(document.getElementById('add-floor').value);
    const tp = document.getElementById('add-type').value;
    const pr = Number(document.getElementById('add-price').value);
    const st = document.getElementById('add-status').value;

    if (!num) {
      toast('กรุณาระบุหมายเลขห้อง', 'error');
      return;
    }

    await supabase.from('rooms').insert([{
      room_number: num,
      floor: fl,
      type: tp,
      price: pr,
      status: st,
      tenant_name: '',
      tenant_phone: ''
    }]);

    toast(`เพิ่มห้องพัก ${num} เรียบร้อยแล้ว`, 'success');
    closeModal();
    loadRoomsData();
  };
}


/* ========== js/tenants.js ========== */
// js/tenants.js


let tenantSearchTerm = '';
async function renderTenantsView() {
  setTimeout(() => {
    bindTenantsEvents();
    loadTenantsData();
  }, 0);

  return `
    <div class="card">
      <div class="card-header-actions">
        <div>
          <h3>${ic('users')} ทะเบียนผู้พักอาศัย (Tenants Directory)</h3>
          <p style="color: var(--muted); margin-top: 4px; font-size: 0.9rem;">
            จัดการรายชื่อ ประวัติการเข้าพัก และข้อมูลติดต่อของผู้เช่าทั้งหมด
          </p>
        </div>
        <button class="btn btn-primary" id="btn-add-tenant">
          ${ic('plus')} ลงทะเบียนผู้พักใหม่
        </button>
      </div>

      <!-- Search Toolbar -->
      <div class="toolbar-filter-grid" style="margin-top: 16px;">
        <div class="search-box-wrap" style="flex: 1;">
          ${ic('search')}
          <input type="text" id="tenants-search-input" placeholder="ค้นหาชื่อ, รหัสนักศึกษา, ห้องพัก หรือเบอร์โทร...">
        </div>
        <button class="btn btn-outline" id="btn-refresh-tenants">${ic('check')} รีเฟรชข้อมูล</button>
      </div>

      <div class="table-responsive" style="margin-top: 16px;">
        <table class="modern-table">
          <thead>
            <tr>
              <th>รหัสผู้เช่า</th>
              <th>ชื่อ - นามสกุล</th>
              <th>ห้องพัก</th>
              <th>เบอร์โทรศัพท์</th>
              <th>วันที่เข้าพัก</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody id="tenants-tbody">
            <tr><td colspan="6" style="text-align:center; padding: 30px; color:var(--muted);">กำลังโหลดข้อมูลผู้พัก...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function loadTenantsData() {
  const tbody = document.getElementById('tenants-tbody');
  if (!tbody) return;

  const { data: tenants, error } = await supabase.from('tenants').select('*').order('room', { ascending: true });

  if (error || !tenants) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--danger); padding: 24px;">ไม่สามารถโหลดข้อมูลผู้พักได้</td></tr>`;
    return;
  }

  let filtered = tenants;
  if (tenantSearchTerm) {
    const q = tenantSearchTerm.toLowerCase();
    filtered = tenants.filter(t => 
      (t.name || '').toLowerCase().includes(q) ||
      (t.tenant_id || '').toLowerCase().includes(q) ||
      (t.room || '').toLowerCase().includes(q) ||
      (t.phone || '').toLowerCase().includes(q) ||
      (t.major || '').toLowerCase().includes(q)
    );
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--muted); padding: 30px;">ไม่พบข้อมูลผู้เช่าตามคำค้นหา</td></tr>`;
    return;
  }

  let html = '';
  filtered.forEach(t => {
    html += `
      <tr>
        <td><strong style="color:var(--teal-900);">${t.tenant_id || t.id.slice(0, 6)}</strong></td>
        <td>
          <div style="font-weight: 500; color:var(--teal-950);">${t.name}</div>
          <small style="color:var(--muted);">${t.email || '-'}</small>
        </td>
        <td><span class="badge room-pill">ห้อง ${t.room}</span></td>
        <td>${t.phone ? `<a href="tel:${t.phone}" style="color:var(--emerald);">${t.phone}</a>` : '-'}</td>
        <td>${fmtDate(t.check_in)}</td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button class="btn btn-outline btn-sm btn-edit-tenant" data-tenant-id="${t.id}" title="แก้ไขข้อมูล">
              ${ic('edit')} แก้ไข
            </button>
            <button class="btn btn-outline btn-sm btn-del-tenant" data-tenant-id="${t.id}" style="color:var(--danger); border-color:var(--danger);" title="ย้ายออก/ลบ">
              ${ic('trash')}
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;

  tbody.querySelectorAll('.btn-edit-tenant').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-tenant-id');
      const target = tenants.find(x => x.id === id);
      if (target) openEditTenantModal(target);
    };
  });

  tbody.querySelectorAll('.btn-del-tenant').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-tenant-id');
      const target = tenants.find(x => x.id === id);
      if (!target) return;
      if (confirm(`ยืนยันการแจ้งย้ายออก / ลบข้อมูลผู้พัก "${target.name}" ห้อง ${target.room}?`)) {
        await supabase.from('tenants').eq('id', id).delete();
        // Update room status to vacant if needed
        const { data: matchedRooms } = await supabase.from('rooms').eq('room_number', target.room);
        if (matchedRooms && matchedRooms.length > 0) {
          await supabase.from('rooms').eq('room_number', target.room).update({
            status: 'vacant',
            tenant_name: '',
            tenant_phone: ''
          });
        }
        toast(`นำข้อมูลของ ${target.name} ออกจากระบบเรียบร้อยแล้ว`, 'info');
        loadTenantsData();
      }
    };
  });
}

function bindTenantsEvents() {
  const input = document.getElementById('tenants-search-input');
  if (input) {
    input.oninput = (e) => {
      tenantSearchTerm = e.target.value.trim();
      loadTenantsData();
    };
  }

  const btnAdd = document.getElementById('btn-add-tenant');
  if (btnAdd) btnAdd.onclick = openAddTenantModal;

  const btnRefresh = document.getElementById('btn-refresh-tenants');
  if (btnRefresh) btnRefresh.onclick = () => {
    toast('รีเฟรชข้อมูลผู้พักเรียบร้อย', 'info');
    loadTenantsData();
  };
}

function openAddTenantModal() {
  const body = `
    <form id="form-add-tenant">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
        <div class="field">
          <label>ชื่อ - นามสกุล *</label>
          <input type="text" id="t-name" placeholder="เช่น นายสมชาย ช่างศิลป์" required>
        </div>
        <div class="field">
          <label>รหัสนักศึกษา / ผู้เช่า</label>
          <input type="text" id="t-id" placeholder="เช่น 6512349">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
        <div class="field">
          <label>ห้องพัก *</label>
          <input type="text" id="t-room" placeholder="เช่น 103" required>
        </div>
        <div class="field">
          <label>เบอร์โทรศัพท์ติดต่อ *</label>
          <input type="tel" id="t-phone" placeholder="08x-xxx-xxxx" required>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
        <div class="field">
          <label>อีเมล</label>
          <input type="email" id="t-email" placeholder="example@mail.com">
        </div>
        <div class="field">
          <label>วันที่เริ่มเข้าพัก</label>
          <input type="date" id="t-checkin" value="${new Date().toISOString().split('T')[0]}">
        </div>
      </div>
    </form>
  `;

  const footer = `
    <button type="button" class="btn btn-outline" onclick="window.closeAppModal()">ยกเลิก</button>
    <button type="button" class="btn btn-primary" id="btn-submit-add-tenant">บันทึกข้อมูลผู้เช่า</button>
  `;

  showModal({
    title: 'ลงทะเบียนผู้พักอาศัยใหม่',
    body,
    footer,
    maxWidth: '560px'
  });

  document.getElementById('btn-submit-add-tenant').onclick = async () => {
    const name = document.getElementById('t-name').value.trim();
    const tid = document.getElementById('t-id').value.trim() || 'T-' + Math.floor(1000 + Math.random() * 9000);
    const room = document.getElementById('t-room').value.trim();
    const phone = document.getElementById('t-phone').value.trim();
    const email = document.getElementById('t-email').value.trim();
    const checkin = document.getElementById('t-checkin').value;

    if (!name || !room || !phone) {
      toast('กรุณากรอกข้อมูลที่จำเป็น (*) ให้ครบถ้วน', 'error');
      return;
    }

    await supabase.from('tenants').insert([{
      name,
      tenant_id: tid,
      room,
      phone,
      email,
      check_in: checkin,
      role: 'student'
    }]);

    // Update room status
    await supabase.from('rooms').eq('room_number', room).update({
      status: 'occupied',
      tenant_name: name,
      tenant_phone: phone
    });

    toast(`ลงทะเบียน ${name} เข้าห้อง ${room} สำเร็จ`, 'success');
    closeModal();
    loadTenantsData();
  };
}

function openEditTenantModal(tenant) {
  const body = `
    <form id="form-edit-tenant">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
        <div class="field">
          <label>ชื่อ - นามสกุล *</label>
          <input type="text" id="ed-name" value="${tenant.name}" required>
        </div>
        <div class="field">
          <label>รหัสนักศึกษา / ผู้เช่า</label>
          <input type="text" id="ed-id" value="${tenant.tenant_id || ''}">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
        <div class="field">
          <label>ห้องพัก *</label>
          <input type="text" id="ed-room" value="${tenant.room}" required>
        </div>
        <div class="field">
          <label>เบอร์โทรศัพท์ติดต่อ *</label>
          <input type="tel" id="ed-phone" value="${tenant.phone || ''}" required>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
        <div class="field">
          <label>อีเมล</label>
          <input type="email" id="ed-email" value="${tenant.email || ''}">
        </div>
        <div class="field">
          <label>วันที่เริ่มเข้าพัก</label>
          <input type="date" id="ed-checkin" value="${tenant.check_in || ''}">
        </div>
      </div>
    </form>
  `;

  const footer = `
    <button type="button" class="btn btn-outline" onclick="window.closeAppModal()">ยกเลิก</button>
    <button type="button" class="btn btn-primary" id="btn-submit-edit-tenant">บันทึกการแก้ไข</button>
  `;

  showModal({
    title: `แก้ไขข้อมูลผู้พัก: ${tenant.name}`,
    body,
    footer,
    maxWidth: '560px'
  });

  document.getElementById('btn-submit-edit-tenant').onclick = async () => {
    const name = document.getElementById('ed-name').value.trim();
    const tid = document.getElementById('ed-id').value.trim();
    const room = document.getElementById('ed-room').value.trim();
    const phone = document.getElementById('ed-phone').value.trim();
    const email = document.getElementById('ed-email').value.trim();
    const checkin = document.getElementById('ed-checkin').value;

    await supabase.from('tenants').eq('id', tenant.id).update({
      name,
      tenant_id: tid,
      room,
      phone,
      email,
      check_in: checkin
    });

    toast('แก้ไขข้อมูลผู้เช่าเรียบร้อยแล้ว', 'success');
    closeModal();
    loadTenantsData();
  };
}


/* ========== js/requests.js ========== */
// js/requests.js
let requests = [];
let currentFilter = 'all';
async function fetchRequests() {
  const { data, error } = await supabase
    .from('requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) {
    requests = [];
  } else {
    requests = data;
  }
  return requests;
}
function renderRequestsView() {
  setTimeout(async () => {
    bindRequestsFilterEvents();
    await loadRequestsTable();
  }, 0);

  return `
    <div class="card">
      <div class="card-header-actions">
        <div>
          <h3>${ic('swap')} จัดการคำร้องขอสลับห้องพัก (Room Swap Requests)</h3>
          <p style="color: var(--muted); margin-top: 4px; font-size: 0.9rem;">
            ตรวจสอบเหตุผล พิจารณาอนุมัติ หรือแจ้งผลคำร้องการขอย้าย/สลับห้องพักของนักศึกษา
          </p>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="toolbar-filter-grid" style="margin-top: 16px;">
        <div class="filter-tabs" id="req-filter-tabs">
          <button class="filter-tab-btn active" data-status="all">ทั้งหมด</button>
          <button class="filter-tab-btn" data-status="pending">รอตรวจสอบ</button>
          <button class="filter-tab-btn" data-status="approved">อนุมัติแล้ว</button>
          <button class="filter-tab-btn" data-status="rejected">ไม่อนุมัติ</button>
        </div>
      </div>

      <div class="table-responsive" style="margin-top: 16px;">
        <table class="modern-table">
          <thead>
            <tr>
              <th>รหัสคำร้อง</th>
              <th>ผู้ยื่นคำร้อง</th>
              <th>สลับห้อง</th>
              <th>วันที่ต้องการมีผล</th>
              <th>เหตุผลความจำเป็น</th>
              <th>สถานะ</th>
              <th>การกระทำ</th>
            </tr>
          </thead>
          <tbody id="requests-tbody">
            <tr><td colspan="7" style="text-align:center; padding: 30px; color:var(--muted);">กำลังโหลดข้อมูลคำร้อง...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function loadRequestsTable() {
  const tbody = document.getElementById('requests-tbody');
  if (!tbody) return;

  await fetchRequests();

  let filtered = requests;
  if (currentFilter !== 'all') {
    filtered = requests.filter(r => r.status === currentFilter);
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 30px; color:var(--muted);">ไม่มีรายการคำร้องในหมวดหมู่นี้</td></tr>`;
    return;
  }

  let html = '';
  filtered.forEach(r => {
    let badgeClass = 'pending';
    let badgeText = 'รอตรวจสอบ';
    if (r.status === 'approved') { badgeClass = 'approved'; badgeText = 'อนุมัติแล้ว'; }
    else if (r.status === 'rejected') { badgeClass = 'rejected'; badgeText = 'ไม่อนุมัติ'; }

    html += `
      <tr>
        <td><strong>${r.request_id || r.id.slice(0, 8)}</strong></td>
        <td>
          <div style="font-weight: 500; color:var(--teal-950);">${r.requester_name}</div>
          <small style="color:var(--muted);">โทร: ${r.phone || '-'}</small>
        </td>
        <td>
          <span class="room-swap-indicator">
            <span class="room-pill curr">ห้อง ${r.current_room}</span>
            <span class="arrow">➔</span>
            <span class="room-pill target">ห้อง ${r.target_room}</span>
          </span>
        </td>
        <td>${fmtDate(r.effective_date || r.created_at)}</td>
        <td style="max-width: 250px;">
          <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${r.reason}">
            ${r.reason}
          </div>
        </td>
        <td><span class="badge ${badgeClass}">${badgeText}</span></td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button class="btn btn-outline btn-sm btn-view-req" data-id="${r.id}" title="ดูรายละเอียด">
              ${ic('eye')}
            </button>
            ${r.status === 'pending' ? `
              <button class="btn btn-primary btn-sm btn-appr-req" data-id="${r.id}" title="อนุมัติ">
                ${ic('check')}
              </button>
              <button class="btn btn-outline btn-sm btn-rej-req" data-id="${r.id}" style="color:var(--danger); border-color:var(--danger);" title="ไม่อนุมัติ">
                ${ic('x')}
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;

  // View Details
  tbody.querySelectorAll('.btn-view-req').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      const target = requests.find(x => x.id === id);
      if (target) openRequestDetailsModal(target);
    };
  });

  // Approve
  tbody.querySelectorAll('.btn-appr-req').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id');
      const target = requests.find(x => x.id === id);
      if (!target) return;
      if (confirm(`ยืนยันการอนุมัติคำร้อง ${target.request_id || target.id} ให้ย้ายจากห้อง ${target.current_room} ไป ${target.target_room}?`)) {
        await supabase.from('requests').eq('id', id).update({ status: 'approved' });
        // Auto update room tenant if exists
        await supabase.from('rooms').eq('room_number', target.current_room).update({ status: 'vacant', tenant_name: '', tenant_phone: '' });
        await supabase.from('rooms').eq('room_number', target.target_room).update({ status: 'occupied', tenant_name: target.requester_name, tenant_phone: target.phone });
        await supabase.from('tenants').eq('name', target.requester_name).update({ room: target.target_room });
        toast(`อนุมัติคำร้องของ ${target.requester_name} เรียบร้อยแล้ว`, 'success');
        loadRequestsTable();
      }
    };
  });

  // Reject
  tbody.querySelectorAll('.btn-rej-req').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id');
      const target = requests.find(x => x.id === id);
      if (!target) return;
      if (confirm(`ยืนยันการปฏิเสธคำร้อง ${target.request_id || target.id}?`)) {
        await supabase.from('requests').eq('id', id).update({ status: 'rejected' });
        toast(`ปฏิเสธคำร้องเรียบร้อยแล้ว`, 'info');
        loadRequestsTable();
      }
    };
  });
}

function bindRequestsFilterEvents() {
  const tabs = document.getElementById('req-filter-tabs');
  if (tabs) {
    tabs.querySelectorAll('.filter-tab-btn').forEach(btn => {
      btn.onclick = () => {
        tabs.querySelectorAll('.filter-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-status');
        loadRequestsTable();
      };
    });
  }
}

function openRequestDetailsModal(req) {
  let badgeColor = req.status === 'approved' ? 'var(--emerald)' : (req.status === 'rejected' ? 'var(--danger)' : 'var(--sand-600)');
  let statusText = req.status === 'approved' ? 'อนุมัติเรียบร้อยแล้ว' : (req.status === 'rejected' ? 'ไม่อนุมัติ' : 'อยู่ระหว่างรอการตรวจสอบ');

  const body = `
    <div style="background: var(--mint-50); padding: 16px; border-radius: 12px; margin-bottom: 20px; border: 1px solid var(--line);">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-family:'Kanit'; font-weight: 600; font-size: 1.1rem; color: var(--teal-950);">รหัส: ${req.request_id || req.id}</span>
        <span style="background: ${badgeColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 500;">
          ${statusText}
        </span>
      </div>
      <div style="font-size: 0.85rem; color: var(--muted); margin-top: 4px;">ยื่นเมื่อวันที่: ${fmtDate(req.created_at)}</div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px;">
      <div>
        <label style="font-size: 0.8rem; color: var(--muted);">ชื่อผู้ยื่นคำร้อง</label>
        <div style="font-weight: 600; color: var(--teal-950);">${req.requester_name}</div>
      </div>
      <div>
        <label style="font-size: 0.8rem; color: var(--muted);">เบอร์ติดต่อ</label>
        <div style="font-weight: 600; color: var(--teal-950);">${req.phone || '-'}</div>
      </div>
    </div>

    <div style="background: #fdf8e7; padding: 14px; border-radius: 10px; margin-bottom: 16px; border: 1px solid #f2c14e;">
      <div style="font-size: 0.85rem; color: #8F6B1A; font-weight: 600; margin-bottom: 4px;">การขอสลับห้อง:</div>
      <div style="display: flex; align-items: center; gap: 12px; font-size: 1.1rem; font-weight: 600;">
        <span style="color: var(--teal-950);">ห้องปัจจุบัน ${req.current_room}</span>
        <span>➔</span>
        <span style="color: var(--emerald);">ห้องที่ต้องการย้าย ${req.target_room}</span>
      </div>
      <div style="font-size: 0.85rem; color: #8F6B1A; margin-top: 6px;">
        วันที่ต้องการให้มีผล: ${fmtDate(req.effective_date)}
      </div>
    </div>

    <div class="field">
      <label>เหตุผลความจำเป็น</label>
      <div style="background: var(--white); padding: 12px; border: 1.5px solid var(--line); border-radius: 8px; font-size: 0.95rem; line-height: 1.6;">
        ${req.reason}
      </div>
    </div>
  `;

  const footer = `
    <button type="button" class="btn btn-primary" onclick="window.closeAppModal()">ปิดหน้าต่าง</button>
  `;

  showModal({
    title: 'รายละเอียดคำร้องขอสลับห้องพัก',
    body,
    footer,
    maxWidth: '520px'
  });
}

// ฟอร์มสำหรับนักศึกษาเพื่อยื่นคำร้องขอสลับห้องพัก
function renderNewRequestView() {
  const currentRoom = currentUser && currentUser.room ? currentUser.room : '302';
  const userName = currentUser ? currentUser.name : 'นักศึกษา';
  const userPhone = currentUser && currentUser.phone ? currentUser.phone : '089-123-4567';

  return `
    <div class="card" style="max-width: 680px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="width: 50px; height: 50px; background: var(--mint-50); color: var(--emerald); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 10px;">
          ${ic('swap')}
        </div>
        <h3>แบบฟอร์มขอสลับ / ขอย้ายห้องพัก</h3>
        <p style="color: var(--muted); font-size: 0.9rem;">
          กรอกข้อมูลและเหตุผลความจำเป็น เพื่อเสนอให้คณะกรรมการหอพักพิจารณา
        </p>
      </div>

      <form id="swap-form">
        <div style="background: var(--mint-50); border: 1px solid var(--line); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
            <div>
              <span style="font-size: 0.8rem; color: var(--muted);">ผู้ยื่นคำร้อง:</span>
              <div style="font-weight: 600; color: var(--teal-950);">${userName}</div>
            </div>
            <div>
              <span style="font-size: 0.8rem; color: var(--muted);">ห้องพักปัจจุบัน:</span>
              <div style="font-weight: 600; color: var(--emerald);">ห้อง ${currentRoom}</div>
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div class="field">
            <label>ห้องที่ประสงค์จะขอย้ายไป *</label>
            <input type="text" id="f-target" placeholder="เช่น 201 หรือ 103" required>
          </div>
          <div class="field">
            <label>เบอร์โทรศัพท์ที่ติดต่อได้สะดวก *</label>
            <input type="tel" id="f-phone" value="${userPhone}" required>
          </div>
        </div>

        <div class="field">
          <label>วันที่ประสงค์จะให้เริ่มมีผลการย้าย *</label>
          <input type="date" id="f-date" value="${new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]}" required>
        </div>

        <div class="field">
          <label>เหตุผลความจำเป็นในการขอย้ายห้องพัก *</label>
          <textarea id="f-reason" rows="4" placeholder="ระบุเหตุผล เช่น สลับกับเพื่อนเพื่อทำงานกลุ่ม, ปัญหาเรื่องเสียง, ต้องการแสงธรรมชาติวาดภาพศิลปะ ฯลฯ" required></textarea>
        </div>

        <div style="margin-top: 24px; display: flex; gap: 12px;">
          <button type="button" class="btn btn-outline" style="flex: 1;" onclick="window.switchView('dashboard')">ยกเลิก</button>
          <button type="submit" class="btn btn-primary" style="flex: 2;">
            ${ic('check')} ยืนยันการส่งคำร้อง
          </button>
        </div>
      </form>
    </div>
  `;
}


/* ========== js/maintenance.js ========== */
// js/maintenance.js



let maintenanceFilter = 'all';
async function renderMaintenanceView() {
  setTimeout(() => {
    bindMaintenanceEvents();
    loadMaintenanceData();
  }, 0);

  const isStudent = currentUser && currentUser.role === 'student';

  return `
    <div class="card">
      <div class="card-header-actions">
        <div>
          <h3>${ic('wrench')} ระบบแจ้งซ่อมและงานบริการบำรุงรักษา (Maintenance System)</h3>
          <p style="color: var(--muted); margin-top: 4px; font-size: 0.9rem;">
            ${isStudent ? 'แจ้งปัญหาอุปกรณ์ชำรุดเสียหายในห้องพัก หรือพื้นที่ส่วนกลาง' : 'ตรวจสอบรายการแจ้งซ่อม มอบหมายงานช่าง และบันทึกสถานะการแก้ไข'}
          </p>
        </div>
        <button class="btn btn-primary" id="btn-create-ticket">
          ${ic('plus')} แจ้งซ่อมรายการใหม่
        </button>
      </div>

      <!-- Filter Tabs -->
      <div class="toolbar-filter-grid" style="margin-top: 16px;">
        <div class="filter-tabs" id="maint-filter-tabs">
          <button class="filter-tab-btn active" data-status="all">ทั้งหมด</button>
          <button class="filter-tab-btn" data-status="pending">รอรับเรื่อง</button>
          <button class="filter-tab-btn" data-status="in_progress">กำลังดำเนินการ</button>
          <button class="filter-tab-btn" data-status="completed">ซ่อมเสร็จสิ้น</button>
        </div>
      </div>

      <div class="table-responsive" style="margin-top: 16px;">
        <table class="modern-table">
          <thead>
            <tr>
              <th>รหัสแจ้งซ่อม</th>
              <th>ห้องพัก / ผู้แจ้ง</th>
              <th>หมวดหมู่งาน</th>
              <th>รายละเอียดปัญหา</th>
              <th>ความเร่งด่วน</th>
              <th>ช่างผู้รับผิดชอบ</th>
              <th>สถานะ</th>
              <th>การกระทำ</th>
            </tr>
          </thead>
          <tbody id="maintenance-tbody">
            <tr><td colspan="8" style="text-align:center; padding: 30px; color:var(--muted);">กำลังโหลดรายการแจ้งซ่อม...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function loadMaintenanceData() {
  const tbody = document.getElementById('maintenance-tbody');
  if (!tbody) return;

  const { data: tickets, error } = await supabase.from('maintenance').select('*').order('created_at', { ascending: false });

  if (error || !tickets) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--danger); padding: 24px;">ไม่สามารถโหลดข้อมูลแจ้งซ่อมได้</td></tr>`;
    return;
  }

  let list = tickets;
  const isStudent = currentUser && currentUser.role === 'student';
  if (isStudent && currentUser.room) {
    // If student, filter by their room
    list = tickets.filter(t => t.room_number === currentUser.room);
  }

  if (maintenanceFilter !== 'all') {
    list = list.filter(t => t.status === maintenanceFilter);
  }

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 30px; color:var(--muted);">ไม่มีรายการแจ้งซ่อมในขณะนี้</td></tr>`;
    return;
  }

  let html = '';
  list.forEach(t => {
    let statusClass = 'pending';
    let statusText = 'รอรับเรื่อง';
    if (t.status === 'in_progress') { statusClass = 'in-progress'; statusText = 'กำลังดำเนินการ'; }
    else if (t.status === 'completed') { statusClass = 'approved'; statusText = 'ซ่อมเสร็จแล้ว'; }

    let urgencyBadge = '<span class="badge" style="background:#eef8f2; color:var(--emerald);">ปกติ</span>';
    if (t.urgency === 'high') {
      urgencyBadge = '<span class="badge" style="background:#FDE8E7; color:var(--danger); font-weight:600;">⚡ ด่วนมาก</span>';
    } else if (t.urgency === 'medium') {
      urgencyBadge = '<span class="badge" style="background:#FEF3D6; color:#8F6B1A;">ปานกลาง</span>';
    }

    html += `
      <tr>
        <td><strong>${t.id}</strong></td>
        <td>
          <div style="font-weight:600; color:var(--teal-950);">ห้อง ${t.room_number}</div>
          <small style="color:var(--muted);">${t.requester_name} (${t.phone || '-'})</small>
        </td>
        <td>
          <span class="badge" style="background:var(--mint-50); color:var(--teal-900); font-weight:500;">
            ${t.category}
          </span>
        </td>
        <td style="max-width: 240px;">
          <div style="font-size:0.9rem; line-height:1.4;">${t.description}</div>
          <small style="color:var(--muted);">แจ้งเมื่อ: ${fmtDate(t.created_at)}</small>
        </td>
        <td>${urgencyBadge}</td>
        <td>${t.technician || '<span style="color:var(--muted);">ยังไม่ระบุ</span>'}</td>
        <td><span class="badge ${statusClass}">${statusText}</span></td>
        <td>
          <div style="display:flex; gap:6px;">
            <button class="btn btn-outline btn-sm btn-update-ticket" data-id="${t.id}" title="อัปเดตสถานะ">
              ${ic('gear')} อัปเดต
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;

  tbody.querySelectorAll('.btn-update-ticket').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      const target = tickets.find(x => x.id === id);
      if (target) openUpdateTicketModal(target);
    };
  });
}

function bindMaintenanceEvents() {
  const tabs = document.getElementById('maint-filter-tabs');
  if (tabs) {
    tabs.querySelectorAll('.filter-tab-btn').forEach(btn => {
      btn.onclick = () => {
        tabs.querySelectorAll('.filter-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        maintenanceFilter = btn.getAttribute('data-status');
        loadMaintenanceData();
      };
    });
  }

  const btnCreate = document.getElementById('btn-create-ticket');
  if (btnCreate) btnCreate.onclick = openCreateTicketModal;
}

function openCreateTicketModal() {
  const defaultRoom = currentUser && currentUser.room ? currentUser.room : '302';
  const defaultName = currentUser ? currentUser.name : '';
  const defaultPhone = currentUser && currentUser.phone ? currentUser.phone : '';

  const body = `
    <form id="form-create-ticket">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
        <div class="field">
          <label>หมายเลขห้อง *</label>
          <input type="text" id="tk-room" value="${defaultRoom}" required>
        </div>
        <div class="field">
          <label>หมวดหมู่งานซ่อม *</label>
          <select id="tk-cat" class="form-select">
            <option value="เครื่องปรับอากาศ">เครื่องปรับอากาศ (แอร์)</option>
            <option value="ระบบประปา">ระบบประปา / ห้องน้ำ / ก๊อกรั่ว</option>
            <option value="ไฟฟ้า/แสงสว่าง">ระบบไฟฟ้า / หลอดไฟ / ปลั๊กไฟ</option>
            <option value="เฟอร์นิเจอร์/ประตู">เฟอร์นิเจอร์ / บานพับ / ประตู-หน้าต่าง</option>
            <option value="อินเทอร์เน็ต Wi-Fi">อินเทอร์เน็ต Wi-Fi / เคเบิล</option>
            <option value="อื่นๆ">อื่นๆ</option>
          </select>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
        <div class="field">
          <label>ชื่อผู้แจ้ง *</label>
          <input type="text" id="tk-name" value="${defaultName}" required>
        </div>
        <div class="field">
          <label>เบอร์โทรศัพท์ติดต่อ *</label>
          <input type="tel" id="tk-phone" value="${defaultPhone}" required>
        </div>
      </div>

      <div class="field" style="margin-bottom: 14px;">
        <label>ระดับความเร่งด่วน</label>
        <select id="tk-urgency" class="form-select">
          <option value="low">ปกติ (1-3 วันทำการ)</option>
          <option value="medium">ปานกลาง (ภายใน 24 ชม.)</option>
          <option value="high">ด่วนมาก (ส่งผลกระทบต่อการอยู่อาศัยทันที)</option>
        </select>
      </div>

      <div class="field">
        <label>รายละเอียดอาการที่ชำรุดเสียหาย *</label>
        <textarea id="tk-desc" rows="4" placeholder="ระบุอาการชำรุด จุดที่เกิดปัญหา เช่น ท่อน้ำใต้ซิงค์รั่ว, แอร์มีน้ำหยด, ปลั๊กหัวเตียงไม่มีไฟ" required></textarea>
      </div>
    </form>
  `;

  const footer = `
    <button type="button" class="btn btn-outline" onclick="window.closeAppModal()">ยกเลิก</button>
    <button type="button" class="btn btn-primary" id="btn-submit-ticket">ส่งคำขอแจ้งซ่อม</button>
  `;

  showModal({
    title: 'เปิดใบแจ้งซ่อมอุปกรณ์ชำรุด (Maintenance Ticket)',
    body,
    footer,
    maxWidth: '560px'
  });

  document.getElementById('btn-submit-ticket').onclick = async () => {
    const room = document.getElementById('tk-room').value.trim();
    const cat = document.getElementById('tk-cat').value;
    const name = document.getElementById('tk-name').value.trim();
    const phone = document.getElementById('tk-phone').value.trim();
    const urgency = document.getElementById('tk-urgency').value;
    const desc = document.getElementById('tk-desc').value.trim();

    if (!room || !name || !phone || !desc) {
      toast('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
      return;
    }

    const newTicketId = 'FIX-' + Math.floor(100 + Math.random() * 900);

    await supabase.from('maintenance').insert([{
      id: newTicketId,
      room_number: room,
      requester_name: name,
      phone: phone,
      category: cat,
      description: desc,
      urgency: urgency,
      status: 'pending',
      technician: '',
      created_at: new Date().toISOString().split('T')[0]
    }]);

    toast(`เปิดใบแจ้งซ่อม ${newTicketId} เรียบร้อยแล้ว`, 'success');
    closeModal();
    loadMaintenanceData();
  };
}

function openUpdateTicketModal(ticket) {
  const body = `
    <form id="form-update-ticket">
      <div style="background: var(--mint-50); padding: 14px; border-radius: 10px; margin-bottom: 16px; border: 1px solid var(--line);">
        <div style="display:flex; justify-content:space-between;">
          <strong style="color:var(--teal-950);">${ticket.id} — ห้อง ${ticket.room_number}</strong>
          <span style="font-size:0.85rem; color:var(--muted);">${fmtDate(ticket.created_at)}</span>
        </div>
        <div style="margin-top:6px; font-size:0.9rem; color:var(--teal-900);">หมวดหมู่: <strong>${ticket.category}</strong></div>
        <div style="margin-top:4px; font-size:0.85rem; color:var(--ink);">${ticket.description}</div>
      </div>

      <div class="field" style="margin-bottom: 14px;">
        <label>สถานะงานซ่อม</label>
        <select id="up-status" class="form-select">
          <option value="pending" ${ticket.status === 'pending' ? 'selected' : ''}>รอรับเรื่อง (Pending)</option>
          <option value="in_progress" ${ticket.status === 'in_progress' ? 'selected' : ''}>กำลังดำเนินการซ่อม (In Progress)</option>
          <option value="completed" ${ticket.status === 'completed' ? 'selected' : ''}>ซ่อมเสร็จสิ้นเรียบร้อย (Completed)</option>
        </select>
      </div>

      <div class="field" style="margin-bottom: 14px;">
        <label>ช่างผู้รับผิดชอบงาน</label>
        <input type="text" id="up-tech" value="${ticket.technician || ''}" placeholder="เช่น ช่างวิเชียร, ช่างสมบูรณ์">
      </div>
    </form>
  `;

  const footer = `
    <button type="button" class="btn btn-outline" onclick="window.closeAppModal()">ยกเลิก</button>
    <button type="button" class="btn btn-primary" id="btn-save-ticket-status">บันทึกความคืบหน้า</button>
  `;

  showModal({
    title: `อัปเดตสถานะงานซ่อม ${ticket.id}`,
    body,
    footer,
    maxWidth: '520px'
  });

  document.getElementById('btn-save-ticket-status').onclick = async () => {
    const st = document.getElementById('up-status').value;
    const tech = document.getElementById('up-tech').value.trim();

    await supabase.from('maintenance').eq('id', ticket.id).update({
      status: st,
      technician: tech
    });

    toast('บันทึกความคืบหน้ารายการซ่อมเรียบร้อยแล้ว', 'success');
    closeModal();
    loadMaintenanceData();
  };
}


/* ========== js/parcels.js ========== */
// js/parcels.js



let parcelFilter = 'all';
let parcelSearch = '';
async function renderParcelsView() {
  setTimeout(() => {
    bindParcelsEvents();
    loadParcelsData();
  }, 0);

  const isStudent = currentUser && currentUser.role === 'student';

  return `
    <div class="card">
      <div class="card-header-actions">
        <div>
          <h3>${ic('box')} ระบบพัสดุและไปรษณีย์ภัณฑ์ (Parcel Management)</h3>
          <p style="color: var(--muted); margin-top: 4px; font-size: 0.9rem;">
            ${isStudent ? 'ตรวจสอบรายการพัสดุที่มาถึงหอพัก และยืนยันการรับพัสดุ' : 'บันทึกพัสดุที่จัดส่งถึงหอพัก แจ้งเตือนผู้พัก และบันทึกประวัติการรับ'}
          </p>
        </div>
        ${!isStudent ? `
          <button class="btn btn-primary" id="btn-add-parcel">
            ${ic('plus')} บันทึกพัสดุเข้าใหม่
          </button>
        ` : ''}
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="toolbar-filter-grid" style="margin-top: 16px;">
        <div class="search-box-wrap" style="flex: 1;">
          ${ic('search')}
          <input type="text" id="parcels-search-input" placeholder="ค้นหาเลขพัสดุ, ชื่อผู้รับ หรือหมายเลขห้อง...">
        </div>

        <div class="filter-tabs" id="parcel-filter-tabs">
          <button class="filter-tab-btn active" data-status="all">ทั้งหมด</button>
          <button class="filter-tab-btn" data-status="waiting">รอผู้พักมารับ</button>
          <button class="filter-tab-btn" data-status="collected">รับแล้วเรียบร้อย</button>
        </div>
      </div>

      <div class="table-responsive" style="margin-top: 16px;">
        <table class="modern-table">
          <thead>
            <tr>
              <th>หมายเลขพัสดุ / ขนส่ง</th>
              <th>ห้องพัก / ผู้รับ</th>
              <th>ลักษณะพัสดุ</th>
              <th>วันที่มาถึง</th>
              <th>สถานะ</th>
              <th>การดำเนินการ</th>
            </tr>
          </thead>
          <tbody id="parcels-tbody">
            <tr><td colspan="6" style="text-align:center; padding: 30px; color:var(--muted);">กำลังโหลดข้อมูลพัสดุ...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function loadParcelsData() {
  const tbody = document.getElementById('parcels-tbody');
  if (!tbody) return;

  const { data: parcels, error } = await supabase.from('parcels').select('*').order('arrived_at', { ascending: false });

  if (error || !parcels) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--danger); padding: 24px;">ไม่สามารถโหลดข้อมูลพัสดุได้</td></tr>`;
    return;
  }

  let list = parcels;
  const isStudent = currentUser && currentUser.role === 'student';
  if (isStudent && currentUser.room) {
    list = parcels.filter(p => p.room_number === currentUser.room);
  }

  if (parcelFilter !== 'all') {
    list = list.filter(p => p.status === parcelFilter);
  }

  if (parcelSearch) {
    const q = parcelSearch.toLowerCase();
    list = list.filter(p => 
      (p.tracking_number || '').toLowerCase().includes(q) ||
      (p.recipient_name || '').toLowerCase().includes(q) ||
      (p.room_number || '').toLowerCase().includes(q) ||
      (p.courier || '').toLowerCase().includes(q)
    );
  }

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 30px; color:var(--muted);">ไม่พบรายการพัสดุตามเงื่อนไข</td></tr>`;
    return;
  }

  let html = '';
  list.forEach(p => {
    const isCollected = p.status === 'collected';
    const badgeClass = isCollected ? 'approved' : 'pending';
    const badgeText = isCollected ? 'รับแล้ว' : 'รอรับที่สำนักงาน';

    html += `
      <tr>
        <td>
          <div style="font-weight: 600; color:var(--teal-950);">${p.tracking_number}</div>
          <small style="color:var(--emerald); font-weight:500;">${p.courier}</small>
        </td>
        <td>
          <div style="font-weight: 600; color:var(--teal-900);">ห้อง ${p.room_number}</div>
          <small style="color:var(--muted);">${p.recipient_name}</small>
        </td>
        <td>${p.description || 'กล่องพัสดุมาตรฐาน'}</td>
        <td>
          <div>${fmtDate(p.arrived_at)}</div>
          ${isCollected && p.collected_at ? `<small style="color:var(--muted);">รับเมื่อ: ${fmtDate(p.collected_at)}</small>` : ''}
        </td>
        <td><span class="badge ${badgeClass}">${badgeText}</span></td>
        <td>
          ${!isCollected ? `
            <button class="btn btn-primary btn-sm btn-collect-parcel" data-id="${p.id}" title="บันทึกว่ารับแล้ว">
              ${ic('check')} ยืนยันรับพัสดุ
            </button>
          ` : `
            <span style="font-size:0.85rem; color:var(--muted);">✓ รับมอบเรียบร้อย</span>
          `}
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;

  tbody.querySelectorAll('.btn-collect-parcel').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id');
      const target = parcels.find(x => x.id === id);
      if (!target) return;
      if (confirm(`ยืนยันการรับพัสดุเลขที่ "${target.tracking_number}" สำหรับห้อง ${target.room_number}?`)) {
        await supabase.from('parcels').eq('id', id).update({
          status: 'collected',
          collected_at: new Date().toISOString().split('T')[0]
        });
        toast('บันทึกการรับพัสดุเรียบร้อยแล้ว', 'success');
        loadParcelsData();
      }
    };
  });
}

function bindParcelsEvents() {
  const tabs = document.getElementById('parcel-filter-tabs');
  if (tabs) {
    tabs.querySelectorAll('.filter-tab-btn').forEach(btn => {
      btn.onclick = () => {
        tabs.querySelectorAll('.filter-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        parcelFilter = btn.getAttribute('data-status');
        loadParcelsData();
      };
    });
  }

  const searchInput = document.getElementById('parcels-search-input');
  if (searchInput) {
    searchInput.oninput = (e) => {
      parcelSearch = e.target.value.trim();
      loadParcelsData();
    };
  }

  const btnAdd = document.getElementById('btn-add-parcel');
  if (btnAdd) btnAdd.onclick = openAddParcelModal;
}

function openAddParcelModal() {
  const body = `
    <form id="form-add-parcel">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
        <div class="field">
          <label>บริษัทขนส่ง *</label>
          <select id="pk-courier" class="form-select">
            <option value="Flash Express">Flash Express</option>
            <option value="Kerry Express">Kerry Express</option>
            <option value="ไปรษณีย์ไทย (EMS)">ไปรษณีย์ไทย (EMS / ลงทะเบียน)</option>
            <option value="J&T Express">J&T Express</option>
            <option value="SPX Express (Shopee)">SPX Express (Shopee)</option>
            <option value="LEX (Lazada)">LEX (Lazada)</option>
            <option value="อื่นๆ">อื่นๆ</option>
          </select>
        </div>
        <div class="field">
          <label>หมายเลขพัสดุ (Tracking No.) *</label>
          <input type="text" id="pk-tracking" placeholder="เช่น TH0129384756" required>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
        <div class="field">
          <label>ห้องพักผู้รับ *</label>
          <input type="text" id="pk-room" placeholder="เช่น 302" required>
        </div>
        <div class="field">
          <label>ชื่อผู้รับตามจ่าหน้า *</label>
          <input type="text" id="pk-name" placeholder="เช่น นายสมชาย ช่างศิลป์" required>
        </div>
      </div>

      <div class="field">
        <label>ลักษณะพัสดุ / หมายเหตุ</label>
        <input type="text" id="pk-desc" placeholder="เช่น กล่องใหญ่, ซองเอกสาร, อาหาร/ของสด">
      </div>
    </form>
  `;

  const footer = `
    <button type="button" class="btn btn-outline" onclick="window.closeAppModal()">ยกเลิก</button>
    <button type="button" class="btn btn-primary" id="btn-submit-parcel">บันทึกรับพัสดุ</button>
  `;

  showModal({
    title: 'บันทึกพัสดุมาส่งใหม่',
    body,
    footer,
    maxWidth: '540px'
  });

  document.getElementById('btn-submit-parcel').onclick = async () => {
    const courier = document.getElementById('pk-courier').value;
    const tracking = document.getElementById('pk-tracking').value.trim();
    const room = document.getElementById('pk-room').value.trim();
    const name = document.getElementById('pk-name').value.trim();
    const desc = document.getElementById('pk-desc').value.trim();

    if (!tracking || !room || !name) {
      toast('กรุณากรอกข้อมูลสำคัญให้ครบถ้วน', 'error');
      return;
    }

    await supabase.from('parcels').insert([{
      tracking_number: tracking,
      courier,
      room_number: room,
      recipient_name: name,
      description: desc || 'กล่องพัสดุ',
      status: 'waiting',
      arrived_at: new Date().toISOString().split('T')[0]
    }]);

    toast(`บันทึกพัสดุสำหรับห้อง ${room} สำเร็จ`, 'success');
    closeModal();
    loadParcelsData();
  };
}


/* ========== js/announcements.js ========== */
// js/announcements.js
async function renderAnnouncementsView() {
  setTimeout(() => {
    bindAnnouncementsEvents();
    loadAnnouncementsData();
  }, 0);

  const canEdit = currentUser && (currentUser.role === 'admin' || currentUser.role === 'staff');

  return `
    <div class="card">
      <div class="card-header-actions">
        <div>
          <h3>${ic('bell')} กระดานข่าวสารและประกาศหอพัก (Announcements)</h3>
          <p style="color: var(--muted); margin-top: 4px; font-size: 0.9rem;">
            ติดตามข่าวสาร กำหนดการซ่อมบำรุง และประกาศสำคัญจากสำนักงานหอพัก
          </p>
        </div>
        ${canEdit ? `
          <button class="btn btn-primary" id="btn-add-announcement">
            ${ic('plus')} สร้างประกาศใหม่
          </button>
        ` : ''}
      </div>

      <div id="announcements-container" style="margin-top: 20px; display: flex; flex-direction: column; gap: 16px;">
        <div style="text-align:center; padding: 30px; color:var(--muted);">กำลังโหลดประกาศ...</div>
      </div>
    </div>
  `;
}

async function loadAnnouncementsData() {
  const container = document.getElementById('announcements-container');
  if (!container) return;

  const { data: list, error } = await supabase.from('announcements').select('*').order('date', { ascending: false });

  if (error || !list) {
    container.innerHTML = `<p style="color:var(--danger); text-align:center;">เกิดข้อผิดพลาดในการโหลดประกาศ</p>`;
    return;
  }

  if (list.length === 0) {
    container.innerHTML = `<p style="color:var(--muted); text-align:center;">ยังไม่มีประกาศในขณะนี้</p>`;
    return;
  }

  const canEdit = currentUser && (currentUser.role === 'admin' || currentUser.role === 'staff');

  let html = '';
  list.forEach(a => {
    let catColor = 'var(--emerald)';
    if (a.category === 'ซ่อมบำรุง') catColor = 'var(--sand-600)';
    else if (a.category === 'การเงิน') catColor = 'var(--sky)';
    else if (a.category === 'กฎระเบียบ') catColor = 'var(--danger)';

    html += `
      <div class="announcement-item ${a.pinned ? 'pinned' : ''}">
        <div class="ann-header">
          <div style="display: flex; align-items: center; gap: 10px;">
            ${a.pinned ? `<span class="pinned-tag">📌 ปักหมุด</span>` : ''}
            <span class="badge" style="background:var(--mint-50); color:${catColor}; font-weight:600;">
              ${a.category}
            </span>
            <span class="ann-date">${fmtDate(a.date)}</span>
          </div>
          ${canEdit ? `
            <button class="btn btn-outline btn-sm btn-del-ann" data-id="${a.id}" style="color:var(--danger); border-color:var(--danger);" title="ลบประกาศ">
              ${ic('trash')}
            </button>
          ` : ''}
        </div>
        <h4 class="ann-title">${a.title}</h4>
        <div class="ann-content">${a.content}</div>
      </div>
    `;
  });

  container.innerHTML = html;

  if (canEdit) {
    container.querySelectorAll('.btn-del-ann').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.getAttribute('data-id');
        if (confirm('คุณต้องการลบประกาศนี้ใช่หรือไม่?')) {
          await supabase.from('announcements').eq('id', id).delete();
          toast('ลบประกาศเรียบร้อยแล้ว', 'info');
          loadAnnouncementsData();
        }
      };
    });
  }
}

function bindAnnouncementsEvents() {
  const btnAdd = document.getElementById('btn-add-announcement');
  if (btnAdd) btnAdd.onclick = openAddAnnouncementModal;
}

function openAddAnnouncementModal() {
  const body = `
    <form id="form-add-announcement">
      <div class="field" style="margin-bottom: 14px;">
        <label>หัวข้อประกาศ *</label>
        <input type="text" id="ann-title" placeholder="เช่น แจ้งกำหนดการทำความสะอาดอาคาร" required>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
        <div class="field">
          <label>หมวดหมู่</label>
          <select id="ann-cat" class="form-select">
            <option value="ทั่วไป">ทั่วไป</option>
            <option value="ซ่อมบำรุง">ซ่อมบำรุง</option>
            <option value="การเงิน">การเงิน / ค่าเช่า</option>
            <option value="กฎระเบียบ">กฎระเบียบหอพัก</option>
            <option value="กิจกรรม">กิจกรรม / ประชาสัมพันธ์</option>
          </select>
        </div>
        <div class="field" style="display:flex; align-items:center; gap:8px; margin-top:24px;">
          <input type="checkbox" id="ann-pinned" style="width:20px; height:20px; accent-color:var(--emerald);">
          <label for="ann-pinned" style="margin:0; cursor:pointer; font-weight:500;">ปักหมุดไว้บนสุด</label>
        </div>
      </div>

      <div class="field">
        <label>เนื้อหาประกาศ *</label>
        <textarea id="ann-content" rows="4" placeholder="พิมพ์รายละเอียดประกาศที่ต้องการแจ้งให้นักศึกษาทราบ..." required></textarea>
      </div>
    </form>
  `;

  const footer = `
    <button type="button" class="btn btn-outline" onclick="window.closeAppModal()">ยกเลิก</button>
    <button type="button" class="btn btn-primary" id="btn-submit-ann">โพสต์ประกาศ</button>
  `;

  showModal({
    title: 'สร้างประกาศข่าวสารใหม่',
    body,
    footer,
    maxWidth: '560px'
  });

  document.getElementById('btn-submit-ann').onclick = async () => {
    const title = document.getElementById('ann-title').value.trim();
    const cat = document.getElementById('ann-cat').value;
    const pinned = document.getElementById('ann-pinned').checked;
    const content = document.getElementById('ann-content').value.trim();

    if (!title || !content) {
      toast('กรุณาระบุหัวข้อและเนื้อหาประกาศ', 'error');
      return;
    }

    await supabase.from('announcements').insert([{
      title,
      category: cat,
      pinned,
      content,
      date: new Date().toISOString().split('T')[0]
    }]);

    toast('เผยแพร่ประกาศเรียบร้อยแล้ว', 'success');
    closeModal();
    loadAnnouncementsData();
  };
}


/* ========== js/reports.js ========== */
// js/reports.js
async function renderReportsView() {
  setTimeout(() => {
    loadReportsData();
  }, 0);

  return `
    <div class="card">
      <div class="card-header-actions">
        <div>
          <h3>${ic('chart')} รายงานสถิติและภาพรวมการบริหารงานหอพัก (Analytics & Reports)</h3>
          <p style="color: var(--muted); margin-top: 4px; font-size: 0.9rem;">
            วิเคราะห์อัตราการเข้าพัก การชำระเงินค่าน้ำ-ค่าไฟ และประสิทธิภาพการบริการ
          </p>
        </div>
      </div>

      <div class="stat-cards" id="reports-top-stats" style="margin-top: 20px;">
        <div class="scard"><div class="num">...</div><div class="lbl">กำลังประมวลผล...</div></div>
      </div>

      <div class="dashboard-grid-2col" style="margin-top: 24px;">
        <!-- Occupancy Breakdown -->
        <div class="card">
          <h4>${ic('door')} สัดส่วนอัตราการเข้าพักห้องพัก</h4>
          <p style="color: var(--muted); font-size: 0.85rem; margin-bottom: 20px;">การกระจายตัวของสถานะห้องพักในอาคาร</p>
          <div id="report-occupancy-bars">กำลังคำนวณ...</div>
        </div>

        <!-- Parcels Breakdown -->
        <div class="card">
          <h4>${ic('box')} สถิติการรับพัสดุไปรษณีย์</h4>
          <p style="color: var(--muted); font-size: 0.85rem; margin-bottom: 20px;">สัดส่วนพัสดุที่ส่งมอบแล้วและรอรับ</p>
          <div id="report-parcels-bars">กำลังคำนวณ...</div>
        </div>

        <!-- Utilities Revenue -->
        <div class="card">
          <h4>${ic('bill')} การจัดเก็บรายได้ค่าน้ำ-ค่าไฟ และค่าเช่า</h4>
          <p style="color: var(--muted); font-size: 0.85rem; margin-bottom: 20px;">สัดส่วนการชำระเงินของรอบบิลปัจจุบัน</p>
          <div id="report-utility-bars">กำลังคำนวณ...</div>
        </div>

        <!-- Maintenance Turnaround -->
        <div class="card">
          <h4>${ic('wrench')} สถิติการแจ้งซ่อมบำรุง</h4>
          <p style="color: var(--muted); font-size: 0.85rem; margin-bottom: 20px;">ประสิทธิภาพและความรวดเร็วในการแก้ไขปัญหา</p>
          <div id="report-maint-bars">กำลังคำนวณ...</div>
        </div>
      </div>
    </div>
  `;
}

async function loadReportsData() {
  const { data: rooms } = await supabase.from('rooms').select('*');
  const { data: parcels } = await supabase.from('parcels').select('*');
  const { data: bills } = await supabase.from('meter_readings').select('*');
  const { data: tickets } = await supabase.from('maintenance').select('*');

  const topStats = document.getElementById('reports-top-stats');
  if (topStats) {
    const totalRooms = rooms ? rooms.length : 0;
    const occupied = rooms ? rooms.filter(r => r.status === 'occupied').length : 0;
    const occRate = totalRooms > 0 ? Math.round((occupied / totalRooms) * 100) : 0;
    const totalRevenue = bills ? bills.reduce((a, c) => a + (c.total_price || 0), 0) : 0;
    const paidRevenue = bills ? bills.filter(b => b.status === 'paid').reduce((a, c) => a + (c.total_price || 0), 0) : 0;
    const collectionRate = totalRevenue > 0 ? Math.round((paidRevenue / totalRevenue) * 100) : 0;

    topStats.innerHTML = `
      <div class="scard">
        <div class="top"><div class="ic c">${ic('door')}</div></div>
        <div class="num">${occRate}%</div>
        <div class="lbl">อัตราการเข้าพักเฉลี่ย</div>
      </div>
      <div class="scard">
        <div class="top"><div class="ic a">${ic('bill')}</div></div>
        <div class="num">${fmtCurrency(totalRevenue)}</div>
        <div class="lbl">รายได้เรียกเก็บเดือนล่าสุด</div>
      </div>
      <div class="scard">
        <div class="top"><div class="ic b">${ic('check')}</div></div>
        <div class="num">${collectionRate}%</div>
        <div class="lbl">จัดเก็บรายได้สำเร็จ</div>
      </div>
      <div class="scard">
        <div class="top"><div class="ic d">${ic('wrench')}</div></div>
        <div class="num">${tickets ? tickets.length : 0}</div>
        <div class="lbl">รายการแจ้งซ่อมทั้งหมด</div>
      </div>
    `;
  }

  const renderBar = (label, count, total, color) => {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return `
      <div style="margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; font-size: 0.88rem; margin-bottom: 6px;">
          <span>${label}</span>
          <strong>${count} รายการ (${pct}%)</strong>
        </div>
        <div style="background: var(--mint-50); border-radius: 999px; height: 10px; overflow: hidden; border: 1px solid var(--line);">
          <div style="width: ${pct}%; background: ${color}; height: 100%; border-radius: 999px; transition: width 0.6s ease;"></div>
        </div>
      </div>
    `;
  };

  // Occupancy
  const occBox = document.getElementById('report-occupancy-bars');
  if (occBox && rooms) {
    const tot = rooms.length;
    const occ = rooms.filter(r => r.status === 'occupied').length;
    const vac = rooms.filter(r => r.status === 'vacant').length;
    const mnt = rooms.filter(r => r.status === 'maintenance').length;
    occBox.innerHTML = `
      ${renderBar('มีผู้เช่าแล้ว (Occupied)', occ, tot, 'var(--teal-900)')}
      ${renderBar('ห้องว่างพร้อมเข้าอยู่ (Vacant)', vac, tot, 'var(--emerald)')}
      ${renderBar('ปิดปรับปรุง / ซ่อมบำรุง (Maintenance)', mnt, tot, 'var(--sand-600)')}
    `;
  }

  // Parcels
  const parcelBox = document.getElementById('report-parcels-bars');
  if (parcelBox && parcels) {
    const tot = parcels.length || 1;
    const col = parcels.filter(p => p.status === 'collected').length;
    const wai = parcels.filter(p => p.status === 'waiting').length;
    parcelBox.innerHTML = `
      ${renderBar('รับมอบแล้วเรียบร้อย (Collected)', col, tot, 'var(--emerald)')}
      ${renderBar('รอผู้พักมารับ (Waiting)', wai, tot, 'var(--sand-600)')}
    `;
  }

  // Utilities
  const utilBox = document.getElementById('report-utility-bars');
  if (utilBox && bills) {
    const tot = bills.length || 1;
    const paid = bills.filter(b => b.status === 'paid').length;
    const pend = bills.filter(b => b.status === 'pending').length;
    utilBox.innerHTML = `
      ${renderBar('ชำระแล้วเรียบร้อย (Paid)', paid, tot, 'var(--emerald)')}
      ${renderBar('รอชำระเงิน / ค้างชำระ (Pending)', pend, tot, 'var(--danger)')}
    `;
  }

  // Maintenance
  const maintBox = document.getElementById('report-maint-bars');
  if (maintBox && tickets) {
    const tot = tickets.length || 1;
    const comp = tickets.filter(t => t.status === 'completed').length;
    const prog = tickets.filter(t => t.status === 'in_progress').length;
    const pend = tickets.filter(t => t.status === 'pending').length;
    maintBox.innerHTML = `
      ${renderBar('ซ่อมเสร็จสิ้น (Completed)', comp, tot, 'var(--emerald)')}
      ${renderBar('กำลังดำเนินการซ่อม (In Progress)', prog, tot, 'var(--sky)')}
      ${renderBar('รอรับเรื่อง (Pending)', pend, tot, 'var(--sand-600)')}
    `;
  }
}


/* ========== js/settings.js ========== */
// js/settings.js
async function renderSettingsView() {
  const db = supabase.getRawData();
  const s = db.settings || {};
  const isAdmin = currentUser && currentUser.role === 'admin';

  setTimeout(() => {
    bindSettingsEvents();
  }, 0);

  return `
    <div class="card" style="max-width: 800px; margin: 0 auto;">
      <div class="card-header-actions" style="margin-bottom: 20px;">
        <div>
          <h3>${ic('gear')} ตั้งค่าระบบและบัญชีผู้ใช้งาน</h3>
          <p style="color: var(--muted); margin-top: 4px; font-size: 0.9rem;">
            กำหนดอัตราค่าน้ำ ค่าไฟ บัญชีพร้อมเพย์ และข้อมูลติดต่อของหอพัก
          </p>
        </div>
      </div>

      <!-- Account Settings -->
      <form id="form-account-settings" style="margin-bottom: 32px;">
        <h4 style="color:var(--teal-950); margin-bottom:14px; border-bottom:1.5px solid var(--line); padding-bottom:8px;">
          👤 ข้อมูลบัญชีผู้ใช้งานปัจจุบัน
        </h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 14px;">
          <div class="field">
            <label>ชื่อผู้ใช้งาน (Username)</label>
            <input type="text" value="${currentUser ? currentUser.username : ''}" disabled>
          </div>
          <div class="field">
            <label>ระดับสิทธิ์ (Role)</label>
            <input type="text" value="${currentUser ? currentUser.roleTitle : ''}" disabled>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 14px;">
          <div class="field">
            <label>รหัสผ่านใหม่ (ปล่อยว่างหากไม่เปลี่ยน)</label>
            <input type="password" id="set-new-pwd" placeholder="••••••••">
          </div>
          <div class="field">
            <label>ยืนยันรหัสผ่านใหม่อีกครั้ง</label>
            <input type="password" id="set-confirm-pwd" placeholder="••••••••">
          </div>
        </div>
        <button type="submit" class="btn btn-primary btn-sm">บันทึกรหัสผ่านใหม่</button>
      </form>

      ${isAdmin ? `
        <!-- Dormitory System Rates & Master Info -->
        <form id="form-dorm-settings" style="margin-bottom: 32px;">
          <h4 style="color:var(--teal-950); margin-bottom:14px; border-bottom:1.5px solid var(--line); padding-bottom:8px;">
            🏢 ข้อมูลหอพักและอัตราค่าสาธารณูปโภค (สำหรับ Admin)
          </h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 14px;">
            <div class="field">
              <label>ชื่อหอพัก</label>
              <input type="text" id="set-dorm-name" value="${s.dorm_name || 'Tanakrit Dormitory'}" required>
            </div>
            <div class="field">
              <label>สโลแกน / หน่วยงานสังกัด</label>
              <input type="text" id="set-dorm-sub" value="${s.sub_title || 'หอพักชายธนกฤษฎ์ นครศรีธรรมราช'}">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 14px;">
            <div class="field">
              <label>อัตราค่าน้ำประปา (บาท/หน่วย)</label>
              <input type="number" id="set-water-rate" value="${s.water_rate || 18}" required>
            </div>
            <div class="field">
              <label>อัตราค่าไฟฟ้า (บาท/หน่วย)</label>
              <input type="number" id="set-elec-rate" value="${s.electric_rate || 8}" required>
            </div>
            <div class="field">
              <label>ค่าบริการส่วนกลาง (บาท/เดือน)</label>
              <input type="number" id="set-common-fee" value="${s.common_fee || 100}" required>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 14px;">
            <div class="field">
              <label>เบอร์โทรศัพท์ติดต่อ</label>
              <input type="text" id="set-phone" value="${s.phone || '075-345-678, 089-999-8877'}">
            </div>
            <div class="field">
              <label>Line Official Account</label>
              <input type="text" id="set-line" value="${s.line_id || '@kpdorm'}">
            </div>
          </div>

          <div class="field" style="margin-bottom: 14px;">
            <label>หมายเลขบัญชีพร้อมเพย์สำหรับรับโอนเงินค่าเช่า</label>
            <input type="text" id="set-promptpay" value="${s.promptpay_number || '0899998877'}">
          </div>

          <button type="submit" class="btn btn-primary">บันทึกการตั้งค่าหอพัก</button>
        </form>

        <!-- System Reset / Maintenance -->
        <div style="background:#fde8e7; border:1px solid var(--danger); border-radius:12px; padding:18px;">
          <h4 style="color:var(--danger); margin:0 0 6px 0;">⚠️ จัดการข้อมูลและรีเซ็ตระบบ</h4>
          <p style="font-size:0.85rem; color:#8F2B24; margin:0 0 12px 0;">
            หากต้องการล้างข้อมูลทดสอบและคืนค่าเริ่มต้นทั้งหมดของระบบหอพัก สามารถกดปุ่มด้านล่างนี้
          </p>
          <button type="button" class="btn btn-outline" id="btn-reset-db" style="background:white; color:var(--danger); border-color:var(--danger);">
            ${ic('trash')} คืนค่าข้อมูลเริ่มต้นระบบ (Reset Database)
          </button>
        </div>
      ` : ''}
    </div>
  `;
}

function bindSettingsEvents() {
  const acctForm = document.getElementById('form-account-settings');
  if (acctForm) {
    acctForm.onsubmit = (e) => {
      e.preventDefault();
      const p1 = document.getElementById('set-new-pwd').value;
      const p2 = document.getElementById('set-confirm-pwd').value;
      if (p1 && p1 !== p2) {
        toast('รหัสผ่านยืนยันไม่ตรงกัน', 'error');
        return;
      }
      toast('บันทึกข้อมูลบัญชีเรียบร้อยแล้ว', 'success');
      acctForm.reset();
    };
  }

  const dormForm = document.getElementById('form-dorm-settings');
  if (dormForm) {
    dormForm.onsubmit = (e) => {
      e.preventDefault();
      const db = supabase.getRawData();
      db.settings = {
        dorm_name: document.getElementById('set-dorm-name').value.trim(),
        sub_title: document.getElementById('set-dorm-sub').value.trim(),
        water_rate: Number(document.getElementById('set-water-rate').value),
        electric_rate: Number(document.getElementById('set-elec-rate').value),
        common_fee: Number(document.getElementById('set-common-fee').value),
        phone: document.getElementById('set-phone').value.trim(),
        line_id: document.getElementById('set-line').value.trim(),
        promptpay_number: document.getElementById('set-promptpay').value.trim()
      };
      localStorage.setItem('tanakrit_dormitory_db_v1', JSON.stringify(db));
      toast('บันทึกการตั้งค่าหอพักเรียบร้อยแล้ว', 'success');
    };
  }

  const btnReset = document.getElementById('btn-reset-db');
  if (btnReset) {
    btnReset.onclick = () => {
      if (confirm('คุณต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้นหรือไม่?')) {
        supabase.resetToDefaults();
        toast('รีเซ็ตข้อมูลระบบกลับสู่ค่าเริ่มต้นเรียบร้อยแล้ว', 'success');
        setTimeout(() => location.reload(), 800);
      }
    };
  }
}


/* ========== js/dashboard.js ========== */
// js/dashboard.js




// แดชบอร์ดสำหรับ Staff / Admin
function renderStaffDashboard() {
  setTimeout(() => {
    loadStaffDashboardData();
  }, 0);

  return `
    <!-- Top Stat Metric Cards -->
    <div class="stat-cards" id="staff-stat-cards">
      <div class="scard"><div class="num">...</div><div class="lbl">กำลังโหลดสถิติ...</div></div>
    </div>

    <!-- Quick Action Toolbar -->
    <div class="card" style="margin-bottom: 24px;">
      <h3 style="margin-bottom: 12px;">⚡ เมนูดำเนินการด่วน (Quick Actions)</h3>
      <div class="quick-action-btns">
        <button class="btn btn-outline" onclick="window.switchView('rooms')">${ic('door')} จัดการผังห้องพัก</button>
        <button class="btn btn-outline" onclick="window.switchView('tenants')">${ic('users')} ทะเบียนผู้พักอาศัย</button>
        <button class="btn btn-outline" onclick="window.switchView('utilities')">${ic('bill')} บันทึกมิเตอร์น้ำ-ไฟ</button>
        <button class="btn btn-outline" onclick="window.switchView('maintenance')">${ic('wrench')} มอบหมายงานซ่อม</button>
        <button class="btn btn-outline" onclick="window.switchView('parcels')">${ic('box')} บันทึกรับพัสดุ</button>
        <button class="btn btn-outline" onclick="window.switchView('announcements')">${ic('bell')} สร้างประกาศ</button>
      </div>
    </div>

    <!-- 2 Column Layout for Activities -->
    <div class="dashboard-grid-2col">
      <!-- Recent Maintenance Tickets -->
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <h3>${ic('wrench')} รายการแจ้งซ่อมที่รอจัดการ</h3>
          <button class="btn btn-outline btn-sm" onclick="window.switchView('maintenance')">ดูทั้งหมด</button>
        </div>
        <div id="staff-recent-maintenance">กำลังโหลดข้อมูล...</div>
      </div>

      <!-- Recent Parcels -->
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <h3>${ic('box')} พัสดุมาใหม่ที่รอผู้พักมารับ</h3>
          <button class="btn btn-outline btn-sm" onclick="window.switchView('parcels')">ดูทั้งหมด</button>
        </div>
        <div id="staff-recent-parcels">กำลังโหลดข้อมูล...</div>
      </div>
    </div>
  `;
}

async function loadStaffDashboardData() {
  const statBox = document.getElementById('staff-stat-cards');
  const maintBox = document.getElementById('staff-recent-maintenance');
  const parcelBox = document.getElementById('staff-recent-parcels');

  const { data: rooms } = await supabase.from('rooms').select('*');
  const { data: tickets } = await supabase.from('maintenance').select('*');
  const { data: parcels } = await supabase.from('parcels').select('*');
  const { data: bills } = await supabase.from('meter_readings').select('*');

  if (statBox) {
    const totalRooms = rooms ? rooms.length : 0;
    const occupied = rooms ? rooms.filter(r => r.status === 'occupied').length : 0;
    const vacant = rooms ? rooms.filter(r => r.status === 'vacant').length : 0;
    const occRate = totalRooms > 0 ? Math.round((occupied / totalRooms) * 100) : 0;
    const pendingTickets = tickets ? tickets.filter(t => t.status !== 'completed').length : 0;
    const waitingParcels = parcels ? parcels.filter(p => p.status === 'waiting').length : 0;
    const pendingBillsAmount = bills ? bills.filter(b => b.status === 'pending').reduce((a, c) => a + (c.total_price || 0), 0) : 0;

    statBox.innerHTML = `
      <div class="scard">
        <div class="top"><span class="lbl">อัตราการเข้าพัก</span><div class="ic a">${ic('door')}</div></div>
        <div class="num">${occRate}%</div>
        <div class="lbl">${occupied} จาก ${totalRooms} ห้อง</div>
      </div>
      <div class="scard">
        <div class="top"><span class="lbl">ห้องว่างพร้อมอยู่</span><div class="ic b">${ic('door')}</div></div>
        <div class="num">${vacant}</div>
        <div class="lbl">ห้องว่างในอาคาร</div>
      </div>
      <div class="scard">
        <div class="top"><span class="lbl">งานแจ้งซ่อมบำรุง</span><div class="ic d">${ic('wrench')}</div></div>
        <div class="num">${pendingTickets}</div>
        <div class="lbl">รอดำเนินการ / กำลังซ่อม</div>
      </div>
      <div class="scard">
        <div class="top"><span class="lbl">พัสดุรอส่งมอบ</span><div class="ic c">${ic('box')}</div></div>
        <div class="num">${waitingParcels}</div>
        <div class="lbl">ชิ้น ที่สำนักงาน</div>
      </div>
      <div class="scard">
        <div class="top"><span class="lbl">ยอดค้างชำระค่าเช่า</span><div class="ic d">${ic('bill')}</div></div>
        <div class="num" style="font-size: 1.45rem;">${fmtCurrency(pendingBillsAmount)}</div>
        <div class="lbl">รอบประจำเดือน</div>
      </div>
    `;
  }

  if (maintBox) {
    const ticketList = (tickets || []).filter(t => t.status !== 'completed').slice(0, 4);
    if (ticketList.length === 0) {
      maintBox.innerHTML = `<p style="color:var(--muted); font-size:0.9rem;">ไม่มีรายการแจ้งซ่อมค้างอยู่</p>`;
    } else {
      let html = '<div class="mini-activity-list">';
      ticketList.forEach(t => {
        html += `
          <div class="mini-item">
            <div>
              <strong>ห้อง ${t.room_number} — ${t.category}</strong>
              <div style="font-size:0.8rem; color:var(--muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:200px;">
                ${t.description}
              </div>
            </div>
            <span class="badge in-progress">${t.status === 'in_progress' ? 'กำลังซ่อม' : 'รอรับเรื่อง'}</span>
          </div>
        `;
      });
      html += '</div>';
      maintBox.innerHTML = html;
    }
  }

  if (parcelBox) {
    const waitingList = (parcels || []).filter(p => p.status === 'waiting').slice(0, 4);
    if (waitingList.length === 0) {
      parcelBox.innerHTML = `<p style="color:var(--muted); font-size:0.9rem;">ไม่มีพัสดุตกค้าง</p>`;
    } else {
      let html = '<div class="mini-activity-list">';
      waitingList.forEach(p => {
        html += `
          <div class="mini-item">
            <div>
              <strong>ห้อง ${p.room_number} — ${p.recipient_name}</strong>
              <div style="font-size:0.8rem; color:var(--muted);">${p.courier}: ${p.tracking_number}</div>
            </div>
            <span class="badge pending">รอผู้พักรับ</span>
          </div>
        `;
      });
      html += '</div>';
      parcelBox.innerHTML = html;
    }
  }
}

// หน้าแรกสำหรับ Student (ผู้พักอาศัย)
function renderStudentDashboard() {
  setTimeout(() => {
    loadStudentDashboardData();
  }, 0);

  const room = currentUser && currentUser.room ? currentUser.room : '302';
  const name = currentUser ? currentUser.name : 'นักศึกษา';

  return `
    <!-- Personal Room Banner -->
    <div class="student-welcome-banner">
      <div style="flex:1;">
        <span class="badge" style="background:rgba(242,193,78,0.25); color:var(--sand); margin-bottom:8px;">
          ✨ ผู้พักอาศัย Tanakrit Dormitory (หอพักชายธนกฤษฎ์)
        </span>
        <h2>ยินดีต้อนรับ, ${name}</h2>
        <p>ห้องพักปัจจุบัน: <strong>ห้อง ${room} (ชั้น 3 อาคารหลัก)</strong> | สัญญาเช่าประเภท: Standard Air</p>
      </div>
      <div style="display:flex; gap:10px;">
        <button class="btn btn-outline-white" onclick="window.switchView('maintenance')">
          ${ic('wrench')} แจ้งซ่อมอุปกรณ์
        </button>
        <button class="btn btn-primary" onclick="window.switchView('utilities')">
          ${ic('bill')} ดูบิลค่าน้ำ-ไฟ
        </button>
      </div>
    </div>

    <!-- Student Cards Grid -->
    <div class="stat-cards" style="margin-top:24px;" id="student-stat-cards">
      <div class="scard"><div class="num">...</div><div class="lbl">กำลังโหลดข้อมูล...</div></div>
    </div>

    <!-- Two Columns: Latest Bill & My Status -->
    <div class="dashboard-grid-2col" style="margin-top:24px;">
      <!-- Latest Bill Box -->
      <div class="card" id="student-latest-bill-box">
        <h3>${ic('bill')} ยอดชำระค่าน้ำ-ค่าไฟ ประจำเดือน</h3>
        <p style="color:var(--muted); font-size:0.9rem;">กำลังตรวจสอบข้อมูลบิลล่าสุด...</p>
      </div>

      <!-- Pending Parcels & Repairs -->
      <div class="card">
        <h3>${ic('box')} พัสดุของคุณที่รอรับ</h3>
        <div id="student-parcels-box" style="margin-top:14px;">กำลังโหลด...</div>

        <h3 style="margin-top:24px; padding-top:16px; border-top:1px solid var(--line);">${ic('wrench')} สถานะงานแจ้งซ่อมของห้อง</h3>
        <div id="student-tickets-box" style="margin-top:14px;">กำลังโหลด...</div>
      </div>
    </div>
  `;
}

async function loadStudentDashboardData() {
  const room = currentUser && currentUser.room ? currentUser.room : '302';

  const { data: bills } = await supabase.from('meter_readings').eq('room_number', room);
  const { data: parcels } = await supabase.from('parcels').eq('room_number', room);
  const { data: tickets } = await supabase.from('maintenance').eq('room_number', room);

  // Stats
  const statBox = document.getElementById('student-stat-cards');
  if (statBox) {
    const latestBill = bills && bills.length > 0 ? bills[0] : null;
    const isPaid = latestBill ? latestBill.status === 'paid' : true;
    const waitingParcels = (parcels || []).filter(p => p.status === 'waiting').length;
    const activeTickets = (tickets || []).filter(t => t.status !== 'completed').length;

    statBox.innerHTML = `
      <div class="scard">
        <div class="top"><span class="lbl">บิลเดือนล่าสุด</span><div class="ic ${isPaid ? 'c' : 'd'}">${ic('bill')}</div></div>
        <div class="num">${latestBill ? fmtCurrency(latestBill.total_price) : '0 ฿'}</div>
        <div class="lbl">สถานะ: <strong style="color:${isPaid ? 'var(--emerald)' : 'var(--danger)'};">${isPaid ? 'ชำระแล้ว' : 'ยังไม่ชำระ'}</strong></div>
      </div>
      <div class="scard">
        <div class="top"><span class="lbl">พัสดุรอรับ</span><div class="ic b">${ic('box')}</div></div>
        <div class="num">${waitingParcels}</div>
        <div class="lbl">ชิ้น ที่เคาน์เตอร์</div>
      </div>
      <div class="scard">
        <div class="top"><span class="lbl">งานแจ้งซ่อม</span><div class="ic a">${ic('wrench')}</div></div>
        <div class="num">${activeTickets}</div>
        <div class="lbl">รายการกำลังดำเนินการ</div>
      </div>
      <div class="scard">
        <div class="top"><span class="lbl">สถานะห้องพัก</span><div class="ic c">${ic('door')}</div></div>
        <div class="num" style="font-size:1.6rem;">ปกติ</div>
        <div class="lbl">ห้อง ${room} สัญญาปกติ</div>
      </div>
    `;
  }

  // Bill Box
  const billBox = document.getElementById('student-latest-bill-box');
  if (billBox && bills && bills.length > 0) {
    const b = bills[0];
    const isPaid = b.status === 'paid';
    billBox.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
        <h3>${ic('bill')} ยอดชำระค่าน้ำ-ค่าไฟ (${b.month_label || b.billing_month})</h3>
        <span class="badge ${isPaid ? 'approved' : 'pending'}">${isPaid ? 'ชำระแล้ว' : 'รอชำระเงิน'}</span>
      </div>
      <div style="background:var(--mint-50); border:1px solid var(--line); border-radius:12px; padding:16px; margin-bottom:16px;">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; font-size:0.9rem;">
          <div>ค่าเช่าห้องพัก: <strong>${fmtCurrency(b.room_price)}</strong></div>
          <div>ค่าน้ำประปา (${b.water_unit} หน่วย): <strong>${fmtCurrency(b.water_total)}</strong></div>
          <div>ค่าไฟฟ้า (${b.electric_unit} หน่วย): <strong>${fmtCurrency(b.electric_total)}</strong></div>
          <div>ค่าส่วนกลาง: <strong>${fmtCurrency(b.common_fee || 100)}</strong></div>
        </div>
        <div style="margin-top:14px; padding-top:12px; border-top:1.5px dashed var(--line); display:flex; justify-content:space-between; align-items:center;">
          <span style="font-weight:600; font-size:1.05rem;">ยอดรวมที่ต้องชำระ:</span>
          <span style="font-weight:700; font-size:1.3rem; color:var(--teal-900);">${fmtCurrency(b.total_price)}</span>
        </div>
      </div>
      <div style="display:flex; gap:10px;">
        <button class="btn btn-primary" id="btn-open-student-invoice" style="flex:1;">
          ${ic('qr')} ดูใบแจ้งหนี้ / สแกนจ่าย
        </button>
      </div>
    `;

    document.getElementById('btn-open-student-invoice').onclick = () => {
      openInvoiceModal(b);
    };
  }

  // Parcels
  const parcelsBox = document.getElementById('student-parcels-box');
  if (parcelsBox) {
    const myWaiting = (parcels || []).filter(p => p.status === 'waiting');
    if (myWaiting.length === 0) {
      parcelsBox.innerHTML = `<p style="color:var(--muted); font-size:0.85rem;">ไม่มีพัสดุตกค้าง คุณรับพัสดุครบเรียบร้อยแล้ว</p>`;
    } else {
      let html = '';
      myWaiting.forEach(p => {
        html += `
          <div style="background:#fdf8e7; border:1px solid #f2c14e; border-radius:10px; padding:12px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <strong>${p.courier}: ${p.tracking_number}</strong>
              <div style="font-size:0.8rem; color:var(--muted);">${p.description} (มาถึง ${fmtDate(p.arrived_at)})</div>
            </div>
            <button class="btn btn-outline btn-sm btn-quick-collect" data-id="${p.id}">${ic('check')} รับแล้ว</button>
          </div>
        `;
      });
      parcelsBox.innerHTML = html;
      parcelsBox.querySelectorAll('.btn-quick-collect').forEach(btn => {
        btn.onclick = async () => {
          const id = btn.getAttribute('data-id');
          await supabase.from('parcels').eq('id', id).update({ status: 'collected', collected_at: new Date().toISOString().split('T')[0] });
          toast('บันทึกการรับพัสดุเรียบร้อย', 'success');
          loadStudentDashboardData();
        };
      });
    }
  }

  // Tickets
  const ticketsBox = document.getElementById('student-tickets-box');
  if (ticketsBox) {
    if (!tickets || tickets.length === 0) {
      ticketsBox.innerHTML = `<p style="color:var(--muted); font-size:0.85rem;">ไม่มีประวัติการแจ้งซ่อม</p>`;
    } else {
      let html = '';
      tickets.slice(0, 3).forEach(t => {
        let badgeClass = t.status === 'completed' ? 'approved' : 'pending';
        let statusText = t.status === 'completed' ? 'ซ่อมเสร็จแล้ว' : (t.status === 'in_progress' ? 'กำลังซ่อม' : 'รอรับเรื่อง');
        html += `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid var(--line); font-size:0.9rem;">
            <div>
              <strong>${t.category}</strong>
              <div style="font-size:0.8rem; color:var(--muted);">${t.description}</div>
            </div>
            <span class="badge ${badgeClass}">${statusText}</span>
          </div>
        `;
      });
      ticketsBox.innerHTML = html;
    }
  }

  const quickReq = document.getElementById('btn-new-req-quick');
  if (quickReq) {
    quickReq.onclick = () => window.switchView('new-request');
  }
}

// หน้าข้อมูลส่วนตัว (Profile สำหรับนักศึกษา)
function renderProfileView() {
  const name = currentUser ? currentUser.name : 'นายสมชาย ช่างศิลป์';
  const room = currentUser && currentUser.room ? currentUser.room : '302';
  const phone = currentUser && currentUser.phone ? currentUser.phone : '089-123-4567';
  const tid = currentUser && currentUser.tenantId ? currentUser.tenantId : '6512345';

  return `
    <div class="card" style="max-width: 650px; margin: 0 auto;">
      <div style="text-align:center; margin-bottom:24px;">
        <div style="width: 80px; height: 80px; background: var(--teal-950); color: var(--sand); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 2rem; font-family: 'Kanit'; font-weight: bold; border: 4px solid var(--mint-50); box-shadow: var(--shadow);">
          ${currentUser ? currentUser.initial : 'ส'}
        </div>
        <h3 style="margin: 12px 0 4px 0; color: var(--teal-950);">${name}</h3>
        <p style="margin: 0; color: var(--muted); font-size: 0.9rem;">รหัสประจำตัว: ${tid} | ห้องพัก: <strong>${room}</strong></p>
      </div>

      <form id="form-profile-save">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
          <div class="field">
            <label>ชื่อ - นามสกุล</label>
            <input type="text" id="prof-name" value="${name}">
          </div>
          <div class="field">
            <label>ห้องพักปัจจุบัน</label>
            <input type="text" value="${room}" disabled>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
          <div class="field">
            <label>เบอร์โทรศัพท์ติดต่อ</label>
            <input type="tel" id="prof-phone" value="${phone}">
          </div>
          <div class="field">
            <label>อีเมลติดต่อ</label>
            <input type="email" id="prof-email" value="somchai.art@student.kp.ac.th">
          </div>
        </div>

        <div class="field" style="margin-bottom: 24px;">
          <label>คณะ / สาขาวิชา / วิทยาลัย</label>
          <input type="text" value="วิทยาลัยช่างศิลป์ นครศรีธรรมราช (วิจิตรศิลป์)" disabled>
        </div>

        <button type="submit" class="btn btn-primary" style="width: 100%;">
          ${ic('check')} บันทึกการเปลี่ยนแปลงข้อมูลส่วนตัว
        </button>
      </form>
    </div>
  `;
}


/* ========== js/app.js ========== */
// js/app.js












// กู้คืนฟังก์ชันปิด Modal สากล
window.closeAppModal = closeModal;
window.toggleLoginModal = toggleLoginModal;
window.quickLoginAs = (role) => {
  quickLoginAs(role, (user) => {
    setupSidebarMenu(user);
    switchView('dashboard');
  });
};
window.handleLogout = handleLogout;
window.printInvoice = () => {
  window.print();
};

document.addEventListener('DOMContentLoaded', () => {
  // ปุ่มเปิดหน้าต่าง Login
  const btnToggleLogin = document.getElementById('btn-toggle-login');
  if (btnToggleLogin) {
    btnToggleLogin.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleLoginModal(true);
    });
  }

  // ปุ่มปิดหน้าต่าง Login Modal
  const btnCloseLogin = document.getElementById('btn-close-login-modal');
  if (btnCloseLogin) {
    btnCloseLogin.addEventListener('click', () => toggleLoginModal(false));
  }

  // ปิดเมื่อคลิกด้านนอก Modal
  const loginModal = document.getElementById('login-modal');
  if (loginModal) {
    loginModal.addEventListener('click', (e) => {
      if (e.target === loginModal) toggleLoginModal(false);
    });
  }

  // Quick Login Buttons ในหน้าต่าง Login
  document.querySelectorAll('.btn-quick-login').forEach(btn => {
    btn.addEventListener('click', () => {
      const role = btn.getAttribute('data-role');
      quickLoginAs(role, (user) => {
        setupSidebarMenu(user);
        switchView('dashboard');
      });
    });
  });

  // Submit ฟอร์มล็อกอิน
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      handleLogin(e, (user) => {
        setupSidebarMenu(user);
        switchView('dashboard');
      });
    });
  }

  // ออกจากระบบ
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) btnLogout.addEventListener('click', handleLogout);

  // ปุ่มเปิด/ปิด Sidebar บนมือถือ
  const btnSidebarToggle = document.getElementById('btn-sidebar-toggle');
  if (btnSidebarToggle) btnSidebarToggle.addEventListener('click', () => toggleSidebar(true));

  const overlay = document.getElementById('overlay');
  if (overlay) overlay.addEventListener('click', () => toggleSidebar(false));

  // ตรวจสอบ Session ที่มีอยู่เดิม
  const existingUser = initAuth();
  if (existingUser) {
    document.getElementById('page-landing').classList.add('hidden');
    document.getElementById('page-app').classList.remove('hidden');
    setupSidebarMenu(existingUser);
    switchView('dashboard');
  }
});

// ตั้งค่าเมนู Sidebar ตามสิทธิ์ผู้ใช้งาน (Role)
function setupSidebarMenu(user) {
  const initialEl = document.getElementById('header-user-initial');
  const nameEl = document.getElementById('header-user-name');
  const roleEl = document.getElementById('header-user-role-label');

  if (initialEl) initialEl.textContent = user.initial || 'U';
  if (nameEl) nameEl.textContent = user.name;
  if (roleEl) roleEl.textContent = user.roleTitle || user.role.toUpperCase();

  const nav = document.getElementById('sidebar-nav');
  if (!nav) return;

  let html = '';

  if (user.role === 'admin' || user.role === 'staff') {
    html = `
      <div class="sidebar-section-title">เมนูหลัก</div>
      <a href="#" class="nav-item active" data-view="dashboard">${ic('home')} ภาพรวมระบบ (Dashboard)</a>
      <a href="#" class="nav-item" data-view="rooms">${ic('door')} ผังห้องพัก (Floor Plan)</a>
      <a href="#" class="nav-item" data-view="tenants">${ic('users')} ทะเบียนผู้พักอาศัย</a>
      
      <div class="sidebar-section-title">งานบริการและธุรกรรม</div>
      <a href="#" class="nav-item" data-view="utilities">${ic('bill')} ค่าน้ำ-ค่าไฟ & บิล</a>
      <a href="#" class="nav-item" data-view="maintenance">${ic('wrench')} แจ้งซ่อมบำรุง</a>
      <a href="#" class="nav-item" data-view="parcels">${ic('box')} พัสดุไปรษณีย์</a>
      <a href="#" class="nav-item" data-view="announcements">${ic('bell')} กระดานข่าวสาร</a>
      
      <div class="sidebar-section-title">การจัดการ</div>
      <a href="#" class="nav-item" data-view="reports">${ic('chart')} รายงานและสถิติ</a>
      <a href="#" class="nav-item" data-view="settings">${ic('gear')} ตั้งค่าระบบ</a>
    `;
  } else if (user.role === 'student') {
    html = `
      <div class="sidebar-section-title">สำหรับผู้พักอาศัย</div>
      <a href="#" class="nav-item active" data-view="dashboard">${ic('home')} หน้าหลักห้อง ${user.room || '302'}</a>
      <a href="#" class="nav-item" data-view="utilities">${ic('bill')} บิลค่าน้ำ-ไฟ / ชำระเงิน</a>
      <a href="#" class="nav-item" data-view="maintenance">${ic('wrench')} แจ้งซ่อมอุปกรณ์</a>
      <a href="#" class="nav-item" data-view="parcels">${ic('box')} ตรวจสอบพัสดุ</a>
      <a href="#" class="nav-item" data-view="announcements">${ic('bell')} ประกาศหอพัก</a>
      
      <div class="sidebar-section-title">บัญชีของฉัน</div>
      <a href="#" class="nav-item" data-view="profile">${ic('user')} ข้อมูลส่วนตัว</a>
      <a href="#" class="nav-item" data-view="settings">${ic('gear')} เปลี่ยนรหัสผ่าน</a>
    `;
  }

  nav.innerHTML = html;

  nav.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', (ev) => {
      ev.preventDefault();
      nav.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      el.classList.add('active');
      switchView(el.getAttribute('data-view'));
      toggleSidebar(false);
    });
  });
}

// สลับมุมมองหน้าจอใน Dashboard
window.switchView = async function(viewName) {
  const titleEl = document.getElementById('app-view-title');
  const bodyEl = document.getElementById('app-content-body');
  if (!titleEl || !bodyEl) return;

  // Active class on sidebar
  const nav = document.getElementById('sidebar-nav');
  if (nav) {
    nav.querySelectorAll('.nav-item').forEach(i => {
      if (i.getAttribute('data-view') === viewName) {
        i.classList.add('active');
      } else {
        i.classList.remove('active');
      }
    });
  }

  if (viewName === 'dashboard') {
    titleEl.textContent = currentUser.role === 'student' ? `ห้อง ${currentUser.room || '302'} — หน้าหลักผู้พัก` : 'แดชบอร์ดภาพรวมการบริหารงาน';
    bodyEl.innerHTML = currentUser.role === 'student' ? renderStudentDashboard() : renderStaffDashboard();
  } else if (viewName === 'rooms') {
    titleEl.textContent = 'ผังห้องพักและสถานะอาคาร (Floor Plan)';
    bodyEl.innerHTML = await renderRoomsView();
  } else if (viewName === 'tenants') {
    titleEl.textContent = 'ทะเบียนและประวัติผู้พักอาศัย';
    bodyEl.innerHTML = await renderTenantsView();
  } else if (viewName === 'requests') {
    titleEl.textContent = 'จัดการคำร้องขอสลับห้องพัก';
    bodyEl.innerHTML = renderRequestsView();
  } else if (viewName === 'new-request') {
    titleEl.textContent = 'ยื่นคำร้องขอสลับห้องพัก';
    bodyEl.innerHTML = renderNewRequestView();
    bindNewRequestForm();
  } else if (viewName === 'utilities') {
    titleEl.textContent = 'บันทึกมิเตอร์น้ำ-ไฟ และออกใบแจ้งหนี้';
    bodyEl.innerHTML = await renderUtilitiesView();
  } else if (viewName === 'maintenance') {
    titleEl.textContent = 'ระบบแจ้งซ่อมและงานบริการช่าง';
    bodyEl.innerHTML = await renderMaintenanceView();
  } else if (viewName === 'parcels') {
    titleEl.textContent = 'พัสดุไปรษณีย์และจุดรับของ';
    bodyEl.innerHTML = await renderParcelsView();
  } else if (viewName === 'announcements') {
    titleEl.textContent = 'กระดานข่าวสารและประกาศสำคัญ';
    bodyEl.innerHTML = await renderAnnouncementsView();
  } else if (viewName === 'reports') {
    titleEl.textContent = 'รายงานสถิติและผลการดำเนินงาน';
    bodyEl.innerHTML = await renderReportsView();
  } else if (viewName === 'profile') {
    titleEl.textContent = 'ข้อมูลส่วนตัวผู้พักอาศัย';
    bodyEl.innerHTML = renderProfileView();
    bindProfileForm();
  } else if (viewName === 'settings') {
    titleEl.textContent = 'ตั้งค่าระบบและบัญชีผู้ใช้งาน';
    bodyEl.innerHTML = await renderSettingsView();
  }

  // Scroll smoothly to top of content
  bodyEl.scrollTo({ top: 0, behavior: 'smooth' });
};

function bindNewRequestForm() {
  const form = document.getElementById('swap-form');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const phone = document.getElementById('f-phone').value.trim();
    const targetRoom = document.getElementById('f-target').value.trim();
    const reason = document.getElementById('f-reason').value.trim();
    const date = document.getElementById('f-date').value;

    const newReq = {
      id: 'REQ-' + Math.floor(1000 + Math.random() * 9000),
      request_id: 'REQ-' + Math.floor(1000 + Math.random() * 9000),
      requester_name: currentUser.name,
      requester_id: currentUser.tenantId || '6512345',
      current_room: currentUser.room || '302',
      target_room: targetRoom,
      reason: reason,
      effective_date: date,
      phone: phone,
      status: 'pending',
      created_at: new Date().toISOString().split('T')[0]
    };

    const { error } = await supabase.from('requests').insert([newReq]);
    if (error) {
      toast('เกิดข้อผิดพลาดในการส่งคำร้อง', 'error');
      return;
    }

    toast('ส่งคำร้องขอสลับห้องพักเรียบร้อยแล้ว!', 'success');
    switchView('dashboard');
  });
}

function bindProfileForm() {
  const form = document.getElementById('form-profile-save');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const newName = document.getElementById('prof-name').value.trim();
      const newPhone = document.getElementById('prof-phone').value.trim();
      if (currentUser) {
        currentUser.name = newName;
        currentUser.phone = newPhone;
        localStorage.setItem('kp_current_user', JSON.stringify(currentUser));
        document.getElementById('header-user-name').textContent = newName;
      }
      toast('บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว', 'success');
    });
  }
}


})();
