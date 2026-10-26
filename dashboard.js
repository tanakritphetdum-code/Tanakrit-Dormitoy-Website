// js/dashboard.js
import { supabase } from './supabase.js';
import { ic, fmtCurrency, fmtDate, showModal, closeModal, toast } from './api.js';
import { currentUser } from './auth.js';
import { openInvoiceModal } from './utilities.js';

// แดชบอร์ดสำหรับ Staff / Admin
export function renderStaffDashboard() {
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
export function renderStudentDashboard() {
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
export function renderProfileView() {
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
