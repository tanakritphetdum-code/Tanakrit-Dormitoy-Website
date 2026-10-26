// js/reports.js
import { supabase } from './supabase.js';
import { ic, fmtCurrency } from './api.js';

export async function renderReportsView() {
  setTimeout(() => {
    loadReportsData();
  }, 0);

  return `
    <div class="card">
      <div class="card-header-actions">
        <div>
          <h3>${ic('chart')} รายงานสถิติและภาพรวมการบริหารงานหอพัก (Analytics & Reports)</h3>
          <p style="color: var(--muted); margin-top: 4px; font-size: 0.9rem;">
            วิเคราะห์อัตราการเข้าพัก การชำระเงินค่าน้ำ-ค่าไฟ และประสิทธิภาพการบริการ
          </p>
        </div>
      </div>

      <div class="stat-cards" id="reports-top-stats" style="margin-top: 20px;">
        <div class="scard"><div class="num">...</div><div class="lbl">กำลังประมวลผล...</div></div>
      </div>

      <div class="dashboard-grid-2col" style="margin-top: 24px;">
        <!-- Occupancy Breakdown -->
        <div class="card">
          <h4>${ic('door')} สัดส่วนอัตราการเข้าพักห้องพัก</h4>
          <p style="color: var(--muted); font-size: 0.85rem; margin-bottom: 20px;">การกระจายตัวของสถานะห้องพักในอาคาร</p>
          <div id="report-occupancy-bars">กำลังคำนวณ...</div>
        </div>

        <!-- Parcels Breakdown -->
        <div class="card">
          <h4>${ic('box')} สถิติการรับพัสดุไปรษณีย์</h4>
          <p style="color: var(--muted); font-size: 0.85rem; margin-bottom: 20px;">สัดส่วนพัสดุที่ส่งมอบแล้วและรอรับ</p>
          <div id="report-parcels-bars">กำลังคำนวณ...</div>
        </div>

        <!-- Utilities Revenue -->
        <div class="card">
          <h4>${ic('bill')} การจัดเก็บรายได้ค่าน้ำ-ค่าไฟ และค่าเช่า</h4>
          <p style="color: var(--muted); font-size: 0.85rem; margin-bottom: 20px;">สัดส่วนการชำระเงินของรอบบิลปัจจุบัน</p>
          <div id="report-utility-bars">กำลังคำนวณ...</div>
        </div>

        <!-- Maintenance Turnaround -->
        <div class="card">
          <h4>${ic('wrench')} สถิติการแจ้งซ่อมบำรุง</h4>
          <p style="color: var(--muted); font-size: 0.85rem; margin-bottom: 20px;">ประสิทธิภาพและความรวดเร็วในการแก้ไขปัญหา</p>
          <div id="report-maint-bars">กำลังคำนวณ...</div>
        </div>
      </div>
    </div>
  `;
}

async function loadReportsData() {
  const { data: rooms } = await supabase.from('rooms').select('*');
  const { data: parcels } = await supabase.from('parcels').select('*');
  const { data: bills } = await supabase.from('meter_readings').select('*');
  const { data: tickets } = await supabase.from('maintenance').select('*');

  const topStats = document.getElementById('reports-top-stats');
  if (topStats) {
    const totalRooms = rooms ? rooms.length : 0;
    const occupied = rooms ? rooms.filter(r => r.status === 'occupied').length : 0;
    const occRate = totalRooms > 0 ? Math.round((occupied / totalRooms) * 100) : 0;
    const totalRevenue = bills ? bills.reduce((a, c) => a + (c.total_price || 0), 0) : 0;
    const paidRevenue = bills ? bills.filter(b => b.status === 'paid').reduce((a, c) => a + (c.total_price || 0), 0) : 0;
    const collectionRate = totalRevenue > 0 ? Math.round((paidRevenue / totalRevenue) * 100) : 0;

    topStats.innerHTML = `
      <div class="scard">
        <div class="top"><div class="ic c">${ic('door')}</div></div>
        <div class="num">${occRate}%</div>
        <div class="lbl">อัตราการเข้าพักเฉลี่ย</div>
      </div>
      <div class="scard">
        <div class="top"><div class="ic a">${ic('bill')}</div></div>
        <div class="num">${fmtCurrency(totalRevenue)}</div>
        <div class="lbl">รายได้เรียกเก็บเดือนล่าสุด</div>
      </div>
      <div class="scard">
        <div class="top"><div class="ic b">${ic('check')}</div></div>
        <div class="num">${collectionRate}%</div>
        <div class="lbl">จัดเก็บรายได้สำเร็จ</div>
      </div>
      <div class="scard">
        <div class="top"><div class="ic d">${ic('wrench')}</div></div>
        <div class="num">${tickets ? tickets.length : 0}</div>
        <div class="lbl">รายการแจ้งซ่อมทั้งหมด</div>
      </div>
    `;
  }

  const renderBar = (label, count, total, color) => {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return `
      <div style="margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; font-size: 0.88rem; margin-bottom: 6px;">
          <span>${label}</span>
          <strong>${count} รายการ (${pct}%)</strong>
        </div>
        <div style="background: var(--mint-50); border-radius: 999px; height: 10px; overflow: hidden; border: 1px solid var(--line);">
          <div style="width: ${pct}%; background: ${color}; height: 100%; border-radius: 999px; transition: width 0.6s ease;"></div>
        </div>
      </div>
    `;
  };

  // Occupancy
  const occBox = document.getElementById('report-occupancy-bars');
  if (occBox && rooms) {
    const tot = rooms.length;
    const occ = rooms.filter(r => r.status === 'occupied').length;
    const vac = rooms.filter(r => r.status === 'vacant').length;
    const mnt = rooms.filter(r => r.status === 'maintenance').length;
    occBox.innerHTML = `
      ${renderBar('มีผู้เช่าแล้ว (Occupied)', occ, tot, 'var(--teal-900)')}
      ${renderBar('ห้องว่างพร้อมเข้าอยู่ (Vacant)', vac, tot, 'var(--emerald)')}
      ${renderBar('ปิดปรับปรุง / ซ่อมบำรุง (Maintenance)', mnt, tot, 'var(--sand-600)')}
    `;
  }

  // Parcels
  const parcelBox = document.getElementById('report-parcels-bars');
  if (parcelBox && parcels) {
    const tot = parcels.length || 1;
    const col = parcels.filter(p => p.status === 'collected').length;
    const wai = parcels.filter(p => p.status === 'waiting').length;
    parcelBox.innerHTML = `
      ${renderBar('รับมอบแล้วเรียบร้อย (Collected)', col, tot, 'var(--emerald)')}
      ${renderBar('รอผู้พักมารับ (Waiting)', wai, tot, 'var(--sand-600)')}
    `;
  }

  // Utilities
  const utilBox = document.getElementById('report-utility-bars');
  if (utilBox && bills) {
    const tot = bills.length || 1;
    const paid = bills.filter(b => b.status === 'paid').length;
    const pend = bills.filter(b => b.status === 'pending').length;
    utilBox.innerHTML = `
      ${renderBar('ชำระแล้วเรียบร้อย (Paid)', paid, tot, 'var(--emerald)')}
      ${renderBar('รอชำระเงิน / ค้างชำระ (Pending)', pend, tot, 'var(--danger)')}
    `;
  }

  // Maintenance
  const maintBox = document.getElementById('report-maint-bars');
  if (maintBox && tickets) {
    const tot = tickets.length || 1;
    const comp = tickets.filter(t => t.status === 'completed').length;
    const prog = tickets.filter(t => t.status === 'in_progress').length;
    const pend = tickets.filter(t => t.status === 'pending').length;
    maintBox.innerHTML = `
      ${renderBar('ซ่อมเสร็จสิ้น (Completed)', comp, tot, 'var(--emerald)')}
      ${renderBar('กำลังดำเนินการซ่อม (In Progress)', prog, tot, 'var(--sky)')}
      ${renderBar('รอรับเรื่อง (Pending)', pend, tot, 'var(--sand-600)')}
    `;
  }
}
