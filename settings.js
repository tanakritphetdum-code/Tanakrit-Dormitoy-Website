// js/settings.js
import { supabase } from './supabase.js';
import { ic, toast } from './api.js';
import { currentUser } from './auth.js';

export async function renderSettingsView() {
  const db = supabase.getRawData();
  const s = db.settings || {};
  const isAdmin = currentUser && currentUser.role === 'admin';

  setTimeout(() => {
    bindSettingsEvents();
  }, 0);

  return `
    <div class="card" style="max-width: 800px; margin: 0 auto;">
      <div class="card-header-actions" style="margin-bottom: 20px;">
        <div>
          <h3>${ic('gear')} ตั้งค่าระบบและบัญชีผู้ใช้งาน</h3>
          <p style="color: var(--muted); margin-top: 4px; font-size: 0.9rem;">
            กำหนดอัตราค่าน้ำ ค่าไฟ บัญชีพร้อมเพย์ และข้อมูลติดต่อของหอพัก
          </p>
        </div>
      </div>

      <!-- Account Settings -->
      <form id="form-account-settings" style="margin-bottom: 32px;">
        <h4 style="color:var(--teal-950); margin-bottom:14px; border-bottom:1.5px solid var(--line); padding-bottom:8px;">
          👤 ข้อมูลบัญชีผู้ใช้งานปัจจุบัน
        </h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 14px;">
          <div class="field">
            <label>ชื่อผู้ใช้งาน (Username)</label>
            <input type="text" value="${currentUser ? currentUser.username : ''}" disabled>
          </div>
          <div class="field">
            <label>ระดับสิทธิ์ (Role)</label>
            <input type="text" value="${currentUser ? currentUser.roleTitle : ''}" disabled>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 14px;">
          <div class="field">
            <label>รหัสผ่านใหม่ (ปล่อยว่างหากไม่เปลี่ยน)</label>
            <input type="password" id="set-new-pwd" placeholder="••••••••">
          </div>
          <div class="field">
            <label>ยืนยันรหัสผ่านใหม่อีกครั้ง</label>
            <input type="password" id="set-confirm-pwd" placeholder="••••••••">
          </div>
        </div>
        <button type="submit" class="btn btn-primary btn-sm">บันทึกรหัสผ่านใหม่</button>
      </form>

      ${isAdmin ? `
        <!-- Dormitory System Rates & Master Info -->
        <form id="form-dorm-settings" style="margin-bottom: 32px;">
          <h4 style="color:var(--teal-950); margin-bottom:14px; border-bottom:1.5px solid var(--line); padding-bottom:8px;">
            🏢 ข้อมูลหอพักและอัตราค่าสาธารณูปโภค (สำหรับ Admin)
          </h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 14px;">
            <div class="field">
              <label>ชื่อหอพัก</label>
              <input type="text" id="set-dorm-name" value="${s.dorm_name || 'Tanakrit Dormitory'}" required>
            </div>
            <div class="field">
              <label>สโลแกน / หน่วยงานสังกัด</label>
              <input type="text" id="set-dorm-sub" value="${s.sub_title || 'หอพักชายธนกฤษฎ์ นครศรีธรรมราช'}">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 14px;">
            <div class="field">
              <label>อัตราค่าน้ำประปา (บาท/หน่วย)</label>
              <input type="number" id="set-water-rate" value="${s.water_rate || 18}" required>
            </div>
            <div class="field">
              <label>อัตราค่าไฟฟ้า (บาท/หน่วย)</label>
              <input type="number" id="set-elec-rate" value="${s.electric_rate || 8}" required>
            </div>
            <div class="field">
              <label>ค่าบริการส่วนกลาง (บาท/เดือน)</label>
              <input type="number" id="set-common-fee" value="${s.common_fee || 100}" required>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 14px;">
            <div class="field">
              <label>เบอร์โทรศัพท์ติดต่อ</label>
              <input type="text" id="set-phone" value="${s.phone || '075-345-678, 089-999-8877'}">
            </div>
            <div class="field">
              <label>Line Official Account</label>
              <input type="text" id="set-line" value="${s.line_id || '@kpdorm'}">
            </div>
          </div>

          <div class="field" style="margin-bottom: 14px;">
            <label>หมายเลขบัญชีพร้อมเพย์สำหรับรับโอนเงินค่าเช่า</label>
            <input type="text" id="set-promptpay" value="${s.promptpay_number || '0899998877'}">
          </div>

          <button type="submit" class="btn btn-primary">บันทึกการตั้งค่าหอพัก</button>
        </form>

        <!-- System Reset / Maintenance -->
        <div style="background:#fde8e7; border:1px solid var(--danger); border-radius:12px; padding:18px;">
          <h4 style="color:var(--danger); margin:0 0 6px 0;">⚠️ จัดการข้อมูลและรีเซ็ตระบบ</h4>
          <p style="font-size:0.85rem; color:#8F2B24; margin:0 0 12px 0;">
            หากต้องการล้างข้อมูลทดสอบและคืนค่าเริ่มต้นทั้งหมดของระบบหอพัก สามารถกดปุ่มด้านล่างนี้
          </p>
          <button type="button" class="btn btn-outline" id="btn-reset-db" style="background:white; color:var(--danger); border-color:var(--danger);">
            ${ic('trash')} คืนค่าข้อมูลเริ่มต้นระบบ (Reset Database)
          </button>
        </div>
      ` : ''}
    </div>
  `;
}

function bindSettingsEvents() {
  const acctForm = document.getElementById('form-account-settings');
  if (acctForm) {
    acctForm.onsubmit = (e) => {
      e.preventDefault();
      const p1 = document.getElementById('set-new-pwd').value;
      const p2 = document.getElementById('set-confirm-pwd').value;
      if (p1 && p1 !== p2) {
        toast('รหัสผ่านยืนยันไม่ตรงกัน', 'error');
        return;
      }
      toast('บันทึกข้อมูลบัญชีเรียบร้อยแล้ว', 'success');
      acctForm.reset();
    };
  }

  const dormForm = document.getElementById('form-dorm-settings');
  if (dormForm) {
    dormForm.onsubmit = (e) => {
      e.preventDefault();
      const db = supabase.getRawData();
      db.settings = {
        dorm_name: document.getElementById('set-dorm-name').value.trim(),
        sub_title: document.getElementById('set-dorm-sub').value.trim(),
        water_rate: Number(document.getElementById('set-water-rate').value),
        electric_rate: Number(document.getElementById('set-elec-rate').value),
        common_fee: Number(document.getElementById('set-common-fee').value),
        phone: document.getElementById('set-phone').value.trim(),
        line_id: document.getElementById('set-line').value.trim(),
        promptpay_number: document.getElementById('set-promptpay').value.trim()
      };
      localStorage.setItem('tanakrit_dormitory_db_v1', JSON.stringify(db));
      toast('บันทึกการตั้งค่าหอพักเรียบร้อยแล้ว', 'success');
    };
  }

  const btnReset = document.getElementById('btn-reset-db');
  if (btnReset) {
    btnReset.onclick = () => {
      if (confirm('คุณต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้นหรือไม่?')) {
        supabase.resetToDefaults();
        toast('รีเซ็ตข้อมูลระบบกลับสู่ค่าเริ่มต้นเรียบร้อยแล้ว', 'success');
        setTimeout(() => location.reload(), 800);
      }
    };
  }
}
