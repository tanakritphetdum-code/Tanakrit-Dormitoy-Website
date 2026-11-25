// js/app.js
import { handleLogin, handleLogout, toggleLoginModal, toggleSidebar, quickLoginAs, initAuth, currentUser } from './auth.js';
import { renderStaffDashboard, renderStudentDashboard, renderProfileView, renderDealsPipelineView, renderCustomersView, renderProductsView } from './dashboard.js';
import { renderRequestsView, renderNewRequestView, requests } from './requests.js';
import { renderTenantsView } from './tenants.js';
import { renderRoomsView } from './rooms.js';
import { renderUtilitiesView } from './utilities.js';
import { renderMaintenanceView } from './maintenance.js';
import { renderParcelsView } from './parcels.js';
import { renderAnnouncementsView } from './announcements.js';
import { renderReportsView } from './reports.js';
import { renderSettingsView } from './settings.js';
import { renderUsersView } from './users.js';
import { renderBookingsView, openBookingModal } from './bookings.js';
import { toast, ic, showModal, closeModal } from './api.js';
import { supabase } from './supabase.js';
import { initRealtime, onRealtimeChange } from './realtime.js';

// กู้คืนฟังก์ชันปิด Modal สากล
window.closeAppModal = closeModal;
window.toggleLoginModal = toggleLoginModal;
window.openBookingModal = openBookingModal;
window.quickLoginAs = (role) => {
  quickLoginAs(role, (user) => {
    setupSidebarMenu(user);
    switchView('dashboard');
  });
};
window.handleLogout = handleLogout;
window.printInvoice = () => {
  window.print();
};

document.addEventListener('DOMContentLoaded', () => {
  // ปุ่มเปิดหน้าต่าง Login
  const btnToggleLogin = document.getElementById('btn-toggle-login');
  if (btnToggleLogin) {
    btnToggleLogin.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleLoginModal(true);
    });
  }

  // ปุ่มปิดหน้าต่าง Login Modal
  const btnCloseLogin = document.getElementById('btn-close-login-modal');
  if (btnCloseLogin) {
    btnCloseLogin.addEventListener('click', () => toggleLoginModal(false));
  }

  // ปิดเมื่อคลิกด้านนอก Modal
  const loginModal = document.getElementById('login-modal');
  if (loginModal) {
    loginModal.addEventListener('click', (e) => {
      if (e.target === loginModal) toggleLoginModal(false);
    });
  }

  // Submit ฟอร์มล็อกอิน
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      handleLogin(e, (user) => {
        setupSidebarMenu(user);
        switchView('dashboard');
      });
    });
  }

  // ออกจากระบบ
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) btnLogout.addEventListener('click', handleLogout);

  // ปุ่มเปิด/ปิด Sidebar บนมือถือ
  const btnSidebarToggle = document.getElementById('btn-sidebar-toggle');
  if (btnSidebarToggle) btnSidebarToggle.addEventListener('click', () => toggleSidebar(true));

  const overlay = document.getElementById('overlay');
  if (overlay) overlay.addEventListener('click', () => toggleSidebar(false));

  // ตรวจสอบ Theme เริ่มต้น
  initTheme();

  // เริ่มต้นการเชื่อมต่อ Realtime WebSocket สดกับ Supabase Cloud
  initRealtime();

  // ล้างแคชข้อมูลจำลอง (Mock data) เก่าทั้งหมด เพื่อบังคับโหลด Realtime จาก Supabase Cloud 100%
  try {
    const DATA_VERSION = 'tanakrit_realtime_v6_rooms_sync';
    if (localStorage.getItem('tanakrit_data_version') !== DATA_VERSION) {
      localStorage.removeItem('tanakrit_rooms_cache');
      localStorage.removeItem('tanakrit_rooms_cache_v3');
      localStorage.removeItem('tanakrit_tenants_cache');
      localStorage.removeItem('tanakrit_tenants_cache_v3');
      localStorage.removeItem('tanakrit_bookings_cache');
      localStorage.removeItem('tanakrit_parcels_cache');
      localStorage.removeItem('tanakrit_maint_cache');
      localStorage.setItem('tanakrit_data_version', DATA_VERSION);
    }
  } catch (_) {}

  // ตรวจสอบ Session ที่มีอยู่เดิม
  const existingUser = initAuth();
  if (existingUser) {
    document.getElementById('page-landing').classList.add('hidden');
    document.getElementById('page-app').classList.remove('hidden');
    setupSidebarMenu(existingUser);
    switchView('dashboard');
  }

  // ผูกการทำงานปุ่ม Topbar Tabs ในระบบหลังบ้านหอพัก
  const topTabs = document.querySelectorAll('#smoky-top-tabs .smoky-tab');
  topTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      topTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.getAttribute('data-tab');
      switchView(target);
    });
  });
});

// ตั้งค่าเมนู Sidebar ตามสิทธิ์ผู้ใช้งาน (Role) — รูปแบบ Floating Capsule Icon-Only เฉพาะงานที่ใช้งานจริง
export function setupSidebarMenu(user) {
  const nameEl = document.getElementById('header-user-name');
  const roleEl = document.getElementById('header-user-role-label');

  if (nameEl) nameEl.textContent = user.name;
  if (roleEl) roleEl.textContent = user.roleTitle || user.role.toUpperCase();

  const nav = document.getElementById('sidebar-nav');
  if (!nav) return;

  const items = (user.role === 'admin' || user.role === 'staff') ? [
    { view: 'dashboard', icon: 'home', label: 'ภาพรวมหอพัก (Dashboard)' },
    { view: 'rooms', icon: 'door', label: 'ผังห้องพัก 3 อาคาร (Floor Plan)' },
    { view: 'tenants', icon: 'users', label: 'ทะเบียนผู้พักอาศัย (Tenants)' },
    { view: 'utilities', icon: 'bill', label: 'ค่าน้ำ-ค่าไฟ & บิล (Utilities)' },
    { view: 'maintenance', icon: 'wrench', label: 'แจ้งซ่อมบำรุง (Maintenance)' },
    { view: 'parcels', icon: 'box', label: 'พัสดุไปรษณีย์ (Parcels)' },
    { view: 'bookings', icon: 'calendar', label: 'การจองห้องพัก (Bookings)' },
    { view: 'announcements', icon: 'bell', label: 'ประกาศข่าวสาร (Announcements)', badge: 3 },
    { view: 'reports', icon: 'chart', label: 'รายงานและสถิติ (Reports)' },
    { view: 'users', icon: 'userCheck', label: 'จัดการบัญชีผู้ใช้งาน (User Management)' },
    { view: 'settings', icon: 'gear', label: 'ตั้งค่าระบบ (Settings)' },
  ] : [
    { view: 'dashboard', icon: 'home', label: 'หน้าหลักห้องพัก' },
    { view: 'utilities', icon: 'bill', label: 'บิลค่าน้ำ-ไฟ / ชำระเงิน' },
    { view: 'maintenance', icon: 'wrench', label: 'แจ้งซ่อมอุปกรณ์' },
    { view: 'parcels', icon: 'box', label: 'ตรวจสอบพัสดุ' },
    { view: 'announcements', icon: 'bell', label: 'ประกาศหอพัก', badge: 1 },
    { view: 'requests', icon: 'swap', label: 'ยื่นคำร้องสลับห้อง' },
    { view: 'profile', icon: 'user', label: 'ข้อมูลส่วนตัว' },
  ];

  let html = '';
  items.forEach((item, idx) => {
    const isActive = idx === 0;
    html += `
      <div class="smoky-nav-wrapper">
        <button class="smoky-nav-btn ${isActive ? 'active' : ''}" data-view="${item.view}" title="${item.label}">
          ${ic(item.icon)}
          ${item.badge ? `<span class="smoky-nav-badge">${item.badge}</span>` : ''}
        </button>
        <div class="smoky-tooltip">${item.label}</div>
      </div>
    `;
  });

  nav.innerHTML = html;

  nav.querySelectorAll('.smoky-nav-btn').forEach(btn => {
    btn.addEventListener('click', (ev) => {
      ev.preventDefault();
      nav.querySelectorAll('.smoky-nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const v = btn.getAttribute('data-view');
      switchView(v);
    });
  });
}

// สลับมุมมองหน้าจอใน Dashboard
window.switchView = async function(viewName) {
  window.currentAppView = viewName;
  const bodyEl = document.getElementById('app-content-body');
  if (!bodyEl) return;

  // อัปเดตสถานะ Active บน Topbar Tabs ของระบบหลังบ้าน
  const topTabs = document.querySelectorAll('#smoky-top-tabs .smoky-tab');
  if (topTabs) {
    topTabs.forEach(tab => {
      const t = tab.getAttribute('data-tab');
      tab.classList.toggle('active', t === viewName);
    });
  }

  // อัปเดตสถานะ Active บน Sidebar Capsule
  const nav = document.getElementById('sidebar-nav');
  if (nav) {
    nav.querySelectorAll('.smoky-nav-btn').forEach(i => {
      if (i.getAttribute('data-view') === viewName) {
        i.classList.add('active');
      } else {
        i.classList.remove('active');
      }
    });
  }

  // Smooth view transition
  bodyEl.style.opacity = '0.88';
  bodyEl.style.transition = 'opacity 0.1s ease';

  setTimeout(async () => {
    if (viewName === 'dashboard') {
      bodyEl.innerHTML = currentUser && currentUser.role === 'student' ? renderStudentDashboard() : renderStaffDashboard();
    } else if (viewName === 'deals' || viewName === 'bookings') {
      bodyEl.innerHTML = await renderBookingsView();
    } else if (viewName === 'customers' || viewName === 'tenants' || viewName === 'search') {
      bodyEl.innerHTML = await renderTenantsView();
    } else if (viewName === 'products' || viewName === 'rooms') {
      bodyEl.innerHTML = await renderRoomsView();
    } else if (viewName === 'requests') {
      bodyEl.innerHTML = renderRequestsView();
    } else if (viewName === 'new-request') {
      bodyEl.innerHTML = renderNewRequestView();
      bindNewRequestForm();
    } else if (viewName === 'utilities') {
      bodyEl.innerHTML = await renderUtilitiesView();
    } else if (viewName === 'maintenance') {
      bodyEl.innerHTML = await renderMaintenanceView();
    } else if (viewName === 'parcels') {
      bodyEl.innerHTML = await renderParcelsView();
    } else if (viewName === 'announcements') {
      bodyEl.innerHTML = await renderAnnouncementsView();
    } else if (viewName === 'reports') {
      bodyEl.innerHTML = await renderReportsView();
    } else if (viewName === 'users') {
      bodyEl.innerHTML = await renderUsersView();
    } else if (viewName === 'profile') {
      openCompactProfileModal();
      return;
    } else if (viewName === 'settings') {
      bodyEl.innerHTML = await renderSettingsView();
    }

    // Fade in
    bodyEl.style.opacity = '1';
    bodyEl.style.filter = 'none';
    bodyEl.scrollTo({ top: 0, behavior: 'smooth' });
  }, 40);
};

function bindNewRequestForm() {
  const form = document.getElementById('swap-form');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const phone = document.getElementById('f-phone').value.trim();
    const targetRoom = document.getElementById('f-target').value.trim();
    const reason = document.getElementById('f-reason').value.trim();
    const date = document.getElementById('f-date').value;

    if (!phone || !targetRoom || !reason || !date) {
      toast('กรุณากรอกข้อมูลคำร้องให้ครบถ้วน', 'error');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.dataset.origText = submitBtn.textContent;
      submitBtn.textContent = 'กำลังส่งคำร้อง...';
    }

    const reqId = 'REQ-' + Math.floor(1000 + Math.random() * 9000);
    const newReq = {
      id: reqId,
      request_id: reqId,
      requester_name: currentUser.name,
      requester_id: currentUser.tenantId || '6512345',
      current_room: currentUser.room || '302',
      target_room: targetRoom,
      reason: reason,
      effective_date: date,
      phone: phone,
      status: 'pending',
      created_at: new Date().toISOString().split('T')[0]
    };

    const { error } = await supabase.from('requests').insert([newReq]);
    if (error) {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = submitBtn.dataset.origText || 'ส่งคำร้องขอสลับห้อง';
      }
      toast(`เกิดข้อผิดพลาดในการส่งคำร้อง: ${error.message || 'กรุณาลองใหม่'}`, 'error');
      return;
    }

    toast('ส่งคำร้องขอสลับห้องพักเรียบร้อยแล้ว!', 'success');
    switchView('dashboard');
  });
}

// ==================== COMPACT USER PROFILE MODAL (โปรไฟล์ผู้ใช้แบบย่อ) ====================
export function openCompactProfileModal() {
  if (!currentUser) return;

  const initial = (currentUser.name || currentUser.username || 'U')[0].toUpperCase();
  const isAdmin = currentUser.role === 'admin';
  const isStaff = currentUser.role === 'staff';
  const roleBadge = isAdmin
    ? '<span style="font-size: 0.65rem; font-weight: 700; padding: 2px 8px; border-radius: 9999px; background: rgba(239,68,68,0.18); color: #EF4444; border: 1px solid rgba(239,68,68,0.3);">👑 Admin</span>'
    : (isStaff
      ? '<span style="font-size: 0.65rem; font-weight: 700; padding: 2px 8px; border-radius: 9999px; background: rgba(59,130,246,0.18); color: #3B82F6; border: 1px solid rgba(59,130,246,0.3);">🛠️ Staff</span>'
      : `<span style="font-size: 0.65rem; font-weight: 700; padding: 2px 8px; border-radius: 9999px; background: rgba(52,211,153,0.18); color: #10B981; border: 1px solid rgba(52,211,153,0.3);">🏠 ห้อง ${currentUser.room || '-'}</span>`);

  const body = `
    <div style="display: flex; flex-direction: column; gap: 14px;">
      <!-- Profile Header Summary Banner -->
      <div style="display: flex; align-items: center; gap: 14px; padding: 14px 16px; border-radius: 12px; background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.2);">
        <div style="position: relative; flex-shrink: 0;">
          <div style="width: 52px; height: 52px; border-radius: 50%; background: #3B82F6; color: #fff; font-size: 1.4rem; font-weight: 700; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 16px rgba(59,130,246,0.4);">
            ${initial}
          </div>
          <span style="position: absolute; bottom: 0; right: 0; width: 13px; height: 13px; border-radius: 50%; background: #10B981; border: 2px solid #0e121a;"></span>
        </div>
        <div style="flex: 1; min-width: 0;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <h4 style="font-size: 1.05rem; font-weight: 700; color: #ffffff; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" id="cp-display-name">
              ${currentUser.name || currentUser.username}
            </h4>
            ${roleBadge}
          </div>
          <div style="font-size: 0.78rem; color: rgba(255,255,255,0.52); margin-top: 3px;">
            ชื่อผู้ใช้: <strong>@${currentUser.username}</strong> · ${currentUser.roleTitle || 'ผู้ดูแลระบบสูงสุด'}
          </div>
        </div>
      </div>

      <!-- Editable Profile Form -->
      <form id="form-compact-profile" onsubmit="return false;" style="display: flex; flex-direction: column; gap: 12px;">
        <div class="field">
          <label class="smoky-form-label" style="display: block; margin-bottom: 5px; font-size: 0.78rem;">ชื่อ - นามสกุล *</label>
          <input type="text" id="cp-input-name" class="smoky-glass-input" value="${currentUser.name || ''}" required placeholder="เช่น นายธนกฤษฎ์ เพชรดำ (ผู้จัดการหอพัก)" style="width: 100%;">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="field">
            <label class="smoky-form-label" style="display: block; margin-bottom: 5px; font-size: 0.78rem;">เบอร์โทรศัพท์ติดต่อ</label>
            <input type="tel" id="cp-input-phone" class="smoky-glass-input" value="${currentUser.phone || ''}" placeholder="08x-xxx-xxxx" style="width: 100%;">
          </div>
          <div class="field">
            <label class="smoky-form-label" style="display: block; margin-bottom: 5px; font-size: 0.78rem;">อีเมล</label>
            <input type="email" id="cp-input-email" class="smoky-glass-input" value="${currentUser.email || ''}" placeholder="email@example.com" style="width: 100%;">
          </div>
        </div>

        <div class="field">
          <label class="smoky-form-label" style="display: block; margin-bottom: 5px; font-size: 0.78rem;">เปลี่ยนรหัสผ่านใหม่ (เว้นว่างไว้หากไม่ต้องการเปลี่ยน)</label>
          <input type="password" id="cp-input-password" class="smoky-glass-input" placeholder="••••••••" style="width: 100%;">
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; font-size: 0.74rem; color: rgba(255,255,255,0.55);">
          <span>สถานะ: <strong style="color: #34D399;">🟢 ใช้งานปกติ (Active)</strong></span>
          <span>รหัสระบบ: <strong style="color: #60A5FA;">${currentUser.id || currentUser.username}</strong></span>
        </div>
      </form>
    </div>
  `;

  const footer = `
    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
      <button type="button" class="btn btn-outline" id="btn-compact-logout" style="color: #EF4444; border-color: rgba(239,68,68,0.3); font-size: 0.78rem; padding: 6px 14px; gap: 4px;">
        ${ic('logout')} ออกจากระบบ
      </button>
      <div style="display: flex; gap: 8px;">
        <button type="button" class="btn btn-outline" onclick="window.closeAppModal()">ยกเลิก</button>
        <button type="button" class="btn btn-primary" id="btn-save-compact-profile" style="background: #3B82F6; border-color: #3B82F6; font-size: 0.80rem; font-weight: 600; padding: 6px 18px;">
          บันทึกการแก้ไข
        </button>
      </div>
    </div>
  `;

  showModal({
    title: 'โปรไฟล์ผู้ใช้แบบย่อ (User Profile)',
    body,
    footer,
    maxWidth: '520px'
  });

  // Bind Logout
  const logoutBtn = document.getElementById('btn-compact-logout');
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      closeModal();
      handleLogout();
    };
  }

  // Bind Save Profile Changes
  const saveBtn = document.getElementById('btn-save-compact-profile');
  if (saveBtn) {
    saveBtn.onclick = async () => {
      const newName = document.getElementById('cp-input-name').value.trim();
      const newPhone = document.getElementById('cp-input-phone').value.trim();
      const newEmail = document.getElementById('cp-input-email').value.trim();
      const newPassword = document.getElementById('cp-input-password').value.trim();

      if (!newName) {
        toast('กรุณากรอกชื่อ - นามสกุล', 'error');
        return;
      }

      saveBtn.disabled = true;
      saveBtn.textContent = 'กำลังบันทึก...';

      const updateData = {
        name: newName,
        phone: newPhone,
        email: newEmail
      };
      if (newPassword) {
        updateData.password = newPassword;
      }

      // 1. Update Supabase Cloud users table
      let saveRes = currentUser.id
        ? await supabase.from('users').eq('id', currentUser.id).update(updateData)
        : await supabase.from('users').eq('username', currentUser.username).update(updateData);

      if (!saveRes.error && (!Array.isArray(saveRes.data) || saveRes.data.length === 0) && currentUser.username) {
        saveRes = await supabase.from('users').eq('username', currentUser.username).update(updateData);
      }

      if (saveRes.error) {
        saveBtn.disabled = false;
        saveBtn.textContent = 'บันทึกการแก้ไข';
        toast(`บันทึกข้อมูลส่วนตัวไม่สำเร็จ: ${saveRes.error.message || 'กรุณาลองใหม่'}`, 'error');
        return;
      }

      // 2. Update currentUser in memory
      currentUser.name = newName;
      currentUser.phone = newPhone;
      currentUser.email = newEmail;
      currentUser.initial = newName.charAt(0);
      if (newPassword) {
        currentUser.password = newPassword;
        try {
          const pwdOverrides = JSON.parse(localStorage.getItem('tanakrit_pwd_overrides') || '{}');
          pwdOverrides[currentUser.username.toLowerCase()] = newPassword;
          localStorage.setItem('tanakrit_pwd_overrides', JSON.stringify(pwdOverrides));
        } catch (_) {}
      }

      // 3. Update localStorage
      localStorage.setItem('tanakrit_current_user', JSON.stringify(currentUser));
      localStorage.setItem('kp_current_user', JSON.stringify(currentUser));

      // 4. Update Header DOM Elements immediately
      const headerNameEl = document.getElementById('header-user-name');
      if (headerNameEl) headerNameEl.textContent = newName;

      // 5. Update open page content if on users or dashboard
      const topTabs = document.querySelector('#smoky-top-tabs .smoky-tab.active');
      const activeTab = topTabs ? topTabs.getAttribute('data-tab') : '';
      if (activeTab === 'users') {
        const refreshBtn = document.getElementById('btn-refresh-users');
        if (refreshBtn) refreshBtn.click();
      } else if (activeTab === 'dashboard' || !activeTab) {
        window.switchView('dashboard');
      }

      closeModal();
      toast('บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว', 'success');
    };
  }
}

window.openCompactProfileModal = openCompactProfileModal;

// ==================== THEME MANAGEMENT (DARK / LIGHT MODE) ====================
export function initTheme() {
  const savedTheme = localStorage.getItem('tanakrit_theme') || 'dark';
  applyTheme(savedTheme, false);
}

export function applyTheme(theme, notify = false) {
  const root = document.documentElement;
  const pageApp = document.getElementById('page-app');
  const iconEl = document.getElementById('theme-toggle-icon');
  const tooltipEl = document.getElementById('theme-toggle-tooltip');
  const btn = document.getElementById('btn-theme-toggle');

  if (theme === 'light') {
    document.body.classList.add('theme-light');
    if (pageApp) pageApp.classList.add('theme-light');
    root.classList.add('theme-light');
    if (iconEl) {
      // แสดงไอคอนพระจันทร์ สำหรับคลิกกลับไปโหมดมืด
      iconEl.innerHTML = `<svg class="icon" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
    }
    if (tooltipEl) tooltipEl.textContent = 'สลับโหมดมืด (Dark Mode)';
    if (btn) btn.title = 'สลับโหมดมืด (Dark Mode)';
    if (notify && typeof toast === 'function') toast('เปิดใช้งานโหมดสว่าง (Light Mode) เรียบร้อย', 'info');
  } else {
    document.body.classList.remove('theme-light');
    if (pageApp) pageApp.classList.remove('theme-light');
    root.classList.remove('theme-light');
    if (iconEl) {
      // แสดงไอคอนดวงอาทิตย์ สำหรับคลิกไปโหมดสว่าง
      iconEl.innerHTML = `<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
    }
    if (tooltipEl) tooltipEl.textContent = 'สลับโหมดสว่าง (Light Mode)';
    if (btn) btn.title = 'สลับโหมดสว่าง (Light Mode)';
    if (notify && typeof toast === 'function') toast('เปิดใช้งานโหมดมืด (Dark Mode) เรียบร้อย', 'info');
  }
  localStorage.setItem('tanakrit_theme', theme);
}

export function toggleDarkMode() {
  const current = localStorage.getItem('tanakrit_theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next, true);
}

window.initTheme = initTheme;
window.applyTheme = applyTheme;
window.toggleDarkMode = toggleDarkMode;
