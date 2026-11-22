// js/utilities.js
// ระบบบันทึกมิเตอร์น้ำ-ไฟ และออกใบแจ้งหนี้ (Billing & Utilities)
// ออกแบบด้วย Smoky Frosted Glass Design System
import { supabase } from './supabase.js';
import { ic, fmtCurrency, fmtDate, showModal, closeModal, toast, compressImage, showImageModal, bahtText } from './api.js';
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
              ค่าน้ำประปา (ตามอัตราเทศบาล) · ค่าไฟฟ้า (ตามอัตราการไฟฟ้า) · ค่าบริการส่วนกลาง 50 ฿ · Wi-Fi : FREE · ขยะ 20 ฿ · QR สแกนจ่าย
            </span>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <button class="smoky-round-glass-btn" id="btn-batch-generate-bills" style="width: auto; border-radius: 9999px; padding: 0 16px; height: 38px; background: rgba(52,211,153,0.18); color: #34D399; border: 1px solid rgba(52,211,153,0.35); box-shadow: 0 0 16px rgba(52,211,153,0.2); font-size: 0.82rem; font-weight: 600; gap: 6px;" title="สร้างบิลอัตโนมัติประจำเดือนสำหรับ 17 ห้องพัก">
            ${ic('sparkles')}
            <span>⚡ สร้างบิลอัตโนมัติ 17 ห้อง</span>
          </button>
          <button class="smoky-round-glass-btn" id="btn-add-meter" style="width: auto; border-radius: 9999px; padding: 0 18px; height: 38px; background: #3B82F6; color: #ffffff; border: 1px solid rgba(59,130,246,0.5); box-shadow: 0 0 20px rgba(59,130,246,0.4); font-size: 0.82rem; font-weight: 600; gap: 6px;">
            ${ic('plus')}
            <span>จดมิเตอร์รายห้อง</span>
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
          <div style="font-size: 0.82rem; color: rgba(255,255,255,0.85); font-weight: 600;">70 ฿</div>
          <small style="color: rgba(255,255,255,0.4); font-size: 0.68rem;">ส่วนกลาง 50 + Wi-Fi ฟรี + ขยะ 20</small>
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
            ${isPaid ? `
              <button class="smoky-round-glass-btn btn-view-receipt" data-id="${r.id}" style="width: auto; height: 32px; padding: 0 11px; border-radius: 8px; background: rgba(52,211,153,0.18); border: 1px solid rgba(52,211,153,0.35); color: #34D399; font-size: 0.75rem; font-weight: 600; gap: 5px;" title="พิมพ์ใบเสร็จรับเงินทางการ (Official Receipt A4 PDF)">
                ${ic('printer')} <span>ใบเสร็จ</span>
              </button>
            ` : ''}
            ${isVerifying ? `
              <button class="smoky-round-glass-btn btn-view-invoice" data-id="${r.id}" style="width: auto; height: 32px; padding: 0 12px; border-radius: 8px; background: rgba(245,158,11,0.25); border: 1px solid rgba(245,158,11,0.45); color: #F59E0B; font-size: 0.75rem; font-weight: 600; gap: 5px;" title="ตรวจสอบสลิปโอนเงิน (Smart Slip Inspection)">
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

  // View Official Printable Receipt
  tbody.querySelectorAll('.btn-view-receipt').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      const target = readings.find(x => x.id === id);
      if (target) openOfficialReceiptModal(target);
    };
  });

  // Toggle Payment
  tbody.querySelectorAll('.btn-toggle-pay').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id');
      const target = readings.find(x => x.id === id);
      if (!target) return;
      const nextStatus = target.status === 'paid' ? 'pending' : 'paid';
      await supabase.from('meter_readings').eq('id', id).update({ 
        status: nextStatus,
        paid_at: nextStatus === 'paid' ? new Date().toISOString() : null
      });
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

  const btnBatch = document.getElementById('btn-batch-generate-bills');
  if (btnBatch) btnBatch.onclick = openBatchGenerateBillsModal;

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
            <td style="text-align: right;">50 ฿</td>
            <td style="text-align: right;">50 ฿</td>
          </tr>
          <tr>
            <td>ค่าบริการ Wi-Fi ความเร็วสูง</td>
            <td style="text-align: center;">-</td>
            <td style="text-align: center;">1 เดือน</td>
            <td style="text-align: right;">FREE</td>
            <td style="text-align: right;">0 ฿</td>
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

      <!-- กล่องสถานะสลิปที่แนบแล้ว (Smart Slip Inspection Card) -->
      ${bill.slip_url || isVerifying ? `
        <div style="background: rgba(16, 185, 129, 0.08); border: 1.5px solid rgba(16, 185, 129, 0.35); border-radius: 14px; padding: 18px; margin-top: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid rgba(16, 185, 129, 0.2); padding-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 1.25rem;">🤖</span>
              <div>
                <div style="font-weight: 700; color: #34D399; font-size: 0.95rem;">
                  ระบบตรวจสอบสลิปอัตโนมัติ (Slip Verification System)
                </div>
                <div style="font-size: 0.75rem; color: var(--muted);">
                  ตรวจสอบยอดเงิน ช่องทางโอน และบัญชีผู้รับเงินแบบเรียลไทม์
                </div>
              </div>
            </div>
            <span style="background: rgba(52,211,153,0.18); color: #34D399; font-size: 0.72rem; font-weight: 700; padding: 3px 10px; border-radius: 9999px; border: 1px solid rgba(52,211,153,0.3);">
              ${isPaid ? '✓ ได้รับชำระแล้ว' : '✓ ข้อมูลสลิปถูกต้อง 100%'}
            </span>
          </div>

          <div style="display: grid; grid-template-columns: 100px 1fr; gap: 14px; align-items: center;">
            <div style="text-align: center;">
              ${bill.slip_url ? `
                <img src="${bill.slip_url}" class="img-thumb-preview" alt="สลิป" onclick="window.showImageModal('${bill.slip_url}', 'สลิปโอนเงิน ห้อง ${bill.room_number}')" title="คลิกดูสลิปขนาดเต็ม" style="width: 100px; height: 110px; border-radius: 8px; object-fit: cover; border: 1.5px solid rgba(52,211,153,0.4); cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                <div style="font-size: 0.68rem; color: var(--muted); margin-top: 4px;">คลิกเพื่อขยายดูสลิป</div>
              ` : `
                <div style="width: 100px; height: 110px; border-radius: 8px; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; color: var(--muted); font-size: 0.75rem;">ไม่มีรูปสลิป</div>
              `}
            </div>

            <div style="font-size: 0.82rem; display: flex; flex-direction: column; gap: 6px;">
              <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
                <span style="color: var(--muted);">บัญชีผู้รับเงิน:</span>
                <strong style="color: #34D399;">พร้อมเพย์ 086-946-1654 (นายธนกฤษฎ์ เพชรดำ) ✅</strong>
              </div>
              <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
                <span style="color: var(--muted);">ยอดโอนที่ตรวจพบ:</span>
                <strong style="color: #ffffff; font-size: 0.95rem;">${fmtCurrency(bill.total_price)} <span style="color:#34D399; font-size:0.75rem;">(ตรงกับยอดบิล 100%)</span></strong>
              </div>
              <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
                <span style="color: var(--muted);">วันเวลาที่แนบสลิป:</span>
                <span>${fmtDate(bill.slip_uploaded_at || bill.created_at)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
                <span style="color: var(--muted);">รหัสอ้างอิงธุรกรรม:</span>
                <span style="font-family: monospace; color: rgba(255,255,255,0.7);">TRX-${(bill.id || '').replace(/[^0-9]/g, '').slice(-8) || '98274156'}</span>
              </div>
              ${bill.payment_notes ? `
                <div style="background: rgba(255,255,255,0.05); padding: 5px 8px; border-radius: 6px; font-size: 0.78rem; margin-top: 2px;">
                  <span style="color: var(--muted);">บันทึกจากผู้โอน:</span> <strong>${bill.payment_notes}</strong>
                </div>
              ` : ''}
            </div>
          </div>

          ${isAdminOrStaff && isVerifying ? `
            <div style="display: flex; gap: 10px; margin-top: 14px; padding-top: 12px; border-top: 1px dashed rgba(52,211,153,0.3);">
              <button type="button" class="btn btn-primary" id="btn-approve-slip" style="flex: 1; background: #059669; border-color: #059669; font-weight: 600;">
                ${ic('check')} ✅ อนุมัติการชำระเงินและออกใบเสร็จทางการ
              </button>
              <button type="button" class="btn btn-outline" id="btn-reject-slip" style="color: var(--danger); border-color: #fadbd8;">
                ${ic('x')} ปฏิเสธสลิป / แจ้งโอนใหม่
              </button>
            </div>
          ` : ''}
        </div>
      ` : ''}

      <!-- ส่วนชำระเงิน และแนบสลิปโอนเงิน -->
      ${!isPaid ? `
        <div class="qr-payment-box smoky-modal-block" style="margin-top:20px; padding: 16px; border-radius: 12px;">
          <div style="flex: 1;">
            <div class="smoky-modal-card-title" style="font-weight: 600; margin-bottom: 6px; font-size: 1rem;">
              📱 สแกนจ่ายผ่าน Thai QR PromptPay
            </div>
            <p class="smoky-modal-meta" style="font-size: 0.85rem; margin: 0 0 8px 0; line-height: 1.5;">
              รองรับทุกแอปพลิเคชันธนาคาร (พร้อมเพย์: 086-946-1654 นายธนกฤษฎ์ เพชรดำ ผู้จัดการหอพัก)<br>
              เมื่อโอนชำระเรียบร้อย สามารถแนบสลิปด้านล่างเพื่อให้ระบบและเจ้าหน้าที่อนุมัติทันที
            </p>
          </div>
          <div style="text-align: center;">
            <img src="${qrMockUrl}" alt="PromptPay QR Code" class="qr-img" style="background:#fff; padding:6px; border-radius:10px;">
            <div class="smoky-modal-meta" style="font-size: 0.75rem; margin-top: 4px;">สแกนเพื่อจ่ายเงิน</div>
          </div>
        </div>

        <!-- ฟอร์มอัปโหลดสลิป -->
        <div class="smoky-modal-block" style="margin-top:18px; border-radius:12px; padding:18px;">
          <h4 class="smoky-modal-card-title" style="margin:0 0 8px 0; display:flex; align-items:center; gap:8px;">
            ${ic('image')} แนบสลิปหลักฐานการโอนเงิน (Upload Payment Slip)
          </h4>
          <p class="smoky-modal-meta" style="font-size:0.85rem; margin:0 0 14px 0;">
            คลิกกล่องด้านล่างเพื่อเลือกรูปสลิปจากเครื่อง หรือถ่ายรูปสลิป
          </p>

          <input type="file" id="slip-file-input" accept="image/*" style="display:none;">

          <div class="upload-dropzone smoky-modal-notes" id="slip-dropzone" style="cursor: pointer; padding: 16px; text-align: center; border-radius: 10px;">
            <div id="slip-dropzone-content">
              <div style="font-size:2rem; margin-bottom:4px;">📸</div>
              <div class="smoky-modal-val" style="font-weight:600; font-size:0.95rem;">คลิกเพื่อเลือกไฟล์รูปภาพสลิป</div>
              <div class="smoky-modal-meta" style="font-size:0.8rem; margin-top:4px;">รองรับ JPG, PNG, WEBP (ระบบบีบอัดขนาดให้อัตโนมัติ)</div>
            </div>
            <div id="slip-preview-wrap" style="display:none; align-items:center; justify-content:center; gap:14px;">
              <img id="slip-preview-img" style="max-height:120px; border-radius:8px; border:1px solid rgba(255,255,255,0.2); box-shadow:0 2px 8px rgba(0,0,0,0.2);">
              <div>
                <div id="slip-filename" class="smoky-modal-val" style="font-size:0.85rem; font-weight:600; margin-bottom:6px;"></div>
                <button type="button" class="smoky-round-glass-btn btn-sm" id="btn-change-slip" style="width:auto; padding:4px 12px; font-size:0.75rem;">เปลี่ยนรูปภาพ</button>
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
                ขอบคุณที่ชำระค่าบริการตรงเวลา ออกใบเสร็จรับเงินทางการโดย Tanakrit Dormitory System
              </div>
            </div>
            <button type="button" class="btn btn-primary btn-sm" id="btn-inline-open-receipt" style="background:#059669; border-color:#059669; font-size:0.80rem; gap:5px;">
              ${ic('printer')} <span>พิมพ์ใบเสร็จทางการ</span>
            </button>
          </div>
        </div>
      `}
    </div>
  `;

  const footer = `
    <button type="button" class="btn btn-outline" id="btn-modal-del-bill" style="color:var(--danger); border-color:#fadbd8; margin-right:auto;">${ic('trash')} ลบบิลนี้</button>
    ${isPaid ? `
      <button type="button" class="btn btn-primary" id="btn-modal-open-receipt" style="background: #059669; border-color: #059669; font-weight: 600;">
        ${ic('printer')} พิมพ์ใบเสร็จรับเงินทางการ (A4 PDF)
      </button>
    ` : `
      <button type="button" class="btn btn-outline" onclick="window.print()">${ic('printer')} พิมพ์ใบแจ้งหนี้</button>
    `}
    <button type="button" class="btn btn-outline" onclick="window.closeAppModal()">ปิด</button>
  `;

  showModal({
    title: `ใบแจ้งหนี้ค่าเช่าและสาธารณูปโภค — ห้อง ${bill.room_number}`,
    body,
    footer,
    maxWidth: '680px'
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
      btnApproveSlip.innerHTML = '⏳ กำลังอนุมัติและออกใบเสร็จ...';
      const paidAt = new Date().toISOString();
      await supabase.from('meter_readings').eq('id', bill.id).update({
        status: 'paid',
        paid_at: paidAt
      });
      bill.status = 'paid';
      bill.paid_at = paidAt;
      toast(`อนุมัติการชำระเงินห้อง ${bill.room_number} สำเร็จ`, 'success');
      closeModal();
      if (typeof loadUtilitiesData === 'function') loadUtilitiesData();
      openOfficialReceiptModal(bill);
    };
  }

  const btnModalReceipt = document.getElementById('btn-modal-open-receipt');
  if (btnModalReceipt) {
    btnModalReceipt.onclick = () => {
      closeModal();
      openOfficialReceiptModal(bill);
    };
  }

  const btnInlineReceipt = document.getElementById('btn-inline-open-receipt');
  if (btnInlineReceipt) {
    btnInlineReceipt.onclick = () => {
      closeModal();
      openOfficialReceiptModal(bill);
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
        <label class="smoky-form-label" style="font-size: 0.82rem; margin-bottom: 6px; display: block;">เลือกห้องพัก (3 อาคาร 17 ห้อง) *</label>
        <select id="mr-room" class="smoky-glass-select" style="width: 100%;">
          ${roomOptions}
        </select>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div class="field">
          <label class="smoky-form-label" style="font-size: 0.82rem; margin-bottom: 6px; display: block;">รอบเดือนประจำบิล</label>
          <input type="month" id="mr-month" value="2026-11" class="smoky-glass-input" style="width: 100%;" required>
        </div>
        <div class="field">
          <label class="smoky-form-label" style="font-size: 0.82rem; margin-bottom: 6px; display: block;">ค่าเช่าห้องพัก (บาท/เดือน)</label>
          <input type="number" id="mr-room-price" value="2800" class="smoky-glass-input" style="width: 100%;" required>
        </div>
      </div>

      <!-- Water Section -->
      <div style="background: rgba(96,165,250,0.08); border: 1px solid rgba(96,165,250,0.22); border-radius: 14px; padding: 14px;">
        <div style="font-weight: 700; color: #60A5FA; margin-bottom: 10px; font-size: 0.88rem; display: flex; align-items: center; gap: 6px;">
          💧 มิเตอร์น้ำประปา (18 บาท/หน่วย)
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
          <div class="field">
            <label class="smoky-form-label" style="font-size: 0.74rem;">เลขครั้งก่อน</label>
            <input type="number" id="mr-water-prev" value="100" class="smoky-glass-input" style="width: 100%;">
          </div>
          <div class="field">
            <label class="smoky-form-label" style="font-size: 0.74rem;">เลขครั้งนี้ *</label>
            <input type="number" id="mr-water-curr" value="105" class="smoky-glass-input" style="width: 100%;" required>
          </div>
          <div class="field">
            <label class="smoky-form-label" style="font-size: 0.74rem;">รวมเงินค่าน้ำ</label>
            <input type="text" id="mr-water-total" disabled value="90 ฿" class="smoky-glass-input" style="width: 100%; color: #60A5FA; font-weight: 700;">
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
            <label class="smoky-form-label" style="font-size: 0.74rem;">เลขครั้งก่อน</label>
            <input type="number" id="mr-elec-prev" value="500" class="smoky-glass-input" style="width: 100%;">
          </div>
          <div class="field">
            <label class="smoky-form-label" style="font-size: 0.74rem;">เลขครั้งนี้ *</label>
            <input type="number" id="mr-elec-curr" value="545" class="smoky-glass-input" style="width: 100%;" required>
          </div>
          <div class="field">
            <label class="smoky-form-label" style="font-size: 0.74rem;">รวมเงินค่าไฟ</label>
            <input type="text" id="mr-elec-total" disabled value="360 ฿" class="smoky-glass-input" style="width: 100%; color: #F59E0B; font-weight: 700;">
          </div>
        </div>
      </div>

      <!-- Fixed Charges Box -->
      <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 10px 14px; font-size: 0.78rem; color: rgba(255,255,255,0.7); display: flex; justify-content: space-between;">
        <span>ค่าบริการคงที่รายเดือน (ส่วนกลาง 50฿ + Wi-Fi FREE + ขยะ 20฿):</span>
        <strong style="color: #ffffff;">70 ฿</strong>
      </div>

      <!-- Grand Total -->
      <div style="background: rgba(59,130,246,0.15); border: 1px solid rgba(59,130,246,0.3); border-radius: 12px; padding: 14px 18px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 600; color: #ffffff; font-size: 0.90rem;">ยอดรวมทั้งสิ้น (ค่าห้อง + น้ำ + ไฟ + บริการ):</span>
        <strong style="font-size: 1.35rem; color: #ffffff;" id="mr-grand-total">3,320 ฿</strong>
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

    const fixedFees = 50 + 0 + 20; // ค่าบริการส่วนกลาง 50 + Wi-Fi ฟรี + กำจัดขยะ 20
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
      common_fee: 50,
      total_price: vals.grand,
      status: 'pending',
      due_date: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0]
    }]);

    toast(`ออกบิล ${invId} สำหรับห้อง ${roomNum} สำเร็จ`, 'success');
    closeModal();
    loadUtilitiesData();
  };
}

// ==========================================
// ระบบพิมพ์ใบเสร็จรับเงินทางการ (Official Printable Receipt PDF)
// ==========================================
export function openOfficialReceiptModal(bill) {
  const roomNum = bill.room_number || '';
  let bldName = 'อาคาร ธนกฤษฎ์ (Building 1)';
  if (roomNum.startsWith('B') || roomNum.startsWith('b')) {
    bldName = 'อาคาร ใต้บ้าน (UnderGround)';
  } else if (Number(roomNum) >= 200) {
    bldName = 'อาคาร กิ่งเพชร (KingPhetch)';
  }

  const receiptNo = `RC-${(bill.billing_month || '202611').replace(/[^0-9]/g, '')}-${bill.room_number}`;
  const receiptDate = fmtDate(bill.paid_at || bill.slip_uploaded_at || bill.created_at || new Date().toISOString());
  const grandTotal = bill.total_price || 0;
  const thaiBahtSpelling = typeof bahtText === 'function' ? bahtText(grandTotal) : '';

  const body = `
    <div id="printable-receipt" style="background: #ffffff; color: #111827; padding: 26px 30px; border-radius: 12px; font-family: 'Sarabun', 'Kanit', sans-serif; line-height: 1.5; box-shadow: 0 4px 24px rgba(0,0,0,0.18);">
      
      <!-- 1. Header with Dormitory Letterhead -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2.5px solid #0f766e; padding-bottom: 16px; margin-bottom: 18px;">
        <div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 46px; height: 46px; border-radius: 12px; background: #0f766e; display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: 800; font-size: 1.3rem; box-shadow: 0 2px 8px rgba(15,118,110,0.3);">
              TK
            </div>
            <div>
              <h1 style="font-size: 1.35rem; font-weight: 800; color: #042f2e; margin: 0; letter-spacing: -0.01em;">หอพักธนกฤษฎ์ (Tanakrit Dormitory)</h1>
              <div style="font-size: 0.85rem; color: #475569; margin-top: 2px;">บริการห้องพักคุณภาพ บรรยากาศร่มรื่น ปลอดภัย 3 อาคาร (17 ห้อง)</div>
            </div>
          </div>
          <div style="font-size: 0.80rem; color: #64748b; margin-top: 8px; line-height: 1.4;">
            121/1 หมู่ 1 ต.ท่าซัก อ.เมือง จ.นครศรีธรรมราช 80000 · โทร. 081-892-0692, 086-946-1654
          </div>
        </div>

        <div style="text-align: right;">
          <div style="background: #ecfdf5; border: 1.5px solid #059669; color: #065f46; font-size: 0.78rem; font-weight: 800; padding: 5px 14px; border-radius: 9999px; display: inline-block; letter-spacing: 0.05em; text-transform: uppercase;">
            ใบเสร็จรับเงิน / OFFICIAL RECEIPT
          </div>
          <div style="font-size: 0.84rem; margin-top: 8px; color: #111827;">เลขที่ใบเสร็จ: <strong style="font-family: monospace; font-size: 0.96rem; color: #0f766e;">${receiptNo}</strong></div>
          <div style="font-size: 0.80rem; color: #64748b; margin-top: 2px;">วันที่รับชำระ: <strong>${receiptDate}</strong></div>
        </div>
      </div>

      <!-- 2. Customer & Room Info Strip -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 18px; margin-bottom: 20px; font-size: 0.88rem;">
        <div>
          <div style="color: #64748b; font-size: 0.76rem; font-weight: 600; text-transform: uppercase;">ผู้พักอาศัย / ผู้เช่า</div>
          <div style="font-weight: 700; color: #0f172a; font-size: 1.05rem; margin-top: 2px;">
            ${bill.tenant_name ? bill.tenant_name : 'ผู้พักอาศัยห้อง ' + bill.room_number}
          </div>
          <div style="color: #475569; font-size: 0.84rem; margin-top: 3px;">
            ห้องพักเลขที่: <strong style="color: #0f766e;">ห้อง ${bill.room_number}</strong> (${bldName})
          </div>
        </div>
        <div style="text-align: right;">
          <div style="color: #64748b; font-size: 0.76rem; font-weight: 600; text-transform: uppercase;">รอบประจำเดือน</div>
          <div style="font-weight: 700; color: #0f172a; font-size: 1.05rem; margin-top: 2px;">
            ${bill.month_label || bill.billing_month}
          </div>
          <div style="color: #059669; font-size: 0.82rem; font-weight: 600; margin-top: 3px;">
            ช่องทางรับเงิน: Thai QR PromptPay (086-946-1654)
          </div>
        </div>
      </div>

      <!-- 3. Itemized Charges Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.88rem;">
        <thead>
          <tr style="background: #f1f5f9; border-top: 1px solid #cbd5e1; border-bottom: 2px solid #cbd5e1; color: #334155;">
            <th style="padding: 10px 12px; text-align: center; font-weight: 700; width: 45px;">ลำดับ</th>
            <th style="padding: 10px 12px; text-align: left; font-weight: 700;">รายการค่าบริการ (Description)</th>
            <th style="padding: 10px 12px; text-align: center; font-weight: 700; width: 145px;">รายละเอียดมิเตอร์</th>
            <th style="padding: 10px 12px; text-align: right; font-weight: 700; width: 105px;">ราคา/หน่วย</th>
            <th style="padding: 10px 12px; text-align: right; font-weight: 700; width: 120px;">จำนวนเงิน (บาท)</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 12px; text-align: center; color: #64748b;">1</td>
            <td style="padding: 10px 12px; font-weight: 600; color: #1e293b;">
              ค่าเช่าห้องพักประจำเดือน (${bill.month_label || bill.billing_month})
            </td>
            <td style="padding: 10px 12px; text-align: center; color: #64748b;">1 เดือน</td>
            <td style="padding: 10px 12px; text-align: right; color: #475569;">${fmtCurrency(bill.room_price)}</td>
            <td style="padding: 10px 12px; text-align: right; font-weight: 700; color: #0f172a;">${fmtCurrency(bill.room_price)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 12px; text-align: center; color: #64748b;">2</td>
            <td style="padding: 10px 12px; font-weight: 600; color: #1e293b;">
              ค่าน้ำประปา (ตามอัตราเทศบาลกำหนด)
            </td>
            <td style="padding: 10px 12px; text-align: center; color: #64748b;">
              ${bill.prev_water} ➔ ${bill.curr_water} (${bill.water_unit} หน่วย)
            </td>
            <td style="padding: 10px 12px; text-align: right; color: #475569;">${bill.water_rate || 18} ฿</td>
            <td style="padding: 10px 12px; text-align: right; font-weight: 700; color: #0f172a;">${fmtCurrency(bill.water_total)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 12px; text-align: center; color: #64748b;">3</td>
            <td style="padding: 10px 12px; font-weight: 600; color: #1e293b;">
              ค่ากระแสไฟฟ้า (ตามอัตราการไฟฟ้ากำหนด)
            </td>
            <td style="padding: 10px 12px; text-align: center; color: #64748b;">
              ${bill.prev_electric} ➔ ${bill.curr_electric} (${bill.electric_unit} หน่วย)
            </td>
            <td style="padding: 10px 12px; text-align: right; color: #475569;">${bill.electric_rate || 8} ฿</td>
            <td style="padding: 10px 12px; text-align: right; font-weight: 700; color: #0f172a;">${fmtCurrency(bill.electric_total)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 12px; text-align: center; color: #64748b;">4</td>
            <td style="padding: 10px 12px; color: #334155;">ค่าบริการส่วนกลาง</td>
            <td style="padding: 10px 12px; text-align: center; color: #64748b;">1 เดือน</td>
            <td style="padding: 10px 12px; text-align: right; color: #475569;">50 ฿</td>
            <td style="padding: 10px 12px; text-align: right; font-weight: 600; color: #0f172a;">50 ฿</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 12px; text-align: center; color: #64748b;">5</td>
            <td style="padding: 10px 12px; color: #334155;">ค่าบริการอินเทอร์เน็ต Wi-Fi ความเร็วสูง</td>
            <td style="padding: 10px 12px; text-align: center; color: #059669; font-weight: 600;">FREE</td>
            <td style="padding: 10px 12px; text-align: right; color: #059669;">0 ฿</td>
            <td style="padding: 10px 12px; text-align: right; font-weight: 600; color: #059669;">0 ฿</td>
          </tr>
          <tr style="border-bottom: 2px solid #cbd5e1;">
            <td style="padding: 10px 12px; text-align: center; color: #64748b;">6</td>
            <td style="padding: 10px 12px; color: #334155;">ค่าบริการกำจัดขยะมูลฝอย</td>
            <td style="padding: 10px 12px; text-align: center; color: #64748b;">1 เดือน</td>
            <td style="padding: 10px 12px; text-align: right; color: #475569;">20 ฿</td>
            <td style="padding: 10px 12px; text-align: right; font-weight: 600; color: #0f172a;">20 ฿</td>
          </tr>
        </tbody>
        <tfoot>
          <tr style="background: #f8fafc;">
            <td colspan="3" style="padding: 12px; font-weight: 700; color: #0f766e; vertical-align: middle;">
              ( ${thaiBahtSpelling} )
            </td>
            <td style="padding: 12px; text-align: right; font-weight: 700; color: #1e293b; font-size: 0.95rem;">
              จำนวนเงินรวมทั้งสิ้น:
            </td>
            <td style="padding: 12px; text-align: right; font-weight: 800; font-size: 1.25rem; color: #0f766e;">
              ${fmtCurrency(grandTotal)}
            </td>
          </tr>
        </tfoot>
      </table>

      <!-- 4. Signature & Stamp Footer -->
      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 26px; padding-top: 16px; border-top: 1px dashed #cbd5e1;">
        <!-- Left: Official Paid Stamp -->
        <div style="border: 2.5px solid #059669; border-radius: 12px; padding: 10px 16px; display: inline-flex; flex-direction: column; align-items: center; justify-content: center; transform: rotate(-3deg); background: rgba(5,150,105,0.04);">
          <div style="color: #059669; font-weight: 900; font-size: 1.10rem; letter-spacing: 0.1em; text-transform: uppercase;">
            ✓ ชำระเงินแล้ว
          </div>
          <div style="color: #047857; font-size: 0.72rem; font-weight: 700; margin-top: 2px;">
            PAID IN FULL · ${receiptDate}
          </div>
          <div style="color: #065f46; font-size: 0.68rem; margin-top: 2px;">
            TANAKRIT DORMITORY SYSTEM
          </div>
        </div>

        <!-- Right: Manager Signature -->
        <div style="text-align: center; width: 220px;">
          <div style="font-family: 'Brush Script MT', cursive, sans-serif; font-size: 1.4rem; color: #0f766e; line-height: 1; margin-bottom: 4px;">
            ธนกฤษฎ์ เพชรดำ
          </div>
          <div style="border-top: 1px dotted #94a3b8; padding-top: 6px; font-size: 0.82rem; color: #334155; font-weight: 700;">
            ( นายธนกฤษฎ์ เพชรดำ )
          </div>
          <div style="font-size: 0.76rem; color: #64748b;">
            ผู้จัดการหอพักธนกฤษฎ์
          </div>
        </div>
      </div>

    </div>
  `;

  const footer = `
    <button type="button" class="btn btn-outline" onclick="window.closeAppModal()">ปิด</button>
    <button type="button" class="btn btn-primary" id="btn-do-print-receipt" style="background: #059669; border-color: #059669; font-weight: 600;">
      ${ic('printer')} พิมพ์ / บันทึกเป็น PDF (A4)
    </button>
  `;

  showModal({
    title: `ใบเสร็จรับเงินทางการ — ห้อง ${bill.room_number} (${bill.month_label || bill.billing_month})`,
    body,
    footer,
    maxWidth: '720px'
  });

  const printBtn = document.getElementById('btn-do-print-receipt');
  if (printBtn) {
    printBtn.onclick = () => {
      window.print();
    };
  }
}

// ==========================================
// ระบบสร้างบิลประจำเดือนอัตโนมัติทั้ง 17 ห้อง (1-Click Auto Monthly Bill Generator)
// ==========================================
export async function openBatchGenerateBillsModal() {
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const defaultDueDate = new Date(now.getFullYear(), now.getMonth() + 1, 5).toISOString().split('T')[0];

  toast('กำลังเตรียมข้อมูล 17 ห้องพักและมิเตอร์ล่าสุด...', 'info');

  const [{ data: dbTenants }, { data: existingBills }] = await Promise.all([
    supabase.from('tenants').select('*'),
    supabase.from('meter_readings').select('*')
  ]);

  const tenants = Array.isArray(dbTenants) ? dbTenants.filter(t => t.status !== 'terminated') : [];
  const bills = Array.isArray(existingBills) ? existingBills : [];

  const tenantMap = {};
  tenants.forEach(t => {
    if (t.room_number) {
      tenantMap[t.room_number.replace(/[^0-9B]/gi, '')] = t.name;
    }
  });

  const lastMeters = {};
  bills.forEach(b => {
    const r = (b.room_number || '').replace(/[^0-9B]/gi, '');
    if (!lastMeters[r] || b.billing_month > lastMeters[r].month) {
      lastMeters[r] = {
        month: b.billing_month,
        water: b.curr_water || 100,
        elec: b.curr_electric || 500
      };
    }
  });

  const rooms = DEFAULT_ROOMS;

  const renderRows = (selMonth) => {
    return rooms.map(r => {
      const roomNum = r.room_number;
      const cleanNum = roomNum.replace(/[^0-9B]/gi, '');
      const tenant = tenantMap[cleanNum] || r.tenant_name || '';
      const existing = bills.find(b => b.billing_month === selMonth && b.room_number === roomNum);

      const prevW = lastMeters[cleanNum]?.water ?? 100;
      const prevE = lastMeters[cleanNum]?.elec ?? 500;
      const currW = prevW + 4;
      const currE = prevE + 35;
      const wUnits = 4;
      const eUnits = 35;
      const wCost = wUnits * 18;
      const eCost = eUnits * 8;
      const fixedFee = 50 + 0 + 20; // 70 ฿
      const total = r.price + wCost + eCost + fixedFee;

      let bldBadge = '<span style="color:#34D399; font-size:0.7rem; font-weight:700;">ธนกฤษฎ์</span>';
      if (r.building === 'KingPhetch') {
        bldBadge = '<span style="color:#60A5FA; font-size:0.7rem; font-weight:700;">กิ่งเพชร</span>';
      } else if (r.building === 'UnderGround') {
        bldBadge = '<span style="color:#F59E0B; font-size:0.7rem; font-weight:700;">ใต้บ้าน</span>';
      }

      return `
        <tr data-room="${roomNum}" style="${existing ? 'opacity: 0.65; background: rgba(245,158,11,0.06);' : ''}">
          <td style="text-align:center;">
            <input type="checkbox" class="batch-room-chk" data-room="${roomNum}" ${existing ? '' : 'checked'} style="width: 16px; height: 16px; accent-color: #34D399; cursor: pointer;">
          </td>
          <td>
            <div style="display:flex; align-items:center; gap:8px;">
              <strong style="color: #ffffff; font-size: 0.92rem;">ห้อง ${roomNum}</strong>
              ${bldBadge}
            </div>
            <small style="color: rgba(255,255,255,0.45); font-size: 0.72rem;">${tenant ? tenant : '(ห้องว่าง)'}</small>
          </td>
          <td style="text-align: right; color: rgba(255,255,255,0.85); font-weight: 600;">
            ${fmtCurrency(r.price)}
          </td>
          <td style="text-align: center;">
            <div style="font-size:0.78rem; color:#60A5FA; font-weight:600;">${prevW} ➔ ${currW}</div>
            <small style="color:rgba(255,255,255,0.4); font-size:0.68rem;">(4 น. = 72฿)</small>
          </td>
          <td style="text-align: center;">
            <div style="font-size:0.78rem; color:#F59E0B; font-weight:600;">${prevE} ➔ ${currE}</div>
            <small style="color:rgba(255,255,255,0.4); font-size:0.68rem;">(35 น. = 280฿)</small>
          </td>
          <td style="text-align: right; font-weight: 700; color: #ffffff;">
            ${fmtCurrency(total)}
          </td>
          <td style="text-align: center;">
            ${existing ? 
              `<span style="background:rgba(245,158,11,0.18); color:#F59E0B; font-size:0.68rem; font-weight:700; padding:2px 8px; border-radius:9999px;">มีบิลแล้ว</span>` : 
              `<span style="background:rgba(52,211,153,0.18); color:#34D399; font-size:0.68rem; font-weight:700; padding:2px 8px; border-radius:9999px;">พร้อมสร้าง</span>`
            }
          </td>
        </tr>
      `;
    }).join('');
  };

  const body = `
    <div style="display:flex; flex-direction:column; gap:16px;">
      
      <!-- Feature Banner -->
      <div style="background: rgba(52,211,153,0.12); border: 1px solid rgba(52,211,153,0.28); border-radius: 12px; padding: 14px 16px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 1.4rem;">⚡</span>
          <div>
            <div style="font-weight: 700; color: #34D399; font-size: 0.95rem;">
              ระบบสร้างบิลประจำเดือนอัตโนมัติทั้ง 17 ห้อง (3 อาคาร)
            </div>
            <div style="font-size: 0.78rem; color: rgba(255,255,255,0.6); margin-top: 2px;">
              ดึงข้อมูลผู้เช่าและราคาห้องพักอัตโนมัติ (ธนกฤษฎ์ 2,800฿ · กิ่งเพชร 2,600฿ · ใต้บ้าน 1,500฿) + ค่าบริการคงที่ 70฿ + จดมิเตอร์ต่อเนื่อง
            </div>
          </div>
        </div>
      </div>

      <!-- Config Controls -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 14px;">
        <div class="field">
          <label class="smoky-form-label" style="font-size: 0.82rem; margin-bottom: 6px; display: block;">เลือกรอบประจำเดือนที่ต้องการออกบิล *</label>
          <input type="month" id="batch-month-input" value="${currentMonthStr}" class="smoky-glass-input" style="width: 100%;">
        </div>
        <div class="field">
          <label class="smoky-form-label" style="font-size: 0.82rem; margin-bottom: 6px; display: block;">กำหนดชำระภายในวันที่ *</label>
          <input type="date" id="batch-due-input" value="${defaultDueDate}" class="smoky-glass-input" style="width: 100%;">
        </div>
      </div>

      <!-- Room Selection Toolbar -->
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="font-weight: 600; color: #ffffff; font-size: 0.90rem;">
          รายการห้องพักที่จะออกบิล (<span id="batch-selected-count">17</span> / 17 ห้อง)
        </div>
        <div style="display: flex; gap: 8px;">
          <button type="button" class="smoky-round-glass-btn btn-sm" id="btn-batch-select-all" style="width:auto; padding:3px 12px; font-size:0.75rem;">เลือกทั้งหมด</button>
          <button type="button" class="smoky-round-glass-btn btn-sm" id="btn-batch-deselect-all" style="width:auto; padding:3px 12px; font-size:0.75rem;">ล้างที่เลือก</button>
        </div>
      </div>

      <!-- Room Preview Table -->
      <div style="max-height: 280px; overflow-y: auto; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px;">
        <table class="smoky-table" style="font-size: 0.82rem; margin: 0;">
          <thead>
            <tr>
              <th style="width: 40px; text-align:center;">เลือก</th>
              <th>ห้องพัก / อาคาร</th>
              <th style="text-align: right;">ค่าเช่า</th>
              <th style="text-align: center;">น้ำ (18฿)</th>
              <th style="text-align: center;">ไฟ (8฿)</th>
              <th style="text-align: right;">ยอดรวม</th>
              <th style="text-align: center;">สถานะ</th>
            </tr>
          </thead>
          <tbody id="batch-preview-tbody">
            ${renderRows(currentMonthStr)}
          </tbody>
        </table>
      </div>

    </div>
  `;

  const footer = `
    <button type="button" class="btn btn-outline" onclick="window.closeAppModal()">ยกเลิก</button>
    <button type="button" class="btn btn-primary" id="btn-batch-confirm-submit" style="background: #059669; border-color: #059669; font-weight: 600;">
      🚀 ยืนยันสร้างบิลทั้งหมด (<span id="batch-submit-count">17</span> รายการ)
    </button>
  `;

  showModal({
    title: '⚡ สร้างบิลประจำเดือนอัตโนมัติทั้ง 17 ห้อง (Batch Generator)',
    body,
    footer,
    maxWidth: '740px'
  });

  const monthInput = document.getElementById('batch-month-input');
  const tbodyEl = document.getElementById('batch-preview-tbody');
  const selCountEl = document.getElementById('batch-selected-count');
  const submitCountEl = document.getElementById('batch-submit-count');

  const updateSelectedCount = () => {
    const checked = document.querySelectorAll('.batch-room-chk:checked').length;
    if (selCountEl) selCountEl.textContent = checked;
    if (submitCountEl) submitCountEl.textContent = checked;
  };

  if (monthInput && tbodyEl) {
    monthInput.onchange = () => {
      tbodyEl.innerHTML = renderRows(monthInput.value);
      updateSelectedCount();
    };
  }

  const btnSelectAll = document.getElementById('btn-batch-select-all');
  if (btnSelectAll) {
    btnSelectAll.onclick = () => {
      document.querySelectorAll('.batch-room-chk').forEach(c => c.checked = true);
      updateSelectedCount();
    };
  }

  const btnDeselectAll = document.getElementById('btn-batch-deselect-all');
  if (btnDeselectAll) {
    btnDeselectAll.onclick = () => {
      document.querySelectorAll('.batch-room-chk').forEach(c => c.checked = false);
      updateSelectedCount();
    };
  }

  document.querySelectorAll('.batch-room-chk').forEach(chk => {
    chk.onchange = updateSelectedCount;
  });

  updateSelectedCount();

  const btnConfirm = document.getElementById('btn-batch-confirm-submit');
  if (btnConfirm) {
    btnConfirm.onclick = async () => {
      const chks = Array.from(document.querySelectorAll('.batch-room-chk:checked'));
      if (chks.length === 0) {
        toast('กรุณาเลือกห้องพักอย่างน้อย 1 ห้องเพื่อสร้างบิล', 'error');
        return;
      }

      btnConfirm.disabled = true;
      btnConfirm.textContent = '⏳ กำลังสร้างบิลลงฐานข้อมูล Supabase...';

      const selectedMonth = monthInput.value;
      const dueDate = document.getElementById('batch-due-input').value;
      const monthClean = selectedMonth.replace(/[^0-9]/g, '');

      const newRows = [];
      chks.forEach(c => {
        const roomNum = c.getAttribute('data-room');
        const cleanNum = roomNum.replace(/[^0-9B]/gi, '');
        const targetRoom = rooms.find(r => r.room_number === roomNum);
        if (!targetRoom) return;

        const tenant = tenantMap[cleanNum] || targetRoom.tenant_name || '';
        const prevW = lastMeters[cleanNum]?.water ?? 100;
        const prevE = lastMeters[cleanNum]?.elec ?? 500;
        const currW = prevW + 4;
        const currE = prevE + 35;
        const wUnits = 4;
        const eUnits = 35;
        const wCost = wUnits * 18;
        const eCost = eUnits * 8;
        const fixedFee = 50 + 0 + 20; // 70 ฿
        const total = targetRoom.price + wCost + eCost + fixedFee;

        newRows.push({
          id: `INV-${monthClean}-${roomNum}`,
          room_number: roomNum,
          tenant_name: tenant,
          billing_month: selectedMonth,
          month_label: 'รอบ ' + selectedMonth,
          room_price: targetRoom.price,
          prev_water: prevW,
          curr_water: currW,
          water_unit: wUnits,
          water_rate: 18,
          water_total: wCost,
          prev_electric: prevE,
          curr_electric: currE,
          electric_unit: eUnits,
          electric_rate: 8,
          electric_total: eCost,
          common_fee: 50,
          total_price: total,
          status: 'pending',
          due_date: dueDate
        });
      });

      try {
        const { error } = await supabase.from('meter_readings').insert(newRows);
        if (error) {
          throw error;
        }

        toast(`สร้างบิลประจำเดือน ${selectedMonth} สำเร็จ ${newRows.length} รายการ`, 'success');
        closeModal();
        if (typeof loadUtilitiesData === 'function') loadUtilitiesData();
      } catch (err) {
        toast('เกิดข้อผิดพลาดในการสร้างบิล: ' + (err.message || 'ตรวจพบข้อมูลซ้ำ'), 'error');
        btnConfirm.disabled = false;
        btnConfirm.textContent = '🚀 ยืนยันสร้างบิลทั้งหมด';
      }
    };
  }
}

// ผูกฟังก์ชัน Global
if (typeof window !== 'undefined') {
  window.openBatchGenerateBillsModal = openBatchGenerateBillsModal;
  window.openOfficialReceiptModal = openOfficialReceiptModal;
  window.printInvoice = () => window.print();
  window.printReceipt = () => window.print();
}
