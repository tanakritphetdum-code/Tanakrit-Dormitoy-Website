// js/maintenance.js
import { supabase } from './supabase.js';
import { ic, fmtDate, showModal, closeModal, toast, compressImage, showImageModal } from './api.js';
import { currentUser } from './auth.js';

let maintenanceFilter = 'all';

export async function renderMaintenanceView() {
  setTimeout(() => {
    bindMaintenanceEvents();
    loadMaintenanceData();
  }, 0);

  const isStudent = currentUser && currentUser.role === 'student';

  return `
    <div class="card">
      <div class="card-header-actions">
        <div>
          <h3>${ic('wrench')} ระบบแจ้งซ่อมและงานบริการบำรุงรักษา (Maintenance System)</h3>
          <p style="color: var(--muted); margin-top: 4px; font-size: 0.9rem;">
            ${isStudent ? 'แจ้งปัญหาอุปกรณ์ชำรุดเสียหายในห้องพัก หรือพื้นที่ส่วนกลาง' : 'ตรวจสอบรายการแจ้งซ่อม มอบหมายงานช่าง และบันทึกสถานะการแก้ไข'}
          </p>
        </div>
        <button class="btn btn-primary" id="btn-create-ticket">
          ${ic('plus')} แจ้งซ่อมรายการใหม่
        </button>
      </div>

      <!-- Filter Tabs -->
      <div class="toolbar-filter-grid" style="margin-top: 16px;">
        <div class="filter-tabs" id="maint-filter-tabs">
          <button class="filter-tab-btn active" data-status="all">ทั้งหมด</button>
          <button class="filter-tab-btn" data-status="pending">รอรับเรื่อง</button>
          <button class="filter-tab-btn" data-status="in_progress">กำลังดำเนินการ</button>
          <button class="filter-tab-btn" data-status="completed">ซ่อมเสร็จสิ้น</button>
        </div>
      </div>

      <div class="table-responsive" style="margin-top: 16px;">
        <table class="modern-table">
          <thead>
            <tr>
              <th>รหัสแจ้งซ่อม</th>
              <th>ห้องพัก / ผู้แจ้ง</th>
              <th>หมวดหมู่งาน</th>
              <th>รายละเอียดปัญหา</th>
              <th>ความเร่งด่วน</th>
              <th>ช่างผู้รับผิดชอบ</th>
              <th>สถานะ</th>
              <th>การกระทำ</th>
            </tr>
          </thead>
          <tbody id="maintenance-tbody">
            <tr><td colspan="8" style="text-align:center; padding: 30px; color:var(--muted);">กำลังโหลดรายการแจ้งซ่อม...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function loadMaintenanceData() {
  const tbody = document.getElementById('maintenance-tbody');
  if (!tbody) return;

  const { data: tickets, error } = await supabase.from('maintenance').select('*').order('created_at', { ascending: false });

  if (error || !tickets) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--danger); padding: 24px;">ไม่สามารถโหลดข้อมูลแจ้งซ่อมได้</td></tr>`;
    return;
  }

  let list = tickets;
  const isStudent = currentUser && currentUser.role === 'student';
  if (isStudent && currentUser.room) {
    // If student, filter by their room
    list = tickets.filter(t => t.room_number === currentUser.room);
  }

  if (maintenanceFilter !== 'all') {
    list = list.filter(t => t.status === maintenanceFilter);
  }

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 30px; color:var(--muted);">ไม่มีรายการแจ้งซ่อมในขณะนี้</td></tr>`;
    return;
  }

  let html = '';
  list.forEach(t => {
    let statusClass = 'pending';
    let statusText = 'รอรับเรื่อง';
    if (t.status === 'in_progress') { statusClass = 'in-progress'; statusText = 'กำลังดำเนินการ'; }
    else if (t.status === 'completed') { statusClass = 'approved'; statusText = 'ซ่อมเสร็จแล้ว'; }

    let urgencyBadge = '<span class="badge" style="background:#eef8f2; color:var(--emerald);">ปกติ</span>';
    if (t.urgency === 'high') {
      urgencyBadge = '<span class="badge" style="background:#FDE8E7; color:var(--danger); font-weight:600;">⚡ ด่วนมาก</span>';
    } else if (t.urgency === 'medium') {
      urgencyBadge = '<span class="badge" style="background:#FEF3D6; color:#8F6B1A;">ปานกลาง</span>';
    }

    html += `
      <tr>
        <td><strong>${t.id}</strong></td>
        <td>
          <div style="font-weight:600; color:var(--teal-950);">ห้อง ${t.room_number}</div>
          <small style="color:var(--muted);">${t.requester_name} (${t.phone || '-'})</small>
        </td>
        <td>
          <span class="badge" style="background:var(--mint-50); color:var(--teal-900); font-weight:500;">
            ${t.category}
          </span>
        </td>
        <td style="max-width: 250px;">
          <div style="font-size:0.9rem; line-height:1.4; color:var(--teal-950);">${t.description}</div>
          <div style="display:flex; align-items:center; gap:8px; margin-top:4px;">
            <small style="color:var(--muted);">${fmtDate(t.created_at)}</small>
            ${t.image_url ? `
              <span style="display:inline-flex; align-items:center; gap:4px; font-size:0.8rem; color:var(--teal-900); cursor:pointer; background:#E8F5E9; border:1px solid #C8E6C9; padding:2px 8px; border-radius:6px; font-weight:600;" onclick="window.showImageModal('${t.image_url}', 'รูปจุดชำรุด: ${t.category} (ห้อง ${t.room_number})')">
                📸 ดูรูปถ่าย
              </span>
            ` : ''}
          </div>
        </td>
        <td>${urgencyBadge}</td>
        <td>${t.technician || '<span style="color:var(--muted);">ยังไม่ระบุ</span>'}</td>
        <td><span class="badge ${statusClass}">${statusText}</span></td>
        <td>
          <div style="display:flex; gap:6px;">
            <button class="btn btn-outline btn-sm btn-update-ticket" data-id="${t.id}" title="อัปเดตสถานะ">
              ${ic('gear')} อัปเดต
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;

  tbody.querySelectorAll('.btn-update-ticket').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      const target = tickets.find(x => x.id === id);
      if (target) openUpdateTicketModal(target);
    };
  });
}

function bindMaintenanceEvents() {
  const tabs = document.getElementById('maint-filter-tabs');
  if (tabs) {
    tabs.querySelectorAll('.filter-tab-btn').forEach(btn => {
      btn.onclick = () => {
        tabs.querySelectorAll('.filter-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        maintenanceFilter = btn.getAttribute('data-status');
        loadMaintenanceData();
      };
    });
  }

  const btnCreate = document.getElementById('btn-create-ticket');
  if (btnCreate) btnCreate.onclick = openCreateTicketModal;
}

function openCreateTicketModal() {
  const defaultRoom = currentUser && currentUser.room ? currentUser.room : '302';
  const defaultName = currentUser ? currentUser.name : '';
  const defaultPhone = currentUser && currentUser.phone ? currentUser.phone : '';

  const body = `
    <form id="form-create-ticket">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
        <div class="field">
          <label>หมายเลขห้อง *</label>
          <input type="text" id="tk-room" value="${defaultRoom}" required>
        </div>
        <div class="field">
          <label>หมวดหมู่งานซ่อม *</label>
          <select id="tk-cat" class="form-select">
            <option value="เครื่องปรับอากาศ">เครื่องปรับอากาศ (แอร์)</option>
            <option value="ระบบประปา">ระบบประปา / ห้องน้ำ / ก๊อกรั่ว</option>
            <option value="ไฟฟ้า/แสงสว่าง">ระบบไฟฟ้า / หลอดไฟ / ปลั๊กไฟ</option>
            <option value="เฟอร์นิเจอร์/ประตู">เฟอร์นิเจอร์ / บานพับ / ประตู-หน้าต่าง</option>
            <option value="อินเทอร์เน็ต Wi-Fi">อินเทอร์เน็ต Wi-Fi / เคเบิล</option>
            <option value="อื่นๆ">อื่นๆ</option>
          </select>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
        <div class="field">
          <label>ชื่อผู้แจ้ง *</label>
          <input type="text" id="tk-name" value="${defaultName}" required>
        </div>
        <div class="field">
          <label>เบอร์โทรศัพท์ติดต่อ *</label>
          <input type="tel" id="tk-phone" value="${defaultPhone}" required>
        </div>
      </div>

      <div class="field" style="margin-bottom: 14px;">
        <label>ระดับความเร่งด่วน</label>
        <select id="tk-urgency" class="form-select">
          <option value="low">ปกติ (1-3 วันทำการ)</option>
          <option value="medium">ปานกลาง (ภายใน 24 ชม.)</option>
          <option value="high">ด่วนมาก (ส่งผลกระทบต่อการอยู่อาศัยทันที)</option>
        </select>
      </div>

      <div class="field" style="margin-bottom: 14px;">
        <label>รายละเอียดอาการที่ชำรุดเสียหาย *</label>
        <textarea id="tk-desc" rows="3" placeholder="ระบุอาการชำรุด จุดที่เกิดปัญหา เช่น ท่อน้ำใต้ซิงค์รั่ว, แอร์มีน้ำหยด, ปลั๊กหัวเตียงไม่มีไฟ" required></textarea>
      </div>

      <!-- ส่วนแนบรูปภาพจุดชำรุด -->
      <div class="field">
        <label>แนบรูปภาพจุดที่ชำรุด (ไม่บังคับ แต่ช่วยให้ช่างเตรียมเครื่องมือได้ตรงจุด)</label>
        <input type="file" id="tk-photo-input" accept="image/*" style="display:none;">
        <div class="upload-dropzone" id="tk-photo-dropzone" style="padding:14px;">
          <div id="tk-dropzone-content">
            <div style="font-size:1.6rem; margin-bottom:2px;">📸</div>
            <div style="font-size:0.88rem; font-weight:600; color:var(--teal-950);">คลิกเพื่อถ่ายรูป หรือเลือกรูปภาพความเสียหาย</div>
            <div style="font-size:0.75rem; color:var(--muted); margin-top:2px;">รองรับ JPG, PNG, WEBP (ระบบจะย่อขนาดให้อัตโนมัติ)</div>
          </div>
          <div id="tk-preview-wrap" style="display:none; align-items:center; justify-content:center; gap:12px;">
            <img id="tk-preview-img" style="max-height:100px; border-radius:8px; border:1px solid var(--line); box-shadow:0 2px 8px rgba(0,0,0,0.1);">
            <div>
              <div id="tk-photo-name" style="font-size:0.8rem; font-weight:600; color:var(--teal-950); margin-bottom:4px;"></div>
              <button type="button" class="btn btn-outline btn-sm" id="btn-change-tk-photo">เปลี่ยนรูป</button>
            </div>
          </div>
        </div>
      </div>
    </form>
  `;

  const footer = `
    <button type="button" class="btn btn-outline" onclick="window.closeAppModal()">ยกเลิก</button>
    <button type="button" class="btn btn-primary" id="btn-submit-ticket">ส่งคำขอแจ้งซ่อม</button>
  `;

  showModal({
    title: 'เปิดใบแจ้งซ่อมอุปกรณ์ชำรุด (Maintenance Ticket)',
    body,
    footer,
    maxWidth: '560px'
  });

  // Photo Selection
  let selectedPhotoFile = null;
  const photoDropzone = document.getElementById('tk-photo-dropzone');
  const photoInput = document.getElementById('tk-photo-input');
  const dropzoneContent = document.getElementById('tk-dropzone-content');
  const previewWrap = document.getElementById('tk-preview-wrap');
  const previewImg = document.getElementById('tk-preview-img');
  const photoNameEl = document.getElementById('tk-photo-name');
  const btnChangePhoto = document.getElementById('btn-change-tk-photo');

  if (photoDropzone && photoInput) {
    photoDropzone.onclick = () => photoInput.click();
    if (btnChangePhoto) {
      btnChangePhoto.onclick = (e) => {
        e.stopPropagation();
        photoInput.click();
      };
    }

    photoInput.onchange = (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      selectedPhotoFile = file;

      previewImg.src = URL.createObjectURL(file);
      photoNameEl.textContent = file.name;
      dropzoneContent.style.display = 'none';
      previewWrap.style.display = 'flex';
    };
  }

  const submitTicketBtn = document.getElementById('btn-submit-ticket');
  submitTicketBtn.onclick = async () => {
    const room = document.getElementById('tk-room').value.trim();
    const cat = document.getElementById('tk-cat').value;
    const name = document.getElementById('tk-name').value.trim();
    const phone = document.getElementById('tk-phone').value.trim();
    const urgency = document.getElementById('tk-urgency').value;
    const desc = document.getElementById('tk-desc').value.trim();

    if (!room || !name || !phone || !desc) {
      toast('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
      return;
    }

    submitTicketBtn.disabled = true;
    submitTicketBtn.textContent = 'กำลังส่งข้อมูลแจ้งซ่อม...';

    let imageUrl = null;
    if (selectedPhotoFile) {
      try {
        imageUrl = await compressImage(selectedPhotoFile, 1200, 0.82);
      } catch (err) {
        console.warn('Image compress warning:', err);
      }
    }

    const newTicketId = 'FIX-' + Math.floor(100 + Math.random() * 900);

    const { error } = await supabase.from('maintenance').insert([{
      id: newTicketId,
      room_number: room,
      requester_name: name,
      phone: phone,
      category: cat,
      description: desc,
      urgency: urgency,
      status: 'pending',
      technician: '',
      image_url: imageUrl,
      created_at: new Date().toISOString().split('T')[0]
    }]);

    if (error) {
      console.error('Ticket insert error:', error);
      toast('เกิดข้อผิดพลาดในการบันทึกแจ้งซ่อม', 'error');
      submitTicketBtn.disabled = false;
      submitTicketBtn.textContent = 'ส่งคำขอแจ้งซ่อม';
      return;
    }

    toast(`เปิดใบแจ้งซ่อม ${newTicketId} เรียบร้อยแล้ว`, 'success');
    closeModal();
    loadMaintenanceData();
  };
}

function openUpdateTicketModal(ticket) {
  const body = `
    <form id="form-update-ticket">
      <div style="background: var(--mint-50); padding: 14px; border-radius: 10px; margin-bottom: 16px; border: 1px solid var(--line);">
        <div style="display:flex; justify-content:space-between;">
          <strong style="color:var(--teal-950); font-size:1.05rem;">${ticket.id} — ห้อง ${ticket.room_number}</strong>
          <span style="font-size:0.85rem; color:var(--muted);">${fmtDate(ticket.created_at)}</span>
        </div>
        <div style="margin-top:6px; font-size:0.9rem; color:var(--teal-900);">หมวดหมู่: <strong>${ticket.category}</strong></div>
        <div style="margin-top:4px; font-size:0.85rem; color:var(--ink);">${ticket.description}</div>
      </div>

      ${ticket.image_url ? `
        <div style="margin-bottom:16px; background:#FAFDFB; border:1px solid var(--line); border-radius:10px; padding:12px; text-align:center;">
          <div style="font-size:0.85rem; font-weight:600; color:var(--teal-950); margin-bottom:6px;">📸 รูปถ่ายจุดชำรุดที่ผู้แจ้งแนบมา:</div>
          <img src="${ticket.image_url}" style="max-height:170px; border-radius:8px; cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.1); object-fit:contain;" onclick="window.showImageModal('${ticket.image_url}', 'รูปถ่ายแจ้งซ่อม: ${ticket.id}')" title="คลิกเพื่อดูรูปขยายใหญ่">
          <div style="font-size:0.75rem; color:var(--muted); margin-top:4px;">(คลิกที่รูปเพื่อดูรูปภาพขยายใหญ่)</div>
        </div>
      ` : ''}

      <div class="field" style="margin-bottom: 14px;">
        <label>สถานะงานซ่อม</label>
        <select id="up-status" class="form-select">
          <option value="pending" ${ticket.status === 'pending' ? 'selected' : ''}>รอรับเรื่อง (Pending)</option>
          <option value="in_progress" ${ticket.status === 'in_progress' ? 'selected' : ''}>กำลังดำเนินการซ่อม (In Progress)</option>
          <option value="completed" ${ticket.status === 'completed' ? 'selected' : ''}>ซ่อมเสร็จสิ้นเรียบร้อย (Completed)</option>
        </select>
      </div>

      <div class="field" style="margin-bottom: 14px;">
        <label>ช่างผู้รับผิดชอบงาน</label>
        <input type="text" id="up-tech" value="${ticket.technician || ''}" placeholder="เช่น ช่างวิเชียร, ช่างสมบูรณ์">
      </div>
    </form>
  `;

  const footer = `
    <button type="button" class="btn btn-outline" onclick="window.closeAppModal()">ยกเลิก</button>
    <button type="button" class="btn btn-primary" id="btn-save-ticket-status">บันทึกความคืบหน้า</button>
  `;

  showModal({
    title: `อัปเดตสถานะงานซ่อม ${ticket.id}`,
    body,
    footer,
    maxWidth: '520px'
  });

  document.getElementById('btn-save-ticket-status').onclick = async () => {
    const st = document.getElementById('up-status').value;
    const tech = document.getElementById('up-tech').value.trim();

    await supabase.from('maintenance').eq('id', ticket.id).update({
      status: st,
      technician: tech
    });

    toast('บันทึกความคืบหน้ารายการซ่อมเรียบร้อยแล้ว', 'success');
    closeModal();
    loadMaintenanceData();
  };
}
