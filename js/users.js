// js/users.js
// ระบบจัดการบัญชีผู้ใช้งาน (User Management) สำหรับ Admin
// ออกแบบด้วย Smoky Frosted Glass Design System รองรับทั้ง Dark Mode และ Light Mode
import { supabase } from './supabase.js';
import { ic, showModal, closeModal, toast } from './api.js';
import { USERS, currentUser } from './auth.js';

let usersSearchTerm = '';
let currentRoleFilter = 'all';

export async function renderUsersView() {
  setTimeout(() => {
    bindUsersEvents();
    loadUsersData();
  }, 0);

  return `
    <div style="display: flex; flex-direction: column; gap: 22px;">
      
      <!-- 1. Header Card (Smoky Glass) -->
      <div class="smoky-card" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(59,130,246,0.18); border: 1px solid rgba(59,130,246,0.32); display: flex; align-items: center; justify-content: center; color: #3B82F6;">
            ${ic('user')}
          </div>
          <div>
            <h2 style="font-size: 1.35rem; font-weight: 700; color: #ffffff; margin: 0; letter-spacing: -0.02em;">
              จัดการบัญชีผู้ใช้งาน (User Management)
            </h2>
            <span style="font-size: 0.82rem; color: rgba(255,255,255,0.48); margin-top: 3px; display: block;">
              กำหนดสิทธิ์การเข้าใช้งาน เพิ่ม/แก้ไข และรีเซ็ตรหัสผ่านสำหรับ Admin, เจ้าหน้าที่ และผู้พักอาศัย
            </span>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <button class="smoky-round-glass-btn" id="btn-add-user" style="width: auto; border-radius: 9999px; padding: 0 18px; height: 38px; background: #3B82F6; color: #ffffff; border: 1px solid rgba(59,130,246,0.5); box-shadow: 0 0 20px rgba(59,130,246,0.4); font-size: 0.82rem; font-weight: 600; gap: 6px;">
            ${ic('plus')}
            <span>เพิ่มบัญชีผู้ใช้ใหม่</span>
          </button>
        </div>
      </div>

      <!-- 2. User Stats Summary Tiles (Smoky Glass) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 16px;">
        <div class="smoky-tile">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="smoky-meta-label">ผู้ใช้งานทั้งหมด</span>
            <div style="color: rgba(255,255,255,0.4);">${ic('users')}</div>
          </div>
          <div class="smoky-kpi-num" style="margin-top: 8px;" id="stat-total-users">-</div>
          <div class="smoky-kpi-sub">บัญชีในระบบ</div>
        </div>

        <div class="smoky-tile">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="smoky-meta-label">ผู้ดูแลระบบ</span>
            <span style="background: rgba(239,68,68,0.18); color: #EF4444; font-size: 0.65rem; font-weight: 700; padding: 2px 7px; border-radius: 9999px;">Admin</span>
          </div>
          <div class="smoky-kpi-num" style="margin-top: 8px; color: #EF4444;" id="stat-admin-users">-</div>
          <div class="smoky-kpi-sub">สิทธิ์สูงสุด</div>
        </div>

        <div class="smoky-tile">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="smoky-meta-label">เจ้าหน้าที่ / ช่าง</span>
            <span style="background: rgba(59,130,246,0.18); color: #3B82F6; font-size: 0.65rem; font-weight: 700; padding: 2px 7px; border-radius: 9999px;">Staff</span>
          </div>
          <div class="smoky-kpi-num" style="margin-top: 8px; color: #60A5FA;" id="stat-staff-users">-</div>
          <div class="smoky-kpi-sub">ธุรการและซ่อมบำรุง</div>
        </div>

        <div class="smoky-tile">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="smoky-meta-label">ผู้พักอาศัย</span>
            <span style="background: rgba(52,211,153,0.18); color: #34D399; font-size: 0.65rem; font-weight: 700; padding: 2px 7px; border-radius: 9999px;">Student</span>
          </div>
          <div class="smoky-kpi-num" style="margin-top: 8px; color: #34D399;" id="stat-student-users">-</div>
          <div class="smoky-kpi-sub">ผู้เช่า 3 อาคาร</div>
        </div>
      </div>

      <!-- 3. Search & Filter Toolbar (Smoky Glass) -->
      <div class="smoky-card" style="padding: 16px 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
          <!-- Search Input -->
          <div style="position: relative; min-width: 260px; flex: 1; max-width: 360px;">
            <span style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.4); display: flex; align-items: center;">
              ${ic('search')}
            </span>
            <input type="text" id="users-search-input" class="smoky-glass-input" placeholder="ค้นหา Username, ชื่อ, ห้อง หรือเบอร์โทร..." style="width: 100%; padding-left: 38px;">
          </div>

          <!-- Role Tabs (Segmented Control) -->
          <div class="smoky-segmented" id="users-role-tabs" style="overflow-x: auto; max-width: 100%;">
            <button class="smoky-seg-btn active" data-filter="all">ทั้งหมด</button>
            <button class="smoky-seg-btn" data-filter="admin">👑 Admin</button>
            <button class="smoky-seg-btn" data-filter="staff">🛠️ Staff</button>
            <button class="smoky-seg-btn" data-filter="student">🎓 Student</button>
          </div>

          <!-- Refresh Button -->
          <button class="smoky-round-glass-btn" id="btn-refresh-users" style="width: auto; height: 36px; padding: 0 16px; border-radius: 9999px; font-size: 0.78rem; gap: 6px;">
            ${ic('check')}
            <span>รีเฟรช</span>
          </button>
        </div>
      </div>

      <!-- 4. Modern Smoky Table Container -->
      <div class="smoky-table-wrap">
        <table class="smoky-table">
          <thead>
            <tr>
              <th>ชื่อผู้ใช้ (Username)</th>
              <th>ชื่อ - นามสกุล</th>
              <th>สิทธิ์การใช้งาน (Role)</th>
              <th>ห้องพัก</th>
              <th>ข้อมูลติดต่อ</th>
              <th>รหัสผ่าน</th>
              <th>สถานะ</th>
              <th style="text-align: right;">จัดการ</th>
            </tr>
          </thead>
          <tbody id="users-tbody">
            <tr><td colspan="8" style="text-align:center; padding: 40px; color: rgba(255,255,255,0.4);">กำลังโหลดข้อมูลผู้ใช้งาน...</td></tr>
          </tbody>
        </table>
      </div>

    </div>
  `;
}

async function loadUsersData() {
  const tbody = document.getElementById('users-tbody');
  if (!tbody) return;

  let users = null;
  try {
    const { data, error } = await supabase.from('users').select('*').order('role', { ascending: true });
    if (!error && data && data.length > 0) {
      users = data;
    }
  } catch (err) {
    console.warn('Cannot fetch users from Supabase:', err);
  }

  // หาก Supabase ไม่พร้อมใช้งาน ให้ใช้รายการ USERS สำรองพร้อมรหัสผ่านที่เปลี่ยนล่าสุด
  if (!users || users.length === 0) {
    let pwdOverrides = {};
    try {
      pwdOverrides = JSON.parse(localStorage.getItem('tanakrit_pwd_overrides') || '{}');
    } catch (_) {}
    users = USERS.map((u, idx) => ({
      id: 'U-00' + (idx + 1),
      username: u.username,
      password: pwdOverrides[u.username.toLowerCase()] || u.password,
      role: u.role,
      role_title: u.roleTitle,
      name: u.name,
      room: u.room,
      phone: u.phone || '-',
      email: u.email || '-',
      status: 'active'
    }));
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
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color: rgba(255,255,255,0.4); padding: 40px;">ไม่พบข้อมูลผู้ใช้ตามเงื่อนไข</td></tr>`;
    return;
  }

  let html = '';
  filtered.forEach(u => {
    let roleBadge = '';
    if (u.role === 'admin') {
      roleBadge = `<span class="smoky-status-pill pill-rose">👑 Admin</span>`;
    } else if (u.role === 'staff') {
      roleBadge = `<span class="smoky-status-pill pill-blue">🛠️ Staff</span>`;
    } else {
      roleBadge = `<span class="smoky-status-pill pill-green">🎓 Student</span>`;
    }

    const isActive = u.status !== 'suspended';
    const statusPill = isActive
      ? `<span class="smoky-status-pill pill-green">🟢 ใช้งานได้</span>`
      : `<span class="smoky-status-pill pill-rose">🔴 ระงับชั่วคราว</span>`;

    html += `
      <tr>
        <td>
          <div style="font-weight: 700; color: #60A5FA; font-family: monospace; font-size: 0.95rem;">
            ${u.username}
          </div>
          <small style="color: rgba(255,255,255,0.4); font-size: 0.72rem;">${u.id}</small>
        </td>
        <td>
          <div style="font-weight: 600; color: #ffffff;">${u.name}</div>
          <small style="color: rgba(255,255,255,0.45); font-size: 0.72rem;">${u.role_title || '-'}</small>
        </td>
        <td>${roleBadge}</td>
        <td>${u.room ? `<span class="smoky-bldg-badge">ห้อง ${u.room}</span>` : '<span style="color: rgba(255,255,255,0.3);">-</span>'}</td>
        <td>
          <div>${u.phone && u.phone !== '-' ? `<a href="tel:${u.phone}" style="color: #60A5FA; text-decoration: none;">${u.phone}</a>` : '<span style="color: rgba(255,255,255,0.3);">-</span>'}</div>
          <small style="color: rgba(255,255,255,0.4); font-size: 0.72rem;">${u.email && u.email !== '-' ? u.email : ''}</small>
        </td>
        <td>
          <span style="font-family: monospace; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); padding: 4px 8px; border-radius: 6px; font-size: 0.82rem; color: rgba(255,255,255,0.85);">
            ${u.password}
          </span>
        </td>
        <td>${statusPill}</td>
        <td style="text-align: right;">
          <div style="display: flex; gap: 6px; justify-content: flex-end;">
            <button class="smoky-round-glass-btn btn-edit-user" data-user-id="${u.id}" title="แก้ไขข้อมูล/รหัสผ่าน" style="width: auto; height: 32px; padding: 0 12px; font-size: 0.76rem; border-radius: 8px; gap: 4px;">
              ${ic('edit')} แก้ไข
            </button>
            <button class="smoky-round-glass-btn btn-toggle-status" data-user-id="${u.id}" data-active="${isActive}" title="${isActive ? 'ระงับการใช้งาน' : 'เปิดใช้งาน'}" style="width: auto; height: 32px; padding: 0 10px; font-size: 0.76rem; border-radius: 8px;">
              ${isActive ? 'ระงับ' : 'เปิดใช้'}
            </button>
            ${u.username !== 'admin' ? `
              <button class="smoky-round-glass-btn btn-del-user" data-user-id="${u.id}" data-username="${u.username}" title="ลบบัญชีนี้" style="width: 32px; height: 32px; border-radius: 8px; color: #F87171; border-color: rgba(248,113,113,0.3);">
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

  // Filter tabs
  const filterTabs = document.getElementById('users-role-tabs');
  if (filterTabs) {
    filterTabs.querySelectorAll('.smoky-seg-btn').forEach(btn => {
      btn.onclick = () => {
        filterTabs.querySelectorAll('.smoky-seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentRoleFilter = btn.getAttribute('data-filter');
        loadUsersData();
      };
    });
  }
}

function openUserModal(user = null) {
  const isEdit = !!user;
  const title = isEdit ? `แก้ไขบัญชีผู้ใช้: ${user.username}` : 'เพิ่มบัญชีผู้ใช้งานใหม่';

  const body = `
    <form id="form-user-edit" style="display: flex; flex-direction: column; gap: 14px;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div class="field">
          <label class="smoky-form-label" style="display: block; margin-bottom: 6px;">ชื่อผู้ใช้งาน (Username) *</label>
          <input type="text" id="u-username" class="smoky-glass-input" value="${user ? user.username : ''}" ${isEdit ? 'disabled' : 'required'} placeholder="เช่น student103, tech1" style="width: 100%;">
        </div>
        <div class="field">
          <label class="smoky-form-label" style="display: block; margin-bottom: 6px;">รหัสผ่าน (Password) *</label>
          <input type="text" id="u-password" class="smoky-glass-input" value="${user ? user.password : ''}" required placeholder="••••••••" style="width: 100%;">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div class="field">
          <label class="smoky-form-label" style="display: block; margin-bottom: 6px;">ระดับสิทธิ์ (Role) *</label>
          <select id="u-role" class="smoky-glass-select" required style="width: 100%;">
            <option value="student" ${user && user.role === 'student' ? 'selected' : ''}>Student (ผู้พักอาศัย)</option>
            <option value="staff" ${user && user.role === 'staff' ? 'selected' : ''}>Staff (เจ้าหน้าที่/ช่าง)</option>
            <option value="admin" ${user && user.role === 'admin' ? 'selected' : ''}>Admin (ผู้ดูแลระบบ)</option>
          </select>
        </div>
        <div class="field">
          <label class="smoky-form-label" style="display: block; margin-bottom: 6px;">เลขห้องพัก (เฉพาะ Student)</label>
          <input type="text" id="u-room" class="smoky-glass-input" value="${user ? (user.room || '') : ''}" placeholder="เช่น 103, 302" style="width: 100%;">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div class="field">
          <label class="smoky-form-label" style="display: block; margin-bottom: 6px;">ชื่อ - นามสกุล *</label>
          <input type="text" id="u-name" class="smoky-glass-input" value="${user ? user.name : ''}" required placeholder="นาย/นาง/น.ส. ..." style="width: 100%;">
        </div>
        <div class="field">
          <label class="smoky-form-label" style="display: block; margin-bottom: 6px;">ตำแหน่ง / คำอธิบายสิทธิ์</label>
          <input type="text" id="u-title" class="smoky-glass-input" value="${user ? (user.role_title || '') : ''}" placeholder="เช่น ผู้พักอาศัย, ช่างเทคนิค" style="width: 100%;">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div class="field">
          <label class="smoky-form-label" style="display: block; margin-bottom: 6px;">เบอร์โทรศัพท์</label>
          <input type="tel" id="u-phone" class="smoky-glass-input" value="${user ? (user.phone || '') : ''}" placeholder="08x-xxx-xxxx" style="width: 100%;">
        </div>
        <div class="field">
          <label class="smoky-form-label" style="display: block; margin-bottom: 6px;">อีเมล</label>
          <input type="email" id="u-email" class="smoky-glass-input" value="${user ? (user.email || '') : ''}" placeholder="example@email.com" style="width: 100%;">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div class="field">
          <label class="smoky-form-label" style="display: block; margin-bottom: 6px;">รหัสนักศึกษา / ผู้เช่า (ถ้ามี)</label>
          <input type="text" id="u-tenant-id" class="smoky-glass-input" value="${user ? (user.tenant_id || '') : ''}" placeholder="เช่น 66565632" style="width: 100%;">
        </div>
        <div class="field">
          <label class="smoky-form-label" style="display: block; margin-bottom: 6px;">สถานะบัญชี</label>
          <select id="u-status" class="smoky-glass-select" style="width: 100%;">
            <option value="active" ${!user || user.status !== 'suspended' ? 'selected' : ''}>🟢 ใช้งานปกติ (Active)</option>
            <option value="suspended" ${user && user.status === 'suspended' ? 'selected' : ''}>🔴 ระงับการใช้งาน (Suspended)</option>
          </select>
        </div>
      </div>
    </form>
  `;

  const footer = `
    <button type="button" class="btn btn-outline" id="btn-cancel-modal" onclick="window.closeAppModal()">ยกเลิก</button>
    <button type="button" class="btn btn-primary" id="btn-submit-user" style="background: #3B82F6; border-color: #3B82F6;">${isEdit ? 'บันทึกการแก้ไข' : 'สร้างบัญชีผู้ใช้'}</button>
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
      try {
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
        if (error) console.warn('Supabase user update warning:', error);
      } catch (dbErr) {
        console.warn('Supabase user update offline / skipped:', dbErr);
      }

      // บันทึกรหัสผ่านใหม่ลง Local Storage เพื่อรองรับการทำงานแบบออฟไลน์
      try {
        const pwdOverrides = JSON.parse(localStorage.getItem('tanakrit_pwd_overrides') || '{}');
        pwdOverrides[user.username.toLowerCase()] = password;
        localStorage.setItem('tanakrit_pwd_overrides', JSON.stringify(pwdOverrides));
      } catch (_) {}

      if (currentUser && currentUser.username && currentUser.username.toLowerCase() === user.username.toLowerCase()) {
        currentUser.password = password;
        localStorage.setItem('tanakrit_current_user', JSON.stringify(currentUser));
        localStorage.setItem('kp_current_user', JSON.stringify(currentUser));
      }

      toast(`แก้ไขบัญชี ${user.username} เรียบร้อยแล้ว`, 'success');
      closeModal();
      loadUsersData();
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
