// js/rooms.js
// ระบบผังห้องพักและสถานะห้องพัก 3 อาคาร (Tanakrit, KingPhetch, UnderGround)
// ออกแบบด้วย Smoky Frosted Glass Design System
import { supabase } from './supabase.js';
import { ic, fmtCurrency, showModal, closeModal, toast } from './api.js';

let currentBuildingFilter = 'all';
let currentStatusFilter = 'all';
let currentSearch = '';

const CACHE_KEY = 'tanakrit_rooms_cache_v3';

// รายชื่อห้องพักมาตรฐานทั้ง 17 ห้อง (3 อาคาร) ตามโครงสร้างจริงและราคาที่ถูกต้องของหอพัก
export const DEFAULT_ROOMS = [
  // 1. อาคาร ธนกฤษฎ์ (9 ห้อง: 101 - 109) — 1,500 บาท/เดือน
  { 
    id: 'RM-T101', room_number: '101', building: 'Tanakrit', floor: 1, type: 'ห้องพัดลม', price: 1500, 
    size: 'กว้าง 3.5 เมตร ยาว 8 เมตร รวม (28 ตร.ม.)', bathroom: 'ห้องน้ำในตัว', status: 'vacant', 
    tenant_name: '', tenant_phone: '', 
    condition: 'โปร่งสบาย อากาศถ่ายเทดีเยี่ยม ระเบียงส่วนตัว', 
    amenities: 'เตียง+ที่นอน, ตู้เสื้อผ้า, ห้องน้ำในตัว, ระเบียงตากผ้าหลังห้องส่วนตัว' 
  },
  { 
    id: 'RM-T102', room_number: '102', building: 'Tanakrit', floor: 1, type: 'ห้องพัดลม', price: 1500, 
    size: 'กว้าง 3.5 เมตร ยาว 8 เมตร รวม (28 ตร.ม.)', bathroom: 'ห้องน้ำในตัว', status: 'vacant', 
    tenant_name: '', tenant_phone: '', 
    condition: 'โปร่งสบาย อากาศถ่ายเทดีเยี่ยม ระเบียงส่วนตัว', 
    amenities: 'เตียง+ที่นอน, ตู้เสื้อผ้า, ห้องน้ำในตัว, ระเบียงตากผ้าหลังห้องส่วนตัว' 
  },
  { 
    id: 'RM-T103', room_number: '103', building: 'Tanakrit', floor: 1, type: 'ห้องพัดลม', price: 1500, 
    size: 'กว้าง 3.5 เมตร ยาว 8 เมตร รวม (28 ตร.ม.)', bathroom: 'ห้องน้ำในตัว', status: 'vacant', 
    tenant_name: '', tenant_phone: '', 
    condition: 'โปร่งสบาย อากาศถ่ายเทดีเยี่ยม ระเบียงส่วนตัว', 
    amenities: 'เตียง+ที่นอน, ตู้เสื้อผ้า, ห้องน้ำในตัว, ระเบียงตากผ้าหลังห้องส่วนตัว' 
  },
  { 
    id: 'RM-T104', room_number: '104', building: 'Tanakrit', floor: 1, type: 'ห้องพัดลม', price: 1500, 
    size: 'กว้าง 3.5 เมตร ยาว 8 เมตร รวม (28 ตร.ม.)', bathroom: 'ห้องน้ำในตัว', status: 'vacant', 
    tenant_name: '', tenant_phone: '', 
    condition: 'โปร่งสบาย อากาศถ่ายเทดีเยี่ยม ระเบียงส่วนตัว', 
    amenities: 'เตียง+ที่นอน, ตู้เสื้อผ้า, ห้องน้ำในตัว, ระเบียงตากผ้าหลังห้องส่วนตัว' 
  },
  { 
    id: 'RM-T105', room_number: '105', building: 'Tanakrit', floor: 1, type: 'ห้องพัดลม', price: 1500, 
    size: 'กว้าง 3.5 เมตร ยาว 8 เมตร รวม (28 ตร.ม.)', bathroom: 'ห้องน้ำในตัว', status: 'vacant', 
    tenant_name: '', tenant_phone: '', 
    condition: 'โปร่งสบาย อากาศถ่ายเทดีเยี่ยม ระเบียงส่วนตัว', 
    amenities: 'เตียง+ที่นอน, ตู้เสื้อผ้า, ห้องน้ำในตัว, ระเบียงตากผ้าหลังห้องส่วนตัว' 
  },
  { 
    id: 'RM-T106', room_number: '106', building: 'Tanakrit', floor: 1, type: 'ห้องพัดลม', price: 1500, 
    size: 'กว้าง 3.5 เมตร ยาว 8 เมตร รวม (28 ตร.ม.)', bathroom: 'ห้องน้ำในตัว', status: 'vacant', 
    tenant_name: '', tenant_phone: '', 
    condition: 'โปร่งสบาย อากาศถ่ายเทดีเยี่ยม ระเบียงส่วนตัว', 
    amenities: 'เตียง+ที่นอน, ตู้เสื้อผ้า, ห้องน้ำในตัว, ระเบียงตากผ้าหลังห้องส่วนตัว' 
  },
  { 
    id: 'RM-T107', room_number: '107', building: 'Tanakrit', floor: 1, type: 'ห้องพัดลม', price: 1500, 
    size: 'กว้าง 3.5 เมตร ยาว 8 เมตร รวม (28 ตร.ม.)', bathroom: 'ห้องน้ำในตัว', status: 'maintenance', 
    tenant_name: '', tenant_phone: '', 
    condition: 'โปร่งสบาย อากาศถ่ายเทดีเยี่ยม ระเบียงส่วนตัว', 
    amenities: 'เตียง+ที่นอน, ตู้เสื้อผ้า, ห้องน้ำในตัว, ระเบียงตากผ้าหลังห้องส่วนตัว' 
  },
  { 
    id: 'RM-T108', room_number: '108', building: 'Tanakrit', floor: 1, type: 'ห้องพัดลม', price: 1500, 
    size: 'กว้าง 3.5 เมตร ยาว 8 เมตร รวม (28 ตร.ม.)', bathroom: 'ห้องน้ำในตัว', status: 'vacant', 
    tenant_name: '', tenant_phone: '', 
    condition: 'โปร่งสบาย อากาศถ่ายเทดีเยี่ยม ระเบียงส่วนตัว', 
    amenities: 'เตียง+ที่นอน, ตู้เสื้อผ้า, ห้องน้ำในตัว, ระเบียงตากผ้าหลังห้องส่วนตัว' 
  },
  { 
    id: 'RM-T109', room_number: '109', building: 'Tanakrit', floor: 1, type: 'ห้องพัดลม', price: 1500, 
    size: 'กว้าง 3.5 เมตร ยาว 8 เมตร รวม (28 ตร.ม.)', bathroom: 'ห้องน้ำในตัว', status: 'vacant', 
    tenant_name: '', tenant_phone: '', 
    condition: 'โปร่งสบาย อากาศถ่ายเทดีเยี่ยม ระเบียงส่วนตัว', 
    amenities: 'เตียง+ที่นอน, ตู้เสื้อผ้า, ห้องน้ำในตัว, ระเบียงตากผ้าหลังห้องส่วนตัว' 
  },

  // 2. อาคาร กิ่งเพชร (5 ห้อง: 201 - 205) — 1,500 บาท/เดือน
  { 
    id: 'RM-K201', room_number: '201', building: 'KingPhetch', floor: 1, type: 'ห้องพัดลม', price: 1500, 
    size: 'กว้าง 3.5 เมตร ยาว 8 เมตร รวม (28 ตร.ม.)', bathroom: 'ห้องน้ำในตัว', status: 'vacant', 
    tenant_name: '', tenant_phone: '', 
    condition: 'เงียบสงบ เป็นส่วนตัว เหมาะแก่การอ่านหนังสือ', 
    amenities: 'เตียง+ที่นอน, ตู้เสื้อผ้า, ห้องน้ำในตัว, ราวตากผ้าหลังห้อง' 
  },
  { 
    id: 'RM-K202', room_number: '202', building: 'KingPhetch', floor: 1, type: 'ห้องพัดลม', price: 1500, 
    size: 'กว้าง 3.5 เมตร ยาว 8 เมตร รวม (28 ตร.ม.)', bathroom: 'ห้องน้ำในตัว', status: 'vacant', 
    tenant_name: '', tenant_phone: '', 
    condition: 'เงียบสงบ เป็นส่วนตัว เหมาะแก่การอ่านหนังสือ', 
    amenities: 'เตียง+ที่นอน, ตู้เสื้อผ้า, ห้องน้ำในตัว, ราวตากผ้าหลังห้อง' 
  },
  { 
    id: 'RM-K203', room_number: '203', building: 'KingPhetch', floor: 1, type: 'ห้องพัดลม', price: 1500, 
    size: 'กว้าง 3.5 เมตร ยาว 8 เมตร รวม (28 ตร.ม.)', bathroom: 'ห้องน้ำในตัว', status: 'vacant', 
    tenant_name: '', tenant_phone: '', 
    condition: 'เงียบสงบ เป็นส่วนตัว เหมาะแก่การอ่านหนังสือ', 
    amenities: 'เตียง+ที่นอน, ตู้เสื้อผ้า, ห้องน้ำในตัว, ราวตากผ้าหลังห้อง' 
  },
  { 
    id: 'RM-K204', room_number: '204', building: 'KingPhetch', floor: 1, type: 'ห้องพัดลม', price: 1500, 
    size: 'กว้าง 3.5 เมตร ยาว 8 เมตร รวม (28 ตร.ม.)', bathroom: 'ห้องน้ำในตัว', status: 'vacant', 
    tenant_name: '', tenant_phone: '', 
    condition: 'เงียบสงบ เป็นส่วนตัว เหมาะแก่การอ่านหนังสือ', 
    amenities: 'เตียง+ที่นอน, ตู้เสื้อผ้า, ห้องน้ำในตัว, ราวตากผ้าหลังห้อง' 
  },
  { 
    id: 'RM-K205', room_number: '205', building: 'KingPhetch', floor: 1, type: 'ห้องพัดลม', price: 1500, 
    size: 'กว้าง 3.5 เมตร ยาว 8 เมตร รวม (28 ตร.ม.)', bathroom: 'ห้องน้ำในตัว', status: 'vacant', 
    tenant_name: '', tenant_phone: '', 
    condition: 'เงียบสงบ เป็นส่วนตัว เหมาะแก่การอ่านหนังสือ', 
    amenities: 'เตียง+ที่นอน, ตู้เสื้อผ้า, ห้องน้ำในตัว, ราวตากผ้าหลังห้อง' 
  },

  // 3. อาคาร ใต้บ้าน (3 ห้อง: B01 - B03) — 800 บาท/เดือน
  { 
    id: 'RM-UG01', room_number: 'B01', building: 'UnderGround', floor: 0, type: 'ห้องพัดลม', price: 800, 
    size: 'กว้าง 3 เมตร ยาว 4 เมตร รวม (12 ตร.ม.)', bathroom: 'ห้องน้ำรวม', status: 'vacant', 
    tenant_name: '', tenant_phone: '', 
    condition: 'ราคาสบายกระเป๋า เฟอร์นิเจอร์พร้อมอยู่', 
    amenities: 'เตียง+ที่นอน, ตู้เสื้อผ้า, ใช้ห้องน้ำรวมที่สะอาด' 
  },
  { 
    id: 'RM-UG02', room_number: 'B02', building: 'UnderGround', floor: 0, type: 'ห้องพัดลม', price: 800, 
    size: 'กว้าง 3 เมตร ยาว 4 เมตร รวม (12 ตร.ม.)', bathroom: 'ห้องน้ำรวม', status: 'vacant', 
    tenant_name: '', tenant_phone: '', 
    condition: 'ราคาสบายกระเป๋า เฟอร์นิเจอร์พร้อมอยู่', 
    amenities: 'เตียง+ที่นอน, ตู้เสื้อผ้า, ใช้ห้องน้ำรวมที่สะอาด' 
  },
  { 
    id: 'RM-UG03', room_number: 'B03', building: 'UnderGround', floor: 0, type: 'ห้องพัดลม', price: 800, 
    size: 'กว้าง 3 เมตร ยาว 4 เมตร รวม (12 ตร.ม.)', bathroom: 'ห้องน้ำรวม', status: 'vacant', 
    tenant_name: '', tenant_phone: '', 
    condition: 'ราคาสบายกระเป๋า เฟอร์นิเจอร์พร้อมอยู่', 
    amenities: 'เตียง+ที่นอน, ตู้เสื้อผ้า, ใช้ห้องน้ำรวมที่สะอาด' 
  }
];

export async function renderRoomsView() {
  setTimeout(() => {
    bindRoomsEvents();
    loadRoomsData();
  }, 0);

  return `
    <div style="display: flex; flex-direction: column; gap: 22px;">
      
      <!-- 1. Header Card (Smoky Glass) -->
      <div class="smoky-card" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(59,130,246,0.18); border: 1px solid rgba(59,130,246,0.32); display: flex; align-items: center; justify-content: center; color: #3B82F6;">
            ${ic('door')}
          </div>
          <div>
            <h2 style="font-size: 1.35rem; font-weight: 700; color: #ffffff; margin: 0; letter-spacing: -0.02em;">
              ผังห้องพัก 3 อาคาร (Floor Plan — 17 ห้อง)
            </h2>
            <span style="font-size: 0.82rem; color: rgba(255,255,255,0.48); margin-top: 3px; display: block;">
              อาคาร ธนกฤษฎ์ (9 ห้อง) · อาคาร กิ่งเพชร (5 ห้อง) · อาคาร ใต้บ้าน (3 ห้อง)
            </span>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <button class="smoky-round-glass-btn" id="btn-add-room" style="width: auto; border-radius: 9999px; padding: 0 18px; height: 38px; background: #3B82F6; color: #ffffff; border: 1px solid rgba(59,130,246,0.5); box-shadow: 0 0 20px rgba(59,130,246,0.4); font-size: 0.82rem; font-weight: 600; gap: 6px;">
            ${ic('plus')}
            <span>เพิ่มห้องพักใหม่</span>
          </button>
        </div>
      </div>

      <!-- 2. KPI Summary Tiles (Smoky Glass) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 16px;" id="room-stats-summary">
        <!-- Will be populated via JS -->
      </div>

      <!-- 3. Filters & Search Toolbar (Smoky Glass) -->
      <div class="smoky-card" style="padding: 16px 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
          
          <!-- Search Box -->
          <div style="position: relative; min-width: 240px; flex: 1; max-width: 320px;">
            <span style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.4); display: flex; align-items: center;">
              ${ic('search')}
            </span>
            <input type="text" id="rooms-search-input" class="smoky-glass-input" placeholder="ค้นหาเลขห้อง หรือชื่อผู้เช่า..." style="width: 100%; padding-left: 38px;">
          </div>

          <!-- Building Tabs (Segmented Control) -->
          <div class="smoky-segmented" id="building-tabs" style="overflow-x: auto; max-width: 100%;">
            <button class="smoky-seg-btn active" data-building="all">ทุกอาคาร (17 ห้อง)</button>
            <button class="smoky-seg-btn" data-building="Tanakrit">🏢 อาคาร ธนกฤษฎ์ (9)</button>
            <button class="smoky-seg-btn" data-building="KingPhetch">🏡 อาคาร กิ่งเพชร (5)</button>
            <button class="smoky-seg-btn" data-building="UnderGround">🛋️ อาคาร ใต้บ้าน (3)</button>
          </div>

          <!-- Status Dropdown Filter -->
          <div>
            <select id="rooms-status-select" class="smoky-glass-select">
              <option value="all">สถานะทั้งหมด</option>
              <option value="occupied">เฉพาะห้องที่มีผู้เช่า</option>
              <option value="vacant">เฉพาะห้องว่างพร้อมอยู่</option>
              <option value="maintenance">เฉพาะห้องที่ปิดปรับปรุง / ซ่อมบำรุง</option>
            </select>
          </div>

        </div>
      </div>

      <!-- 4. Visual Rooms Grid (Smoky Glass) -->
      <div id="rooms-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(285px, 1fr)); gap: 20px;">
        <div style="text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.4); grid-column: 1/-1;">
          กำลังโหลดข้อมูลห้องพัก 3 อาคาร...
        </div>
      </div>

    </div>
  `;
}

async function loadRoomsData() {
  const container = document.getElementById('rooms-container');
  const summary = document.getElementById('room-stats-summary');
  if (!container) return;

  // 1. นำโครงสร้างห้องพักมาตรฐาน 17 ห้องเป็นตัวตั้ง
  let rooms = JSON.parse(JSON.stringify(DEFAULT_ROOMS));

  // 2. ซิงค์กับข้อมูลผู้พักอาศัยล่าสุดจาก Supabase Cloud Realtime
  let dbTenants = [];
  try {
    const { data, error } = await supabase.from('tenants').select('*');
    if (!error && Array.isArray(data)) {
      dbTenants = data;
    }
  } catch (_) {}

  // 3. ซิงค์กับรายการแจ้งซ่อมบำรุง (Maintenance) ที่กำลังดำเนินการจาก Supabase Realtime
  const activeMaintRooms = new Set();
  try {
    const { data: tickets } = await supabase.from('maintenance').select('room_number, status');
    if (tickets && Array.isArray(tickets)) {
      tickets.filter(t => t.status !== 'completed').forEach(t => {
        if (t.room_number) activeMaintRooms.add(t.room_number.replace(/[^0-9B]/gi, ''));
      });
    }
  } catch (_) {}

  // 4. แมปสถานะห้องพักและผู้เช่าของแต่ละห้อง
  rooms.forEach(r => {
    const cleanNum = String(r.room_number).trim();
    const tenant = dbTenants.find(t => String(t.room).trim() === cleanNum && t.status !== 'terminated');
    if (tenant) {
      r.status = 'occupied';
      r.tenant_name = tenant.name || '';
      r.tenant_phone = tenant.phone || '';
    } else if (activeMaintRooms.has(cleanNum) || r.status === 'maintenance') {
      r.status = 'maintenance';
      r.tenant_name = '';
      r.tenant_phone = '';
    } else {
      r.status = 'vacant';
      r.tenant_name = '';
      r.tenant_phone = '';
    }
  });

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(rooms));
  } catch (_) {}

  // Update Summary Stats
  const total = rooms.length;
  const occupied = rooms.filter(r => r.status === 'occupied').length;
  const vacant = rooms.filter(r => r.status === 'vacant').length;
  const maintenance = rooms.filter(r => r.status === 'maintenance').length;
  const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;

  if (summary) {
    summary.innerHTML = `
      <div class="smoky-tile" style="padding: 16px 18px; border-radius: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="smoky-meta-label">ห้องพักทั้งหมด</span>
          <div style="width: 28px; height: 28px; border-radius: 8px; background: rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.85);">
            ${ic('door')}
          </div>
        </div>
        <div style="margin-top: 8px; display: flex; align-items: baseline; gap: 8px;">
          <span class="smoky-kpi-num" style="font-size: 1.7rem;">${total}</span>
          <span style="font-size: 0.78rem; color: rgba(255,255,255,0.45);">ห้อง (3 อาคาร)</span>
        </div>
      </div>

      <div class="smoky-tile" style="padding: 16px 18px; border-radius: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="smoky-meta-label">เข้าพักแล้ว</span>
          <span class="smoky-delta-pos" style="font-size: 0.70rem;">${occupancyRate}%</span>
        </div>
        <div style="margin-top: 8px; display: flex; align-items: baseline; gap: 8px;">
          <span class="smoky-kpi-num" style="font-size: 1.7rem; color: #3B82F6;">${occupied}</span>
          <span style="font-size: 0.78rem; color: rgba(255,255,255,0.45);">ห้องเช่า</span>
        </div>
      </div>

      <div class="smoky-tile" style="padding: 16px 18px; border-radius: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="smoky-meta-label">ห้องว่างพร้อมอยู่</span>
          <span style="background: rgba(52,211,153,0.18); color: #34D399; font-size: 0.65rem; font-weight: 700; padding: 2px 7px; border-radius: 9999px;">พร้อมจอง</span>
        </div>
        <div style="margin-top: 8px; display: flex; align-items: baseline; gap: 8px;">
          <span class="smoky-kpi-num" style="font-size: 1.7rem; color: #34D399;">${vacant}</span>
          <span style="font-size: 0.78rem; color: rgba(255,255,255,0.45);">ห้อง (สัญญา 12 ด.)</span>
        </div>
      </div>

      <div class="smoky-tile" style="padding: 16px 18px; border-radius: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="smoky-meta-label">ปิดปรับปรุง / ซ่อมบำรุง</span>
          <span style="background: rgba(245,158,11,0.18); color: #F59E0B; font-size: 0.65rem; font-weight: 700; padding: 2px 7px; border-radius: 9999px;">Service</span>
        </div>
        <div style="margin-top: 8px; display: flex; align-items: baseline; gap: 8px;">
          <span class="smoky-kpi-num" style="font-size: 1.7rem; color: #F59E0B;">${maintenance}</span>
          <span style="font-size: 0.78rem; color: rgba(255,255,255,0.45);">ห้อง</span>
        </div>
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
      <div style="text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.4); grid-column: 1/-1;">
        <div style="font-size: 2.2rem; margin-bottom: 8px;">🔍</div>
        ไม่พบห้องพักตามเงื่อนไขที่ค้นหา
      </div>
    `;
    return;
  }

  let html = '';
  filtered.forEach(r => {
    let statusClass = 'vacant';
    let statusLabel = 'ห้องว่างพร้อมอยู่';
    let statusColor = '#34D399';
    let statusBadgeBg = 'rgba(52,211,153,0.14)';
    let statusBadgeBorder = 'rgba(52,211,153,0.28)';

    if (r.status === 'occupied') {
      statusClass = 'occupied';
      statusLabel = 'มีผู้พักอาศัย';
      statusColor = '#3B82F6';
      statusBadgeBg = 'rgba(59,130,246,0.16)';
      statusBadgeBorder = 'rgba(59,130,246,0.30)';
    } else if (r.status === 'maintenance') {
      statusClass = 'maintenance';
      statusLabel = 'กำลังซ่อมบำรุง';
      statusColor = '#F59E0B';
      statusBadgeBg = 'rgba(245,158,11,0.16)';
      statusBadgeBorder = 'rgba(245,158,11,0.30)';
    }

    const buildingName = r.building || (r.room_number.startsWith('B') ? 'UnderGround' : (Number(r.room_number) >= 200 ? 'KingPhetch' : 'Tanakrit'));
    
    let buildingDisplayName = 'อาคาร ธนกฤษฎ์';
    let buildingBadgeBg = 'rgba(52,211,153,0.15)';
    let buildingBadgeColor = '#34D399';
    let cardAccentColor = '#3B82F6';

    if (buildingName === 'KingPhetch' || buildingName === 'กิ่งเพชร' || buildingName === 'อาคาร กิ่งเพชร') {
      buildingDisplayName = 'อาคาร กิ่งเพชร';
      buildingBadgeBg = 'rgba(96,165,250,0.15)';
      buildingBadgeColor = '#60A5FA';
      cardAccentColor = '#60A5FA';
    } else if (buildingName === 'UnderGround' || buildingName === 'ใต้บ้าน' || buildingName === 'อาคารใต้บ้าน') {
      buildingDisplayName = 'อาคาร ใต้บ้าน';
      buildingBadgeBg = 'rgba(245,158,11,0.15)';
      buildingBadgeColor = '#F59E0B';
      cardAccentColor = '#F59E0B';
    }

    const roomSize = r.size || (buildingName === 'UnderGround' ? 'กว้าง 3 เมตร ยาว 4 เมตร รวม (12 ตร.ม.)' : 'กว้าง 3.5 เมตร ยาว 8 เมตร รวม (28 ตร.ม.)');
    const bathroomType = r.bathroom || (buildingName === 'UnderGround' ? 'ห้องน้ำรวม' : 'ห้องน้ำในตัว');
    const roomCondition = r.condition || (buildingName === 'UnderGround' ? 'ราคาสบายกระเป๋า พร้อมอยู่' : (buildingName === 'KingPhetch' ? 'เงียบสงบ เป็นส่วนตัว' : 'โปร่งสบาย ระเบียงส่วนตัว'));

    html += `
      <div class="smoky-room-card ${statusClass}" data-room-id="${r.id}">
        
        <div>
          <!-- Top Row: Building Name & Status Badge -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
            <div>
              <span style="background: ${buildingBadgeBg}; color: ${buildingBadgeColor}; font-size: 0.70rem; font-weight: 700; padding: 3px 9px; border-radius: 6px; letter-spacing: 0.03em;">
                ${buildingDisplayName}
              </span>
              <div style="display: flex; align-items: baseline; gap: 8px; margin-top: 8px;">
                <h3 style="font-size: 1.45rem; font-weight: 800; color: #ffffff; margin: 0; letter-spacing: -0.02em;">
                  ห้อง ${r.room_number}
                </h3>
                <span style="font-size: 0.74rem; color: rgba(255,255,255,0.45); font-weight: 500;">${r.type || 'ห้องพัดลม'}</span>
              </div>
            </div>

            <!-- Status Badge -->
            <span style="background: ${statusBadgeBg}; color: ${statusColor}; border: 1px solid ${statusBadgeBorder}; font-size: 0.70rem; font-weight: 700; padding: 3px 10px; border-radius: 9999px; display: flex; align-items: center; gap: 6px; white-space: nowrap;">
              <span style="width: 6px; height: 6px; border-radius: 50%; background: ${statusColor}; box-shadow: 0 0 6px ${statusColor};"></span>
              ${statusLabel}
            </span>
          </div>

          <!-- Specs List -->
          <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 10px 12px; margin: 12px 0; font-size: 0.76rem; color: rgba(255,255,255,0.7); display: flex; flex-direction: column; gap: 5px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="color: rgba(255,255,255,0.45);">📐 ขนาดพื้นที่:</span>
              <span style="font-weight: 600; color: #ffffff;">${roomSize}</span>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="color: rgba(255,255,255,0.45);">🚿 ห้องน้ำ:</span>
              <span style="font-weight: 600; color: #ffffff;">${bathroomType}</span>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="color: rgba(255,255,255,0.45);">🌿 บรรยากาศ:</span>
              <span style="color: rgba(255,255,255,0.85);">${roomCondition}</span>
            </div>
          </div>

          <!-- Price Row -->
          <div style="display: flex; align-items: baseline; justify-content: space-between; margin: 12px 0 14px;">
            <span style="font-size: 0.78rem; color: rgba(255,255,255,0.45);">อัตราค่าเช่า:</span>
            <div style="display: flex; align-items: baseline; gap: 4px;">
              <span class="smoky-kpi-num" style="font-size: 1.35rem; color: #ffffff;">${Number(r.price).toLocaleString()} ฿</span>
              <span style="font-size: 0.72rem; color: rgba(255,255,255,0.45);">/ เดือน</span>
            </div>
          </div>

          <!-- Tenant info / Vacant info box -->
          <div style="background: rgba(255,255,255,0.04); border: 1px dashed rgba(255,255,255,0.1); border-radius: 10px; padding: 10px 12px; font-size: 0.78rem; margin-bottom: 16px;">
            ${r.status === 'occupied' ? `
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div style="width: 26px; height: 26px; border-radius: 50%; background: rgba(59,130,246,0.22); color: #3B82F6; display: flex; align-items: center; justify-content: center; font-size: 0.70rem;">
                    ${ic('user')}
                  </div>
                  <div>
                    <span style="font-weight: 600; color: #ffffff; display: block;">${r.tenant_name || 'ผู้พักอาศัย'}</span>
                    <span style="font-size: 0.70rem; color: rgba(255,255,255,0.45);">${r.tenant_phone || 'สัญญา 12 เดือน'}</span>
                  </div>
                </div>
              </div>
            ` : (r.status === 'maintenance' ? `
              <div style="display: flex; align-items: center; gap: 8px; color: #F59E0B;">
                ${ic('wrench')}
                <span style="font-size: 0.76rem;">อยู่ระหว่างตรวจสอบและซ่อมบำรุง</span>
              </div>
            ` : `
              <div style="display: flex; align-items: center; gap: 8px; color: #34D399;">
                ${ic('sparkles')}
                <span style="font-size: 0.76rem;">ห้องว่าง พร้อมทำสัญญาเข้าอยู่ (12 เดือน)</span>
              </div>
            `)}
          </div>
        </div>

        <!-- Action Button -->
        <button class="smoky-round-glass-btn btn-manage-room" data-room-id="${r.id}" style="width: 100%; height: 38px; border-radius: 10px; font-size: 0.82rem; font-weight: 600; justify-content: center; gap: 6px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);">
          <span>จัดการห้องพัก</span>
          <svg class="icon" viewBox="0 0 24 24" style="width: 14px; height: 14px;"><polyline points="9 18 15 12 9 6"/></svg>
        </button>

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
    buildingTabs.querySelectorAll('.smoky-seg-btn').forEach(btn => {
      btn.onclick = () => {
        buildingTabs.querySelectorAll('.smoky-seg-btn').forEach(b => b.classList.remove('active'));
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
    <form id="form-manage-room" style="display: flex; flex-direction: column; gap: 14px;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div class="field">
          <label style="font-size: 0.80rem; font-weight: 600; color: rgba(255,255,255,0.7); margin-bottom: 6px; display: block;">หมายเลขห้อง</label>
          <input type="text" id="m-room-number" value="${room.room_number}" class="form-input" style="width: 100%;" required>
        </div>
        <div class="field">
          <label style="font-size: 0.80rem; font-weight: 600; color: rgba(255,255,255,0.7); margin-bottom: 6px; display: block;">อาคาร</label>
          <select id="m-building" class="form-select" style="width: 100%;">
            <option value="Tanakrit" ${room.building === 'Tanakrit' ? 'selected' : ''}>อาคาร ธนกฤษฎ์ (1,500 ฿ / เดือน)</option>
            <option value="KingPhetch" ${room.building === 'KingPhetch' ? 'selected' : ''}>อาคาร กิ่งเพชร (1,500 ฿ / เดือน)</option>
            <option value="UnderGround" ${room.building === 'UnderGround' ? 'selected' : ''}>อาคาร ใต้บ้าน (800 ฿ / เดือน)</option>
          </select>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div class="field">
          <label class="smoky-form-label" style="font-size: 0.82rem; margin-bottom: 6px; display: block;">ประเภทห้องพัก</label>
          <input type="text" id="m-type" value="${room.type || 'ห้องพัดลม'}" class="smoky-glass-input" style="width: 100%;" required>
        </div>
        <div class="field">
          <label class="smoky-form-label" style="font-size: 0.82rem; margin-bottom: 6px; display: block;">ราคาค่าเช่าต่อเดือน (บาท)</label>
          <input type="number" id="m-price" value="${room.price}" class="smoky-glass-input" style="width: 100%;" required>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div class="field">
          <label class="smoky-form-label" style="font-size: 0.82rem; margin-bottom: 6px; display: block;">ขนาดห้องพัก</label>
          <input type="text" id="m-size" value="${room.size || (room.building === 'UnderGround' ? 'กว้าง 3 เมตร ยาว 4 เมตร รวม (12 ตร.ม.)' : 'กว้าง 3.5 เมตร ยาว 8 เมตร รวม (28 ตร.ม.)')}" class="smoky-glass-input" style="width: 100%;">
        </div>
        <div class="field">
          <label class="smoky-form-label" style="font-size: 0.82rem; margin-bottom: 6px; display: block;">ประเภทห้องน้ำ</label>
          <select id="m-bathroom" class="smoky-glass-select" style="width: 100%;">
            <option value="ห้องน้ำในตัว" ${room.bathroom !== 'ห้องน้ำรวม' ? 'selected' : ''}>ห้องน้ำในตัว</option>
            <option value="ห้องน้ำรวม" ${room.bathroom === 'ห้องน้ำรวม' ? 'selected' : ''}>ห้องน้ำรวม</option>
          </select>
        </div>
      </div>

      <div class="field">
        <label class="smoky-form-label" style="font-size: 0.82rem; margin-bottom: 6px; display: block;">สถานะห้องพัก</label>
        <select id="m-status" class="smoky-glass-select" style="width: 100%;">
          <option value="vacant" ${room.status === 'vacant' ? 'selected' : ''}>ห้องว่างพร้อมอยู่ (พร้อมทำสัญญา)</option>
          <option value="occupied" ${room.status === 'occupied' ? 'selected' : ''}>มีผู้พักอาศัยแล้ว</option>
          <option value="maintenance" ${room.status === 'maintenance' ? 'selected' : ''}>ปิดปรับปรุง / ซ่อมบำรุง</option>
        </select>
      </div>

      <div class="field">
        <label class="smoky-form-label" style="font-size: 0.82rem; margin-bottom: 6px; display: block;">ชื่อผู้พักอาศัยปัจจุบัน</label>
        <input type="text" id="m-tenant-name" value="${room.tenant_name || ''}" placeholder="ระบุชื่อผู้พักอาศัย (ถ้ามี)" class="smoky-glass-input" style="width: 100%;">
      </div>

      <div class="field">
        <label class="smoky-form-label" style="font-size: 0.82rem; margin-bottom: 6px; display: block;">เบอร์โทรศัพท์ผู้เช่า</label>
        <input type="text" id="m-tenant-phone" value="${room.tenant_phone || ''}" placeholder="08x-xxx-xxxx" class="smoky-glass-input" style="width: 100%;">
      </div>
    </form>
  `;

  const footer = `
    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
      <button type="button" class="btn btn-outline" id="btn-delete-room" style="color: #F87171; border-color: rgba(248,113,113,0.3); font-size: 0.80rem;">
        ${ic('trash')} ลบห้องพัก
      </button>
      <div style="display: flex; gap: 10px;">
        <button type="button" class="btn btn-outline" onclick="window.closeAppModal()">ยกเลิก</button>
        <button type="button" class="btn btn-primary" id="btn-save-manage-room">บันทึกข้อมูล</button>
      </div>
    </div>
  `;

  showModal({
    title: `จัดการห้องพัก ${room.room_number} (${room.building === 'KingPhetch' ? 'อาคาร กิ่งเพชร' : (room.building === 'UnderGround' ? 'อาคาร ใต้บ้าน' : 'อาคาร ธนกฤษฎ์')})`,
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
      const dbPayload = {
        room_number: num,
        floor: bld === 'UnderGround' ? 0 : 1,
        type: tp,
        price: pr,
        status: st,
        tenant_name: st === 'occupied' ? tName : '',
        tenant_phone: st === 'occupied' ? tPhone : ''
      };
      await supabase.from('rooms').eq('id', room.id).update(dbPayload);
    } catch (_) {}

    // อัปเดตใน LocalStorage Cache
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
      const idx = cached.findIndex(x => x.id === room.id);
      if (idx !== -1) {
        cached[idx] = { ...cached[idx], ...updatedData };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
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
        let cached = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
        cached = cached.filter(x => x.id !== room.id);
        localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
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
    <form id="form-add-room" style="display: flex; flex-direction: column; gap: 14px;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div class="field">
          <label class="smoky-form-label" style="font-size: 0.82rem; margin-bottom: 6px; display: block;">หมายเลขห้อง (เช่น 110, 206, B04)</label>
          <input type="text" id="add-room-number" placeholder="เช่น 110" class="smoky-glass-input" style="width: 100%;" required>
        </div>
        <div class="field">
          <label class="smoky-form-label" style="font-size: 0.82rem; margin-bottom: 6px; display: block;">อาคาร</label>
          <select id="add-building" class="smoky-glass-select" style="width: 100%;">
            <option value="Tanakrit">อาคาร ธนกฤษฎ์ (1,500 ฿ / เดือน)</option>
            <option value="KingPhetch">อาคาร กิ่งเพชร (1,500 ฿ / เดือน)</option>
            <option value="UnderGround">อาคาร ใต้บ้าน (800 ฿ / เดือน)</option>
          </select>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div class="field">
          <label class="smoky-form-label" style="font-size: 0.82rem; margin-bottom: 6px; display: block;">ประเภทห้อง</label>
          <input type="text" id="add-type" value="ห้องพัดลม" class="smoky-glass-input" style="width: 100%;" required>
        </div>
        <div class="field">
          <label class="smoky-form-label" style="font-size: 0.82rem; margin-bottom: 6px; display: block;">ราคาค่าเช่าต่อเดือน (บาท)</label>
          <input type="number" id="add-price" value="1500" class="smoky-glass-input" style="width: 100%;" required>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div class="field">
          <label class="smoky-form-label" style="font-size: 0.82rem; margin-bottom: 6px; display: block;">ขนาดห้อง</label>
          <input type="text" id="add-size" value="กว้าง 3.5 เมตร ยาว 8 เมตร รวม (28 ตร.ม.)" class="smoky-glass-input" style="width: 100%;">
        </div>
        <div class="field">
          <label class="smoky-form-label" style="font-size: 0.82rem; margin-bottom: 6px; display: block;">ประเภทห้องน้ำ</label>
          <select id="add-bathroom" class="smoky-glass-select" style="width: 100%;">
            <option value="ห้องน้ำในตัว">ห้องน้ำในตัว</option>
            <option value="ห้องน้ำรวม">ห้องน้ำรวม</option>
          </select>
        </div>
      </div>

      <div class="field">
        <label class="smoky-form-label" style="font-size: 0.82rem; margin-bottom: 6px; display: block;">สถานะเริ่มต้น</label>
        <select id="add-status" class="smoky-glass-select" style="width: 100%;">
          <option value="vacant">ห้องว่าง (พร้อมเปิดให้เช่า)</option>
          <option value="occupied">มีผู้เช่าแล้ว</option>
          <option value="maintenance">ปิดปรับปรุง</option>
        </select>
      </div>
    </form>
  `;

  const footer = `
    <div style="display: flex; justify-content: flex-end; gap: 10px; width: 100%;">
      <button type="button" class="btn btn-outline" onclick="window.closeAppModal()">ยกเลิก</button>
      <button type="button" class="btn btn-primary" id="btn-submit-add-room">เพิ่มห้องพัก</button>
    </div>
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
        document.getElementById('add-size').value = 'กว้าง 3 เมตร ยาว 4 เมตร รวม (12 ตร.ม.)';
        document.getElementById('add-bathroom').value = 'ห้องน้ำรวม';
      } else if (val === 'KingPhetch') {
        document.getElementById('add-price').value = 1500;
        document.getElementById('add-size').value = 'กว้าง 3.5 เมตร ยาว 8 เมตร รวม (28 ตร.ม.)';
        document.getElementById('add-bathroom').value = 'ห้องน้ำในตัว';
      } else {
        document.getElementById('add-price').value = 1500;
        document.getElementById('add-size').value = 'กว้าง 3.5 เมตร ยาว 8 เมตร รวม (28 ตร.ม.)';
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
      condition: bld === 'UnderGround' ? 'ราคาสบายกระเป๋า พร้อมอยู่' : (bld === 'KingPhetch' ? 'เงียบสงบ เป็นส่วนตัว' : 'โปร่งสบาย ระเบียงส่วนตัว'),
      amenities: bld === 'UnderGround' ? 'เตียง+ที่นอน, ตู้เสื้อผ้า, ใช้ห้องน้ำรวมที่สะอาด' : 'เตียง+ที่นอน, ตู้เสื้อผ้า, ห้องน้ำในตัว, ระเบียงตากผ้าหลังห้อง'
    };

    try {
      const dbPayload = {
        id: 'R' + num,
        room_number: num,
        floor: bld === 'UnderGround' ? 0 : 1,
        type: tp,
        price: pr,
        status: st,
        tenant_name: '',
        tenant_phone: ''
      };
      await supabase.from('rooms').insert([dbPayload]);
    } catch (_) {}

    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
      cached.push(newRoom);
      localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
    } catch (_) {}

    toast(`เพิ่มห้องพัก ${num} (${bld === 'KingPhetch' ? 'อาคาร กิ่งเพชร' : (bld === 'UnderGround' ? 'อาคาร ใต้บ้าน' : 'อาคาร ธนกฤษฎ์')}) เรียบร้อยแล้ว`, 'success');
    closeModal();
    loadRoomsData();
  };
}
