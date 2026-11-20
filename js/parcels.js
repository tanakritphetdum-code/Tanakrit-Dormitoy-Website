// js/parcels.js
// ระบบพัสดุและไปรษณียภัณฑ์ (Parcel Management)
// ออกแบบด้วย Smoky Frosted Glass Design System
import { supabase } from './supabase.js';
import { ic, fmtDate, showModal, closeModal, toast } from './api.js';
import { currentUser } from './auth.js';

let parcelFilter = 'all';
let parcelSearch = '';
let cachedParcels = [];

export const DEFAULT_PARCELS = [
  {
    id: 'PKG-101',
    tracking_number: 'TH0129384756',
    courier: 'Flash Express',
    recipient_name: 'นายสมชาย ธนกฤษฎ์',
    room_number: '101',
    description: 'กล่องพัสดุขนาดกลาง (อุปกรณ์วาดรูป)',
    status: 'waiting',
    arrived_at: '2026-10-22',
    collected_at: null
  },
  {
    id: 'PKG-102',
    tracking_number: 'KERRY9948271',
    courier: 'Kerry Express',
    recipient_name: 'ณัฐพล ใจดี',
    room_number: '201',
    description: 'ซองเอกสารสำคัญ',
    status: 'waiting',
    arrived_at: '2026-10-21',
    collected_at: null
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
];

export function getBuildingName(roomNum) {
  const r = String(roomNum || '').trim();
  if (r.startsWith('1')) return 'อาคาร ธนกฤษฎ์';
  if (r.startsWith('2')) return 'อาคาร กิ่งเพชร';
  if (r.startsWith('B') || r.startsWith('b')) return 'อาคาร ใต้บ้าน';
  return 'หอพักธนกฤษฎ์';
}

export async function renderParcelsView() {
  setTimeout(() => {
    bindParcelsEvents();
    loadParcelsData();
  }, 0);

  const isStudent = currentUser && currentUser.role === 'student';

  return `
    <div style="display: flex; flex-direction: column; gap: 22px;">
      
      <!-- 1. Header Card (Smoky Glass) -->
      <div class="smoky-card" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(59,130,246,0.18); border: 1px solid rgba(59,130,246,0.32); display: flex; align-items: center; justify-content: center; color: #3B82F6;">
            ${ic('box')}
          </div>
          <div>
            <h2 style="font-size: 1.35rem; font-weight: 700; color: #ffffff; margin: 0; letter-spacing: -0.02em;">
              ระบบพัสดุและไปรษณียภัณฑ์ (Parcel Management)
            </h2>
            <span style="font-size: 0.82rem; color: rgba(255,255,255,0.48); margin-top: 3px; display: block;">
              ${isStudent ? 'ตรวจสอบรายการพัสดุที่มาถึงหอพัก และยืนยันการรับพัสดุ' : 'บันทึกพัสดุที่จัดส่งถึงหอพัก แจ้งเตือนผู้พัก และบันทึกประวัติการรับ 3 อาคาร (17 ห้อง)'}
            </span>
          </div>
        </div>

        ${!isStudent ? `
          <div style="display: flex; align-items: center; gap: 10px;">
            <button class="smoky-round-glass-btn" id="btn-add-parcel" style="width: auto; border-radius: 9999px; padding: 0 18px; height: 38px; background: #3B82F6; color: #ffffff; border: 1px solid rgba(59,130,246,0.5); box-shadow: 0 0 20px rgba(59,130,246,0.4); font-size: 0.82rem; font-weight: 600; gap: 6px;">
              ${ic('plus')}
              <span>บันทึกพัสดุเข้าใหม่</span>
            </button>
          </div>
        ` : ''}
      </div>

      <!-- 2. KPI Summary Stat Tiles (Smoky Glass) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 16px;" id="parcel-summary-stats">
        <div class="smoky-tile">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="smoky-meta-label">พัสดุทั้งหมดในระบบ</span>
            <div style="color: rgba(255,255,255,0.4);">${ic('box')}</div>
          </div>
          <div class="smoky-kpi-num" style="margin-top: 8px;" id="kpi-parcel-total">...</div>
          <div class="smoky-kpi-sub">รายการพัสดุสะสม</div>
        </div>

        <div class="smoky-tile">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="smoky-meta-label">รอผู้พักมารับ</span>
            <span class="smoky-delta-neg" style="background: rgba(245, 158, 11, 0.15); color: #FBBF24;">รอส่งมอบ</span>
          </div>
          <div class="smoky-kpi-num" style="margin-top: 8px; color: #FBBF24;" id="kpi-parcel-waiting">...</div>
          <div class="smoky-kpi-sub">รอรับที่สำนักงานหอพัก</div>
        </div>

        <div class="smoky-tile">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="smoky-meta-label">รับมอบเรียบร้อยแล้ว</span>
            <span class="smoky-delta-pos">ส่งมอบสำเร็จ</span>
          </div>
          <div class="smoky-kpi-num" style="margin-top: 8px; color: #34D399;" id="kpi-parcel-collected">...</div>
          <div class="smoky-kpi-sub">ผู้พักเซ็นรับแล้ว</div>
        </div>

        <div class="smoky-tile">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="smoky-meta-label">บริษัทขนส่งหลัก</span>
            <span class="smoky-delta-pos" style="background: rgba(59, 130, 246, 0.15); color: #60A5FA;">ครอบคลุมทุกค่าย</span>
          </div>
          <div class="smoky-kpi-num" style="margin-top: 8px; color: #60A5FA;" id="kpi-parcel-couriers">...</div>
          <div class="smoky-kpi-sub">Flash · Kerry · ไปรษณีย์ไทย ฯลฯ</div>
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
            <input type="text" id="parcels-search-input" class="smoky-glass-input" placeholder="ค้นหาเลขพัสดุ, ชื่อผู้รับ หรือหมายเลขห้อง..." style="width: 100%; padding-left: 38px;">
          </div>

          <!-- Status Filter Tabs (Segmented Control) -->
          <div class="smoky-segmented" id="parcel-filter-tabs" style="overflow-x: auto; max-width: 100%;">
            <button class="smoky-seg-btn active" data-status="all">ทั้งหมด</button>
            <button class="smoky-seg-btn" data-status="waiting">รอผู้พักมารับ</button>
            <button class="smoky-seg-btn" data-status="collected">รับแล้วเรียบร้อย</button>
          </div>

          <!-- Refresh Action -->
          <div>
            <button class="smoky-round-glass-btn" id="btn-refresh-parcels" style="width: auto; height: 36px; padding: 0 16px; border-radius: 9999px; font-size: 0.80rem; gap: 6px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);">
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
              <th style="min-width: 170px;">หมายเลขพัสดุ / ขนส่ง</th>
              <th style="min-width: 180px;">ห้องพัก / ผู้รับ</th>
              <th style="min-width: 180px;">ลักษณะพัสดุ</th>
              <th style="min-width: 150px;">วันที่มาถึง / รับมอบ</th>
              <th style="min-width: 155px; width: 160px;">สถานะ</th>
              <th style="text-align: right; padding-right: 22px; width: 175px;">การดำเนินการ</th>
            </tr>
          </thead>
          <tbody id="parcels-tbody">
            <tr><td colspan="6" style="text-align:center; padding: 40px; color: rgba(255,255,255,0.4);">กำลังโหลดข้อมูลพัสดุ...</td></tr>
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

  let allParcels = parcels;
  if (error || !allParcels) {
    allParcels = DEFAULT_PARCELS;
  }
  cachedParcels = allParcels;

  // Update KPI counters
  const totalCount = allParcels.length;
  const waitingCount = allParcels.filter(p => p.status === 'waiting').length;
  const collectedCount = allParcels.filter(p => p.status === 'collected').length;
  const couriersSet = new Set(allParcels.map(p => p.courier).filter(Boolean));

  const kpiTotal = document.getElementById('kpi-parcel-total');
  const kpiWaiting = document.getElementById('kpi-parcel-waiting');
  const kpiCollected = document.getElementById('kpi-parcel-collected');
  const kpiCouriers = document.getElementById('kpi-parcel-couriers');

  if (kpiTotal) kpiTotal.textContent = `${totalCount} รายการ`;
  if (kpiWaiting) kpiWaiting.textContent = `${waitingCount} ชิ้น`;
  if (kpiCollected) kpiCollected.textContent = `${collectedCount} ชิ้น`;
  if (kpiCouriers) kpiCouriers.textContent = `${couriersSet.size} ค่าย`;

  let list = [...allParcels];
  const isStudent = currentUser && currentUser.role === 'student';
  if (isStudent && currentUser.room) {
    list = list.filter(p => String(p.room_number) === String(currentUser.room));
  }

  if (parcelFilter !== 'all') {
    list = list.filter(p => p.status === parcelFilter);
  }

  if (parcelSearch.trim()) {
    const q = parcelSearch.toLowerCase().trim();
    list = list.filter(p => 
      String(p.tracking_number || '').toLowerCase().includes(q) ||
      String(p.recipient_name || '').toLowerCase().includes(q) ||
      String(p.room_number || '').toLowerCase().includes(q) ||
      getBuildingName(p.room_number).toLowerCase().includes(q) ||
      String(p.courier || '').toLowerCase().includes(q) ||
      String(p.description || '').toLowerCase().includes(q)
    );
  }

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 40px; color: rgba(255,255,255,0.4);">ไม่พบรายการพัสดุตามเงื่อนไขที่เลือก</td></tr>`;
    return;
  }

  let html = '';
  list.forEach(p => {
    const isCollected = p.status === 'collected';
    const bldg = getBuildingName(p.room_number);

    let statusPill = '';
    if (isCollected) {
      statusPill = `<span class="smoky-status-pill pill-green">✓ รับแล้ว</span>`;
    } else {
      statusPill = `<span class="smoky-status-pill pill-amber">⏳ รอรับที่สำนักงาน</span>`;
    }

    html += `
      <tr>
        <td>
          <div style="font-weight: 700; color: #ffffff; letter-spacing: -0.01em; font-family: monospace; font-size: 0.90rem;">
            ${p.tracking_number}
          </div>
          <div style="margin-top: 4px;">
            <span class="smoky-cat-pill">
              ${p.courier}
            </span>
          </div>
        </td>
        <td>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="font-weight: 700; color: #ffffff; font-size: 0.95rem;">ห้อง ${p.room_number}</div>
            <span class="smoky-bldg-badge">
              ${bldg}
            </span>
          </div>
          <div style="font-size: 0.78rem; color: rgba(255,255,255,0.48); margin-top: 3px;">
            ${p.recipient_name}
          </div>
        </td>
        <td>
          <div style="font-size: 0.84rem; color: rgba(255,255,255,0.85);">
            ${p.description || 'กล่องพัสดุมาตรฐาน'}
          </div>
        </td>
        <td>
          <div style="font-size: 0.82rem; color: rgba(255,255,255,0.75);">
            มาถึง: ${fmtDate(p.arrived_at)}
          </div>
          ${isCollected && p.collected_at ? `
            <div style="font-size: 0.72rem; color: #34D399; margin-top: 2px;">
              รับเมื่อ: ${fmtDate(p.collected_at)}
            </div>
          ` : ''}
        </td>
        <td>${statusPill}</td>
        <td style="text-align: right; padding-right: 18px;">
          <div style="display: flex; gap: 8px; justify-content: flex-end; align-items: center;">
            ${!isCollected ? `
              <button class="smoky-round-glass-btn btn-collect-parcel" data-id="${p.id}" style="width: auto; height: 32px; padding: 0 14px; border-radius: 9999px; font-size: 0.78rem; gap: 6px; background: rgba(59,130,246,0.18); border: 1px solid rgba(59,130,246,0.38); color: #60A5FA; font-weight: 600;" title="บันทึกว่ารับแล้ว">
                ${ic('check')}
                <span>ยืนยันรับพัสดุ</span>
              </button>
            ` : `
              <span style="font-size: 0.78rem; color: #34D399; display: inline-flex; align-items: center; gap: 4px;">
                ${ic('check')}
                <span>รับมอบเรียบร้อย</span>
              </span>
            `}
            <button class="smoky-round-glass-btn btn-del-parcel" data-id="${p.id}" style="width: 32px; height: 32px; padding: 0; border-radius: 9999px; color: #FB7185; border-color: rgba(244, 63, 94, 0.3); background: rgba(244, 63, 94, 0.1);" title="ลบรายการพัสดุ">
              ${ic('trash')}
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;

  tbody.querySelectorAll('.btn-collect-parcel').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id');
      const target = cachedParcels.find(x => x.id === id);
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

  // Delete Parcel
  tbody.querySelectorAll('.btn-del-parcel').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id');
      const target = cachedParcels.find(x => x.id === id);
      if (!target) return;
      if (confirm(`คุณต้องการลบรายการพัสดุ ${target.tracking_number} (ห้อง ${target.room_number}) ออกจากระบบใช่หรือไม่?`)) {
        const { error } = await supabase.from('parcels').eq('id', id).delete();
        if (error) {
          toast('เกิดข้อผิดพลาดในการลบพัสดุ', 'error');
          return;
        }
        cachedParcels = cachedParcels.filter(x => x.id !== id);
        toast(`ลบรายการพัสดุ ${target.tracking_number} เรียบร้อยแล้ว`, 'success');
        loadParcelsData();
      }
    };
  });
}

function bindParcelsEvents() {
  const tabs = document.getElementById('parcel-filter-tabs');
  if (tabs) {
    tabs.querySelectorAll('.smoky-seg-btn').forEach(btn => {
      btn.onclick = () => {
        tabs.querySelectorAll('.smoky-seg-btn').forEach(b => b.classList.remove('active'));
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

  const btnRefresh = document.getElementById('btn-refresh-parcels');
  if (btnRefresh) {
    btnRefresh.onclick = () => {
      toast('กำลังซิงค์รายการพัสดุจากระบบ...', 'info');
      loadParcelsData();
    };
  }

  const btnAdd = document.getElementById('btn-add-parcel');
  if (btnAdd) btnAdd.onclick = openAddParcelModal;
}

function openAddParcelModal() {
  const defaultRoom = currentUser && currentUser.room ? currentUser.room : '101';
  const defaultName = currentUser ? currentUser.name : '';

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
    <optgroup label="สำนักงาน / ส่วนกลาง">
      <option value="สำนักงาน">สำนักงานหอพัก / ผู้ดูแล</option>
    </optgroup>
  `;

  const body = `
    <form id="form-add-parcel" style="display: flex; flex-direction: column; gap: 14px;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div class="field">
          <label style="font-size: 0.84rem; font-weight: 600; color: var(--teal-950); display: block; margin-bottom: 6px;">บริษัทขนส่ง *</label>
          <select id="pk-courier" class="form-select" style="width: 100%; height: 42px; border-radius: 8px;">
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
          <label style="font-size: 0.84rem; font-weight: 600; color: var(--teal-950); display: block; margin-bottom: 6px;">หมายเลขพัสดุ (Tracking No.) *</label>
          <input type="text" id="pk-tracking" placeholder="เช่น TH0129384756" required style="width: 100%; height: 42px; border-radius: 8px;">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div class="field">
          <label style="font-size: 0.84rem; font-weight: 600; color: var(--teal-950); display: block; margin-bottom: 6px;">ห้องพักผู้รับ *</label>
          <select id="pk-room" class="form-select" style="width: 100%; height: 42px; border-radius: 8px;">
            ${roomOptions}
          </select>
        </div>
        <div class="field">
          <label style="font-size: 0.84rem; font-weight: 600; color: var(--teal-950); display: block; margin-bottom: 6px;">ชื่อผู้รับตามจ่าหน้า *</label>
          <input type="text" id="pk-name" value="${defaultName}" placeholder="เช่น นายสมชาย ธนกฤษฎ์" required style="width: 100%; height: 42px; border-radius: 8px;">
        </div>
      </div>

      <div class="field">
        <label style="font-size: 0.84rem; font-weight: 600; color: var(--teal-950); display: block; margin-bottom: 6px;">ลักษณะพัสดุ / หมายเหตุ</label>
        <input type="text" id="pk-desc" placeholder="เช่น กล่องใหญ่, ซองเอกสาร, กล่องพัสดุขนาดกลาง" style="width: 100%; height: 42px; border-radius: 8px;">
      </div>
    </form>
  `;

  const footer = `
    <button type="button" class="btn btn-outline" onclick="window.closeAppModal()">ยกเลิก</button>
    <button type="button" class="btn btn-primary" id="btn-submit-parcel" style="background: #3B82F6; border-color: #3B82F6;">บันทึกรับพัสดุ</button>
  `;

  showModal({
    title: 'บันทึกพัสดุมาส่งใหม่ (New Parcel Entry)',
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

    const newId = 'PKG-' + Math.floor(100 + Math.random() * 900);

    const { error } = await supabase.from('parcels').insert([{
      id: newId,
      tracking_number: tracking,
      courier,
      room_number: room,
      recipient_name: name,
      description: desc || 'กล่องพัสดุมาตรฐาน',
      status: 'waiting',
      arrived_at: new Date().toISOString().split('T')[0]
    }]);

    if (error) {
      console.error('Parcel insert error:', error);
      toast('เกิดข้อผิดพลาดในการบันทึกพัสดุ', 'error');
      return;
    }

    toast(`บันทึกพัสดุเลขที่ ${tracking} สำหรับห้อง ${room} สำเร็จ`, 'success');
    closeModal();
    loadParcelsData();
  };
}
