// js/utilities.js
// ระบบบันทึกมิเตอร์น้ำ-ไฟ และออกใบแจ้งหนี้ (Billing & Utilities)
// ออกแบบด้วย Smoky Frosted Glass Design System
import { supabase } from './supabase.js';
import { ic, fmtCurrency, fmtDate, showModal, closeModal, toast, compressImage, showImageModal } from './api.js';
import { currentUser } from './auth.js';
import { DEFAULT_ROOMS } from './rooms.js';

let utilityStatusFilter = 'all';
let utilitySearchQuery = '';

export async function renderUtilitiesView() {
  setTimeout(() => {
    bindUtilitiesEvents();
    loadUtilitiesData();
  }, 0);

  return `
    <div style="display: flex; flex-direction: column; gap: 22px;">
      
      <!-- 1. Header Card (Smoky Glass) -->
      <div class="smoky-card" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(59,130,246,0.18); border: 1px solid rgba(59,130,246,0.32); display: flex; align-items: center; justify-content: center; color: #3B82F6;">
            ${ic('bill')}
          </div>
          <div>
            <h2 style="font-size: 1.35rem; font-weight: 700; color: #ffffff; margin: 0; letter-spacing: -0.02em;">
              ระบบบันทึกมิเตอร์น้ำ-ไฟ และออกใบแจ้งหนี้ (Billing & Utilities)
            </h2>
            <span style="font-size: 0.82rem; color: rgba(255,255,255,0.48); margin-top: 3px; display: block;">
              ค่าน้ำประปา (18 ฿/หน่วย) · ค่าไฟฟ้า (8 ฿/หน่วย) · ค่าบริการส่วนกลาง 100 ฿ · Wi-Fi 100 ฿ · ขยะ 20 ฿ · QR สแกนจ่าย
            </span>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <button class="smoky-round-glass-btn" id="btn-add-meter" style="width: auto; border-radius: 9999px; padding: 0 18px; height: 38px; background: #3B82F6; color: #ffffff; border: 1px solid rgba(59,130,246,0.5); box-shadow: 0 0 20px rgba(59,130,246,0.4); font-size: 0.82rem; font-weight: 600; gap: 6px;">
            ${ic('plus')}
            <span>จดมิเตอร์รอบใหม่</span>
          </button>
        </div>
      </div>

      <!-- 2. KPI Summary Tiles (Smoky Glass) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 16px;" id="utility-summary-stats">
        <!-- populated via JS -->
      </div>

      <!-- 3. Filters & Search Toolbar (Smoky Glass) -->
      <div class="smoky-card" style="padding: 16px 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
          
          <!-- Search Box -->
          <div style="position: relative; min-width: 240px; flex: 1; max-width: 320px;">
            <span style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.4); display: flex; align-items: center;">
              ${ic('search')}
            </span>
            <input type="text" id="utility-search-input" class="smoky-glass-input" placeholder="ค้นหาเลขห้อง หรือชื่อผู้เช่า..." style="width: 100%; padding-left: 38px;">
          </div>

          <!-- Status Filter Tabs (Segmented Control) -->
          <div class="smoky-segmented" id="utility-status-tabs" style="overflow-x: auto; max-width: 100%;">
            <button class="smoky-seg-btn active" data-status="all">ทั้งหมด</button>
            <button class="smoky-seg-btn" data-status="pending">รอชำระเงิน</button>
            <button class="smoky-seg-btn" data-status="verifying" style="color: #F59E0B;">รอตรวจสลิป ⏳</button>
            <button class="smoky-seg-btn" data-status="paid" style="color: #34D399;">ชำระแล้ว</button>
          </div>

          <!-- Refresh Action -->
          <div>
            <button class="smoky-round-glass-btn" id="btn-refresh-utilities" style="width: auto; height: 36px; padding: 0 16px; border-radius: 9999px; font-size: 0.80rem; gap: 6px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);">
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
              <th>เลขที่บิล / ห้องพัก</th>
              <th>รอบประจำเดือน</th>
              <th>ค่าน้ำประปา (18฿/หน่วย)</th>
              <th>ค่าไฟฟ้า (8฿/หน่วย)</th>
              <th>ค่าส่วนกลาง & สัญญา</th>
              <th>ยอดรวมทั้งสิ้น</th>
              <th>สถานะการชำระ</th>
              <th style="text-align: right; padding-right: 22px; width: 170px;">จัดการบิล</th>
            </tr>
          </thead>
          <tbody id="utilities-tbody">
            <tr><td colspan="8" style="text-align:center; padding: 40px; color: rgba(255,255,255,0.4);">กำลังโหลดข้อมูลค่าน้ำ-ค่าไฟ...</td></tr>
          </tbody>
        </table>
      </div>

    </div>
  `;
}

async function loadUtilitiesData() {
  const tbody = document.getElementById('utilities-tbody');
  const summaryBox = document.getElementById('utility-summary-stats');
  if (!tbody) return;

  const { data: readings, error } = await supabase
    .from('meter_readings')
    .select('*')
    .order('billing_month', { ascending: false });

  if (error || !readings) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:#F87171; padding: 30px;">ไม่สามารถโหลดข้อมูลค่าน้ำ-ค่าไฟได้</td></tr>`;
    return;
  }

  // Summary counters
  const totalBills = readings.length;
  const pendingBills = readings.filter(r => r.status === 'pending');
  const verifyingBills = readings.filter(r => r.status === 'verifying');
  const paidBills = readings.filter(r => r.status === 'paid');
  const totalRevenue = readings.reduce((acc, cur) => acc + (cur.total_price || 0), 0);
  const pendingAmount = pendingBills.reduce((acc, cur) => acc + (cur.total_price || 0), 0);

  if (summaryBox) {
    summaryBox.innerHTML = `
      <div class="smoky-tile" style="padding: 16px 18px; border-radius: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="smoky-meta-label">ยอดเรียกเก็บรวม</span>
          <div style="width: 28px; height: 28px; border-radius: 8px; background: rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.85);">
            ${ic('bill')}
          </div>
        </div>
        <div style="margin-top: 8px; display: flex; align-items: baseline; gap: 8px;">
          <span class="smoky-kpi-num" style="font-size: 1.65rem; color: #ffffff;">${fmtCurrency(totalRevenue)}</span>
          <span style="font-size: 0.76rem; color: rgba(255,255,255,0.45);">${totalBills} บิล</span>
        </div>
      </div>

      <div class="smoky-tile" style="padding: 16px 18px; border-radius: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="smoky-meta-label">รอชำระเงิน</span>
          <span class="smoky-delta-neg" style="font-size: 0.70rem;">${pendingBills.length} บิล</span>
        </div>
        <div style="margin-top: 8px; display: flex; align-items: baseline; gap: 8px;">
          <span class="smoky-kpi-num" style="font-size: 1.65rem; color: #F87171;">${fmtCurrency(pendingAmount)}</span>
          <span style="font-size: 0.76rem; color: rgba(255,255,255,0.45);">ค้างชำระ</span>
        </div>
      </div>

      <div class="smoky-tile" style="padding: 16px 18px; border-radius: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="smoky-meta-label">รอตรวจสลิปโอน</span>
          <span style="background: rgba(245,158,11,0.18); color: #F59E0B; font-size: 0.65rem; font-weight: 700; padding: 2px 7px; border-radius: 9999px;">ตรวจสอบ</span>
        </div>
        <div style="margin-top: 8px; display: flex; align-items: baseline; gap: 8px;">
          <span class="smoky-kpi-num" style="font-size: 1.65rem; color: #F59E0B;">${verifyingBills.length}</span>
          <span style="font-size: 0.76rem; color: rgba(255,255,255,0.45);">สลิปแนบใหม่</span>
        </div>
      </div>

      <div class="smoky-tile" style="padding: 16px 18px; border-radius: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="smoky-meta-label">ชำระแล้วเรียบร้อย</span>
          <span class="smoky-delta-pos" style="font-size: 0.70rem;">เสร็จสิ้น</span>
        </div>
        <div style="margin-top: 8px; display: flex; align-items: baseline; gap: 8px;">
          <span class="smoky-kpi-num" style="font-size: 1.65rem; color: #34D399;">${paidBills.length}</span>
          <span style="font-size: 0.76rem; color: rgba(255,255,255,0.45);">บิลรับชำระแล้ว</span>
        </div>
      </div>
    `;
  }

  let filtered = readings;
  if (utilityStatusFilter !== 'all') {
    filtered = filtered.filter(r => r.status === utilityStatusFilter);
  }

  if (utilitySearchQuery) {
    const q = utilitySearchQuery.toLowerCase();
    filtered = filtered.filter(r => 
      (r.room_number || '').toLowerCase().includes(q) ||
      (r.tenant_name || '').toLowerCase().includes(q) ||
      (r.id || '').toLowerCase().includes(q)
    );
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 40px; color:rgba(255,255,255,0.4);">ไม่มีรายการบิลตามเงื่อนไขที่เลือก</td></tr>`;
    return;
  }

  let html = '';
  filtered.forEach(r => {
    const isPaid = r.status === 'paid';
    const isVerifying = r.status === 'verifying';
    
    let statusBadgeBg = 'rgba(248,113,113,0.16)';
    let statusBadgeColor = '#F87171';
    let statusBadgeBorder = 'rgba(248,113,113,0.30)';
    let statusBadgeText = 'รอชำระ';

    if (isPaid) {
      statusBadgeBg = 'rgba(52,211,153,0.16)';
      statusBadgeColor = '#34D399';
      statusBadgeBorder = 'rgba(52,211,153,0.30)';
      statusBadgeText = '✓ ชำระแล้ว';
    } else if (isVerifying) {
      statusBadgeBg = 'rgba(245,158,11,0.16)';
      statusBadgeColor = '#F59E0B';
      statusBadgeBorder = 'rgba(245,158,11,0.30)';
      statusBadgeText = '⏳ รอตรวจสลิป';
    }

    const roomNum = r.room_number || '';
    let bldName = 'อาคาร ธนกฤษฎ์';
    let bldColor = '#34D399';
    if (roomNum.startsWith('B')) {
      bldName = 'อาคาร ใต้บ้าน';
      bldColor = '#F59E0B';
    } else if (Number(roomNum) >= 200) {
      bldName = 'อาคาร กิ่งเพชร';
      bldColor = '#60A5FA';
    }

    html += `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 34px; height: 34px; border-radius: 9px; background: rgba(59,130,246,0.18); color: #3B82F6; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 700; border: 1px solid rgba(59,130,246,0.25);">
              ${r.room_number}
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="font-weight: 700; color: #ffffff; font-size: 0.90rem;">ห้อง ${r.room_number}</span>
                <span style="font-size: 0.65rem; color: ${bldColor}; font-weight: 600;">(${bldName})</span>
              </div>
              <small style="color: rgba(255,255,255,0.45); font-size: 0.72rem;">${r.tenant_name || '-'} · ${r.id}</small>
            </div>
          </div>
        </td>
        <td>
          <div style="font-weight: 600; color: #ffffff;">${r.month_label || r.billing_month}</div>
          <small style="color: rgba(255,255,255,0.45); font-size: 0.72rem;">ครบกำหนด: ${fmtDate(r.due_date)}</small>
        </td>
        <td>
          <div style="font-weight: 600; color: rgba(255,255,255,0.9);">${r.water_unit || 0} หน่วย <span style="font-size: 0.72rem; color: rgba(255,255,255,0.4);">(${r.prev_water}➔${r.curr_water})</span></div>
          <small style="color: #60A5FA; font-weight: 600;">${fmtCurrency(r.water_total || (r.water_unit * 18))}</small>
        </td>
        <td>
          <div style="font-weight: 600; color: rgba(255,255,255,0.9);">${r.electric_unit || 0} หน่วย <span style="font-size: 0.72rem; color: rgba(255,255,255,0.4);">(${r.prev_electric}➔${r.curr_electric})</span></div>
          <small style="color: #F59E0B; font-weight: 600;">${fmtCurrency(r.electric_total || (r.electric_unit * 8))}</small>
        </td>
        <td>
          <div style="font-size: 0.82rem; color: rgba(255,255,255,0.85); font-weight: 600;">220 ฿</div>
          <small style="color: rgba(255,255,255,0.4); font-size: 0.68rem;">ส่วนกลาง 100 + wifi 100 + ขยะ 20</small>
        </td>
        <td>
          <strong style="color: #ffffff; font-size: 1.05rem; letter-spacing: -0.01em;">${fmtCurrency(r.total_price)}</strong>
        </td>
        <td>
          <span style="background: ${statusBadgeBg}; color: ${statusBadgeColor}; border: 1px solid ${statusBadgeBorder}; font-size: 0.70rem; font-weight: 700; padding: 4px 10px; border-radius: 9999px; display: inline-flex; align-items: center; gap: 5px; white-space: nowrap;">
            <span style="width: 6px; height: 6px; border-radius: 50%; background: ${statusBadgeColor};"></span>
            ${statusBadgeText}
          </span>
        </td>
        <td style="text-align: right; padding-right: 22px;">
          <div style="display: inline-flex; gap: 8px; align-items: center; justify-content: flex-end;">
            ${isVerifying ? `
              <button class="smoky-round-glass-btn btn-view-invoice" data-id="${r.id}" style="width: auto; height: 32px; padding: 0 12px; border-radius: 8px; background: rgba(245,158,11,0.25); border: 1px solid rgba(245,158,11,0.45); color: #F59E0B; font-size: 0.75rem; font-weight: 600; gap: 5px;" title="ตรวจสอบสลิปโอนเงิน">
                ${ic('eye')} <span>ตรวจสลิป</span>
              </button>
            ` : `
              <button class="smoky-round-glass-btn btn-view-invoice" data-id="${r.id}" style="width: auto; height: 32px; padding: 0 12px; border-radius: 8px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.14); color: #ffffff; font-size: 0.75rem; font-weight: 600; gap: 5px;" title="เปิดดูใบแจ้งหนี้ / สแกนจ่าย">
                ${ic('bill')} <span>ใบแจ้งหนี้</span>
              </button>
            `}
            ${r.slip_url ? `
              <img src="${r.slip_url}" class="img-thumb-preview" alt="สลิป" onclick="event.stopPropagation(); window.showImageModal('${r.slip_url}', 'สลิปโอนเงิน ห้อง ${r.room_number}')" title="คลิกดูสลิปขนาดเต็ม" style="width: 32px; height: 32px; border-radius: 8px; object-fit: cover; border: 1px solid rgba(255,255,255,0.2); cursor: pointer;">
            ` : ''}
            <button class="smoky-round-glass-btn btn-toggle-pay" data-id="${r.id}" style="width: 32px; height: 32px; border-radius: 8px; background: ${isPaid ? 'rgba(255,255,255,0.06)' : 'rgba(52,211,153,0.22)'}; border: 1px solid ${isPaid ? 'rgba(255,255,255,0.12)' : 'rgba(52,211,153,0.4)'}; color: ${isPaid ? 'rgba(255,255,255,0.5)' : '#34D399'};" title="${isPaid ? 'เปลี่ยนเป็นยังไม่ชำระ' : 'ยืนยันรับชำระเงิน'}">
              ${isPaid ? ic('x') : ic('check')}
            </button>
            <button class="smoky-round-glass-btn btn-del-bill" data-id="${r.id}" style="width: 32px; height: 32px; padding: 0; border-radius: 8px; color: #FB7185; border-color: rgba(244, 63, 94, 0.3); background: rgba(244, 63, 94, 0.1);" title="ลบใบแจ้งหนี้">
              ${ic('trash')}
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;

  // View Invoice
  tbody.querySelectorAll('.btn-view-invoice').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      const target = readings.find(x => x.id === id);
      if (target) openInvoiceModal(target);
    };
  });

  // Toggle Payment
  tbody.querySelectorAll('.btn-toggle-pay').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id');
      const target = readings.find(x => x.id === id);
      if (!target) return;
      const nextStatus = target.status === 'paid' ? 'pending' : 'paid';
      await supabase.from('meter_readings').eq('id', id).update({ status: nextStatus });
      toast(`เปลี่ยนสถานะบิล ${target.id} เป็น "${nextStatus === 'paid' ? 'ชำระแล้ว' : 'รอชำระ'}"`, 'success');
      loadUtilitiesData();
    };
  });

  // Delete Bill
  tbody.querySelectorAll('.btn-del-bill').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id');
      const target = readings.find(x => x.id === id);
      if (!target) return;
      if (confirm(`คุณต้องการลบใบแจ้งหนี้ "${target.id}" (ห้อง ${target.room_number}) ออกจากระบบใช่หรือไม่?`)) {
        const { error } = await supabase.from('meter_readings').eq('id', id).delete();
        if (error) {
          toast('เกิดข้อผิดพลาดในการลบบิล', 'error');
          return;
        }
        toast(`ลบใบแจ้งหนี้ ${target.id} เรียบร้อยแล้ว`, 'success');
        loadUtilitiesData();
      }
    };
  });
}

function bindUtilitiesEvents() {
  const tabs = document.getElementById('utility-status-tabs');
  if (tabs) {
    tabs.querySelectorAll('.smoky-seg-btn').forEach(btn => {
      btn.onclick = () => {
        tabs.querySelectorAll('.smoky-seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        utilityStatusFilter = btn.getAttribute('data-status');
        loadUtilitiesData();
      };
    });
  }

  const searchInput = document.getElementById('utility-search-input');
  if (searchInput) {
    searchInput.oninput = (e) => {
      utilitySearchQuery = e.target.value.trim().toLowerCase();
      loadUtilitiesData();
    };
  }

  const btnAdd = document.getElementById('btn-add-meter');
  if (btnAdd) btnAdd.onclick = openAddMeterModal;

  const btnRefresh = document.getElementById('btn-refresh-utilities');
  if (btnRefresh) btnRefresh.onclick = () => {
    toast('รีเฟรชข้อมูลค่าน้ำ-ค่าไฟเรียบร้อย', 'info');
    loadUtilitiesData();
  };
}

// Modal ใบแจ้งหนี้และ QR Code สแกนจ่าย
export function openInvoiceModal(bill) {
  const isPaid = bill.status === 'paid';
  const isVerifying = bill.status === 'verifying';
  const isAdminOrStaff = currentUser && (currentUser.role === 'admin' || currentUser.role === 'staff');
  const qrMockUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=PROMPTPAY-0869461654-AMOUNT-${bill.total_price}`;

  let statusBadgeHtml = '<div class="invoice-badge unpaid">รอชำระเงิน</div>';
  if (isPaid) {
    statusBadgeHtml = '<div class="invoice-badge paid">✓ ชำระเงินแล้ว</div>';
  } else if (isVerifying) {
    statusBadgeHtml = '<div class="invoice-badge" style="background:#FFF3E0; color:#E65100; border:1px solid #FFE0B2;">⏳ รอตรวจสลิป</div>';
  }

  const body = `
    <div class="invoice-container" id="printable-invoice">
      <div class="invoice-header">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div style="font-family:'Kanit'; font-size: 1.4rem; font-weight: 700; color: var(--teal-950);">
              Tanakrit Dormitory
            </div>
            <div style="font-size: 0.85rem; color: var(--muted);">หอพักชายธนกฤษฎ์ นครศรีธรรมราช (3 อาคาร 17 ห้อง)</div>
            <div style="font-size: 0.8rem; color: var(--muted);">ใกล้มหาวิทยาลัยวลัยลักษณ์ ทอนหงส์ อ.พรหมคีรี จ.นครศรีธรรมราช โทร. 086-946-1654</div>
          </div>
          <div style="text-align: right;">
            ${statusBadgeHtml}
            <div style="font-size: 0.85rem; margin-top: 6px; color: var(--muted);">เลขที่: <strong>${bill.id}</strong></div>
            <div style="font-size: 0.85rem; color: var(--muted);">รอบบิล: <strong>${bill.month_label || bill.billing_month}</strong></div>
          </div>
        </div>
      </div>

      <div class="invoice-tenant-strip">
        <div>
          <span class="lbl">ผู้พักอาศัย / ห้อง:</span>
          <strong>ห้อง ${bill.room_number} - ${bill.tenant_name || 'ไม่ระบุชื่อ'}</strong>
        </div>
        <div>
          <span class="lbl">กำหนดชำระภายใน:</span>
          <strong style="color: ${isPaid ? 'var(--emerald)' : 'var(--danger)'};">${fmtDate(bill.due_date)}</strong>
        </div>
      </div>

      <table class="invoice-items-table">
        <thead>
          <tr>
            <th>รายการ</th>
            <th style="text-align: center;">มิเตอร์ก่อนหน้า - ปัจจุบัน</th>
            <th style="text-align: center;">หน่วยที่ใช้</th>
            <th style="text-align: right;">ราคา/หน่วย</th>
            <th style="text-align: right;">รวมเป็นเงิน</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>ค่าเช่าห้องพักประจำเดือน (สัญญา 12 เดือน)</strong></td>
            <td style="text-align: center;">-</td>
            <td style="text-align: center;">1 เดือน</td>
            <td style="text-align: right;">${fmtCurrency(bill.room_price)}</td>
            <td style="text-align: right;"><strong>${fmtCurrency(bill.room_price)}</strong></td>
          </tr>
          <tr>
            <td>ค่าน้ำประปา</td>
            <td style="text-align: center;">${bill.prev_water} ➔ ${bill.curr_water}</td>
            <td style="text-align: center;">${bill.water_unit} หน่วย</td>
            <td style="text-align: right;">${bill.water_rate || 18} ฿</td>
            <td style="text-align: right;">${fmtCurrency(bill.water_total)}</td>
          </tr>
          <tr>
            <td>ค่ากระแสไฟฟ้า</td>
            <td style="text-align: center;">${bill.prev_electric} ➔ ${bill.curr_electric}</td>
            <td style="text-align: center;">${bill.electric_unit} หน่วย</td>
            <td style="text-align: right;">${bill.electric_rate || 8} ฿</td>
            <td style="text-align: right;">${fmtCurrency(bill.electric_total)}</td>
          </tr>
          <tr>
            <td>ค่าบริการส่วนกลาง</td>
            <td style="text-align: center;">-</td>
            <td style="text-align: center;">1 เดือน</td>
            <td style="text-align: right;">100 ฿</td>
            <td style="text-align: right;">100 ฿</td>
          </tr>
          <tr>
            <td>ค่าบริการ Wi-Fi ความเร็วสูง</td>
            <td style="text-align: center;">-</td>
            <td style="text-align: center;">1 เดือน</td>
            <td style="text-align: right;">100 ฿</td>
            <td style="text-align: right;">100 ฿</td>
          </tr>
          <tr>
            <td>ค่าบริการกำจัดขยะ</td>
            <td style="text-align: center;">-</td>
            <td style="text-align: center;">1 เดือน</td>
            <td style="text-align: right;">20 ฿</td>
            <td style="text-align: right;">20 ฿</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td colspan="4" style="text-align: right; font-weight: 700; font-size: 1.1rem; color: var(--teal-950);">
              ยอดชำระทั้งสิ้น:
            </td>
            <td style="text-align: right; font-weight: 700; font-size: 1.25rem; color: var(--teal-900);">
              ${fmtCurrency(bill.total_price)}
            </td>
          </tr>
        </tfoot>
      </table>

      <!-- กล่องสถานะสลิปที่แนบแล้ว (ถ้ามี) -->
      ${isVerifying ? `
        <div style="background:#FFF9E6; border:1.5px solid #FFC107; border-radius:12px; padding:16px; margin-top:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:12px;">
            <div>
              <div style="font-weight:700; color:#E65100; font-size:1.02rem;">
                ⏳ มีการแนบสลิปแล้ว — อยู่ระหว่างรอเจ้าหน้าที่ตรวจสอบ
              </div>
              <div style="font-size:0.85rem; color:var(--muted); margin-top:4px;">
                แนบเมื่อ: ${fmtDate(bill.slip_uploaded_at || bill.created_at)}
                ${bill.payment_notes ? `<br>หมายเหตุจากผู้โอน: <strong>${bill.payment_notes}</strong>` : ''}
              </div>
            </div>
            ${bill.slip_url ? `
              <img src="${bill.slip_url}" class="img-thumb-preview" alt="สลิป" onclick="window.showImageModal('${bill.slip_url}', 'สลิปโอนเงิน ห้อง ${bill.room_number}')" title="คลิกดูสลิปขนาดเต็ม" style="width:72px; height:72px;">
            ` : ''}
          </div>
          ${isAdminOrStaff ? `
            <div style="display:flex; gap:10px; margin-top:14px; padding-top:12px; border-top:1px dashed #FFE082;">
              <button type="button" class="btn btn-primary" id="btn-approve-slip" style="flex:1;">
                ${ic('check')} ✅ อนุมัติการชำระเงิน (ออกใบเสร็จ)
              </button>
              <button type="button" class="btn btn-outline" id="btn-reject-slip" style="color:var(--danger); border-color:#fadbd8;">
                ${ic('x')} ❌ ปฏิเสธสลิป / แจ้งโอนใหม่
              </button>
            </div>
          ` : ''}
        </div>
      ` : ''}

      <!-- ส่วนชำระเงิน และแนบสลิปโอนเงิน -->
      ${!isPaid ? `
        <div class="qr-payment-box" style="margin-top:20px;">
          <div style="flex: 1;">
            <div style="font-weight: 600; color: var(--teal-950); margin-bottom: 6px; font-size: 1rem;">
              📱 สแกนจ่ายผ่าน Thai QR PromptPay
            </div>
            <p style="font-size: 0.85rem; color: var(--muted); margin: 0 0 8px 0; line-height: 1.5;">
              รองรับทุกแอปพลิเคชันธนาคาร (พร้อมเพย์: 086-946-1654 นายเกียรติศักดิ์ บริหาร)<br>
              เมื่อโอนชำระเรียบรวย สามารถแนบสลิปด้านล่างเพื่อให้เจ้าหน้าที่อนุมัติทันที
            </p>
          </div>
          <div style="text-align: center;">
            <img src="${qrMockUrl}" alt="PromptPay QR Code" class="qr-img">
            <div style="font-size: 0.75rem; color: var(--muted); margin-top: 4px;">สแกนเพื่อจ่ายเงิน</div>
          </div>
        </div>

        <!-- ฟอร์มอัปโหลดสลิป -->
        <div style="margin-top:18px; background:#FAFDFB; border:1.5px solid var(--line); border-radius:12px; padding:18px;">
          <h4 style="margin:0 0 8px 0; color:var(--teal-950); display:flex; align-items:center; gap:8px;">
            ${ic('image')} แนบสลิปหลักฐานการโอนเงิน (Upload Payment Slip)
          </h4>
          <p style="font-size:0.85rem; color:var(--muted); margin:0 0 14px 0;">
            คลิกกล่องด้านล่างเพื่อเลือกรูปสลิปจากเครื่อง หรือถ่ายรูปสลิป
          </p>

          <input type="file" id="slip-file-input" accept="image/*" style="display:none;">

          <div class="upload-dropzone" id="slip-dropzone">
            <div id="slip-dropzone-content">
              <div style="font-size:2rem; margin-bottom:4px;">📸</div>
              <div style="font-weight:600; color:var(--teal-950); font-size:0.95rem;">คลิกเพื่อเลือกไฟล์รูปภาพสลิป</div>
              <div style="font-size:0.8rem; color:var(--muted); margin-top:4px;">รองรับ JPG, PNG, WEBP (ระบบบีบอัดขนาดให้อัตโนมัติ)</div>
            </div>
            <div id="slip-preview-wrap" style="display:none; align-items:center; justify-content:center; gap:14px;">
              <img id="slip-preview-img" style="max-height:120px; border-radius:8px; border:1px solid var(--line); box-shadow:0 2px 8px rgba(0,0,0,0.1);">
              <div>
                <div id="slip-filename" style="font-size:0.85rem; font-weight:600; color:var(--teal-950); margin-bottom:6px;"></div>
                <button type="button" class="btn btn-outline btn-sm" id="btn-change-slip">เปลี่ยนรูปภาพ</button>
              </div>
            </div>
          </div>

          <div class="field" style="margin-top:12px;">
            <label style="font-size:0.85rem;">หมายเหตุเพิ่มเติม (ถ้ามี เช่น เวลาที่โอน หรือชื่อธนาคาร)</label>
            <input type="text" id="slip-notes-input" placeholder="เช่น โอนจาก SCB เวลา 09:45 น.">
          </div>

          <button type="button" class="btn btn-primary" id="btn-submit-slip" style="width:100%; margin-top:14px;" disabled>
            🚀 ส่งหลักฐานการชำระเงินให้เจ้าหน้าที่
          </button>
        </div>
      ` : `
        <div style="background: var(--mint-50); border: 1.5px solid var(--emerald); border-radius: 12px; padding: 16px; margin-top: 20px;">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:12px;">
            <div>
              <div style="color: var(--emerald); font-weight: 600; font-size: 1.1rem;">
                ✓ ได้รับการชำระเงินเรียบร้อยแล้ว
              </div>
              <div style="font-size: 0.85rem; color: var(--muted); margin-top: 4px;">
                ขอบคุณที่ชำระค่าบริการตรงเวลา ออกใบเสร็จโดย Tanakrit Dormitory System
              </div>
            </div>
            ${bill.slip_url ? `
              <img src="${bill.slip_url}" class="img-thumb-preview" alt="สลิป" onclick="window.showImageModal('${bill.slip_url}', 'สลิปการชำระเงิน ห้อง ${bill.room_number}')" title="คลิกดูสลิปที่แนบไว้" style="width:64px; height:64px;">
            ` : ''}
          </div>
        </div>
      `}
    </div>
  `;

  const footer = `
    <button type="button" class="btn btn-outline" id="btn-modal-del-bill" style="color:var(--danger); border-color:#fadbd8; margin-right:auto;">${ic('trash')} ลบบิลนี้</button>
    <button type="button" class="btn btn-outline" onclick="window.printInvoice()">${ic('printer')} พิมพ์ใบแจ้งหนี้ / ใบเสร็จ</button>
    <button type="button" class="btn btn-primary" onclick="window.closeAppModal()">ปิด</button>
  `;

  showModal({
    title: `ใบแจ้งหนี้ค่าเช่าและสาธารณูปโภค — ห้อง ${bill.room_number}`,
    body,
    footer,
    maxWidth: '640px'
  });

  const btnModalDel = document.getElementById('btn-modal-del-bill');
  if (btnModalDel) {
    btnModalDel.onclick = async () => {
      if (confirm(`คุณต้องการลบใบแจ้งหนี้ "${bill.id}" (ห้อง ${bill.room_number}) ออกจากระบบใช่หรือไม่?`)) {
        const { error } = await supabase.from('meter_readings').eq('id', bill.id).delete();
        if (error) {
          toast('เกิดข้อผิดพลาดในการลบบิล', 'error');
          return;
        }
        toast(`ลบใบแจ้งหนี้ ${bill.id} เรียบร้อยแล้ว`, 'success');
        closeModal();
        if (typeof loadUtilitiesData === 'function') loadUtilitiesData();
      }
    };
  }

  // Bind Events สำหรับอัปโหลดสลิป
  let selectedSlipFile = null;
  const dropzone = document.getElementById('slip-dropzone');
  const fileInput = document.getElementById('slip-file-input');
  const dropzoneContent = document.getElementById('slip-dropzone-content');
  const previewWrap = document.getElementById('slip-preview-wrap');
  const previewImg = document.getElementById('slip-preview-img');
  const filenameEl = document.getElementById('slip-filename');
  const btnSubmitSlip = document.getElementById('btn-submit-slip');
  const btnChangeSlip = document.getElementById('btn-change-slip');

  if (dropzone && fileInput) {
    dropzone.onclick = () => fileInput.click();
    if (btnChangeSlip) {
      btnChangeSlip.onclick = (e) => {
        e.stopPropagation();
        fileInput.click();
      };
    }

    fileInput.onchange = (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      selectedSlipFile = file;

      const objUrl = URL.createObjectURL(file);
      previewImg.src = objUrl;
      filenameEl.textContent = file.name;
      dropzoneContent.style.display = 'none';
      previewWrap.style.display = 'flex';
      btnSubmitSlip.disabled = false;
    };
  }

  if (btnSubmitSlip) {
    btnSubmitSlip.onclick = async () => {
      if (!selectedSlipFile) {
        toast('กรุณาเลือกไฟล์สลิปก่อนส่ง', 'error');
        return;
      }

      btnSubmitSlip.disabled = true;
      btnSubmitSlip.textContent = '⏳ กำลังประมวลผลรูปภาพและส่งสลิป...';

      try {
        const dataUrl = await compressImage(selectedSlipFile, 1200, 0.85);
        const notes = document.getElementById('slip-notes-input').value.trim();

        await supabase.from('meter_readings').eq('id', bill.id).update({
          status: 'verifying',
          slip_url: dataUrl,
          slip_uploaded_at: new Date().toISOString(),
          payment_notes: notes
        });

        toast('ส่งหลักฐานสลิปโอนเงินเรียบร้อยแล้ว รอเจ้าหน้าที่ตรวจสอบ', 'success');
        closeModal();
        loadUtilitiesData();
      } catch (err) {
        toast('เกิดข้อผิดพลาดในการอัปโหลด: ' + err.message, 'error');
        btnSubmitSlip.disabled = false;
        btnSubmitSlip.textContent = '🚀 ส่งหลักฐานการชำระเงินให้เจ้าหน้าที่';
      }
    };
  }

  const btnApproveSlip = document.getElementById('btn-approve-slip');
  if (btnApproveSlip) {
    btnApproveSlip.onclick = async () => {
      btnApproveSlip.disabled = true;
      await supabase.from('meter_readings').eq('id', bill.id).update({
        status: 'paid'
      });
      toast(`อนุมัติการชำระเงินห้อง ${bill.room_number} สำเร็จ`, 'success');
      closeModal();
      if (typeof loadUtilitiesData === 'function') loadUtilitiesData();
    };
  }

  const btnRejectSlip = document.getElementById('btn-reject-slip');
  if (btnRejectSlip) {
    btnRejectSlip.onclick = async () => {
      const reason = prompt('ระบุเหตุผลในการปฏิเสธสลิป (เช่น ยอดเงินไม่ตรง หรือสลิปไม่ชัดเจน):', 'สลิปไม่ชัดเจน กรุณาแนบใหม่อีกครั้ง');
      if (reason === null) return;

      btnRejectSlip.disabled = true;
      await supabase.from('meter_readings').eq('id', bill.id).update({
        status: 'pending',
        payment_notes: `[ปฏิเสธ]: ${reason}`
      });
      toast(`ปฏิเสธสลิปและแจ้งให้ห้อง ${bill.room_number} โอนใหม่แล้ว`, 'info');
      closeModal();
      if (typeof loadUtilitiesData === 'function') loadUtilitiesData();
    };
  }
}

// Modal จดมิเตอร์ใหม่ (Smoky Glass)
async function openAddMeterModal() {
  const rooms = DEFAULT_ROOMS;

  const roomOptions = rooms.map(r => `
    <option value="${r.room_number}" data-price="${r.price}" data-tenant="${r.tenant_name || ''}">
      ห้อง ${r.room_number} (${r.building === 'KingPhetch' ? 'กิ่งเพชร' : (r.building === 'UnderGround' ? 'ใต้บ้าน' : 'ธนกฤษฎ์')}) - ${fmtCurrency(r.price)} ${r.tenant_name ? '(' + r.tenant_name + ')' : '(ห้องว่าง)'}
    </option>
  `).join('');

  const body = `
    <form id="form-meter-reading" style="display: flex; flex-direction: column; gap: 14px;">
      <div class="field">
        <label style="font-size: 0.80rem; font-weight: 600; color: rgba(255,255,255,0.7); margin-bottom: 6px; display: block;">เลือกห้องพัก (3 อาคาร 17 ห้อง) *</label>
        <select id="mr-room" class="form-select" style="width: 100%;">
          ${roomOptions}
        </select>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div class="field">
          <label style="font-size: 0.80rem; font-weight: 600; color: rgba(255,255,255,0.7); margin-bottom: 6px; display: block;">รอบเดือนประจำบิล</label>
          <input type="month" id="mr-month" value="2026-11" class="form-input" style="width: 100%;" required>
        </div>
        <div class="field">
          <label style="font-size: 0.80rem; font-weight: 600; color: rgba(255,255,255,0.7); margin-bottom: 6px; display: block;">ค่าเช่าห้องพัก (บาท/เดือน)</label>
          <input type="number" id="mr-room-price" value="2800" class="form-input" style="width: 100%;" required>
        </div>
      </div>

      <!-- Water Section -->
      <div style="background: rgba(96,165,250,0.08); border: 1px solid rgba(96,165,250,0.22); border-radius: 14px; padding: 14px;">
        <div style="font-weight: 700; color: #60A5FA; margin-bottom: 10px; font-size: 0.88rem; display: flex; align-items: center; gap: 6px;">
          💧 มิเตอร์น้ำประปา (18 บาท/หน่วย)
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
          <div class="field">
            <label style="font-size: 0.74rem; color: rgba(255,255,255,0.6);">เลขครั้งก่อน</label>
            <input type="number" id="mr-water-prev" value="100" class="form-input" style="width: 100%;">
          </div>
          <div class="field">
            <label style="font-size: 0.74rem; color: rgba(255,255,255,0.6);">เลขครั้งนี้ *</label>
            <input type="number" id="mr-water-curr" value="105" class="form-input" style="width: 100%;" required>
          </div>
          <div class="field">
            <label style="font-size: 0.74rem; color: rgba(255,255,255,0.6);">รวมเงินค่าน้ำ</label>
            <input type="text" id="mr-water-total" disabled value="90 ฿" class="form-input" style="width: 100%; background: rgba(255,255,255,0.04); color: #60A5FA; font-weight: 700;">
          </div>
        </div>
      </div>

      <!-- Electric Section -->
      <div style="background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.22); border-radius: 14px; padding: 14px;">
        <div style="font-weight: 700; color: #F59E0B; margin-bottom: 10px; font-size: 0.88rem; display: flex; align-items: center; gap: 6px;">
          ⚡ มิเตอร์ไฟฟ้า (8 บาท/หน่วย)
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
          <div class="field">
            <label style="font-size: 0.74rem; color: rgba(255,255,255,0.6);">เลขครั้งก่อน</label>
            <input type="number" id="mr-elec-prev" value="500" class="form-input" style="width: 100%;">
          </div>
          <div class="field">
            <label style="font-size: 0.74rem; color: rgba(255,255,255,0.6);">เลขครั้งนี้ *</label>
            <input type="number" id="mr-elec-curr" value="545" class="form-input" style="width: 100%;" required>
          </div>
          <div class="field">
            <label style="font-size: 0.74rem; color: rgba(255,255,255,0.6);">รวมเงินค่าไฟ</label>
            <input type="text" id="mr-elec-total" disabled value="360 ฿" class="form-input" style="width: 100%; background: rgba(255,255,255,0.04); color: #F59E0B; font-weight: 700;">
          </div>
        </div>
      </div>

      <!-- Fixed Charges Box -->
      <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 10px 14px; font-size: 0.78rem; color: rgba(255,255,255,0.7); display: flex; justify-content: space-between;">
        <span>ค่าบริการคงที่รายเดือน (ส่วนกลาง 100฿ + Wi-Fi 100฿ + ขยะ 20฿):</span>
        <strong style="color: #ffffff;">220 ฿</strong>
      </div>

      <!-- Grand Total -->
      <div style="background: rgba(59,130,246,0.15); border: 1px solid rgba(59,130,246,0.3); border-radius: 12px; padding: 14px 18px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 600; color: #ffffff; font-size: 0.90rem;">ยอดรวมทั้งสิ้น (ค่าห้อง + น้ำ + ไฟ + บริการ):</span>
        <strong style="font-size: 1.35rem; color: #ffffff;" id="mr-grand-total">3,470 ฿</strong>
      </div>
    </form>
  `;

  const footer = `
    <div style="display: flex; justify-content: flex-end; gap: 10px; width: 100%;">
      <button type="button" class="btn btn-outline" onclick="window.closeAppModal()">ยกเลิก</button>
      <button type="button" class="btn btn-primary" id="btn-submit-meter">บันทึกและสร้างบิล</button>
    </div>
  `;

  showModal({
    title: 'จดมิเตอร์น้ำ-ไฟ รอบประจำเดือน',
    body,
    footer,
    maxWidth: '560px'
  });

  // Calculate live totals
  const calc = () => {
    const roomPrice = Number(document.getElementById('mr-room-price').value) || 0;
    const wPrev = Number(document.getElementById('mr-water-prev').value) || 0;
    const wCurr = Number(document.getElementById('mr-water-curr').value) || 0;
    const wUnits = Math.max(0, wCurr - wPrev);
    const wCost = wUnits * 18;

    const ePrev = Number(document.getElementById('mr-elec-prev').value) || 0;
    const eCurr = Number(document.getElementById('mr-elec-curr').value) || 0;
    const eUnits = Math.max(0, eCurr - ePrev);
    const eCost = eUnits * 8;

    const fixedFees = 100 + 100 + 20; // ค่าบริการส่วนกลาง 100 + Wi-Fi 100 + กำจัดขยะ 20
    const grand = roomPrice + wCost + eCost + fixedFees;

    document.getElementById('mr-water-total').value = wCost.toLocaleString() + ' ฿';
    document.getElementById('mr-elec-total').value = eCost.toLocaleString() + ' ฿';
    document.getElementById('mr-grand-total').textContent = grand.toLocaleString() + ' ฿';
    return { roomPrice, wPrev, wCurr, wUnits, wCost, ePrev, eCurr, eUnits, eCost, grand };
  };

  document.getElementById('mr-room-price').oninput = calc;
  document.getElementById('mr-water-prev').oninput = calc;
  document.getElementById('mr-water-curr').oninput = calc;
  document.getElementById('mr-elec-prev').oninput = calc;
  document.getElementById('mr-elec-curr').oninput = calc;

  document.getElementById('mr-room').onchange = (e) => {
    const opt = e.target.selectedOptions[0];
    if (opt) {
      const p = opt.getAttribute('data-price');
      if (p) document.getElementById('mr-room-price').value = p;
      calc();
    }
  };

  // Run initial calculation
  calc();

  document.getElementById('btn-submit-meter').onclick = async () => {
    const vals = calc();
    const sel = document.getElementById('mr-room');
    const roomNum = sel.value;
    const tenantName = sel.selectedOptions[0]?.getAttribute('data-tenant') || '';
    const month = document.getElementById('mr-month').value;
    const invId = `INV-${month.replace('-', '')}-${roomNum}`;

    await supabase.from('meter_readings').insert([{
      id: invId,
      room_number: roomNum,
      tenant_name: tenantName,
      billing_month: month,
      month_label: 'รอบ ' + month,
      room_price: vals.roomPrice,
      prev_water: vals.wPrev,
      curr_water: vals.wCurr,
      water_unit: vals.wUnits,
      water_rate: 18,
      water_total: vals.wCost,
      prev_electric: vals.ePrev,
      curr_electric: vals.eCurr,
      electric_unit: vals.eUnits,
      electric_rate: 8,
      electric_total: vals.eCost,
      common_fee: 100,
      total_price: vals.grand,
      status: 'pending',
      due_date: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0]
    }]);

    toast(`ออกบิล ${invId} สำหรับห้อง ${roomNum} สำเร็จ`, 'success');
    closeModal();
    loadUtilitiesData();
  };
}
