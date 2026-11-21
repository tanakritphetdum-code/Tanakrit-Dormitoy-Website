// js/api.js
// ระบบรวม SVG Icons, การแจ้งเตือน Toast และระบบ Modal กลาง

export const ICONS = {
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/>',
  swap: '<path d="M4 8h13"/><path d="M14 4l4 4-4 4"/><path d="M20 16H7"/><path d="M10 12l-4 4 4 4"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M2 20c0-3.3 3-6 7-6s7 2.7 7 6"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 14.2c2.6.4 4.5 2.4 4.5 5.8"/>',
  door: '<rect x="5" y="3" width="14" height="18" rx="1"/><circle cx="14" cy="12" r="1"/>',
  chart: '<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M2 20h20"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.2-1.6l2-1.4-1.6-2.8-2.3.8a7 7 0 0 0-2.7-1.6L14 3h-4l-.2 2.4a7 7 0 0 0-2.7 1.6l-2.3-.8-1.6 2.8 2 1.4A7 7 0 0 0 5 12c0 .5 0 1.1.2 1.6l-2 1.4 1.6 2.8 2.3-.8a7 7 0 0 0 2.7 1.6L10 21h4l.2-2.4a7 7 0 0 0 2.7-1.6l2.3.8 1.6-2.8-2-1.4c.2-.5.2-1.1.2-1.6z"/>',
  list: '<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
  userCheck: '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/>',
  check: '<path d="M4 12l5 5 11-11"/>',
  x: '<path d="M5 5l14 14"/><path d="M19 5L5 19"/>',
  plus: '<path d="M12 4v16"/><path d="M4 12h16"/>',
  bed: '<path d="M3 18v-7a2 2 0 0 1 2-2h5v5"/><path d="M3 13h18v5"/><path d="M21 18v-3a2 2 0 0 0-2-2h-4v5"/><path d="M3 21v-2"/><path d="M21 21v-2"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  box: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
  bill: '<rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/>',
  bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
  search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  filter: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
  printer: '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
  qr: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/><rect x="18" y="18" width="3" height="3"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  sparkles: '<path d="M12 3l1.91 5.89a1 1 0 0 0 .95.69h6.19l-5.01 3.64a1 1 0 0 0-.36 1.12l1.91 5.89-5.01-3.64a1 1 0 0 0-1.18 0l-5.01 3.64 1.91-5.89a1 1 0 0 0-.36-1.12L1.95 9.58h6.19a1 1 0 0 0 .95-.69L12 3z"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
  key: '<path d="M21 2l-2 2m-1.5 1.5L16 7l-1.5-1.5-3 3 1.5 1.5-2 2-1.5-1.5-3 3 1.5 1.5-2 2-1.5-1.5L2 19v3h3l1.5-1.5-1.5-1.5 2-2 1.5 1.5 3-3-1.5-1.5 2-2 1.5 1.5 3-3-1.5-1.5L19 4l2-2z"/>',
  trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  shoppingBag: '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  layoutGrid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
  messageCircle: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
  power: '<path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/>',
  play: '<polygon points="5 3 19 12 5 21 5 3"/>',
  pause: '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>',
  trendingUp: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
  trendingDown: '<polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>',
  activity: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
  chevronDown: '<polyline points="6 9 12 15 18 9"/>',
  chevronRight: '<polyline points="9 18 15 12 9 6"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>'
};

export function ic(name, cls = '') {
  return `<svg class="icon ${cls}" viewBox="0 0 24 24">${ICONS[name] || ''}</svg>`;
}

export function toast(msg, type = 'success') {
  let root = document.getElementById('toast-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'toast-root';
    document.body.appendChild(root);
  }
  const el = document.createElement('div');
  el.className = 'toast-item' + (type === 'error' ? ' error' : (type === 'info' ? ' info' : ''));
  const iconName = type === 'error' ? 'x' : (type === 'info' ? 'bell' : 'check');
  el.innerHTML = `${ic(iconName, '')} <span>${msg}</span>`;
  root.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(10px)';
    el.style.transition = 'all 0.3s ease';
    setTimeout(() => el.remove(), 300);
  }, 3500);
}

export function fmtDate(d) {
  if (!d) return '-';
  try {
    return new Date(d).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) {
    return d;
  }
}

export function fmtCurrency(num) {
  if (num == null || isNaN(num)) return '0 ฿';
  return Number(num).toLocaleString('th-TH') + ' ฿';
}

// ระบบ Global Modal Dialog สวยงาม ไม่ต้องใช้ alert()
export function showModal({ title, body, footer = '', maxWidth = '560px' }) {
  let modalBackdrop = document.getElementById('app-modal-backdrop');
  if (!modalBackdrop) {
    modalBackdrop = document.createElement('div');
    modalBackdrop.id = 'app-modal-backdrop';
    modalBackdrop.className = 'modal-backdrop';
    document.body.appendChild(modalBackdrop);
  }

  modalBackdrop.innerHTML = `
    <div class="modal-dialog" style="max-width: ${maxWidth};">
      <div class="modal-header">
        <h3 class="modal-title">${title}</h3>
        <button class="modal-close" id="btn-modal-close">${ic('x')}</button>
      </div>
      <div class="modal-body">${body}</div>
      ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
    </div>
  `;

  modalBackdrop.classList.add('active');

  const closeBtn = document.getElementById('btn-modal-close');
  if (closeBtn) closeBtn.onclick = closeModal;

  modalBackdrop.onclick = (e) => {
    if (e.target === modalBackdrop) closeModal();
  };
}

export function closeModal() {
  const modalBackdrop = document.getElementById('app-modal-backdrop');
  if (modalBackdrop) {
    modalBackdrop.classList.remove('active');
  }
}

// ย่อขนาดรูปภาพและแปลงเป็น Data URL สำหรับเก็บในฐานข้อมูลอย่างมีประสิทธิภาพ
export function compressImage(file, maxDimension = 1000, quality = 0.8) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    if (!file.type || !file.type.startsWith('image/')) {
      return reject(new Error('ไฟล์ที่เลือกไม่ใช่รูปภาพ'));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('ไม่สามารถประมวลผลรูปภาพได้'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('ไม่สามารถอ่านไฟล์ได้'));
    reader.readAsDataURL(file);
  });
}

// แสดงรูปภาพขนาดใหญ่ใน Modal
export function showImageModal(imgUrl, title = 'ดูรูปภาพขยายใหญ่') {
  showModal({
    title,
    body: `
      <div style="text-align:center; padding:8px 0;">
        <img src="${imgUrl}" alt="Preview" style="max-width:100%; max-height:72vh; border-radius:10px; box-shadow:0 4px 16px rgba(0,0,0,0.12); object-fit:contain;">
      </div>
    `,
    footer: `
      <a href="${imgUrl}" download="image.jpg" class="btn btn-outline" style="margin-right:auto;">${ic('printer')} บันทึกรูปภาพ</a>
      <button type="button" class="btn btn-primary" onclick="window.closeAppModal()">ปิดหน้าต่าง</button>
    `,
    maxWidth: '680px'
  });
}
window.showImageModal = showImageModal;
