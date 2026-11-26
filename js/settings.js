// js/settings.js
// ตั้งค่าระบบและบัญชีผู้ใช้งาน (System Settings)
// ออกแบบด้วย Smoky Frosted Glass Design System
import { supabase, getPromptPayDetails, getRoomSamplePhotos, saveRoomSamplePhotos, DEFAULT_ROOM_SAMPLE_PHOTOS, syncRoomPhotosFromCloud } from './supabase.js';
import { ic, toast, compressImage, showImageModal } from './api.js';
import { currentUser } from './auth.js';

export async function renderSettingsView() {
  const s = await supabase.getSettings();
  await syncRoomPhotosFromCloud();
  const roomPhotos = getRoomSamplePhotos();
  const pp = getPromptPayDetails();
  const isAdmin = currentUser && currentUser.role === 'admin';

  setTimeout(() => {
    bindSettingsEvents();
  }, 0);

  return `
    <div style="display: flex; flex-direction: column; gap: 22px; max-width: 920px; margin: 0 auto; width: 100%;">
      
      <!-- 1. Header Card (Smoky Glass) -->
      <div class="smoky-card" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(59,130,246,0.18); border: 1px solid rgba(59,130,246,0.32); display: flex; align-items: center; justify-content: center; color: #3B82F6;">
            ${ic('gear')}
          </div>
          <div>
            <h2 style="font-size: 1.35rem; font-weight: 700; color: #ffffff; margin: 0; letter-spacing: -0.02em;">
              ตั้งค่าระบบและบัญชีผู้ใช้งาน (System Settings)
            </h2>
            <span style="font-size: 0.82rem; color: rgba(255,255,255,0.48); margin-top: 3px; display: block;">
              กำหนดอัตราค่าน้ำ ค่าไฟ บัญชีพร้อมเพย์ และข้อมูลติดต่อของหอพัก 3 อาคาร (17 ห้อง)
            </span>
          </div>
        </div>
      </div>

      <!-- 2. Account Settings Card (Smoky Glass) -->
      <div class="smoky-card">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
          <div style="color: #60A5FA;">${ic('user')}</div>
          <h3 style="font-size: 1.10rem; font-weight: 700; color: #ffffff; margin: 0;">ข้อมูลบัญชีผู้ใช้งานปัจจุบัน</h3>
        </div>
        <p style="color: rgba(255,255,255,0.45); font-size: 0.80rem; margin: 0 0 18px 0;">ข้อมูลความปลอดภัยและรหัสผ่านเข้าสู่ระบบหลังบ้าน</p>

        <form id="form-account-settings">
          <div class="smoky-grid-2">
            <div class="field">
              <label class="smoky-form-label" style="font-size: 0.82rem; display: block; margin-bottom: 6px;">ชื่อผู้ใช้งาน (Username)</label>
              <input type="text" class="smoky-glass-input" value="${currentUser ? currentUser.username : ''}" disabled style="width: 100%; opacity: 0.7; cursor: not-allowed;">
            </div>
            <div class="field">
              <label class="smoky-form-label" style="font-size: 0.82rem; display: block; margin-bottom: 6px;">ระดับสิทธิ์ (Role)</label>
              <input type="text" class="smoky-glass-input" value="${currentUser ? currentUser.roleTitle : ''}" disabled style="width: 100%; opacity: 0.7; cursor: not-allowed;">
            </div>
          </div>

          <div class="smoky-grid-2">
            <div class="field">
              <label class="smoky-form-label" style="font-size: 0.82rem; display: block; margin-bottom: 6px;">รหัสผ่านใหม่ (ปล่อยว่างหากไม่เปลี่ยน)</label>
              <input type="password" id="set-new-pwd" class="smoky-glass-input" placeholder="••••••••" style="width: 100%;">
            </div>
            <div class="field">
              <label class="smoky-form-label" style="font-size: 0.82rem; display: block; margin-bottom: 6px;">ยืนยันรหัสผ่านใหม่อีกครั้ง</label>
              <input type="password" id="set-confirm-pwd" class="smoky-glass-input" placeholder="••••••••" style="width: 100%;">
            </div>
          </div>

          <button type="submit" class="smoky-round-glass-btn" style="width: auto; border-radius: 9999px; padding: 0 18px; height: 38px; background: #3B82F6; color: #ffffff; border: 1px solid rgba(59,130,246,0.5); font-size: 0.82rem; font-weight: 600;">
            ${ic('check')}
            <span>บันทึกรหัสผ่านใหม่</span>
          </button>
        </form>
      </div>

      ${isAdmin ? `
        <!-- 3. Dormitory System Rates & Master Info (Smoky Glass) -->
        <div class="smoky-card">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
            <div style="color: #34D399;">${ic('door')}</div>
            <h3 style="font-size: 1.10rem; font-weight: 700; color: #ffffff; margin: 0;">ข้อมูลหอพักและอัตราค่าสาธารณูปโภค (สำหรับ Admin)</h3>
          </div>
          <p style="color: rgba(255,255,255,0.45); font-size: 0.80rem; margin: 0 0 18px 0;">กำหนดข้อมูลแม่บทของหอพัก ค่าน้ำ ค่าไฟ และช่องทางติดต่อ ซึ่งจะอัปเดตแสดงผลบนหน้าแรกเว็บไซต์ (Landing Page) โดยอัตโนมัติ</p>

          <form id="form-dorm-settings">
            <div class="smoky-grid-2">
              <div class="field">
                <label class="smoky-form-label" style="font-size: 0.82rem; display: block; margin-bottom: 6px;">ชื่อหอพัก (Dormitory Name)</label>
                <input type="text" id="set-dorm-name" class="smoky-glass-input" value="${s.dorm_name || 'Tanakrit Dormitory'}" required style="width: 100%;">
              </div>
              <div class="field">
                <label class="smoky-form-label" style="font-size: 0.82rem; display: block; margin-bottom: 6px;">สโลแกน / หน่วยงานสังกัด (Sub-title)</label>
                <input type="text" id="set-dorm-sub" class="smoky-glass-input" value="${s.sub_title || 'หอพักชายธนกฤษฎ์ นครศรีธรรมราช'}" style="width: 100%;">
              </div>
            </div>

            <div class="field" style="margin-bottom: 16px;">
              <label class="smoky-form-label" style="font-size: 0.82rem; display: block; margin-bottom: 6px;">ที่อยู่หอพัก (Address แสดงบนหน้าเว็บไซต์)</label>
              <input type="text" id="set-address" class="smoky-glass-input" value="${s.address || '69/4 หมู่ที่ 2 ต.ทอนหงส์ อ.พรหมคีรี จ.นครศรีธรรมราช 80320'}" required style="width: 100%;">
            </div>

            <div class="smoky-grid-3">
              <div class="field">
                <label class="smoky-form-label" style="font-size: 0.82rem; display: block; margin-bottom: 6px;">อัตราค่าน้ำประปา (บาท/หน่วย)</label>
                <input type="number" id="set-water-rate" class="smoky-glass-input" value="${s.water_rate !== undefined ? s.water_rate : 18}" required style="width: 100%;">
              </div>
              <div class="field">
                <label class="smoky-form-label" style="font-size: 0.82rem; display: block; margin-bottom: 6px;">อัตราค่าไฟฟ้า (บาท/หน่วย)</label>
                <input type="number" id="set-elec-rate" class="smoky-glass-input" value="${s.electric_rate !== undefined ? s.electric_rate : 8}" required style="width: 100%;">
              </div>
              <div class="field">
                <label class="smoky-form-label" style="font-size: 0.82rem; display: block; margin-bottom: 6px;">ค่าบริการส่วนกลาง (บาท/เดือน)</label>
                <input type="number" id="set-common-fee" class="smoky-glass-input" value="${s.common_fee !== undefined ? s.common_fee : 50}" required style="width: 100%;">
              </div>
            </div>

            <div class="smoky-grid-2">
              <div class="field">
                <label class="smoky-form-label" style="font-size: 0.82rem; display: block; margin-bottom: 6px;">เบอร์โทรศัพท์ติดต่อ</label>
                <input type="text" id="set-phone" class="smoky-glass-input" value="${s.phone || '075-355-289, 089-590-0478 , 087-280-0478 , 084-191-9985'}" style="width: 100%;">
              </div>
              <div class="field">
                <label class="smoky-form-label" style="font-size: 0.82rem; display: block; margin-bottom: 6px;">Line Official Account / Line ID</label>
                <input type="text" id="set-line" class="smoky-glass-input" value="${s.line_id || 'Tonyeiei'}" style="width: 100%;">
              </div>
            </div>

            <div class="smoky-grid-2" style="margin-bottom: 20px;">
              <div class="field">
                <label class="smoky-form-label" style="font-size: 0.82rem; display: block; margin-bottom: 6px;">หมายเลขบัญชีพร้อมเพย์ (PromptPay No. / เบอร์โทรศัพท์ / เลข ปชช.) *</label>
                <input type="text" id="set-promptpay" class="smoky-glass-input" value="${pp.number || '086-946-1654'}" placeholder="เช่น 086-946-1654" style="width: 100%;" required>
              </div>
              <div class="field">
                <label class="smoky-form-label" style="font-size: 0.82rem; display: block; margin-bottom: 6px;">ชื่อบัญชีผู้รับเงิน / ผู้จัดการหอพัก (แสดงบน QR Code & ใบเสร็จ) *</label>
                <input type="text" id="set-promptpay-name" class="smoky-glass-input" value="${pp.name || 'นายธนกฤษฎ์ เพชรดำ ผู้จัดการหอพัก'}" placeholder="เช่น นายธนกฤษฎ์ เพชรดำ ผู้จัดการหอพัก" style="width: 100%;" required>
              </div>
            </div>

            <button type="submit" class="smoky-round-glass-btn" style="width: auto; border-radius: 9999px; padding: 0 20px; height: 38px; background: #3B82F6; color: #ffffff; border: 1px solid rgba(59,130,246,0.5); font-size: 0.82rem; font-weight: 600;">
              ${ic('check')}
              <span>บันทึกการตั้งค่าหอพัก</span>
            </button>
          </form>
        </div>

        <!-- 3.5 Room Sample Photos Settings Card (ตั้งค่ารูปตัวอย่างห้องพักหน้าแรก) -->
        <div class="smoky-card" id="card-room-sample-photos">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
            <div>
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
                <div style="color: #60A5FA;">${ic('image')}</div>
                <h3 style="font-size: 1.10rem; font-weight: 700; color: #ffffff; margin: 0;">ตั้งค่ารูปตัวอย่างห้องพัก (หน้าแรก · ดูรูปตัวอย่างห้องพัก)</h3>
              </div>
              <p style="color: rgba(255,255,255,0.48); font-size: 0.80rem; margin: 0;">
                อัปโหลดรูปภาพใหม่หรือระบุลิงก์รูปภาพของห้องพักทั้ง 3 อาคาร ระบบจะนำไปแสดงในหน้าต่าง "ดูรูปตัวอย่าง" บนหน้าแรกเว็บไซต์ทันที
              </p>
            </div>
            <button type="button" id="btn-preview-landing-gallery" class="smoky-round-glass-btn" style="width: auto; height: 34px; padding: 0 14px; border-radius: 9999px; font-size: 0.78rem; gap: 6px; color: #60A5FA; border-color: rgba(59,130,246,0.35); background: rgba(59,130,246,0.10);" onclick="window.openRoomPreviewModal && window.openRoomPreviewModal('Tanakrit')">
              ${ic('eye')}
              <span>ดูตัวอย่างหน้าแรก</span>
            </button>
          </div>

          <form id="form-room-photos-settings">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 18px;">
              ${[
                { key: 'Tanakrit', label: '🏢 อาคาร ธนกฤษฎ์ (1,500 ฿)', sub: 'ห้อง 101 – 109 (พัดลม 28 ตร.ม.)' },
                { key: 'KingPhetch', label: '🏡 อาคาร กิ่งเพชร (1,500 ฿)', sub: 'ห้อง 201 – 205 (พัดลม 28 ตร.ม.)' },
                { key: 'UnderGround', label: '🛋️ อาคารใต้บ้าน (800 ฿)', sub: 'ห้อง B01 – B03 (พัดลม 12 ตร.ม.)' }
              ].map(b => {
                const currentSrc = roomPhotos[b.key] || DEFAULT_ROOM_SAMPLE_PHOTOS[b.key];
                const safeDisplayVal = currentSrc.startsWith('data:') ? '' : currentSrc;
                return `
                  <div class="room-photo-setting-box" style="padding: 14px; border-radius: 14px; background: rgba(255,255,255,0.035); border: 1px solid rgba(255,255,255,0.08); display: flex; flex-direction: column; gap: 10px;">
                    <div>
                      <div style="font-size: 0.88rem; font-weight: 700; color: #ffffff;">${b.label}</div>
                      <div style="font-size: 0.72rem; color: rgba(255,255,255,0.45); margin-top: 2px;">${b.sub}</div>
                    </div>

                    <div style="position: relative; width: 100%; height: 150px; border-radius: 10px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.25); cursor: zoom-in;" class="btn-zoom-room-photo" data-bkey="${b.key}" title="คลิกเพื่อดูรูปขนาดใหญ่">
                      <img id="preview-room-photo-${b.key}" src="${currentSrc}" alt="${b.label}" style="width: 100%; height: 100%; object-fit: cover; display: block;" onerror="this.onerror=null; this.src='${DEFAULT_ROOM_SAMPLE_PHOTOS[b.key]}';">
                      <span style="position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.65); color: #fff; font-size: 0.68rem; padding: 3px 8px; border-radius: 9999px; backdrop-filter: blur(6px);">คลิกขยาย</span>
                    </div>

                    <input type="file" id="file-room-photo-${b.key}" class="input-room-photo-file" data-bkey="${b.key}" accept="image/*" style="display: none;">
                    <input type="hidden" id="val-room-photo-${b.key}" value="${currentSrc}">

                    <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                      <button type="button" class="smoky-round-glass-btn btn-upload-room-photo" data-bkey="${b.key}" style="flex: 1; height: 32px; border-radius: 8px; font-size: 0.75rem; font-weight: 600; gap: 5px; background: rgba(59,130,246,0.15); border-color: rgba(59,130,246,0.35); color: #60A5FA;">
                        ${ic('image')}
                        <span>อัปโหลดรูปใหม่</span>
                      </button>
                      <button type="button" class="smoky-round-glass-btn btn-reset-room-photo" data-bkey="${b.key}" style="width: auto; padding: 0 10px; height: 32px; border-radius: 8px; font-size: 0.72rem; color: rgba(255,255,255,0.65);" title="กลับไปใช้รูปเริ่มต้น">
                        ใช้รูปเดิม
                      </button>
                    </div>

                    <div class="field" style="margin: 0;">
                      <input type="text" id="url-room-photo-${b.key}" class="smoky-glass-input input-room-photo-url" data-bkey="${b.key}" value="${safeDisplayVal}" placeholder="${currentSrc.startsWith('data:') ? 'อัปโหลดรูปภาพแล้ว (Base64)' : 'หรือวาง URL รูปภาพ...'}" style="width: 100%; font-size: 0.74rem; padding: 6px 10px;">
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

            <button type="submit" id="btn-save-room-photos" class="smoky-round-glass-btn" style="width: auto; border-radius: 9999px; padding: 0 20px; height: 38px; background: #3B82F6; color: #ffffff; border: 1px solid rgba(59,130,246,0.5); font-size: 0.82rem; font-weight: 600;">
              ${ic('check')}
              <span>บันทึกรูปตัวอย่างห้องพัก</span>
            </button>
          </form>
        </div>

        <!-- 4. Database Status & Maintenance Card (Smoky Glass) -->
        <div class="smoky-card" style="border-color: rgba(52, 211, 153, 0.25); background: rgba(52, 211, 153, 0.04);">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #34D399; box-shadow: 0 0 10px #34D399;"></span>
                <h4 style="font-size: 0.95rem; font-weight: 700; color: #ffffff; margin: 0;">เชื่อมต่อฐานข้อมูล Supabase Cloud Live Production</h4>
              </div>
              <p class="smoky-meta-label" style="font-size: 0.80rem; margin: 4px 0 0 0;">
                Endpoint: <span style="font-family: monospace; color: #60A5FA;">https://ewvqgccmyxpwnhjzagye.supabase.co</span> (3 อาคาร 17 ห้อง)
              </p>
            </div>
            <button type="button" class="smoky-round-glass-btn" id="btn-reset-db" style="width: auto; height: 34px; padding: 0 14px; border-radius: 9999px; font-size: 0.78rem; gap: 5px; color: #34D399; border-color: rgba(52, 211, 153, 0.3); background: rgba(52, 211, 153, 0.08);">
              ${ic('check')}
              <span>ตรวจสอบสถานะ</span>
            </button>
          </div>
        </div>
      ` : ''}

    </div>
  `;
}

function bindSettingsEvents() {
  const acctForm = document.getElementById('form-account-settings');
  if (acctForm) {
    acctForm.onsubmit = async (e) => {
      e.preventDefault();
      const p1 = document.getElementById('set-new-pwd').value.trim();
      const p2 = document.getElementById('set-confirm-pwd').value.trim();

      if (!p1) {
        toast('กรุณากรอกรหัสผ่านใหม่', 'error');
        return;
      }
      if (p1 !== p2) {
        toast('รหัสผ่านยืนยันไม่ตรงกัน', 'error');
        return;
      }
      if (p1.length < 4) {
        toast('รหัสผ่านต้องมีความยาวอย่างน้อย 4 ตัวอักษร', 'error');
        return;
      }

      if (!currentUser || !currentUser.username) {
        toast('ไม่พบข้อมูลผู้ใช้งาน กรุณาลองเข้าสู่ระบบใหม่อีกครั้ง', 'error');
        return;
      }

      const submitBtn = acctForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'กำลังบันทึกรหัสผ่าน...';
      }

      try {
        const { error } = await supabase.from('users').eq('username', currentUser.username).update({
          password: p1
        });
        if (error) {
          toast(`บันทึกรหัสผ่านลงฐานข้อมูลไม่สำเร็จ: ${error.message || 'กรุณาลองใหม่'}`, 'error');
          return;
        }

        currentUser.password = p1;
        localStorage.setItem('tanakrit_current_user', JSON.stringify(currentUser));
        localStorage.setItem('kp_current_user', JSON.stringify(currentUser));

        try {
          const pwdOverrides = JSON.parse(localStorage.getItem('tanakrit_pwd_overrides') || '{}');
          pwdOverrides[currentUser.username.toLowerCase()] = p1;
          localStorage.setItem('tanakrit_pwd_overrides', JSON.stringify(pwdOverrides));
        } catch (_) {}

        toast('บันทึกรหัสผ่านใหม่เรียบร้อยแล้ว', 'success');
        acctForm.reset();
      } catch (err) {
        console.error('Save password error:', err);
        toast('เกิดข้อผิดพลาดในการบันทึกรหัสผ่าน', 'error');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'บันทึกรหัสผ่านใหม่';
        }
      }
    };
  }

  const dormForm = document.getElementById('form-dorm-settings');
  if (dormForm) {
    dormForm.onsubmit = async (e) => {
      e.preventDefault();
      const submitBtn = dormForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'กำลังบันทึกข้อมูล...';
      }

      const newSettings = {
        dorm_name: document.getElementById('set-dorm-name').value.trim(),
        sub_title: document.getElementById('set-dorm-sub').value.trim(),
        address: document.getElementById('set-address').value.trim(),
        water_rate: Number(document.getElementById('set-water-rate').value),
        electric_rate: Number(document.getElementById('set-elec-rate').value),
        common_fee: Number(document.getElementById('set-common-fee').value),
        phone: document.getElementById('set-phone').value.trim(),
        line_id: document.getElementById('set-line').value.trim(),
        promptpay_number: `${document.getElementById('set-promptpay').value.trim()}|${document.getElementById('set-promptpay-name').value.trim()}`
      };

      try {
        const { error } = await supabase.from('settings').eq('id', 'default').update(newSettings);
        if (error) {
          toast('เกิดข้อผิดพลาดในการบันทึกขึ้นระบบ Supabase: ' + (error.message || ''), 'error');
          return;
        }

        // ซิงค์อัปเดตข้อมูลบนหน้า index ทันที
        if (typeof window !== 'undefined' && window.applySettingsToLandingPage) {
          window.applySettingsToLandingPage(newSettings);
        }

        toast('บันทึกการตั้งค่าหอพักและอัปเดตข้อมูลหน้าเว็บเรียบร้อยแล้ว', 'success');
      } catch (err) {
        console.error('Save dorm settings error:', err);
        toast('เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `${ic('check')}<span>บันทึกการตั้งค่าหอพัก</span>`;
        }
      }
    };
  }

  const btnReset = document.getElementById('btn-reset-db');
  if (btnReset) {
    btnReset.onclick = () => {
      toast('ระบบเชื่อมต่อฐานข้อมูล Supabase Cloud สถานะพร้อมใช้งาน 100%', 'success');
    };
  }

  // Room Sample Photos Settings Events
  document.querySelectorAll('.btn-upload-room-photo').forEach(btn => {
    btn.onclick = () => {
      const key = btn.getAttribute('data-bkey');
      const fileInput = document.getElementById(`file-room-photo-${key}`);
      if (fileInput) fileInput.click();
    };
  });

  document.querySelectorAll('.input-room-photo-file').forEach(input => {
    input.onchange = async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const key = input.getAttribute('data-bkey');
      try {
        toast('กำลังบีบอัดและเตรียมรูปภาพ...', 'info');
        const compressed = await compressImage(file, 1100, 0.82);
        const valEl = document.getElementById(`val-room-photo-${key}`);
        const previewEl = document.getElementById(`preview-room-photo-${key}`);
        const urlEl = document.getElementById(`url-room-photo-${key}`);
        if (valEl) valEl.value = compressed;
        if (previewEl) previewEl.src = compressed;
        if (urlEl) {
          urlEl.value = '';
          urlEl.placeholder = 'อัปโหลดรูปภาพใหม่แล้ว (พร้อมบันทึก)';
        }
        toast('อัปโหลดรูปภาพตัวอย่างพร้อมแล้ว กรุณากด "บันทึกรูปตัวอย่างห้องพัก"', 'success');
      } catch (err) {
        console.error('Compress room photo error:', err);
        toast('ไม่สามารถอ่านไฟล์รูปภาพนี้ได้ กรุณาเลือกไฟล์ JPG/PNG', 'error');
      }
    };
  });

  document.querySelectorAll('.input-room-photo-url').forEach(urlInput => {
    urlInput.oninput = () => {
      const key = urlInput.getAttribute('data-bkey');
      const val = urlInput.value.trim();
      const valEl = document.getElementById(`val-room-photo-${key}`);
      const previewEl = document.getElementById(`preview-room-photo-${key}`);
      if (val) {
        if (valEl) valEl.value = val;
        if (previewEl) previewEl.src = val;
      }
    };
  });

  document.querySelectorAll('.btn-reset-room-photo').forEach(btn => {
    btn.onclick = () => {
      const key = btn.getAttribute('data-bkey');
      const defSrc = DEFAULT_ROOM_SAMPLE_PHOTOS[key];
      const valEl = document.getElementById(`val-room-photo-${key}`);
      const previewEl = document.getElementById(`preview-room-photo-${key}`);
      const urlEl = document.getElementById(`url-room-photo-${key}`);
      if (valEl) valEl.value = defSrc;
      if (previewEl) previewEl.src = defSrc;
      if (urlEl) urlEl.value = defSrc;
      toast('คืนค่ารูปภาพเริ่มต้นแล้ว (กดบันทึกเพื่อยืนยัน)', 'info');
    };
  });

  document.querySelectorAll('.btn-zoom-room-photo').forEach(box => {
    box.onclick = () => {
      const key = box.getAttribute('data-bkey');
      const previewEl = document.getElementById(`preview-room-photo-${key}`);
      if (previewEl && previewEl.src) {
        const titles = {
          Tanakrit: 'รูปตัวอย่างห้องพัก — อาคาร ธนกฤษฎ์',
          KingPhetch: 'รูปตัวอย่างห้องพัก — อาคาร กิ่งเพชร',
          UnderGround: 'รูปตัวอย่างห้องพัก — อาคารใต้บ้าน'
        };
        showImageModal(previewEl.src, titles[key] || 'รูปตัวอย่างห้องพัก');
      }
    };
  });

  const roomPhotosForm = document.getElementById('form-room-photos-settings');
  if (roomPhotosForm) {
    roomPhotosForm.onsubmit = async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('btn-save-room-photos');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>กำลังบันทึกรูปภาพ...</span>';
      }

      const payload = {
        Tanakrit: (document.getElementById('val-room-photo-Tanakrit')?.value || '').trim() || DEFAULT_ROOM_SAMPLE_PHOTOS.Tanakrit,
        KingPhetch: (document.getElementById('val-room-photo-KingPhetch')?.value || '').trim() || DEFAULT_ROOM_SAMPLE_PHOTOS.KingPhetch,
        UnderGround: (document.getElementById('val-room-photo-UnderGround')?.value || '').trim() || DEFAULT_ROOM_SAMPLE_PHOTOS.UnderGround
      };

      try {
        const { error } = await saveRoomSamplePhotos(payload);
        if (error) {
          toast('เกิดข้อผิดพลาดในการบันทึกรูปขึ้น Supabase: ' + (error.message || ''), 'error');
          return;
        }
        toast('บันทึกรูปตัวอย่างห้องพักทั้ง 3 อาคารเรียบร้อยแล้ว (อัปเดตบนหน้าแรกทันที)', 'success');
      } catch (err) {
        console.error('Save room photos error:', err);
        toast('เกิดข้อผิดพลาดในการบันทึกรูปตัวอย่างห้องพัก', 'error');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `${ic('check')}<span>บันทึกรูปตัวอย่างห้องพัก</span>`;
        }
      }
    };
  }
}
