// js/announcements.js
// กระดานข่าวสารและประกาศหอพัก (Announcements)
// ออกแบบด้วย Smoky Frosted Glass Design System
import { supabase } from './supabase.js';
import { ic, fmtDate, showModal, closeModal, toast } from './api.js';
import { currentUser } from './auth.js';

let annCategoryFilter = 'all';
let annSearchQuery = '';
let cachedAnnouncements = [];

export const DEFAULT_ANNOUNCEMENTS = [];

export async function renderAnnouncementsView() {
  setTimeout(() => {
    bindAnnouncementsEvents();
    loadAnnouncementsData();
  }, 0);

  const canEdit = currentUser && (currentUser.role === 'admin' || currentUser.role === 'staff');

  return `
    <div style="display: flex; flex-direction: column; gap: 22px;">
      
      <!-- 1. Header Card (Smoky Glass) -->
      <div class="smoky-card" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(59,130,246,0.18); border: 1px solid rgba(59,130,246,0.32); display: flex; align-items: center; justify-content: center; color: #3B82F6;">
            ${ic('bell')}
          </div>
          <div>
            <h2 style="font-size: 1.35rem; font-weight: 700; color: #ffffff; margin: 0; letter-spacing: -0.02em;">
              กระดานข่าวสารและประกาศหอพัก (Announcements)
            </h2>
            <span style="font-size: 0.82rem; color: rgba(255,255,255,0.48); margin-top: 3px; display: block;">
              ติดตามข่าวสาร กำหนดการซ่อมบำรุง และประกาศสำคัญจากสำนักงานหอพัก 3 อาคาร (17 ห้อง)
            </span>
          </div>
        </div>

        ${canEdit ? `
          <div style="display: flex; align-items: center; gap: 10px;">
            <button class="smoky-round-glass-btn" id="btn-add-announcement" style="width: auto; border-radius: 9999px; padding: 0 18px; height: 38px; background: #3B82F6; color: #ffffff; border: 1px solid rgba(59,130,246,0.5); box-shadow: 0 0 20px rgba(59,130,246,0.4); font-size: 0.82rem; font-weight: 600; gap: 6px;">
              ${ic('plus')}
              <span>สร้างประกาศใหม่</span>
            </button>
          </div>
        ` : ''}
      </div>

      <!-- 2. KPI Summary Stat Tiles (Smoky Glass) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 16px;" id="ann-summary-stats">
        <div class="smoky-tile">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="smoky-meta-label">ประกาศทั้งหมด</span>
            <div style="color: rgba(255,255,255,0.4);">${ic('bell')}</div>
          </div>
          <div class="smoky-kpi-num" style="margin-top: 8px;" id="kpi-ann-total">...</div>
          <div class="smoky-kpi-sub">ข่าวสารในระบบ</div>
        </div>

        <div class="smoky-tile">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="smoky-meta-label">ประกาศปักหมุด</span>
            <span class="smoky-delta-neg" style="background: rgba(245, 158, 11, 0.15); color: #FBBF24;">สำคัญมาก</span>
          </div>
          <div class="smoky-kpi-num" style="margin-top: 8px; color: #FBBF24;" id="kpi-ann-pinned">...</div>
          <div class="smoky-kpi-sub">แสดงบนสุดของกระดาน</div>
        </div>

        <div class="smoky-tile">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="smoky-meta-label">ซ่อมบำรุง / บริการ</span>
            <span class="smoky-delta-pos" style="background: rgba(59, 130, 246, 0.15); color: #60A5FA;">งานช่าง</span>
          </div>
          <div class="smoky-kpi-num" style="margin-top: 8px; color: #60A5FA;" id="kpi-ann-maint">...</div>
          <div class="smoky-kpi-sub">กำหนดการตรวจเช็คอาคาร</div>
        </div>

        <div class="smoky-tile">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="smoky-meta-label">การเงิน / ค่าเช่า</span>
            <span class="smoky-delta-pos">รอบบิล</span>
          </div>
          <div class="smoky-kpi-num" style="margin-top: 8px; color: #34D399;" id="kpi-ann-finance">...</div>
          <div class="smoky-kpi-sub">กำหนดชำระรายเดือน</div>
        </div>
      </div>

      <!-- 3. Filters & Search Toolbar (Smoky Glass) -->
      <div class="smoky-card" style="padding: 16px 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
          
          <!-- Search Box -->
          <div style="position: relative; min-width: 240px; flex: 1; max-width: 360px;">
            <span style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.4); display: flex; align-items: center;">
              ${ic('search')}
            </span>
            <input type="text" id="ann-search-input" class="smoky-glass-input" placeholder="ค้นหาหัวข้อประกาศ หรือเนื้อหา..." style="width: 100%; padding-left: 38px;">
          </div>

          <!-- Status Filter Tabs (Segmented Control) -->
          <div class="smoky-segmented" id="ann-filter-tabs" style="overflow-x: auto; max-width: 100%;">
            <button class="smoky-seg-btn active" data-cat="all">ทั้งหมด</button>
            <button class="smoky-seg-btn" data-cat="pinned" style="color: #FBBF24;">📌 ปักหมุด</button>
            <button class="smoky-seg-btn" data-cat="ซ่อมบำรุง" style="color: #60A5FA;">ซ่อมบำรุง</button>
            <button class="smoky-seg-btn" data-cat="การเงิน" style="color: #34D399;">การเงิน</button>
            <button class="smoky-seg-btn" data-cat="กฎระเบียบ" style="color: #FB7185;">กฎระเบียบ</button>
          </div>

          <!-- Refresh Action -->
          <div>
            <button class="smoky-round-glass-btn" id="btn-refresh-ann" style="width: auto; height: 36px; padding: 0 16px; border-radius: 9999px; font-size: 0.80rem; gap: 6px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);">
              ${ic('check')}
              <span>รีเฟรชข้อมูล</span>
            </button>
          </div>

        </div>
      </div>

      <!-- 4. Announcements Stream Container -->
      <div id="announcements-container" style="display: flex; flex-direction: column; gap: 16px;">
        <div style="text-align:center; padding: 40px; color: rgba(255,255,255,0.4);">กำลังโหลดประกาศ...</div>
      </div>

    </div>
  `;
}

async function loadAnnouncementsData() {
  const container = document.getElementById('announcements-container');
  if (!container) return;

  const { data: list, error } = await supabase.from('announcements').select('*').order('date', { ascending: false });

  let allList = list;
  if (error || !allList) {
    allList = [];
  }
  cachedAnnouncements = allList;

  // Update KPI counters
  const total = allList.length;
  const pinnedCount = allList.filter(a => a.pinned).length;
  const maintCount = allList.filter(a => a.category === 'ซ่อมบำรุง').length;
  const financeCount = allList.filter(a => a.category === 'การเงิน').length;

  const kpiTotal = document.getElementById('kpi-ann-total');
  const kpiPinned = document.getElementById('kpi-ann-pinned');
  const kpiMaint = document.getElementById('kpi-ann-maint');
  const kpiFinance = document.getElementById('kpi-ann-finance');

  if (kpiTotal) kpiTotal.textContent = `${total} รายการ`;
  if (kpiPinned) kpiPinned.textContent = `${pinnedCount}`;
  if (kpiMaint) kpiMaint.textContent = `${maintCount}`;
  if (kpiFinance) kpiFinance.textContent = `${financeCount}`;

  let filtered = [...allList];

  if (annCategoryFilter === 'pinned') {
    filtered = filtered.filter(a => a.pinned);
  } else if (annCategoryFilter !== 'all') {
    filtered = filtered.filter(a => a.category === annCategoryFilter);
  }

  if (annSearchQuery.trim()) {
    const q = annSearchQuery.toLowerCase().trim();
    filtered = filtered.filter(a => 
      String(a.title || '').toLowerCase().includes(q) ||
      String(a.content || '').toLowerCase().includes(q) ||
      String(a.category || '').toLowerCase().includes(q)
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = `<div class="smoky-card" style="text-align:center; color: rgba(255,255,255,0.4); padding: 40px;">ไม่พบรายการประกาศตามเงื่อนไขที่เลือก</div>`;
    return;
  }

  const canEdit = currentUser && (currentUser.role === 'admin' || currentUser.role === 'staff');

  let html = '';
  filtered.forEach(a => {
    let catPillClass = 'pill-blue';
    if (a.category === 'ซ่อมบำรุง') {
      catPillClass = 'pill-amber';
    } else if (a.category === 'การเงิน') {
      catPillClass = 'pill-green';
    } else if (a.category === 'กฎระเบียบ') {
      catPillClass = 'pill-rose';
    }

    html += `
      <div class="smoky-card" style="padding: 22px; position: relative;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            ${a.pinned ? `
              <span class="smoky-status-pill pill-amber" style="padding: 2px 10px; font-size: 0.74rem;">
                📌 ปักหมุด
              </span>
            ` : ''}
            <span class="smoky-status-pill ${catPillClass}" style="padding: 2px 10px; font-size: 0.74rem;">
              ${a.category}
            </span>
            <span style="font-size: 0.78rem; color: rgba(255, 255, 255, 0.42);">
              ${fmtDate(a.date)}
            </span>
          </div>

          ${canEdit ? `
            <button class="smoky-round-glass-btn btn-del-ann" data-id="${a.id}" style="width: 32px; height: 32px; padding: 0; border-radius: 9999px; color: #FB7185; border-color: rgba(244, 63, 94, 0.3); background: rgba(244, 63, 94, 0.1);" title="ลบประกาศนี้">
              ${ic('trash')}
            </button>
          ` : ''}
        </div>

        <h3 style="font-size: 1.15rem; font-weight: 700; color: #ffffff; margin: 12px 0 8px; letter-spacing: -0.01em;">
          ${a.title}
        </h3>

        <div style="font-size: 0.90rem; color: rgba(255, 255, 255, 0.82); line-height: 1.65;">
          ${a.content}
        </div>
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

  const searchInput = document.getElementById('ann-search-input');
  if (searchInput) {
    searchInput.oninput = (e) => {
      annSearchQuery = e.target.value.trim();
      loadAnnouncementsData();
    };
  }

  const btnRefresh = document.getElementById('btn-refresh-ann');
  if (btnRefresh) {
    btnRefresh.onclick = () => {
      toast('กำลังซิงค์ประกาศจากระบบ...', 'info');
      loadAnnouncementsData();
    };
  }

  const tabs = document.getElementById('ann-filter-tabs');
  if (tabs) {
    tabs.querySelectorAll('.smoky-seg-btn').forEach(btn => {
      btn.onclick = () => {
        tabs.querySelectorAll('.smoky-seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        annCategoryFilter = btn.getAttribute('data-cat');
        loadAnnouncementsData();
      };
    });
  }
}

function openAddAnnouncementModal() {
  const body = `
    <form id="form-add-announcement" style="display: flex; flex-direction: column; gap: 14px;">
      <div class="field">
        <label class="smoky-form-label" style="font-size: 0.84rem; display: block; margin-bottom: 6px;">หัวข้อประกาศ *</label>
        <input type="text" id="ann-title" class="smoky-glass-input" placeholder="เช่น แจ้งกำหนดการทำความสะอาดอาคาร หรือซ่อมบำรุง" required style="width: 100%; height: 42px; border-radius: 8px;">
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div class="field">
          <label class="smoky-form-label" style="font-size: 0.84rem; display: block; margin-bottom: 6px;">หมวดหมู่</label>
          <select id="ann-cat" class="smoky-glass-select" style="width: 100%; height: 42px; border-radius: 8px;">
            <option value="ทั่วไป">ทั่วไป</option>
            <option value="ซ่อมบำรุง">ซ่อมบำรุง</option>
            <option value="การเงิน">การเงิน / ค่าเช่า</option>
            <option value="กฎระเบียบ">กฎระเบียบหอพัก</option>
            <option value="กิจกรรม">กิจกรรม / ประชาสัมพันธ์</option>
          </select>
        </div>
        <div class="field" style="display:flex; align-items:center; gap:8px; margin-top:26px;">
          <input type="checkbox" id="ann-pinned" style="width:20px; height:20px; accent-color: #3B82F6;">
          <label for="ann-pinned" class="smoky-form-label" style="margin:0; cursor:pointer; font-size: 0.86rem;">📌 ปักหมุดไว้บนสุด</label>
        </div>
      </div>

      <div class="field">
        <label class="smoky-form-label" style="font-size: 0.84rem; display: block; margin-bottom: 6px;">เนื้อหาประกาศ *</label>
        <textarea id="ann-content" class="smoky-glass-input" rows="4" placeholder="พิมพ์รายละเอียดประกาศที่ต้องการแจ้งให้ผู้พักทราบ..." required style="width: 100%; border-radius: 8px; padding: 10px;"></textarea>
      </div>
    </form>
  `;

  const footer = `
    <button type="button" class="btn btn-outline" onclick="window.closeAppModal()">ยกเลิก</button>
    <button type="button" class="btn btn-primary" id="btn-submit-ann" style="background: #3B82F6; border-color: #3B82F6;">โพสต์ประกาศ</button>
  `;

  showModal({
    title: 'สร้างประกาศข่าวสารใหม่ (New Announcement)',
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

    const newId = 'ANN-' + Math.floor(10 + Math.random() * 90);

    const { error } = await supabase.from('announcements').insert([{
      id: newId,
      title,
      category: cat,
      pinned,
      content,
      date: new Date().toISOString().split('T')[0]
    }]);

    if (error) {
      toast('เกิดข้อผิดพลาดในการบันทึกประกาศ', 'error');
      return;
    }

    toast('เผยแพร่ประกาศเรียบร้อยแล้ว', 'success');
    closeModal();
    loadAnnouncementsData();
  };
}
