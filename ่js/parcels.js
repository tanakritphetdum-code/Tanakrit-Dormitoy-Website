// js/parcels.js
import { supabase } from './supabase.js';
import { ic, fmtDate, showModal, closeModal, toast } from './api.js';
import { currentUser } from './auth.js';

let parcelFilter = 'all';
let parcelSearch = '';

export async function renderParcelsView() {
  setTimeout(() => {
    bindParcelsEvents();
    loadParcelsData();
  }, 0);

  const isStudent = currentUser && currentUser.role === 'student';

  return `
    <div class="card">
      <div class="card-header-actions">
        <div>
          <h3>${ic('box')} ระบบพัสดุและไปรษณีย์ภัณฑ์ (Parcel Management)</h3>
          <p style="color: var(--muted); margin-top: 4px; font-size: 0.9rem;">
            ${isStudent ? 'ตรวจสอบรายการพัสดุที่มาถึงหอพัก และยืนยันการรับพัสดุ' : 'บันทึกพัสดุที่จัดส่งถึงหอพัก แจ้งเตือนผู้พัก และบันทึกประวัติการรับ'}
          </p>
        </div>
        ${!isStudent ? `
          <button class="btn btn-primary" id="btn-add-parcel">
            ${ic('plus')} บันทึกพัสดุเข้าใหม่
          </button>
        ` : ''}
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="toolbar-filter-grid" style="margin-top: 16px;">
        <div class="search-box-wrap" style="flex: 1;">
          ${ic('search')}
          <input type="text" id="parcels-search-input" placeholder="ค้นหาเลขพัสดุ, ชื่อผู้รับ หรือหมายเลขห้อง...">
        </div>

        <div class="filter-tabs" id="parcel-filter-tabs">
          <button class="filter-tab-btn active" data-status="all">ทั้งหมด</button>
          <button class="filter-tab-btn" data-status="waiting">รอผู้พักมารับ</button>
          <button class="filter-tab-btn" data-status="collected">รับแล้วเรียบร้อย</button>
        </div>
      </div>

      <div class="table-responsive" style="margin-top: 16px;">
        <table class="modern-table">
          <thead>
            <tr>
              <th>หมายเลขพัสดุ / ขนส่ง</th>
              <th>ห้องพัก / ผู้รับ</th>
              <th>ลักษณะพัสดุ</th>
              <th>วันที่มาถึง</th>
              <th>สถานะ</th>
              <th>การดำเนินการ</th>
            </tr>
          </thead>
          <tbody id="parcels-tbody">
            <tr><td colspan="6" style="text-align:center; padding: 30px; color:var(--muted);">กำลังโหลดข้อมูลพัสดุ...</td></tr>
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

  if (error || !parcels) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--danger); padding: 24px;">ไม่สามารถโหลดข้อมูลพัสดุได้</td></tr>`;
    return;
  }

  let list = parcels;
  const isStudent = currentUser && currentUser.role === 'student';
  if (isStudent && currentUser.room) {
    list = parcels.filter(p => p.room_number === currentUser.room);
  }

  if (parcelFilter !== 'all') {
    list = list.filter(p => p.status === parcelFilter);
  }

  if (parcelSearch) {
    const q = parcelSearch.toLowerCase();
    list = list.filter(p => 
      (p.tracking_number || '').toLowerCase().includes(q) ||
      (p.recipient_name || '').toLowerCase().includes(q) ||
      (p.room_number || '').toLowerCase().includes(q) ||
      (p.courier || '').toLowerCase().includes(q)
    );
  }

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 30px; color:var(--muted);">ไม่พบรายการพัสดุตามเงื่อนไข</td></tr>`;
    return;
  }

  let html = '';
  list.forEach(p => {
    const isCollected = p.status === 'collected';
    const badgeClass = isCollected ? 'approved' : 'pending';
    const badgeText = isCollected ? 'รับแล้ว' : 'รอรับที่สำนักงาน';

    html += `
      <tr>
        <td>
          <div style="font-weight: 600; color:var(--teal-950);">${p.tracking_number}</div>
          <small style="color:var(--emerald); font-weight:500;">${p.courier}</small>
        </td>
        <td>
          <div style="font-weight: 600; color:var(--teal-900);">ห้อง ${p.room_number}</div>
          <small style="color:var(--muted);">${p.recipient_name}</small>
        </td>
        <td>${p.description || 'กล่องพัสดุมาตรฐาน'}</td>
        <td>
          <div>${fmtDate(p.arrived_at)}</div>
          ${isCollected && p.collected_at ? `<small style="color:var(--muted);">รับเมื่อ: ${fmtDate(p.collected_at)}</small>` : ''}
        </td>
        <td><span class="badge ${badgeClass}">${badgeText}</span></td>
        <td>
          ${!isCollected ? `
            <button class="btn btn-primary btn-sm btn-collect-parcel" data-id="${p.id}" title="บันทึกว่ารับแล้ว">
              ${ic('check')} ยืนยันรับพัสดุ
            </button>
          ` : `
            <span style="font-size:0.85rem; color:var(--muted);">✓ รับมอบเรียบร้อย</span>
          `}
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;

  tbody.querySelectorAll('.btn-collect-parcel').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id');
      const target = parcels.find(x => x.id === id);
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
}

function bindParcelsEvents() {
  const tabs = document.getElementById('parcel-filter-tabs');
  if (tabs) {
    tabs.querySelectorAll('.filter-tab-btn').forEach(btn => {
      btn.onclick = () => {
        tabs.querySelectorAll('.filter-tab-btn').forEach(b => b.classList.remove('active'));
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

  const btnAdd = document.getElementById('btn-add-parcel');
  if (btnAdd) btnAdd.onclick = openAddParcelModal;
}

function openAddParcelModal() {
  const body = `
    <form id="form-add-parcel">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
        <div class="field">
          <label>บริษัทขนส่ง *</label>
          <select id="pk-courier" class="form-select">
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
          <label>หมายเลขพัสดุ (Tracking No.) *</label>
          <input type="text" id="pk-tracking" placeholder="เช่น TH0129384756" required>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
        <div class="field">
          <label>ห้องพักผู้รับ *</label>
          <input type="text" id="pk-room" placeholder="เช่น 302" required>
        </div>
        <div class="field">
          <label>ชื่อผู้รับตามจ่าหน้า *</label>
          <input type="text" id="pk-name" placeholder="เช่น นายสมชาย ช่างศิลป์" required>
        </div>
      </div>

      <div class="field">
        <label>ลักษณะพัสดุ / หมายเหตุ</label>
        <input type="text" id="pk-desc" placeholder="เช่น กล่องใหญ่, ซองเอกสาร, อาหาร/ของสด">
      </div>
    </form>
  `;

  const footer = `
    <button type="button" class="btn btn-outline" onclick="window.closeAppModal()">ยกเลิก</button>
    <button type="button" class="btn btn-primary" id="btn-submit-parcel">บันทึกรับพัสดุ</button>
  `;

  showModal({
    title: 'บันทึกพัสดุมาส่งใหม่',
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

    await supabase.from('parcels').insert([{
      tracking_number: tracking,
      courier,
      room_number: room,
      recipient_name: name,
      description: desc || 'กล่องพัสดุ',
      status: 'waiting',
      arrived_at: new Date().toISOString().split('T')[0]
    }]);

    toast(`บันทึกพัสดุสำหรับห้อง ${room} สำเร็จ`, 'success');
    closeModal();
    loadParcelsData();
  };
}
