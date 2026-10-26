// js/auth.js
import { toast } from './api.js';

export const USERS = [
  { username: 'admin', password: 'admin123', role: 'admin', name: 'นายเกียรติศักดิ์ บริหาร (ผู้จัดการหอพัก)', initial: 'ผ', tenantId: null, room: null, roleTitle: 'ผู้ดูแลระบบสูงสุด' },
  { username: 'staff', password: 'staff123', role: 'staff', name: 'นางสาวสมหญิง เจ้าหน้าที่หอพัก', initial: 'ส', tenantId: null, room: null, roleTitle: 'เจ้าหน้าที่ธุรการ/ช่าง' },
  { username: 'student', password: 'student123', role: 'student', name: 'นายสมชาย ช่างศิลป์', initial: 'ส', tenantId: '6512345', room: '302', phone: '089-123-4567', roleTitle: 'ผู้พักอาศัย (ห้อง 302)' },
];

export let currentUser = null;

// กู้คืน Session อัตโนมัติถ้าเคยล็อกอินไว้
export function initAuth() {
  try {
    const saved = localStorage.getItem('kp_current_user');
    if (saved) {
      currentUser = JSON.parse(saved);
      return currentUser;
    }
  } catch (e) {
    currentUser = null;
  }
  return null;
}

export function handleLogin(e, onSuccess) {
  if (e) e.preventDefault();
  const u = document.getElementById('login-username').value.trim();
  const p = document.getElementById('login-password').value;
  const found = USERS.find(x => x.username.toLowerCase() === u.toLowerCase() && x.password === p);
  const errBox = document.getElementById('login-error');

  if (!found) {
    if (errBox) {
      errBox.classList.remove('hidden');
      errBox.style.display = 'block';
    }
    toast('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', 'error');
    return;
  }

  if (errBox) {
    errBox.classList.add('hidden');
    errBox.style.display = 'none';
  }

  setCurrentUser(found);
  toggleLoginModal(false);

  if (onSuccess) onSuccess(found);
  toast(`ยินดีต้อนรับ ${found.name}`, 'success');
}

export function quickLoginAs(roleName, onSuccess) {
  const found = USERS.find(x => x.role === roleName);
  if (!found) return;
  setCurrentUser(found);
  toggleLoginModal(false);
  if (onSuccess) onSuccess(found);
  toast(`เข้าสู่ระบบในฐานะ ${found.name} (${found.roleTitle})`, 'success');
}

export function setCurrentUser(user) {
  currentUser = user;
  localStorage.setItem('kp_current_user', JSON.stringify(user));
  document.getElementById('page-landing').classList.add('hidden');
  document.getElementById('page-app').classList.remove('hidden');
}

export function handleLogout() {
  currentUser = null;
  localStorage.removeItem('kp_current_user');
  document.getElementById('page-app').classList.add('hidden');
  document.getElementById('page-landing').classList.remove('hidden');
  const form = document.getElementById('login-form');
  if (form) form.reset();
  toggleLoginModal(false);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  toast('ออกจากระบบเรียบร้อยแล้ว', 'info');
}

export function toggleLoginModal(forceOpen) {
  const modal = document.getElementById('login-modal');
  if (!modal) return;
  const isCurrentlyOpen = modal.classList.contains('active') && !modal.classList.contains('hidden');
  const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : !isCurrentlyOpen;
  if (shouldOpen) {
    modal.classList.remove('hidden');
    modal.classList.add('active');
    setTimeout(() => {
      const input = document.getElementById('login-username');
      if (input) input.focus();
    }, 100);
  } else {
    modal.classList.remove('active');
    modal.classList.add('hidden');
  }
}

export function toggleSidebar(open) {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  if (sidebar) sidebar.classList.toggle('open', open);
  if (overlay) overlay.style.display = open ? 'block' : 'none';
}
