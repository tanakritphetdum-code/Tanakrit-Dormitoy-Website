// js/tenants.js
// ระบบทะเบียนผู้พักอาศัยและสัญญาเช่า 3 อาคาร (Tanakrit, KingPhetch, UnderGround)
// ออกแบบด้วย Smoky Frosted Glass Design System
import { supabase } from './supabase.js';
import { ic, fmtDate, fmtCurrency, showModal, closeModal, toast } from './api.js';

const TENANTS_STORAGE_KEY = 'tanakrit_tenants_cache_v3';

let tenantBuildingFilter = 'all';
let tenantSearchTerm = '';
let tenantSortBy = 'room_asc';
let cachedTenants = [];

// ข้อมูลรายชื่อผู้พักอาศัยเริ่มต้น (ว่างเปล่าเมื่อไม่มีข้อมูลในฐานข้อมูลจริง)
export const DEFAULT_TENANTS = [];

// ฟังก์ชันวิเคราะห์ข้อมูลอาคารและค่าเช่าจากเลขห้องพัก
export function getBuildingInfo(roomNum) {
  const r = (roomNum || '').toString().trim().toUpperCase();
  if (r.startsWith('B') || r.startsWith('ใต้บ้าน')) {
    return { name: 'UnderGround', nameTh: 'อาคาร ใต้บ้าน', rent: 800, color: '#10B981', badge: '🚗 อาคาร ใต้บ้าน' };
  } else if (r.startsWith('2')) {
    return { name: 'KingPhetch', nameTh: 'อาคาร กิ่งเพชร', rent: 1500, color: '#3B82F6', badge: '🏡 อาคาร กิ่งเพชร' };
  } else {
    return { name: 'Tanakrit', nameTh: 'อาคาร ธนกฤษฎ์', rent: 1500, color: '#8B5CF6', badge: '🏢 อาคาร ธนกฤษฎ์' };
  }
}

// โหลดข้อมูลผู้พักอาศัยจาก Cache หรือ Supabase Cloud
async function fetchTenantsList() {
  try {
    const local = localStorage.getItem(TENANTS_STORAGE_KEY);
    if (local) {
      cachedTenants = JSON.parse(local);
    }
  } catch (e) {
    console.warn('Cannot read local tenants cache:', e);
  }

  try {
    const { data, error } = await supabase.from('tenants').select('*').order('room', { ascending: true });
    if (!error && Array.isArray(data)) {
      // ทำการแมปข้อมูลที่ได้จาก Supabase ตรงตามจริง
      const mapped = data.map(dbItem => {
        const bInfo = getBuildingInfo(dbItem.room);
        const existing = (cachedTenants.length > 0 ? cachedTenants : []).find(x => x.room === dbItem.room || x.id === dbItem.id);
        return {
          id: dbItem.id || 'T-' + Math.random().toString(36).substring(2, 7),
          tenant_id: dbItem.tenant_id || (existing ? existing.tenant_id : '6512000'),
          name: dbItem.name || (existing ? existing.name : 'ผู้พักอาศัย'),
          room: dbItem.room || (existing ? existing.room : '101'),
          building: bInfo.name,
          building_th: bInfo.nameTh,
          rent: existing ? existing.rent : bInfo.rent,
          phone: dbItem.phone || (existing ? existing.phone : '-'),
          email: dbItem.email || (existing ? existing.email : '-'),
          line_id: (existing && existing.line_id) ? existing.line_id : '-',
          id_card: (existing && existing.id_card) ? existing.id_card : '1-8099-00123-45-X',
          check_in: dbItem.check_in || (existing ? existing.check_in : '2026-06-01'),
          lease_term: (existing && existing.lease_term) ? existing.lease_term : 'สัญญา 1 ปี',
          deposit: (existing && existing.deposit) ? existing.deposit : 2000,
          emergency_contact: (existing && existing.emergency_contact) ? existing.emergency_contact : 'ผู้ปกครอง 081-xxx-xxxx',
          status: dbItem.status || (existing ? existing.status : 'active'),
          avatar: (existing && existing.avatar) ? existing.avatar : `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80`,
          notes: (existing && existing.notes) ? existing.notes : 'ข้อมูลซิงค์จากระบบฐานข้อมูล'
        };
      });

      cachedTenants = mapped;
      localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify(cachedTenants));
    } else if (error) {
      console.warn('Fetch tenants error:', error);
      cachedTenants = [];
    }
  } catch (err) {
    console.warn('Fetch tenants exception:', err);
    cachedTenants = [];
  }
  return cachedTenants;
}

// ฟังก์ชันหลัก Render หน้าจอผู้พักอาศัย (Smoky Frosted Glass)
export async function renderTenantsView() {
  await fetchTenantsList();

  setTimeout(() => {
    bindTenantsEvents();
    renderTenantsTable();
  }, 0);

  return `
    <div style="display: flex; flex-direction: column; gap: 24px; width: 100%;">
      
      <!-- 1. Header & Actions -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(59, 130, 246, 0.2); display: flex; align-items: center; justify-content: center; color: #60A5FA;">
              ${ic('users')}
            </div>
            <h2 style="font-size: 1.35rem; font-weight: 700; color: #ffffff; margin: 0; letter-spacing: -0.02em;">
              ทะเบียนผู้พักอาศัยและสัญญาเช่า (Tenants Directory & Leases)
            </h2>
          </div>
          <p style="color: rgba(255, 255, 255, 0.45); font-size: 0.84rem; margin: 6px 0 0 0;">
            จัดการประวัติผู้เช่าห้องพัก ข้อมูลติดต่อ สัญญาเช่า และบัญชีล็อกอินของนักศึกษา/ผู้พักอาศัยทั้ง 17 ห้อง (3 อาคาร)
          </p>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <!-- ปุ่มรีเฟรช -->
          <button class="smoky-round-glass-btn" id="btn-refresh-tenants" style="width: auto; border-radius: 9999px; padding: 0 16px; height: 38px; gap: 6px; font-size: 0.80rem;" title="รีเฟรชข้อมูล">
            ${ic('check')}
            <span>รีเฟรชข้อมูล</span>
          </button>

          <!-- ปุ่มส่งออก CSV -->
          <button class="smoky-round-glass-btn" id="btn-export-tenants" style="width: auto; border-radius: 9999px; padding: 0 16px; height: 38px; gap: 6px; font-size: 0.80rem; background: rgba(255,255,255,0.08);" title="ส่งออกไฟล์ CSV">
            ${ic('download')}
            <span>ส่งออก (CSV)</span>
          </button>

          <!-- ปุ่มเพิ่มผู้พักใหม่ -->
          <button class="smoky-round-glass-btn" id="btn-open-add-tenant" style="width: auto; border-radius: 9999px; padding: 0 18px; height: 38px; background: #3B82F6; color: #ffffff; border: 1px solid rgba(59,130,246,0.5); box-shadow: 0 0 20px rgba(59,130,246,0.4); font-size: 0.82rem; font-weight: 600; gap: 6px;">
            ${ic('plus')}
            <span>+ ลงทะเบียนผู้พักใหม่</span>
          </button>
        </div>
      </div>

      <!-- 2. KPI Summary Stat Tiles (Smoky Glass 4 Tiles) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;" id="tenants-kpi-grid">
        <div class="smoky-tile">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="smoky-meta-label">ผู้พักอาศัยปัจจุบัน</span>
            <span class="smoky-delta-pos" style="background: rgba(59, 130, 246, 0.15); color: #60A5FA;">กำลังพัก</span>
          </div>
          <div class="smoky-kpi-num" style="margin-top: 8px; color: #ffffff;" id="kpi-total-tenants">11 คน</div>
          <div class="smoky-kpi-sub" id="kpi-total-tenants-sub">จากห้องพักทั้งหมด 17 ห้อง (3 อาคาร)</div>
        </div>

        <div class="smoky-tile">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="smoky-meta-label">อัตราการเข้าพัก (Occupancy)</span>
            <span class="smoky-delta-pos">เป้าหมาย &gt; 70%</span>
          </div>
          <div class="smoky-kpi-num" style="margin-top: 8px; color: #34D399;" id="kpi-occupancy-rate">65%</div>
          <div class="smoky-kpi-sub">ธนกฤษฎ์ 6 • กิ่งเพชร 3 • ใต้บ้าน 2</div>
        </div>

        <div class="smoky-tile">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="smoky-meta-label">ห้องว่างพร้อมเข้าพัก</span>
            <span class="smoky-delta-pos" style="background: rgba(16, 185, 129, 0.15); color: #34D399;">ว่างพร้อมเช่า</span>
          </div>
          <div class="smoky-kpi-num" style="margin-top: 8px; color: #10B981;" id="kpi-vacant-rooms">5 ห้อง</div>
          <div class="smoky-kpi-sub">108, 109, 204, 205, B03</div>
        </div>

        <div class="smoky-tile">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="smoky-meta-label">ปรับปรุงห้อง / รอเข้าพัก</span>
            <span class="smoky-delta-neg" style="background: rgba(245, 158, 11, 0.15); color: #FBBF24;">ซ่อมบำรุง</span>
          </div>
          <div class="smoky-kpi-num" style="margin-top: 8px; color: #FBBF24;" id="kpi-maint-rooms">1 ห้อง</div>
          <div class="smoky-kpi-sub">ห้อง 107 (กำลังตรวจเช็กแอร์)</div>
        </div>
      </div>

      <!-- 3. Toolbar: Search Box, Building Filters & Sort -->
      <div class="smoky-card" style="padding: 16px 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
          
          <!-- Search Box -->
          <div style="position: relative; min-width: 260px; flex: 1; max-width: 420px;">
            <span style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.4); display: flex; align-items: center;">
              ${ic('search')}
            </span>
            <input type="text" id="tenant-search-input" class="smoky-glass-input" placeholder="ค้นหาชื่อ, รหัสนักศึกษา, ห้องพัก, หรือเบอร์โทร..." style="width: 100%; padding-left: 38px;">
          </div>

          <!-- Building Filter Buttons (Segmented Control) -->
          <div class="smoky-seg-control" id="tenants-filter-tabs" style="overflow-x: auto; max-width: 100%; padding-bottom: 2px;">
            <button class="smoky-seg-btn active" data-filter="all">ทั้งหมด (${cachedTenants.length})</button>
            <button class="smoky-seg-btn" data-filter="Tanakrit">🏢 อาคาร ธนกฤษฎ์</button>
            <button class="smoky-seg-btn" data-filter="KingPhetch">🏡 อาคาร กิ่งเพชร</button>
            <button class="smoky-seg-btn" data-filter="UnderGround">🚗 อาคาร ใต้บ้าน</button>
            <button class="smoky-seg-btn" data-filter="active">🟢 กำลังพักอาศัย</button>
          </div>

          <!-- Sort Select -->
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 0.80rem; color: rgba(255,255,255,0.45); white-space: nowrap;">จัดเรียง:</span>
            <select id="tenant-sort-select" class="smoky-glass-input" style="height: 36px; padding: 0 12px; font-size: 0.80rem; border-radius: 8px; width: auto;">
              <option value="room_asc" style="background:#141a29; color:white;">เลขห้อง (น้อย ➔ มาก)</option>
              <option value="name_asc" style="background:#141a29; color:white;">ชื่อผู้พัก (ก ➔ ฮ)</option>
              <option value="checkin_desc" style="background:#141a29; color:white;">วันที่เข้าพัก (ล่าสุด)</option>
              <option value="rent_desc" style="background:#141a29; color:white;">ค่าเช่า (สูง ➔ ต่ำ)</option>
            </select>
          </div>

        </div>
      </div>

      <!-- 4. Modern Smoky Frosted Glass Tenants Table -->
      <div class="smoky-card" style="padding: 0; overflow: hidden;">
        <div class="smoky-table-wrap">
          <table class="smoky-table">
            <thead>
              <tr>
                <th style="padding-left: 24px; min-width: 220px;">ผู้พักอาศัย (Tenant)</th>
                <th style="min-width: 170px;">ห้องพัก & อาคาร</th>
                <th style="min-width: 180px;">ช่องทางติดต่อ</th>
                <th style="min-width: 170px;">วันเข้าพัก & ระยะสัญญา</th>
                <th style="min-width: 120px; text-align: right;">ค่าเช่า/เดือน</th>
                <th style="min-width: 120px; text-align: center;">สถานะ</th>
                <th style="padding-right: 24px; text-align: right; min-width: 160px;">การจัดการ</th>
              </tr>
            </thead>
            <tbody id="tenants-table-body">
              <!-- Render rows dynamically -->
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;
}

// ฟังก์ชันเรนเดอร์ตารางผู้พักอาศัย
export function renderTenantsTable() {
  const tbody = document.getElementById('tenants-table-body');
  if (!tbody) return;

  let list = [...cachedTenants];

  // 1. กรองตามประเภทอาคาร หรือสถานะ
  if (tenantBuildingFilter === 'Tanakrit') {
    list = list.filter(t => t.building === 'Tanakrit');
  } else if (tenantBuildingFilter === 'KingPhetch') {
    list = list.filter(t => t.building === 'KingPhetch');
  } else if (tenantBuildingFilter === 'UnderGround') {
    list = list.filter(t => t.building === 'UnderGround');
  } else if (tenantBuildingFilter === 'active') {
    list = list.filter(t => t.status === 'active');
  }

  // 2. ค้นหา
  if (tenantSearchTerm) {
    const q = tenantSearchTerm.toLowerCase().trim();
    list = list.filter(t =>
      (t.name || '').toLowerCase().includes(q) ||
      (t.tenant_id || '').toLowerCase().includes(q) ||
      (t.room || '').toLowerCase().includes(q) ||
      (t.phone || '').toLowerCase().includes(q) ||
      (t.email || '').toLowerCase().includes(q) ||
      (t.line_id || '').toLowerCase().includes(q) ||
      (t.building_th || '').toLowerCase().includes(q)
    );
  }

  // 3. เรียงลำดับ
  list.sort((a, b) => {
    if (tenantSortBy === 'room_asc') {
      return (a.room || '').localeCompare(b.room || '', undefined, { numeric: true });
    } else if (tenantSortBy === 'name_asc') {
      return (a.name || '').localeCompare(b.name || '', 'th');
    } else if (tenantSortBy === 'checkin_desc') {
      return (b.check_in || '').localeCompare(a.check_in || '');
    } else if (tenantSortBy === 'rent_desc') {
      return (b.rent || 0) - (a.rent || 0);
    }
    return 0;
  });

  // อัปเดตตัวเลข KPI บนหัวการ์ด
  updateTenantsKPI(cachedTenants);

  if (list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 48px 24px; color: rgba(255,255,255,0.4);">
          <div style="font-size: 2rem; margin-bottom: 8px;">🔍</div>
          <div style="font-size: 0.95rem; font-weight: 500; color: rgba(255,255,255,0.7);">ไม่พบข้อมูลผู้พักอาศัยที่ตรงกับเงื่อนไข</div>
          <div style="font-size: 0.80rem; color: rgba(255,255,255,0.4); margin-top: 4px;">ลองเปลี่ยนคำค้นหา หรือคลิกปุ่ม "ทั้งหมด" ด้านบน</div>
        </td>
      </tr>
    `;
    return;
  }

  let html = '';
  list.forEach(tenant => {
    const bInfo = getBuildingInfo(tenant.room);
    const avatarUrl = tenant.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80`;

    html += `
      <tr style="transition: background 0.15s ease;">
        
        <!-- 1. ผู้พักอาศัย (Profile & Name) -->
        <td style="padding-left: 24px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="position: relative; width: 38px; height: 38px; border-radius: 50%; overflow: hidden; flex-shrink: 0; border: 1px solid rgba(255,255,255,0.18);">
              <img src="${avatarUrl}" alt="${tenant.name}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div>
              <div style="font-weight: 600; color: #ffffff; font-size: 0.88rem; display: flex; align-items: center; gap: 6px;">
                <span>${tenant.name}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px; margin-top: 3px;">
                <span style="font-size: 0.72rem; color: rgba(255,255,255,0.45); font-family: monospace; background: rgba(255,255,255,0.06); padding: 1px 6px; border-radius: 4px;">
                  รหัส ${tenant.tenant_id || '-'}
                </span>
              </div>
            </div>
          </div>
        </td>

        <!-- 2. ห้องพัก & อาคาร -->
        <td>
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="display: inline-block; font-size: 0.84rem; font-weight: 700; color: #ffffff; background: rgba(59, 130, 246, 0.2); border: 1px solid rgba(59, 130, 246, 0.35); padding: 2px 8px; border-radius: 6px;">
                ห้อง ${tenant.room}
              </span>
            </div>
            <span style="font-size: 0.74rem; color: ${bInfo.color}; font-weight: 500;">
              ${bInfo.badge}
            </span>
          </div>
        </td>

        <!-- 3. ช่องทางติดต่อ -->
        <td>
          <div style="display: flex; flex-direction: column; gap: 3px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="color: rgba(255,255,255,0.4);">${ic('phone')}</span>
              <a href="tel:${tenant.phone}" style="color: #60A5FA; font-size: 0.82rem; text-decoration: none; font-weight: 500;" title="โทรติดต่อ">
                ${tenant.phone || '-'}
              </a>
            </div>
            ${tenant.line_id && tenant.line_id !== '-' ? `
              <div style="font-size: 0.74rem; color: rgba(255,255,255,0.45); display: flex; align-items: center; gap: 4px;">
                <span style="color: #10B981;">LINE:</span>
                <span>${tenant.line_id}</span>
              </div>
            ` : ''}
          </div>
        </td>

        <!-- 4. วันเข้าพัก & สัญญา -->
        <td>
          <div style="display: flex; flex-direction: column; gap: 3px;">
            <span style="font-size: 0.82rem; color: #ffffff; font-weight: 500;">
              ${fmtDate(tenant.check_in)}
            </span>
            <span style="font-size: 0.72rem; color: rgba(255,255,255,0.45);">
              ${tenant.lease_term || 'สัญญา 1 ปี'}
            </span>
          </div>
        </td>

        <!-- 5. ค่าเช่าต่อเดือน -->
        <td style="text-align: right;">
          <div style="font-weight: 700; color: #ffffff; font-size: 0.90rem;">
            ${fmtCurrency(tenant.rent || bInfo.rent)}
          </div>
          <span style="font-size: 0.70rem; color: rgba(255,255,255,0.4);">
            มัดจำ ${fmtCurrency(tenant.deposit || 2000)}
          </span>
        </td>

        <!-- 6. สถานะ -->
        <td style="text-align: center;">
          ${tenant.status === 'active' ? `
            <span class="smoky-delta-pos" style="font-size: 0.72rem; padding: 3px 8px;">
              ● กำลังพักอาศัย
            </span>
          ` : `
            <span class="smoky-delta-neg" style="font-size: 0.72rem; padding: 3px 8px; background: rgba(245, 158, 11, 0.15); color: #FBBF24;">
              รอคืนห้อง
            </span>
          `}
        </td>

        <!-- 7. การจัดการ (Actions) -->
        <td style="padding-right: 24px; text-align: right;">
          <div style="display: inline-flex; align-items: center; gap: 6px;">
            
            <!-- ปุ่มดูข้อมูล -->
            <button class="smoky-round-glass-btn btn-view-tenant" data-tenant-id="${tenant.id}" style="width: 32px; height: 32px; border-radius: 8px;" title="ดูข้อมูลผู้พักและสัญญา">
              ${ic('search')}
            </button>

            <!-- ปุ่มแก้ไข -->
            <button class="smoky-round-glass-btn btn-edit-tenant" data-tenant-id="${tenant.id}" style="width: 32px; height: 32px; border-radius: 8px; color: #60A5FA;" title="แก้ไขข้อมูลผู้พัก">
              ${ic('edit')}
            </button>

            <!-- ปุ่มย้ายออก / ลบ -->
            <button class="smoky-round-glass-btn btn-del-tenant" data-tenant-id="${tenant.id}" style="width: 32px; height: 32px; border-radius: 8px; color: #F87171;" title="แจ้งย้ายออก / คืนห้อง">
              ${ic('trash')}
            </button>

          </div>
        </td>

      </tr>
    `;
  });

  tbody.innerHTML = html;

  // Bind Event Listeners สำหรับแถวในตาราง
  tbody.querySelectorAll('.btn-view-tenant').forEach(btn => {
    btn.onclick = () => {
      const tid = btn.getAttribute('data-tenant-id');
      viewTenantDetails(tid);
    };
  });

  tbody.querySelectorAll('.btn-edit-tenant').forEach(btn => {
    btn.onclick = () => {
      const tid = btn.getAttribute('data-tenant-id');
      const target = cachedTenants.find(x => x.id === tid);
      if (target) openEditTenantModal(target);
    };
  });

  tbody.querySelectorAll('.btn-del-tenant').forEach(btn => {
    btn.onclick = () => {
      const tid = btn.getAttribute('data-tenant-id');
      deleteTenant(tid);
    };
  });
}

// อัปเดตตัวเลขสรุป 4 KPI Tiles
function updateTenantsKPI(tenants) {
  const totalEl = document.getElementById('kpi-total-tenants');
  const occEl = document.getElementById('kpi-occupancy-rate');
  const vacEl = document.getElementById('kpi-vacant-rooms');

  if (!totalEl || !occEl) return;

  const totalTenants = tenants.length;
  totalEl.textContent = `${totalTenants} คน`;

  // อัตราการเข้าพักคิดจาก 17 ห้อง
  const occPercent = Math.round((totalTenants / 17) * 100);
  occEl.textContent = `${occPercent}%`;

  const vacantRoomsCount = Math.max(0, 17 - totalTenants - 1); // หัก 1 ห้องที่กำลังซ่อม (107)
  if (vacEl) vacEl.textContent = `${vacantRoomsCount} ห้อง`;
}

// ผูกการทำงาน Event Listeners สำหรับ Toolbar ด้านบน
function bindTenantsEvents() {
  // 1. Search Input
  const searchInput = document.getElementById('tenant-search-input');
  if (searchInput) {
    searchInput.oninput = (e) => {
      tenantSearchTerm = e.target.value;
      renderTenantsTable();
    };
  }

  // 2. Filter Buttons
  const filterBtns = document.querySelectorAll('#tenants-filter-tabs .smoky-seg-btn');
  filterBtns.forEach(btn => {
    btn.onclick = () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      tenantBuildingFilter = btn.getAttribute('data-filter');
      renderTenantsTable();
    };
  });

  // 3. Sort Select
  const sortSelect = document.getElementById('tenant-sort-select');
  if (sortSelect) {
    sortSelect.onchange = (e) => {
      tenantSortBy = e.target.value;
      renderTenantsTable();
    };
  }

  // 4. ปุ่มรีเฟรชข้อมูล
  const btnRefresh = document.getElementById('btn-refresh-tenants');
  if (btnRefresh) {
    btnRefresh.onclick = async () => {
      btnRefresh.innerHTML = `${ic('check')} <span>กำลังโหลด...</span>`;
      await fetchTenantsList();
      renderTenantsTable();
      toast('รีเฟรชข้อมูลผู้พักอาศัยล่าสุดเรียบร้อย', 'info');
      btnRefresh.innerHTML = `${ic('check')} <span>รีเฟรชข้อมูล</span>`;
    };
  }

  // 5. ปุ่มเปิด Modal เพิ่มผู้พักใหม่
  const btnAdd = document.getElementById('btn-open-add-tenant');
  if (btnAdd) {
    btnAdd.onclick = openAddTenantModal;
  }

  // 6. ปุ่ม Export CSV
  const btnExport = document.getElementById('btn-export-tenants');
  if (btnExport) {
    btnExport.onclick = exportTenantsCSV;
  }
}

// ==================== MODALS ====================

// 1. Modal ดูข้อมูลรายละเอียดผู้พักอาศัย (View Details)
export function viewTenantDetails(id) {
  const tenant = cachedTenants.find(x => x.id === id);
  if (!tenant) return;

  const bInfo = getBuildingInfo(tenant.room);
  const avatarUrl = tenant.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80`;

  const body = `
    <div style="display: flex; flex-direction: column; gap: 20px;">
      
      <!-- Profile Header Card -->
      <div class="smoky-modal-card-header" style="display: flex; align-items: center; gap: 16px; border-radius: 14px; padding: 16px;">
        <div style="width: 58px; height: 58px; border-radius: 50%; overflow: hidden; border: 2px solid rgba(59,130,246,0.5); flex-shrink: 0;">
          <img src="${avatarUrl}" alt="${tenant.name}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <h3 class="smoky-modal-card-title" style="font-size: 1.15rem; font-weight: 700; margin: 0;">${tenant.name}</h3>
            <span class="smoky-delta-pos" style="font-size: 0.70rem;">● กำลังพักอาศัย</span>
          </div>
          <div class="smoky-modal-sub" style="font-size: 0.80rem; margin-top: 4px; display: flex; gap: 12px; flex-wrap: wrap;">
            <span>รหัสผู้เช่า: <strong style="color: #2563EB;">${tenant.tenant_id}</strong></span>
            <span>บัตร ปชช.: <strong>${tenant.id_card || '-'}</strong></span>
          </div>
        </div>
      </div>

      <!-- Bento Grid Details (4 Blocks) -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        
        <!-- Block 1: ข้อมูลห้องพัก & สัญญา -->
        <div class="smoky-modal-block" style="border-radius: 12px; padding: 14px;">
          <div style="font-size: 0.76rem; font-weight: 700; text-transform: uppercase; color: #2563EB; margin-bottom: 8px;">
            🏢 ข้อมูลห้องพัก & ค่าเช่า
          </div>
          <div style="display: flex; flex-direction: column; gap: 7px; font-size: 0.84rem;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="smoky-modal-label">ห้องพัก:</span>
              <strong class="smoky-modal-val">ห้อง ${tenant.room}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="smoky-modal-label">อาคาร:</span>
              <span style="color: ${bInfo.color}; font-weight: 700;">${bInfo.nameTh}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="smoky-modal-label">ค่าเช่ารายเดือน:</span>
              <strong style="color: #059669;">${fmtCurrency(tenant.rent || bInfo.rent)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="smoky-modal-label">เงินประกันความเสียหาย:</span>
              <span class="smoky-modal-val">${fmtCurrency(tenant.deposit || 2000)}</span>
            </div>
          </div>
        </div>

        <!-- Block 2: ข้อมูลสัญญาและวันที่เข้าพัก -->
        <div class="smoky-modal-block" style="border-radius: 12px; padding: 14px;">
          <div style="font-size: 0.76rem; font-weight: 700; text-transform: uppercase; color: #059669; margin-bottom: 8px;">
            📅 ข้อมูลสัญญาเช่า
          </div>
          <div style="display: flex; flex-direction: column; gap: 7px; font-size: 0.84rem;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="smoky-modal-label">วันที่เริ่มเข้าพัก:</span>
              <strong class="smoky-modal-val">${fmtDate(tenant.check_in)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="smoky-modal-label">ระยะเวลาสัญญา:</span>
              <span class="smoky-modal-val">${tenant.lease_term || 'สัญญา 1 ปี'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="smoky-modal-label">สถานะสัญญา:</span>
              <span class="smoky-delta-pos" style="font-size: 0.72rem; padding: 2px 8px;">ปกติ</span>
            </div>
          </div>
        </div>

        <!-- Block 3: ข้อมูลติดต่อ & ช่องทาง -->
        <div class="smoky-modal-block" style="border-radius: 12px; padding: 14px;">
          <div style="font-size: 0.76rem; font-weight: 700; text-transform: uppercase; color: #D97706; margin-bottom: 8px;">
            📞 ช่องทางติดต่อ
          </div>
          <div style="display: flex; flex-direction: column; gap: 7px; font-size: 0.84rem;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="smoky-modal-label">เบอร์โทรศัพท์:</span>
              <a href="tel:${tenant.phone}" style="color: #2563EB; text-decoration: none; font-weight: 700;">${tenant.phone || '-'}</a>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="smoky-modal-label">LINE ID:</span>
              <span class="smoky-modal-val">${tenant.line_id || '-'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="smoky-modal-label">อีเมล:</span>
              <a href="mailto:${tenant.email}" class="smoky-modal-val" style="text-decoration: underline;">${tenant.email || '-'}</a>
            </div>
          </div>
        </div>

        <!-- Block 4: ข้อมูลฉุกเฉิน & บัญชีเข้าระบบ -->
        <div class="smoky-modal-block" style="border-radius: 12px; padding: 14px;">
          <div style="font-size: 0.76rem; font-weight: 700; text-transform: uppercase; color: #DB2777; margin-bottom: 8px;">
            🔐 ข้อมูลฉุกเฉิน & บัญชีล็อกอิน
          </div>
          <div style="display: flex; flex-direction: column; gap: 7px; font-size: 0.84rem;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="smoky-modal-label">ติดต่อฉุกเฉิน:</span>
              <span class="smoky-modal-val">${tenant.emergency_contact || '-'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="smoky-modal-label">Username เข้าเว็บ:</span>
              <strong style="color: #DB2777; font-family: monospace;">${tenant.tenant_id || tenant.phone || tenant.room}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="smoky-modal-label">รหัสผ่านเริ่มต้น:</span>
              <span class="smoky-modal-meta" style="font-family: monospace;">(เลขห้องพัก: ${tenant.room})</span>
            </div>
          </div>
        </div>

      </div>

      <!-- หมายเหตุเพิ่มเติม -->
      ${tenant.notes ? `
        <div class="smoky-modal-notes" style="border-radius: 10px; padding: 10px 14px; font-size: 0.80rem;">
          📝 <strong class="smoky-modal-val">หมายเหตุจากผู้จัดการ:</strong> <span>${tenant.notes}</span>
        </div>
      ` : ''}

    </div>
  `;

  const footer = `
    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
      <a href="tel:${tenant.phone}" class="smoky-round-glass-btn btn-modal-phone" style="width: auto; border-radius: 9999px; padding: 0 16px; height: 38px; gap: 6px; font-size: 0.80rem; text-decoration: none;">
        ${ic('phone')} โทรติดต่อผู้พัก
      </a>
      <div style="display: flex; gap: 8px;">
        <button type="button" class="smoky-round-glass-btn" style="width: auto; border-radius: 9999px; padding: 0 16px; height: 38px; font-size: 0.80rem;" onclick="window.closeAppModal()">
          ปิดหน้าต่าง
        </button>
        <button type="button" class="smoky-round-glass-btn btn-primary" style="width: auto; border-radius: 9999px; padding: 0 18px; height: 38px; background: #2563EB !important; color: #ffffff !important; font-size: 0.80rem; font-weight: 600; border: none; cursor: pointer;" id="btn-modal-edit-now">
          ✏️ แก้ไขข้อมูล
        </button>
      </div>
    </div>
  `;

  showModal({
    title: `ข้อมูลผู้พักอาศัย: ห้อง ${tenant.room} (${tenant.name})`,
    body,
    footer,
    maxWidth: '680px'
  });

  const btnEditNow = document.getElementById('btn-modal-edit-now');
  if (btnEditNow) {
    btnEditNow.onclick = () => {
      closeModal();
      openEditTenantModal(tenant);
    };
  }
}

// 2. Modal แก้ไขข้อมูลผู้พักอาศัย (Edit Tenant Modal)
export function openEditTenantModal(tenant) {
  const body = `
    <form id="form-edit-tenant-modal" style="display: flex; flex-direction: column; gap: 14px;">
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div>
          <label class="smoky-form-label" style="display: block; font-size: 0.82rem; margin-bottom: 5px;">ชื่อ - นามสกุล *</label>
          <input type="text" id="ed-tenant-name" class="smoky-glass-input" value="${tenant.name}" required style="width: 100%;">
        </div>
        <div>
          <label class="smoky-form-label" style="display: block; font-size: 0.82rem; margin-bottom: 5px;">รหัสนักศึกษา / รหัสผู้เช่า *</label>
          <input type="text" id="ed-tenant-tid" class="smoky-glass-input" value="${tenant.tenant_id || ''}" required style="width: 100%;">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div>
          <label class="smoky-form-label" style="display: block; font-size: 0.82rem; margin-bottom: 5px;">ห้องพัก (ทั้ง 17 ห้อง) *</label>
          <select id="ed-tenant-room" class="smoky-glass-input" style="width: 100%; height: 38px;">
            <optgroup label="🏢 อาคาร ธนกฤษฎ์ (1,500 ฿/เดือน)" style="background: #141a29; color: white;">
              ${['101', '102', '103', '104', '105', '106', '107', '108', '109'].map(r => `
                <option value="${r}" ${tenant.room === r ? 'selected' : ''}>ห้อง ${r} (อาคาร ธนกฤษฎ์)</option>
              `).join('')}
            </optgroup>
            <optgroup label="🏡 อาคาร กิ่งเพชร (1,500 ฿/เดือน)" style="background: #141a29; color: white;">
              ${['201', '202', '203', '204', '205'].map(r => `
                <option value="${r}" ${tenant.room === r ? 'selected' : ''}>ห้อง ${r} (อาคาร กิ่งเพชร)</option>
              `).join('')}
            </optgroup>
            <optgroup label="🚗 อาคาร ใต้บ้าน (800 ฿/เดือน)" style="background: #141a29; color: white;">
              ${['B01', 'B02', 'B03'].map(r => `
                <option value="${r}" ${tenant.room === r ? 'selected' : ''}>ห้อง ${r} (อาคาร ใต้บ้าน)</option>
              `).join('')}
            </optgroup>
          </select>
        </div>
        <div>
          <label class="smoky-form-label" style="display: block; font-size: 0.82rem; margin-bottom: 5px;">เบอร์โทรศัพท์ติดต่อ *</label>
          <input type="tel" id="ed-tenant-phone" class="smoky-glass-input" value="${tenant.phone || ''}" required style="width: 100%;">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div>
          <label class="smoky-form-label" style="display: block; font-size: 0.82rem; margin-bottom: 5px;">อีเมล</label>
          <input type="email" id="ed-tenant-email" class="smoky-glass-input" value="${tenant.email || ''}" style="width: 100%;">
        </div>
        <div>
          <label class="smoky-form-label" style="display: block; font-size: 0.82rem; margin-bottom: 5px;">LINE ID</label>
          <input type="text" id="ed-tenant-line" class="smoky-glass-input" value="${tenant.line_id || ''}" style="width: 100%;">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div>
          <label class="smoky-form-label" style="display: block; font-size: 0.82rem; margin-bottom: 5px;">วันที่เริ่มเข้าพัก</label>
          <input type="date" id="ed-tenant-checkin" class="smoky-glass-input" value="${tenant.check_in || ''}" style="width: 100%;">
        </div>
        <div>
          <label class="smoky-form-label" style="display: block; font-size: 0.82rem; margin-bottom: 5px;">ระยะเวลาสัญญา</label>
          <select id="ed-tenant-lease" class="smoky-glass-input" style="width: 100%; height: 38px;">
            <option value="สัญญา 1 ปี (มิ.ย. 68 - พ.ค. 69)" style="background:#141a29; color:white;">สัญญา 1 ปี (มิ.ย. 68 - พ.ค. 69)</option>
            <option value="สัญญา 6 เดือน (ก.ค. 68 - ธ.ค. 68)" style="background:#141a29; color:white;">สัญญา 6 เดือน (ก.ค. 68 - ธ.ค. 68)</option>
            <option value="สัญญารายเดือน" style="background:#141a29; color:white;">สัญญารายเดือน</option>
          </select>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div>
          <label class="smoky-form-label" style="display: block; font-size: 0.82rem; margin-bottom: 5px;">เงินประกัน (บาท)</label>
          <input type="number" id="ed-tenant-deposit" class="smoky-glass-input" value="${tenant.deposit || 2000}" style="width: 100%;">
        </div>
        <div>
          <label class="smoky-form-label" style="display: block; font-size: 0.82rem; margin-bottom: 5px;">เบอร์ติดต่อฉุกเฉิน</label>
          <input type="text" id="ed-tenant-emergency" class="smoky-glass-input" value="${tenant.emergency_contact || ''}" placeholder="ผู้ปกครอง 08x-xxx-xxxx" style="width: 100%;">
        </div>
      </div>

      <div>
        <label class="smoky-form-label" style="display: block; font-size: 0.82rem; margin-bottom: 5px;">หมายเหตุเพิ่มเติม</label>
        <textarea id="ed-tenant-notes" class="smoky-glass-input" rows="2" style="width: 100%; resize: none;">${tenant.notes || ''}</textarea>
      </div>

    </form>
  `;

  const footer = `
    <div style="display: flex; justify-content: flex-end; gap: 10px; width: 100%;">
      <button type="button" class="smoky-round-glass-btn" style="width: auto; border-radius: 9999px; padding: 0 16px; height: 38px; font-size: 0.80rem;" onclick="window.closeAppModal()">
        ยกเลิก
      </button>
      <button type="button" class="smoky-round-glass-btn btn-primary" style="width: auto; border-radius: 9999px; padding: 0 20px; height: 38px; background: #2563EB !important; color: #ffffff !important; font-size: 0.82rem; font-weight: 600; border: none; cursor: pointer;" id="btn-submit-edit-tenant">
        บันทึกการแก้ไข
      </button>
    </div>
  `;

  showModal({
    title: `แก้ไขข้อมูลผู้พัก: ${tenant.name}`,
    body,
    footer,
    maxWidth: '580px'
  });

  document.getElementById('btn-submit-edit-tenant').onclick = async () => {
    const name = document.getElementById('ed-tenant-name').value.trim();
    const tid = document.getElementById('ed-tenant-tid').value.trim();
    const room = document.getElementById('ed-tenant-room').value;
    const phone = document.getElementById('ed-tenant-phone').value.trim();
    const email = document.getElementById('ed-tenant-email').value.trim();
    const line = document.getElementById('ed-tenant-line').value.trim();
    const checkin = document.getElementById('ed-tenant-checkin').value;
    const lease = document.getElementById('ed-tenant-lease').value;
    const deposit = parseInt(document.getElementById('ed-tenant-deposit').value, 10) || 2000;
    const emergency = document.getElementById('ed-tenant-emergency').value.trim();
    const notes = document.getElementById('ed-tenant-notes').value.trim();

    if (!name || !phone || !room) {
      toast('กรุณากรอกชื่อ, เบอร์โทรศัพท์ และห้องพักให้ครบถ้วน', 'error');
      return;
    }

    const bInfo = getBuildingInfo(room);

    // อัปเดตใน Cached Array
    const idx = cachedTenants.findIndex(x => x.id === tenant.id);
    if (idx !== -1) {
      cachedTenants[idx] = {
        ...cachedTenants[idx],
        name,
        tenant_id: tid,
        room,
        building: bInfo.name,
        building_th: bInfo.nameTh,
        rent: bInfo.rent,
        phone,
        email,
        line_id: line,
        check_in: checkin,
        lease_term: lease,
        deposit,
        emergency_contact: emergency,
        notes
      };
      localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify(cachedTenants));
    }

    // ซิงค์ไปยัง Supabase
    try {
      await supabase.from('tenants').eq('id', tenant.id).update({
        name,
        tenant_id: tid,
        room,
        phone,
        email,
        check_in: checkin
      });
      // ซิงค์ users
      await supabase.from('users').eq('room', room).update({
        name,
        phone,
        email
      });
    } catch (err) {
      console.warn('Sync edit tenant error:', err);
    }

    closeModal();
    renderTenantsTable();
    toast(`บันทึกการแก้ไขข้อมูลของ "${name}" สำเร็จ`, 'success');
  };
}

// 3. Modal ลงทะเบียนผู้พักอาศัยใหม่ (Add Tenant Modal)
export function openAddTenantModal() {
  const body = `
    <form id="form-add-tenant-modal" style="display: flex; flex-direction: column; gap: 14px;">
      
      <div style="background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.25); border-radius: 10px; padding: 12px; font-size: 0.82rem; color: #93C5FD; line-height: 1.5;">
        ✨ กรอกข้อมูลเพื่อลงทะเบียนผู้เช่าใหม่ ระบบจะสร้างบัญชีผู้ใช้งาน (Username: รหัสนักศึกษา, Password: เลขห้องพัก) และปรับสถานะห้องพักเป็น "มีผู้เช่าแล้ว" ให้โดยอัตโนมัติ
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div>
          <label class="smoky-form-label" style="display: block; font-size: 0.82rem; margin-bottom: 5px;">ชื่อ - นามสกุล *</label>
          <input type="text" id="add-tenant-name" class="smoky-glass-input" placeholder="เช่น นายวรเมธ แก้วมณี" required style="width: 100%;">
        </div>
        <div>
          <label class="smoky-form-label" style="display: block; font-size: 0.82rem; margin-bottom: 5px;">รหัสนักศึกษา / รหัสผู้เช่า</label>
          <input type="text" id="add-tenant-tid" class="smoky-glass-input" placeholder="เช่น 6512399" style="width: 100%;">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div>
          <label class="smoky-form-label" style="display: block; font-size: 0.82rem; margin-bottom: 5px;">เลือกห้องพัก (ทั้ง 17 ห้อง) *</label>
          <select id="add-tenant-room" class="smoky-glass-input" style="width: 100%; height: 38px;">
            <optgroup label="🏢 อาคาร ธนกฤษฎ์ (1,500 ฿/เดือน)" style="background: #141a29; color: white;">
              <option value="107">ห้อง 107 (กำลังตรวจเช็ก)</option>
              <option value="108" selected>ห้อง 108 (ห้องว่างพร้อมอยู่)</option>
              <option value="109">ห้อง 109 (ห้องว่างพร้อมอยู่)</option>
              <option value="101">ห้อง 101</option>
              <option value="102">ห้อง 102</option>
              <option value="103">ห้อง 103</option>
              <option value="104">ห้อง 104</option>
              <option value="105">ห้อง 105</option>
              <option value="106">ห้อง 106</option>
            </optgroup>
            <optgroup label="🏡 อาคาร กิ่งเพชร (1,500 ฿/เดือน)" style="background: #141a29; color: white;">
              <option value="204">ห้อง 204 (ห้องว่างพร้อมอยู่)</option>
              <option value="205">ห้อง 205 (ห้องว่างพร้อมอยู่)</option>
              <option value="201">ห้อง 201</option>
              <option value="202">ห้อง 202</option>
              <option value="203">ห้อง 203</option>
            </optgroup>
            <optgroup label="🚗 อาคาร ใต้บ้าน (800 ฿/เดือน)" style="background: #141a29; color: white;">
              <option value="B03">ห้อง B03 (ห้องว่างพร้อมอยู่)</option>
              <option value="B01">ห้อง B01</option>
              <option value="B02">ห้อง B02</option>
            </optgroup>
          </select>
        </div>
        <div>
          <label class="smoky-form-label" style="display: block; font-size: 0.82rem; margin-bottom: 5px;">เบอร์โทรศัพท์ติดต่อ *</label>
          <input type="tel" id="add-tenant-phone" class="smoky-glass-input" placeholder="08x-xxx-xxxx" required style="width: 100%;">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div>
          <label class="smoky-form-label" style="display: block; font-size: 0.82rem; margin-bottom: 5px;">อีเมล</label>
          <input type="email" id="add-tenant-email" class="smoky-glass-input" placeholder="student@tanakrit.com" style="width: 100%;">
        </div>
        <div>
          <label class="smoky-form-label" style="display: block; font-size: 0.82rem; margin-bottom: 5px;">LINE ID</label>
          <input type="text" id="add-tenant-line" class="smoky-glass-input" placeholder="เช่น line_id" style="width: 100%;">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div>
          <label class="smoky-form-label" style="display: block; font-size: 0.82rem; margin-bottom: 5px;">วันที่เริ่มเข้าพัก</label>
          <input type="date" id="add-tenant-checkin" class="smoky-glass-input" value="${new Date().toISOString().split('T')[0]}" style="width: 100%;">
        </div>
        <div>
          <label class="smoky-form-label" style="display: block; font-size: 0.82rem; margin-bottom: 5px;">ระยะเวลาสัญญา</label>
          <select id="add-tenant-lease" class="smoky-glass-input" style="width: 100%; height: 38px;">
            <option value="สัญญา 1 ปี (มิ.ย. 68 - พ.ค. 69)" style="background:#141a29; color:white;">สัญญา 1 ปี (มิ.ย. 68 - พ.ค. 69)</option>
            <option value="สัญญา 6 เดือน (ก.ค. 68 - ธ.ค. 68)" style="background:#141a29; color:white;">สัญญา 6 เดือน (ก.ค. 68 - ธ.ค. 68)</option>
            <option value="สัญญารายเดือน" style="background:#141a29; color:white;">สัญญารายเดือน</option>
          </select>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div>
          <label class="smoky-form-label" style="display: block; font-size: 0.82rem; margin-bottom: 5px;">เงินประกันความเสียหาย (บาท)</label>
          <input type="number" id="add-tenant-deposit" class="smoky-glass-input" value="2000" style="width: 100%;">
        </div>
        <div>
          <label class="smoky-form-label" style="display: block; font-size: 0.82rem; margin-bottom: 5px;">ผู้ติดต่อฉุกเฉิน</label>
          <input type="text" id="add-tenant-emergency" class="smoky-glass-input" placeholder="ผู้ปกครอง 08x-xxx-xxxx" style="width: 100%;">
        </div>
      </div>

    </form>
  `;

  const footer = `
    <div style="display: flex; justify-content: flex-end; gap: 10px; width: 100%;">
      <button type="button" class="smoky-round-glass-btn" style="width: auto; border-radius: 9999px; padding: 0 16px; height: 38px; font-size: 0.80rem;" onclick="window.closeAppModal()">
        ยกเลิก
      </button>
      <button type="button" class="smoky-round-glass-btn btn-primary" style="width: auto; border-radius: 9999px; padding: 0 20px; height: 38px; background: #2563EB !important; color: #ffffff !important; font-size: 0.82rem; font-weight: 600; border: none; cursor: pointer;" id="btn-submit-add-tenant">
        + ยืนยันการลงทะเบียน
      </button>
    </div>
  `;

  showModal({
    title: 'ลงทะเบียนผู้พักอาศัยใหม่',
    body,
    footer,
    maxWidth: '580px'
  });

  document.getElementById('btn-submit-add-tenant').onclick = async () => {
    const name = document.getElementById('add-tenant-name').value.trim();
    const tid = document.getElementById('add-tenant-tid').value.trim() || '6512' + Math.floor(100 + Math.random() * 900);
    const room = document.getElementById('add-tenant-room').value;
    const phone = document.getElementById('add-tenant-phone').value.trim();
    const email = document.getElementById('add-tenant-email').value.trim() || `${tid}@student.tanakrit.com`;
    const line = document.getElementById('add-tenant-line').value.trim();
    const checkin = document.getElementById('add-tenant-checkin').value;
    const lease = document.getElementById('add-tenant-lease').value;
    const deposit = parseInt(document.getElementById('add-tenant-deposit').value, 10) || 2000;
    const emergency = document.getElementById('add-tenant-emergency').value.trim();

    if (!name || !phone || !room) {
      toast('กรุณากรอกชื่อ, เบอร์โทรศัพท์ และห้องพักให้ครบถ้วน', 'error');
      return;
    }

    const bInfo = getBuildingInfo(room);
    const newId = 'T-' + Math.floor(1000 + Math.random() * 9000);

    const newTenant = {
      id: newId,
      tenant_id: tid,
      name,
      room,
      building: bInfo.name,
      building_th: bInfo.nameTh,
      rent: bInfo.rent,
      phone,
      email,
      line_id: line,
      id_card: '1-8099-00123-49-9',
      check_in: checkin,
      lease_term: lease,
      deposit,
      emergency_contact: emergency,
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80',
      notes: 'ลงทะเบียนเข้าพักใหม่'
    };

    // เพิ่มลง cache
    cachedTenants.unshift(newTenant);
    localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify(cachedTenants));

    // บันทึกลง Supabase
    try {
      await supabase.from('tenants').insert([{
        id: newId,
        tenant_id: tid,
        name,
        room,
        phone,
        email,
        check_in: checkin,
        role: 'student'
      }]);

      await supabase.from('rooms').eq('room_number', room).update({
        status: 'occupied',
        tenant_name: name,
        tenant_phone: phone
      });
    } catch (err) {
      console.warn('Sync add tenant error:', err);
    }

    closeModal();
    renderTenantsTable();
    toast(`ลงทะเบียน "${name}" เข้าห้อง ${room} สำเร็จ (Username: ${tid}, Password: ${room})`, 'success');
  };
}

// 4. ลบ / แจ้งย้ายออกผู้พักอาศัย (Delete Tenant)
export async function deleteTenant(id) {
  const tenant = cachedTenants.find(x => x.id === id);
  if (!tenant) return;

  if (!confirm(`ยืนยันการแจ้งย้ายออก / คืนห้องพักสำหรับ "${tenant.name}" ห้อง ${tenant.room}?`)) {
    return;
  }

  // ลบออกจาก cache
  cachedTenants = cachedTenants.filter(x => x.id !== id);
  localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify(cachedTenants));

  // ซิงค์การลบกับ Supabase
  try {
    await supabase.from('tenants').eq('id', id).delete();
    await supabase.from('rooms').eq('room_number', tenant.room).update({
      status: 'vacant',
      tenant_name: '',
      tenant_phone: ''
    });
    localStorage.removeItem('tanakrit_rooms_cache_v3');
  } catch (err) {
    console.warn('Sync delete tenant error:', err);
  }

  renderTenantsTable();
  toast(`บันทึกการย้ายออกของ "${tenant.name}" ห้อง ${tenant.room} เรียบร้อยแล้ว`, 'info');
}

// 5. ส่งออกข้อมูลผู้พักอาศัยเป็นไฟล์ CSV (Export CSV)
export function exportTenantsCSV() {
  if (!cachedTenants || cachedTenants.length === 0) {
    toast('ไม่มีข้อมูลผู้พักอาศัยที่จะส่งออก', 'error');
    return;
  }

  // Header ภาษาไทย
  const headers = [
    'รหัสผู้เช่า',
    'ชื่อ-นามสกุล',
    'ห้องพัก',
    'อาคาร',
    'เบอร์โทรศัพท์',
    'อีเมล',
    'LINE ID',
    'เลขบัตรประชาชน',
    'วันที่เริ่มเข้าพัก',
    'ระยะเวลาสัญญา',
    'ค่าเช่ารายเดือน (บาท)',
    'เงินประกัน (บาท)',
    'สถานะ'
  ];

  const rows = cachedTenants.map(t => [
    `"${t.tenant_id || ''}"`,
    `"${t.name || ''}"`,
    `"${t.room || ''}"`,
    `"${t.building_th || ''}"`,
    `"${t.phone || ''}"`,
    `"${t.email || ''}"`,
    `"${t.line_id || ''}"`,
    `"${t.id_card || ''}"`,
    `"${t.check_in || ''}"`,
    `"${t.lease_term || ''}"`,
    `"${t.rent || 0}"`,
    `"${t.deposit || 0}"`,
    `"${t.status === 'active' ? 'กำลังพักอาศัย' : 'ย้ายออกแล้ว'}"`
  ]);

  // UTF-8 BOM (\uFEFF) เพื่อให้เปิดใน Excel ภาษาไทยไม่เป็นตัวยึกยือ
  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `tanakrit_tenants_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  toast('ส่งออกไฟล์ข้อมูลผู้พักอาศัย CSV เรียบร้อยแล้ว', 'success');
}

// Expose globally to window
window.renderTenantsView = renderTenantsView;
window.viewTenantDetails = viewTenantDetails;
window.openEditTenantModal = openEditTenantModal;
window.openAddTenantModal = openAddTenantModal;
window.deleteTenant = deleteTenant;
window.exportTenantsCSV = exportTenantsCSV;
