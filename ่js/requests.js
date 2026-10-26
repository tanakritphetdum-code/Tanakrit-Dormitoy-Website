// js/requests.js
import { supabase } from './supabase.js';
import { ic, fmtDate, showModal, closeModal, toast } from './api.js';
import { currentUser } from './auth.js';

export let requests = [];
let currentFilter = 'all';

export async function fetchRequests() {
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

export function renderRequestsView() {
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
export function renderNewRequestView() {
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
