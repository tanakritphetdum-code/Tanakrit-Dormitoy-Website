// js/app.js
import { handleLogin, handleLogout, toggleLoginModal, toggleSidebar, quickLoginAs, initAuth, currentUser } from './auth.js';
import { renderStaffDashboard, renderStudentDashboard, renderProfileView } from './dashboard.js';
import { renderRequestsView, renderNewRequestView, requests } from './requests.js';
import { renderTenantsView } from './tenants.js';
import { renderRoomsView } from './rooms.js';
import { renderUtilitiesView } from './utilities.js';
import { renderMaintenanceView } from './maintenance.js';
import { renderParcelsView } from './parcels.js';
import { renderAnnouncementsView } from './announcements.js';
import { renderReportsView } from './reports.js';
import { renderSettingsView } from './settings.js';
import { toast, ic, closeModal } from './api.js';

// กู้คืนฟังก์ชันปิด Modal สากล
window.closeAppModal = closeModal;
window.toggleLoginModal = toggleLoginModal;
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

  // Quick Login Buttons ในหน้าต่าง Login
  document.querySelectorAll('.btn-quick-login').forEach(btn => {
    btn.addEventListener('click', () => {
      const role = btn.getAttribute('data-role');
      quickLoginAs(role, (user) => {
        setupSidebarMenu(user);
        switchView('dashboard');
      });
    });
  });

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

  // ตรวจสอบ Session ที่มีอยู่เดิม
  const existingUser = initAuth();
  if (existingUser) {
    document.getElementById('page-landing').classList.add('hidden');
    document.getElementById('page-app').classList.remove('hidden');
    setupSidebarMenu(existingUser);
    switchView('dashboard');
  }
});

// ตั้งค่าเมนู Sidebar ตามสิทธิ์ผู้ใช้งาน (Role)
export function setupSidebarMenu(user) {
  const initialEl = document.getElementById('header-user-initial');
  const nameEl = document.getElementById('header-user-name');
  const roleEl = document.getElementById('header-user-role-label');

  if (initialEl) initialEl.textContent = user.initial || 'U';
  if (nameEl) nameEl.textContent = user.name;
  if (roleEl) roleEl.textContent = user.roleTitle || user.role.toUpperCase();

  const nav = document.getElementById('sidebar-nav');
  if (!nav) return;

  let html = '';

  if (user.role === 'admin' || user.role === 'staff') {
    html = `
      <div class="sidebar-section-title">เมนูหลัก</div>
      <a href="#" class="nav-item active" data-view="dashboard">${ic('home')} ภาพรวมระบบ (Dashboard)</a>
      <a href="#" class="nav-item" data-view="rooms">${ic('door')} ผังห้องพัก (Floor Plan)</a>
      <a href="#" class="nav-item" data-view="tenants">${ic('users')} ทะเบียนผู้พักอาศัย</a>
      
      <div class="sidebar-section-title">งานบริการและธุรกรรม</div>
      <a href="#" class="nav-item" data-view="utilities">${ic('bill')} ค่าน้ำ-ค่าไฟ & บิล</a>
      <a href="#" class="nav-item" data-view="maintenance">${ic('wrench')} แจ้งซ่อมบำรุง</a>
      <a href="#" class="nav-item" data-view="parcels">${ic('box')} พัสดุไปรษณีย์</a>
      <a href="#" class="nav-item" data-view="announcements">${ic('bell')} กระดานข่าวสาร</a>
      
      <div class="sidebar-section-title">การจัดการ</div>
      <a href="#" class="nav-item" data-view="reports">${ic('chart')} รายงานและสถิติ</a>
      <a href="#" class="nav-item" data-view="settings">${ic('gear')} ตั้งค่าระบบ</a>
    `;
  } else if (user.role === 'student') {
    html = `
      <div class="sidebar-section-title">สำหรับผู้พักอาศัย</div>
      <a href="#" class="nav-item active" data-view="dashboard">${ic('home')} หน้าหลักห้อง ${user.room || '302'}</a>
      <a href="#" class="nav-item" data-view="utilities">${ic('bill')} บิลค่าน้ำ-ไฟ / ชำระเงิน</a>
      <a href="#" class="nav-item" data-view="maintenance">${ic('wrench')} แจ้งซ่อมอุปกรณ์</a>
      <a href="#" class="nav-item" data-view="parcels">${ic('box')} ตรวจสอบพัสดุ</a>
      <a href="#" class="nav-item" data-view="announcements">${ic('bell')} ประกาศหอพัก</a>
      
      <div class="sidebar-section-title">บัญชีของฉัน</div>
      <a href="#" class="nav-item" data-view="profile">${ic('user')} ข้อมูลส่วนตัว</a>
      <a href="#" class="nav-item" data-view="settings">${ic('gear')} เปลี่ยนรหัสผ่าน</a>
    `;
  }

  nav.innerHTML = html;

  nav.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', (ev) => {
      ev.preventDefault();
      nav.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      el.classList.add('active');
      switchView(el.getAttribute('data-view'));
      toggleSidebar(false);
    });
  });
}

// สลับมุมมองหน้าจอใน Dashboard
window.switchView = async function(viewName) {
  const titleEl = document.getElementById('app-view-title');
  const bodyEl = document.getElementById('app-content-body');
  if (!titleEl || !bodyEl) return;

  // Active class on sidebar
  const nav = document.getElementById('sidebar-nav');
  if (nav) {
    nav.querySelectorAll('.nav-item').forEach(i => {
      if (i.getAttribute('data-view') === viewName) {
        i.classList.add('active');
      } else {
        i.classList.remove('active');
      }
    });
  }

  if (viewName === 'dashboard') {
    titleEl.textContent = currentUser.role === 'student' ? `ห้อง ${currentUser.room || '302'} — หน้าหลักผู้พัก` : 'แดชบอร์ดภาพรวมการบริหารงาน';
    bodyEl.innerHTML = currentUser.role === 'student' ? renderStudentDashboard() : renderStaffDashboard();
  } else if (viewName === 'rooms') {
    titleEl.textContent = 'ผังห้องพักและสถานะอาคาร (Floor Plan)';
    bodyEl.innerHTML = await renderRoomsView();
  } else if (viewName === 'tenants') {
    titleEl.textContent = 'ทะเบียนและประวัติผู้พักอาศัย';
    bodyEl.innerHTML = await renderTenantsView();
  } else if (viewName === 'requests') {
    titleEl.textContent = 'จัดการคำร้องขอสลับห้องพัก';
    bodyEl.innerHTML = renderRequestsView();
  } else if (viewName === 'new-request') {
    titleEl.textContent = 'ยื่นคำร้องขอสลับห้องพัก';
    bodyEl.innerHTML = renderNewRequestView();
    bindNewRequestForm();
  } else if (viewName === 'utilities') {
    titleEl.textContent = 'บันทึกมิเตอร์น้ำ-ไฟ และออกใบแจ้งหนี้';
    bodyEl.innerHTML = await renderUtilitiesView();
  } else if (viewName === 'maintenance') {
    titleEl.textContent = 'ระบบแจ้งซ่อมและงานบริการช่าง';
    bodyEl.innerHTML = await renderMaintenanceView();
  } else if (viewName === 'parcels') {
    titleEl.textContent = 'พัสดุไปรษณีย์และจุดรับของ';
    bodyEl.innerHTML = await renderParcelsView();
  } else if (viewName === 'announcements') {
    titleEl.textContent = 'กระดานข่าวสารและประกาศสำคัญ';
    bodyEl.innerHTML = await renderAnnouncementsView();
  } else if (viewName === 'reports') {
    titleEl.textContent = 'รายงานสถิติและผลการดำเนินงาน';
    bodyEl.innerHTML = await renderReportsView();
  } else if (viewName === 'profile') {
    titleEl.textContent = 'ข้อมูลส่วนตัวผู้พักอาศัย';
    bodyEl.innerHTML = renderProfileView();
    bindProfileForm();
  } else if (viewName === 'settings') {
    titleEl.textContent = 'ตั้งค่าระบบและบัญชีผู้ใช้งาน';
    bodyEl.innerHTML = await renderSettingsView();
  }

  // Scroll smoothly to top of content
  bodyEl.scrollTo({ top: 0, behavior: 'smooth' });
};

function bindNewRequestForm() {
  const form = document.getElementById('swap-form');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const phone = document.getElementById('f-phone').value.trim();
    const targetRoom = document.getElementById('f-target').value.trim();
    const reason = document.getElementById('f-reason').value.trim();
    const date = document.getElementById('f-date').value;

    const newReq = {
      id: 'REQ-' + Math.floor(1000 + Math.random() * 9000),
      request_id: 'REQ-' + Math.floor(1000 + Math.random() * 9000),
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
      toast('เกิดข้อผิดพลาดในการส่งคำร้อง', 'error');
      return;
    }

    toast('ส่งคำร้องขอสลับห้องพักเรียบร้อยแล้ว!', 'success');
    switchView('dashboard');
  });
}

function bindProfileForm() {
  const form = document.getElementById('form-profile-save');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const newName = document.getElementById('prof-name').value.trim();
      const newPhone = document.getElementById('prof-phone').value.trim();
      if (currentUser) {
        currentUser.name = newName;
        currentUser.phone = newPhone;
        localStorage.setItem('kp_current_user', JSON.stringify(currentUser));
        document.getElementById('header-user-name').textContent = newName;
      }
      toast('บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว', 'success');
    });
  }
}
