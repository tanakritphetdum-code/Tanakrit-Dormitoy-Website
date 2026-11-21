// js/reports.js
// รายงานสถิติและภาพรวมการบริหารงานหอพัก (Analytics & Reports)
// ออกแบบด้วย Smoky Frosted Glass Design System
import { supabase } from './supabase.js';
import { ic, fmtCurrency } from './api.js';

export async function renderReportsView() {
  setTimeout(() => {
    loadReportsData();
  }, 0);

  return `
    <div style="display: flex; flex-direction: column; gap: 22px;">
      
      <!-- 1. Header Card (Smoky Glass) -->
      <div class="smoky-card" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(59,130,246,0.18); border: 1px solid rgba(59,130,246,0.32); display: flex; align-items: center; justify-content: center; color: #3B82F6;">
            ${ic('chart')}
          </div>
          <div>
            <h2 style="font-size: 1.35rem; font-weight: 700; color: #ffffff; margin: 0; letter-spacing: -0.02em;">
              รายงานสถิติและภาพรวมการบริหารงานหอพัก (Analytics & Reports)
            </h2>
            <span style="font-size: 0.82rem; color: rgba(255,255,255,0.48); margin-top: 3px; display: block;">
              วิเคราะห์อัตราการเข้าพัก การชำระเงินค่าน้ำ-ค่าไฟ และประสิทธิภาพการบริการ 3 อาคาร (17 ห้อง)
            </span>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <button class="smoky-round-glass-btn" id="btn-refresh-reports" style="width: auto; height: 38px; padding: 0 18px; border-radius: 9999px; font-size: 0.82rem; gap: 6px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);">
            ${ic('check')}
            <span>รีเฟรชข้อมูลสถิติ</span>
          </button>
        </div>
      </div>

      <!-- 2. KPI Summary Stat Tiles (Smoky Glass) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 16px;" id="reports-top-stats">
        <div class="smoky-tile">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="smoky-meta-label">อัตราการเข้าพักเฉลี่ย</span>
            <div style="color: rgba(255,255,255,0.4);">${ic('door')}</div>
          </div>
          <div class="smoky-kpi-num" style="margin-top: 8px;" id="kpi-rep-occ">...</div>
          <div class="smoky-kpi-sub">สัดส่วนผู้เช่าจริง</div>
        </div>

        <div class="smoky-tile">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="smoky-meta-label">รายได้เรียกเก็บเดือนล่าสุด</span>
            <span class="smoky-delta-pos">งวดปัจจุบัน</span>
          </div>
          <div class="smoky-kpi-num" style="margin-top: 8px; color: #60A5FA;" id="kpi-rep-rev">...</div>
          <div class="smoky-kpi-sub">ค่าเช่าและค่าน้ำ-ค่าไฟ</div>
        </div>

        <div class="smoky-tile">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="smoky-meta-label">จัดเก็บรายได้สำเร็จ</span>
            <span class="smoky-delta-pos">ความคืบหน้า</span>
          </div>
          <div class="smoky-kpi-num" style="margin-top: 8px; color: #34D399;" id="kpi-rep-col">...</div>
          <div class="smoky-kpi-sub">ชำระเงินเรียบร้อยแล้ว</div>
        </div>

        <div class="smoky-tile">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="smoky-meta-label">รายการแจ้งซ่อมทั้งหมด</span>
            <div style="color: rgba(255,255,255,0.4);">${ic('wrench')}</div>
          </div>
          <div class="smoky-kpi-num" style="margin-top: 8px; color: #FBBF24;" id="kpi-rep-maint">...</div>
          <div class="smoky-kpi-sub">งานซ่อมบำรุงสะสม</div>
        </div>
      </div>

      <!-- 3. 2x2 Bento Analytics Grid (Smoky Glass) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(420px, 1fr)); gap: 20px;">
        
        <!-- Occupancy Breakdown -->
        <div class="smoky-card">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
            <div style="color: #60A5FA;">${ic('door')}</div>
            <h3 style="font-size: 1.05rem; font-weight: 700; color: #ffffff; margin: 0;">สัดส่วนอัตราการเข้าพักห้องพัก</h3>
          </div>
          <p style="color: rgba(255,255,255,0.45); font-size: 0.80rem; margin: 0 0 20px 0;">การกระจายตัวของสถานะห้องพัก 17 ห้อง ครอบคลุม 3 อาคาร</p>
          <div id="report-occupancy-bars" style="display: flex; flex-direction: column; gap: 14px;">กำลังคำนวณ...</div>
        </div>

        <!-- Parcels Breakdown -->
        <div class="smoky-card">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
            <div style="color: #FBBF24;">${ic('box')}</div>
            <h3 style="font-size: 1.05rem; font-weight: 700; color: #ffffff; margin: 0;">สถิติการรับพัสดุไปรษณีย์</h3>
          </div>
          <p style="color: rgba(255,255,255,0.45); font-size: 0.80rem; margin: 0 0 20px 0;">สัดส่วนพัสดุที่ส่งมอบแล้วและรอรับที่สำนักงานหอพัก</p>
          <div id="report-parcels-bars" style="display: flex; flex-direction: column; gap: 14px;">กำลังคำนวณ...</div>
        </div>

        <!-- Utilities Revenue -->
        <div class="smoky-card">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
            <div style="color: #34D399;">${ic('bill')}</div>
            <h3 style="font-size: 1.05rem; font-weight: 700; color: #ffffff; margin: 0;">การจัดเก็บรายได้ค่าน้ำ-ค่าไฟ และค่าเช่า</h3>
          </div>
          <p style="color: rgba(255,255,255,0.45); font-size: 0.80rem; margin: 0 0 20px 0;">สัดส่วนการชำระเงินของรอบบิลประจำเดือนปัจจุบัน</p>
          <div id="report-utility-bars" style="display: flex; flex-direction: column; gap: 14px;">กำลังคำนวณ...</div>
        </div>

        <!-- Maintenance Turnaround -->
        <div class="smoky-card">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
            <div style="color: #FB7185;">${ic('wrench')}</div>
            <h3 style="font-size: 1.05rem; font-weight: 700; color: #ffffff; margin: 0;">สถิติการแจ้งซ่อมบำรุง</h3>
          </div>
          <p style="color: rgba(255,255,255,0.45); font-size: 0.80rem; margin: 0 0 20px 0;">ประสิทธิภาพและความรวดเร็วในการดูแลซ่อมแซมจุดชำรุด</p>
          <div id="report-maint-bars" style="display: flex; flex-direction: column; gap: 14px;">กำลังคำนวณ...</div>
        </div>

      </div>

    </div>
  `;
}

async function loadReportsData() {
  const [
    { data: tenantsData },
    { data: parcelsData },
    { data: billsData },
    { data: ticketsData }
  ] = await Promise.all([
    supabase.from('tenants').select('*'),
    supabase.from('parcels').select('*'),
    supabase.from('meter_readings').select('*'),
    supabase.from('maintenance').select('*')
  ]);

  const tenants = Array.isArray(tenantsData) ? tenantsData.filter(t => t.status !== 'terminated') : [];
  const parcels = Array.isArray(parcelsData) ? parcelsData : [];
  const bills = Array.isArray(billsData) ? billsData : [];
  const tickets = Array.isArray(ticketsData) ? ticketsData : [];

  const totalRooms = 17;
  const occupied = tenants.length;
  const activeMaintSet = new Set();
  tickets.filter(t => t.status !== 'completed' && t.room_number).forEach(t => {
    activeMaintSet.add(t.room_number.replace(/[^0-9B]/gi, ''));
  });
  const mnt = activeMaintSet.size;
  const vac = Math.max(0, totalRooms - occupied - mnt);
  const occRate = totalRooms > 0 ? Math.round((occupied / totalRooms) * 100) : 0;

  const totalRevenue = bills.reduce((a, c) => a + (Number(c.total_price) || 0), 0);
  const paidRevenue = bills.filter(b => b.status === 'paid').reduce((a, c) => a + (Number(c.total_price) || 0), 0);
  const collectionRate = totalRevenue > 0 ? Math.round((paidRevenue / totalRevenue) * 100) : 0;

  const totalTickets = tickets.length;

  const kpiOcc = document.getElementById('kpi-rep-occ');
  const kpiRev = document.getElementById('kpi-rep-rev');
  const kpiCol = document.getElementById('kpi-rep-col');
  const kpiMaint = document.getElementById('kpi-rep-maint');

  if (kpiOcc) kpiOcc.textContent = `${occRate}%`;
  if (kpiRev) kpiRev.textContent = fmtCurrency(totalRevenue);
  if (kpiCol) kpiCol.textContent = `${collectionRate}%`;
  if (kpiMaint) kpiMaint.textContent = `${totalTickets}`;

  const btnRefresh = document.getElementById('btn-refresh-reports');
  if (btnRefresh) {
    btnRefresh.onclick = () => {
      loadReportsData();
    };
  }

  const renderBar = (label, count, total, color, colorName) => {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; margin-bottom: 7px;">
          <span style="color: rgba(255,255,255,0.85);">${label}</span>
          <span style="font-weight: 700; color: #ffffff; font-family: monospace;">${count} รายการ (${pct}%)</span>
        </div>
        <div style="background: rgba(255,255,255,0.06); border-radius: 9999px; height: 10px; overflow: hidden; border: 1px solid rgba(255,255,255,0.10); position: relative;">
          <div style="width: ${pct}%; background: ${color}; height: 100%; border-radius: 9999px; box-shadow: 0 0 10px ${color}; transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);"></div>
        </div>
      </div>
    `;
  };

  // 1. Occupancy Bars
  const occBox = document.getElementById('report-occupancy-bars');
  if (occBox) {
    occBox.innerHTML = `
      ${renderBar('มีผู้เช่าแล้ว (Occupied)', occupied, totalRooms, '#3B82F6')}
      ${renderBar('ห้องว่างพร้อมเข้าอยู่ (Vacant)', vac, totalRooms, '#34D399')}
      ${renderBar('ปิดปรับปรุง / ซ่อมบำรุง (Maintenance)', mnt, totalRooms, '#FBBF24')}
    `;
  }

  // 2. Parcels Bars
  const parcelBox = document.getElementById('report-parcels-bars');
  if (parcelBox) {
    const tot = parcels.length;
    const col = parcels.filter(p => p.status === 'collected').length;
    const wai = parcels.filter(p => p.status === 'waiting').length;
    parcelBox.innerHTML = `
      ${renderBar('รับมอบแล้วเรียบร้อย (Collected)', col, tot, '#34D399')}
      ${renderBar('รอผู้พักมารับ (Waiting)', wai, tot, '#FBBF24')}
    `;
  }

  // 3. Utilities Bars
  const utilBox = document.getElementById('report-utility-bars');
  if (utilBox) {
    const tot = bills.length;
    const paid = bills.filter(b => b.status === 'paid').length;
    const pend = bills.filter(b => b.status === 'pending').length;
    utilBox.innerHTML = `
      ${renderBar('ชำระแล้วเรียบร้อย (Paid)', paid, tot, '#34D399')}
      ${renderBar('รอชำระเงิน / ค้างชำระ (Pending)', pend, tot, '#FB7185')}
    `;
  }

  // 4. Maintenance Bars
  const maintBox = document.getElementById('report-maint-bars');
  if (maintBox) {
    const tot = tickets.length;
    const comp = tickets.filter(t => t.status === 'completed').length;
    const prog = tickets.filter(t => t.status === 'in_progress').length;
    const pend = tickets.filter(t => t.status === 'pending').length;
    maintBox.innerHTML = `
      ${renderBar('ซ่อมเสร็จสิ้น (Completed)', comp, tot, '#34D399')}
      ${renderBar('กำลังดำเนินการซ่อม (In Progress)', prog, tot, '#60A5FA')}
      ${renderBar('รอรับเรื่อง (Pending)', pend, tot, '#FBBF24')}
    `;
  }
}
