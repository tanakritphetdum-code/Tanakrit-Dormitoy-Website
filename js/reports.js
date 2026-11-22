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

      <!-- 4. สถิติการใช้พลังงานเชิงลึกแยก 3 อาคาร (Energy Breakdown & Anomaly Detection) -->
      <div class="smoky-card">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(245,158,11,0.15); color: #F59E0B; display: flex; align-items: center; justify-content: center;">
              ${ic('flame')}
            </div>
            <div>
              <h3 style="font-size: 1.15rem; font-weight: 700; color: #ffffff; margin: 0;">
                สถิติการใช้พลังงานและทรัพยากรแยก 3 อาคาร (Energy & Utilities Analytics)
              </h3>
              <span style="font-size: 0.78rem; color: rgba(255,255,255,0.45);">
                คำนวณการใช้น้ำประปาและกระแสไฟฟ้ารายอาคาร พร้อมระบบ AI ตรวจจับไฟฟ้ารั่วและท่อประปารั่วซึม
              </span>
            </div>
          </div>
          <span style="background: rgba(59,130,246,0.15); border: 1px solid rgba(59,130,246,0.3); color: #60A5FA; font-size: 0.75rem; font-weight: 700; padding: 4px 12px; border-radius: 9999px;">
            ⚡ 3 อาคาร 17 ห้อง
          </span>
        </div>

        <!-- 3 Buildings Energy Cards Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;" id="report-buildings-energy-grid">
          <!-- Populated via JS -->
        </div>

        <!-- Anomaly Detection Alert Strip -->
        <div id="report-energy-anomaly-box" style="margin-top: 18px;">
          <!-- Populated via JS -->
        </div>
      </div>

      <!-- 5. สรุปรายงานกำไร-ขาดทุนสุทธิรายปี (Annual Net Profit & Loss / P&L) -->
      <div class="smoky-card">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; margin-bottom: 20px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(52,211,153,0.15); color: #34D399; display: flex; align-items: center; justify-content: center;">
              ${ic('trendingUp')}
            </div>
            <div>
              <h3 style="font-size: 1.15rem; font-weight: 700; color: #ffffff; margin: 0;">
                สรุปกำไร-ขาดทุนสุทธิรายปี (Annual Net Profit & Loss / P&L)
              </h3>
              <span style="font-size: 0.78rem; color: rgba(255,255,255,0.45);">
                คำนวณรายรับค่าเช่า+สาธารณูปโภค หักลบค่าน้ำที่จ่ายจริงให้เทศบาล และค่าไฟที่จ่ายจริงให้การไฟฟ้า PEA
              </span>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 8px;">
            <label style="font-size: 0.80rem; color: rgba(255,255,255,0.6);">ประจำปีภาษี:</label>
            <select id="pnl-year-select" class="smoky-glass-select" style="height: 34px; padding: 0 12px; font-size: 0.82rem;">
              <option value="2026" selected>ปี 2026 (พ.ศ. 2569)</option>
              <option value="2025">ปี 2025 (พ.ศ. 2568)</option>
            </select>
          </div>
        </div>

        <!-- P&L KPI Strip -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 14px; margin-bottom: 20px;" id="pnl-kpi-strip">
          <!-- Populated via JS -->
        </div>

        <!-- P&L Financial Statement Table -->
        <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden;" id="pnl-statement-table">
          <!-- Populated via JS -->
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

  // 5. สถิติการใช้พลังงาน 3 อาคาร (Energy Breakdown by Building)
  const bldStats = {
    Tanakrit: { name: 'อาคาร ธนกฤษฎ์ (9 ห้อง)', rooms: ['101','102','103','104','105','106','107','108','109'], waterUnits: 0, waterCost: 0, elecUnits: 0, elecCost: 0, count: 0, color: '#34D399' },
    KingPhetch: { name: 'อาคาร กิ่งเพชร (5 ห้อง)', rooms: ['201','202','203','204','205'], waterUnits: 0, waterCost: 0, elecUnits: 0, elecCost: 0, count: 0, color: '#60A5FA' },
    UnderGround: { name: 'อาคาร ใต้บ้าน (3 ห้อง)', rooms: ['B01','B02','B03'], waterUnits: 0, waterCost: 0, elecUnits: 0, elecCost: 0, count: 0, color: '#F59E0B' }
  };

  const anomalies = [];

  bills.forEach(b => {
    const r = (b.room_number || '').trim();
    let bldKey = 'Tanakrit';
    if (r.startsWith('B') || r.startsWith('b')) {
      bldKey = 'UnderGround';
    } else if (Number(r) >= 200) {
      bldKey = 'KingPhetch';
    }

    const wU = Number(b.water_unit) || 0;
    const wC = Number(b.water_total) || (wU * 18);
    const eU = Number(b.electric_unit) || 0;
    const eC = Number(b.electric_total) || (eU * 8);

    bldStats[bldKey].waterUnits += wU;
    bldStats[bldKey].waterCost += wC;
    bldStats[bldKey].elecUnits += eU;
    bldStats[bldKey].elecCost += eC;
    bldStats[bldKey].count += 1;

    // Anomaly checks
    if (wU > 12) {
      anomalies.push({
        room: r,
        type: 'water',
        units: wU,
        msg: `ห้อง ${r} ใช้น้ำประปาสูงถึง ${wU} หน่วย (เสี่ยงท่อประปารั่วซึม หรือลูกลอยสุขภัณฑ์ค้าง)`
      });
    }
    if (eU > 180) {
      anomalies.push({
        room: r,
        type: 'electric',
        units: eU,
        msg: `ห้อง ${r} ใช้ไฟฟ้าสูงถึง ${eU} kWh (ตรวจสอบไฟฟ้ารั่ว หรือแอร์กินไฟผิดปกติ)`
      });
    }
  });

  // Render Building Energy Cards
  const energyGrid = document.getElementById('report-buildings-energy-grid');
  if (energyGrid) {
    energyGrid.innerHTML = Object.entries(bldStats).map(([key, stat]) => {
      const avgW = stat.count > 0 ? (stat.waterUnits / stat.count).toFixed(1) : '0';
      const avgE = stat.count > 0 ? (stat.elecUnits / stat.count).toFixed(1) : '0';

      return `
        <div class="smoky-tile" style="padding: 16px 18px; border-radius: 14px; border-left: 3px solid ${stat.color};">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <strong style="color: #ffffff; font-size: 0.95rem;">${stat.name}</strong>
            <span style="font-size: 0.72rem; color: ${stat.color}; font-weight: 700; background: rgba(255,255,255,0.06); padding: 2px 8px; border-radius: 9999px;">
              ${stat.rooms.length} ห้องพัก
            </span>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
            <div style="background: rgba(96,165,250,0.06); border: 1px solid rgba(96,165,250,0.18); border-radius: 10px; padding: 10px;">
              <div style="font-size: 0.72rem; color: #60A5FA; font-weight: 600;">💧 น้ำประปารวม</div>
              <div style="font-size: 1.25rem; font-weight: 700; color: #ffffff; margin-top: 3px;">
                ${stat.waterUnits.toLocaleString()} <span style="font-size: 0.75rem; color: rgba(255,255,255,0.45);">หน่วย</span>
              </div>
              <div style="font-size: 0.70rem; color: rgba(255,255,255,0.45); margin-top: 2px;">
                เฉลี่ย ${avgW} หน่วย/ห้อง
              </div>
            </div>

            <div style="background: rgba(245,158,11,0.06); border: 1px solid rgba(245,158,11,0.18); border-radius: 10px; padding: 10px;">
              <div style="font-size: 0.72rem; color: #F59E0B; font-weight: 600;">⚡ ไฟฟ้ารวม</div>
              <div style="font-size: 1.25rem; font-weight: 700; color: #ffffff; margin-top: 3px;">
                ${stat.elecUnits.toLocaleString()} <span style="font-size: 0.75rem; color: rgba(255,255,255,0.45);">kWh</span>
              </div>
              <div style="font-size: 0.70rem; color: rgba(255,255,255,0.45); margin-top: 2px;">
                เฉลี่ย ${avgE} kWh/ห้อง
              </div>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; font-size: 0.78rem; color: rgba(255,255,255,0.6); padding-top: 8px; border-top: 1px dashed rgba(255,255,255,0.08);">
            <span>ยอดเรียกเก็บสาธารณูปโภค:</span>
            <strong style="color: #ffffff;">${fmtCurrency(stat.waterCost + stat.elecCost)}</strong>
          </div>
        </div>
      `;
    }).join('');
  }

  // Render Anomaly Alert Box
  const anomalyBox = document.getElementById('report-energy-anomaly-box');
  if (anomalyBox) {
    if (anomalies.length > 0) {
      anomalyBox.innerHTML = `
        <div style="background: rgba(239, 68, 68, 0.10); border: 1.5px solid rgba(239, 68, 68, 0.35); border-radius: 12px; padding: 14px 16px;">
          <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; color: #F87171; font-size: 0.90rem; margin-bottom: 8px;">
            <span>⚠️</span> ตรวจพบความผิดปกติในการใช้พลังงาน (${anomalies.length} จุดเสี่ยง)
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            ${anomalies.map(a => `
              <div style="font-size: 0.82rem; color: rgba(255,255,255,0.85); display: flex; align-items: center; gap: 6px;">
                <span style="color: ${a.type === 'water' ? '#60A5FA' : '#F59E0B'}; font-weight: 700;">•</span>
                <span>${a.msg}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else {
      anomalyBox.innerHTML = `
        <div style="background: rgba(52, 211, 153, 0.08); border: 1px solid rgba(52, 211, 153, 0.25); border-radius: 12px; padding: 12px 16px; display: flex; align-items: center; gap: 10px;">
          <span style="color: #34D399; font-size: 1.1rem;">✓</span>
          <div style="font-size: 0.82rem; color: rgba(255,255,255,0.8);">
            <strong style="color: #34D399;">ระบบพลังงานปกติ:</strong> ตรวจสอบไม่พบการรั่วไหลของน้ำประปาหรือกระแสไฟฟ้ารั่วซึมในทั้ง 3 อาคาร (17 ห้อง)
          </div>
        </div>
      `;
    }
  }

  // 6. Annual P&L Summary
  const pnlKpiBox = document.getElementById('pnl-kpi-strip');
  const pnlTableBox = document.getElementById('pnl-statement-table');

  const calcAndRenderPnl = (year) => {
    const yearBills = bills.filter(b => (b.billing_month || '').startsWith(year));
    const activeBills = yearBills.length > 0 ? yearBills : bills;

    const rentRev = activeBills.reduce((acc, c) => acc + (Number(c.room_price) || 0), 0);
    const waterRev = activeBills.reduce((acc, c) => acc + (Number(c.water_total) || 0), 0);
    const elecRev = activeBills.reduce((acc, c) => acc + (Number(c.electric_total) || 0), 0);
    const commonRev = activeBills.reduce((acc, c) => acc + (Number(c.common_fee) || 70), 0);
    const grossRev = rentRev + waterRev + elecRev + commonRev;

    const totalWaterUnits = activeBills.reduce((acc, c) => acc + (Number(c.water_unit) || 0), 0);
    const totalElecUnits = activeBills.reduce((acc, c) => acc + (Number(c.electric_unit) || 0), 0);

    const municipalWaterCost = totalWaterUnits * 12;
    const peaElectricCost = totalElecUnits * 4.8;
    const facilityUpkeepCost = activeBills.length * 20;

    const totalOpCost = municipalWaterCost + peaElectricCost + facilityUpkeepCost;
    const netProfit = grossRev - totalOpCost;
    const profitMargin = grossRev > 0 ? ((netProfit / grossRev) * 100).toFixed(1) : '0';

    if (pnlKpiBox) {
      pnlKpiBox.innerHTML = `
        <div class="smoky-tile">
          <span class="smoky-meta-label">รายรับรวมทั้งสิ้น (Gross Revenue)</span>
          <div class="smoky-kpi-num" style="margin-top: 8px; color: #60A5FA;">${fmtCurrency(grossRev)}</div>
          <div class="smoky-kpi-sub">ค่าเช่า + น้ำไฟ + ส่วนกลาง</div>
        </div>

        <div class="smoky-tile">
          <span class="smoky-meta-label">ต้นทุนดำเนินงานจริง (OpEx)</span>
          <div class="smoky-kpi-num" style="margin-top: 8px; color: #F87171;">${fmtCurrency(totalOpCost)}</div>
          <div class="smoky-kpi-sub">จ่ายจริงให้เทศบาลและการไฟฟ้า</div>
        </div>

        <div class="smoky-tile">
          <span class="smoky-meta-label">กำไรดำเนินงานสุทธิ (NOI)</span>
          <div class="smoky-kpi-num" style="margin-top: 8px; color: #34D399;">${fmtCurrency(netProfit)}</div>
          <div class="smoky-kpi-sub">กำไรก่อนหักภาษี</div>
        </div>

        <div class="smoky-tile">
          <span class="smoky-meta-label">อัตรากำไรสุทธิ (Profit Margin)</span>
          <div class="smoky-kpi-num" style="margin-top: 8px; color: #FBBF24;">${profitMargin}%</div>
          <div class="smoky-kpi-sub">ประสิทธิภาพการทำกำไร</div>
        </div>
      `;
    }

    if (pnlTableBox) {
      pnlTableBox.innerHTML = `
        <table class="smoky-table" style="font-size: 0.84rem; margin: 0;">
          <thead>
            <tr>
              <th>หมวดหมู่ทางการเงิน (Financial Statement)</th>
              <th style="text-align: right;">รายรับ (Revenue)</th>
              <th style="text-align: right;">ต้นทุนจริง (Cost)</th>
              <th style="text-align: right;">กำไรส่วนต่าง (Net Margin)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>1. รายรับค่าเช่าห้องพัก (Room Rental Income)</strong></td>
              <td style="text-align: right; color: #34D399; font-weight: 700;">${fmtCurrency(rentRev)}</td>
              <td style="text-align: right; color: rgba(255,255,255,0.4);">-</td>
              <td style="text-align: right; font-weight: 700; color: #34D399;">${fmtCurrency(rentRev)}</td>
            </tr>
            <tr>
              <td><strong>2. ค่าน้ำประปา (${totalWaterUnits} หน่วย @ 18฿ vs ส่งเทศบาล @ 12฿)</strong></td>
              <td style="text-align: right; color: #60A5FA;">${fmtCurrency(waterRev)}</td>
              <td style="text-align: right; color: #F87171;">-${fmtCurrency(municipalWaterCost)}</td>
              <td style="text-align: right; font-weight: 700; color: #34D399;">+${fmtCurrency(waterRev - municipalWaterCost)}</td>
            </tr>
            <tr>
              <td><strong>3. ค่าไฟฟ้า (${totalElecUnits} kWh @ 8฿ vs ส่ง PEA @ 4.8฿)</strong></td>
              <td style="text-align: right; color: #F59E0B;">${fmtCurrency(elecRev)}</td>
              <td style="text-align: right; color: #F87171;">-${fmtCurrency(peaElectricCost)}</td>
              <td style="text-align: right; font-weight: 700; color: #34D399;">+${fmtCurrency(elecRev - peaElectricCost)}</td>
            </tr>
            <tr>
              <td><strong>4. ค่าบริการส่วนกลาง & กำจัดขยะ (50฿ + 20฿)</strong></td>
              <td style="text-align: right; color: rgba(255,255,255,0.85);">${fmtCurrency(commonRev)}</td>
              <td style="text-align: right; color: #F87171;">-${fmtCurrency(facilityUpkeepCost)}</td>
              <td style="text-align: right; font-weight: 700; color: #34D399;">+${fmtCurrency(commonRev - facilityUpkeepCost)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr style="background: rgba(255,255,255,0.05); border-top: 1.5px solid rgba(255,255,255,0.15);">
              <td style="font-weight: 700; font-size: 0.95rem; color: #ffffff;">กำไรสุทธิจากการดำเนินงาน (Net Operating Income)</td>
              <td style="text-align: right; font-weight: 700; color: #60A5FA;">${fmtCurrency(grossRev)}</td>
              <td style="text-align: right; font-weight: 700; color: #F87171;">-${fmtCurrency(totalOpCost)}</td>
              <td style="text-align: right; font-weight: 800; font-size: 1.15rem; color: #34D399;">${fmtCurrency(netProfit)}</td>
            </tr>
          </tfoot>
        </table>
      `;
    }
  };

  const pnlSelect = document.getElementById('pnl-year-select');
  if (pnlSelect) {
    calcAndRenderPnl(pnlSelect.value);
    pnlSelect.onchange = () => calcAndRenderPnl(pnlSelect.value);
  } else {
    calcAndRenderPnl('2026');
  }
}
