// js/maintenance.js
// ระบบแจ้งซ่อมและงานบริการบำรุงรักษา (Maintenance System)
// ออกแบบด้วย Smoky Frosted Glass Design System
import { supabase } from './supabase.js';
import { ic, fmtDate, showModal, closeModal, toast, compressImage, showImageModal } from './api.js';
import { currentUser } from './auth.js';

let maintenanceFilter = 'all';
let maintenanceSearchQuery = '';
let cachedTickets = [];

export const DEFAULT_MAINTENANCE_TICKETS = [];

export function getBuildingName(roomNum) {
  const r = String(roomNum || '').trim();
  if (r.startsWith('1')) return 'อาคาร ธนกฤษฎ์';
  if (r.startsWith('2')) return 'อาคาร กิ่งเพชร';
  if (r.startsWith('B') || r.startsWith('b')) return 'อาคาร ใต้บ้าน';
  return 'หอพักธนกฤษฎ์';
}

export async function renderMaintenanceView() {
  setTimeout(() => {
    bindMaintenanceEvents();
    loadMaintenanceData();
  }, 0);

  const isStudent = currentUser && currentUser.role === 'student';

  return `
    <div style="display: flex; flex-direction: column; gap: 22px;">
      
      <!-- 1. Header Card (Smoky Glass) -->
      <div class="smoky-card" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(59,130,246,0.18); border: 1px solid rgba(59,130,246,0.32); display: flex; align-items: center; justify-content: center; color: #3B82F6;">
            ${ic('wrench')}
          </div>
          <div>
            <h2 style="font-size: 1.35rem; font-weight: 700; color: #ffffff; margin: 0; letter-spacing: -0.02em;">
              ระบบแจ้งซ่อมและงานบริการบำรุงรักษา (Maintenance System)
            </h2>
            <span style="font-size: 0.82rem; color: rgba(255,255,255,0.48); margin-top: 3px; display: block;">
              ${isStudent ? 'แจ้งปัญหาอุปกรณ์ชำรุดเสียหายในห้องพัก หรือพื้นที่ส่วนกลาง' : 'ตรวจสอบรายการแจ้งซ่อม มอบหมายงานช่าง และบันทึกสถานะการแก้ไข 3 อาคาร (17 ห้อง)'}
            </span>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <button class="smoky-round-glass-btn" id="btn-create-ticket" style="width: auto; border-radius: 9999px; padding: 0 18px; height: 38px; background: #3B82F6; color: #ffffff; border: 1px solid rgba(59,130,246,0.5); box-shadow: 0 0 20px rgba(59,130,246,0.4); font-size: 0.82rem; font-weight: 600; gap: 6px;">
            ${ic('plus')}
            <span>แจ้งซ่อมรายการใหม่</span>
          </button>
        </div>
      </div>

      <!-- 2. KPI Summary Stat Tiles (Smoky Glass) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 16px;" id="maintenance-summary-stats">
        <div class="smoky-tile">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="smoky-meta-label">รายการแจ้งซ่อมทั้งหมด</span>
            <div style="color: rgba(255,255,255,0.4);">${ic('wrench')}</div>
          </div>
          <div class="smoky-kpi-num" style="margin-top: 8px;" id="kpi-maint-total">...</div>
          <div class="smoky-kpi-sub">รายการสะสมทั้งหมด</div>
        </div>

        <div class="smoky-tile">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="smoky-meta-label">รอรับเรื่อง</span>
            <span class="smoky-delta-neg" style="background: rgba(245, 158, 11, 0.15); color: #FBBF24;">รอดำเนินการ</span>
          </div>
          <div class="smoky-kpi-num" style="margin-top: 8px; color: #FBBF24;" id="kpi-maint-pending">...</div>
          <div class="smoky-kpi-sub">รอเจ้าหน้าที่ตรวจสอบ</div>
        </div>

        <div class="smoky-tile">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="smoky-meta-label">กำลังดำเนินการ</span>
            <span class="smoky-delta-pos" style="background: rgba(59, 130, 246, 0.15); color: #60A5FA;">ช่างเข้าซ่อม</span>
          </div>
          <div class="smoky-kpi-num" style="margin-top: 8px; color: #60A5FA;" id="kpi-maint-progress">...</div>
          <div class="smoky-kpi-sub">กำลังซ่อมแซม</div>
        </div>

        <div class="smoky-tile">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="smoky-meta-label">ซ่อมเสร็จสิ้นแล้ว</span>
            <span class="smoky-delta-pos">เรียบร้อย</span>
          </div>
          <div class="smoky-kpi-num" style="margin-top: 8px; color: #34D399;" id="kpi-maint-completed">...</div>
          <div class="smoky-kpi-sub">งานเสร็จสมบูรณ์</div>
        </div>
      </div>

      <!-- 3. Filters & Search Toolbar (Smoky Glass) -->
      <div class="smoky-card" style="padding: 16px 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
          
          <!-- Search Box -->
          <div style="position: relative; min-width: 240px; flex: 1; max-width: 340px;">
            <span style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.4); display: flex; align-items: center;">
              ${ic('search')}
            </span>
            <input type="text" id="maint-search-input" class="smoky-glass-input" placeholder="ค้นหาเลขห้อง, ผู้แจ้ง หรืออาการชำรุด..." style="width: 100%; padding-left: 38px;">
          </div>

          <!-- Status Filter Tabs (Segmented Control) -->
          <div class="smoky-segmented" id="maint-filter-tabs" style="overflow-x: auto; max-width: 100%;">
            <button class="smoky-seg-btn active" data-status="all">ทั้งหมด</button>
            <button class="smoky-seg-btn" data-status="pending">รอรับเรื่อง</button>
            <button class="smoky-seg-btn" data-status="in_progress">กำลังดำเนินการ</button>
            <button class="smoky-seg-btn" data-status="completed">ซ่อมเสร็จสิ้น</button>
          </div>

          <!-- Refresh Action -->
          <div>
            <button class="smoky-round-glass-btn" id="btn-refresh-maintenance" style="width: auto; height: 36px; padding: 0 16px; border-radius: 9999px; font-size: 0.80rem; gap: 6px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);">
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
              <th style="width: 105px;">รหัสแจ้งซ่อม</th>
              <th style="min-width: 165px;">ห้องพัก / ผู้แจ้ง</th>
              <th style="min-width: 135px;">หมวดหมู่งาน</th>
              <th style="min-width: 250px;">รายละเอียดปัญหา & วันที่</th>
              <th style="width: 105px;">ความเร่งด่วน</th>
              <th style="min-width: 130px;">ช่างผู้รับผิดชอบ</th>
              <th style="min-width: 155px; width: 160px;">สถานะ</th>
              <th style="text-align: right; padding-right: 22px; width: 145px;">การกระทำ</th>
            </tr>
          </thead>
          <tbody id="maintenance-tbody">
            <tr><td colspan="8" style="text-align:center; padding: 40px; color: rgba(255,255,255,0.4);">กำลังโหลดรายการแจ้งซ่อม...</td></tr>
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

  let allTickets = tickets;
  if (error || !allTickets) {
    allTickets = [];
  }
  cachedTickets = allTickets;

  // Update KPI counters
  const totalCount = allTickets.length;
  const pendingCount = allTickets.filter(t => t.status === 'pending').length;
  const progressCount = allTickets.filter(t => t.status === 'in_progress').length;
  const completedCount = allTickets.filter(t => t.status === 'completed').length;

  const kpiTotal = document.getElementById('kpi-maint-total');
  const kpiPending = document.getElementById('kpi-maint-pending');
  const kpiProgress = document.getElementById('kpi-maint-progress');
  const kpiCompleted = document.getElementById('kpi-maint-completed');

  if (kpiTotal) kpiTotal.textContent = `${totalCount}`;
  if (kpiPending) kpiPending.textContent = `${pendingCount}`;
  if (kpiProgress) kpiProgress.textContent = `${progressCount}`;
  if (kpiCompleted) kpiCompleted.textContent = `${completedCount}`;

  let list = [...allTickets];
  const isStudent = currentUser && currentUser.role === 'student';
  if (isStudent && currentUser.room) {
    list = list.filter(t => String(t.room_number) === String(currentUser.room));
  }

  if (maintenanceFilter !== 'all') {
    list = list.filter(t => t.status === maintenanceFilter);
  }

  if (maintenanceSearchQuery.trim()) {
    const q = maintenanceSearchQuery.toLowerCase().trim();
    list = list.filter(t => {
      const room = String(t.room_number || '').toLowerCase();
      const bldg = getBuildingName(t.room_number).toLowerCase();
      const req = String(t.requester_name || '').toLowerCase();
      const cat = String(t.category || '').toLowerCase();
      const desc = String(t.description || '').toLowerCase();
      const tech = String(t.technician || '').toLowerCase();
      const id = String(t.id || '').toLowerCase();
      return room.includes(q) || bldg.includes(q) || req.includes(q) || cat.includes(q) || desc.includes(q) || tech.includes(q) || id.includes(q);
    });
  }

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 40px; color: rgba(255,255,255,0.4);">ไม่พบรายการแจ้งซ่อมตามเงื่อนไขที่เลือก</td></tr>`;
    return;
  }

  let html = '';
  list.forEach(t => {
    const bldg = getBuildingName(t.room_number);

    // Status pill
    let statusPill = '';
    if (t.status === 'in_progress') {
      statusPill = `<span class="smoky-status-pill pill-blue">⚡ กำลังดำเนินการ</span>`;
    } else if (t.status === 'completed') {
      statusPill = `<span class="smoky-status-pill pill-green">✓ ซ่อมเสร็จแล้ว</span>`;
    } else {
      statusPill = `<span class="smoky-status-pill pill-amber">⏳ รอรับเรื่อง</span>`;
    }

    // Urgency pill
    let urgencyBadge = `<span class="smoky-status-pill pill-green">ปกติ</span>`;
    if (t.urgency === 'high') {
      urgencyBadge = `<span class="smoky-status-pill pill-rose">⚡ ด่วนมาก</span>`;
    } else if (t.urgency === 'medium') {
      urgencyBadge = `<span class="smoky-status-pill pill-amber">ปานกลาง</span>`;
    }

    html += `
      <tr>
        <td>
          <span style="font-weight: 700; color: #ffffff; letter-spacing: -0.01em; font-family: monospace; font-size: 0.88rem;">${t.id}</span>
        </td>
        <td>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="font-weight: 700; color: #ffffff; font-size: 0.95rem;">ห้อง ${t.room_number}</div>
            <span class="smoky-bldg-badge">
              ${bldg}
            </span>
          </div>
          <div style="font-size: 0.78rem; color: rgba(255,255,255,0.48); margin-top: 3px;">
            ${t.requester_name || 'ผู้พักอาศัย'} ${t.phone ? `· <span style="font-family: monospace;">${t.phone}</span>` : ''}
          </div>
        </td>
        <td>
          <span class="smoky-cat-pill">
            ${t.category}
          </span>
        </td>
        <td style="max-width: 280px;">
          <div style="font-size: 0.85rem; line-height: 1.45; color: rgba(255,255,255,0.9); font-weight: 500;">
            ${t.description}
          </div>
          <div style="display: flex; align-items: center; gap: 10px; margin-top: 5px;">
            <span style="font-size: 0.74rem; color: rgba(255,255,255,0.42);">
              ${fmtDate(t.created_at)}
            </span>
            ${t.image_url ? `
              <span style="display:inline-flex; align-items:center; gap:4px; font-size:0.74rem; color:#60A5FA; cursor:pointer; background:rgba(59,130,246,0.15); border:1px solid rgba(59,130,246,0.3); padding:2px 8px; border-radius:9999px; font-weight:600;" onclick="window.showImageModal('${t.image_url}', 'รูปจุดชำรุด: ${t.category} (ห้อง ${t.room_number})')">
                📸 ดูรูปถ่าย
              </span>
            ` : ''}
          </div>
        </td>
        <td>${urgencyBadge}</td>
        <td>
          <div style="font-size: 0.82rem; color: ${t.technician ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)'};">
            ${t.technician || 'ยังไม่ระบุช่าง'}
          </div>
        </td>
        <td>${statusPill}</td>
        <td style="text-align: right; padding-right: 18px;">
          <div style="display: flex; gap: 8px; justify-content: flex-end; align-items: center;">
            <button class="smoky-round-glass-btn btn-update-ticket" data-id="${t.id}" style="width: auto; height: 32px; padding: 0 12px; border-radius: 9999px; font-size: 0.78rem; gap: 5px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.14); color: #ffffff;" title="อัปเดตสถานะงานซ่อม">
              ${ic('gear')}
              <span>อัปเดต</span>
            </button>
            <button class="smoky-round-glass-btn btn-del-ticket" data-id="${t.id}" style="width: 32px; height: 32px; padding: 0; border-radius: 9999px; color: #FB7185; border-color: rgba(244, 63, 94, 0.3); background: rgba(244, 63, 94, 0.1);" title="ลบรายการแจ้งซ่อม">
              ${ic('trash')}
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
      const target = cachedTickets.find(x => x.id === id);
      if (target) openUpdateTicketModal(target);
    };
  });

  // Delete Ticket
  tbody.querySelectorAll('.btn-del-ticket').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id');
      const target = cachedTickets.find(x => x.id === id);
      if (!target) return;
      if (confirm(`คุณต้องการลบรายการแจ้งซ่อม ${target.id} (ห้อง ${target.room_number}) ออกจากระบบใช่หรือไม่?`)) {
        const { error } = await supabase.from('maintenance').eq('id', id).delete();
        if (error) {
          toast('เกิดข้อผิดพลาดในการลบรายการแจ้งซ่อม', 'error');
          return;
        }
        cachedTickets = cachedTickets.filter(x => x.id !== id);
        toast(`ลบรายการแจ้งซ่อม ${target.id} เรียบร้อยแล้ว`, 'success');
        loadMaintenanceData();
      }
    };
  });
}

function bindMaintenanceEvents() {
  const tabs = document.getElementById('maint-filter-tabs');
  if (tabs) {
    tabs.querySelectorAll('.smoky-seg-btn').forEach(btn => {
      btn.onclick = () => {
        tabs.querySelectorAll('.smoky-seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        maintenanceFilter = btn.getAttribute('data-status');
        loadMaintenanceData();
      };
    });
  }

  const searchInput = document.getElementById('maint-search-input');
  if (searchInput) {
    searchInput.oninput = (e) => {
      maintenanceSearchQuery = e.target.value;
      loadMaintenanceData();
    };
  }

  const btnRefresh = document.getElementById('btn-refresh-maintenance');
  if (btnRefresh) {
    btnRefresh.onclick = () => {
      toast('กำลังซิงค์รายการแจ้งซ่อมจากระบบ...', 'info');
      loadMaintenanceData();
    };
  }

  const btnCreate = document.getElementById('btn-create-ticket');
  if (btnCreate) btnCreate.onclick = openCreateTicketModal;
}

function openCreateTicketModal() {
  const defaultRoom = currentUser && currentUser.room ? currentUser.room : '101';
  const defaultName = currentUser ? currentUser.name : '';
  const defaultPhone = currentUser && currentUser.phone ? currentUser.phone : '';

  // 17 Real Dormitory Rooms across 3 buildings
  const tanakritRooms = ['101', '102', '103', '104', '105', '106', '107', '108', '109'];
  const kingPhetchRooms = ['201', '202', '203', '204', '205'];
  const underGroundRooms = ['B01', 'B02', 'B03'];

  const roomOptions = `
    <optgroup label="อาคาร ธนกฤษฎ์ (9 ห้อง)">
      ${tanakritRooms.map(r => `<option value="${r}" ${r === defaultRoom ? 'selected' : ''}>ห้อง ${r} (อาคาร ธนกฤษฎ์)</option>`).join('')}
    </optgroup>
    <optgroup label="อาคาร กิ่งเพชร (5 ห้อง)">
      ${kingPhetchRooms.map(r => `<option value="${r}" ${r === defaultRoom ? 'selected' : ''}>ห้อง ${r} (อาคาร กิ่งเพชร)</option>`).join('')}
    </optgroup>
    <optgroup label="อาคาร ใต้บ้าน (3 ห้อง)">
      ${underGroundRooms.map(r => `<option value="${r}" ${r === defaultRoom ? 'selected' : ''}>ห้อง ${r} (อาคาร ใต้บ้าน)</option>`).join('')}
    </optgroup>
    <optgroup label="พื้นที่ส่วนกลาง">
      <option value="ส่วนกลาง">พื้นที่ส่วนกลาง / บริเวณหอพัก</option>
    </optgroup>
  `;

  const body = `
    <form id="form-create-ticket" style="display: flex; flex-direction: column; gap: 14px;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div class="field">
          <label class="smoky-form-label" style="font-size: 0.84rem; display: block; margin-bottom: 6px;">หมายเลขห้องพัก / จุดที่ชำรุด *</label>
          <select id="tk-room" class="smoky-glass-select" style="width: 100%; height: 42px; border-radius: 8px;">
            ${roomOptions}
          </select>
        </div>
        <div class="field">
          <label class="smoky-form-label" style="font-size: 0.84rem; display: block; margin-bottom: 6px;">หมวดหมู่งานซ่อม *</label>
          <select id="tk-cat" class="smoky-glass-select" style="width: 100%; height: 42px; border-radius: 8px;">
            <option value="เครื่องปรับอากาศ">เครื่องปรับอากาศ (แอร์)</option>
            <option value="ระบบประปา">ระบบประปา / ห้องน้ำ / ก๊อกรั่ว</option>
            <option value="ไฟฟ้า/แสงสว่าง">ระบบไฟฟ้า / หลอดไฟ / ปลั๊กไฟ</option>
            <option value="เฟอร์นิเจอร์/ประตู">เฟอร์นิเจอร์ / บานพับ / ประตู-หน้าต่าง</option>
            <option value="อินเทอร์เน็ต Wi-Fi">อินเทอร์เน็ต Wi-Fi / ระบบเครือข่าย</option>
            <option value="อื่นๆ">อื่นๆ</option>
          </select>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div class="field">
          <label class="smoky-form-label" style="font-size: 0.84rem; display: block; margin-bottom: 6px;">ชื่อผู้แจ้ง *</label>
          <input type="text" id="tk-name" class="smoky-glass-input" value="${defaultName}" placeholder="เช่น นายสมชาย, น.ส.วิภาดา" required style="width: 100%; height: 42px; border-radius: 8px;">
        </div>
        <div class="field">
          <label class="smoky-form-label" style="font-size: 0.84rem; display: block; margin-bottom: 6px;">เบอร์โทรศัพท์ติดต่อ *</label>
          <input type="tel" id="tk-phone" class="smoky-glass-input" value="${defaultPhone}" placeholder="เช่น 089-xxx-xxxx" required style="width: 100%; height: 42px; border-radius: 8px;">
        </div>
      </div>

      <div class="field">
        <label class="smoky-form-label" style="font-size: 0.84rem; display: block; margin-bottom: 6px;">ระดับความเร่งด่วน</label>
        <select id="tk-urgency" class="smoky-glass-select" style="width: 100%; height: 42px; border-radius: 8px;">
          <option value="low">ปกติ (1-3 วันทำการ)</option>
          <option value="medium">ปานกลาง (ภายใน 24 ชม.)</option>
          <option value="high">⚡ ด่วนมาก (ส่งผลกระทบต่อการพักอาศัยทันที)</option>
        </select>
      </div>

      <div class="field">
        <label class="smoky-form-label" style="font-size: 0.84rem; display: block; margin-bottom: 6px;">รายละเอียดอาการที่ชำรุดเสียหาย *</label>
        <textarea id="tk-desc" class="smoky-glass-input" rows="3" placeholder="ระบุอาการชำรุด จุดที่เกิดปัญหา เช่น ท่อน้ำใต้ซิงค์รั่ว, แอร์มีน้ำหยด, ปลั๊กหัวเตียงไม่มีไฟ" required style="width: 100%; border-radius: 8px; padding: 10px;"></textarea>
      </div>

      <!-- ส่วนแนบรูปภาพจุดชำรุด -->
      <div class="field">
        <label class="smoky-form-label" style="font-size: 0.84rem; display: block; margin-bottom: 6px;">แนบรูปภาพจุดที่ชำรุด (ไม่บังคับ แต่ช่วยให้ช่างเตรียมเครื่องมือได้ตรงจุด)</label>
        <input type="file" id="tk-photo-input" accept="image/*" style="display:none;">
        <div class="upload-dropzone" id="tk-photo-dropzone" style="padding:14px; border: 2px dashed #CBD5E1; border-radius: 10px; cursor: pointer; text-align: center; background: rgba(255,255,255,0.04);">
          <div id="tk-dropzone-content">
            <div style="font-size:1.6rem; margin-bottom:2px;">📸</div>
            <div style="font-size:0.88rem; font-weight:600;" id="tk-dropzone-title">คลิกเพื่อถ่ายรูป หรือเลือกรูปภาพความเสียหาย</div>
            <div style="font-size:0.75rem; color: rgba(255,255,255,0.45); margin-top:2px;">รองรับ JPG, PNG, WEBP (ระบบจะบีบอัดให้อัตโนมัติ)</div>
          </div>
          <div id="tk-preview-wrap" style="display:none; align-items:center; justify-content:center; gap:12px;">
            <img id="tk-preview-img" style="max-height:100px; border-radius:8px; border:1px solid #CBD5E1; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
            <div>
              <div id="tk-photo-name" style="font-size:0.8rem; font-weight:600; color:var(--teal-950); margin-bottom:4px;"></div>
              <button type="button" class="btn btn-outline btn-sm" id="btn-change-tk-photo">เปลี่ยนรูป</button>
            </div>
          </div>
        </div>
      </div>
    </form>
  `;

  const footer = `
    <button type="button" class="btn btn-outline" onclick="window.closeAppModal()">ยกเลิก</button>
    <button type="button" class="btn btn-primary" id="btn-submit-ticket" style="background: #3B82F6; border-color: #3B82F6;">ส่งคำขอแจ้งซ่อม</button>
  `;

  showModal({
    title: 'เปิดใบแจ้งซ่อมอุปกรณ์ชำรุด (Maintenance Ticket)',
    body,
    footer,
    maxWidth: '560px'
  });

  // Photo Selection
  let selectedPhotoFile = null;
  const photoDropzone = document.getElementById('tk-photo-dropzone');
  const photoInput = document.getElementById('tk-photo-input');
  const dropzoneContent = document.getElementById('tk-dropzone-content');
  const previewWrap = document.getElementById('tk-preview-wrap');
  const previewImg = document.getElementById('tk-preview-img');
  const photoNameEl = document.getElementById('tk-photo-name');
  const btnChangePhoto = document.getElementById('btn-change-tk-photo');

  if (photoDropzone && photoInput) {
    photoDropzone.onclick = () => photoInput.click();
    if (btnChangePhoto) {
      btnChangePhoto.onclick = (e) => {
        e.stopPropagation();
        photoInput.click();
      };
    }

    photoInput.onchange = (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      selectedPhotoFile = file;

      previewImg.src = URL.createObjectURL(file);
      photoNameEl.textContent = file.name;
      dropzoneContent.style.display = 'none';
      previewWrap.style.display = 'flex';
    };
  }

  const submitTicketBtn = document.getElementById('btn-submit-ticket');
  submitTicketBtn.onclick = async () => {
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

    submitTicketBtn.disabled = true;
    submitTicketBtn.textContent = 'กำลังส่งข้อมูลแจ้งซ่อม...';

    let imageUrl = null;
    if (selectedPhotoFile) {
      try {
        imageUrl = await compressImage(selectedPhotoFile, 1200, 0.82);
      } catch (err) {
        console.warn('Image compress warning:', err);
      }
    }

    const newTicketId = 'FIX-' + Math.floor(100 + Math.random() * 900);

    const { error } = await supabase.from('maintenance').insert([{
      id: newTicketId,
      room_number: room,
      requester_name: name,
      phone: phone,
      category: cat,
      description: desc,
      urgency: urgency,
      status: 'pending',
      technician: '',
      image_url: imageUrl,
      created_at: new Date().toISOString().split('T')[0]
    }]);

    if (error) {
      console.error('Ticket insert error:', error);
      toast('เกิดข้อผิดพลาดในการบันทึกแจ้งซ่อม', 'error');
      submitTicketBtn.disabled = false;
      submitTicketBtn.textContent = 'ส่งคำขอแจ้งซ่อม';
      return;
    }

    toast(`เปิดใบแจ้งซ่อม ${newTicketId} เรียบร้อยแล้ว`, 'success');
    closeModal();
    loadMaintenanceData();
  };
}

function openUpdateTicketModal(ticket) {
  const bldg = getBuildingName(ticket.room_number);
  const body = `
    <form id="form-update-ticket">
      <div style="background: #F1F5F9; padding: 16px; border-radius: 12px; margin-bottom: 16px; border: 1px solid #E2E8F0;">
        <div style="display:flex; justify-content:space-between; align-items: flex-start;">
          <div>
            <strong style="color: #0F172A; font-size: 1.1rem; letter-spacing: -0.01em;">${ticket.id} — ห้อง ${ticket.room_number}</strong>
            <span style="font-size: 0.74rem; color: #2563EB; background: rgba(37,99,235,0.12); padding: 2px 8px; border-radius: 9999px; margin-left: 8px; font-weight: 600;">
              ${bldg}
            </span>
            <div style="font-size: 0.82rem; color: #64748B; margin-top: 3px;">
              ผู้แจ้ง: ${ticket.requester_name || '-'} (${ticket.phone || '-'})
            </div>
          </div>
          <span style="font-size:0.80rem; color: #64748B;">${fmtDate(ticket.created_at)}</span>
        </div>
        <div style="margin-top:10px; font-size:0.88rem; color: #334155;">
          หมวดหมู่: <strong style="color: #0F172A;">${ticket.category}</strong>
        </div>
        <div style="margin-top:6px; font-size:0.86rem; color: #475569; background: #ffffff; padding: 10px 12px; border-radius: 8px; border: 1px solid #E2E8F0; line-height: 1.45;">
          ${ticket.description}
        </div>
      </div>

      ${ticket.image_url ? `
        <div style="margin-bottom:16px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:12px; padding:12px; text-align:center;">
          <div style="font-size:0.85rem; font-weight:600; color:#0F172A; margin-bottom:8px;">📸 รูปถ่ายจุดชำรุดที่ผู้แจ้งแนบมา:</div>
          <img src="${ticket.image_url}" style="max-height:180px; border-radius:8px; cursor:pointer; box-shadow:0 2px 10px rgba(0,0,0,0.1); object-fit:contain;" onclick="window.showImageModal('${ticket.image_url}', 'รูปถ่ายแจ้งซ่อม: ${ticket.id}')" title="คลิกเพื่อดูรูปขยายใหญ่">
          <div style="font-size:0.75rem; color:#64748B; margin-top:6px;">(คลิกที่รูปเพื่อดูรูปภาพขยายใหญ่)</div>
        </div>
      ` : ''}

      <div class="field" style="margin-bottom: 14px;">
        <label style="font-size: 0.84rem; font-weight: 600; color: #0F172A; display: block; margin-bottom: 6px;">สถานะงานซ่อม</label>
        <select id="up-status" class="form-select" style="width: 100%; height: 42px; border-radius: 8px;">
          <option value="pending" ${ticket.status === 'pending' ? 'selected' : ''}>⏳ รอรับเรื่อง (Pending)</option>
          <option value="in_progress" ${ticket.status === 'in_progress' ? 'selected' : ''}>⚡ กำลังดำเนินการซ่อม (In Progress)</option>
          <option value="completed" ${ticket.status === 'completed' ? 'selected' : ''}>✓ ซ่อมเสร็จสิ้นเรียบร้อย (Completed)</option>
        </select>
      </div>

      <div class="field" style="margin-bottom: 14px;">
        <label style="font-size: 0.84rem; font-weight: 600; color: #0F172A; display: block; margin-bottom: 6px;">ช่างผู้รับผิดชอบงาน</label>
        <input type="text" id="up-tech" value="${ticket.technician || ''}" placeholder="เช่น ช่างวิเชียร (แอร์), ช่างสมบูรณ์" style="width: 100%; height: 42px; border-radius: 8px;">
      </div>
    </form>
  `;

  const footer = `
    <button type="button" class="btn btn-outline" id="btn-modal-del-ticket" style="color:var(--danger); border-color:#fadbd8; margin-right:auto;">${ic('trash')} ลบรายการซ่อมนี้</button>
    <button type="button" class="btn btn-outline" onclick="window.closeAppModal()">ยกเลิก</button>
    <button type="button" class="btn btn-primary" id="btn-save-ticket-status" style="background: #3B82F6; border-color: #3B82F6;">บันทึกความคืบหน้า</button>
  `;

  showModal({
    title: `อัปเดตสถานะงานซ่อม ${ticket.id}`,
    body,
    footer,
    maxWidth: '520px'
  });

  const btnModalDelTicket = document.getElementById('btn-modal-del-ticket');
  if (btnModalDelTicket) {
    btnModalDelTicket.onclick = async () => {
      if (confirm(`คุณต้องการลบรายการแจ้งซ่อม ${ticket.id} (ห้อง ${ticket.room_number}) ออกจากระบบใช่หรือไม่?`)) {
        const { error } = await supabase.from('maintenance').eq('id', ticket.id).delete();
        if (error) {
          toast('เกิดข้อผิดพลาดในการลบรายการแจ้งซ่อม', 'error');
          return;
        }
        cachedTickets = cachedTickets.filter(x => x.id !== ticket.id);
        toast(`ลบรายการแจ้งซ่อม ${ticket.id} เรียบร้อยแล้ว`, 'success');
        closeModal();
        loadMaintenanceData();
      }
    };
  }

  document.getElementById('btn-save-ticket-status').onclick = async () => {
    const st = document.getElementById('up-status').value;
    const tech = document.getElementById('up-tech').value.trim();

    const { error } = await supabase.from('maintenance').eq('id', ticket.id).update({
      status: st,
      technician: tech
    });

    if (error) {
      toast('บันทึกสถานะงานซ่อมไม่สำเร็จ', 'error');
      return;
    }

    // หากปิดงานซ่อม (completed) แล้วห้องนั้นยังอยู่สถานะปิดปรับปรุงและไม่มีงานซ่อมอื่นค้าง ให้เปลี่ยนเป็นพร้อมใช้งานอัตโนมัติ
    if (st === 'completed' && ticket.room_number) {
      try {
        const cleanRoom = String(ticket.room_number).trim();
        const [{ data: roomRows }, { data: remainingTickets }] = await Promise.all([
          supabase.from('rooms').select('id,status').eq('room_number', cleanRoom),
          supabase.from('maintenance').select('id,status').eq('room_number', cleanRoom)
        ]);
        const hasOpen = Array.isArray(remainingTickets) && remainingTickets.some(t => t.id !== ticket.id && t.status !== 'completed');
        const targetRoom = Array.isArray(roomRows) ? roomRows[0] : null;
        if (!hasOpen && targetRoom && targetRoom.status === 'maintenance') {
          await supabase.from('rooms').eq('id', targetRoom.id).update({ status: 'vacant' });
        }
      } catch (_) {}
    }

    toast('บันทึกความคืบหน้ารายการซ่อมเรียบร้อยแล้ว', 'success');
    closeModal();
    loadMaintenanceData();
  };
}
