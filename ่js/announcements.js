// js/announcements.js
import { supabase } from './supabase.js';
import { ic, fmtDate, showModal, closeModal, toast } from './api.js';
import { currentUser } from './auth.js';

export async function renderAnnouncementsView() {
  setTimeout(() => {
    bindAnnouncementsEvents();
    loadAnnouncementsData();
  }, 0);

  const canEdit = currentUser && (currentUser.role === 'admin' || currentUser.role === 'staff');

  return `
    <div class="card">
      <div class="card-header-actions">
        <div>
          <h3>${ic('bell')} กระดานข่าวสารและประกาศหอพัก (Announcements)</h3>
          <p style="color: var(--muted); margin-top: 4px; font-size: 0.9rem;">
            ติดตามข่าวสาร กำหนดการซ่อมบำรุง และประกาศสำคัญจากสำนักงานหอพัก
          </p>
        </div>
        ${canEdit ? `
          <button class="btn btn-primary" id="btn-add-announcement">
            ${ic('plus')} สร้างประกาศใหม่
          </button>
        ` : ''}
      </div>

      <div id="announcements-container" style="margin-top: 20px; display: flex; flex-direction: column; gap: 16px;">
        <div style="text-align:center; padding: 30px; color:var(--muted);">กำลังโหลดประกาศ...</div>
      </div>
    </div>
  `;
}

async function loadAnnouncementsData() {
  const container = document.getElementById('announcements-container');
  if (!container) return;

  const { data: list, error } = await supabase.from('announcements').select('*').order('date', { ascending: false });

  if (error || !list) {
    container.innerHTML = `<p style="color:var(--danger); text-align:center;">เกิดข้อผิดพลาดในการโหลดประกาศ</p>`;
    return;
  }

  if (list.length === 0) {
    container.innerHTML = `<p style="color:var(--muted); text-align:center;">ยังไม่มีประกาศในขณะนี้</p>`;
    return;
  }

  const canEdit = currentUser && (currentUser.role === 'admin' || currentUser.role === 'staff');

  let html = '';
  list.forEach(a => {
    let catColor = 'var(--emerald)';
    if (a.category === 'ซ่อมบำรุง') catColor = 'var(--sand-600)';
    else if (a.category === 'การเงิน') catColor = 'var(--sky)';
    else if (a.category === 'กฎระเบียบ') catColor = 'var(--danger)';

    html += `
      <div class="announcement-item ${a.pinned ? 'pinned' : ''}">
        <div class="ann-header">
          <div style="display: flex; align-items: center; gap: 10px;">
            ${a.pinned ? `<span class="pinned-tag">📌 ปักหมุด</span>` : ''}
            <span class="badge" style="background:var(--mint-50); color:${catColor}; font-weight:600;">
              ${a.category}
            </span>
            <span class="ann-date">${fmtDate(a.date)}</span>
          </div>
          ${canEdit ? `
            <button class="btn btn-outline btn-sm btn-del-ann" data-id="${a.id}" style="color:var(--danger); border-color:var(--danger);" title="ลบประกาศ">
              ${ic('trash')}
            </button>
          ` : ''}
        </div>
        <h4 class="ann-title">${a.title}</h4>
        <div class="ann-content">${a.content}</div>
      </div>
    `;
  });

  container.innerHTML = html;

  if (canEdit) {
    container.querySelectorAll('.btn-del-ann').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.getAttribute('data-id');
        if (confirm('คุณต้องการลบประกาศนี้ใช่หรือไม่?')) {
          await supabase.from('announcements').eq('id', id).delete();
          toast('ลบประกาศเรียบร้อยแล้ว', 'info');
          loadAnnouncementsData();
        }
      };
    });
  }
}

function bindAnnouncementsEvents() {
  const btnAdd = document.getElementById('btn-add-announcement');
  if (btnAdd) btnAdd.onclick = openAddAnnouncementModal;
}

function openAddAnnouncementModal() {
  const body = `
    <form id="form-add-announcement">
      <div class="field" style="margin-bottom: 14px;">
        <label>หัวข้อประกาศ *</label>
        <input type="text" id="ann-title" placeholder="เช่น แจ้งกำหนดการทำความสะอาดอาคาร" required>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
        <div class="field">
          <label>หมวดหมู่</label>
          <select id="ann-cat" class="form-select">
            <option value="ทั่วไป">ทั่วไป</option>
            <option value="ซ่อมบำรุง">ซ่อมบำรุง</option>
            <option value="การเงิน">การเงิน / ค่าเช่า</option>
            <option value="กฎระเบียบ">กฎระเบียบหอพัก</option>
            <option value="กิจกรรม">กิจกรรม / ประชาสัมพันธ์</option>
          </select>
        </div>
        <div class="field" style="display:flex; align-items:center; gap:8px; margin-top:24px;">
          <input type="checkbox" id="ann-pinned" style="width:20px; height:20px; accent-color:var(--emerald);">
          <label for="ann-pinned" style="margin:0; cursor:pointer; font-weight:500;">ปักหมุดไว้บนสุด</label>
        </div>
      </div>

      <div class="field">
        <label>เนื้อหาประกาศ *</label>
        <textarea id="ann-content" rows="4" placeholder="พิมพ์รายละเอียดประกาศที่ต้องการแจ้งให้นักศึกษาทราบ..." required></textarea>
      </div>
    </form>
  `;

  const footer = `
    <button type="button" class="btn btn-outline" onclick="window.closeAppModal()">ยกเลิก</button>
    <button type="button" class="btn btn-primary" id="btn-submit-ann">โพสต์ประกาศ</button>
  `;

  showModal({
    title: 'สร้างประกาศข่าวสารใหม่',
    body,
    footer,
    maxWidth: '560px'
  });

  document.getElementById('btn-submit-ann').onclick = async () => {
    const title = document.getElementById('ann-title').value.trim();
    const cat = document.getElementById('ann-cat').value;
    const pinned = document.getElementById('ann-pinned').checked;
    const content = document.getElementById('ann-content').value.trim();

    if (!title || !content) {
      toast('กรุณาระบุหัวข้อและเนื้อหาประกาศ', 'error');
      return;
    }

    await supabase.from('announcements').insert([{
      title,
      category: cat,
      pinned,
      content,
      date: new Date().toISOString().split('T')[0]
    }]);

    toast('เผยแพร่ประกาศเรียบร้อยแล้ว', 'success');
    closeModal();
    loadAnnouncementsData();
  };
}
