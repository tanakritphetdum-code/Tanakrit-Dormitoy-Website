// js/auth.js
// ระบบยืนยันตัวตน (Authentication) เชื่อมต่อตาราง users ใน Supabase Cloud
import { toast } from './api.js';
import { supabase } from './supabase.js';

// รายชื่อบัญชีเริ่มต้นสำรอง (สำหรับกรณีออฟไลน์)
export const USERS = [
  { username: 'admin', password: 'admin123', role: 'admin', name: 'นายเกียรติศักดิ์ บริหาร (ผู้จัดการหอพัก)', initial: 'ผ', tenantId: null, room: null, roleTitle: 'ผู้ดูแลระบบสูงสุด' },
  { username: 'staff', password: 'staff123', role: 'staff', name: 'นางสาวสมหญิง เจ้าหน้าที่หอพัก', initial: 'ส', tenantId: null, room: null, roleTitle: 'เจ้าหน้าที่ธุรการ/ช่าง' },
  { username: 'student', password: 'student123', role: 'student', name: 'นายสมชาย ธนกฤษฎ์', initial: 'ส', tenantId: '6512345', room: '302', phone: '089-123-4567', roleTitle: 'ผู้พักอาศัย (ห้อง 302)' },
];

export let currentUser = null;

// กู้คืน Session อัตโนมัติถ้าเคยล็อกอินไว้
export function initAuth() {
  try {
    const saved = localStorage.getItem('tanakrit_current_user') || localStorage.getItem('kp_current_user');
    if (saved) {
      currentUser = JSON.parse(saved);
      return currentUser;
    }
  } catch (e) {
    currentUser = null;
  }
  return null;
}

// ตรวจสอบการ Login ผ่าน Supabase users table หรือ Local Storage สำรอง
export async function handleLogin(e, onSuccess) {
  if (e) e.preventDefault();
  const u = document.getElementById('login-username').value.trim();
  const p = document.getElementById('login-password').value;
  const errBox = document.getElementById('login-error');
  const btnSubmit = document.querySelector('#login-form button[type="submit"]');

  if (btnSubmit) {
    btnSubmit.disabled = true;
    btnSubmit.textContent = 'กำลังตรวจสอบ...';
  }

  try {
    let found = null;

    // โหลดรหัสผ่านล่าสุดที่ผู้ใช้งานบันทึกไว้ในเครื่อง (ถ้ามี)
    let pwdOverrides = {};
    try {
      pwdOverrides = JSON.parse(localStorage.getItem('tanakrit_pwd_overrides') || '{}');
    } catch (_) {}
    const localOverride = pwdOverrides[u.toLowerCase()];

    // 1. ตรวจสอบผ่านตาราง users บน Supabase Cloud
    try {
      const { data, error } = await supabase.from('users').eq('username', u);
      if (!error && data && data.length > 0) {
        const user = data[0];
        const validPwd = localOverride || user.password;
        if (p === validPwd || p === user.password) {
          found = {
            ...user,
            password: p,
            tenantId: user.tenant_id,
            roleTitle: user.role_title || (user.role === 'admin' ? 'ผู้ดูแลระบบสูงสุด' : (user.role === 'staff' ? 'เจ้าหน้าที่หอพัก' : `ผู้พักอาศัย (ห้อง ${user.room || '-'})`)),
            initial: user.name ? user.name.trim().charAt(0) : 'U'
          };
        }
      }
    } catch (dbErr) {
      console.warn('Supabase login check skipped / offline:', dbErr);
    }

    // 2. สำรอง: ถ้าเชื่อมต่อ Supabase ไม่ได้หรือไม่มี ให้ดูใน USERS และเช็ครหัสผ่านใหม่
    if (!found) {
      const fallback = USERS.find(x => x.username.toLowerCase() === u.toLowerCase());
      if (fallback) {
        const expectedPwd = localOverride || fallback.password;
        if (p === expectedPwd) {
          found = {
            ...fallback,
            password: expectedPwd
          };
        }
      }
    }

    if (!found) {
      if (errBox) {
        errBox.textContent = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
        errBox.classList.remove('hidden');
        errBox.style.display = 'block';
      }
      toast('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', 'error');
      return;
    }

    if (found.status === 'suspended') {
      if (errBox) {
        errBox.textContent = 'บัญชีผู้ใช้นี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ';
        errBox.classList.remove('hidden');
        errBox.style.display = 'block';
      }
      toast('บัญชีผู้ใช้นี้ถูกระงับการใช้งาน', 'error');
      return;
    }

    if (errBox) {
      errBox.classList.add('hidden');
      errBox.style.display = 'none';
    }

    if (!found.initial && found.name) {
      found.initial = found.name.trim().charAt(0);
    }

    setCurrentUser(found);
    toggleLoginModal(false);

    if (onSuccess) onSuccess(found);
    toast(`ยินดีต้อนรับ ${found.name}`, 'success');
  } catch (err) {
    console.error('Login process error:', err);
    toast('เกิดข้อผิดพลาดในการตรวจสอบบัญชีผู้ใช้', 'error');
  } finally {
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.textContent = 'เข้าสู่ระบบ';
    }
  }
}

// 1-Click Quick Demo Login (ดึงข้อมูลล่าสุดจาก Supabase หรือสำรอง)
export async function quickLoginAs(roleName, onSuccess) {
  try {
    let pwdOverrides = {};
    try {
      pwdOverrides = JSON.parse(localStorage.getItem('tanakrit_pwd_overrides') || '{}');
    } catch (_) {}

    let found = null;
    try {
      const { data } = await supabase.from('users').eq('role', roleName);
      if (data && data.length > 0) {
        const u = data[0];
        found = {
          ...u,
          password: pwdOverrides[u.username.toLowerCase()] || u.password,
          tenantId: u.tenant_id,
          roleTitle: u.role_title || (u.role === 'admin' ? 'ผู้ดูแลระบบสูงสุด' : (u.role === 'staff' ? 'เจ้าหน้าที่หอพัก' : `ผู้พักอาศัย (ห้อง ${u.room || '302'})`)),
          initial: u.name ? u.name.trim().charAt(0) : 'U'
        };
      }
    } catch (_) {}

    if (!found) {
      const fallback = USERS.find(x => x.role === roleName);
      if (fallback) {
        found = {
          ...fallback,
          password: pwdOverrides[fallback.username.toLowerCase()] || fallback.password
        };
      }
    }

    if (!found) return;

    setCurrentUser(found);
    toggleLoginModal(false);
    if (onSuccess) onSuccess(found);
    toast(`เข้าสู่ระบบในฐานะ ${found.name} (${found.roleTitle || found.role})`, 'success');
  } catch (e) {
    const fallback = USERS.find(x => x.role === roleName);
    if (fallback) {
      setCurrentUser(fallback);
      toggleLoginModal(false);
      if (onSuccess) onSuccess(fallback);
    }
  }
}

export function setCurrentUser(user) {
  currentUser = user;
  localStorage.setItem('tanakrit_current_user', JSON.stringify(user));
  localStorage.setItem('kp_current_user', JSON.stringify(user));
  document.getElementById('page-landing').classList.add('hidden');
  document.getElementById('page-app').classList.remove('hidden');
}

export function handleLogout() {
  currentUser = null;
  localStorage.removeItem('tanakrit_current_user');
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
