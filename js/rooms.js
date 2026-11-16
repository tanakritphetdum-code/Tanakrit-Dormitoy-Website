// js/rooms.js
// ระบบผังห้องพักและสถานะห้องพัก 3 อาคาร (Tanakrit, KingPhetch, UnderGround)
import { supabase } from './supabase.js';
import { ic, fmtCurrency, showModal, closeModal, toast } from './api.js';

let currentBuildingFilter = 'all';
let currentStatusFilter = 'all';
let currentSearch = '';

// รายชื่อห้องพักมาตรฐานทั้ง 17 ห้อง (3 อาคาร) ตามโครงสร้างจริงของหอพัก
export const DEFAULT_ROOMS = [
  // 1. อาคาร Tanakrit (9 ห้อง: 101 - 109)
  { id: 'RM-T101', room_number: '101', building: 'Tanakrit', floor: 1, type: 'ห้องพัดลม', price: 1500, size: 'กว้าง 3.5 M × ยาว 8 M', bathroom: 'ห้องน้ำในตัว', status: 'occupied', tenant_name: 'นายสมชาย ธนกฤษฎ์', tenant_phone: '089-123-4567', amenities: 'เตียง+ที่นอน, ตู้เสื้อผ้า, ห้องน้ำในตัว, ราวตากผ้าหลังห้อง' },
  { id: 'RM-T102', room_number: '102', building: 'Tanakrit', floor: 1, type: 'ห้องพัดลม', price: 1500, size: 'กว้าง 3.5 M × ยาว 8 M', bathroom: 'ห้องน้ำในตัว', status: 'occupied', tenant_name: 'นายเกียรติภูมิ ภักดี', tenant_phone: '081-222-3344', amenities: 'เตียง+ที่นอน, ตู้เสื้อผ้า, ห้องน้ำในตัว, ราวตากผ้าหลังห้อง' },
  { id: 'RM-T103', room_number: '103', building: 'Tanakrit', floor: 1, type: 'ห้องพัดลม', price: 1500, size: 'กว้าง 3.5 M × ยาว 8 M', bathroom: 'ห้องน้ำในตัว', status: 'vacant', tenant_name: '', tenant_phone: '', amenities: 'เตียง+ที่นอน, ตู้เสื้อผ้า, ห้องน้ำในตัว, ราวตากผ้าหลังห้อง' },
  { id: 'RM-T104', room_number: '104', building: 'Tanakrit', floor: 1, type: 'ห้องพัดลม', price: 1500, size: 'กว้าง 3.5 M × ยาว 8 M', bathroom: 'ห้องน้ำในตัว', status: 'vacant', tenant_name: '', tenant_phone: '', amenities: 'เตียง+ที่นอน, ตู้เสื้อผ้า, ห้องน้ำในตัว, ราวตากผ้าหลังห้อง' },
  { id: 'RM-T105', room_number: '105', building: 'Tanakrit', floor: 1, type: 'ห้องพัดลม', price: 1500, size: 'กว้าง 3.5 M × ยาว 8 M', bathroom: 'ห้องน้ำในตัว', status: 'occupied', tenant_name: 'นายวรเมธ แก้วมณี', tenant_phone: '086-555-7788', amenities: 'เตียง+ที่นอน, ตู้เสื้อผ้า, ห้องน้ำในตัว, ราวตากผ้าหลังห้อง' },
  { id: 'RM-T106', room_number: '106', building: 'Tanakrit', floor: 1, type: 'ห้องพัดลม', price: 1500, size: 'กว้าง 3.5 M × ยาว 8 M', bathroom: 'ห้องน้ำในตัว', status: 'vacant', tenant_name: '', tenant_phone: '', amenities: 'เตียง+ที่นอน, ตู้เสื้อผ้า, ห้องน้ำในตัว, ราวตากผ้าหลังห้อง' },
  { id: 'RM-T107', room_number: '107', building: 'Tanakrit', floor: 1, type: 'ห้องพัดลม', price: 1500, size: 'กว้าง 3.5 M × ยาว 8 M', bathroom: 'ห้องน้ำในตัว', status: 'maintenance', tenant_name: '', tenant_phone: '', amenities: 'เตียง+ที่นอน, ตู้เสื้อผ้า, ห้องน้ำในตัว, ราวตากผ้าหลังห้อง' },
  { id: 'RM-T108', room_number: '108', building: 'Tanakrit', floor: 1, type: 'ห้องพัดลม', price: 1500, size: 'กว้าง 3.5 M × ยาว 8 M', bathroom: 'ห้องน้ำในตัว', status: 'vacant', tenant_name: '', tenant_phone: '', amenities: 'เตียง+ที่นอน, ตู้เสื้อผ้า, ห้องน้ำในตัว, ราวตากผ้าหลังห้อง' },
  { id: 'RM-T109', room_number: '109', building: 'Tanakrit', floor: 1, type: 'ห้องพัดลม', price: 1500, size: 'กว้าง 3.5 M × ยาว 8 M', bathroom: 'ห้องน้ำในตัว', status: 'vacant', tenant_name: '', tenant_phone: '', amenities: 'เตียง+ที่นอน, ตู้เสื้อผ้า, ห้องน้ำในตัว, ราวตากผ้าหลังห้อง' },

  // 2. อาคาร KingPhetch (5 ห้อง: 201 - 205)
  { id: 'RM-K201', room_number: '201', building: 'KingPhetch', floor: 1, type: 'ห้องพัดลม', price: 1500, size: 'กว้าง 3.5 M × ยาว 8 M', bathroom: 'ห้องน้ำในตัว', status: 'occupied', tenant_name: 'นายชินวัตร ประเสริฐ', tenant_phone: '083-444-1122', amenities: 'เตียง+ที่นอน, ตู้เสื้อผ้า, ห้องน้ำในตัว, ราวตากผ้าหลังห้อง' },
  { id: 'RM-K202', room_number: '202', building: 'KingPhetch', floor: 1, type: 'ห้องพัดลม', price: 1500, size: 'กว้าง 3.5 M × ยาว 8 M', bathroom: 'ห้องน้ำในตัว', status: 'occupied', tenant_name: 'นายธีรพัฒน์ สุขใจ', tenant_phone: '082-888-9900', amenities: 'เตียง+ที่นอน, ตู้เสื้อผ้า, ห้องน้ำในตัว, ราวตากผ้าหลังห้อง' },
  { id: 'RM-K203', room_number: '203', building: 'KingPhetch', floor: 1, type: 'ห้องพัดลม', price: 1500, size: 'กว้าง 3.5 M × ยาว 8 M', bathroom: 'ห้องน้ำในตัว', status: 'vacant', tenant_name: '', tenant_phone: '', amenities: 'เตียง+ที่นอน, ตู้เสื้อผ้า, ห้องน้ำในตัว, ราวตากผ้าหลังห้อง' },
  { id: 'RM-K204', room_number: '204', building: 'KingPhetch', floor: 1, type: 'ห้องพัดลม', price: 1500, size: 'กว้าง 3.5 M × ยาว 8 M', bathroom: 'ห้องน้ำในตัว', status: 'vacant', tenant_name: '', tenant_phone: '', amenities: 'เตียง+ที่นอน, ตู้เสื้อผ้า, ห้องน้ำในตัว, ราวตากผ้าหลังห้อง' },
  { id: 'RM-K205', room_number: '205', building: 'KingPhetch', floor: 1, type: 'ห้องพัดลม', price: 1500, size: 'กว้าง 3.5 M × ยาว 8 M', bathroom: 'ห้องน้ำในตัว', status: 'vacant', tenant_name: '', tenant_phone: '', amenities: 'เตียง+ที่นอน, ตู้เสื้อผ้า, ห้องน้ำในตัว, ราวตากผ้าหลังห้อง' },

  // 3. อาคาร UnderGround (3 ห้อง: B01 - B03)
  { id: 'RM-UG01', room_number: 'B01', building: 'UnderGround', floor: 0, type: 'ห้องพัดลม', price: 800, size: 'กว้าง 3 M × ยาว 4 M', bathroom: 'ห้องน้ำรวม', status: 'occupied', tenant_name: 'นายปกรณ์ รัตนพันธุ์', tenant_phone: '087-333-2211', amenities: 'เตียง+ที่นอน, ตู้เสื้อผ้า, ห้องน้ำรวม' },
  { id: 'RM-UG02', room_number: 'B02', building: 'UnderGround', floor: 0, type: 'ห้องพัดลม', price: 800, size: 'กว้าง 3 M × ยาว 4 M', bathroom: 'ห้องน้ำรวม', status: 'vacant', tenant_name: '', tenant_phone: '', amenities: 'เตียง+ที่นอน, ตู้เสื้อผ้า, ห้องน้ำรวม' },
  { id: 'RM-UG03', room_number: 'B03', building: 'UnderGround', floor: 0, type: 'ห้องพัดลม', price: 800, size: 'กว้าง 3 M × ยาว 4 M', bathroom: 'ห้องน้ำรวม', status: 'vacant', tenant_name: '', tenant_phone: '', amenities: 'เตียง+ที่นอน, ตู้เสื้อผ้า, ห้องน้ำรวม' }
];

export async function renderRoomsView() {
  setTimeout(() => {
    bindRoomsEvents();
    loadRoomsData();
  }, 0);

  return `
    <div class="card">
      <div class="card-header-actions">
        <div>
          <h3>${ic('door')} สถานะและการจัดการห้องพัก (Floor Plan — 3 อาคาร)</h3>
          <p style="color: var(--muted); margin-top: 4px; font-size: 0.9rem;">
            ผังห้องพักทั้งหมด 17 ห้อง ครอบคลุมอาคาร Tanakrit (9 ห้อง), อาคาร KingPhetch (5 ห้อง) และอาคาร UnderGround (3 ห้อง)
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

        <div class="filter-tabs" id="building-tabs">
          <button class="filter-tab-btn active" data-building="all">ทุกอาคาร (17 ห้อง)</button>
          <button class="filter-tab-btn" data-building="Tanakrit">🏢 Tanakrit (9 ห้อง)</button>
          <button class="filter-tab-btn" data-building="KingPhetch">🏡 KingPhetch (5 ห้อง)</button>
          <button class="filter-tab-btn" data-building="UnderGround">🛋️ UnderGround (3 ห้อง)</button>
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

  let rooms = null;

  // 1. ลองดึงข้อมูลจาก Supabase
  try {
    const { data, error } = await supabase.from('rooms').select('*').order('room_number', { ascending: true });
    // ถ้า Supabase มีข้อมูล และมีข้อมูล 3 อาคาร
    if (!error && data && data.length > 0) {
      rooms = data;
    }
  } catch (err) {
    console.warn('Cannot fetch rooms from Supabase Cloud:', err);
  }

  // 2. ถ้า Supabase ยังเป็นห้องชุดเดิม หรือออฟไลน์ ให้ใช้แคชท้องถิ่นหรือ DEFAULT_ROOMS 17 ห้อง
  if (!rooms || rooms.length !== 17) {
    try {
      const cached = localStorage.getItem('tanakrit_rooms_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.length === 17) {
          rooms = parsed;
        }
      }
    } catch (_) {}
  }

  if (!rooms) {
    rooms = DEFAULT_ROOMS;
    localStorage.setItem('tanakrit_rooms_cache', JSON.stringify(rooms));
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
        <span class="lbl">ห้องพักทั้งหมด (3 อาคาร)</span>
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
    // Building filter
    if (currentBuildingFilter !== 'all') {
      const bName = r.building || (r.room_number.startsWith('B') ? 'UnderGround' : (Number(r.room_number) >= 200 ? 'KingPhetch' : 'Tanakrit'));
      if (bName !== currentBuildingFilter) return false;
    }
    // Status
    if (currentStatusFilter !== 'all' && r.status !== currentStatusFilter) return false;
    // Search
    if (currentSearch) {
      const q = currentSearch.toLowerCase();
      const matchNum = (r.room_number || '').toLowerCase().includes(q);
      const matchTenant = (r.tenant_name || '').toLowerCase().includes(q);
      const matchType = (r.type || '').toLowerCase().includes(q);
      const matchBuilding = (r.building || '').toLowerCase().includes(q);
      if (!matchNum && !matchTenant && !matchType && !matchBuilding) return false;
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

    const buildingName = r.building || (r.room_number.startsWith('B') ? 'UnderGround' : (Number(r.room_number) >= 200 ? 'KingPhetch' : 'Tanakrit'));
    const roomSize = r.size || (buildingName === 'UnderGround' ? 'กว้าง 3 M × ยาว 4 M' : 'กว้าง 3.5 M × ยาว 8 M');
    const bathroomType = r.bathroom || (buildingName === 'UnderGround' ? 'ห้องน้ำรวม' : 'ห้องน้ำในตัว');
    const roomAmenities = r.amenities || (buildingName === 'UnderGround' ? 'เตียง+ที่นอน, ตู้เสื้อผ้า, ห้องน้ำรวม' : 'เตียง+ที่นอน, ตู้เสื้อผ้า, ห้องน้ำในตัว, ราวตากผ้าหลังห้อง');

    let buildingBadgeColor = 'background:#E8F5E9; color:#1B5E20;';
    if (buildingName === 'KingPhetch') {
      buildingBadgeColor = 'background:#E3F2FD; color:#0D47A1;';
    } else if (buildingName === 'UnderGround') {
      buildingBadgeColor = 'background:#FFF3E0; color:#E65100;';
    }

    html += `
      <div class="room-box-card ${statusClass}" data-room-id="${r.id}">
        <div class="room-top">
          <div>
            <span class="room-badge-floor" style="${buildingBadgeColor} font-weight:600; padding:2px 8px; border-radius:6px; font-size:0.75rem;">
              อาคาร ${buildingName}
            </span>
            <div class="room-no" style="margin-top:4px;">ห้อง ${r.room_number}</div>
          </div>
          <span class="room-status-badge ${statusClass}">
            <span class="status-dot" style="background:${dotColor}"></span>
            ${statusLabel}
          </span>
        </div>

        <div class="room-details-body">
          <div class="room-type">${r.type || 'ห้องพัดลม'}</div>
          <div style="font-size:0.8rem; color:var(--muted); margin: 4px 0 6px 0; line-height: 1.4;">
            <div>📐 ${roomSize}</div>
            <div>🚿 ${bathroomType}</div>
          </div>
          <div class="room-price">${fmtCurrency(r.price)} / เดือน</div>
          
          <div style="font-size:0.75rem; color:var(--muted); background:#f9fafb; padding:6px 8px; border-radius:6px; margin-top:6px; line-height:1.4;">
            <strong>ของในห้อง:</strong> ${roomAmenities}
          </div>

          <div class="room-tenant-info" style="margin-top:8px;">
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
      if (targetRoom) openManageRoomModal(targetRoom, rooms);
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

  const buildingTabs = document.getElementById('building-tabs');
  if (buildingTabs) {
    buildingTabs.querySelectorAll('.filter-tab-btn').forEach(btn => {
      btn.onclick = () => {
        buildingTabs.querySelectorAll('.filter-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentBuildingFilter = btn.getAttribute('data-building');
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
function openManageRoomModal(room, allRooms) {
  const body = `
    <form id="form-manage-room">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
        <div class="field">
          <label>หมายเลขห้อง</label>
          <input type="text" id="m-room-number" value="${room.room_number}" required>
        </div>
        <div class="field">
          <label>อาคาร</label>
          <select id="m-building" class="form-select">
            <option value="Tanakrit" ${room.building === 'Tanakrit' ? 'selected' : ''}>อาคาร Tanakrit (กว้าง 3.5 M × ยาว 8 M)</option>
            <option value="KingPhetch" ${room.building === 'KingPhetch' ? 'selected' : ''}>อาคาร KingPhetch (กว้าง 3.5 M × ยาว 8 M)</option>
            <option value="UnderGround" ${room.building === 'UnderGround' ? 'selected' : ''}>อาคาร UnderGround (กว้าง 3 M × ยาว 4 M)</option>
          </select>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
        <div class="field">
          <label>ประเภทห้องพัก</label>
          <input type="text" id="m-type" value="${room.type || 'ห้องพัดลม'}" required>
        </div>
        <div class="field">
          <label>ราคาค่าเช่าต่อเดือน (บาท)</label>
          <input type="number" id="m-price" value="${room.price}" required>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
        <div class="field">
          <label>ขนาดห้องพัก</label>
          <input type="text" id="m-size" value="${room.size || (room.building === 'UnderGround' ? 'กว้าง 3 M × ยาว 4 M' : 'กว้าง 3.5 M × ยาว 8 M')}">
        </div>
        <div class="field">
          <label>ประเภทห้องน้ำ</label>
          <select id="m-bathroom" class="form-select">
            <option value="ห้องน้ำในตัว" ${room.bathroom !== 'ห้องน้ำรวม' ? 'selected' : ''}>ห้องน้ำในตัว</option>
            <option value="ห้องน้ำรวม" ${room.bathroom === 'ห้องน้ำรวม' ? 'selected' : ''}>ห้องน้ำรวม</option>
          </select>
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
    title: `จัดการห้องพัก ${room.room_number} (อาคาร ${room.building || 'Tanakrit'})`,
    body,
    footer,
    maxWidth: '540px'
  });

  document.getElementById('btn-save-manage-room').onclick = async () => {
    const num = document.getElementById('m-room-number').value.trim();
    const bld = document.getElementById('m-building').value;
    const tp = document.getElementById('m-type').value.trim();
    const pr = Number(document.getElementById('m-price').value);
    const sz = document.getElementById('m-size').value.trim();
    const br = document.getElementById('m-bathroom').value;
    const st = document.getElementById('m-status').value;
    const tName = document.getElementById('m-tenant-name').value.trim();
    const tPhone = document.getElementById('m-tenant-phone').value.trim();

    const updatedData = {
      room_number: num,
      building: bld,
      floor: bld === 'UnderGround' ? 0 : 1,
      type: tp,
      price: pr,
      size: sz,
      bathroom: br,
      status: st,
      tenant_name: st === 'occupied' ? tName : '',
      tenant_phone: st === 'occupied' ? tPhone : ''
    };

    try {
      await supabase.from('rooms').eq('id', room.id).update(updatedData);
    } catch (_) {}

    // อัปเดตใน LocalStorage Cache
    try {
      const cached = JSON.parse(localStorage.getItem('tanakrit_rooms_cache') || '[]');
      const idx = cached.findIndex(x => x.id === room.id);
      if (idx !== -1) {
        cached[idx] = { ...cached[idx], ...updatedData };
        localStorage.setItem('tanakrit_rooms_cache', JSON.stringify(cached));
      }
    } catch (_) {}

    toast(`อัปเดตข้อมูลห้อง ${num} เรียบร้อยแล้ว`, 'success');
    closeModal();
    loadRoomsData();
  };

  document.getElementById('btn-delete-room').onclick = async () => {
    if (confirm(`คุณต้องการลบห้อง ${room.room_number} ออกจากระบบใช่หรือไม่?`)) {
      try {
        await supabase.from('rooms').eq('id', room.id).delete();
      } catch (_) {}

      try {
        let cached = JSON.parse(localStorage.getItem('tanakrit_rooms_cache') || '[]');
        cached = cached.filter(x => x.id !== room.id);
        localStorage.setItem('tanakrit_rooms_cache', JSON.stringify(cached));
      } catch (_) {}

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
          <label>หมายเลขห้อง (เช่น 110, B04)</label>
          <input type="text" id="add-room-number" placeholder="เช่น 110" required>
        </div>
        <div class="field">
          <label>อาคาร</label>
          <select id="add-building" class="form-select">
            <option value="Tanakrit">อาคาร Tanakrit (กว้าง 3.5 M × ยาว 8 M)</option>
            <option value="KingPhetch">อาคาร KingPhetch (กว้าง 3.5 M × ยาว 8 M)</option>
            <option value="UnderGround">อาคาร UnderGround (กว้าง 3 M × ยาว 4 M)</option>
          </select>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
        <div class="field">
          <label>ประเภทห้อง</label>
          <input type="text" id="add-type" value="ห้องพัดลม" required>
        </div>
        <div class="field">
          <label>ราคาค่าเช่าต่อเดือน (บาท)</label>
          <input type="number" id="add-price" value="1500" required>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
        <div class="field">
          <label>ขนาดห้อง</label>
          <input type="text" id="add-size" value="กว้าง 3.5 M × ยาว 8 M">
        </div>
        <div class="field">
          <label>ประเภทห้องน้ำ</label>
          <select id="add-bathroom" class="form-select">
            <option value="ห้องน้ำในตัว">ห้องน้ำในตัว</option>
            <option value="ห้องน้ำรวม">ห้องน้ำรวม</option>
          </select>
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

  const bldSelect = document.getElementById('add-building');
  if (bldSelect) {
    bldSelect.onchange = () => {
      const val = bldSelect.value;
      if (val === 'UnderGround') {
        document.getElementById('add-price').value = 800;
        document.getElementById('add-size').value = 'กว้าง 3 M × ยาว 4 M';
        document.getElementById('add-bathroom').value = 'ห้องน้ำรวม';
      } else {
        document.getElementById('add-price').value = 1500;
        document.getElementById('add-size').value = 'กว้าง 3.5 M × ยาว 8 M';
        document.getElementById('add-bathroom').value = 'ห้องน้ำในตัว';
      }
    };
  }

  document.getElementById('btn-submit-add-room').onclick = async () => {
    const num = document.getElementById('add-room-number').value.trim();
    const bld = document.getElementById('add-building').value;
    const tp = document.getElementById('add-type').value.trim();
    const pr = Number(document.getElementById('add-price').value);
    const sz = document.getElementById('add-size').value.trim();
    const br = document.getElementById('add-bathroom').value;
    const st = document.getElementById('add-status').value;

    if (!num) {
      toast('กรุณาระบุหมายเลขห้อง', 'error');
      return;
    }

    const newRoom = {
      id: 'RM-' + Math.floor(1000 + Math.random() * 9000),
      room_number: num,
      building: bld,
      floor: bld === 'UnderGround' ? 0 : 1,
      type: tp,
      price: pr,
      size: sz,
      bathroom: br,
      status: st,
      tenant_name: '',
      tenant_phone: '',
      amenities: bld === 'UnderGround' ? 'เตียง+ที่นอน, ตู้เสื้อผ้า, ห้องน้ำรวม' : 'เตียง+ที่นอน, ตู้เสื้อผ้า, ห้องน้ำในตัว, ราวตากผ้าหลังห้อง'
    };

    try {
      await supabase.from('rooms').insert([newRoom]);
    } catch (_) {}

    try {
      const cached = JSON.parse(localStorage.getItem('tanakrit_rooms_cache') || '[]');
      cached.push(newRoom);
      localStorage.setItem('tanakrit_rooms_cache', JSON.stringify(cached));
    } catch (_) {}

    toast(`เพิ่มห้องพัก ${num} (อาคาร ${bld}) เรียบร้อยแล้ว`, 'success');
    closeModal();
    loadRoomsData();
  };
}
