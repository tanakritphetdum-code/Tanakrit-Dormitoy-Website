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
    { id: 'R302', room_number: '302', floor: 3, type: 'Standard Air', price: 3700, status: 'occupied', tenant_name: 'นายสมชาย ธนกฤษฎ์', tenant_phone: '089-123-4567' },
    { id: 'R303', room_number: '303', floor: 3, type: 'Deluxe Corner', price: 4400, status: 'vacant', tenant_name: '', tenant_phone: '' },
    { id: 'R304', room_number: '304', floor: 3, type: 'Standard Air', price: 3700, status: 'occupied', tenant_name: 'นายเกริกเกียรติ ยิ่งยง', tenant_phone: '095-555-6677' },
    { id: 'R305', room_number: '305', floor: 3, type: 'Standard Fan', price: 3000, status: 'occupied', tenant_name: 'น.ส.วรรณวิมล เพียรชอบ', tenant_phone: '096-666-7788' },
    { id: 'R306', room_number: '306', floor: 3, type: 'Standard Fan', price: 3000, status: 'occupied', tenant_name: 'นายศักดิ์ดา รุ่งอรุณ', tenant_phone: '097-777-8899' },
    { id: 'R307', room_number: '307', floor: 3, type: 'Standard Air', price: 3700, status: 'vacant', tenant_name: '', tenant_phone: '' },
    { id: 'R308', room_number: '308', floor: 3, type: 'Deluxe Corner', price: 4400, status: 'occupied', tenant_name: 'น.ส.อารียา คงมั่น', tenant_phone: '098-888-9900' }
  ],
  tenants: [
    { id: 'T-1001', tenant_id: '6512345', name: 'นายสมชาย ธนกฤษฎ์', room: '302', phone: '089-123-4567', email: 'somchai@student.tanakrit.com', role: 'student', check_in: '2026-06-01' },
    { id: 'T-1002', tenant_id: '6512346', name: 'ณัฐพล ใจดี', room: '201', phone: '081-234-5678', email: 'nattapon.j@student.tanakrit.com', role: 'student', check_in: '2026-06-01' },
    { id: 'T-1003', tenant_id: '6512347', name: 'นายกิตติภูมิ รักษ์ดี', room: '101', phone: '081-111-2233', email: 'kittiphum@student.tanakrit.com', role: 'student', check_in: '2026-06-15' },
    { id: 'T-1004', tenant_id: '6512348', name: 'น.ส.วิภาดา สมบูรณ์', room: '102', phone: '082-222-3344', email: 'wiphada@student.tanakrit.com', role: 'student', check_in: '2026-06-10' },
    { id: 'T-1005', tenant_id: '6512349', name: 'นายภาณุพงศ์ ทองแท้', room: '104', phone: '083-333-4455', email: 'panupong@student.tanakrit.com', role: 'student', check_in: '2026-07-01' },
    { id: 'T-1006', tenant_id: '6512350', name: 'น.ส.กมลวรรณ ชัยเจริญ', room: '105', phone: '084-444-5566', email: 'kamolwan@student.tanakrit.com', role: 'student', check_in: '2026-07-05' },
    { id: 'T-1007', tenant_id: '6512351', name: 'นายวรพจน์ มณีรัตน์', room: '203', phone: '088-888-9900', email: 'worapoj@student.tanakrit.com', role: 'student', check_in: '2026-06-01' },
    { id: 'T-1008', tenant_id: '6512352', name: 'น.ส.เบญจมาศ สายทอง', room: '301', phone: '093-333-4455', email: 'benjamas@student.tanakrit.com', role: 'student', check_in: '2026-06-01' }
  ],
  requests: [
    {
      id: 'REQ-1089',
      request_id: 'REQ-1089',
      requester_name: 'นายสมชาย ธนกฤษฎ์',
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
      tenant_name: 'นายสมชาย ธนกฤษฎ์',
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
      requester_name: 'นายสมชาย ธนกฤษฎ์',
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
      recipient_name: 'นายสมชาย ธนกฤษฎ์',
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
export const supabase = {
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
