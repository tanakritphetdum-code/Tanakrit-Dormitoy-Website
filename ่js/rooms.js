// js/rooms.js
import { supabase } from './supabase.js';
import { ic, fmtCurrency, showModal, closeModal, toast } from './api.js';

let currentFloorFilter = 'all';
let currentStatusFilter = 'all';
let currentSearch = '';

export async function renderRoomsView() {
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
