// js/tenants.js
import { supabase } from './supabase.js';
import { ic, fmtDate, showModal, closeModal, toast } from './api.js';

let tenantSearchTerm = '';

export async function renderTenantsView() {
  setTimeout(() => {
    bindTenantsEvents();
    loadTenantsData();
  }, 0);

  return `
    <div class="card">
      <div class="card-header-actions">
        <div>
          <h3>${ic('users')} ทะเบียนผู้พักอาศัย (Tenants Directory)</h3>
          <p style="color: var(--muted); margin-top: 4px; font-size: 0.9rem;">
            จัดการรายชื่อ ประวัติการเข้าพัก และข้อมูลติดต่อของผู้เช่าทั้งหมด
          </p>
        </div>
        <button class="btn btn-primary" id="btn-add-tenant">
          ${ic('plus')} ลงทะเบียนผู้พักใหม่
        </button>
      </div>

      <!-- Search Toolbar -->
      <div class="toolbar-filter-grid" style="margin-top: 16px;">
        <div class="search-box-wrap" style="flex: 1;">
          ${ic('search')}
          <input type="text" id="tenants-search-input" placeholder="ค้นหาชื่อ, รหัสนักศึกษา, ห้องพัก หรือเบอร์โทร...">
        </div>
        <button class="btn btn-outline" id="btn-refresh-tenants">${ic('check')} รีเฟรชข้อมูล</button>
      </div>

      <div class="table-responsive" style="margin-top: 16px;">
        <table class="modern-table">
          <thead>
            <tr>
              <th>รหัสผู้เช่า</th>
              <th>ชื่อ - นามสกุล</th>
              <th>ห้องพัก</th>
              <th>เบอร์โทรศัพท์</th>
              <th>วันที่เข้าพัก</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody id="tenants-tbody">
            <tr><td colspan="6" style="text-align:center; padding: 30px; color:var(--muted);">กำลังโหลดข้อมูลผู้พัก...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function loadTenantsData() {
  const tbody = document.getElementById('tenants-tbody');
  if (!tbody) return;

  const { data: tenants, error } = await supabase.from('tenants').select('*').order('room', { ascending: true });

  if (error || !tenants) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--danger); padding: 24px;">ไม่สามารถโหลดข้อมูลผู้พักได้</td></tr>`;
    return;
  }

  let filtered = tenants;
  if (tenantSearchTerm) {
    const q = tenantSearchTerm.toLowerCase();
    filtered = tenants.filter(t => 
      (t.name || '').toLowerCase().includes(q) ||
      (t.tenant_id || '').toLowerCase().includes(q) ||
      (t.room || '').toLowerCase().includes(q) ||
      (t.phone || '').toLowerCase().includes(q) ||
      (t.major || '').toLowerCase().includes(q)
    );
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--muted); padding: 30px;">ไม่พบข้อมูลผู้เช่าตามคำค้นหา</td></tr>`;
    return;
  }

  let html = '';
  filtered.forEach(t => {
    html += `
      <tr>
        <td><strong style="color:var(--teal-900);">${t.tenant_id || t.id.slice(0, 6)}</strong></td>
        <td>
          <div style="font-weight: 500; color:var(--teal-950);">${t.name}</div>
          <small style="color:var(--muted);">${t.email || '-'}</small>
        </td>
        <td><span class="badge room-pill">ห้อง ${t.room}</span></td>
        <td>${t.phone ? `<a href="tel:${t.phone}" style="color:var(--emerald);">${t.phone}</a>` : '-'}</td>
        <td>${fmtDate(t.check_in)}</td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button class="btn btn-outline btn-sm btn-edit-tenant" data-tenant-id="${t.id}" title="แก้ไขข้อมูล">
              ${ic('edit')} แก้ไข
            </button>
            <button class="btn btn-outline btn-sm btn-del-tenant" data-tenant-id="${t.id}" style="color:var(--danger); border-color:var(--danger);" title="ย้ายออก/ลบ">
              ${ic('trash')}
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;

  tbody.querySelectorAll('.btn-edit-tenant').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-tenant-id');
      const target = tenants.find(x => x.id === id);
      if (target) openEditTenantModal(target);
    };
  });

  tbody.querySelectorAll('.btn-del-tenant').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-tenant-id');
      const target = tenants.find(x => x.id === id);
      if (!target) return;
      if (confirm(`ยืนยันการแจ้งย้ายออก / ลบข้อมูลผู้พัก "${target.name}" ห้อง ${target.room}?`)) {
        await supabase.from('tenants').eq('id', id).delete();
        // Update room status to vacant if needed
        const { data: matchedRooms } = await supabase.from('rooms').eq('room_number', target.room);
        if (matchedRooms && matchedRooms.length > 0) {
          await supabase.from('rooms').eq('room_number', target.room).update({
            status: 'vacant',
            tenant_name: '',
            tenant_phone: ''
          });
        }
        toast(`นำข้อมูลของ ${target.name} ออกจากระบบเรียบร้อยแล้ว`, 'info');
        loadTenantsData();
      }
    };
  });
}

function bindTenantsEvents() {
  const input = document.getElementById('tenants-search-input');
  if (input) {
    input.oninput = (e) => {
      tenantSearchTerm = e.target.value.trim();
      loadTenantsData();
    };
  }

  const btnAdd = document.getElementById('btn-add-tenant');
  if (btnAdd) btnAdd.onclick = openAddTenantModal;

  const btnRefresh = document.getElementById('btn-refresh-tenants');
  if (btnRefresh) btnRefresh.onclick = () => {
    toast('รีเฟรชข้อมูลผู้พักเรียบร้อย', 'info');
    loadTenantsData();
  };
}

function openAddTenantModal() {
  const body = `
    <form id="form-add-tenant">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
        <div class="field">
          <label>ชื่อ - นามสกุล *</label>
          <input type="text" id="t-name" placeholder="เช่น นายสมชาย ธนกฤษฎ์" required>
        </div>
        <div class="field">
          <label>รหัสนักศึกษา / ผู้เช่า</label>
          <input type="text" id="t-id" placeholder="เช่น 6512349">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
        <div class="field">
          <label>ห้องพัก *</label>
          <input type="text" id="t-room" placeholder="เช่น 103" required>
        </div>
        <div class="field">
          <label>เบอร์โทรศัพท์ติดต่อ *</label>
          <input type="tel" id="t-phone" placeholder="08x-xxx-xxxx" required>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
        <div class="field">
          <label>อีเมล</label>
          <input type="email" id="t-email" placeholder="example@mail.com">
        </div>
        <div class="field">
          <label>วันที่เริ่มเข้าพัก</label>
          <input type="date" id="t-checkin" value="${new Date().toISOString().split('T')[0]}">
        </div>
      </div>
    </form>
  `;

  const footer = `
    <button type="button" class="btn btn-outline" onclick="window.closeAppModal()">ยกเลิก</button>
    <button type="button" class="btn btn-primary" id="btn-submit-add-tenant">บันทึกข้อมูลผู้เช่า</button>
  `;

  showModal({
    title: 'ลงทะเบียนผู้พักอาศัยใหม่',
    body,
    footer,
    maxWidth: '560px'
  });

  document.getElementById('btn-submit-add-tenant').onclick = async () => {
    const name = document.getElementById('t-name').value.trim();
    const tid = document.getElementById('t-id').value.trim() || 'T-' + Math.floor(1000 + Math.random() * 9000);
    const room = document.getElementById('t-room').value.trim();
    const phone = document.getElementById('t-phone').value.trim();
    const email = document.getElementById('t-email').value.trim();
    const checkin = document.getElementById('t-checkin').value;

    if (!name || !room || !phone) {
      toast('กรุณากรอกข้อมูลที่จำเป็น (*) ให้ครบถ้วน', 'error');
      return;
    }

    await supabase.from('tenants').insert([{
      name,
      tenant_id: tid,
      room,
      phone,
      email,
      check_in: checkin,
      role: 'student'
    }]);

    // Update room status
    await supabase.from('rooms').eq('room_number', room).update({
      status: 'occupied',
      tenant_name: name,
      tenant_phone: phone
    });

    toast(`ลงทะเบียน ${name} เข้าห้อง ${room} สำเร็จ`, 'success');
    closeModal();
    loadTenantsData();
  };
}

function openEditTenantModal(tenant) {
  const body = `
    <form id="form-edit-tenant">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
        <div class="field">
          <label>ชื่อ - นามสกุล *</label>
          <input type="text" id="ed-name" value="${tenant.name}" required>
        </div>
        <div class="field">
          <label>รหัสนักศึกษา / ผู้เช่า</label>
          <input type="text" id="ed-id" value="${tenant.tenant_id || ''}">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
        <div class="field">
          <label>ห้องพัก *</label>
          <input type="text" id="ed-room" value="${tenant.room}" required>
        </div>
        <div class="field">
          <label>เบอร์โทรศัพท์ติดต่อ *</label>
          <input type="tel" id="ed-phone" value="${tenant.phone || ''}" required>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
        <div class="field">
          <label>อีเมล</label>
          <input type="email" id="ed-email" value="${tenant.email || ''}">
        </div>
        <div class="field">
          <label>วันที่เริ่มเข้าพัก</label>
          <input type="date" id="ed-checkin" value="${tenant.check_in || ''}">
        </div>
      </div>
    </form>
  `;

  const footer = `
    <button type="button" class="btn btn-outline" onclick="window.closeAppModal()">ยกเลิก</button>
    <button type="button" class="btn btn-primary" id="btn-submit-edit-tenant">บันทึกการแก้ไข</button>
  `;

  showModal({
    title: `แก้ไขข้อมูลผู้พัก: ${tenant.name}`,
    body,
    footer,
    maxWidth: '560px'
  });

  document.getElementById('btn-submit-edit-tenant').onclick = async () => {
    const name = document.getElementById('ed-name').value.trim();
    const tid = document.getElementById('ed-id').value.trim();
    const room = document.getElementById('ed-room').value.trim();
    const phone = document.getElementById('ed-phone').value.trim();
    const email = document.getElementById('ed-email').value.trim();
    const checkin = document.getElementById('ed-checkin').value;

    await supabase.from('tenants').eq('id', tenant.id).update({
      name,
      tenant_id: tid,
      room,
      phone,
      email,
      check_in: checkin
    });

    toast('แก้ไขข้อมูลผู้เช่าเรียบร้อยแล้ว', 'success');
    closeModal();
    loadTenantsData();
  };
}
