// js/bookings.js
// ระบบจองห้องพักออนไลน์สำหรับบุคคลภายนอก และระบบจัดการการจองสำหรับ Admin
import { supabase } from './supabase.js';
import { ic, fmtDate, showModal, closeModal, toast } from './api.js';

let bookingFilterStatus = 'all';
let bookingSearchTerm = '';

// ฟังก์ชันเปิด Modal จองห้องพักจากหน้า Landing Page (เรียกใช้งานได้แบบ Public)
export function openBookingModal(preselectedType = '') {
  const body = `
    <form id="form-public-booking">
      <div style="background:#f4fbf7; border:1px solid var(--line); border-radius:10px; padding:12px; margin-bottom:16px;">
        <div style="font-size:0.88rem; color:var(--teal-950); line-height:1.5;">
          ✨ กรอกข้อมูลเพื่อแจ้งความประสงค์จองหรือสอบถามห้องพักว่าง เจ้าหน้าที่จะติดต่อกลับเพื่อยืนยันห้องพักและแจ้งรายละเอียดเงินมัดจำครับ
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
        <div class="field">
          <label>ชื่อ - นามสกุล ผู้จอง *</label>
          <input type="text" id="bk-name" required placeholder="นาย/นางสาว ...">
        </div>
        <div class="field">
          <label>เบอร์โทรศัพท์ติดต่อ *</label>
          <input type="tel" id="bk-phone" required placeholder="08x-xxx-xxxx">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
        <div class="field">
          <label>Line ID (สำหรับติดต่อส่งรูป/สัญญา)</label>
          <input type="text" id="bk-line" placeholder="เช่น @line_id หรือเบอร์โทร">
        </div>
        <div class="field">
          <label>อาคารและห้องพักที่สนใจ *</label>
          <select id="bk-type" required>
            <option value="อาคาร ธนกฤษฎ์" ${preselectedType.includes('Tanakrit') || preselectedType.includes('ธนกฤษฎ์') ? 'selected' : ''}>อาคาร ธนกฤษฎ์ (ห้องพัดลม 3.5×8 ม. ห้องน้ำในตัว) 1,500 ฿</option>
            <option value="อาคาร กิ่งเพชร" ${preselectedType.includes('KingPhetch') || preselectedType.includes('กิ่งเพชร') ? 'selected' : ''}>อาคาร กิ่งเพชร (ห้องพัดลม 3.5×8 ม. ห้องน้ำในตัว) 1,500 ฿</option>
            <option value="อาคารใต้บ้าน" ${preselectedType.includes('UnderGround') || preselectedType.includes('ใต้บ้าน') ? 'selected' : ''}>อาคารใต้บ้าน (ห้องพัดลม 3×4 ม. ห้องน้ำรวม) 800 ฿</option>
          </select>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
        <div class="field">
          <label>ความต้องการอาคาร</label>
          <select id="bk-floor">
            <option value="">เลือกอาคารใดก็ได้ (ตามห้องว่าง)</option>
            <option value="Tanakrit">เฉพาะอาคาร ธนกฤษฎ์ (9 ห้อง)</option>
            <option value="KingPhetch">เฉพาะอาคาร กิ่งเพชร (5 ห้อง)</option>
            <option value="UnderGround">เฉพาะอาคารใต้บ้าน (3 ห้อง)</option>
          </select>
        </div>
        <div class="field">
          <label>วันที่คาดว่าจะเข้าพัก *</label>
          <input type="date" id="bk-date" required value="${new Date().toISOString().split('T')[0]}">
        </div>
      </div>

      <div class="field">
        <label>ข้อความเพิ่มเติม / ความต้องการพิเศษ</label>
        <textarea id="bk-notes" rows="3" placeholder="เช่น มีรถจักรยานยนต์ 1 คัน, ต้องการห้องชั้นสูง, ขอนัดดูห้องตัวอย่างวันเสาร์นี้"></textarea>
      </div>
    </form>
  `;

  const footer = `
    <button type="button" class="btn btn-outline" onclick="window.closeAppModal()">ปิด</button>
    <button type="button" class="btn btn-primary" id="btn-submit-booking">🚀 ส่งข้อมูลจองห้องพัก</button>
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
      const floor = document.getElementById('bk-floor').value ? Number(document.getElementById('bk-floor').value) : null;
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
            <h3 style="color:var(--teal-950); margin-bottom: 8px;">รับข้อมูลการจองเรียบร้อยแล้ว</h3>
            <p style="color:var(--muted); line-height: 1.6; margin-bottom: 16px;">
              รหัสการจองของคุณคือ: <strong style="color:var(--teal-900); font-size:1.1rem;">${bookingId}</strong><br>
              เจ้าหน้าที่หอพักชายธนกฤษฎ์จะติดต่อกลับผ่านเบอร์ <strong>${phone}</strong> เพื่อยืนยันห้องพักและขั้นตอนเข้าพักโดยเร็วที่สุดครับ
            </p>
            <div style="font-size:0.85rem; background:#f4fbf7; padding:10px; border-radius:8px; color:var(--teal-900);">
              📞 หากมีข้อสงสัยเร่งด่วน ติดต่อโทร. 075-355-289, 089-590-0478 หรือ Line: @tanakritdorm
            </div>
          </div>
        `,
        footer: `<button type="button" class="btn btn-primary" onclick="window.closeAppModal()" style="width:100%;">ตกลง</button>`,
        maxWidth: '480px'
      });
    };
  }
}
window.openBookingModal = openBookingModal;

// มุมมองหน้าจอจัดการ Bookings สำหรับ Admin & Staff
export async function renderBookingsView() {
  setTimeout(() => {
    bindBookingsEvents();
    loadBookingsData();
  }, 0);

  return `
    <div class="card">
      <div class="card-header-actions">
        <div>
          <h3>${ic('calendar')} การจองห้องพักออนไลน์ (Online Bookings)</h3>
          <p style="color: var(--muted); margin-top: 4px; font-size: 0.9rem;">
            รายการผู้สนใจจองห้องพักที่ส่งมาจากหน้า Landing Page เพื่อให้เจ้าหน้าที่โทรติดต่อกลับ
          </p>
        </div>
        <button class="btn btn-primary" id="btn-admin-add-booking">
          ${ic('plus')} บันทึกการจองใหม่
        </button>
      </div>

      <!-- Stats Summary Strip -->
      <div class="hero-stats-strip" style="background:#f4fbf7; margin: 18px 0; border: 1px solid var(--line); border-radius:12px; padding:16px;">
        <div class="hstat-item">
          <div class="num" id="stat-total-bk" style="color:var(--teal-900); font-size:1.6rem;">-</div>
          <div class="lbl">คำขอจองทั้งหมด</div>
        </div>
        <div class="hstat-item">
          <div class="num" id="stat-pending-bk" style="color:#d9534f; font-size:1.6rem;">-</div>
          <div class="lbl">รอติดต่อกลับ ⏳</div>
        </div>
        <div class="hstat-item">
          <div class="num" id="stat-contacted-bk" style="color:#0275d8; font-size:1.6rem;">-</div>
          <div class="lbl">ติดต่อแล้ว 📞</div>
        </div>
        <div class="hstat-item">
          <div class="num" id="stat-confirmed-bk" style="color:var(--emerald); font-size:1.6rem;">-</div>
          <div class="lbl">ยืนยันการเข้าพัก 🎉</div>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="toolbar-filter-grid" style="margin-top: 16px; display:flex; gap:12px; flex-wrap:wrap; align-items:center;">
        <div class="search-box-wrap" style="flex: 1; min-width: 250px;">
          ${ic('search')}
          <input type="text" id="booking-search-input" placeholder="ค้นหาชื่อผู้จอง, เบอร์โทร, LINE ID หรือประเภทห้อง...">
        </div>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-sm btn-outline filter-bk-btn active" data-status="all">ทั้งหมด</button>
          <button class="btn btn-sm btn-outline filter-bk-btn" data-status="pending">รอติดต่อ</button>
          <button class="btn btn-sm btn-outline filter-bk-btn" data-status="contacted">ติดต่อแล้ว</button>
          <button class="btn btn-sm btn-outline filter-bk-btn" data-status="confirmed">ยืนยันแล้ว</button>
          <button class="btn btn-outline" id="btn-refresh-bookings">${ic('check')} รีเฟรช</button>
        </div>
      </div>

      <div class="table-responsive" style="margin-top: 16px;">
        <table class="modern-table">
          <thead>
            <tr>
              <th>รหัส / วันที่ยื่นเรื่อง</th>
              <th>ผู้สนใจจอง</th>
              <th>ประเภทห้องที่สนใจ</th>
              <th>วันที่ต้องการเข้าพัก</th>
              <th>หมายเหตุ / ความต้องการ</th>
              <th>สถานะ</th>
              <th>การกระทำ</th>
            </tr>
          </thead>
          <tbody id="bookings-tbody">
            <tr><td colspan="7" style="text-align:center; padding: 30px; color:var(--muted);">กำลังโหลดข้อมูลการจอง...</td></tr>
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

  if (error || !bookings) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--danger); padding: 24px;">ไม่สามารถโหลดข้อมูลการจองได้ (ตารางอาจยังไม่ถูกสร้างใน Supabase)</td></tr>`;
    return;
  }

  // Update Stats
  const total = bookings.length;
  const pending = bookings.filter(b => b.status === 'pending').length;
  const contacted = bookings.filter(b => b.status === 'contacted').length;
  const confirmed = bookings.filter(b => b.status === 'confirmed').length;

  const totalEl = document.getElementById('stat-total-bk');
  const pendingEl = document.getElementById('stat-pending-bk');
  const contactedEl = document.getElementById('stat-contacted-bk');
  const confirmedEl = document.getElementById('stat-confirmed-bk');

  if (totalEl) totalEl.textContent = total;
  if (pendingEl) pendingEl.textContent = pending;
  if (contactedEl) contactedEl.textContent = contacted;
  if (confirmedEl) confirmedEl.textContent = confirmed;

  // Filter
  let filtered = bookings;
  if (bookingFilterStatus !== 'all') {
    filtered = filtered.filter(b => b.status === bookingFilterStatus);
  }

  if (bookingSearchTerm) {
    const q = bookingSearchTerm.toLowerCase();
    filtered = filtered.filter(b =>
      (b.full_name || '').toLowerCase().includes(q) ||
      (b.phone || '').toLowerCase().includes(q) ||
      (b.line_id || '').toLowerCase().includes(q) ||
      (b.room_type || '').toLowerCase().includes(q) ||
      (b.notes || '').toLowerCase().includes(q)
    );
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--muted); padding: 30px;">ไม่พบรายการจองตามเงื่อนไข</td></tr>`;
    return;
  }

  let html = '';
  filtered.forEach(b => {
    let statusBadge = '';
    if (b.status === 'pending') {
      statusBadge = `<span class="badge" style="background:#FFF3E0; color:#E65100; font-weight:600;">⏳ รอติดต่อกลับ</span>`;
    } else if (b.status === 'contacted') {
      statusBadge = `<span class="badge" style="background:#E3F2FD; color:#0D47A1; font-weight:600;">📞 ติดต่อแล้ว</span>`;
    } else if (b.status === 'confirmed') {
      statusBadge = `<span class="badge approved" style="font-weight:600;">🎉 ยืนยันเข้าพัก</span>`;
    } else {
      statusBadge = `<span class="badge rejected">ยกเลิก</span>`;
    }

    html += `
      <tr>
        <td>
          <div style="font-weight: 700; color:var(--teal-950);">${b.id}</div>
          <small style="color:var(--muted);">${fmtDate(b.created_at)}</small>
        </td>
        <td>
          <div style="font-weight: 600; color:var(--teal-950);">${b.full_name}</div>
          <div style="font-size:0.85rem; margin-top:2px;">
            <a href="tel:${b.phone}" style="color:var(--emerald); font-weight:600;">📞 ${b.phone}</a>
            ${b.line_id ? ` • <span style="color:#00B900;">Line: ${b.line_id}</span>` : ''}
          </div>
        </td>
        <td>
          <span class="badge" style="background:var(--mint-50); color:var(--teal-900); font-weight:600;">${b.room_type}</span>
          ${b.preferred_floor ? `<small style="display:block; color:var(--muted); margin-top:2px;">ชั้น ${b.preferred_floor}</small>` : ''}
        </td>
        <td>
          <strong>${fmtDate(b.expected_check_in)}</strong>
        </td>
        <td>
          <div style="font-size:0.85rem; color:var(--teal-950); max-width:240px; word-break:break-word;">
            ${b.notes || '-'}
          </div>
        </td>
        <td>${statusBadge}</td>
        <td>
          <div style="display: flex; gap: 6px; align-items:center;">
            <select class="form-select status-select-bk" data-id="${b.id}" style="padding:4px 8px; font-size:0.8rem; border-radius:6px; border:1px solid var(--line);">
              <option value="pending" ${b.status === 'pending' ? 'selected' : ''}>รอติดต่อกลับ</option>
              <option value="contacted" ${b.status === 'contacted' ? 'selected' : ''}>ติดต่อแล้ว</option>
              <option value="confirmed" ${b.status === 'confirmed' ? 'selected' : ''}>ยืนยันเข้าพัก</option>
              <option value="cancelled" ${b.status === 'cancelled' ? 'selected' : ''}>ยกเลิก</option>
            </select>
            <button class="btn btn-outline btn-sm btn-del-bk" data-id="${b.id}" title="ลบรายการ" style="color:var(--danger); border-color:#fadbd8; padding:4px 8px;">
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
        await supabase.from('bookings').eq('id', id).delete();
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
      toast('รีเฟรชข้อมูลการจอง...', 'info');
      loadBookingsData();
    };
  }

  const adminAddBtn = document.getElementById('btn-admin-add-booking');
  if (adminAddBtn) {
    adminAddBtn.onclick = () => openBookingModal();
  }

  document.querySelectorAll('.filter-bk-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.filter-bk-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      bookingFilterStatus = btn.getAttribute('data-status');
      loadBookingsData();
    };
  });
}
