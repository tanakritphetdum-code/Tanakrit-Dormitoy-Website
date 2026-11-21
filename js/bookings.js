// js/bookings.js
// ระบบจองห้องพักออนไลน์สำหรับบุคคลภายนอก และระบบจัดการการจองสำหรับ Admin
// ออกแบบด้วย Smoky Frosted Glass Design System
import { supabase } from './supabase.js';
import { ic, fmtDate, showModal, closeModal, toast } from './api.js';

let bookingFilterStatus = 'all';
let bookingSearchTerm = '';
let cachedBookings = [];

export const DEFAULT_BOOKINGS = [
  {
    id: 'BK-101',
    full_name: 'นายศุภกฤต สิทธิชัย',
    phone: '081-999-1234',
    line_id: 'supakrit.s',
    room_type: 'อาคาร ธนกฤษฎ์ (2,800 ฿)',
    preferred_floor: null,
    expected_check_in: '2026-11-06',
    notes: 'สนใจห้องพักอาคารธนกฤษฎ์ สะอาด โปร่งสบาย เข้าพักต้นเดือนหน้าครับ',
    status: 'pending',
    created_at: '2026-10-30T02:18:43.160152+00:00'
  },
  {
    id: 'BK-102',
    full_name: 'น.ส.กัญญาณัฐ บุญมี',
    phone: '089-888-5678',
    line_id: 'kanyanat_b',
    room_type: 'อาคาร กิ่งเพชร (2,600 ฿)',
    preferred_floor: null,
    expected_check_in: '2026-11-09',
    notes: 'ต้องการห้องมุม อาคารกิ่งเพชร เพื่อความเงียบสงบในการอ่านหนังสือ',
    status: 'contacted',
    created_at: '2026-10-30T02:18:43.160152+00:00'
  }
];

// ฟังก์ชันเปิด Modal จองห้องพักจากหน้า Landing Page (เรียกใช้งานได้แบบ Public)
export function openBookingModal(preselectedType = '') {
  const body = `
    <form id="form-public-booking" style="display: flex; flex-direction: column; gap: 14px;">
      <div style="background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.2); border-radius: 10px; padding: 12px;">
        <div style="font-size: 0.86rem; color: #1E3A8A; line-height: 1.5;">
          ✨ กรอกข้อมูลเพื่อแจ้งความประสงค์จองหรือสอบถามห้องพักว่าง 3 อาคาร (ธนกฤษฎ์, กิ่งเพชร, ใต้บ้าน) เจ้าหน้าที่จะติดต่อกลับเพื่อยืนยันห้องพักและรายละเอียดเงินมัดจำครับ
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div class="field">
          <label style="font-size: 0.84rem; font-weight: 600; color: var(--teal-950); display: block; margin-bottom: 6px;">ชื่อ - นามสกุล ผู้จอง *</label>
          <input type="text" id="bk-name" required placeholder="นาย/นางสาว ..." style="width: 100%; height: 42px; border-radius: 8px;">
        </div>
        <div class="field">
          <label style="font-size: 0.84rem; font-weight: 600; color: var(--teal-950); display: block; margin-bottom: 6px;">เบอร์โทรศัพท์ติดต่อ *</label>
          <input type="tel" id="bk-phone" required placeholder="08x-xxx-xxxx" style="width: 100%; height: 42px; border-radius: 8px;">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div class="field">
          <label style="font-size: 0.84rem; font-weight: 600; color: var(--teal-950); display: block; margin-bottom: 6px;">Line ID (สำหรับส่งรูป/สัญญา)</label>
          <input type="text" id="bk-line" placeholder="เช่น @line_id หรือเบอร์โทร" style="width: 100%; height: 42px; border-radius: 8px;">
        </div>
        <div class="field">
          <label style="font-size: 0.84rem; font-weight: 600; color: var(--teal-950); display: block; margin-bottom: 6px;">อาคารและห้องพักที่สนใจ *</label>
          <select id="bk-type" required style="width: 100%; height: 42px; border-radius: 8px;">
            <option value="อาคาร ธนกฤษฎ์ (2,800 ฿)" ${preselectedType.includes('Tanakrit') || preselectedType.includes('ธนกฤษฎ์') ? 'selected' : ''}>อาคาร ธนกฤษฎ์ (ห้องพัดลม 28 ตร.ม. ห้องน้ำในตัว) 2,800 ฿/เดือน</option>
            <option value="อาคาร กิ่งเพชร (2,600 ฿)" ${preselectedType.includes('KingPhetch') || preselectedType.includes('กิ่งเพชร') ? 'selected' : ''}>อาคาร กิ่งเพชร (ห้องพัดลม 28 ตร.ม. ห้องน้ำในตัว) 2,600 ฿/เดือน</option>
            <option value="อาคาร ใต้บ้าน (1,500 ฿)" ${preselectedType.includes('UnderGround') || preselectedType.includes('ใต้บ้าน') ? 'selected' : ''}>อาคาร ใต้บ้าน (ห้องพัดลม 12 ตร.ม. ห้องน้ำรวม) 1,500 ฿/เดือน</option>
          </select>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div class="field">
          <label style="font-size: 0.84rem; font-weight: 600; color: var(--teal-950); display: block; margin-bottom: 6px;">เลือกอาคารที่ต้องการ</label>
          <select id="bk-floor" style="width: 100%; height: 42px; border-radius: 8px;">
            <option value="">เลือกอาคารใดก็ได้ (ตามห้องว่าง)</option>
            <option value="ธนกฤษฎ์">เฉพาะอาคาร ธนกฤษฎ์ (9 ห้อง)</option>
            <option value="กิ่งเพชร">เฉพาะอาคาร กิ่งเพชร (5 ห้อง)</option>
            <option value="ใต้บ้าน">เฉพาะอาคาร ใต้บ้าน (3 ห้อง)</option>
          </select>
        </div>
        <div class="field">
          <label style="font-size: 0.84rem; font-weight: 600; color: var(--teal-950); display: block; margin-bottom: 6px;">วันที่คาดว่าจะเข้าพัก *</label>
          <input type="date" id="bk-date" required value="${new Date().toISOString().split('T')[0]}" style="width: 100%; height: 42px; border-radius: 8px;">
        </div>
      </div>

      <div class="field">
        <label style="font-size: 0.84rem; font-weight: 600; color: var(--teal-950); display: block; margin-bottom: 6px;">ข้อความเพิ่มเติม / ความต้องการพิเศษ</label>
        <textarea id="bk-notes" rows="3" placeholder="เช่น มีรถจักรยานยนต์ 1 คัน, ขอนัดดูห้องตัวอย่างวันเสาร์นี้" style="width: 100%; border-radius: 8px; padding: 10px;"></textarea>
      </div>
    </form>
  `;

  const footer = `
    <button type="button" class="btn btn-outline" onclick="window.closeAppModal()">ปิด</button>
    <button type="button" class="btn btn-primary" id="btn-submit-booking" style="background: #3B82F6; border-color: #3B82F6;">🚀 ส่งข้อมูลจองห้องพัก</button>
  `;

  showModal({
    title: '📝 ลงชื่อจองห้องพัก / สอบถามห้องว่าง — Tanakrit Dormitory',
    body,
    footer,
    maxWidth: '560px'
  });

  const submitBtn = document.getElementById('btn-submit-booking');
  if (submitBtn) {
    submitBtn.onclick = async () => {
      const name = document.getElementById('bk-name').value.trim();
      const phone = document.getElementById('bk-phone').value.trim();
      const line = document.getElementById('bk-line').value.trim();
      const type = document.getElementById('bk-type').value;
      const floor = document.getElementById('bk-floor').value || null;
      const date = document.getElementById('bk-date').value;
      const notes = document.getElementById('bk-notes').value.trim();

      if (!name || !phone || !type || !date) {
        toast('กรุณากรอกข้อมูลที่จำเป็น (*) ให้ครบถ้วน', 'error');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'กำลังส่งข้อมูล...';

      const bookingId = 'BK-' + Math.floor(1000 + Math.random() * 9000);

      const { error } = await supabase.from('bookings').insert([{
        id: bookingId,
        full_name: name,
        phone,
        line_id: line,
        room_type: type,
        preferred_floor: floor,
        expected_check_in: date,
        notes,
        status: 'pending',
        created_at: new Date().toISOString()
      }]);

      if (error) {
        console.error('Booking save error:', error);
        toast('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = '🚀 ส่งข้อมูลจองห้องพัก';
        return;
      }

      closeModal();
      showModal({
        title: '🎉 ส่งข้อมูลการจองสำเร็จ',
        body: `
          <div style="text-align:center; padding: 20px 10px;">
            <div style="font-size: 3rem; margin-bottom: 12px;">✅</div>
            <h3 style="color:#0F172A; margin-bottom: 8px;">รับข้อมูลการจองเรียบร้อยแล้ว</h3>
            <p style="color:#475569; line-height: 1.6; margin-bottom: 16px;">
              รหัสการจองของคุณคือ: <strong style="color:#2563EB; font-size:1.15rem;">${bookingId}</strong><br>
              เจ้าหน้าที่หอพักชายธนกฤษฎ์จะติดต่อกลับผ่านเบอร์ <strong>${phone}</strong> เพื่อยืนยันห้องพักและขั้นตอนเข้าพักโดยเร็วที่สุดครับ
            </p>
            <div style="font-size:0.85rem; background:#F8FAFC; border: 1px solid #E2E8F0; padding:12px; border-radius:8px; color:#334155;">
              📞 ติดต่อด่วน: <strong>086-946-1654 (นายเกียรติศักดิ์ บริหาร)</strong> หรือ Line: <strong>Tonyeiei</strong>
            </div>
          </div>
        `,
        footer: `<button type="button" class="btn btn-primary" onclick="window.closeAppModal()" style="width:100%; background: #3B82F6; border-color: #3B82F6;">ตกลง</button>`,
        maxWidth: '480px'
      });
    };
  }
}
window.openBookingModal = openBookingModal;

// มุมมองหน้าจอจัดการ Bookings สำหรับ Admin & Staff ใน CRM Dashboard
export async function renderBookingsView() {
  setTimeout(() => {
    bindBookingsEvents();
    loadBookingsData();
  }, 0);

  return `
    <div style="display: flex; flex-direction: column; gap: 22px;">
      
      <!-- 1. Header Card (Smoky Glass) -->
      <div class="smoky-card" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(59,130,246,0.18); border: 1px solid rgba(59,130,246,0.32); display: flex; align-items: center; justify-content: center; color: #3B82F6;">
            ${ic('calendar')}
          </div>
          <div>
            <h2 style="font-size: 1.35rem; font-weight: 700; color: #ffffff; margin: 0; letter-spacing: -0.02em;">
              การจองห้องพักออนไลน์ (Online Bookings)
            </h2>
            <span style="font-size: 0.82rem; color: rgba(255,255,255,0.48); margin-top: 3px; display: block;">
              รายการผู้สนใจจองห้องพักที่ส่งมาจากหน้า Landing Page 3 อาคาร (17 ห้อง) เพื่อให้เจ้าหน้าที่โทรติดต่อกลับ
            </span>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <button class="smoky-round-glass-btn" id="btn-admin-add-booking" style="width: auto; border-radius: 9999px; padding: 0 18px; height: 38px; background: #3B82F6; color: #ffffff; border: 1px solid rgba(59,130,246,0.5); box-shadow: 0 0 20px rgba(59,130,246,0.4); font-size: 0.82rem; font-weight: 600; gap: 6px;">
            ${ic('plus')}
            <span>บันทึกการจองใหม่</span>
          </button>
        </div>
      </div>

      <!-- 2. KPI Summary Stat Tiles (Smoky Glass) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 16px;" id="booking-summary-stats">
        <div class="smoky-tile">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="smoky-meta-label">คำขอจองทั้งหมด</span>
            <div style="color: rgba(255,255,255,0.4);">${ic('calendar')}</div>
          </div>
          <div class="smoky-kpi-num" style="margin-top: 8px;" id="stat-total-bk">...</div>
          <div class="smoky-kpi-sub">คำขอจากผู้สนใจทั้งหมด</div>
        </div>

        <div class="smoky-tile">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="smoky-meta-label">รอติดต่อกลับ</span>
            <span class="smoky-delta-neg" style="background: rgba(245, 158, 11, 0.15); color: #FBBF24;">รอดำเนินการ</span>
          </div>
          <div class="smoky-kpi-num" style="margin-top: 8px; color: #FBBF24;" id="stat-pending-bk">...</div>
          <div class="smoky-kpi-sub">รอเจ้าหน้าที่โทรแจ้งรายละเอียด</div>
        </div>

        <div class="smoky-tile">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="smoky-meta-label">ติดต่อแล้ว</span>
            <span class="smoky-delta-pos" style="background: rgba(59, 130, 246, 0.15); color: #60A5FA;">พูดคุยแล้ว</span>
          </div>
          <div class="smoky-kpi-num" style="margin-top: 8px; color: #60A5FA;" id="stat-contacted-bk">...</div>
          <div class="smoky-kpi-sub">รอผู้จองตัดสินใจ / โอนมัดจำ</div>
        </div>

        <div class="smoky-tile">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="smoky-meta-label">ยืนยันการเข้าพัก</span>
            <span class="smoky-delta-pos">พร้อมทำสัญญา</span>
          </div>
          <div class="smoky-kpi-num" style="margin-top: 8px; color: #34D399;" id="stat-confirmed-bk">...</div>
          <div class="smoky-kpi-sub">โอนเงินมัดจำเรียบร้อยแล้ว</div>
        </div>
      </div>

      <!-- 3. Filters & Search Toolbar (Smoky Glass) -->
      <div class="smoky-card" style="padding: 16px 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
          
          <!-- Search Box -->
          <div style="position: relative; min-width: 240px; flex: 1; max-width: 360px;">
            <span style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.4); display: flex; align-items: center;">
              ${ic('search')}
            </span>
            <input type="text" id="booking-search-input" class="smoky-glass-input" placeholder="ค้นหาชื่อผู้จอง, เบอร์โทร, LINE ID หรืออาคาร..." style="width: 100%; padding-left: 38px;">
          </div>

          <!-- Status Filter Tabs (Segmented Control) -->
          <div class="smoky-segmented" id="booking-filter-tabs" style="overflow-x: auto; max-width: 100%;">
            <button class="smoky-seg-btn active" data-status="all">ทั้งหมด</button>
            <button class="smoky-seg-btn" data-status="pending">รอติดต่อ</button>
            <button class="smoky-seg-btn" data-status="contacted">ติดต่อแล้ว</button>
            <button class="smoky-seg-btn" data-status="confirmed">ยืนยันแล้ว</button>
          </div>

          <!-- Refresh Action -->
          <div>
            <button class="smoky-round-glass-btn" id="btn-refresh-bookings" style="width: auto; height: 36px; padding: 0 16px; border-radius: 9999px; font-size: 0.80rem; gap: 6px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);">
              ${ic('check')}
              <span>รีเฟรชข้อมูล</span>
            </button>
          </div>

        </div>
      </div>

      <!-- 4. Table Wrapper (Smoky Frosted Glass) -->
      <div class="smoky-table-wrap">
        <table class="smoky-table">
          <thead>
            <tr>
              <th style="width: 130px;">รหัส / วันที่ยื่นเรื่อง</th>
              <th style="min-width: 180px;">ผู้สนใจจอง</th>
              <th style="min-width: 190px;">อาคาร / ประเภทห้องที่สนใจ</th>
              <th style="min-width: 130px;">วันที่ต้องการเข้าพัก</th>
              <th style="min-width: 240px;">หมายเหตุ / ความต้องการ</th>
              <th style="min-width: 150px; width: 155px;">สถานะ</th>
              <th style="text-align: right; padding-right: 22px; width: 170px;">การกระทำ</th>
            </tr>
          </thead>
          <tbody id="bookings-tbody">
            <tr><td colspan="7" style="text-align:center; padding: 40px; color: rgba(255,255,255,0.4);">กำลังโหลดข้อมูลการจอง...</td></tr>
          </tbody>
        </table>
      </div>

    </div>
  `;
}

async function loadBookingsData() {
  const tbody = document.getElementById('bookings-tbody');
  if (!tbody) return;

  const { data: bookings, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });

  let allBookings = bookings;
  if (error || !allBookings) {
    allBookings = DEFAULT_BOOKINGS;
  }
  cachedBookings = allBookings;

  // Update Stats Counters
  const total = allBookings.length;
  const pending = allBookings.filter(b => b.status === 'pending').length;
  const contacted = allBookings.filter(b => b.status === 'contacted').length;
  const confirmed = allBookings.filter(b => b.status === 'confirmed').length;

  const totalEl = document.getElementById('stat-total-bk');
  const pendingEl = document.getElementById('stat-pending-bk');
  const contactedEl = document.getElementById('stat-contacted-bk');
  const confirmedEl = document.getElementById('stat-confirmed-bk');

  if (totalEl) totalEl.textContent = `${total} รายการ`;
  if (pendingEl) pendingEl.textContent = `${pending}`;
  if (contactedEl) contactedEl.textContent = `${contacted}`;
  if (confirmedEl) confirmedEl.textContent = `${confirmed}`;

  // Filter
  let filtered = [...allBookings];
  if (bookingFilterStatus !== 'all') {
    filtered = filtered.filter(b => b.status === bookingFilterStatus);
  }

  if (bookingSearchTerm.trim()) {
    const q = bookingSearchTerm.toLowerCase().trim();
    filtered = filtered.filter(b =>
      String(b.full_name || '').toLowerCase().includes(q) ||
      String(b.phone || '').toLowerCase().includes(q) ||
      String(b.line_id || '').toLowerCase().includes(q) ||
      String(b.room_type || '').toLowerCase().includes(q) ||
      String(b.notes || '').toLowerCase().includes(q) ||
      String(b.id || '').toLowerCase().includes(q)
    );
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: rgba(255,255,255,0.4); padding: 40px;">ไม่พบรายการจองตามเงื่อนไขที่เลือก</td></tr>`;
    return;
  }

  let html = '';
  filtered.forEach(b => {
    let statusPill = '';
    if (b.status === 'pending') {
      statusPill = `<span class="smoky-status-pill pill-amber">⏳ รอติดต่อกลับ</span>`;
    } else if (b.status === 'contacted') {
      statusPill = `<span class="smoky-status-pill pill-blue">📞 ติดต่อแล้ว</span>`;
    } else if (b.status === 'confirmed') {
      statusPill = `<span class="smoky-status-pill pill-green">🎉 ยืนยันเข้าพัก</span>`;
    } else {
      statusPill = `<span class="smoky-status-pill pill-rose">ยกเลิก</span>`;
    }

    html += `
      <tr>
        <td>
          <div style="font-weight: 700; color: #ffffff; letter-spacing: -0.01em; font-family: monospace; font-size: 0.90rem;">${b.id}</div>
          <div style="font-size: 0.74rem; color: rgba(255,255,255,0.42); margin-top: 3px;">${fmtDate(b.created_at)}</div>
        </td>
        <td>
          <div style="font-weight: 700; color: #ffffff; font-size: 0.95rem;">${b.full_name}</div>
          <div style="font-size: 0.78rem; margin-top: 4px; display: flex; align-items: center; gap: 8px;">
            <a href="tel:${b.phone}" style="color: #60A5FA; text-decoration: none; font-weight: 600; font-family: monospace;">📞 ${b.phone}</a>
            ${b.line_id ? `
              <span style="color: #34D399; background: rgba(52,211,153,0.12); padding: 1px 7px; border-radius: 9999px; font-size: 0.72rem;">Line: ${b.line_id}</span>
            ` : ''}
          </div>
        </td>
        <td>
          <span class="smoky-cat-pill">
            ${b.room_type}
          </span>
          ${b.preferred_floor ? `<div style="font-size: 0.72rem; color: rgba(255,255,255,0.42); margin-top: 4px;">ความต้องการ: ${b.preferred_floor}</div>` : ''}
        </td>
        <td>
          <div style="font-size: 0.85rem; color: rgba(255,255,255,0.85); font-weight: 600;">
            ${fmtDate(b.expected_check_in)}
          </div>
        </td>
        <td>
          <div style="font-size: 0.84rem; color: rgba(255,255,255,0.85); line-height: 1.45; max-width: 250px;">
            ${b.notes || '-'}
          </div>
        </td>
        <td>${statusPill}</td>
        <td style="text-align: right; padding-right: 18px;">
          <div style="display: flex; gap: 8px; justify-content: flex-end; align-items: center;">
            <select class="status-select-bk smoky-glass-select" data-id="${b.id}" style="border-radius: 9999px; padding: 4px 10px; font-size: 0.78rem; outline: none; cursor: pointer;">
              <option value="pending" ${b.status === 'pending' ? 'selected' : ''}>รอติดต่อกลับ</option>
              <option value="contacted" ${b.status === 'contacted' ? 'selected' : ''}>ติดต่อแล้ว</option>
              <option value="confirmed" ${b.status === 'confirmed' ? 'selected' : ''}>ยืนยันเข้าพัก</option>
              <option value="cancelled" ${b.status === 'cancelled' ? 'selected' : ''}>ยกเลิก</option>
            </select>
            <button class="smoky-round-glass-btn btn-del-bk" data-id="${b.id}" title="ลบรายการจอง" style="width: 30px; height: 30px; padding: 0; border-radius: 9999px; color: #FB7185; border-color: rgba(244, 63, 94, 0.3); background: rgba(244, 63, 94, 0.1);">
              ${ic('trash')}
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;

  // Bind Status Changer
  tbody.querySelectorAll('.status-select-bk').forEach(sel => {
    sel.onchange = async (e) => {
      const id = sel.getAttribute('data-id');
      const newStatus = e.target.value;
      await supabase.from('bookings').eq('id', id).update({ status: newStatus });
      toast(`อัปเดตสถานะการจอง ${id} เรียบร้อยแล้ว`, 'success');
      loadBookingsData();
    };
  });

  // Bind Delete
  tbody.querySelectorAll('.btn-del-bk').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id');
      if (confirm(`คุณต้องการลบรายการจอง ${id} หรือไม่?`)) {
        try {
          await supabase.from('bookings').eq('id', id).delete();
        } catch (_) {}
        cachedBookings = cachedBookings.filter(b => b.id !== id);
        toast('ลบรายการจองเรียบร้อยแล้ว', 'info');
        loadBookingsData();
      }
    };
  });
}

function bindBookingsEvents() {
  const searchInput = document.getElementById('booking-search-input');
  if (searchInput) {
    searchInput.oninput = (e) => {
      bookingSearchTerm = e.target.value.trim();
      loadBookingsData();
    };
  }

  const refreshBtn = document.getElementById('btn-refresh-bookings');
  if (refreshBtn) {
    refreshBtn.onclick = () => {
      toast('กำลังซิงค์รายการจองจากระบบ...', 'info');
      loadBookingsData();
    };
  }

  const adminAddBtn = document.getElementById('btn-admin-add-booking');
  if (adminAddBtn) {
    adminAddBtn.onclick = () => openBookingModal();
  }

  const tabs = document.getElementById('booking-filter-tabs');
  if (tabs) {
    tabs.querySelectorAll('.smoky-seg-btn').forEach(btn => {
      btn.onclick = () => {
        tabs.querySelectorAll('.smoky-seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        bookingFilterStatus = btn.getAttribute('data-status');
        loadBookingsData();
      };
    });
  }
}
