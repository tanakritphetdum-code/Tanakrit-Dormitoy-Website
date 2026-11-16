// js/users.js
// ระบบจัดการบัญชีผู้ใช้งาน (User Management) สำหรับ Admin
import { supabase } from './supabase.js';
import { ic, showModal, closeModal, toast } from './api.js';

let usersSearchTerm = '';
let currentRoleFilter = 'all';

export async function renderUsersView() {
  setTimeout(() => {
    bindUsersEvents();
    loadUsersData();
  }, 0);

  return `
    <div class="card">
      <div class="card-header-actions">
        <div>
          <h3>${ic('user')} จัดการบัญชีผู้ใช้งาน (User Management)</h3>
          <p style="color: var(--muted); margin-top: 4px; font-size: 0.9rem;">
            กำหนดสิทธิ์การเข้าใช้งาน เพิ่ม/แก้ไข และรีเซ็ตรหัสผ่านสำหรับ Admin, เจ้าหน้าที่ และผู้พักอาศัย
          </p>
        </div>
        <button class="btn btn-primary" id="btn-add-user">
          ${ic('plus')} เพิ่มบัญชีผู้ใช้ใหม่
        </button>
      </div>

      <!-- User Stats Summary Strip -->
      <div class="hero-stats-strip" style="background:#f4fbf7; margin: 18px 0; border: 1px solid var(--line); border-radius:12px; padding:16px;">
        <div class="hstat-item">
          <div class="num" id="stat-total-users" style="color:var(--teal-900); font-size:1.6rem;">-</div>
          <div class="lbl">ผู้ใช้งานทั้งหมด</div>
        </div>
        <div class="hstat-item">
          <div class="num" id="stat-admin-users" style="color:#d9534f; font-size:1.6rem;">-</div>
          <div class="lbl">ผู้ดูแลระบบ (Admin)</div>
        </div>
        <div class="hstat-item">
          <div class="num" id="stat-staff-users" style="color:#0275d8; font-size:1.6rem;">-</div>
          <div class="lbl">เจ้าหน้าที่ (Staff)</div>
        </div>
        <div class="hstat-item">
          <div class="num" id="stat-student-users" style="color:var(--emerald); font-size:1.6rem;">-</div>
          <div class="lbl">ผู้พักอาศัย (Student)</div>
        </div>
      </div>

      <!-- Search & Filter Toolbar -->
      <div class="toolbar-filter-grid" style="margin-top: 16px; display:flex; gap:12px; flex-wrap:wrap; align-items:center;">
        <div class="search-box-wrap" style="flex: 1; min-width: 250px;">
          ${ic('search')}
          <input type="text" id="users-search-input" placeholder="ค้นหาชื่อผู้ใช้ (Username), ชื่อ-นามสกุล, ห้อง หรือเบอร์โทร...">
        </div>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-sm btn-outline filter-btn active" data-filter="all">ทั้งหมด</button>
          <button class="btn btn-sm btn-outline filter-btn" data-filter="admin">Admin</button>
          <button class="btn btn-sm btn-outline filter-btn" data-filter="staff">Staff</button>
          <button class="btn btn-sm btn-outline filter-btn" data-filter="student">Student</button>
          <button class="btn btn-outline" id="btn-refresh-users">${ic('check')} รีเฟรช</button>
        </div>
      </div>

      <div class="table-responsive" style="margin-top: 16px;">
        <table class="modern-table">
          <thead>
            <tr>
              <th>ชื่อผู้ใช้ (Username)</th>
              <th>ชื่อ - นามสกุล</th>
              <th>สิทธิ์การใช้งาน (Role)</th>
              <th>ห้องพัก</th>
              <th>ข้อมูลติดต่อ</th>
              <th>รหัสผ่าน</th>
              <th>สถานะ</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody id="users-tbody">
            <tr><td colspan="8" style="text-align:center; padding: 30px; color:var(--muted);">กำลังโหลดข้อมูลผู้ใช้งาน...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function loadUsersData() {
  const tbody = document.getElementById('users-tbody');
  if (!tbody) return;

  const { data: users, error } = await supabase.from('users').select('*').order('role', { ascending: true });

  if (error || !users) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--danger); padding: 24px;">ไม่สามารถโหลดข้อมูลผู้ใช้งานได้</td></tr>`;
    return;
  }

  // Update summary counts
  const total = users.length;
  const admins = users.filter(u => u.role === 'admin').length;
  const staff = users.filter(u => u.role === 'staff').length;
  const students = users.filter(u => u.role === 'student').length;

  const totalEl = document.getElementById('stat-total-users');
  const adminEl = document.getElementById('stat-admin-users');
  const staffEl = document.getElementById('stat-staff-users');
  const studentEl = document.getElementById('stat-student-users');

  if (totalEl) totalEl.textContent = total;
  if (adminEl) adminEl.textContent = admins;
  if (staffEl) staffEl.textContent = staff;
  if (studentEl) studentEl.textContent = students;

  // Filter
  let filtered = users;
  if (currentRoleFilter !== 'all') {
    filtered = filtered.filter(u => u.role === currentRoleFilter);
  }

  if (usersSearchTerm) {
    const q = usersSearchTerm.toLowerCase();
    filtered = filtered.filter(u =>
      (u.username || '').toLowerCase().includes(q) ||
      (u.name || '').toLowerCase().includes(q) ||
      (u.room || '').toLowerCase().includes(q) ||
      (u.phone || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q)
    );
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--muted); padding: 30px;">ไม่พบข้อมูลผู้ใช้ตามเงื่อนไข</td></tr>`;
    return;
  }

  let html = '';
  filtered.forEach(u => {
    let roleBadge = '';
    if (u.role === 'admin') {
      roleBadge = `<span class="badge" style="background:#FDE8E7; color:var(--danger); font-weight:600;">👑 Admin</span>`;
    } else if (u.role === 'staff') {
      roleBadge = `<span class="badge" style="background:#E3F2FD; color:#0D47A1; font-weight:600;">🛠️ Staff</span>`;
    } else {
      roleBadge = `<span class="badge" style="background:var(--mint-50); color:var(--emerald); font-weight:600;">🎓 Student</span>`;
    }

    const isActive = u.status !== 'suspended';
    const statusPill = isActive
      ? `<span class="badge approved" style="font-size:0.8rem;">🟢 ใช้งานได้</span>`
      : `<span class="badge rejected" style="font-size:0.8rem;">🔴 ระงับชั่วคราว</span>`;

    html += `
      <tr>
        <td>
          <div style="font-weight: 700; color:var(--teal-950); font-family: monospace; font-size:1rem;">
            ${u.username}
          </div>
          <small style="color:var(--muted);">${u.id}</small>
        </td>
        <td>
          <div style="font-weight: 500; color:var(--teal-950);">${u.name}</div>
          <small style="color:var(--muted);">${u.role_title || '-'}</small>
        </td>
        <td>${roleBadge}</td>
        <td>${u.room ? `<span class="badge room-pill">ห้อง ${u.room}</span>` : '<span style="color:var(--muted);">-</span>'}</td>
        <td>
          <div>${u.phone ? `<a href="tel:${u.phone}" style="color:var(--emerald);">${u.phone}</a>` : '-'}</div>
          <small style="color:var(--muted);">${u.email || ''}</small>
        </td>
        <td>
          <div style="font-family:monospace; background:#f4f6f5; padding:4px 8px; border-radius:6px; display:inline-block; font-size:0.85rem;">
            ${u.password}
          </div>
        </td>
        <td>${statusPill}</td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button class="btn btn-outline btn-sm btn-edit-user" data-user-id="${u.id}" title="แก้ไขข้อมูล/รหัสผ่าน">
              ${ic('edit')} แก้ไข
            </button>
            <button class="btn btn-outline btn-sm btn-toggle-status" data-user-id="${u.id}" data-active="${isActive}" title="${isActive ? 'ระงับการใช้งาน' : 'เปิดใช้งาน'}">
              ${isActive ? 'ระงับ' : 'เปิดใช้'}
            </button>
            ${u.username !== 'admin' ? `
              <button class="btn btn-outline btn-sm btn-del-user" data-user-id="${u.id}" data-username="${u.username}" title="ลบบัญชีนี้" style="color:var(--danger); border-color:#fadbd8;">
                ${ic('trash')}
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;

  // Bind Row Buttons
  tbody.querySelectorAll('.btn-edit-user').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-user-id');
      const target = users.find(x => x.id === id);
      if (target) openUserModal(target);
    };
  });

  tbody.querySelectorAll('.btn-toggle-status').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-user-id');
      const target = users.find(x => x.id === id);
      if (!target) return;
      const nextStatus = target.status === 'suspended' ? 'active' : 'suspended';
      await supabase.from('users').eq('id', id).update({ status: nextStatus });
      toast(`เปลี่ยนสถานะบัญชี ${target.username} เป็น ${nextStatus === 'active' ? 'เปิดใช้งาน' : 'ระงับการใช้งาน'} แล้ว`, 'success');
      loadUsersData();
    };
  });

  tbody.querySelectorAll('.btn-del-user').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-user-id');
      const uName = btn.getAttribute('data-username');
      if (confirm(`คุณต้องการลบบัญชีผู้ใช้ "${uName}" หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`)) {
        await supabase.from('users').eq('id', id).delete();
        toast(`ลบบัญชีผู้ใช้ ${uName} สำเร็จ`, 'info');
        loadUsersData();
      }
    };
  });
}

function bindUsersEvents() {
  const input = document.getElementById('users-search-input');
  if (input) {
    input.oninput = (e) => {
      usersSearchTerm = e.target.value.trim();
      loadUsersData();
    };
  }

  const refreshBtn = document.getElementById('btn-refresh-users');
  if (refreshBtn) {
    refreshBtn.onclick = () => {
      toast('กำลังดึงข้อมูลผู้ใช้ล่าสุด...', 'info');
      loadUsersData();
    };
  }

  const addBtn = document.getElementById('btn-add-user');
  if (addBtn) {
    addBtn.onclick = () => openUserModal(null);
  }

  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentRoleFilter = btn.getAttribute('data-filter');
      loadUsersData();
    };
  });
}

function openUserModal(user = null) {
  const isEdit = !!user;
  const title = isEdit ? `แก้ไขบัญชีผู้ใช้: ${user.username}` : 'เพิ่มบัญชีผู้ใช้งานใหม่';

  const body = `
    <form id="form-user-edit">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
        <div class="field">
          <label>ชื่อผู้ใช้งาน (Username) *</label>
          <input type="text" id="u-username" value="${user ? user.username : ''}" ${isEdit ? 'disabled' : 'required'} placeholder="เช่น student103, tech1">
        </div>
        <div class="field">
          <label>รหัสผ่าน (Password) *</label>
          <input type="text" id="u-password" value="${user ? user.password : ''}" required placeholder="••••••••">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
        <div class="field">
          <label>ระดับสิทธิ์ (Role) *</label>
          <select id="u-role" required>
            <option value="student" ${user && user.role === 'student' ? 'selected' : ''}>Student (ผู้พักอาศัย)</option>
            <option value="staff" ${user && user.role === 'staff' ? 'selected' : ''}>Staff (เจ้าหน้าที่/ช่าง)</option>
            <option value="admin" ${user && user.role === 'admin' ? 'selected' : ''}>Admin (ผู้ดูแลระบบ)</option>
          </select>
        </div>
        <div class="field">
          <label>เลขห้องพัก (เฉพาะ Student)</label>
          <input type="text" id="u-room" value="${user ? (user.room || '') : ''}" placeholder="เช่น 103, 302">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
        <div class="field">
          <label>ชื่อ - นามสกุล *</label>
          <input type="text" id="u-name" value="${user ? user.name : ''}" required placeholder="นาย/นาง/น.ส. ...">
        </div>
        <div class="field">
          <label>ตำแหน่ง / คำอธิบายสิทธิ์</label>
          <input type="text" id="u-title" value="${user ? (user.role_title || '') : ''}" placeholder="เช่น ผู้พักอาศัย, ช่างเทคนิค">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
        <div class="field">
          <label>เบอร์โทรศัพท์</label>
          <input type="tel" id="u-phone" value="${user ? (user.phone || '') : ''}" placeholder="08x-xxx-xxxx">
        </div>
        <div class="field">
          <label>อีเมล</label>
          <input type="email" id="u-email" value="${user ? (user.email || '') : ''}" placeholder="example@email.com">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
        <div class="field">
          <label>รหัสนักศึกษา / ผู้เช่า (ถ้ามี)</label>
          <input type="text" id="u-tenant-id" value="${user ? (user.tenant_id || '') : ''}" placeholder="เช่น 66565632">
        </div>
        <div class="field">
          <label>สถานะบัญชี</label>
          <select id="u-status">
            <option value="active" ${!user || user.status !== 'suspended' ? 'selected' : ''}>🟢 ใช้งานปกติ (Active)</option>
            <option value="suspended" ${user && user.status === 'suspended' ? 'selected' : ''}>🔴 ระงับการใช้งาน (Suspended)</option>
          </select>
        </div>
      </div>
    </form>
  `;

  const footer = `
    <button type="button" class="btn btn-outline" id="btn-cancel-modal">ยกเลิก</button>
    <button type="button" class="btn btn-primary" id="btn-submit-user">${isEdit ? 'บันทึกการแก้ไข' : 'สร้างบัญชีผู้ใช้'}</button>
  `;

  showModal({
    title,
    body,
    footer,
    maxWidth: '580px'
  });

  const cancelBtn = document.getElementById('btn-cancel-modal');
  if (cancelBtn) cancelBtn.onclick = closeModal;

  document.getElementById('btn-submit-user').onclick = async () => {
    const username = document.getElementById('u-username').value.trim();
    const password = document.getElementById('u-password').value.trim();
    const role = document.getElementById('u-role').value;
    const room = document.getElementById('u-room').value.trim();
    const name = document.getElementById('u-name').value.trim();
    const title = document.getElementById('u-title').value.trim();
    const phone = document.getElementById('u-phone').value.trim();
    const email = document.getElementById('u-email').value.trim();
    const tenant_id = document.getElementById('u-tenant-id').value.trim();
    const status = document.getElementById('u-status').value;

    if (!username || !password || !name) {
      toast('กรุณากรอก Username, Password และชื่อ-นามสกุลให้ครบถ้วน', 'error');
      return;
    }

    if (isEdit) {
      const { error } = await supabase.from('users').eq('id', user.id).update({
        password,
        role,
        room: role === 'student' ? room : null,
        name,
        role_title: title || (role === 'admin' ? 'ผู้ดูแลระบบสูงสุด' : (role === 'staff' ? 'เจ้าหน้าที่หอพัก' : `ผู้พักอาศัย (ห้อง ${room})`)),
        phone,
        email,
        tenant_id,
        status
      });

      if (error) {
        toast('เกิดข้อผิดพลาดในการแก้ไขบัญชีผู้ใช้', 'error');
        return;
      }
      toast(`แก้ไขบัญชี ${user.username} เรียบร้อยแล้ว`, 'success');
    } else {
      // Check duplicate username
      const { data: exist } = await supabase.from('users').eq('username', username);
      if (exist && exist.length > 0) {
        toast('ชื่อผู้ใช้นี้ (Username) มีอยู่ในระบบแล้ว', 'error');
        return;
      }

      const newId = 'U-' + Math.floor(1000 + Math.random() * 9000);
      const { error } = await supabase.from('users').insert([{
        id: newId,
        username,
        password,
        role,
        room: role === 'student' ? room : null,
        name,
        role_title: title || (role === 'admin' ? 'ผู้ดูแลระบบสูงสุด' : (role === 'staff' ? 'เจ้าหน้าที่หอพัก' : `ผู้พักอาศัย (ห้อง ${room})`)),
        phone,
        email,
        tenant_id,
        status
      }]);

      if (error) {
        toast('เกิดข้อผิดพลาดในการสร้างบัญชีผู้ใช้', 'error');
        return;
      }
      toast(`สร้างบัญชีผู้ใช้ ${username} สำเร็จ`, 'success');
    }

    closeModal();
    loadUsersData();
  };
}
