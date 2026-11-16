// js/utilities.js
import { supabase } from './supabase.js';
import { ic, fmtCurrency, fmtDate, showModal, closeModal, toast, compressImage, showImageModal } from './api.js';
import { currentUser } from './auth.js';

let utilityStatusFilter = 'all';

export async function renderUtilitiesView() {
  setTimeout(() => {
    bindUtilitiesEvents();
    loadUtilitiesData();
  }, 0);

  return `
    <div class="card">
      <div class="card-header-actions">
        <div>
          <h3>${ic('bill')} ระบบบันทึกมิเตอร์น้ำ-ไฟ และออกใบแจ้งหนี้ (Billing & Utilities)</h3>
          <p style="color: var(--muted); margin-top: 4px; font-size: 0.9rem;">
            คำนวณค่าน้ำ ค่าไฟ ค่าเช่าห้อง ตรวจสอบสลิปโอนเงิน และสร้าง QR Code สแกนจ่าย
          </p>
        </div>
        <button class="btn btn-primary" id="btn-add-meter">
          ${ic('plus')} จดมิเตอร์รอบใหม่
        </button>
      </div>

      <!-- Quick Summary Stats -->
      <div class="room-stats-summary" id="utility-summary-stats">
        <!-- populated via JS -->
      </div>

      <!-- Filters & Actions -->
      <div class="toolbar-filter-grid" style="margin-top: 16px;">
        <div class="filter-tabs" id="utility-status-tabs">
          <button class="filter-tab-btn active" data-status="all">ทั้งหมด</button>
          <button class="filter-tab-btn" data-status="pending">รอชำระเงิน</button>
          <button class="filter-tab-btn" data-status="verifying" style="color:#E65100;">รอตรวจสลิป ⏳</button>
          <button class="filter-tab-btn" data-status="paid">ชำระแล้ว</button>
        </div>
        <div style="margin-left: auto;">
          <button class="btn btn-outline" id="btn-refresh-utilities">${ic('check')} รีเฟรชข้อมูล</button>
        </div>
      </div>

      <div class="table-responsive" style="margin-top: 16px;">
        <table class="modern-table">
          <thead>
            <tr>
              <th>เลขที่บิล / ห้อง</th>
              <th>รอบประจำเดือน</th>
              <th>ค่าน้ำประปา (18฿/หน่วย)</th>
              <th>ค่าไฟฟ้า (8฿/หน่วย)</th>
              <th>ยอดรวมทั้งสิ้น</th>
              <th>สถานะการชำระ</th>
              <th>จัดการบิล</th>
            </tr>
          </thead>
          <tbody id="utilities-tbody">
            <tr><td colspan="7" style="text-align:center; padding: 30px; color:var(--muted);">กำลังโหลดข้อมูลค่าน้ำ-ค่าไฟ...</td></tr>
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
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--danger); padding: 24px;">ไม่สามารถโหลดข้อมูลค่าน้ำ-ค่าไฟได้</td></tr>`;
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
      <div class="rstat-item total">
        <span class="num">${fmtCurrency(totalRevenue)}</span>
        <span class="lbl">ยอดเรียกเก็บรวม (${totalBills} บิล)</span>
      </div>
      <div class="rstat-item vacant">
        <span class="num" style="color:var(--danger);">${fmtCurrency(pendingAmount)}</span>
        <span class="lbl">รอชำระ (${pendingBills.length} บิล)</span>
      </div>
      <div class="rstat-item" style="background:#FFF8E1; border:1px solid #FFE082;">
        <span class="num" style="color:#E65100;">${verifyingBills.length}</span>
        <span class="lbl" style="color:#B78103; font-weight:600;">รอตรวจสลิป ⏳</span>
      </div>
      <div class="rstat-item occupied">
        <span class="num">${paidBills.length}</span>
        <span class="lbl">ชำระแล้วเรียบร้อย</span>
      </div>
    `;
  }

  let filtered = readings;
  if (utilityStatusFilter !== 'all') {
    filtered = readings.filter(r => r.status === utilityStatusFilter);
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 30px; color:var(--muted);">ไม่มีรายการบิลในหมวดหมู่นี้</td></tr>`;
    return;
  }

  let html = '';
  filtered.forEach(r => {
    const isPaid = r.status === 'paid';
    const isVerifying = r.status === 'verifying';
    let badgeClass = 'pending';
    let badgeText = 'รอชำระ';

    if (isPaid) {
      badgeClass = 'approved';
      badgeText = '✓ ชำระแล้ว';
    } else if (isVerifying) {
      badgeClass = 'verifying';
      badgeText = '⏳ รอตรวจสลิป';
    }

    html += `
      <tr>
        <td>
          <div style="font-weight: 600; color:var(--teal-950);">ห้อง ${r.room_number}</div>
          <small style="color:var(--muted);">${r.tenant_name || '-'} (${r.id})</small>
        </td>
        <td>
          <div style="font-weight: 500;">${r.month_label || r.billing_month}</div>
          <small style="color:var(--muted);">ครบกำหนด: ${fmtDate(r.due_date)}</small>
        </td>
        <td>
          <div>${r.water_unit || 0} หน่วย (${r.prev_water}➔${r.curr_water})</div>
          <small style="color:var(--muted);">${fmtCurrency(r.water_total || (r.water_unit * 18))}</small>
        </td>
        <td>
          <div>${r.electric_unit || 0} หน่วย (${r.prev_electric}➔${r.curr_electric})</div>
          <small style="color:var(--muted);">${fmtCurrency(r.electric_total || (r.electric_unit * 8))}</small>
        </td>
        <td>
          <strong style="color:var(--teal-900); font-size: 1.05rem;">${fmtCurrency(r.total_price)}</strong>
        </td>
        <td><span class="badge ${badgeClass}">${badgeText}</span></td>
        <td>
          <div style="display: flex; gap: 6px; align-items:center;">
            ${isVerifying ? `
              <button class="btn btn-primary btn-sm btn-view-invoice" data-id="${r.id}" style="background:#E65100; border-color:#E65100;" title="ตรวจสอบสลิปโอนเงิน">
                ${ic('eye')} ตรวจสลิป
              </button>
            ` : `
              <button class="btn btn-outline btn-sm btn-view-invoice" data-id="${r.id}" title="เปิดดูใบแจ้งหนี้ / สแกนจ่าย">
                ${ic('bill')} ใบแจ้งหนี้
              </button>
            `}
            ${r.slip_url ? `
              <img src="${r.slip_url}" class="img-thumb-preview" alt="สลิป" onclick="event.stopPropagation(); window.showImageModal('${r.slip_url}', 'สลิปโอนเงิน ห้อง ${r.room_number}')" title="คลิกดูสลิปขนาดเต็ม">
            ` : ''}
            <button class="btn ${isPaid ? 'btn-outline' : 'btn-primary'} btn-sm btn-toggle-pay" data-id="${r.id}" title="${isPaid ? 'เปลี่ยนเป็นยังไม่ชำระ' : 'ยืนยันรับชำระเงิน'}">
              ${isPaid ? ic('x') : ic('check')}
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
}

function bindUtilitiesEvents() {
  const tabs = document.getElementById('utility-status-tabs');
  if (tabs) {
    tabs.querySelectorAll('.filter-tab-btn').forEach(btn => {
      btn.onclick = () => {
        tabs.querySelectorAll('.filter-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        utilityStatusFilter = btn.getAttribute('data-status');
        loadUtilitiesData();
      };
    });
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
  const qrMockUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=PROMPTPAY-0899998877-AMOUNT-${bill.total_price}`;

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
            <div style="font-size: 0.85rem; color: var(--muted);">หอพักชายธนกฤษฎ์ นครศรีธรรมราช</div>
            <div style="font-size: 0.8rem; color: var(--muted);">123 หมู่ 4 ต.ท่าเรือ อ.เมือง จ.นครศรีธรรมราช โทร. 075-345-678</div>
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
            <td><strong>ค่าเช่าห้องพักประจำเดือน</strong></td>
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
            <td>ค่าบริการส่วนกลางและอินเทอร์เน็ต Wi-Fi</td>
            <td style="text-align: center;">-</td>
            <td style="text-align: center;">1 เหมาจ่าย</td>
            <td style="text-align: right;">100 ฿</td>
            <td style="text-align: right;">100 ฿</td>
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
              รองรับทุกแอปพลิเคชันธนาคาร (พร้อมเพย์: 089-999-8877 นายเกียรติศักดิ์ บริหาร)<br>
              เมื่อโอนชำระเรียบร้อย สามารถแนบสลิปด้านล่างเพื่อให้เจ้าหน้าที่อนุมัติทันที
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
    <button type="button" class="btn btn-outline" onclick="window.printInvoice()">${ic('printer')} พิมพ์ใบแจ้งหนี้ / ใบเสร็จ</button>
    <button type="button" class="btn btn-primary" onclick="window.closeAppModal()">ปิด</button>
  `;

  showModal({
    title: `ใบแจ้งหนี้ค่าเช่าและสาธารณูปโภค — ห้อง ${bill.room_number}`,
    body,
    footer,
    maxWidth: '640px'
  });

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
        const notes = document.getElementById('slip-notes-input') ? document.getElementById('slip-notes-input').value.trim() : '';

        const { error } = await supabase.from('meter_readings').eq('id', bill.id).update({
          status: 'verifying',
          slip_url: dataUrl,
          slip_uploaded_at: new Date().toISOString(),
          payment_notes: notes
        });

        if (error) {
          toast('เกิดข้อผิดพลาดในการบันทึกสลิป', 'error');
          btnSubmitSlip.disabled = false;
          btnSubmitSlip.textContent = '🚀 ส่งหลักฐานการชำระเงินให้เจ้าหน้าที่';
          return;
        }

        toast('ส่งหลักฐานสลิปโอนเงินเรียบร้อยแล้ว อยู่ระหว่างเจ้าหน้าที่ตรวจสอบ', 'success');
        closeModal();
        if (typeof loadUtilitiesData === 'function') loadUtilitiesData();
      } catch (err) {
        console.error('Slip upload error:', err);
        toast('ไม่สามารถประมวลผลรูปภาพสลิปได้', 'error');
        btnSubmitSlip.disabled = false;
      }
    };
  }

  // Bind Events อนุมัติ / ปฏิเสธ สำหรับ Admin & Staff
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

// Modal จดมิเตอร์ใหม่
async function openAddMeterModal() {
  const { data: rooms } = await supabase.from('rooms').select('*').order('room_number', { ascending: true });
  const roomOptions = (rooms || []).map(r => `
    <option value="${r.room_number}" data-price="${r.price}" data-tenant="${r.tenant_name || ''}">
      ห้อง ${r.room_number} (${r.type}) - ${r.tenant_name || 'ว่าง'}
    </option>
  `).join('');

  const body = `
    <form id="form-meter-reading">
      <div class="field" style="margin-bottom: 14px;">
        <label>เลือกห้องพัก *</label>
        <select id="mr-room" class="form-select">
          ${roomOptions}
        </select>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
        <div class="field">
          <label>รอบเดือนประจำบิล</label>
          <input type="month" id="mr-month" value="2026-10" required>
        </div>
        <div class="field">
          <label>ค่าเช่าห้องพัก (บาท)</label>
          <input type="number" id="mr-room-price" value="3500" required>
        </div>
      </div>

      <!-- Water Section -->
      <div style="background: var(--mint-50); border: 1px solid var(--line); border-radius: 10px; padding: 14px; margin-bottom: 14px;">
        <div style="font-weight: 600; color: var(--teal-950); margin-bottom: 8px;">💧 มิเตอร์น้ำประปา (18 บาท/หน่วย)</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
          <div class="field">
            <label style="font-size:0.8rem;">เลขครั้งก่อน</label>
            <input type="number" id="mr-water-prev" value="100">
          </div>
          <div class="field">
            <label style="font-size:0.8rem;">เลขครั้งนี้ *</label>
            <input type="number" id="mr-water-curr" value="105" required>
          </div>
          <div class="field">
            <label style="font-size:0.8rem;">รวมเงิน (น้ำ)</label>
            <input type="text" id="mr-water-total" disabled value="90 ฿">
          </div>
        </div>
      </div>

      <!-- Electric Section -->
      <div style="background: #fdf8e7; border: 1px solid #f2c14e; border-radius: 10px; padding: 14px; margin-bottom: 14px;">
        <div style="font-weight: 600; color: #8F6B1A; margin-bottom: 8px;">⚡ มิเตอร์ไฟฟ้า (8 บาท/หน่วย)</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
          <div class="field">
            <label style="font-size:0.8rem;">เลขครั้งก่อน</label>
            <input type="number" id="mr-elec-prev" value="500">
          </div>
          <div class="field">
            <label style="font-size:0.8rem;">เลขครั้งนี้ *</label>
            <input type="number" id="mr-elec-curr" value="545" required>
          </div>
          <div class="field">
            <label style="font-size:0.8rem;">รวมเงิน (ไฟ)</label>
            <input type="text" id="mr-elec-total" disabled value="360 ฿">
          </div>
        </div>
      </div>

      <div style="background: var(--sky-100); border-radius: 10px; padding: 12px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 600; color: var(--teal-950);">ยอดรวมทั้งสิ้น (รวมค่าห้อง + ส่วนกลาง 100฿):</span>
        <strong style="font-size: 1.3rem; color: var(--teal-900);" id="mr-grand-total">4,050 ฿</strong>
      </div>
    </form>
  `;

  const footer = `
    <button type="button" class="btn btn-outline" onclick="window.closeAppModal()">ยกเลิก</button>
    <button type="button" class="btn btn-primary" id="btn-submit-meter">บันทึกและสร้างบิล</button>
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

    const grand = roomPrice + wCost + eCost + 100;

    document.getElementById('mr-water-total').value = wCost + ' ฿';
    document.getElementById('mr-elec-total').value = eCost + ' ฿';
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
