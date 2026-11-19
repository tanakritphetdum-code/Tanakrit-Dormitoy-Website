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
import { toast, ic, closeModal } from './api.js';

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

  // ตรวจสอบ Session ที่มีอยู่เดิม
  const existingUser = initAuth();
  if (existingUser) {
    document.getElementById('page-landing').classList.add('hidden');
    document.getElementById('page-app').classList.remove('hidden');
    setupSidebarMenu(existingUser);
    switchView('dashboard');
  }

  // ผูกการทำงานปุ่ม Topbar Tabs (Overview / Sales / Marketing / Support)
  const topTabs = document.querySelectorAll('#smoky-top-tabs .smoky-tab');
  topTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      topTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.getAttribute('data-tab');
      if (target === 'Overview') switchView('dashboard');
      else if (target === 'Sales') switchView('reports');
      else if (target === 'Marketing') switchView('deals');
      else if (target === 'Support') switchView('maintenance');
    });
  });
});

// ตั้งค่าเมนู Sidebar ตามสิทธิ์ผู้ใช้งาน (Role) — รูปแบบ Floating Capsule Icon-Only
export function setupSidebarMenu(user) {
  const nameEl = document.getElementById('header-user-name');
  const roleEl = document.getElementById('header-user-role-label');

  if (nameEl) nameEl.textContent = user.name;
  if (roleEl) roleEl.textContent = user.roleTitle || user.role.toUpperCase();

  const nav = document.getElementById('sidebar-nav');
  if (!nav) return;

  const items = (user.role === 'admin' || user.role === 'staff') ? [
    { view: 'dashboard', icon: 'home', label: 'Overview / ภาพรวมระบบ' },
    { view: 'search', icon: 'search', label: 'Search / ค้นหาด่วน' },
    { view: 'products', icon: 'shoppingBag', label: 'Products / ผังห้องพัก 3 อาคาร' },
    { view: 'parcels', icon: 'box', label: 'Deliveries / พัสดุไปรษณีย์' },
    { view: 'customers', icon: 'users', label: 'Customers / ทะเบียนผู้พัก' },
    { view: 'deals', icon: 'layoutGrid', label: 'Deals Pipeline / สัญญาเช่า' },
    { view: 'announcements', icon: 'messageCircle', label: 'Messages / กระดานข่าวสาร', badge: 3 },
    { view: 'bookings', icon: 'calendar', label: 'Schedules / การจองห้องพัก' },
    { view: 'reports', icon: 'chart', label: 'Analytics / รายงานสถิติ' },
    { view: 'utilities', icon: 'chevronDown', label: 'More Services / มิเตอร์น้ำ-ไฟ' },
  ] : [
    { view: 'dashboard', icon: 'home', label: 'Home / หน้าหลักผู้พัก' },
    { view: 'products', icon: 'shoppingBag', label: 'Room Info / ข้อมูลห้องพัก' },
    { view: 'parcels', icon: 'box', label: 'Parcels / พัสดุของฉัน' },
    { view: 'requests', icon: 'layoutGrid', label: 'Requests / ยื่นคำร้อง' },
    { view: 'announcements', icon: 'messageCircle', label: 'Announcements / ประกาศหอพัก', badge: 1 },
    { view: 'utilities', icon: 'chart', label: 'Invoices / บิลค่าน้ำ-ไฟ' },
    { view: 'profile', icon: 'users', label: 'Profile / ข้อมูลส่วนตัว' },
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
  const bodyEl = document.getElementById('app-content-body');
  if (!bodyEl) return;

  // อัปเดตสถานะ Active บน Topbar Tabs
  const topTabs = document.querySelectorAll('#smoky-top-tabs .smoky-tab');
  if (topTabs) {
    topTabs.forEach(tab => {
      const t = tab.getAttribute('data-tab');
      let shouldActive = false;
      if (viewName === 'dashboard' && t === 'Overview') shouldActive = true;
      if ((viewName === 'reports' || viewName === 'utilities') && t === 'Sales') shouldActive = true;
      if ((viewName === 'deals' || viewName === 'bookings' || viewName === 'products') && t === 'Marketing') shouldActive = true;
      if ((viewName === 'maintenance' || viewName === 'parcels' || viewName === 'requests') && t === 'Support') shouldActive = true;
      tab.classList.toggle('active', shouldActive);
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

  // Animation fade out & skeleton effect
  bodyEl.style.opacity = '0';
  bodyEl.style.filter = 'blur(6px)';
  bodyEl.style.transition = 'opacity 0.2s ease, filter 0.2s ease';

  setTimeout(async () => {
    if (viewName === 'dashboard') {
      bodyEl.innerHTML = currentUser && currentUser.role === 'student' ? renderStudentDashboard() : renderStaffDashboard();
    } else if (viewName === 'deals') {
      bodyEl.innerHTML = renderDealsPipelineView();
    } else if (viewName === 'customers') {
      bodyEl.innerHTML = renderCustomersView();
    } else if (viewName === 'products') {
      bodyEl.innerHTML = renderProductsView();
    } else if (viewName === 'search') {
      bodyEl.innerHTML = renderCustomersView();
    } else if (viewName === 'rooms') {
      bodyEl.innerHTML = await renderRoomsView();
    } else if (viewName === 'tenants') {
      bodyEl.innerHTML = renderCustomersView();
    } else if (viewName === 'bookings') {
      bodyEl.innerHTML = await renderBookingsView();
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
      bodyEl.innerHTML = renderProfileView();
      bindProfileForm();
    } else if (viewName === 'settings') {
      bodyEl.innerHTML = await renderSettingsView();
    }

    // Fade in
    bodyEl.style.opacity = '1';
    bodyEl.style.filter = 'none';
    bodyEl.scrollTo({ top: 0, behavior: 'smooth' });
  }, 100);
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
        localStorage.setItem('tanakrit_current_user', JSON.stringify(currentUser));
        localStorage.setItem('kp_current_user', JSON.stringify(currentUser));
        document.getElementById('header-user-name').textContent = newName;
      }
      toast('บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว', 'success');
    });
  }
}
