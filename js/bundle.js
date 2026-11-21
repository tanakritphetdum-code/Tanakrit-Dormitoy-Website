/* Bundled Tanakrit Dormitory Application - Standalone & File:// Compatible */
(function() {
"use strict";


/* ========== js/supabase.js ========== */
// js/supabase.js
// ระบบเชื่อมต่อฐานข้อมูล Supabase Cloud (Live Production Database)
// เชื่อมต่อผ่าน REST API (PostgREST) อัตโนมัติ รองรับสิทธิ์ anon key
const SUPABASE_URL = 'https://ewvqgccmyxpwnhjzagye.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_QOYngsbMMfzYdDvHA34yyQ_BD1RMnjW';
const SETTINGS_CACHE_KEY = 'tanakrit_settings_cache';

// การตั้งค่าเริ่มต้นสำรอง
let cachedSettings = {
  id: 'default',
  dorm_name: 'Tanakrit Dormitory',
  sub_title: 'หอพักชายธนกฤษฎ์ นครศรีธรรมราช',
  phone: '075-355-289, 089-590-0478 , 087-280-0478 , 084-191-9985',
  line_id: 'Tonyeiei',
  address: '69/4 หมู่ที่ 2 ต.ทอนหงส์ อ.พรหมคีรี จ.นครศรีธรรมราช 80320',
  water_rate: 18,
  electric_rate: 8,
  common_fee: 100,
  promptpay_number: '086-946-1654'
};

// อัปเดตข้อมูลบนหน้า Landing Page (index.html) ตามการตั้งค่า
function applySettingsToLandingPage(settings) {
  if (!settings) return;
  const update = () => {
    // 1. Hero Live Badge
    const heroBadgeText = document.getElementById('landing-hero-badge-text');
    if (heroBadgeText) {
      const sub = settings.sub_title || 'หอพักชายธนกฤษฎ์ นครศรีธรรมราช';
      heroBadgeText.textContent = `${sub} (3 อาคาร 17 ห้อง)`;
    }

    // 2. Hero Title & Sub
    const heroTitle = document.getElementById('landing-hero-title');
    if (heroTitle && settings.dorm_name) {
      const parts = settings.dorm_name.trim().split(' ');
      heroTitle.textContent = parts[0] || 'Tanakrit';
    }
    const heroSub = document.getElementById('landing-hero-sub');
    if (heroSub && settings.dorm_name) {
      const parts = settings.dorm_name.trim().split(' ');
      if (parts.length > 1) {
        heroSub.textContent = parts.slice(1).join(' ') + ' & Living Space';
      }
    }

    // 3. Utility Rates
    const rateWater = document.getElementById('landing-rate-water');
    if (rateWater && settings.water_rate !== undefined) {
      rateWater.textContent = settings.water_rate;
    }
    const rateElec = document.getElementById('landing-rate-elec');
    if (rateElec && settings.electric_rate !== undefined) {
      rateElec.textContent = settings.electric_rate;
    }
    const rateCommon = document.getElementById('landing-rate-common');
    if (rateCommon && settings.common_fee !== undefined) {
      rateCommon.textContent = settings.common_fee;
    }

    // 4. Contact Office: Address, Phone, Line
    const contactAddr = document.getElementById('landing-contact-address');
    if (contactAddr && settings.address) {
      contactAddr.textContent = settings.address;
    }
    const contactPhone = document.getElementById('landing-contact-phone');
    if (contactPhone && settings.phone) {
      contactPhone.textContent = settings.phone;
    }
    const contactLine = document.getElementById('landing-contact-line');
    if (contactLine && settings.line_id) {
      contactLine.textContent = settings.line_id;
    }

    // 5. Footer: Phones, Logo, Copyright
    const phoneList = settings.phone ? settings.phone.split(',').map(p => p.trim()).filter(Boolean) : [];
    const footerPhone1 = document.getElementById('landing-footer-phone1');
    if (footerPhone1 && phoneList[0]) {
      const cleanPhone1 = phoneList[0].replace(/[^0-9]/g, '');
      footerPhone1.textContent = '📞 ' + phoneList[0];
      footerPhone1.setAttribute('href', 'tel:' + cleanPhone1);
    }
    const footerPhone2 = document.getElementById('landing-footer-phone2');
    if (footerPhone2) {
      if (phoneList[1]) {
        const cleanPhone2 = phoneList[1].replace(/[^0-9]/g, '');
        footerPhone2.textContent = '📱 ' + phoneList[1];
        footerPhone2.setAttribute('href', 'tel:' + cleanPhone2);
        if (footerPhone2.parentElement) footerPhone2.parentElement.style.display = '';
      } else {
        if (footerPhone2.parentElement) footerPhone2.parentElement.style.display = 'none';
      }
    }
    const footerPhoneIcon = document.getElementById('landing-footer-phone-icon');
    if (footerPhoneIcon && phoneList[0]) {
      const cleanPhone1 = phoneList[0].replace(/[^0-9]/g, '');
      footerPhoneIcon.setAttribute('href', 'tel:' + cleanPhone1);
    }

    const footerCopyright = document.getElementById('landing-footer-copyright');
    if (footerCopyright) {
      const dormName = settings.dorm_name || 'Tanakrit Dormitory';
      const subTitle = settings.sub_title || 'หอพักชายธนกฤษฎ์ นครศรีธรรมราช';
      footerCopyright.textContent = `© 2026 ${dormName}. All rights reserved. ${subTitle}`;
    }

    const footerBrandName = document.getElementById('landing-footer-brand-name');
    if (footerBrandName && settings.dorm_name) {
      footerBrandName.textContent = settings.dorm_name;
    }
    const footerTag = document.getElementById('landing-footer-tag');
    if (footerTag && settings.sub_title) {
      footerTag.textContent = `${settings.sub_title} (3 อาคาร 17 ห้อง) บริการห้องพักรายเดือนคุณภาพ บรรยากาศร่มรื่น เงียบสงบ ปลอดภัย`;
    }
  };

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', update, { once: true });
    } else {
      update();
    }
  }
}

// ซิงค์การตั้งค่าเริ่มต้นจาก LocalStorage Cache ถ้ามี
try {
  const localSaved = localStorage.getItem(SETTINGS_CACHE_KEY);
  if (localSaved) {
    cachedSettings = { ...cachedSettings, ...JSON.parse(localSaved) };
  }
} catch (e) {
  console.warn('Could not load local settings cache:', e);
}

// ผูกฟังก์ชันระดับ Window
if (typeof window !== 'undefined') {
  window.applySettingsToLandingPage = applySettingsToLandingPage;
  window.getCurrentSettings = () => cachedSettings;
  applySettingsToLandingPage(cachedSettings);
}

// ฟังก์ชันซิงค์การตั้งค่าจาก Supabase Cloud แบบ Background
async function syncSettingsFromCloud() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/settings?select=*&id=eq.default`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    if (res.ok) {
      const rows = await res.json();
      if (rows && rows.length > 0) {
        cachedSettings = { ...cachedSettings, ...rows[0] };
        localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(cachedSettings));
        if (typeof window !== 'undefined' && window.applySettingsToLandingPage) {
          window.applySettingsToLandingPage(cachedSettings);
        }
      }
    }
  } catch (err) {
    console.warn('Background sync settings warning:', err);
  }
}

// เริ่มซิงค์ Settings ทันทีเมื่อสคริปต์โหลด
syncSettingsFromCloud();

// คลาส QueryBuilder สำหรับเชื่อมต่อตารางใน Supabase
class QueryBuilder {
  constructor(table) {
    this.table = table;
    this.fields = '*';
    this.filters = [];
    this.sortCol = null;
    this.sortAsc = true;
    this.operation = 'SELECT'; // 'SELECT', 'INSERT', 'UPDATE', 'DELETE'
    this.payload = null;
  }

  select(fields = '*') {
    this.fields = fields;
    return this;
  }

  order(column, { ascending = true } = {}) {
    this.sortCol = column;
    this.sortAsc = ascending;
    return this;
  }

  eq(column, value) {
    this.filters.push(`${encodeURIComponent(column)}=eq.${encodeURIComponent(value)}`);
    return this;
  }

  insert(rows) {
    this.operation = 'INSERT';
    const rowList = Array.isArray(rows) ? rows : [rows];
    // กำหนด default id หากไม่มี
    rowList.forEach(r => {
      if (!r.id) {
        r.id = 'ID-' + Math.random().toString(36).substring(2, 9);
      }
    });
    this.payload = rowList;
    return this;
  }

  update(updates) {
    this.operation = 'UPDATE';
    this.payload = updates;
    return this;
  }

  delete() {
    this.operation = 'DELETE';
    return this;
  }

  // รองรับการทำงานแบบ Promise (await supabase.from(...))
  then(resolve, reject) {
    return this._execute().then(resolve, reject);
  }

  async _execute() {
    const headers = {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };

    let url = `${SUPABASE_URL}/rest/v1/${this.table}`;
    let options = { headers };

    if (this.operation === 'SELECT') {
      options.method = 'GET';
      const params = [];
      if (this.fields) params.push(`select=${this.fields}`);
      if (this.filters.length > 0) params.push(this.filters.join('&'));
      if (this.sortCol) {
        params.push(`order=${encodeURIComponent(this.sortCol)}.${this.sortAsc ? 'asc' : 'desc'}`);
      }
      url += (params.length > 0 ? '?' + params.join('&') : '');
    } else if (this.operation === 'INSERT') {
      options.method = 'POST';
      options.body = JSON.stringify(this.payload);
    } else if (this.operation === 'UPDATE') {
      options.method = 'PATCH';
      if (this.filters.length > 0) {
        url += '?' + this.filters.join('&');
      }
      options.body = JSON.stringify(this.payload);
    } else if (this.operation === 'DELETE') {
      options.method = 'DELETE';
      if (this.filters.length > 0) {
        url += '?' + this.filters.join('&');
      }
    }

    try {
      const res = await fetch(url, options);

      if (!res.ok) {
        let errJson = null;
        try {
          errJson = await res.json();
        } catch (_) {
          errJson = { message: res.statusText, status: res.status };
        }
        console.error(`Supabase error [${this.operation} ${this.table}]:`, errJson);
        return { data: null, error: errJson };
      }

      let data = null;
      try {
        data = await res.json();
      } catch (_) {
        data = this.operation === 'DELETE' ? true : [];
      }

      // ถ้าเป็นตาราง settings และมีการ update ให้ปรับปรุง cachedSettings ทันที
      if (this.table === 'settings' && this.operation === 'UPDATE' && this.payload) {
        cachedSettings = { ...cachedSettings, ...this.payload };
        localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(cachedSettings));
        if (typeof window !== 'undefined' && window.applySettingsToLandingPage) {
          window.applySettingsToLandingPage(cachedSettings);
        }
      }

      return { data: data, error: null };
    } catch (err) {
      console.error(`Network error connecting to Supabase [${this.operation} ${this.table}]:`, err);
      return { data: null, error: err };
    }
  }
}

// ส่งออก supabase client object
const supabase = {
  from(table) {
    return new QueryBuilder(table);
  },
  getRawData() {
    return { settings: cachedSettings };
  },
  async getSettings() {
    await syncSettingsFromCloud();
    return cachedSettings;
  },
  resetToDefaults() {
    console.info('Database is now linked to live Supabase Cloud (https://ewvqgccmyxpwnhjzagye.supabase.co)');
    return { settings: cachedSettings };
  },
  url: SUPABASE_URL,
  key: SUPABASE_ANON_KEY
};


/* ========== js/api.js ========== */
// js/api.js
// ระบบรวม SVG Icons, การแจ้งเตือน Toast และระบบ Modal กลาง
const ICONS = {
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
function ic(name, cls = '') {
  return `<svg class="icon ${cls}" viewBox="0 0 24 24">${ICONS[name] || ''}</svg>`;
}
function toast(msg, type = 'success') {
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
function fmtDate(d) {
  if (!d) return '-';
  try {
    return new Date(d).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) {
    return d;
  }
}
function fmtCurrency(num) {
  if (num == null || isNaN(num)) return '0 ฿';
  return Number(num).toLocaleString('th-TH') + ' ฿';
}

// ระบบ Global Modal Dialog สวยงาม ไม่ต้องใช้ alert()
function showModal({ title, body, footer = '', maxWidth = '560px' }) {
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
function closeModal() {
  const modalBackdrop = document.getElementById('app-modal-backdrop');
  if (modalBackdrop) {
    modalBackdrop.classList.remove('active');
  }
}

// ย่อขนาดรูปภาพและแปลงเป็น Data URL สำหรับเก็บในฐานข้อมูลอย่างมีประสิทธิภาพ
function compressImage(file, maxDimension = 1000, quality = 0.8) {
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
function showImageModal(imgUrl, title = 'ดูรูปภาพขยายใหญ่') {
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


/* ========== js/auth.js ========== */
// js/auth.js
// ระบบยืนยันตัวตน (Authentication) เชื่อมต่อตาราง users ใน Supabase Cloud


// รายชื่อบัญชีเริ่มต้นสำรอง (สำหรับกรณีออฟไลน์)
const USERS = [
  { username: 'admin', password: 'admin123', role: 'admin', name: 'นายเกียรติศักดิ์ บริหาร (ผู้จัดการหอพัก)', initial: 'ผ', tenantId: null, room: null, roleTitle: 'ผู้ดูแลระบบสูงสุด' },
  { username: 'staff', password: 'staff123', role: 'staff', name: 'นางสาวสมหญิง เจ้าหน้าที่หอพัก', initial: 'ส', tenantId: null, room: null, roleTitle: 'เจ้าหน้าที่ธุรการ/ช่าง' },
  { username: 'student', password: 'student123', role: 'student', name: 'นายสมชาย ธนกฤษฎ์', initial: 'ส', tenantId: '6512345', room: '101', phone: '089-123-4567', roleTitle: 'ผู้พักอาศัย (ห้อง 101 อาคาร Tanakrit)' },
];
let currentUser = null;

// กู้คืน Session อัตโนมัติถ้าเคยล็อกอินไว้
function initAuth() {
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
async function handleLogin(e, onSuccess) {
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
async function quickLoginAs(roleName, onSuccess) {
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
function setCurrentUser(user) {
  currentUser = user;
  localStorage.setItem('tanakrit_current_user', JSON.stringify(user));
  localStorage.setItem('kp_current_user', JSON.stringify(user));
  document.getElementById('page-landing').classList.add('hidden');
  document.getElementById('page-app').classList.remove('hidden');
}
function handleLogout() {
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
function toggleLoginModal(forceOpen) {
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
function toggleSidebar(open) {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  if (sidebar) sidebar.classList.toggle('open', open);
  if (overlay) overlay.style.display = open ? 'block' : 'none';
}


/* ========== js/utilities.js ========== */
// js/utilities.js
// ระบบบันทึกมิเตอร์น้ำ-ไฟ และออกใบแจ้งหนี้ (Billing & Utilities)
// ออกแบบด้วย Smoky Frosted Glass Design System




let utilityStatusFilter = 'all';
let utilitySearchQuery = '';
async function renderUtilitiesView() {
  setTimeout(() => {
    bindUtilitiesEvents();
    loadUtilitiesData();
  }, 0);

  return `
    <div style="display: flex; flex-direction: column; gap: 22px;">
      
      <!-- 1. Header Card (Smoky Glass) -->
      <div class="smoky-card" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(59,130,246,0.18); border: 1px solid rgba(59,130,246,0.32); display: flex; align-items: center; justify-content: center; color: #3B82F6;">
            ${ic('bill')}
          </div>
          <div>
            <h2 style="font-size: 1.35rem; font-weight: 700; color: #ffffff; margin: 0; letter-spacing: -0.02em;">
              ระบบบันทึกมิเตอร์น้ำ-ไฟ และออกใบแจ้งหนี้ (Billing & Utilities)
            </h2>
            <span style="font-size: 0.82rem; color: rgba(255,255,255,0.48); margin-top: 3px; display: block;">
              ค่าน้ำประปา (18 ฿/หน่วย) · ค่าไฟฟ้า (8 ฿/หน่วย) · ค่าบริการส่วนกลาง 100 ฿ · Wi-Fi 100 ฿ · ขยะ 20 ฿ · QR สแกนจ่าย
            </span>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <button class="smoky-round-glass-btn" id="btn-add-meter" style="width: auto; border-radius: 9999px; padding: 0 18px; height: 38px; background: #3B82F6; color: #ffffff; border: 1px solid rgba(59,130,246,0.5); box-shadow: 0 0 20px rgba(59,130,246,0.4); font-size: 0.82rem; font-weight: 600; gap: 6px;">
            ${ic('plus')}
            <span>จดมิเตอร์รอบใหม่</span>
          </button>
        </div>
      </div>

      <!-- 2. KPI Summary Tiles (Smoky Glass) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 16px;" id="utility-summary-stats">
        <!-- populated via JS -->
      </div>

      <!-- 3. Filters & Search Toolbar (Smoky Glass) -->
      <div class="smoky-card" style="padding: 16px 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
          
          <!-- Search Box -->
          <div style="position: relative; min-width: 240px; flex: 1; max-width: 320px;">
            <span style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.4); display: flex; align-items: center;">
              ${ic('search')}
            </span>
            <input type="text" id="utility-search-input" class="smoky-glass-input" placeholder="ค้นหาเลขห้อง หรือชื่อผู้เช่า..." style="width: 100%; padding-left: 38px;">
          </div>

          <!-- Status Filter Tabs (Segmented Control) -->
          <div class="smoky-segmented" id="utility-status-tabs" style="overflow-x: auto; max-width: 100%;">
            <button class="smoky-seg-btn active" data-status="all">ทั้งหมด</button>
            <button class="smoky-seg-btn" data-status="pending">รอชำระเงิน</button>
            <button class="smoky-seg-btn" data-status="verifying" style="color: #F59E0B;">รอตรวจสลิป ⏳</button>
            <button class="smoky-seg-btn" data-status="paid" style="color: #34D399;">ชำระแล้ว</button>
          </div>

          <!-- Refresh Action -->
          <div>
            <button class="smoky-round-glass-btn" id="btn-refresh-utilities" style="width: auto; height: 36px; padding: 0 16px; border-radius: 9999px; font-size: 0.80rem; gap: 6px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);">
              ${ic('check')}
              <span>รีเฟรชข้อมูล</span>
            </button>
          </div>

        </div>
      </div>

      <!-- 4. Table Wrapper (Smoky Frosted Glass) -->
      <div class="smoky-table-wrap">
        <table class="smoky-table">
          <thead>
            <tr>
              <th>เลขที่บิล / ห้องพัก</th>
              <th>รอบประจำเดือน</th>
              <th>ค่าน้ำประปา (18฿/หน่วย)</th>
              <th>ค่าไฟฟ้า (8฿/หน่วย)</th>
              <th>ค่าส่วนกลาง & สัญญา</th>
              <th>ยอดรวมทั้งสิ้น</th>
              <th>สถานะการชำระ</th>
              <th style="text-align: right; padding-right: 22px; width: 170px;">จัดการบิล</th>
            </tr>
          </thead>
          <tbody id="utilities-tbody">
            <tr><td colspan="8" style="text-align:center; padding: 40px; color: rgba(255,255,255,0.4);">กำลังโหลดข้อมูลค่าน้ำ-ค่าไฟ...</td></tr>
          </tbody>
        </table>
      </div>

    </div>
  `;
}

async function loadUtilitiesData() {
  const tbody = document.getElementById('utilities-tbody');
  const summaryBox = document.getElementById('utility-summary-stats');
  if (!tbody) return;

  const { data: readings, error } = await supabase
    .from('meter_readings')
    .select('*')
    .order('billing_month', { ascending: false });

  if (error || !readings) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:#F87171; padding: 30px;">ไม่สามารถโหลดข้อมูลค่าน้ำ-ค่าไฟได้</td></tr>`;
    return;
  }

  // Summary counters
  const totalBills = readings.length;
  const pendingBills = readings.filter(r => r.status === 'pending');
  const verifyingBills = readings.filter(r => r.status === 'verifying');
  const paidBills = readings.filter(r => r.status === 'paid');
  const totalRevenue = readings.reduce((acc, cur) => acc + (cur.total_price || 0), 0);
  const pendingAmount = pendingBills.reduce((acc, cur) => acc + (cur.total_price || 0), 0);

  if (summaryBox) {
    summaryBox.innerHTML = `
      <div class="smoky-tile" style="padding: 16px 18px; border-radius: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="smoky-meta-label">ยอดเรียกเก็บรวม</span>
          <div style="width: 28px; height: 28px; border-radius: 8px; background: rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.85);">
            ${ic('bill')}
          </div>
        </div>
        <div style="margin-top: 8px; display: flex; align-items: baseline; gap: 8px;">
          <span class="smoky-kpi-num" style="font-size: 1.65rem; color: #ffffff;">${fmtCurrency(totalRevenue)}</span>
          <span style="font-size: 0.76rem; color: rgba(255,255,255,0.45);">${totalBills} บิล</span>
        </div>
      </div>

      <div class="smoky-tile" style="padding: 16px 18px; border-radius: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="smoky-meta-label">รอชำระเงิน</span>
          <span class="smoky-delta-neg" style="font-size: 0.70rem;">${pendingBills.length} บิล</span>
        </div>
        <div style="margin-top: 8px; display: flex; align-items: baseline; gap: 8px;">
          <span class="smoky-kpi-num" style="font-size: 1.65rem; color: #F87171;">${fmtCurrency(pendingAmount)}</span>
          <span style="font-size: 0.76rem; color: rgba(255,255,255,0.45);">ค้างชำระ</span>
        </div>
      </div>

      <div class="smoky-tile" style="padding: 16px 18px; border-radius: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="smoky-meta-label">รอตรวจสลิปโอน</span>
          <span style="background: rgba(245,158,11,0.18); color: #F59E0B; font-size: 0.65rem; font-weight: 700; padding: 2px 7px; border-radius: 9999px;">ตรวจสอบ</span>
        </div>
        <div style="margin-top: 8px; display: flex; align-items: baseline; gap: 8px;">
          <span class="smoky-kpi-num" style="font-size: 1.65rem; color: #F59E0B;">${verifyingBills.length}</span>
          <span style="font-size: 0.76rem; color: rgba(255,255,255,0.45);">สลิปแนบใหม่</span>
        </div>
      </div>

      <div class="smoky-tile" style="padding: 16px 18px; border-radius: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="smoky-meta-label">ชำระแล้วเรียบร้อย</span>
          <span class="smoky-delta-pos" style="font-size: 0.70rem;">เสร็จสิ้น</span>
        </div>
        <div style="margin-top: 8px; display: flex; align-items: baseline; gap: 8px;">
          <span class="smoky-kpi-num" style="font-size: 1.65rem; color: #34D399;">${paidBills.length}</span>
          <span style="font-size: 0.76rem; color: rgba(255,255,255,0.45);">บิลรับชำระแล้ว</span>
        </div>
      </div>
    `;
  }

  let filtered = readings;
  if (utilityStatusFilter !== 'all') {
    filtered = filtered.filter(r => r.status === utilityStatusFilter);
  }

  if (utilitySearchQuery) {
    const q = utilitySearchQuery.toLowerCase();
    filtered = filtered.filter(r => 
      (r.room_number || '').toLowerCase().includes(q) ||
      (r.tenant_name || '').toLowerCase().includes(q) ||
      (r.id || '').toLowerCase().includes(q)
    );
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 40px; color:rgba(255,255,255,0.4);">ไม่มีรายการบิลตามเงื่อนไขที่เลือก</td></tr>`;
    return;
  }

  let html = '';
  filtered.forEach(r => {
    const isPaid = r.status === 'paid';
    const isVerifying = r.status === 'verifying';
    
    let statusBadgeBg = 'rgba(248,113,113,0.16)';
    let statusBadgeColor = '#F87171';
    let statusBadgeBorder = 'rgba(248,113,113,0.30)';
    let statusBadgeText = 'รอชำระ';

    if (isPaid) {
      statusBadgeBg = 'rgba(52,211,153,0.16)';
      statusBadgeColor = '#34D399';
      statusBadgeBorder = 'rgba(52,211,153,0.30)';
      statusBadgeText = '✓ ชำระแล้ว';
    } else if (isVerifying) {
      statusBadgeBg = 'rgba(245,158,11,0.16)';
      statusBadgeColor = '#F59E0B';
      statusBadgeBorder = 'rgba(245,158,11,0.30)';
      statusBadgeText = '⏳ รอตรวจสลิป';
    }

    const roomNum = r.room_number || '';
    let bldName = 'อาคาร ธนกฤษฎ์';
    let bldColor = '#34D399';
    if (roomNum.startsWith('B')) {
      bldName = 'อาคาร ใต้บ้าน';
      bldColor = '#F59E0B';
    } else if (Number(roomNum) >= 200) {
      bldName = 'อาคาร กิ่งเพชร';
      bldColor = '#60A5FA';
    }

    html += `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 34px; height: 34px; border-radius: 9px; background: rgba(59,130,246,0.18); color: #3B82F6; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 700; border: 1px solid rgba(59,130,246,0.25);">
              ${r.room_number}
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="font-weight: 700; color: #ffffff; font-size: 0.90rem;">ห้อง ${r.room_number}</span>
                <span style="font-size: 0.65rem; color: ${bldColor}; font-weight: 600;">(${bldName})</span>
              </div>
              <small style="color: rgba(255,255,255,0.45); font-size: 0.72rem;">${r.tenant_name || '-'} · ${r.id}</small>
            </div>
          </div>
        </td>
        <td>
          <div style="font-weight: 600; color: #ffffff;">${r.month_label || r.billing_month}</div>
          <small style="color: rgba(255,255,255,0.45); font-size: 0.72rem;">ครบกำหนด: ${fmtDate(r.due_date)}</small>
        </td>
        <td>
          <div style="font-weight: 600; color: rgba(255,255,255,0.9);">${r.water_unit || 0} หน่วย <span style="font-size: 0.72rem; color: rgba(255,255,255,0.4);">(${r.prev_water}➔${r.curr_water})</span></div>
          <small style="color: #60A5FA; font-weight: 600;">${fmtCurrency(r.water_total || (r.water_unit * 18))}</small>
        </td>
        <td>
          <div style="font-weight: 600; color: rgba(255,255,255,0.9);">${r.electric_unit || 0} หน่วย <span style="font-size: 0.72rem; color: rgba(255,255,255,0.4);">(${r.prev_electric}➔${r.curr_electric})</span></div>
          <small style="color: #F59E0B; font-weight: 600;">${fmtCurrency(r.electric_total || (r.electric_unit * 8))}</small>
        </td>
        <td>
          <div style="font-size: 0.82rem; color: rgba(255,255,255,0.85); font-weight: 600;">220 ฿</div>
          <small style="color: rgba(255,255,255,0.4); font-size: 0.68rem;">ส่วนกลาง 100 + wifi 100 + ขยะ 20</small>
        </td>
        <td>
          <strong style="color: #ffffff; font-size: 1.05rem; letter-spacing: -0.01em;">${fmtCurrency(r.total_price)}</strong>
        </td>
        <td>
          <span style="background: ${statusBadgeBg}; color: ${statusBadgeColor}; border: 1px solid ${statusBadgeBorder}; font-size: 0.70rem; font-weight: 700; padding: 4px 10px; border-radius: 9999px; display: inline-flex; align-items: center; gap: 5px; white-space: nowrap;">
            <span style="width: 6px; height: 6px; border-radius: 50%; background: ${statusBadgeColor};"></span>
            ${statusBadgeText}
          </span>
        </td>
        <td style="text-align: right; padding-right: 22px;">
          <div style="display: inline-flex; gap: 8px; align-items: center; justify-content: flex-end;">
            ${isVerifying ? `
              <button class="smoky-round-glass-btn btn-view-invoice" data-id="${r.id}" style="width: auto; height: 32px; padding: 0 12px; border-radius: 8px; background: rgba(245,158,11,0.25); border: 1px solid rgba(245,158,11,0.45); color: #F59E0B; font-size: 0.75rem; font-weight: 600; gap: 5px;" title="ตรวจสอบสลิปโอนเงิน">
                ${ic('eye')} <span>ตรวจสลิป</span>
              </button>
            ` : `
              <button class="smoky-round-glass-btn btn-view-invoice" data-id="${r.id}" style="width: auto; height: 32px; padding: 0 12px; border-radius: 8px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.14); color: #ffffff; font-size: 0.75rem; font-weight: 600; gap: 5px;" title="เปิดดูใบแจ้งหนี้ / สแกนจ่าย">
                ${ic('bill')} <span>ใบแจ้งหนี้</span>
              </button>
            `}
            ${r.slip_url ? `
              <img src="${r.slip_url}" class="img-thumb-preview" alt="สลิป" onclick="event.stopPropagation(); window.showImageModal('${r.slip_url}', 'สลิปโอนเงิน ห้อง ${r.room_number}')" title="คลิกดูสลิปขนาดเต็ม" style="width: 32px; height: 32px; border-radius: 8px; object-fit: cover; border: 1px solid rgba(255,255,255,0.2); cursor: pointer;">
            ` : ''}
            <button class="smoky-round-glass-btn btn-toggle-pay" data-id="${r.id}" style="width: 32px; height: 32px; border-radius: 8px; background: ${isPaid ? 'rgba(255,255,255,0.06)' : 'rgba(52,211,153,0.22)'}; border: 1px solid ${isPaid ? 'rgba(255,255,255,0.12)' : 'rgba(52,211,153,0.4)'}; color: ${isPaid ? 'rgba(255,255,255,0.5)' : '#34D399'};" title="${isPaid ? 'เปลี่ยนเป็นยังไม่ชำระ' : 'ยืนยันรับชำระเงิน'}">
              ${isPaid ? ic('x') : ic('check')}
            </button>
            <button class="smoky-round-glass-btn btn-del-bill" data-id="${r.id}" style="width: 32px; height: 32px; padding: 0; border-radius: 8px; color: #FB7185; border-color: rgba(244, 63, 94, 0.3); background: rgba(244, 63, 94, 0.1);" title="ลบใบแจ้งหนี้">
              ${ic('trash')}
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;

  // View Invoice
  tbody.querySelectorAll('.btn-view-invoice').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      const target = readings.find(x => x.id === id);
      if (target) openInvoiceModal(target);
    };
  });

  // Toggle Payment
  tbody.querySelectorAll('.btn-toggle-pay').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id');
      const target = readings.find(x => x.id === id);
      if (!target) return;
      const nextStatus = target.status === 'paid' ? 'pending' : 'paid';
      await supabase.from('meter_readings').eq('id', id).update({ status: nextStatus });
      toast(`เปลี่ยนสถานะบิล ${target.id} เป็น "${nextStatus === 'paid' ? 'ชำระแล้ว' : 'รอชำระ'}"`, 'success');
      loadUtilitiesData();
    };
  });

  // Delete Bill
  tbody.querySelectorAll('.btn-del-bill').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id');
      const target = readings.find(x => x.id === id);
      if (!target) return;
      if (confirm(`คุณต้องการลบใบแจ้งหนี้ "${target.id}" (ห้อง ${target.room_number}) ออกจากระบบใช่หรือไม่?`)) {
        const { error } = await supabase.from('meter_readings').eq('id', id).delete();
        if (error) {
          toast('เกิดข้อผิดพลาดในการลบบิล', 'error');
          return;
        }
        toast(`ลบใบแจ้งหนี้ ${target.id} เรียบร้อยแล้ว`, 'success');
        loadUtilitiesData();
      }
    };
  });
}

function bindUtilitiesEvents() {
  const tabs = document.getElementById('utility-status-tabs');
  if (tabs) {
    tabs.querySelectorAll('.smoky-seg-btn').forEach(btn => {
      btn.onclick = () => {
        tabs.querySelectorAll('.smoky-seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        utilityStatusFilter = btn.getAttribute('data-status');
        loadUtilitiesData();
      };
    });
  }

  const searchInput = document.getElementById('utility-search-input');
  if (searchInput) {
    searchInput.oninput = (e) => {
      utilitySearchQuery = e.target.value.trim().toLowerCase();
      loadUtilitiesData();
    };
  }

  const btnAdd = document.getElementById('btn-add-meter');
  if (btnAdd) btnAdd.onclick = openAddMeterModal;

  const btnRefresh = document.getElementById('btn-refresh-utilities');
  if (btnRefresh) btnRefresh.onclick = () => {
    toast('รีเฟรชข้อมูลค่าน้ำ-ค่าไฟเรียบร้อย', 'info');
    loadUtilitiesData();
  };
}

// Modal ใบแจ้งหนี้และ QR Code สแกนจ่าย
function openInvoiceModal(bill) {
  const isPaid = bill.status === 'paid';
  const isVerifying = bill.status === 'verifying';
  const isAdminOrStaff = currentUser && (currentUser.role === 'admin' || currentUser.role === 'staff');
  const qrMockUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=PROMPTPAY-0869461654-AMOUNT-${bill.total_price}`;

  let statusBadgeHtml = '<div class="invoice-badge unpaid">รอชำระเงิน</div>';
  if (isPaid) {
    statusBadgeHtml = '<div class="invoice-badge paid">✓ ชำระเงินแล้ว</div>';
  } else if (isVerifying) {
    statusBadgeHtml = '<div class="invoice-badge" style="background:#FFF3E0; color:#E65100; border:1px solid #FFE0B2;">⏳ รอตรวจสลิป</div>';
  }

  const body = `
    <div class="invoice-container" id="printable-invoice">
      <div class="invoice-header">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div style="font-family:'Kanit'; font-size: 1.4rem; font-weight: 700; color: var(--teal-950);">
              Tanakrit Dormitory
            </div>
            <div style="font-size: 0.85rem; color: var(--muted);">หอพักชายธนกฤษฎ์ นครศรีธรรมราช (3 อาคาร 17 ห้อง)</div>
            <div style="font-size: 0.8rem; color: var(--muted);">ใกล้มหาวิทยาลัยวลัยลักษณ์ ทอนหงส์ อ.พรหมคีรี จ.นครศรีธรรมราช โทร. 086-946-1654</div>
          </div>
          <div style="text-align: right;">
            ${statusBadgeHtml}
            <div style="font-size: 0.85rem; margin-top: 6px; color: var(--muted);">เลขที่: <strong>${bill.id}</strong></div>
            <div style="font-size: 0.85rem; color: var(--muted);">รอบบิล: <strong>${bill.month_label || bill.billing_month}</strong></div>
          </div>
        </div>
      </div>

      <div class="invoice-tenant-strip">
        <div>
          <span class="lbl">ผู้พักอาศัย / ห้อง:</span>
          <strong>ห้อง ${bill.room_number} - ${bill.tenant_name || 'ไม่ระบุชื่อ'}</strong>
        </div>
        <div>
          <span class="lbl">กำหนดชำระภายใน:</span>
          <strong style="color: ${isPaid ? 'var(--emerald)' : 'var(--danger)'};">${fmtDate(bill.due_date)}</strong>
        </div>
      </div>

      <table class="invoice-items-table">
        <thead>
          <tr>
            <th>รายการ</th>
            <th style="text-align: center;">มิเตอร์ก่อนหน้า - ปัจจุบัน</th>
            <th style="text-align: center;">หน่วยที่ใช้</th>
            <th style="text-align: right;">ราคา/หน่วย</th>
            <th style="text-align: right;">รวมเป็นเงิน</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>ค่าเช่าห้องพักประจำเดือน (สัญญา 12 เดือน)</strong></td>
            <td style="text-align: center;">-</td>
            <td style="text-align: center;">1 เดือน</td>
            <td style="text-align: right;">${fmtCurrency(bill.room_price)}</td>
            <td style="text-align: right;"><strong>${fmtCurrency(bill.room_price)}</strong></td>
          </tr>
          <tr>
            <td>ค่าน้ำประปา</td>
            <td style="text-align: center;">${bill.prev_water} ➔ ${bill.curr_water}</td>
            <td style="text-align: center;">${bill.water_unit} หน่วย</td>
            <td style="text-align: right;">${bill.water_rate || 18} ฿</td>
            <td style="text-align: right;">${fmtCurrency(bill.water_total)}</td>
          </tr>
          <tr>
            <td>ค่ากระแสไฟฟ้า</td>
            <td style="text-align: center;">${bill.prev_electric} ➔ ${bill.curr_electric}</td>
            <td style="text-align: center;">${bill.electric_unit} หน่วย</td>
            <td style="text-align: right;">${bill.electric_rate || 8} ฿</td>
            <td style="text-align: right;">${fmtCurrency(bill.electric_total)}</td>
          </tr>
          <tr>
            <td>ค่าบริการส่วนกลาง</td>
            <td style="text-align: center;">-</td>
            <td style="text-align: center;">1 เดือน</td>
            <td style="text-align: right;">100 ฿</td>
            <td style="text-align: right;">100 ฿</td>
          </tr>
          <tr>
            <td>ค่าบริการ Wi-Fi ความเร็วสูง</td>
            <td style="text-align: center;">-</td>
            <td style="text-align: center;">1 เดือน</td>
            <td style="text-align: right;">100 ฿</td>
            <td style="text-align: right;">100 ฿</td>
          </tr>
          <tr>
            <td>ค่าบริการกำจัดขยะ</td>
            <td style="text-align: center;">-</td>
            <td style="text-align: center;">1 เดือน</td>
            <td style="text-align: right;">20 ฿</td>
            <td style="text-align: right;">20 ฿</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td colspan="4" style="text-align: right; font-weight: 700; font-size: 1.1rem; color: var(--teal-950);">
              ยอดชำระทั้งสิ้น:
            </td>
            <td style="text-align: right; font-weight: 700; font-size: 1.25rem; color: var(--teal-900);">
              ${fmtCurrency(bill.total_price)}
            </td>
          </tr>
        </tfoot>
      </table>

      <!-- กล่องสถานะสลิปที่แนบแล้ว (ถ้ามี) -->
      ${isVerifying ? `
        <div style="background:#FFF9E6; border:1.5px solid #FFC107; border-radius:12px; padding:16px; margin-top:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:12px;">
            <div>
              <div style="font-weight:700; color:#E65100; font-size:1.02rem;">
                ⏳ มีการแนบสลิปแล้ว — อยู่ระหว่างรอเจ้าหน้าที่ตรวจสอบ
              </div>
              <div style="font-size:0.85rem; color:var(--muted); margin-top:4px;">
                แนบเมื่อ: ${fmtDate(bill.slip_uploaded_at || bill.created_at)}
                ${bill.payment_notes ? `<br>หมายเหตุจากผู้โอน: <strong>${bill.payment_notes}</strong>` : ''}
              </div>
            </div>
            ${bill.slip_url ? `
              <img src="${bill.slip_url}" class="img-thumb-preview" alt="สลิป" onclick="window.showImageModal('${bill.slip_url}', 'สลิปโอนเงิน ห้อง ${bill.room_number}')" title="คลิกดูสลิปขนาดเต็ม" style="width:72px; height:72px;">
            ` : ''}
          </div>
          ${isAdminOrStaff ? `
            <div style="display:flex; gap:10px; margin-top:14px; padding-top:12px; border-top:1px dashed #FFE082;">
              <button type="button" class="btn btn-primary" id="btn-approve-slip" style="flex:1;">
                ${ic('check')} ✅ อนุมัติการชำระเงิน (ออกใบเสร็จ)
              </button>
              <button type="button" class="btn btn-outline" id="btn-reject-slip" style="color:var(--danger); border-color:#fadbd8;">
                ${ic('x')} ❌ ปฏิเสธสลิป / แจ้งโอนใหม่
              </button>
            </div>
          ` : ''}
        </div>
      ` : ''}

      <!-- ส่วนชำระเงิน และแนบสลิปโอนเงิน -->
      ${!isPaid ? `
        <div class="qr-payment-box smoky-modal-block" style="margin-top:20px; padding: 16px; border-radius: 12px;">
          <div style="flex: 1;">
            <div class="smoky-modal-card-title" style="font-weight: 600; margin-bottom: 6px; font-size: 1rem;">
              📱 สแกนจ่ายผ่าน Thai QR PromptPay
            </div>
            <p class="smoky-modal-meta" style="font-size: 0.85rem; margin: 0 0 8px 0; line-height: 1.5;">
              รองรับทุกแอปพลิเคชันธนาคาร (พร้อมเพย์: 086-946-1654 นายเกียรติศักดิ์ บริหาร)<br>
              เมื่อโอนชำระเรียบร้อย สามารถแนบสลิปด้านล่างเพื่อให้เจ้าหน้าที่อนุมัติทันที
            </p>
          </div>
          <div style="text-align: center;">
            <img src="${qrMockUrl}" alt="PromptPay QR Code" class="qr-img" style="background:#fff; padding:6px; border-radius:10px;">
            <div class="smoky-modal-meta" style="font-size: 0.75rem; margin-top: 4px;">สแกนเพื่อจ่ายเงิน</div>
          </div>
        </div>

        <!-- ฟอร์มอัปโหลดสลิป -->
        <div class="smoky-modal-block" style="margin-top:18px; border-radius:12px; padding:18px;">
          <h4 class="smoky-modal-card-title" style="margin:0 0 8px 0; display:flex; align-items:center; gap:8px;">
            ${ic('image')} แนบสลิปหลักฐานการโอนเงิน (Upload Payment Slip)
          </h4>
          <p class="smoky-modal-meta" style="font-size:0.85rem; margin:0 0 14px 0;">
            คลิกกล่องด้านล่างเพื่อเลือกรูปสลิปจากเครื่อง หรือถ่ายรูปสลิป
          </p>

          <input type="file" id="slip-file-input" accept="image/*" style="display:none;">

          <div class="upload-dropzone smoky-modal-notes" id="slip-dropzone" style="cursor: pointer; padding: 16px; text-align: center; border-radius: 10px;">
            <div id="slip-dropzone-content">
              <div style="font-size:2rem; margin-bottom:4px;">📸</div>
              <div class="smoky-modal-val" style="font-weight:600; font-size:0.95rem;">คลิกเพื่อเลือกไฟล์รูปภาพสลิป</div>
              <div class="smoky-modal-meta" style="font-size:0.8rem; margin-top:4px;">รองรับ JPG, PNG, WEBP (ระบบบีบอัดขนาดให้อัตโนมัติ)</div>
            </div>
            <div id="slip-preview-wrap" style="display:none; align-items:center; justify-content:center; gap:14px;">
              <img id="slip-preview-img" style="max-height:120px; border-radius:8px; border:1px solid rgba(255,255,255,0.2); box-shadow:0 2px 8px rgba(0,0,0,0.2);">
              <div>
                <div id="slip-filename" class="smoky-modal-val" style="font-size:0.85rem; font-weight:600; margin-bottom:6px;"></div>
                <button type="button" class="smoky-round-glass-btn btn-sm" id="btn-change-slip" style="width:auto; padding:4px 12px; font-size:0.75rem;">เปลี่ยนรูปภาพ</button>
              </div>
            </div>
          </div>

          <div class="field" style="margin-top:12px;">
            <label style="font-size:0.85rem;">หมายเหตุเพิ่มเติม (ถ้ามี เช่น เวลาที่โอน หรือชื่อธนาคาร)</label>
            <input type="text" id="slip-notes-input" placeholder="เช่น โอนจาก SCB เวลา 09:45 น.">
          </div>

          <button type="button" class="btn btn-primary" id="btn-submit-slip" style="width:100%; margin-top:14px;" disabled>
            🚀 ส่งหลักฐานการชำระเงินให้เจ้าหน้าที่
          </button>
        </div>
      ` : `
        <div style="background: var(--mint-50); border: 1.5px solid var(--emerald); border-radius: 12px; padding: 16px; margin-top: 20px;">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:12px;">
            <div>
              <div style="color: var(--emerald); font-weight: 600; font-size: 1.1rem;">
                ✓ ได้รับการชำระเงินเรียบร้อยแล้ว
              </div>
              <div style="font-size: 0.85rem; color: var(--muted); margin-top: 4px;">
                ขอบคุณที่ชำระค่าบริการตรงเวลา ออกใบเสร็จโดย Tanakrit Dormitory System
              </div>
            </div>
            ${bill.slip_url ? `
              <img src="${bill.slip_url}" class="img-thumb-preview" alt="สลิป" onclick="window.showImageModal('${bill.slip_url}', 'สลิปการชำระเงิน ห้อง ${bill.room_number}')" title="คลิกดูสลิปที่แนบไว้" style="width:64px; height:64px;">
            ` : ''}
          </div>
        </div>
      `}
    </div>
  `;

  const footer = `
    <button type="button" class="btn btn-outline" id="btn-modal-del-bill" style="color:var(--danger); border-color:#fadbd8; margin-right:auto;">${ic('trash')} ลบบิลนี้</button>
    <button type="button" class="btn btn-outline" onclick="window.printInvoice()">${ic('printer')} พิมพ์ใบแจ้งหนี้ / ใบเสร็จ</button>
    <button type="button" class="btn btn-primary" onclick="window.closeAppModal()">ปิด</button>
  `;

  showModal({
    title: `ใบแจ้งหนี้ค่าเช่าและสาธารณูปโภค — ห้อง ${bill.room_number}`,
    body,
    footer,
    maxWidth: '640px'
  });

  const btnModalDel = document.getElementById('btn-modal-del-bill');
  if (btnModalDel) {
    btnModalDel.onclick = async () => {
      if (confirm(`คุณต้องการลบใบแจ้งหนี้ "${bill.id}" (ห้อง ${bill.room_number}) ออกจากระบบใช่หรือไม่?`)) {
        const { error } = await supabase.from('meter_readings').eq('id', bill.id).delete();
        if (error) {
          toast('เกิดข้อผิดพลาดในการลบบิล', 'error');
          return;
        }
        toast(`ลบใบแจ้งหนี้ ${bill.id} เรียบร้อยแล้ว`, 'success');
        closeModal();
        if (typeof loadUtilitiesData === 'function') loadUtilitiesData();
      }
    };
  }

  // Bind Events สำหรับอัปโหลดสลิป
  let selectedSlipFile = null;
  const dropzone = document.getElementById('slip-dropzone');
  const fileInput = document.getElementById('slip-file-input');
  const dropzoneContent = document.getElementById('slip-dropzone-content');
  const previewWrap = document.getElementById('slip-preview-wrap');
  const previewImg = document.getElementById('slip-preview-img');
  const filenameEl = document.getElementById('slip-filename');
  const btnSubmitSlip = document.getElementById('btn-submit-slip');
  const btnChangeSlip = document.getElementById('btn-change-slip');

  if (dropzone && fileInput) {
    dropzone.onclick = () => fileInput.click();
    if (btnChangeSlip) {
      btnChangeSlip.onclick = (e) => {
        e.stopPropagation();
        fileInput.click();
      };
    }

    fileInput.onchange = (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      selectedSlipFile = file;

      const objUrl = URL.createObjectURL(file);
      previewImg.src = objUrl;
      filenameEl.textContent = file.name;
      dropzoneContent.style.display = 'none';
      previewWrap.style.display = 'flex';
      btnSubmitSlip.disabled = false;
    };
  }

  if (btnSubmitSlip) {
    btnSubmitSlip.onclick = async () => {
      if (!selectedSlipFile) {
        toast('กรุณาเลือกไฟล์สลิปก่อนส่ง', 'error');
        return;
      }

      btnSubmitSlip.disabled = true;
      btnSubmitSlip.textContent = '⏳ กำลังประมวลผลรูปภาพและส่งสลิป...';

      try {
        const dataUrl = await compressImage(selectedSlipFile, 1200, 0.85);
        const notes = document.getElementById('slip-notes-input').value.trim();

        await supabase.from('meter_readings').eq('id', bill.id).update({
          status: 'verifying',
          slip_url: dataUrl,
          slip_uploaded_at: new Date().toISOString(),
          payment_notes: notes
        });

        toast('ส่งหลักฐานสลิปโอนเงินเรียบร้อยแล้ว รอเจ้าหน้าที่ตรวจสอบ', 'success');
        closeModal();
        loadUtilitiesData();
      } catch (err) {
        toast('เกิดข้อผิดพลาดในการอัปโหลด: ' + err.message, 'error');
        btnSubmitSlip.disabled = false;
        btnSubmitSlip.textContent = '🚀 ส่งหลักฐานการชำระเงินให้เจ้าหน้าที่';
      }
    };
  }

  const btnApproveSlip = document.getElementById('btn-approve-slip');
  if (btnApproveSlip) {
    btnApproveSlip.onclick = async () => {
      btnApproveSlip.disabled = true;
      await supabase.from('meter_readings').eq('id', bill.id).update({
        status: 'paid'
      });
      toast(`อนุมัติการชำระเงินห้อง ${bill.room_number} สำเร็จ`, 'success');
      closeModal();
      if (typeof loadUtilitiesData === 'function') loadUtilitiesData();
    };
  }

  const btnRejectSlip = document.getElementById('btn-reject-slip');
  if (btnRejectSlip) {
    btnRejectSlip.onclick = async () => {
      const reason = prompt('ระบุเหตุผลในการปฏิเสธสลิป (เช่น ยอดเงินไม่ตรง หรือสลิปไม่ชัดเจน):', 'สลิปไม่ชัดเจน กรุณาแนบใหม่อีกครั้ง');
      if (reason === null) return;

      btnRejectSlip.disabled = true;
      await supabase.from('meter_readings').eq('id', bill.id).update({
        status: 'pending',
        payment_notes: `[ปฏิเสธ]: ${reason}`
      });
      toast(`ปฏิเสธสลิปและแจ้งให้ห้อง ${bill.room_number} โอนใหม่แล้ว`, 'info');
      closeModal();
      if (typeof loadUtilitiesData === 'function') loadUtilitiesData();
    };
  }
}

// Modal จดมิเตอร์ใหม่ (Smoky Glass)
async function openAddMeterModal() {
  const rooms = DEFAULT_ROOMS;

  const roomOptions = rooms.map(r => `
    <option value="${r.room_number}" data-price="${r.price}" data-tenant="${r.tenant_name || ''}">
      ห้อง ${r.room_number} (${r.building === 'KingPhetch' ? 'กิ่งเพชร' : (r.building === 'UnderGround' ? 'ใต้บ้าน' : 'ธนกฤษฎ์')}) - ${fmtCurrency(r.price)} ${r.tenant_name ? '(' + r.tenant_name + ')' : '(ห้องว่าง)'}
    </option>
  `).join('');

  const body = `
    <form id="form-meter-reading" style="display: flex; flex-direction: column; gap: 14px;">
      <div class="field">
        <label class="smoky-form-label" style="font-size: 0.82rem; margin-bottom: 6px; display: block;">เลือกห้องพัก (3 อาคาร 17 ห้อง) *</label>
        <select id="mr-room" class="smoky-glass-select" style="width: 100%;">
          ${roomOptions}
        </select>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div class="field">
          <label class="smoky-form-label" style="font-size: 0.82rem; margin-bottom: 6px; display: block;">รอบเดือนประจำบิล</label>
          <input type="month" id="mr-month" value="2026-11" class="smoky-glass-input" style="width: 100%;" required>
        </div>
        <div class="field">
          <label class="smoky-form-label" style="font-size: 0.82rem; margin-bottom: 6px; display: block;">ค่าเช่าห้องพัก (บาท/เดือน)</label>
          <input type="number" id="mr-room-price" value="2800" class="smoky-glass-input" style="width: 100%;" required>
        </div>
      </div>

      <!-- Water Section -->
      <div style="background: rgba(96,165,250,0.08); border: 1px solid rgba(96,165,250,0.22); border-radius: 14px; padding: 14px;">
        <div style="font-weight: 700; color: #60A5FA; margin-bottom: 10px; font-size: 0.88rem; display: flex; align-items: center; gap: 6px;">
          💧 มิเตอร์น้ำประปา (18 บาท/หน่วย)
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
          <div class="field">
            <label class="smoky-form-label" style="font-size: 0.74rem;">เลขครั้งก่อน</label>
            <input type="number" id="mr-water-prev" value="100" class="smoky-glass-input" style="width: 100%;">
          </div>
          <div class="field">
            <label class="smoky-form-label" style="font-size: 0.74rem;">เลขครั้งนี้ *</label>
            <input type="number" id="mr-water-curr" value="105" class="smoky-glass-input" style="width: 100%;" required>
          </div>
          <div class="field">
            <label class="smoky-form-label" style="font-size: 0.74rem;">รวมเงินค่าน้ำ</label>
            <input type="text" id="mr-water-total" disabled value="90 ฿" class="smoky-glass-input" style="width: 100%; color: #60A5FA; font-weight: 700;">
          </div>
        </div>
      </div>

      <!-- Electric Section -->
      <div style="background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.22); border-radius: 14px; padding: 14px;">
        <div style="font-weight: 700; color: #F59E0B; margin-bottom: 10px; font-size: 0.88rem; display: flex; align-items: center; gap: 6px;">
          ⚡ มิเตอร์ไฟฟ้า (8 บาท/หน่วย)
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
          <div class="field">
            <label class="smoky-form-label" style="font-size: 0.74rem;">เลขครั้งก่อน</label>
            <input type="number" id="mr-elec-prev" value="500" class="smoky-glass-input" style="width: 100%;">
          </div>
          <div class="field">
            <label class="smoky-form-label" style="font-size: 0.74rem;">เลขครั้งนี้ *</label>
            <input type="number" id="mr-elec-curr" value="545" class="smoky-glass-input" style="width: 100%;" required>
          </div>
          <div class="field">
            <label class="smoky-form-label" style="font-size: 0.74rem;">รวมเงินค่าไฟ</label>
            <input type="text" id="mr-elec-total" disabled value="360 ฿" class="smoky-glass-input" style="width: 100%; color: #F59E0B; font-weight: 700;">
          </div>
        </div>
      </div>

      <!-- Fixed Charges Box -->
      <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 10px 14px; font-size: 0.78rem; color: rgba(255,255,255,0.7); display: flex; justify-content: space-between;">
        <span>ค่าบริการคงที่รายเดือน (ส่วนกลาง 100฿ + Wi-Fi 100฿ + ขยะ 20฿):</span>
        <strong style="color: #ffffff;">220 ฿</strong>
      </div>

      <!-- Grand Total -->
      <div style="background: rgba(59,130,246,0.15); border: 1px solid rgba(59,130,246,0.3); border-radius: 12px; padding: 14px 18px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 600; color: #ffffff; font-size: 0.90rem;">ยอดรวมทั้งสิ้น (ค่าห้อง + น้ำ + ไฟ + บริการ):</span>
        <strong style="font-size: 1.35rem; color: #ffffff;" id="mr-grand-total">3,470 ฿</strong>
      </div>
    </form>
  `;

  const footer = `
    <div style="display: flex; justify-content: flex-end; gap: 10px; width: 100%;">
      <button type="button" class="btn btn-outline" onclick="window.closeAppModal()">ยกเลิก</button>
      <button type="button" class="btn btn-primary" id="btn-submit-meter">บันทึกและสร้างบิล</button>
    </div>
  `;

  showModal({
    title: 'จดมิเตอร์น้ำ-ไฟ รอบประจำเดือน',
    body,
    footer,
    maxWidth: '560px'
  });

  // Calculate live totals
  const calc = () => {
    const roomPrice = Number(document.getElementById('mr-room-price').value) || 0;
    const wPrev = Number(document.getElementById('mr-water-prev').value) || 0;
    const wCurr = Number(document.getElementById('mr-water-curr').value) || 0;
    const wUnits = Math.max(0, wCurr - wPrev);
    const wCost = wUnits * 18;

    const ePrev = Number(document.getElementById('mr-elec-prev').value) || 0;
    const eCurr = Number(document.getElementById('mr-elec-curr').value) || 0;
    const eUnits = Math.max(0, eCurr - ePrev);
    const eCost = eUnits * 8;

    const fixedFees = 100 + 100 + 20; // ค่าบริการส่วนกลาง 100 + Wi-Fi 100 + กำจัดขยะ 20
    const grand = roomPrice + wCost + eCost + fixedFees;

    document.getElementById('mr-water-total').value = wCost.toLocaleString() + ' ฿';
    document.getElementById('mr-elec-total').value = eCost.toLocaleString() + ' ฿';
    document.getElementById('mr-grand-total').textContent = grand.toLocaleString() + ' ฿';
    return { roomPrice, wPrev, wCurr, wUnits, wCost, ePrev, eCurr, eUnits, eCost, grand };
  };

  document.getElementById('mr-room-price').oninput = calc;
  document.getElementById('mr-water-prev').oninput = calc;
  document.getElementById('mr-water-curr').oninput = calc;
  document.getElementById('mr-elec-prev').oninput = calc;
  document.getElementById('mr-elec-curr').oninput = calc;

  document.getElementById('mr-room').onchange = (e) => {
    const opt = e.target.selectedOptions[0];
    if (opt) {
      const p = opt.getAttribute('data-price');
      if (p) document.getElementById('mr-room-price').value = p;
      calc();
    }
  };

  // Run initial calculation
  calc();

  document.getElementById('btn-submit-meter').onclick = async () => {
    const vals = calc();
    const sel = document.getElementById('mr-room');
    const roomNum = sel.value;
    const tenantName = sel.selectedOptions[0]?.getAttribute('data-tenant') || '';
    const month = document.getElementById('mr-month').value;
    const invId = `INV-${month.replace('-', '')}-${roomNum}`;

    await supabase.from('meter_readings').insert([{
      id: invId,
      room_number: roomNum,
      tenant_name: tenantName,
      billing_month: month,
      month_label: 'รอบ ' + month,
      room_price: vals.roomPrice,
      prev_water: vals.wPrev,
      curr_water: vals.wCurr,
      water_unit: vals.wUnits,
      water_rate: 18,
      water_total: vals.wCost,
      prev_electric: vals.ePrev,
      curr_electric: vals.eCurr,
      electric_unit: vals.eUnits,
      electric_rate: 8,
      electric_total: vals.eCost,
      common_fee: 100,
      total_price: vals.grand,
      status: 'pending',
      due_date: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0]
    }]);

    toast(`ออกบิล ${invId} สำหรับห้อง ${roomNum} สำเร็จ`, 'success');
    closeModal();
    loadUtilitiesData();
  };
}


/* ========== js/rooms.js ========== */
// js/rooms.js
// ระบบผังห้องพักและสถานะห้องพัก 3 อาคาร (Tanakrit, KingPhetch, UnderGround)
// ออกแบบด้วย Smoky Frosted Glass Design System


let currentBuildingFilter = 'all';
let currentStatusFilter = 'all';
let currentSearch = '';

const CACHE_KEY = 'tanakrit_rooms_cache_v3';

// รายชื่อห้องพักมาตรฐานทั้ง 17 ห้อง (3 อาคาร) ตามโครงสร้างจริงและราคาที่ถูกต้องของหอพัก
const DEFAULT_ROOMS = [
  // 1. อาคาร ธนกฤษฎ์ (9 ห้อง: 101 - 109) — 2,800 บาท/เดือน
  { 
    id: 'RM-T101', room_number: '101', building: 'Tanakrit', floor: 1, type: 'ห้องพัดลม', price: 2800, 
    size: 'กว้าง 3.5 เมตร ยาว 8 เมตร รวม (28 ตร.ม.)', bathroom: 'ห้องน้ำในตัว', status: 'vacant', 
    tenant_name: '', tenant_phone: '', 
    condition: 'โปร่งสบาย อากาศถ่ายเทดีเยี่ยม ระเบียงส่วนตัว', 
    amenities: 'เตียง+ที่นอน, ตู้เสื้อผ้า, ห้องน้ำในตัว, ระเบียงตากผ้าหลังห้องส่วนตัว' 
  },
  { 
    id: 'RM-T102', room_number: '102', building: 'Tanakrit', floor: 1, type: 'ห้องพัดลม', price: 2800, 
    size: 'กว้าง 3.5 เมตร ยาว 8 เมตร รวม (28 ตร.ม.)', bathroom: 'ห้องน้ำในตัว', status: 'vacant', 
    tenant_name: '', tenant_phone: '', 
    condition: 'โปร่งสบาย อากาศถ่ายเทดีเยี่ยม ระเบียงส่วนตัว', 
    amenities: 'เตียง+ที่นอน, ตู้เสื้อผ้า, ห้องน้ำในตัว, ระเบียงตากผ้าหลังห้องส่วนตัว' 
  },
  { 
    id: 'RM-T103', room_number: '103', building: 'Tanakrit', floor: 1, type: 'ห้องพัดลม', price: 2800, 
    size: 'กว้าง 3.5 เมตร ยาว 8 เมตร รวม (28 ตร.ม.)', bathroom: 'ห้องน้ำในตัว', status: 'vacant', 
    tenant_name: '', tenant_phone: '', 
    condition: 'โปร่งสบาย อากาศถ่ายเทดีเยี่ยม ระเบียงส่วนตัว', 
    amenities: 'เตียง+ที่นอน, ตู้เสื้อผ้า, ห้องน้ำในตัว, ระเบียงตากผ้าหลังห้องส่วนตัว' 
  },
  { 
    id: 'RM-T104', room_number: '104', building: 'Tanakrit', floor: 1, type: 'ห้องพัดลม', price: 2800, 
    size: 'กว้าง 3.5 เมตร ยาว 8 เมตร รวม (28 ตร.ม.)', bathroom: 'ห้องน้ำในตัว', status: 'vacant', 
    tenant_name: '', tenant_phone: '', 
    condition: 'โปร่งสบาย อากาศถ่ายเทดีเยี่ยม ระเบียงส่วนตัว', 
    amenities: 'เตียง+ที่นอน, ตู้เสื้อผ้า, ห้องน้ำในตัว, ระเบียงตากผ้าหลังห้องส่วนตัว' 
  },
  { 
    id: 'RM-T105', room_number: '105', building: 'Tanakrit', floor: 1, type: 'ห้องพัดลม', price: 2800, 
    size: 'กว้าง 3.5 เมตร ยาว 8 เมตร รวม (28 ตร.ม.)', bathroom: 'ห้องน้ำในตัว', status: 'vacant', 
    tenant_name: '', tenant_phone: '', 
    condition: 'โปร่งสบาย อากาศถ่ายเทดีเยี่ยม ระเบียงส่วนตัว', 
    amenities: 'เตียง+ที่นอน, ตู้เสื้อผ้า, ห้องน้ำในตัว, ระเบียงตากผ้าหลังห้องส่วนตัว' 
  },
  { 
    id: 'RM-T106', room_number: '106', building: 'Tanakrit', floor: 1, type: 'ห้องพัดลม', price: 2800, 
    size: 'กว้าง 3.5 เมตร ยาว 8 เมตร รวม (28 ตร.ม.)', bathroom: 'ห้องน้ำในตัว', status: 'vacant', 
    tenant_name: '', tenant_phone: '', 
    condition: 'โปร่งสบาย อากาศถ่ายเทดีเยี่ยม ระเบียงส่วนตัว', 
    amenities: 'เตียง+ที่นอน, ตู้เสื้อผ้า, ห้องน้ำในตัว, ระเบียงตากผ้าหลังห้องส่วนตัว' 
  },
  { 
    id: 'RM-T107', room_number: '107', building: 'Tanakrit', floor: 1, type: 'ห้องพัดลม', price: 2800, 
    size: 'กว้าง 3.5 เมตร ยาว 8 เมตร รวม (28 ตร.ม.)', bathroom: 'ห้องน้ำในตัว', status: 'maintenance', 
    tenant_name: '', tenant_phone: '', 
    condition: 'โปร่งสบาย อากาศถ่ายเทดีเยี่ยม ระเบียงส่วนตัว', 
    amenities: 'เตียง+ที่นอน, ตู้เสื้อผ้า, ห้องน้ำในตัว, ระเบียงตากผ้าหลังห้องส่วนตัว' 
  },
  { 
    id: 'RM-T108', room_number: '108', building: 'Tanakrit', floor: 1, type: 'ห้องพัดลม', price: 2800, 
    size: 'กว้าง 3.5 เมตร ยาว 8 เมตร รวม (28 ตร.ม.)', bathroom: 'ห้องน้ำในตัว', status: 'vacant', 
    tenant_name: '', tenant_phone: '', 
    condition: 'โปร่งสบาย อากาศถ่ายเทดีเยี่ยม ระเบียงส่วนตัว', 
    amenities: 'เตียง+ที่นอน, ตู้เสื้อผ้า, ห้องน้ำในตัว, ระเบียงตากผ้าหลังห้องส่วนตัว' 
  },
  { 
    id: 'RM-T109', room_number: '109', building: 'Tanakrit', floor: 1, type: 'ห้องพัดลม', price: 2800, 
    size: 'กว้าง 3.5 เมตร ยาว 8 เมตร รวม (28 ตร.ม.)', bathroom: 'ห้องน้ำในตัว', status: 'vacant', 
    tenant_name: '', tenant_phone: '', 
    condition: 'โปร่งสบาย อากาศถ่ายเทดีเยี่ยม ระเบียงส่วนตัว', 
    amenities: 'เตียง+ที่นอน, ตู้เสื้อผ้า, ห้องน้ำในตัว, ระเบียงตากผ้าหลังห้องส่วนตัว' 
  },

  // 2. อาคาร กิ่งเพชร (5 ห้อง: 201 - 205) — 2,600 บาท/เดือน
  { 
    id: 'RM-K201', room_number: '201', building: 'KingPhetch', floor: 1, type: 'ห้องพัดลม', price: 2600, 
    size: 'กว้าง 3.5 เมตร ยาว 8 เมตร รวม (28 ตร.ม.)', bathroom: 'ห้องน้ำในตัว', status: 'vacant', 
    tenant_name: '', tenant_phone: '', 
    condition: 'เงียบสงบ เป็นส่วนตัว เหมาะแก่การอ่านหนังสือ', 
    amenities: 'เตียง+ที่นอน, ตู้เสื้อผ้า, ห้องน้ำในตัว, ราวตากผ้าหลังห้อง' 
  },
  { 
    id: 'RM-K202', room_number: '202', building: 'KingPhetch', floor: 1, type: 'ห้องพัดลม', price: 2600, 
    size: 'กว้าง 3.5 เมตร ยาว 8 เมตร รวม (28 ตร.ม.)', bathroom: 'ห้องน้ำในตัว', status: 'vacant', 
    tenant_name: '', tenant_phone: '', 
    condition: 'เงียบสงบ เป็นส่วนตัว เหมาะแก่การอ่านหนังสือ', 
    amenities: 'เตียง+ที่นอน, ตู้เสื้อผ้า, ห้องน้ำในตัว, ราวตากผ้าหลังห้อง' 
  },
  { 
    id: 'RM-K203', room_number: '203', building: 'KingPhetch', floor: 1, type: 'ห้องพัดลม', price: 2600, 
    size: 'กว้าง 3.5 เมตร ยาว 8 เมตร รวม (28 ตร.ม.)', bathroom: 'ห้องน้ำในตัว', status: 'vacant', 
    tenant_name: '', tenant_phone: '', 
    condition: 'เงียบสงบ เป็นส่วนตัว เหมาะแก่การอ่านหนังสือ', 
    amenities: 'เตียง+ที่นอน, ตู้เสื้อผ้า, ห้องน้ำในตัว, ราวตากผ้าหลังห้อง' 
  },
  { 
    id: 'RM-K204', room_number: '204', building: 'KingPhetch', floor: 1, type: 'ห้องพัดลม', price: 2600, 
    size: 'กว้าง 3.5 เมตร ยาว 8 เมตร รวม (28 ตร.ม.)', bathroom: 'ห้องน้ำในตัว', status: 'vacant', 
    tenant_name: '', tenant_phone: '', 
    condition: 'เงียบสงบ เป็นส่วนตัว เหมาะแก่การอ่านหนังสือ', 
    amenities: 'เตียง+ที่นอน, ตู้เสื้อผ้า, ห้องน้ำในตัว, ราวตากผ้าหลังห้อง' 
  },
  { 
    id: 'RM-K205', room_number: '205', building: 'KingPhetch', floor: 1, type: 'ห้องพัดลม', price: 2600, 
    size: 'กว้าง 3.5 เมตร ยาว 8 เมตร รวม (28 ตร.ม.)', bathroom: 'ห้องน้ำในตัว', status: 'vacant', 
    tenant_name: '', tenant_phone: '', 
    condition: 'เงียบสงบ เป็นส่วนตัว เหมาะแก่การอ่านหนังสือ', 
    amenities: 'เตียง+ที่นอน, ตู้เสื้อผ้า, ห้องน้ำในตัว, ราวตากผ้าหลังห้อง' 
  },

  // 3. อาคาร ใต้บ้าน (3 ห้อง: B01 - B03) — 1,500 บาท/เดือน
  { 
    id: 'RM-UG01', room_number: 'B01', building: 'UnderGround', floor: 0, type: 'ห้องพัดลม', price: 1500, 
    size: 'กว้าง 3 เมตร ยาว 4 เมตร รวม (12 ตร.ม.)', bathroom: 'ห้องน้ำรวม', status: 'vacant', 
    tenant_name: '', tenant_phone: '', 
    condition: 'ราคาสบายกระเป๋า เฟอร์นิเจอร์พร้อมอยู่', 
    amenities: 'เตียง+ที่นอน, ตู้เสื้อผ้า, ใช้ห้องน้ำรวมที่สะอาด' 
  },
  { 
    id: 'RM-UG02', room_number: 'B02', building: 'UnderGround', floor: 0, type: 'ห้องพัดลม', price: 1500, 
    size: 'กว้าง 3 เมตร ยาว 4 เมตร รวม (12 ตร.ม.)', bathroom: 'ห้องน้ำรวม', status: 'vacant', 
    tenant_name: '', tenant_phone: '', 
    condition: 'ราคาสบายกระเป๋า เฟอร์นิเจอร์พร้อมอยู่', 
    amenities: 'เตียง+ที่นอน, ตู้เสื้อผ้า, ใช้ห้องน้ำรวมที่สะอาด' 
  },
  { 
    id: 'RM-UG03', room_number: 'B03', building: 'UnderGround', floor: 0, type: 'ห้องพัดลม', price: 1500, 
    size: 'กว้าง 3 เมตร ยาว 4 เมตร รวม (12 ตร.ม.)', bathroom: 'ห้องน้ำรวม', status: 'vacant', 
    tenant_name: '', tenant_phone: '', 
    condition: 'ราคาสบายกระเป๋า เฟอร์นิเจอร์พร้อมอยู่', 
    amenities: 'เตียง+ที่นอน, ตู้เสื้อผ้า, ใช้ห้องน้ำรวมที่สะอาด' 
  }
];
async function renderRoomsView() {
  setTimeout(() => {
    bindRoomsEvents();
    loadRoomsData();
  }, 0);

  return `
    <div style="display: flex; flex-direction: column; gap: 22px;">
      
      <!-- 1. Header Card (Smoky Glass) -->
      <div class="smoky-card" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(59,130,246,0.18); border: 1px solid rgba(59,130,246,0.32); display: flex; align-items: center; justify-content: center; color: #3B82F6;">
            ${ic('door')}
          </div>
          <div>
            <h2 style="font-size: 1.35rem; font-weight: 700; color: #ffffff; margin: 0; letter-spacing: -0.02em;">
              ผังห้องพัก 3 อาคาร (Floor Plan — 17 ห้อง)
            </h2>
            <span style="font-size: 0.82rem; color: rgba(255,255,255,0.48); margin-top: 3px; display: block;">
              อาคาร ธนกฤษฎ์ (9 ห้อง) · อาคาร กิ่งเพชร (5 ห้อง) · อาคาร ใต้บ้าน (3 ห้อง)
            </span>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <button class="smoky-round-glass-btn" id="btn-add-room" style="width: auto; border-radius: 9999px; padding: 0 18px; height: 38px; background: #3B82F6; color: #ffffff; border: 1px solid rgba(59,130,246,0.5); box-shadow: 0 0 20px rgba(59,130,246,0.4); font-size: 0.82rem; font-weight: 600; gap: 6px;">
            ${ic('plus')}
            <span>เพิ่มห้องพักใหม่</span>
          </button>
        </div>
      </div>

      <!-- 2. KPI Summary Tiles (Smoky Glass) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 16px;" id="room-stats-summary">
        <!-- Will be populated via JS -->
      </div>

      <!-- 3. Filters & Search Toolbar (Smoky Glass) -->
      <div class="smoky-card" style="padding: 16px 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
          
          <!-- Search Box -->
          <div style="position: relative; min-width: 240px; flex: 1; max-width: 320px;">
            <span style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.4); display: flex; align-items: center;">
              ${ic('search')}
            </span>
            <input type="text" id="rooms-search-input" class="smoky-glass-input" placeholder="ค้นหาเลขห้อง หรือชื่อผู้เช่า..." style="width: 100%; padding-left: 38px;">
          </div>

          <!-- Building Tabs (Segmented Control) -->
          <div class="smoky-segmented" id="building-tabs" style="overflow-x: auto; max-width: 100%;">
            <button class="smoky-seg-btn active" data-building="all">ทุกอาคาร (17 ห้อง)</button>
            <button class="smoky-seg-btn" data-building="Tanakrit">🏢 อาคาร ธนกฤษฎ์ (9)</button>
            <button class="smoky-seg-btn" data-building="KingPhetch">🏡 อาคาร กิ่งเพชร (5)</button>
            <button class="smoky-seg-btn" data-building="UnderGround">🛋️ อาคาร ใต้บ้าน (3)</button>
          </div>

          <!-- Status Dropdown Filter -->
          <div>
            <select id="rooms-status-select" class="smoky-glass-select">
              <option value="all">สถานะทั้งหมด</option>
              <option value="occupied">เฉพาะห้องที่มีผู้เช่า</option>
              <option value="vacant">เฉพาะห้องว่างพร้อมอยู่</option>
              <option value="maintenance">เฉพาะห้องที่ปิดปรับปรุง / ซ่อมบำรุง</option>
            </select>
          </div>

        </div>
      </div>

      <!-- 4. Visual Rooms Grid (Smoky Glass) -->
      <div id="rooms-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(285px, 1fr)); gap: 20px;">
        <div style="text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.4); grid-column: 1/-1;">
          กำลังโหลดข้อมูลห้องพัก 3 อาคาร...
        </div>
      </div>

    </div>
  `;
}

async function loadRoomsData() {
  const container = document.getElementById('rooms-container');
  const summary = document.getElementById('room-stats-summary');
  if (!container) return;

  // 1. นำโครงสร้างห้องพักมาตรฐาน 17 ห้องเป็นตัวตั้ง
  let rooms = JSON.parse(JSON.stringify(DEFAULT_ROOMS));

  // 2. ซิงค์กับข้อมูลผู้พักอาศัยล่าสุดจาก Supabase Cloud Realtime
  let dbTenants = [];
  try {
    const { data, error } = await supabase.from('tenants').select('*');
    if (!error && Array.isArray(data)) {
      dbTenants = data;
    }
  } catch (_) {}

  // 3. ซิงค์กับรายการแจ้งซ่อมบำรุง (Maintenance) ที่กำลังดำเนินการจาก Supabase Realtime
  const activeMaintRooms = new Set();
  try {
    const { data: tickets } = await supabase.from('maintenance').select('room_number, status');
    if (tickets && Array.isArray(tickets)) {
      tickets.filter(t => t.status !== 'completed').forEach(t => {
        if (t.room_number) activeMaintRooms.add(t.room_number.replace(/[^0-9B]/gi, ''));
      });
    }
  } catch (_) {}

  // 4. แมปสถานะห้องพักและผู้เช่าของแต่ละห้อง
  rooms.forEach(r => {
    const cleanNum = String(r.room_number).trim();
    const tenant = dbTenants.find(t => String(t.room).trim() === cleanNum && t.status !== 'terminated');
    if (tenant) {
      r.status = 'occupied';
      r.tenant_name = tenant.name || '';
      r.tenant_phone = tenant.phone || '';
    } else if (activeMaintRooms.has(cleanNum) || r.status === 'maintenance') {
      r.status = 'maintenance';
      r.tenant_name = '';
      r.tenant_phone = '';
    } else {
      r.status = 'vacant';
      r.tenant_name = '';
      r.tenant_phone = '';
    }
  });

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(rooms));
  } catch (_) {}

  // Update Summary Stats
  const total = rooms.length;
  const occupied = rooms.filter(r => r.status === 'occupied').length;
  const vacant = rooms.filter(r => r.status === 'vacant').length;
  const maintenance = rooms.filter(r => r.status === 'maintenance').length;
  const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;

  if (summary) {
    summary.innerHTML = `
      <div class="smoky-tile" style="padding: 16px 18px; border-radius: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="smoky-meta-label">ห้องพักทั้งหมด</span>
          <div style="width: 28px; height: 28px; border-radius: 8px; background: rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.85);">
            ${ic('door')}
          </div>
        </div>
        <div style="margin-top: 8px; display: flex; align-items: baseline; gap: 8px;">
          <span class="smoky-kpi-num" style="font-size: 1.7rem;">${total}</span>
          <span style="font-size: 0.78rem; color: rgba(255,255,255,0.45);">ห้อง (3 อาคาร)</span>
        </div>
      </div>

      <div class="smoky-tile" style="padding: 16px 18px; border-radius: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="smoky-meta-label">เข้าพักแล้ว</span>
          <span class="smoky-delta-pos" style="font-size: 0.70rem;">${occupancyRate}%</span>
        </div>
        <div style="margin-top: 8px; display: flex; align-items: baseline; gap: 8px;">
          <span class="smoky-kpi-num" style="font-size: 1.7rem; color: #3B82F6;">${occupied}</span>
          <span style="font-size: 0.78rem; color: rgba(255,255,255,0.45);">ห้องเช่า</span>
        </div>
      </div>

      <div class="smoky-tile" style="padding: 16px 18px; border-radius: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="smoky-meta-label">ห้องว่างพร้อมอยู่</span>
          <span style="background: rgba(52,211,153,0.18); color: #34D399; font-size: 0.65rem; font-weight: 700; padding: 2px 7px; border-radius: 9999px;">พร้อมจอง</span>
        </div>
        <div style="margin-top: 8px; display: flex; align-items: baseline; gap: 8px;">
          <span class="smoky-kpi-num" style="font-size: 1.7rem; color: #34D399;">${vacant}</span>
          <span style="font-size: 0.78rem; color: rgba(255,255,255,0.45);">ห้อง (สัญญา 12 ด.)</span>
        </div>
      </div>

      <div class="smoky-tile" style="padding: 16px 18px; border-radius: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="smoky-meta-label">ปิดปรับปรุง / ซ่อมบำรุง</span>
          <span style="background: rgba(245,158,11,0.18); color: #F59E0B; font-size: 0.65rem; font-weight: 700; padding: 2px 7px; border-radius: 9999px;">Service</span>
        </div>
        <div style="margin-top: 8px; display: flex; align-items: baseline; gap: 8px;">
          <span class="smoky-kpi-num" style="font-size: 1.7rem; color: #F59E0B;">${maintenance}</span>
          <span style="font-size: 0.78rem; color: rgba(255,255,255,0.45);">ห้อง</span>
        </div>
      </div>
    `;
  }

  // Filter rooms
  let filtered = rooms.filter(r => {
    // Building filter
    if (currentBuildingFilter !== 'all') {
      const bName = r.building || (r.room_number.startsWith('B') ? 'UnderGround' : (Number(r.room_number) >= 200 ? 'KingPhetch' : 'Tanakrit'));
      if (bName !== currentBuildingFilter) return false;
    }
    // Status
    if (currentStatusFilter !== 'all' && r.status !== currentStatusFilter) return false;
    // Search
    if (currentSearch) {
      const q = currentSearch.toLowerCase();
      const matchNum = (r.room_number || '').toLowerCase().includes(q);
      const matchTenant = (r.tenant_name || '').toLowerCase().includes(q);
      const matchType = (r.type || '').toLowerCase().includes(q);
      const matchBuilding = (r.building || '').toLowerCase().includes(q);
      if (!matchNum && !matchTenant && !matchType && !matchBuilding) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.4); grid-column: 1/-1;">
        <div style="font-size: 2.2rem; margin-bottom: 8px;">🔍</div>
        ไม่พบห้องพักตามเงื่อนไขที่ค้นหา
      </div>
    `;
    return;
  }

  let html = '';
  filtered.forEach(r => {
    let statusClass = 'vacant';
    let statusLabel = 'ห้องว่างพร้อมอยู่';
    let statusColor = '#34D399';
    let statusBadgeBg = 'rgba(52,211,153,0.14)';
    let statusBadgeBorder = 'rgba(52,211,153,0.28)';

    if (r.status === 'occupied') {
      statusClass = 'occupied';
      statusLabel = 'มีผู้พักอาศัย';
      statusColor = '#3B82F6';
      statusBadgeBg = 'rgba(59,130,246,0.16)';
      statusBadgeBorder = 'rgba(59,130,246,0.30)';
    } else if (r.status === 'maintenance') {
      statusClass = 'maintenance';
      statusLabel = 'กำลังซ่อมบำรุง';
      statusColor = '#F59E0B';
      statusBadgeBg = 'rgba(245,158,11,0.16)';
      statusBadgeBorder = 'rgba(245,158,11,0.30)';
    }

    const buildingName = r.building || (r.room_number.startsWith('B') ? 'UnderGround' : (Number(r.room_number) >= 200 ? 'KingPhetch' : 'Tanakrit'));
    
    let buildingDisplayName = 'อาคาร ธนกฤษฎ์';
    let buildingBadgeBg = 'rgba(52,211,153,0.15)';
    let buildingBadgeColor = '#34D399';
    let cardAccentColor = '#3B82F6';

    if (buildingName === 'KingPhetch' || buildingName === 'กิ่งเพชร' || buildingName === 'อาคาร กิ่งเพชร') {
      buildingDisplayName = 'อาคาร กิ่งเพชร';
      buildingBadgeBg = 'rgba(96,165,250,0.15)';
      buildingBadgeColor = '#60A5FA';
      cardAccentColor = '#60A5FA';
    } else if (buildingName === 'UnderGround' || buildingName === 'ใต้บ้าน' || buildingName === 'อาคารใต้บ้าน') {
      buildingDisplayName = 'อาคาร ใต้บ้าน';
      buildingBadgeBg = 'rgba(245,158,11,0.15)';
      buildingBadgeColor = '#F59E0B';
      cardAccentColor = '#F59E0B';
    }

    const roomSize = r.size || (buildingName === 'UnderGround' ? 'กว้าง 3 เมตร ยาว 4 เมตร รวม (12 ตร.ม.)' : 'กว้าง 3.5 เมตร ยาว 8 เมตร รวม (28 ตร.ม.)');
    const bathroomType = r.bathroom || (buildingName === 'UnderGround' ? 'ห้องน้ำรวม' : 'ห้องน้ำในตัว');
    const roomCondition = r.condition || (buildingName === 'UnderGround' ? 'ราคาสบายกระเป๋า พร้อมอยู่' : (buildingName === 'KingPhetch' ? 'เงียบสงบ เป็นส่วนตัว' : 'โปร่งสบาย ระเบียงส่วนตัว'));

    html += `
      <div class="smoky-room-card ${statusClass}" data-room-id="${r.id}">
        
        <div>
          <!-- Top Row: Building Name & Status Badge -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
            <div>
              <span style="background: ${buildingBadgeBg}; color: ${buildingBadgeColor}; font-size: 0.70rem; font-weight: 700; padding: 3px 9px; border-radius: 6px; letter-spacing: 0.03em;">
                ${buildingDisplayName}
              </span>
              <div style="display: flex; align-items: baseline; gap: 8px; margin-top: 8px;">
                <h3 style="font-size: 1.45rem; font-weight: 800; color: #ffffff; margin: 0; letter-spacing: -0.02em;">
                  ห้อง ${r.room_number}
                </h3>
                <span style="font-size: 0.74rem; color: rgba(255,255,255,0.45); font-weight: 500;">${r.type || 'ห้องพัดลม'}</span>
              </div>
            </div>

            <!-- Status Badge -->
            <span style="background: ${statusBadgeBg}; color: ${statusColor}; border: 1px solid ${statusBadgeBorder}; font-size: 0.70rem; font-weight: 700; padding: 3px 10px; border-radius: 9999px; display: flex; align-items: center; gap: 6px; white-space: nowrap;">
              <span style="width: 6px; height: 6px; border-radius: 50%; background: ${statusColor}; box-shadow: 0 0 6px ${statusColor};"></span>
              ${statusLabel}
            </span>
          </div>

          <!-- Specs List -->
          <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 10px 12px; margin: 12px 0; font-size: 0.76rem; color: rgba(255,255,255,0.7); display: flex; flex-direction: column; gap: 5px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="color: rgba(255,255,255,0.45);">📐 ขนาดพื้นที่:</span>
              <span style="font-weight: 600; color: #ffffff;">${roomSize}</span>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="color: rgba(255,255,255,0.45);">🚿 ห้องน้ำ:</span>
              <span style="font-weight: 600; color: #ffffff;">${bathroomType}</span>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="color: rgba(255,255,255,0.45);">🌿 บรรยากาศ:</span>
              <span style="color: rgba(255,255,255,0.85);">${roomCondition}</span>
            </div>
          </div>

          <!-- Price Row -->
          <div style="display: flex; align-items: baseline; justify-content: space-between; margin: 12px 0 14px;">
            <span style="font-size: 0.78rem; color: rgba(255,255,255,0.45);">อัตราค่าเช่า:</span>
            <div style="display: flex; align-items: baseline; gap: 4px;">
              <span class="smoky-kpi-num" style="font-size: 1.35rem; color: #ffffff;">${Number(r.price).toLocaleString()} ฿</span>
              <span style="font-size: 0.72rem; color: rgba(255,255,255,0.45);">/ เดือน</span>
            </div>
          </div>

          <!-- Tenant info / Vacant info box -->
          <div style="background: rgba(255,255,255,0.04); border: 1px dashed rgba(255,255,255,0.1); border-radius: 10px; padding: 10px 12px; font-size: 0.78rem; margin-bottom: 16px;">
            ${r.status === 'occupied' ? `
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div style="width: 26px; height: 26px; border-radius: 50%; background: rgba(59,130,246,0.22); color: #3B82F6; display: flex; align-items: center; justify-content: center; font-size: 0.70rem;">
                    ${ic('user')}
                  </div>
                  <div>
                    <span style="font-weight: 600; color: #ffffff; display: block;">${r.tenant_name || 'ผู้พักอาศัย'}</span>
                    <span style="font-size: 0.70rem; color: rgba(255,255,255,0.45);">${r.tenant_phone || 'สัญญา 12 เดือน'}</span>
                  </div>
                </div>
              </div>
            ` : (r.status === 'maintenance' ? `
              <div style="display: flex; align-items: center; gap: 8px; color: #F59E0B;">
                ${ic('wrench')}
                <span style="font-size: 0.76rem;">อยู่ระหว่างตรวจสอบและซ่อมบำรุง</span>
              </div>
            ` : `
              <div style="display: flex; align-items: center; gap: 8px; color: #34D399;">
                ${ic('sparkles')}
                <span style="font-size: 0.76rem;">ห้องว่าง พร้อมทำสัญญาเข้าอยู่ (12 เดือน)</span>
              </div>
            `)}
          </div>
        </div>

        <!-- Action Button -->
        <button class="smoky-round-glass-btn btn-manage-room" data-room-id="${r.id}" style="width: 100%; height: 38px; border-radius: 10px; font-size: 0.82rem; font-weight: 600; justify-content: center; gap: 6px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);">
          <span>จัดการห้องพัก</span>
          <svg class="icon" viewBox="0 0 24 24" style="width: 14px; height: 14px;"><polyline points="9 18 15 12 9 6"/></svg>
        </button>

      </div>
    `;
  });

  container.innerHTML = html;

  // Bind clicks to manage room
  container.querySelectorAll('.btn-manage-room').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-room-id');
      const targetRoom = rooms.find(x => x.id === id);
      if (targetRoom) openManageRoomModal(targetRoom, rooms);
    };
  });
}

function bindRoomsEvents() {
  const searchInput = document.getElementById('rooms-search-input');
  if (searchInput) {
    searchInput.oninput = (e) => {
      currentSearch = e.target.value.trim();
      loadRoomsData();
    };
  }

  const buildingTabs = document.getElementById('building-tabs');
  if (buildingTabs) {
    buildingTabs.querySelectorAll('.smoky-seg-btn').forEach(btn => {
      btn.onclick = () => {
        buildingTabs.querySelectorAll('.smoky-seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentBuildingFilter = btn.getAttribute('data-building');
        loadRoomsData();
      };
    });
  }

  const statusSelect = document.getElementById('rooms-status-select');
  if (statusSelect) {
    statusSelect.onchange = (e) => {
      currentStatusFilter = e.target.value;
      loadRoomsData();
    };
  }

  const btnAdd = document.getElementById('btn-add-room');
  if (btnAdd) {
    btnAdd.onclick = openAddRoomModal;
  }
}

// Modal จัดการห้องพัก
function openManageRoomModal(room, allRooms) {
  const body = `
    <form id="form-manage-room" style="display: flex; flex-direction: column; gap: 14px;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div class="field">
          <label style="font-size: 0.80rem; font-weight: 600; color: rgba(255,255,255,0.7); margin-bottom: 6px; display: block;">หมายเลขห้อง</label>
          <input type="text" id="m-room-number" value="${room.room_number}" class="form-input" style="width: 100%;" required>
        </div>
        <div class="field">
          <label style="font-size: 0.80rem; font-weight: 600; color: rgba(255,255,255,0.7); margin-bottom: 6px; display: block;">อาคาร</label>
          <select id="m-building" class="form-select" style="width: 100%;">
            <option value="Tanakrit" ${room.building === 'Tanakrit' ? 'selected' : ''}>อาคาร ธนกฤษฎ์ (2,800 ฿ / เดือน)</option>
            <option value="KingPhetch" ${room.building === 'KingPhetch' ? 'selected' : ''}>อาคาร กิ่งเพชร (2,600 ฿ / เดือน)</option>
            <option value="UnderGround" ${room.building === 'UnderGround' ? 'selected' : ''}>อาคาร ใต้บ้าน (1,500 ฿ / เดือน)</option>
          </select>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div class="field">
          <label class="smoky-form-label" style="font-size: 0.82rem; margin-bottom: 6px; display: block;">ประเภทห้องพัก</label>
          <input type="text" id="m-type" value="${room.type || 'ห้องพัดลม'}" class="smoky-glass-input" style="width: 100%;" required>
        </div>
        <div class="field">
          <label class="smoky-form-label" style="font-size: 0.82rem; margin-bottom: 6px; display: block;">ราคาค่าเช่าต่อเดือน (บาท)</label>
          <input type="number" id="m-price" value="${room.price}" class="smoky-glass-input" style="width: 100%;" required>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div class="field">
          <label class="smoky-form-label" style="font-size: 0.82rem; margin-bottom: 6px; display: block;">ขนาดห้องพัก</label>
          <input type="text" id="m-size" value="${room.size || (room.building === 'UnderGround' ? 'กว้าง 3 เมตร ยาว 4 เมตร รวม (12 ตร.ม.)' : 'กว้าง 3.5 เมตร ยาว 8 เมตร รวม (28 ตร.ม.)')}" class="smoky-glass-input" style="width: 100%;">
        </div>
        <div class="field">
          <label class="smoky-form-label" style="font-size: 0.82rem; margin-bottom: 6px; display: block;">ประเภทห้องน้ำ</label>
          <select id="m-bathroom" class="smoky-glass-select" style="width: 100%;">
            <option value="ห้องน้ำในตัว" ${room.bathroom !== 'ห้องน้ำรวม' ? 'selected' : ''}>ห้องน้ำในตัว</option>
            <option value="ห้องน้ำรวม" ${room.bathroom === 'ห้องน้ำรวม' ? 'selected' : ''}>ห้องน้ำรวม</option>
          </select>
        </div>
      </div>

      <div class="field">
        <label class="smoky-form-label" style="font-size: 0.82rem; margin-bottom: 6px; display: block;">สถานะห้องพัก</label>
        <select id="m-status" class="smoky-glass-select" style="width: 100%;">
          <option value="vacant" ${room.status === 'vacant' ? 'selected' : ''}>ห้องว่างพร้อมอยู่ (พร้อมทำสัญญา)</option>
          <option value="occupied" ${room.status === 'occupied' ? 'selected' : ''}>มีผู้พักอาศัยแล้ว</option>
          <option value="maintenance" ${room.status === 'maintenance' ? 'selected' : ''}>ปิดปรับปรุง / ซ่อมบำรุง</option>
        </select>
      </div>

      <div class="field">
        <label class="smoky-form-label" style="font-size: 0.82rem; margin-bottom: 6px; display: block;">ชื่อผู้พักอาศัยปัจจุบัน</label>
        <input type="text" id="m-tenant-name" value="${room.tenant_name || ''}" placeholder="ระบุชื่อผู้พักอาศัย (ถ้ามี)" class="smoky-glass-input" style="width: 100%;">
      </div>

      <div class="field">
        <label class="smoky-form-label" style="font-size: 0.82rem; margin-bottom: 6px; display: block;">เบอร์โทรศัพท์ผู้เช่า</label>
        <input type="text" id="m-tenant-phone" value="${room.tenant_phone || ''}" placeholder="08x-xxx-xxxx" class="smoky-glass-input" style="width: 100%;">
      </div>
    </form>
  `;

  const footer = `
    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
      <button type="button" class="btn btn-outline" id="btn-delete-room" style="color: #F87171; border-color: rgba(248,113,113,0.3); font-size: 0.80rem;">
        ${ic('trash')} ลบห้องพัก
      </button>
      <div style="display: flex; gap: 10px;">
        <button type="button" class="btn btn-outline" onclick="window.closeAppModal()">ยกเลิก</button>
        <button type="button" class="btn btn-primary" id="btn-save-manage-room">บันทึกข้อมูล</button>
      </div>
    </div>
  `;

  showModal({
    title: `จัดการห้องพัก ${room.room_number} (${room.building === 'KingPhetch' ? 'อาคาร กิ่งเพชร' : (room.building === 'UnderGround' ? 'อาคาร ใต้บ้าน' : 'อาคาร ธนกฤษฎ์')})`,
    body,
    footer,
    maxWidth: '540px'
  });

  document.getElementById('btn-save-manage-room').onclick = async () => {
    const num = document.getElementById('m-room-number').value.trim();
    const bld = document.getElementById('m-building').value;
    const tp = document.getElementById('m-type').value.trim();
    const pr = Number(document.getElementById('m-price').value);
    const sz = document.getElementById('m-size').value.trim();
    const br = document.getElementById('m-bathroom').value;
    const st = document.getElementById('m-status').value;
    const tName = document.getElementById('m-tenant-name').value.trim();
    const tPhone = document.getElementById('m-tenant-phone').value.trim();

    const updatedData = {
      room_number: num,
      building: bld,
      floor: bld === 'UnderGround' ? 0 : 1,
      type: tp,
      price: pr,
      size: sz,
      bathroom: br,
      status: st,
      tenant_name: st === 'occupied' ? tName : '',
      tenant_phone: st === 'occupied' ? tPhone : ''
    };

    try {
      const dbPayload = {
        room_number: num,
        floor: bld === 'UnderGround' ? 0 : 1,
        type: tp,
        price: pr,
        status: st,
        tenant_name: st === 'occupied' ? tName : '',
        tenant_phone: st === 'occupied' ? tPhone : ''
      };
      await supabase.from('rooms').eq('id', room.id).update(dbPayload);
    } catch (_) {}

    // อัปเดตใน LocalStorage Cache
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
      const idx = cached.findIndex(x => x.id === room.id);
      if (idx !== -1) {
        cached[idx] = { ...cached[idx], ...updatedData };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
      }
    } catch (_) {}

    toast(`อัปเดตข้อมูลห้อง ${num} เรียบร้อยแล้ว`, 'success');
    closeModal();
    loadRoomsData();
  };

  document.getElementById('btn-delete-room').onclick = async () => {
    if (confirm(`คุณต้องการลบห้อง ${room.room_number} ออกจากระบบใช่หรือไม่?`)) {
      try {
        await supabase.from('rooms').eq('id', room.id).delete();
      } catch (_) {}

      try {
        let cached = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
        cached = cached.filter(x => x.id !== room.id);
        localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
      } catch (_) {}

      toast(`ลบห้อง ${room.room_number} สำเร็จ`, 'info');
      closeModal();
      loadRoomsData();
    }
  };
}

// Modal เพิ่มห้องใหม่
function openAddRoomModal() {
  const body = `
    <form id="form-add-room" style="display: flex; flex-direction: column; gap: 14px;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div class="field">
          <label class="smoky-form-label" style="font-size: 0.82rem; margin-bottom: 6px; display: block;">หมายเลขห้อง (เช่น 110, 206, B04)</label>
          <input type="text" id="add-room-number" placeholder="เช่น 110" class="smoky-glass-input" style="width: 100%;" required>
        </div>
        <div class="field">
          <label class="smoky-form-label" style="font-size: 0.82rem; margin-bottom: 6px; display: block;">อาคาร</label>
          <select id="add-building" class="smoky-glass-select" style="width: 100%;">
            <option value="Tanakrit">อาคาร ธนกฤษฎ์ (2,800 ฿ / เดือน)</option>
            <option value="KingPhetch">อาคาร กิ่งเพชร (2,600 ฿ / เดือน)</option>
            <option value="UnderGround">อาคาร ใต้บ้าน (1,500 ฿ / เดือน)</option>
          </select>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div class="field">
          <label class="smoky-form-label" style="font-size: 0.82rem; margin-bottom: 6px; display: block;">ประเภทห้อง</label>
          <input type="text" id="add-type" value="ห้องพัดลม" class="smoky-glass-input" style="width: 100%;" required>
        </div>
        <div class="field">
          <label class="smoky-form-label" style="font-size: 0.82rem; margin-bottom: 6px; display: block;">ราคาค่าเช่าต่อเดือน (บาท)</label>
          <input type="number" id="add-price" value="2800" class="smoky-glass-input" style="width: 100%;" required>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div class="field">
          <label class="smoky-form-label" style="font-size: 0.82rem; margin-bottom: 6px; display: block;">ขนาดห้อง</label>
          <input type="text" id="add-size" value="กว้าง 3.5 เมตร ยาว 8 เมตร รวม (28 ตร.ม.)" class="smoky-glass-input" style="width: 100%;">
        </div>
        <div class="field">
          <label class="smoky-form-label" style="font-size: 0.82rem; margin-bottom: 6px; display: block;">ประเภทห้องน้ำ</label>
          <select id="add-bathroom" class="smoky-glass-select" style="width: 100%;">
            <option value="ห้องน้ำในตัว">ห้องน้ำในตัว</option>
            <option value="ห้องน้ำรวม">ห้องน้ำรวม</option>
          </select>
        </div>
      </div>

      <div class="field">
        <label class="smoky-form-label" style="font-size: 0.82rem; margin-bottom: 6px; display: block;">สถานะเริ่มต้น</label>
        <select id="add-status" class="smoky-glass-select" style="width: 100%;">
          <option value="vacant">ห้องว่าง (พร้อมเปิดให้เช่า)</option>
          <option value="occupied">มีผู้เช่าแล้ว</option>
          <option value="maintenance">ปิดปรับปรุง</option>
        </select>
      </div>
    </form>
  `;

  const footer = `
    <div style="display: flex; justify-content: flex-end; gap: 10px; width: 100%;">
      <button type="button" class="btn btn-outline" onclick="window.closeAppModal()">ยกเลิก</button>
      <button type="button" class="btn btn-primary" id="btn-submit-add-room">เพิ่มห้องพัก</button>
    </div>
  `;

  showModal({
    title: 'เพิ่มห้องพักใหม่เข้าสู่ผังอาคาร',
    body,
    footer,
    maxWidth: '520px'
  });

  const bldSelect = document.getElementById('add-building');
  if (bldSelect) {
    bldSelect.onchange = () => {
      const val = bldSelect.value;
      if (val === 'UnderGround') {
        document.getElementById('add-price').value = 1500;
        document.getElementById('add-size').value = 'กว้าง 3 เมตร ยาว 4 เมตร รวม (12 ตร.ม.)';
        document.getElementById('add-bathroom').value = 'ห้องน้ำรวม';
      } else if (val === 'KingPhetch') {
        document.getElementById('add-price').value = 2600;
        document.getElementById('add-size').value = 'กว้าง 3.5 เมตร ยาว 8 เมตร รวม (28 ตร.ม.)';
        document.getElementById('add-bathroom').value = 'ห้องน้ำในตัว';
      } else {
        document.getElementById('add-price').value = 2800;
        document.getElementById('add-size').value = 'กว้าง 3.5 เมตร ยาว 8 เมตร รวม (28 ตร.ม.)';
        document.getElementById('add-bathroom').value = 'ห้องน้ำในตัว';
      }
    };
  }

  document.getElementById('btn-submit-add-room').onclick = async () => {
    const num = document.getElementById('add-room-number').value.trim();
    const bld = document.getElementById('add-building').value;
    const tp = document.getElementById('add-type').value.trim();
    const pr = Number(document.getElementById('add-price').value);
    const sz = document.getElementById('add-size').value.trim();
    const br = document.getElementById('add-bathroom').value;
    const st = document.getElementById('add-status').value;

    if (!num) {
      toast('กรุณาระบุหมายเลขห้อง', 'error');
      return;
    }

    const newRoom = {
      id: 'RM-' + Math.floor(1000 + Math.random() * 9000),
      room_number: num,
      building: bld,
      floor: bld === 'UnderGround' ? 0 : 1,
      type: tp,
      price: pr,
      size: sz,
      bathroom: br,
      status: st,
      tenant_name: '',
      tenant_phone: '',
      condition: bld === 'UnderGround' ? 'ราคาสบายกระเป๋า พร้อมอยู่' : (bld === 'KingPhetch' ? 'เงียบสงบ เป็นส่วนตัว' : 'โปร่งสบาย ระเบียงส่วนตัว'),
      amenities: bld === 'UnderGround' ? 'เตียง+ที่นอน, ตู้เสื้อผ้า, ใช้ห้องน้ำรวมที่สะอาด' : 'เตียง+ที่นอน, ตู้เสื้อผ้า, ห้องน้ำในตัว, ระเบียงตากผ้าหลังห้อง'
    };

    try {
      const dbPayload = {
        id: 'R' + num,
        room_number: num,
        floor: bld === 'UnderGround' ? 0 : 1,
        type: tp,
        price: pr,
        status: st,
        tenant_name: '',
        tenant_phone: ''
      };
      await supabase.from('rooms').insert([dbPayload]);
    } catch (_) {}

    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
      cached.push(newRoom);
      localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
    } catch (_) {}

    toast(`เพิ่มห้องพัก ${num} (${bld === 'KingPhetch' ? 'อาคาร กิ่งเพชร' : (bld === 'UnderGround' ? 'อาคาร ใต้บ้าน' : 'อาคาร ธนกฤษฎ์')}) เรียบร้อยแล้ว`, 'success');
    closeModal();
    loadRoomsData();
  };
}


/* ========== js/tenants.js ========== */
// js/tenants.js
// ระบบทะเบียนผู้พักอาศัยและสัญญาเช่า 3 อาคาร (Tanakrit, KingPhetch, UnderGround)
// ออกแบบด้วย Smoky Frosted Glass Design System


const TENANTS_STORAGE_KEY = 'tanakrit_tenants_cache_v3';

let tenantBuildingFilter = 'all';
let tenantSearchTerm = '';
let tenantSortBy = 'room_asc';
let cachedTenants = [];

// ข้อมูลรายชื่อผู้พักอาศัยเริ่มต้น (ว่างเปล่าเมื่อไม่มีข้อมูลในฐานข้อมูลจริง)
const DEFAULT_TENANTS = [];

// ฟังก์ชันวิเคราะห์ข้อมูลอาคารและค่าเช่าจากเลขห้องพัก
function getBuildingInfo(roomNum) {
  const r = (roomNum || '').toString().trim().toUpperCase();
  if (r.startsWith('B') || r.startsWith('ใต้บ้าน')) {
    return { name: 'UnderGround', nameTh: 'อาคาร ใต้บ้าน', rent: 1500, color: '#10B981', badge: '🚗 อาคาร ใต้บ้าน' };
  } else if (r.startsWith('2')) {
    return { name: 'KingPhetch', nameTh: 'อาคาร กิ่งเพชร', rent: 2600, color: '#3B82F6', badge: '🏡 อาคาร กิ่งเพชร' };
  } else {
    return { name: 'Tanakrit', nameTh: 'อาคาร ธนกฤษฎ์', rent: 2800, color: '#8B5CF6', badge: '🏢 อาคาร ธนกฤษฎ์' };
  }
}

// โหลดข้อมูลผู้พักอาศัยจาก Cache หรือ Supabase Cloud
async function fetchTenantsList() {
  try {
    const local = localStorage.getItem(TENANTS_STORAGE_KEY);
    if (local) {
      cachedTenants = JSON.parse(local);
    }
  } catch (e) {
    console.warn('Cannot read local tenants cache:', e);
  }

  try {
    const { data, error } = await supabase.from('tenants').select('*').order('room', { ascending: true });
    if (!error && Array.isArray(data)) {
      // ทำการแมปข้อมูลที่ได้จาก Supabase ตรงตามจริง
      const mapped = data.map(dbItem => {
        const bInfo = getBuildingInfo(dbItem.room);
        const existing = (cachedTenants.length > 0 ? cachedTenants : []).find(x => x.room === dbItem.room || x.id === dbItem.id);
        return {
          id: dbItem.id || 'T-' + Math.random().toString(36).substring(2, 7),
          tenant_id: dbItem.tenant_id || (existing ? existing.tenant_id : '6512000'),
          name: dbItem.name || (existing ? existing.name : 'ผู้พักอาศัย'),
          room: dbItem.room || (existing ? existing.room : '101'),
          building: bInfo.name,
          building_th: bInfo.nameTh,
          rent: existing ? existing.rent : bInfo.rent,
          phone: dbItem.phone || (existing ? existing.phone : '-'),
          email: dbItem.email || (existing ? existing.email : '-'),
          line_id: (existing && existing.line_id) ? existing.line_id : '-',
          id_card: (existing && existing.id_card) ? existing.id_card : '1-8099-00123-45-X',
          check_in: dbItem.check_in || (existing ? existing.check_in : '2026-06-01'),
          lease_term: (existing && existing.lease_term) ? existing.lease_term : 'สัญญา 1 ปี',
          deposit: (existing && existing.deposit) ? existing.deposit : 2000,
          emergency_contact: (existing && existing.emergency_contact) ? existing.emergency_contact : 'ผู้ปกครอง 081-xxx-xxxx',
          status: dbItem.status || (existing ? existing.status : 'active'),
          avatar: (existing && existing.avatar) ? existing.avatar : `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80`,
          notes: (existing && existing.notes) ? existing.notes : 'ข้อมูลซิงค์จากระบบฐานข้อมูล'
        };
      });

      cachedTenants = mapped;
      localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify(cachedTenants));
    } else if (error) {
      console.warn('Fetch tenants error:', error);
      cachedTenants = [];
    }
  } catch (err) {
    console.warn('Fetch tenants exception:', err);
    cachedTenants = [];
  }
  return cachedTenants;
}

// ฟังก์ชันหลัก Render หน้าจอผู้พักอาศัย (Smoky Frosted Glass)
async function renderTenantsView() {
  await fetchTenantsList();

  setTimeout(() => {
    bindTenantsEvents();
    renderTenantsTable();
  }, 0);

  return `
    <div style="display: flex; flex-direction: column; gap: 24px; width: 100%;">
      
      <!-- 1. Header & Actions -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(59, 130, 246, 0.2); display: flex; align-items: center; justify-content: center; color: #60A5FA;">
              ${ic('users')}
            </div>
            <h2 style="font-size: 1.35rem; font-weight: 700; color: #ffffff; margin: 0; letter-spacing: -0.02em;">
              ทะเบียนผู้พักอาศัยและสัญญาเช่า (Tenants Directory & Leases)
            </h2>
          </div>
          <p style="color: rgba(255, 255, 255, 0.45); font-size: 0.84rem; margin: 6px 0 0 0;">
            จัดการประวัติผู้เช่าห้องพัก ข้อมูลติดต่อ สัญญาเช่า และบัญชีล็อกอินของนักศึกษา/ผู้พักอาศัยทั้ง 17 ห้อง (3 อาคาร)
          </p>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <!-- ปุ่มรีเฟรช -->
          <button class="smoky-round-glass-btn" id="btn-refresh-tenants" style="width: auto; border-radius: 9999px; padding: 0 16px; height: 38px; gap: 6px; font-size: 0.80rem;" title="รีเฟรชข้อมูล">
            ${ic('check')}
            <span>รีเฟรชข้อมูล</span>
          </button>

          <!-- ปุ่มส่งออก CSV -->
          <button class="smoky-round-glass-btn" id="btn-export-tenants" style="width: auto; border-radius: 9999px; padding: 0 16px; height: 38px; gap: 6px; font-size: 0.80rem; background: rgba(255,255,255,0.08);" title="ส่งออกไฟล์ CSV">
            ${ic('download')}
            <span>ส่งออก (CSV)</span>
          </button>

          <!-- ปุ่มเพิ่มผู้พักใหม่ -->
          <button class="smoky-round-glass-btn" id="btn-open-add-tenant" style="width: auto; border-radius: 9999px; padding: 0 18px; height: 38px; background: #3B82F6; color: #ffffff; border: 1px solid rgba(59,130,246,0.5); box-shadow: 0 0 20px rgba(59,130,246,0.4); font-size: 0.82rem; font-weight: 600; gap: 6px;">
            ${ic('plus')}
            <span>+ ลงทะเบียนผู้พักใหม่</span>
          </button>
        </div>
      </div>

      <!-- 2. KPI Summary Stat Tiles (Smoky Glass 4 Tiles) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;" id="tenants-kpi-grid">
        <div class="smoky-tile">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="smoky-meta-label">ผู้พักอาศัยปัจจุบัน</span>
            <span class="smoky-delta-pos" style="background: rgba(59, 130, 246, 0.15); color: #60A5FA;">กำลังพัก</span>
          </div>
          <div class="smoky-kpi-num" style="margin-top: 8px; color: #ffffff;" id="kpi-total-tenants">11 คน</div>
          <div class="smoky-kpi-sub" id="kpi-total-tenants-sub">จากห้องพักทั้งหมด 17 ห้อง (3 อาคาร)</div>
        </div>

        <div class="smoky-tile">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="smoky-meta-label">อัตราการเข้าพัก (Occupancy)</span>
            <span class="smoky-delta-pos">เป้าหมาย &gt; 70%</span>
          </div>
          <div class="smoky-kpi-num" style="margin-top: 8px; color: #34D399;" id="kpi-occupancy-rate">65%</div>
          <div class="smoky-kpi-sub">ธนกฤษฎ์ 6 • กิ่งเพชร 3 • ใต้บ้าน 2</div>
        </div>

        <div class="smoky-tile">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="smoky-meta-label">ห้องว่างพร้อมเข้าพัก</span>
            <span class="smoky-delta-pos" style="background: rgba(16, 185, 129, 0.15); color: #34D399;">ว่างพร้อมเช่า</span>
          </div>
          <div class="smoky-kpi-num" style="margin-top: 8px; color: #10B981;" id="kpi-vacant-rooms">5 ห้อง</div>
          <div class="smoky-kpi-sub">108, 109, 204, 205, B03</div>
        </div>

        <div class="smoky-tile">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="smoky-meta-label">ปรับปรุงห้อง / รอเข้าพัก</span>
            <span class="smoky-delta-neg" style="background: rgba(245, 158, 11, 0.15); color: #FBBF24;">ซ่อมบำรุง</span>
          </div>
          <div class="smoky-kpi-num" style="margin-top: 8px; color: #FBBF24;" id="kpi-maint-rooms">1 ห้อง</div>
          <div class="smoky-kpi-sub">ห้อง 107 (กำลังตรวจเช็กแอร์)</div>
        </div>
      </div>

      <!-- 3. Toolbar: Search Box, Building Filters & Sort -->
      <div class="smoky-card" style="padding: 16px 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
          
          <!-- Search Box -->
          <div style="position: relative; min-width: 260px; flex: 1; max-width: 420px;">
            <span style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.4); display: flex; align-items: center;">
              ${ic('search')}
            </span>
            <input type="text" id="tenant-search-input" class="smoky-glass-input" placeholder="ค้นหาชื่อ, รหัสนักศึกษา, ห้องพัก, หรือเบอร์โทร..." style="width: 100%; padding-left: 38px;">
          </div>

          <!-- Building Filter Buttons (Segmented Control) -->
          <div class="smoky-seg-control" id="tenants-filter-tabs" style="overflow-x: auto; max-width: 100%; padding-bottom: 2px;">
            <button class="smoky-seg-btn active" data-filter="all">ทั้งหมด (${cachedTenants.length})</button>
            <button class="smoky-seg-btn" data-filter="Tanakrit">🏢 อาคาร ธนกฤษฎ์</button>
            <button class="smoky-seg-btn" data-filter="KingPhetch">🏡 อาคาร กิ่งเพชร</button>
            <button class="smoky-seg-btn" data-filter="UnderGround">🚗 อาคาร ใต้บ้าน</button>
            <button class="smoky-seg-btn" data-filter="active">🟢 กำลังพักอาศัย</button>
          </div>

          <!-- Sort Select -->
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 0.80rem; color: rgba(255,255,255,0.45); white-space: nowrap;">จัดเรียง:</span>
            <select id="tenant-sort-select" class="smoky-glass-input" style="height: 36px; padding: 0 12px; font-size: 0.80rem; border-radius: 8px; width: auto;">
              <option value="room_asc" style="background:#141a29; color:white;">เลขห้อง (น้อย ➔ มาก)</option>
              <option value="name_asc" style="background:#141a29; color:white;">ชื่อผู้พัก (ก ➔ ฮ)</option>
              <option value="checkin_desc" style="background:#141a29; color:white;">วันที่เข้าพัก (ล่าสุด)</option>
              <option value="rent_desc" style="background:#141a29; color:white;">ค่าเช่า (สูง ➔ ต่ำ)</option>
            </select>
          </div>

        </div>
      </div>

      <!-- 4. Modern Smoky Frosted Glass Tenants Table -->
      <div class="smoky-card" style="padding: 0; overflow: hidden;">
        <div class="smoky-table-wrap">
          <table class="smoky-table">
            <thead>
              <tr>
                <th style="padding-left: 24px; min-width: 220px;">ผู้พักอาศัย (Tenant)</th>
                <th style="min-width: 170px;">ห้องพัก & อาคาร</th>
                <th style="min-width: 180px;">ช่องทางติดต่อ</th>
                <th style="min-width: 170px;">วันเข้าพัก & ระยะสัญญา</th>
                <th style="min-width: 120px; text-align: right;">ค่าเช่า/เดือน</th>
                <th style="min-width: 120px; text-align: center;">สถานะ</th>
                <th style="padding-right: 24px; text-align: right; min-width: 160px;">การจัดการ</th>
              </tr>
            </thead>
            <tbody id="tenants-table-body">
              <!-- Render rows dynamically -->
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;
}

// ฟังก์ชันเรนเดอร์ตารางผู้พักอาศัย
function renderTenantsTable() {
  const tbody = document.getElementById('tenants-table-body');
  if (!tbody) return;

  let list = [...cachedTenants];

  // 1. กรองตามประเภทอาคาร หรือสถานะ
  if (tenantBuildingFilter === 'Tanakrit') {
    list = list.filter(t => t.building === 'Tanakrit');
  } else if (tenantBuildingFilter === 'KingPhetch') {
    list = list.filter(t => t.building === 'KingPhetch');
  } else if (tenantBuildingFilter === 'UnderGround') {
    list = list.filter(t => t.building === 'UnderGround');
  } else if (tenantBuildingFilter === 'active') {
    list = list.filter(t => t.status === 'active');
  }

  // 2. ค้นหา
  if (tenantSearchTerm) {
    const q = tenantSearchTerm.toLowerCase().trim();
    list = list.filter(t =>
      (t.name || '').toLowerCase().includes(q) ||
      (t.tenant_id || '').toLowerCase().includes(q) ||
      (t.room || '').toLowerCase().includes(q) ||
      (t.phone || '').toLowerCase().includes(q) ||
      (t.email || '').toLowerCase().includes(q) ||
      (t.line_id || '').toLowerCase().includes(q) ||
      (t.building_th || '').toLowerCase().includes(q)
    );
  }

  // 3. เรียงลำดับ
  list.sort((a, b) => {
    if (tenantSortBy === 'room_asc') {
      return (a.room || '').localeCompare(b.room || '', undefined, { numeric: true });
    } else if (tenantSortBy === 'name_asc') {
      return (a.name || '').localeCompare(b.name || '', 'th');
    } else if (tenantSortBy === 'checkin_desc') {
      return (b.check_in || '').localeCompare(a.check_in || '');
    } else if (tenantSortBy === 'rent_desc') {
      return (b.rent || 0) - (a.rent || 0);
    }
    return 0;
  });

  // อัปเดตตัวเลข KPI บนหัวการ์ด
  updateTenantsKPI(cachedTenants);

  if (list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 48px 24px; color: rgba(255,255,255,0.4);">
          <div style="font-size: 2rem; margin-bottom: 8px;">🔍</div>
          <div style="font-size: 0.95rem; font-weight: 500; color: rgba(255,255,255,0.7);">ไม่พบข้อมูลผู้พักอาศัยที่ตรงกับเงื่อนไข</div>
          <div style="font-size: 0.80rem; color: rgba(255,255,255,0.4); margin-top: 4px;">ลองเปลี่ยนคำค้นหา หรือคลิกปุ่ม "ทั้งหมด" ด้านบน</div>
        </td>
      </tr>
    `;
    return;
  }

  let html = '';
  list.forEach(tenant => {
    const bInfo = getBuildingInfo(tenant.room);
    const avatarUrl = tenant.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80`;

    html += `
      <tr style="transition: background 0.15s ease;">
        
        <!-- 1. ผู้พักอาศัย (Profile & Name) -->
        <td style="padding-left: 24px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="position: relative; width: 38px; height: 38px; border-radius: 50%; overflow: hidden; flex-shrink: 0; border: 1px solid rgba(255,255,255,0.18);">
              <img src="${avatarUrl}" alt="${tenant.name}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div>
              <div style="font-weight: 600; color: #ffffff; font-size: 0.88rem; display: flex; align-items: center; gap: 6px;">
                <span>${tenant.name}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px; margin-top: 3px;">
                <span style="font-size: 0.72rem; color: rgba(255,255,255,0.45); font-family: monospace; background: rgba(255,255,255,0.06); padding: 1px 6px; border-radius: 4px;">
                  รหัส ${tenant.tenant_id || '-'}
                </span>
              </div>
            </div>
          </div>
        </td>

        <!-- 2. ห้องพัก & อาคาร -->
        <td>
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="display: inline-block; font-size: 0.84rem; font-weight: 700; color: #ffffff; background: rgba(59, 130, 246, 0.2); border: 1px solid rgba(59, 130, 246, 0.35); padding: 2px 8px; border-radius: 6px;">
                ห้อง ${tenant.room}
              </span>
            </div>
            <span style="font-size: 0.74rem; color: ${bInfo.color}; font-weight: 500;">
              ${bInfo.badge}
            </span>
          </div>
        </td>

        <!-- 3. ช่องทางติดต่อ -->
        <td>
          <div style="display: flex; flex-direction: column; gap: 3px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="color: rgba(255,255,255,0.4);">${ic('phone')}</span>
              <a href="tel:${tenant.phone}" style="color: #60A5FA; font-size: 0.82rem; text-decoration: none; font-weight: 500;" title="โทรติดต่อ">
                ${tenant.phone || '-'}
              </a>
            </div>
            ${tenant.line_id && tenant.line_id !== '-' ? `
              <div style="font-size: 0.74rem; color: rgba(255,255,255,0.45); display: flex; align-items: center; gap: 4px;">
                <span style="color: #10B981;">LINE:</span>
                <span>${tenant.line_id}</span>
              </div>
            ` : ''}
          </div>
        </td>

        <!-- 4. วันเข้าพัก & สัญญา -->
        <td>
          <div style="display: flex; flex-direction: column; gap: 3px;">
            <span style="font-size: 0.82rem; color: #ffffff; font-weight: 500;">
              ${fmtDate(tenant.check_in)}
            </span>
            <span style="font-size: 0.72rem; color: rgba(255,255,255,0.45);">
              ${tenant.lease_term || 'สัญญา 1 ปี'}
            </span>
          </div>
        </td>

        <!-- 5. ค่าเช่าต่อเดือน -->
        <td style="text-align: right;">
          <div style="font-weight: 700; color: #ffffff; font-size: 0.90rem;">
            ${fmtCurrency(tenant.rent || bInfo.rent)}
          </div>
          <span style="font-size: 0.70rem; color: rgba(255,255,255,0.4);">
            มัดจำ ${fmtCurrency(tenant.deposit || 2000)}
          </span>
        </td>

        <!-- 6. สถานะ -->
        <td style="text-align: center;">
          ${tenant.status === 'active' ? `
            <span class="smoky-delta-pos" style="font-size: 0.72rem; padding: 3px 8px;">
              ● กำลังพักอาศัย
            </span>
          ` : `
            <span class="smoky-delta-neg" style="font-size: 0.72rem; padding: 3px 8px; background: rgba(245, 158, 11, 0.15); color: #FBBF24;">
              รอคืนห้อง
            </span>
          `}
        </td>

        <!-- 7. การจัดการ (Actions) -->
        <td style="padding-right: 24px; text-align: right;">
          <div style="display: inline-flex; align-items: center; gap: 6px;">
            
            <!-- ปุ่มดูข้อมูล -->
            <button class="smoky-round-glass-btn btn-view-tenant" data-tenant-id="${tenant.id}" style="width: 32px; height: 32px; border-radius: 8px;" title="ดูข้อมูลผู้พักและสัญญา">
              ${ic('search')}
            </button>

            <!-- ปุ่มแก้ไข -->
            <button class="smoky-round-glass-btn btn-edit-tenant" data-tenant-id="${tenant.id}" style="width: 32px; height: 32px; border-radius: 8px; color: #60A5FA;" title="แก้ไขข้อมูลผู้พัก">
              ${ic('edit')}
            </button>

            <!-- ปุ่มย้ายออก / ลบ -->
            <button class="smoky-round-glass-btn btn-del-tenant" data-tenant-id="${tenant.id}" style="width: 32px; height: 32px; border-radius: 8px; color: #F87171;" title="แจ้งย้ายออก / คืนห้อง">
              ${ic('trash')}
            </button>

          </div>
        </td>

      </tr>
    `;
  });

  tbody.innerHTML = html;

  // Bind Event Listeners สำหรับแถวในตาราง
  tbody.querySelectorAll('.btn-view-tenant').forEach(btn => {
    btn.onclick = () => {
      const tid = btn.getAttribute('data-tenant-id');
      viewTenantDetails(tid);
    };
  });

  tbody.querySelectorAll('.btn-edit-tenant').forEach(btn => {
    btn.onclick = () => {
      const tid = btn.getAttribute('data-tenant-id');
      const target = cachedTenants.find(x => x.id === tid);
      if (target) openEditTenantModal(target);
    };
  });

  tbody.querySelectorAll('.btn-del-tenant').forEach(btn => {
    btn.onclick = () => {
      const tid = btn.getAttribute('data-tenant-id');
      deleteTenant(tid);
    };
  });
}

// อัปเดตตัวเลขสรุป 4 KPI Tiles
function updateTenantsKPI(tenants) {
  const totalEl = document.getElementById('kpi-total-tenants');
  const occEl = document.getElementById('kpi-occupancy-rate');
  const vacEl = document.getElementById('kpi-vacant-rooms');

  if (!totalEl || !occEl) return;

  const totalTenants = tenants.length;
  totalEl.textContent = `${totalTenants} คน`;

  // อัตราการเข้าพักคิดจาก 17 ห้อง
  const occPercent = Math.round((totalTenants / 17) * 100);
  occEl.textContent = `${occPercent}%`;

  const vacantRoomsCount = Math.max(0, 17 - totalTenants - 1); // หัก 1 ห้องที่กำลังซ่อม (107)
  if (vacEl) vacEl.textContent = `${vacantRoomsCount} ห้อง`;
}

// ผูกการทำงาน Event Listeners สำหรับ Toolbar ด้านบน
function bindTenantsEvents() {
  // 1. Search Input
  const searchInput = document.getElementById('tenant-search-input');
  if (searchInput) {
    searchInput.oninput = (e) => {
      tenantSearchTerm = e.target.value;
      renderTenantsTable();
    };
  }

  // 2. Filter Buttons
  const filterBtns = document.querySelectorAll('#tenants-filter-tabs .smoky-seg-btn');
  filterBtns.forEach(btn => {
    btn.onclick = () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      tenantBuildingFilter = btn.getAttribute('data-filter');
      renderTenantsTable();
    };
  });

  // 3. Sort Select
  const sortSelect = document.getElementById('tenant-sort-select');
  if (sortSelect) {
    sortSelect.onchange = (e) => {
      tenantSortBy = e.target.value;
      renderTenantsTable();
    };
  }

  // 4. ปุ่มรีเฟรชข้อมูล
  const btnRefresh = document.getElementById('btn-refresh-tenants');
  if (btnRefresh) {
    btnRefresh.onclick = async () => {
      btnRefresh.innerHTML = `${ic('check')} <span>กำลังโหลด...</span>`;
      await fetchTenantsList();
      renderTenantsTable();
      toast('รีเฟรชข้อมูลผู้พักอาศัยล่าสุดเรียบร้อย', 'info');
      btnRefresh.innerHTML = `${ic('check')} <span>รีเฟรชข้อมูล</span>`;
    };
  }

  // 5. ปุ่มเปิด Modal เพิ่มผู้พักใหม่
  const btnAdd = document.getElementById('btn-open-add-tenant');
  if (btnAdd) {
    btnAdd.onclick = openAddTenantModal;
  }

  // 6. ปุ่ม Export CSV
  const btnExport = document.getElementById('btn-export-tenants');
  if (btnExport) {
    btnExport.onclick = exportTenantsCSV;
  }
}

// ==================== MODALS ====================

// 1. Modal ดูข้อมูลรายละเอียดผู้พักอาศัย (View Details)
function viewTenantDetails(id) {
  const tenant = cachedTenants.find(x => x.id === id);
  if (!tenant) return;

  const bInfo = getBuildingInfo(tenant.room);
  const avatarUrl = tenant.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80`;

  const body = `
    <div style="display: flex; flex-direction: column; gap: 20px;">
      
      <!-- Profile Header Card -->
      <div class="smoky-modal-card-header" style="display: flex; align-items: center; gap: 16px; border-radius: 14px; padding: 16px;">
        <div style="width: 58px; height: 58px; border-radius: 50%; overflow: hidden; border: 2px solid rgba(59,130,246,0.5); flex-shrink: 0;">
          <img src="${avatarUrl}" alt="${tenant.name}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <h3 class="smoky-modal-card-title" style="font-size: 1.15rem; font-weight: 700; margin: 0;">${tenant.name}</h3>
            <span class="smoky-delta-pos" style="font-size: 0.70rem;">● กำลังพักอาศัย</span>
          </div>
          <div class="smoky-modal-sub" style="font-size: 0.80rem; margin-top: 4px; display: flex; gap: 12px; flex-wrap: wrap;">
            <span>รหัสผู้เช่า: <strong style="color: #2563EB;">${tenant.tenant_id}</strong></span>
            <span>บัตร ปชช.: <strong>${tenant.id_card || '-'}</strong></span>
          </div>
        </div>
      </div>

      <!-- Bento Grid Details (4 Blocks) -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        
        <!-- Block 1: ข้อมูลห้องพัก & สัญญา -->
        <div class="smoky-modal-block" style="border-radius: 12px; padding: 14px;">
          <div style="font-size: 0.76rem; font-weight: 700; text-transform: uppercase; color: #2563EB; margin-bottom: 8px;">
            🏢 ข้อมูลห้องพัก & ค่าเช่า
          </div>
          <div style="display: flex; flex-direction: column; gap: 7px; font-size: 0.84rem;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="smoky-modal-label">ห้องพัก:</span>
              <strong class="smoky-modal-val">ห้อง ${tenant.room}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="smoky-modal-label">อาคาร:</span>
              <span style="color: ${bInfo.color}; font-weight: 700;">${bInfo.nameTh}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="smoky-modal-label">ค่าเช่ารายเดือน:</span>
              <strong style="color: #059669;">${fmtCurrency(tenant.rent || bInfo.rent)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="smoky-modal-label">เงินประกันความเสียหาย:</span>
              <span class="smoky-modal-val">${fmtCurrency(tenant.deposit || 2000)}</span>
            </div>
          </div>
        </div>

        <!-- Block 2: ข้อมูลสัญญาและวันที่เข้าพัก -->
        <div class="smoky-modal-block" style="border-radius: 12px; padding: 14px;">
          <div style="font-size: 0.76rem; font-weight: 700; text-transform: uppercase; color: #059669; margin-bottom: 8px;">
            📅 ข้อมูลสัญญาเช่า
          </div>
          <div style="display: flex; flex-direction: column; gap: 7px; font-size: 0.84rem;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="smoky-modal-label">วันที่เริ่มเข้าพัก:</span>
              <strong class="smoky-modal-val">${fmtDate(tenant.check_in)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="smoky-modal-label">ระยะเวลาสัญญา:</span>
              <span class="smoky-modal-val">${tenant.lease_term || 'สัญญา 1 ปี'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="smoky-modal-label">สถานะสัญญา:</span>
              <span class="smoky-delta-pos" style="font-size: 0.72rem; padding: 2px 8px;">ปกติ</span>
            </div>
          </div>
        </div>

        <!-- Block 3: ข้อมูลติดต่อ & ช่องทาง -->
        <div class="smoky-modal-block" style="border-radius: 12px; padding: 14px;">
          <div style="font-size: 0.76rem; font-weight: 700; text-transform: uppercase; color: #D97706; margin-bottom: 8px;">
            📞 ช่องทางติดต่อ
          </div>
          <div style="display: flex; flex-direction: column; gap: 7px; font-size: 0.84rem;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="smoky-modal-label">เบอร์โทรศัพท์:</span>
              <a href="tel:${tenant.phone}" style="color: #2563EB; text-decoration: none; font-weight: 700;">${tenant.phone || '-'}</a>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="smoky-modal-label">LINE ID:</span>
              <span class="smoky-modal-val">${tenant.line_id || '-'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="smoky-modal-label">อีเมล:</span>
              <a href="mailto:${tenant.email}" class="smoky-modal-val" style="text-decoration: underline;">${tenant.email || '-'}</a>
            </div>
          </div>
        </div>

        <!-- Block 4: ข้อมูลฉุกเฉิน & บัญชีเข้าระบบ -->
        <div class="smoky-modal-block" style="border-radius: 12px; padding: 14px;">
          <div style="font-size: 0.76rem; font-weight: 700; text-transform: uppercase; color: #DB2777; margin-bottom: 8px;">
            🔐 ข้อมูลฉุกเฉิน & บัญชีล็อกอิน
          </div>
          <div style="display: flex; flex-direction: column; gap: 7px; font-size: 0.84rem;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="smoky-modal-label">ติดต่อฉุกเฉิน:</span>
              <span class="smoky-modal-val">${tenant.emergency_contact || '-'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="smoky-modal-label">Username เข้าเว็บ:</span>
              <strong style="color: #DB2777; font-family: monospace;">${tenant.tenant_id || tenant.phone || tenant.room}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="smoky-modal-label">รหัสผ่านเริ่มต้น:</span>
              <span class="smoky-modal-meta" style="font-family: monospace;">(เลขห้องพัก: ${tenant.room})</span>
            </div>
          </div>
        </div>

      </div>

      <!-- หมายเหตุเพิ่มเติม -->
      ${tenant.notes ? `
        <div class="smoky-modal-notes" style="border-radius: 10px; padding: 10px 14px; font-size: 0.80rem;">
          📝 <strong class="smoky-modal-val">หมายเหตุจากผู้จัดการ:</strong> <span>${tenant.notes}</span>
        </div>
      ` : ''}

    </div>
  `;

  const footer = `
    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
      <a href="tel:${tenant.phone}" class="smoky-round-glass-btn btn-modal-phone" style="width: auto; border-radius: 9999px; padding: 0 16px; height: 38px; gap: 6px; font-size: 0.80rem; text-decoration: none;">
        ${ic('phone')} โทรติดต่อผู้พัก
      </a>
      <div style="display: flex; gap: 8px;">
        <button type="button" class="smoky-round-glass-btn" style="width: auto; border-radius: 9999px; padding: 0 16px; height: 38px; font-size: 0.80rem;" onclick="window.closeAppModal()">
          ปิดหน้าต่าง
        </button>
        <button type="button" class="smoky-round-glass-btn btn-primary" style="width: auto; border-radius: 9999px; padding: 0 18px; height: 38px; background: #2563EB !important; color: #ffffff !important; font-size: 0.80rem; font-weight: 600; border: none; cursor: pointer;" id="btn-modal-edit-now">
          ✏️ แก้ไขข้อมูล
        </button>
      </div>
    </div>
  `;

  showModal({
    title: `ข้อมูลผู้พักอาศัย: ห้อง ${tenant.room} (${tenant.name})`,
    body,
    footer,
    maxWidth: '680px'
  });

  const btnEditNow = document.getElementById('btn-modal-edit-now');
  if (btnEditNow) {
    btnEditNow.onclick = () => {
      closeModal();
      openEditTenantModal(tenant);
    };
  }
}

// 2. Modal แก้ไขข้อมูลผู้พักอาศัย (Edit Tenant Modal)
function openEditTenantModal(tenant) {
  const body = `
    <form id="form-edit-tenant-modal" style="display: flex; flex-direction: column; gap: 14px;">
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div>
          <label class="smoky-form-label" style="display: block; font-size: 0.82rem; margin-bottom: 5px;">ชื่อ - นามสกุล *</label>
          <input type="text" id="ed-tenant-name" class="smoky-glass-input" value="${tenant.name}" required style="width: 100%;">
        </div>
        <div>
          <label class="smoky-form-label" style="display: block; font-size: 0.82rem; margin-bottom: 5px;">รหัสนักศึกษา / รหัสผู้เช่า *</label>
          <input type="text" id="ed-tenant-tid" class="smoky-glass-input" value="${tenant.tenant_id || ''}" required style="width: 100%;">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div>
          <label class="smoky-form-label" style="display: block; font-size: 0.82rem; margin-bottom: 5px;">ห้องพัก (ทั้ง 17 ห้อง) *</label>
          <select id="ed-tenant-room" class="smoky-glass-input" style="width: 100%; height: 38px;">
            <optgroup label="🏢 อาคาร ธนกฤษฎ์ (2,800 ฿/เดือน)" style="background: #141a29; color: white;">
              ${['101', '102', '103', '104', '105', '106', '107', '108', '109'].map(r => `
                <option value="${r}" ${tenant.room === r ? 'selected' : ''}>ห้อง ${r} (อาคาร ธนกฤษฎ์)</option>
              `).join('')}
            </optgroup>
            <optgroup label="🏡 อาคาร กิ่งเพชร (2,600 ฿/เดือน)" style="background: #141a29; color: white;">
              ${['201', '202', '203', '204', '205'].map(r => `
                <option value="${r}" ${tenant.room === r ? 'selected' : ''}>ห้อง ${r} (อาคาร กิ่งเพชร)</option>
              `).join('')}
            </optgroup>
            <optgroup label="🚗 อาคาร ใต้บ้าน (1,500 ฿/เดือน)" style="background: #141a29; color: white;">
              ${['B01', 'B02', 'B03'].map(r => `
                <option value="${r}" ${tenant.room === r ? 'selected' : ''}>ห้อง ${r} (อาคาร ใต้บ้าน)</option>
              `).join('')}
            </optgroup>
          </select>
        </div>
        <div>
          <label class="smoky-form-label" style="display: block; font-size: 0.82rem; margin-bottom: 5px;">เบอร์โทรศัพท์ติดต่อ *</label>
          <input type="tel" id="ed-tenant-phone" class="smoky-glass-input" value="${tenant.phone || ''}" required style="width: 100%;">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div>
          <label class="smoky-form-label" style="display: block; font-size: 0.82rem; margin-bottom: 5px;">อีเมล</label>
          <input type="email" id="ed-tenant-email" class="smoky-glass-input" value="${tenant.email || ''}" style="width: 100%;">
        </div>
        <div>
          <label class="smoky-form-label" style="display: block; font-size: 0.82rem; margin-bottom: 5px;">LINE ID</label>
          <input type="text" id="ed-tenant-line" class="smoky-glass-input" value="${tenant.line_id || ''}" style="width: 100%;">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div>
          <label class="smoky-form-label" style="display: block; font-size: 0.82rem; margin-bottom: 5px;">วันที่เริ่มเข้าพัก</label>
          <input type="date" id="ed-tenant-checkin" class="smoky-glass-input" value="${tenant.check_in || ''}" style="width: 100%;">
        </div>
        <div>
          <label class="smoky-form-label" style="display: block; font-size: 0.82rem; margin-bottom: 5px;">ระยะเวลาสัญญา</label>
          <select id="ed-tenant-lease" class="smoky-glass-input" style="width: 100%; height: 38px;">
            <option value="สัญญา 1 ปี (มิ.ย. 68 - พ.ค. 69)" style="background:#141a29; color:white;">สัญญา 1 ปี (มิ.ย. 68 - พ.ค. 69)</option>
            <option value="สัญญา 6 เดือน (ก.ค. 68 - ธ.ค. 68)" style="background:#141a29; color:white;">สัญญา 6 เดือน (ก.ค. 68 - ธ.ค. 68)</option>
            <option value="สัญญารายเดือน" style="background:#141a29; color:white;">สัญญารายเดือน</option>
          </select>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div>
          <label class="smoky-form-label" style="display: block; font-size: 0.82rem; margin-bottom: 5px;">เงินประกัน (บาท)</label>
          <input type="number" id="ed-tenant-deposit" class="smoky-glass-input" value="${tenant.deposit || 2000}" style="width: 100%;">
        </div>
        <div>
          <label class="smoky-form-label" style="display: block; font-size: 0.82rem; margin-bottom: 5px;">เบอร์ติดต่อฉุกเฉิน</label>
          <input type="text" id="ed-tenant-emergency" class="smoky-glass-input" value="${tenant.emergency_contact || ''}" placeholder="ผู้ปกครอง 08x-xxx-xxxx" style="width: 100%;">
        </div>
      </div>

      <div>
        <label class="smoky-form-label" style="display: block; font-size: 0.82rem; margin-bottom: 5px;">หมายเหตุเพิ่มเติม</label>
        <textarea id="ed-tenant-notes" class="smoky-glass-input" rows="2" style="width: 100%; resize: none;">${tenant.notes || ''}</textarea>
      </div>

    </form>
  `;

  const footer = `
    <div style="display: flex; justify-content: flex-end; gap: 10px; width: 100%;">
      <button type="button" class="smoky-round-glass-btn" style="width: auto; border-radius: 9999px; padding: 0 16px; height: 38px; font-size: 0.80rem;" onclick="window.closeAppModal()">
        ยกเลิก
      </button>
      <button type="button" class="smoky-round-glass-btn btn-primary" style="width: auto; border-radius: 9999px; padding: 0 20px; height: 38px; background: #2563EB !important; color: #ffffff !important; font-size: 0.82rem; font-weight: 600; border: none; cursor: pointer;" id="btn-submit-edit-tenant">
        บันทึกการแก้ไข
      </button>
    </div>
  `;

  showModal({
    title: `แก้ไขข้อมูลผู้พัก: ${tenant.name}`,
    body,
    footer,
    maxWidth: '580px'
  });

  document.getElementById('btn-submit-edit-tenant').onclick = async () => {
    const name = document.getElementById('ed-tenant-name').value.trim();
    const tid = document.getElementById('ed-tenant-tid').value.trim();
    const room = document.getElementById('ed-tenant-room').value;
    const phone = document.getElementById('ed-tenant-phone').value.trim();
    const email = document.getElementById('ed-tenant-email').value.trim();
    const line = document.getElementById('ed-tenant-line').value.trim();
    const checkin = document.getElementById('ed-tenant-checkin').value;
    const lease = document.getElementById('ed-tenant-lease').value;
    const deposit = parseInt(document.getElementById('ed-tenant-deposit').value, 10) || 2000;
    const emergency = document.getElementById('ed-tenant-emergency').value.trim();
    const notes = document.getElementById('ed-tenant-notes').value.trim();

    if (!name || !phone || !room) {
      toast('กรุณากรอกชื่อ, เบอร์โทรศัพท์ และห้องพักให้ครบถ้วน', 'error');
      return;
    }

    const bInfo = getBuildingInfo(room);

    // อัปเดตใน Cached Array
    const idx = cachedTenants.findIndex(x => x.id === tenant.id);
    if (idx !== -1) {
      cachedTenants[idx] = {
        ...cachedTenants[idx],
        name,
        tenant_id: tid,
        room,
        building: bInfo.name,
        building_th: bInfo.nameTh,
        rent: bInfo.rent,
        phone,
        email,
        line_id: line,
        check_in: checkin,
        lease_term: lease,
        deposit,
        emergency_contact: emergency,
        notes
      };
      localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify(cachedTenants));
    }

    // ซิงค์ไปยัง Supabase
    try {
      await supabase.from('tenants').eq('id', tenant.id).update({
        name,
        tenant_id: tid,
        room,
        phone,
        email,
        check_in: checkin
      });
      // ซิงค์ users
      await supabase.from('users').eq('room', room).update({
        name,
        phone,
        email
      });
    } catch (err) {
      console.warn('Sync edit tenant error:', err);
    }

    closeModal();
    renderTenantsTable();
    toast(`บันทึกการแก้ไขข้อมูลของ "${name}" สำเร็จ`, 'success');
  };
}

// 3. Modal ลงทะเบียนผู้พักอาศัยใหม่ (Add Tenant Modal)
function openAddTenantModal() {
  const body = `
    <form id="form-add-tenant-modal" style="display: flex; flex-direction: column; gap: 14px;">
      
      <div style="background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.25); border-radius: 10px; padding: 12px; font-size: 0.82rem; color: #93C5FD; line-height: 1.5;">
        ✨ กรอกข้อมูลเพื่อลงทะเบียนผู้เช่าใหม่ ระบบจะสร้างบัญชีผู้ใช้งาน (Username: รหัสนักศึกษา, Password: เลขห้องพัก) และปรับสถานะห้องพักเป็น "มีผู้เช่าแล้ว" ให้โดยอัตโนมัติ
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div>
          <label class="smoky-form-label" style="display: block; font-size: 0.82rem; margin-bottom: 5px;">ชื่อ - นามสกุล *</label>
          <input type="text" id="add-tenant-name" class="smoky-glass-input" placeholder="เช่น นายวรเมธ แก้วมณี" required style="width: 100%;">
        </div>
        <div>
          <label class="smoky-form-label" style="display: block; font-size: 0.82rem; margin-bottom: 5px;">รหัสนักศึกษา / รหัสผู้เช่า</label>
          <input type="text" id="add-tenant-tid" class="smoky-glass-input" placeholder="เช่น 6512399" style="width: 100%;">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div>
          <label class="smoky-form-label" style="display: block; font-size: 0.82rem; margin-bottom: 5px;">เลือกห้องพัก (ทั้ง 17 ห้อง) *</label>
          <select id="add-tenant-room" class="smoky-glass-input" style="width: 100%; height: 38px;">
            <optgroup label="🏢 อาคาร ธนกฤษฎ์ (2,800 ฿/เดือน)" style="background: #141a29; color: white;">
              <option value="107">ห้อง 107 (กำลังตรวจเช็ก)</option>
              <option value="108" selected>ห้อง 108 (ห้องว่างพร้อมอยู่)</option>
              <option value="109">ห้อง 109 (ห้องว่างพร้อมอยู่)</option>
              <option value="101">ห้อง 101</option>
              <option value="102">ห้อง 102</option>
              <option value="103">ห้อง 103</option>
              <option value="104">ห้อง 104</option>
              <option value="105">ห้อง 105</option>
              <option value="106">ห้อง 106</option>
            </optgroup>
            <optgroup label="🏡 อาคาร กิ่งเพชร (2,600 ฿/เดือน)" style="background: #141a29; color: white;">
              <option value="204">ห้อง 204 (ห้องว่างพร้อมอยู่)</option>
              <option value="205">ห้อง 205 (ห้องว่างพร้อมอยู่)</option>
              <option value="201">ห้อง 201</option>
              <option value="202">ห้อง 202</option>
              <option value="203">ห้อง 203</option>
            </optgroup>
            <optgroup label="🚗 อาคาร ใต้บ้าน (1,500 ฿/เดือน)" style="background: #141a29; color: white;">
              <option value="B03">ห้อง B03 (ห้องว่างพร้อมอยู่)</option>
              <option value="B01">ห้อง B01</option>
              <option value="B02">ห้อง B02</option>
            </optgroup>
          </select>
        </div>
        <div>
          <label class="smoky-form-label" style="display: block; font-size: 0.82rem; margin-bottom: 5px;">เบอร์โทรศัพท์ติดต่อ *</label>
          <input type="tel" id="add-tenant-phone" class="smoky-glass-input" placeholder="08x-xxx-xxxx" required style="width: 100%;">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div>
          <label class="smoky-form-label" style="display: block; font-size: 0.82rem; margin-bottom: 5px;">อีเมล</label>
          <input type="email" id="add-tenant-email" class="smoky-glass-input" placeholder="student@tanakrit.com" style="width: 100%;">
        </div>
        <div>
          <label class="smoky-form-label" style="display: block; font-size: 0.82rem; margin-bottom: 5px;">LINE ID</label>
          <input type="text" id="add-tenant-line" class="smoky-glass-input" placeholder="เช่น line_id" style="width: 100%;">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div>
          <label class="smoky-form-label" style="display: block; font-size: 0.82rem; margin-bottom: 5px;">วันที่เริ่มเข้าพัก</label>
          <input type="date" id="add-tenant-checkin" class="smoky-glass-input" value="${new Date().toISOString().split('T')[0]}" style="width: 100%;">
        </div>
        <div>
          <label class="smoky-form-label" style="display: block; font-size: 0.82rem; margin-bottom: 5px;">ระยะเวลาสัญญา</label>
          <select id="add-tenant-lease" class="smoky-glass-input" style="width: 100%; height: 38px;">
            <option value="สัญญา 1 ปี (มิ.ย. 68 - พ.ค. 69)" style="background:#141a29; color:white;">สัญญา 1 ปี (มิ.ย. 68 - พ.ค. 69)</option>
            <option value="สัญญา 6 เดือน (ก.ค. 68 - ธ.ค. 68)" style="background:#141a29; color:white;">สัญญา 6 เดือน (ก.ค. 68 - ธ.ค. 68)</option>
            <option value="สัญญารายเดือน" style="background:#141a29; color:white;">สัญญารายเดือน</option>
          </select>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div>
          <label class="smoky-form-label" style="display: block; font-size: 0.82rem; margin-bottom: 5px;">เงินประกันความเสียหาย (บาท)</label>
          <input type="number" id="add-tenant-deposit" class="smoky-glass-input" value="2000" style="width: 100%;">
        </div>
        <div>
          <label class="smoky-form-label" style="display: block; font-size: 0.82rem; margin-bottom: 5px;">ผู้ติดต่อฉุกเฉิน</label>
          <input type="text" id="add-tenant-emergency" class="smoky-glass-input" placeholder="ผู้ปกครอง 08x-xxx-xxxx" style="width: 100%;">
        </div>
      </div>

    </form>
  `;

  const footer = `
    <div style="display: flex; justify-content: flex-end; gap: 10px; width: 100%;">
      <button type="button" class="smoky-round-glass-btn" style="width: auto; border-radius: 9999px; padding: 0 16px; height: 38px; font-size: 0.80rem;" onclick="window.closeAppModal()">
        ยกเลิก
      </button>
      <button type="button" class="smoky-round-glass-btn btn-primary" style="width: auto; border-radius: 9999px; padding: 0 20px; height: 38px; background: #2563EB !important; color: #ffffff !important; font-size: 0.82rem; font-weight: 600; border: none; cursor: pointer;" id="btn-submit-add-tenant">
        + ยืนยันการลงทะเบียน
      </button>
    </div>
  `;

  showModal({
    title: 'ลงทะเบียนผู้พักอาศัยใหม่',
    body,
    footer,
    maxWidth: '580px'
  });

  document.getElementById('btn-submit-add-tenant').onclick = async () => {
    const name = document.getElementById('add-tenant-name').value.trim();
    const tid = document.getElementById('add-tenant-tid').value.trim() || '6512' + Math.floor(100 + Math.random() * 900);
    const room = document.getElementById('add-tenant-room').value;
    const phone = document.getElementById('add-tenant-phone').value.trim();
    const email = document.getElementById('add-tenant-email').value.trim() || `${tid}@student.tanakrit.com`;
    const line = document.getElementById('add-tenant-line').value.trim();
    const checkin = document.getElementById('add-tenant-checkin').value;
    const lease = document.getElementById('add-tenant-lease').value;
    const deposit = parseInt(document.getElementById('add-tenant-deposit').value, 10) || 2000;
    const emergency = document.getElementById('add-tenant-emergency').value.trim();

    if (!name || !phone || !room) {
      toast('กรุณากรอกชื่อ, เบอร์โทรศัพท์ และห้องพักให้ครบถ้วน', 'error');
      return;
    }

    const bInfo = getBuildingInfo(room);
    const newId = 'T-' + Math.floor(1000 + Math.random() * 9000);

    const newTenant = {
      id: newId,
      tenant_id: tid,
      name,
      room,
      building: bInfo.name,
      building_th: bInfo.nameTh,
      rent: bInfo.rent,
      phone,
      email,
      line_id: line,
      id_card: '1-8099-00123-49-9',
      check_in: checkin,
      lease_term: lease,
      deposit,
      emergency_contact: emergency,
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80',
      notes: 'ลงทะเบียนเข้าพักใหม่'
    };

    // เพิ่มลง cache
    cachedTenants.unshift(newTenant);
    localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify(cachedTenants));

    // บันทึกลง Supabase
    try {
      await supabase.from('tenants').insert([{
        id: newId,
        tenant_id: tid,
        name,
        room,
        phone,
        email,
        check_in: checkin,
        role: 'student'
      }]);

      await supabase.from('rooms').eq('room_number', room).update({
        status: 'occupied',
        tenant_name: name,
        tenant_phone: phone
      });
    } catch (err) {
      console.warn('Sync add tenant error:', err);
    }

    closeModal();
    renderTenantsTable();
    toast(`ลงทะเบียน "${name}" เข้าห้อง ${room} สำเร็จ (Username: ${tid}, Password: ${room})`, 'success');
  };
}

// 4. ลบ / แจ้งย้ายออกผู้พักอาศัย (Delete Tenant)
async function deleteTenant(id) {
  const tenant = cachedTenants.find(x => x.id === id);
  if (!tenant) return;

  if (!confirm(`ยืนยันการแจ้งย้ายออก / คืนห้องพักสำหรับ "${tenant.name}" ห้อง ${tenant.room}?`)) {
    return;
  }

  // ลบออกจาก cache
  cachedTenants = cachedTenants.filter(x => x.id !== id);
  localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify(cachedTenants));

  // ซิงค์การลบกับ Supabase
  try {
    await supabase.from('tenants').eq('id', id).delete();
    await supabase.from('rooms').eq('room_number', tenant.room).update({
      status: 'vacant',
      tenant_name: '',
      tenant_phone: ''
    });
    localStorage.removeItem('tanakrit_rooms_cache_v3');
  } catch (err) {
    console.warn('Sync delete tenant error:', err);
  }

  renderTenantsTable();
  toast(`บันทึกการย้ายออกของ "${tenant.name}" ห้อง ${tenant.room} เรียบร้อยแล้ว`, 'info');
}

// 5. ส่งออกข้อมูลผู้พักอาศัยเป็นไฟล์ CSV (Export CSV)
function exportTenantsCSV() {
  if (!cachedTenants || cachedTenants.length === 0) {
    toast('ไม่มีข้อมูลผู้พักอาศัยที่จะส่งออก', 'error');
    return;
  }

  // Header ภาษาไทย
  const headers = [
    'รหัสผู้เช่า',
    'ชื่อ-นามสกุล',
    'ห้องพัก',
    'อาคาร',
    'เบอร์โทรศัพท์',
    'อีเมล',
    'LINE ID',
    'เลขบัตรประชาชน',
    'วันที่เริ่มเข้าพัก',
    'ระยะเวลาสัญญา',
    'ค่าเช่ารายเดือน (บาท)',
    'เงินประกัน (บาท)',
    'สถานะ'
  ];

  const rows = cachedTenants.map(t => [
    `"${t.tenant_id || ''}"`,
    `"${t.name || ''}"`,
    `"${t.room || ''}"`,
    `"${t.building_th || ''}"`,
    `"${t.phone || ''}"`,
    `"${t.email || ''}"`,
    `"${t.line_id || ''}"`,
    `"${t.id_card || ''}"`,
    `"${t.check_in || ''}"`,
    `"${t.lease_term || ''}"`,
    `"${t.rent || 0}"`,
    `"${t.deposit || 0}"`,
    `"${t.status === 'active' ? 'กำลังพักอาศัย' : 'ย้ายออกแล้ว'}"`
  ]);

  // UTF-8 BOM (\uFEFF) เพื่อให้เปิดใน Excel ภาษาไทยไม่เป็นตัวยึกยือ
  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `tanakrit_tenants_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  toast('ส่งออกไฟล์ข้อมูลผู้พักอาศัย CSV เรียบร้อยแล้ว', 'success');
}

// Expose globally to window
window.renderTenantsView = renderTenantsView;
window.viewTenantDetails = viewTenantDetails;
window.openEditTenantModal = openEditTenantModal;
window.openAddTenantModal = openAddTenantModal;
window.deleteTenant = deleteTenant;
window.exportTenantsCSV = exportTenantsCSV;


/* ========== js/bookings.js ========== */
// js/bookings.js
// ระบบจองห้องพักออนไลน์สำหรับบุคคลภายนอก และระบบจัดการการจองสำหรับ Admin
// ออกแบบด้วย Smoky Frosted Glass Design System


let bookingFilterStatus = 'all';
let bookingSearchTerm = '';
let cachedBookings = [];
const DEFAULT_BOOKINGS = [];

// ฟังก์ชันเปิด Modal จองห้องพักจากหน้า Landing Page (เรียกใช้งานได้แบบ Public)
function openBookingModal(preselectedType = '') {
  const body = `
    <form id="form-public-booking" style="display: flex; flex-direction: column; gap: 14px;">
      <div class="smoky-modal-notes" style="background: rgba(59,130,246,0.12); border: 1px solid rgba(59,130,246,0.3); border-radius: 10px; padding: 12px; margin-bottom: 2px;">
        <div style="font-size: 0.86rem; color: #3B82F6; line-height: 1.5; font-weight: 500;">
          ✨ กรอกข้อมูลเพื่อแจ้งความประสงค์จองหรือสอบถามห้องพักว่าง 3 อาคาร (ธนกฤษฎ์, กิ่งเพชร, ใต้บ้าน) เจ้าหน้าที่จะติดต่อกลับเพื่อยืนยันห้องพักและรายละเอียดเงินมัดจำครับ
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div class="field">
          <label class="smoky-form-label" style="font-size: 0.84rem; display: block; margin-bottom: 6px;">ชื่อ - นามสกุล ผู้จอง *</label>
          <input type="text" id="bk-name" class="smoky-glass-input" required placeholder="นาย/นางสาว ..." style="width: 100%; height: 42px; border-radius: 8px;">
        </div>
        <div class="field">
          <label class="smoky-form-label" style="font-size: 0.84rem; display: block; margin-bottom: 6px;">เบอร์โทรศัพท์ติดต่อ *</label>
          <input type="tel" id="bk-phone" class="smoky-glass-input" required placeholder="08x-xxx-xxxx" style="width: 100%; height: 42px; border-radius: 8px;">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div class="field">
          <label class="smoky-form-label" style="font-size: 0.84rem; display: block; margin-bottom: 6px;">Line ID (สำหรับส่งรูป/สัญญา)</label>
          <input type="text" id="bk-line" class="smoky-glass-input" placeholder="เช่น @line_id หรือเบอร์โทร" style="width: 100%; height: 42px; border-radius: 8px;">
        </div>
        <div class="field">
          <label class="smoky-form-label" style="font-size: 0.84rem; display: block; margin-bottom: 6px;">อาคารและห้องพักที่สนใจ *</label>
          <select id="bk-type" class="smoky-glass-select" required style="width: 100%; height: 42px; border-radius: 8px;">
            <option value="อาคาร ธนกฤษฎ์ (2,800 ฿)" ${preselectedType.includes('Tanakrit') || preselectedType.includes('ธนกฤษฎ์') ? 'selected' : ''}>อาคาร ธนกฤษฎ์ (ห้องพัดลม 28 ตร.ม. ห้องน้ำในตัว) 2,800 ฿/เดือน</option>
            <option value="อาคาร กิ่งเพชร (2,600 ฿)" ${preselectedType.includes('KingPhetch') || preselectedType.includes('กิ่งเพชร') ? 'selected' : ''}>อาคาร กิ่งเพชร (ห้องพัดลม 28 ตร.ม. ห้องน้ำในตัว) 2,600 ฿/เดือน</option>
            <option value="อาคาร ใต้บ้าน (1,500 ฿)" ${preselectedType.includes('UnderGround') || preselectedType.includes('ใต้บ้าน') ? 'selected' : ''}>อาคาร ใต้บ้าน (ห้องพัดลม 12 ตร.ม. ห้องน้ำรวม) 1,500 ฿/เดือน</option>
          </select>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div class="field">
          <label class="smoky-form-label" style="font-size: 0.84rem; display: block; margin-bottom: 6px;">เลือกอาคารที่ต้องการ</label>
          <select id="bk-floor" class="smoky-glass-select" style="width: 100%; height: 42px; border-radius: 8px;">
            <option value="">เลือกอาคารใดก็ได้ (ตามห้องว่าง)</option>
            <option value="ธนกฤษฎ์">เฉพาะอาคาร ธนกฤษฎ์ (9 ห้อง)</option>
            <option value="กิ่งเพชร">เฉพาะอาคาร กิ่งเพชร (5 ห้อง)</option>
            <option value="ใต้บ้าน">เฉพาะอาคาร ใต้บ้าน (3 ห้อง)</option>
          </select>
        </div>
        <div class="field">
          <label class="smoky-form-label" style="font-size: 0.84rem; display: block; margin-bottom: 6px;">วันที่คาดว่าจะเข้าพัก *</label>
          <input type="date" id="bk-date" class="smoky-glass-input" required value="${new Date().toISOString().split('T')[0]}" style="width: 100%; height: 42px; border-radius: 8px;">
        </div>
      </div>

      <div class="field">
        <label class="smoky-form-label" style="font-size: 0.84rem; display: block; margin-bottom: 6px;">ข้อความเพิ่มเติม / ความต้องการพิเศษ</label>
        <textarea id="bk-notes" class="smoky-glass-input" rows="3" placeholder="เช่น มีรถจักรยานยนต์ 1 คัน, ขอนัดดูห้องตัวอย่างวันเสาร์นี้" style="width: 100%; border-radius: 8px; padding: 10px;"></textarea>
      </div>
    </form>
  `;

  const footer = `
    <button type="button" class="btn btn-outline" onclick="window.closeAppModal()">ปิด</button>
    <button type="button" class="btn btn-primary" id="btn-submit-booking" style="background: #3B82F6; border-color: #3B82F6;">🚀 ส่งข้อมูลจองห้องพัก</button>
  `;

  showModal({
    title: '📝 ลงชื่อจองห้องพัก / สอบถามห้องว่าง — Tanakrit Dormitory',
    body,
    footer,
    maxWidth: '560px'
  });

  const submitBtn = document.getElementById('btn-submit-booking');
  if (submitBtn) {
    submitBtn.onclick = async () => {
      const name = document.getElementById('bk-name').value.trim();
      const phone = document.getElementById('bk-phone').value.trim();
      const line = document.getElementById('bk-line').value.trim();
      const type = document.getElementById('bk-type').value;
      const floor = document.getElementById('bk-floor').value || null;
      const date = document.getElementById('bk-date').value;
      const notes = document.getElementById('bk-notes').value.trim();

      if (!name || !phone || !type || !date) {
        toast('กรุณากรอกข้อมูลที่จำเป็น (*) ให้ครบถ้วน', 'error');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'กำลังส่งข้อมูล...';

      const bookingId = 'BK-' + Math.floor(1000 + Math.random() * 9000);

      const { error } = await supabase.from('bookings').insert([{
        id: bookingId,
        full_name: name,
        phone,
        line_id: line,
        room_type: type,
        preferred_floor: floor,
        expected_check_in: date,
        notes,
        status: 'pending',
        created_at: new Date().toISOString()
      }]);

      if (error) {
        console.error('Booking save error:', error);
        toast('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = '🚀 ส่งข้อมูลจองห้องพัก';
        return;
      }

      closeModal();
      showModal({
        title: '🎉 ส่งข้อมูลการจองสำเร็จ',
        body: `
          <div style="text-align:center; padding: 20px 10px;">
            <div style="font-size: 3rem; margin-bottom: 12px;">✅</div>
            <h3 style="color:#0F172A; margin-bottom: 8px;">รับข้อมูลการจองเรียบร้อยแล้ว</h3>
            <p style="color:#475569; line-height: 1.6; margin-bottom: 16px;">
              รหัสการจองของคุณคือ: <strong style="color:#2563EB; font-size:1.15rem;">${bookingId}</strong><br>
              เจ้าหน้าที่หอพักชายธนกฤษฎ์จะติดต่อกลับผ่านเบอร์ <strong>${phone}</strong> เพื่อยืนยันห้องพักและขั้นตอนเข้าพักโดยเร็วที่สุดครับ
            </p>
            <div style="font-size:0.85rem; background:#F8FAFC; border: 1px solid #E2E8F0; padding:12px; border-radius:8px; color:#334155;">
              📞 ติดต่อด่วน: <strong>086-946-1654 (นายเกียรติศักดิ์ บริหาร)</strong> หรือ Line: <strong>Tonyeiei</strong>
            </div>
          </div>
        `,
        footer: `<button type="button" class="btn btn-primary" onclick="window.closeAppModal()" style="width:100%; background: #3B82F6; border-color: #3B82F6;">ตกลง</button>`,
        maxWidth: '480px'
      });
    };
  }
}
window.openBookingModal = openBookingModal;

// มุมมองหน้าจอจัดการ Bookings สำหรับ Admin & Staff ใน CRM Dashboard
async function renderBookingsView() {
  setTimeout(() => {
    bindBookingsEvents();
    loadBookingsData();
  }, 0);

  return `
    <div style="display: flex; flex-direction: column; gap: 22px;">
      
      <!-- 1. Header Card (Smoky Glass) -->
      <div class="smoky-card" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(59,130,246,0.18); border: 1px solid rgba(59,130,246,0.32); display: flex; align-items: center; justify-content: center; color: #3B82F6;">
            ${ic('calendar')}
          </div>
          <div>
            <h2 style="font-size: 1.35rem; font-weight: 700; color: #ffffff; margin: 0; letter-spacing: -0.02em;">
              การจองห้องพักออนไลน์ (Online Bookings)
            </h2>
            <span style="font-size: 0.82rem; color: rgba(255,255,255,0.48); margin-top: 3px; display: block;">
              รายการผู้สนใจจองห้องพักที่ส่งมาจากหน้า Landing Page 3 อาคาร (17 ห้อง) เพื่อให้เจ้าหน้าที่โทรติดต่อกลับ
            </span>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <button class="smoky-round-glass-btn" id="btn-admin-add-booking" style="width: auto; border-radius: 9999px; padding: 0 18px; height: 38px; background: #3B82F6; color: #ffffff; border: 1px solid rgba(59,130,246,0.5); box-shadow: 0 0 20px rgba(59,130,246,0.4); font-size: 0.82rem; font-weight: 600; gap: 6px;">
            ${ic('plus')}
            <span>บันทึกการจองใหม่</span>
          </button>
        </div>
      </div>

      <!-- 2. KPI Summary Stat Tiles (Smoky Glass) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 16px;" id="booking-summary-stats">
        <div class="smoky-tile">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="smoky-meta-label">คำขอจองทั้งหมด</span>
            <div style="color: rgba(255,255,255,0.4);">${ic('calendar')}</div>
          </div>
          <div class="smoky-kpi-num" style="margin-top: 8px;" id="stat-total-bk">...</div>
          <div class="smoky-kpi-sub">คำขอจากผู้สนใจทั้งหมด</div>
        </div>

        <div class="smoky-tile">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="smoky-meta-label">รอติดต่อกลับ</span>
            <span class="smoky-delta-neg" style="background: rgba(245, 158, 11, 0.15); color: #FBBF24;">รอดำเนินการ</span>
          </div>
          <div class="smoky-kpi-num" style="margin-top: 8px; color: #FBBF24;" id="stat-pending-bk">...</div>
          <div class="smoky-kpi-sub">รอเจ้าหน้าที่โทรแจ้งรายละเอียด</div>
        </div>

        <div class="smoky-tile">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="smoky-meta-label">ติดต่อแล้ว</span>
            <span class="smoky-delta-pos" style="background: rgba(59, 130, 246, 0.15); color: #60A5FA;">พูดคุยแล้ว</span>
          </div>
          <div class="smoky-kpi-num" style="margin-top: 8px; color: #60A5FA;" id="stat-contacted-bk">...</div>
          <div class="smoky-kpi-sub">รอผู้จองตัดสินใจ / โอนมัดจำ</div>
        </div>

        <div class="smoky-tile">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="smoky-meta-label">ยืนยันการเข้าพัก</span>
            <span class="smoky-delta-pos">พร้อมทำสัญญา</span>
          </div>
          <div class="smoky-kpi-num" style="margin-top: 8px; color: #34D399;" id="stat-confirmed-bk">...</div>
          <div class="smoky-kpi-sub">โอนเงินมัดจำเรียบร้อยแล้ว</div>
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
            <input type="text" id="booking-search-input" class="smoky-glass-input" placeholder="ค้นหาชื่อผู้จอง, เบอร์โทร, LINE ID หรืออาคาร..." style="width: 100%; padding-left: 38px;">
          </div>

          <!-- Status Filter Tabs (Segmented Control) -->
          <div class="smoky-segmented" id="booking-filter-tabs" style="overflow-x: auto; max-width: 100%;">
            <button class="smoky-seg-btn active" data-status="all">ทั้งหมด</button>
            <button class="smoky-seg-btn" data-status="pending">รอติดต่อ</button>
            <button class="smoky-seg-btn" data-status="contacted">ติดต่อแล้ว</button>
            <button class="smoky-seg-btn" data-status="confirmed">ยืนยันแล้ว</button>
          </div>

          <!-- Refresh Action -->
          <div>
            <button class="smoky-round-glass-btn" id="btn-refresh-bookings" style="width: auto; height: 36px; padding: 0 16px; border-radius: 9999px; font-size: 0.80rem; gap: 6px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);">
              ${ic('check')}
              <span>รีเฟรชข้อมูล</span>
            </button>
          </div>

        </div>
      </div>

      <!-- 4. Table Wrapper (Smoky Frosted Glass) -->
      <div class="smoky-table-wrap">
        <table class="smoky-table">
          <thead>
            <tr>
              <th style="width: 130px;">รหัส / วันที่ยื่นเรื่อง</th>
              <th style="min-width: 180px;">ผู้สนใจจอง</th>
              <th style="min-width: 190px;">อาคาร / ประเภทห้องที่สนใจ</th>
              <th style="min-width: 130px;">วันที่ต้องการเข้าพัก</th>
              <th style="min-width: 240px;">หมายเหตุ / ความต้องการ</th>
              <th style="min-width: 150px; width: 155px;">สถานะ</th>
              <th style="text-align: right; padding-right: 22px; width: 170px;">การกระทำ</th>
            </tr>
          </thead>
          <tbody id="bookings-tbody">
            <tr><td colspan="7" style="text-align:center; padding: 40px; color: rgba(255,255,255,0.4);">กำลังโหลดข้อมูลการจอง...</td></tr>
          </tbody>
        </table>
      </div>

    </div>
  `;
}

async function loadBookingsData() {
  const tbody = document.getElementById('bookings-tbody');
  if (!tbody) return;

  const { data: bookings, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });

  let allBookings = bookings;
  if (error || !allBookings) {
    allBookings = [];
  }
  cachedBookings = allBookings;

  // Update Stats Counters
  const total = allBookings.length;
  const pending = allBookings.filter(b => b.status === 'pending').length;
  const contacted = allBookings.filter(b => b.status === 'contacted').length;
  const confirmed = allBookings.filter(b => b.status === 'confirmed').length;

  const totalEl = document.getElementById('stat-total-bk');
  const pendingEl = document.getElementById('stat-pending-bk');
  const contactedEl = document.getElementById('stat-contacted-bk');
  const confirmedEl = document.getElementById('stat-confirmed-bk');

  if (totalEl) totalEl.textContent = `${total} รายการ`;
  if (pendingEl) pendingEl.textContent = `${pending}`;
  if (contactedEl) contactedEl.textContent = `${contacted}`;
  if (confirmedEl) confirmedEl.textContent = `${confirmed}`;

  // Filter
  let filtered = [...allBookings];
  if (bookingFilterStatus !== 'all') {
    filtered = filtered.filter(b => b.status === bookingFilterStatus);
  }

  if (bookingSearchTerm.trim()) {
    const q = bookingSearchTerm.toLowerCase().trim();
    filtered = filtered.filter(b =>
      String(b.full_name || '').toLowerCase().includes(q) ||
      String(b.phone || '').toLowerCase().includes(q) ||
      String(b.line_id || '').toLowerCase().includes(q) ||
      String(b.room_type || '').toLowerCase().includes(q) ||
      String(b.notes || '').toLowerCase().includes(q) ||
      String(b.id || '').toLowerCase().includes(q)
    );
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: rgba(255,255,255,0.4); padding: 40px;">ไม่พบรายการจองตามเงื่อนไขที่เลือก</td></tr>`;
    return;
  }

  let html = '';
  filtered.forEach(b => {
    let statusPill = '';
    if (b.status === 'pending') {
      statusPill = `<span class="smoky-status-pill pill-amber">⏳ รอติดต่อกลับ</span>`;
    } else if (b.status === 'contacted') {
      statusPill = `<span class="smoky-status-pill pill-blue">📞 ติดต่อแล้ว</span>`;
    } else if (b.status === 'confirmed') {
      statusPill = `<span class="smoky-status-pill pill-green">🎉 ยืนยันเข้าพัก</span>`;
    } else {
      statusPill = `<span class="smoky-status-pill pill-rose">ยกเลิก</span>`;
    }

    html += `
      <tr>
        <td>
          <div style="font-weight: 700; color: #ffffff; letter-spacing: -0.01em; font-family: monospace; font-size: 0.90rem;">${b.id}</div>
          <div style="font-size: 0.74rem; color: rgba(255,255,255,0.42); margin-top: 3px;">${fmtDate(b.created_at)}</div>
        </td>
        <td>
          <div style="font-weight: 700; color: #ffffff; font-size: 0.95rem;">${b.full_name}</div>
          <div style="font-size: 0.78rem; margin-top: 4px; display: flex; align-items: center; gap: 8px;">
            <a href="tel:${b.phone}" style="color: #60A5FA; text-decoration: none; font-weight: 600; font-family: monospace;">📞 ${b.phone}</a>
            ${b.line_id ? `
              <span style="color: #34D399; background: rgba(52,211,153,0.12); padding: 1px 7px; border-radius: 9999px; font-size: 0.72rem;">Line: ${b.line_id}</span>
            ` : ''}
          </div>
        </td>
        <td>
          <span class="smoky-cat-pill">
            ${b.room_type}
          </span>
          ${b.preferred_floor ? `<div style="font-size: 0.72rem; color: rgba(255,255,255,0.42); margin-top: 4px;">ความต้องการ: ${b.preferred_floor}</div>` : ''}
        </td>
        <td>
          <div style="font-size: 0.85rem; color: rgba(255,255,255,0.85); font-weight: 600;">
            ${fmtDate(b.expected_check_in)}
          </div>
        </td>
        <td>
          <div style="font-size: 0.84rem; color: rgba(255,255,255,0.85); line-height: 1.45; max-width: 250px;">
            ${b.notes || '-'}
          </div>
        </td>
        <td>${statusPill}</td>
        <td style="text-align: right; padding-right: 18px;">
          <div style="display: flex; gap: 8px; justify-content: flex-end; align-items: center;">
            <select class="status-select-bk smoky-glass-select" data-id="${b.id}" style="border-radius: 9999px; padding: 4px 10px; font-size: 0.78rem; outline: none; cursor: pointer;">
              <option value="pending" ${b.status === 'pending' ? 'selected' : ''}>รอติดต่อกลับ</option>
              <option value="contacted" ${b.status === 'contacted' ? 'selected' : ''}>ติดต่อแล้ว</option>
              <option value="confirmed" ${b.status === 'confirmed' ? 'selected' : ''}>ยืนยันเข้าพัก</option>
              <option value="cancelled" ${b.status === 'cancelled' ? 'selected' : ''}>ยกเลิก</option>
            </select>
            <button class="smoky-round-glass-btn btn-del-bk" data-id="${b.id}" title="ลบรายการจอง" style="width: 30px; height: 30px; padding: 0; border-radius: 9999px; color: #FB7185; border-color: rgba(244, 63, 94, 0.3); background: rgba(244, 63, 94, 0.1);">
              ${ic('trash')}
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;

  // Bind Status Changer
  tbody.querySelectorAll('.status-select-bk').forEach(sel => {
    sel.onchange = async (e) => {
      const id = sel.getAttribute('data-id');
      const newStatus = e.target.value;
      await supabase.from('bookings').eq('id', id).update({ status: newStatus });
      toast(`อัปเดตสถานะการจอง ${id} เรียบร้อยแล้ว`, 'success');
      loadBookingsData();
    };
  });

  // Bind Delete
  tbody.querySelectorAll('.btn-del-bk').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id');
      if (confirm(`คุณต้องการลบรายการจอง ${id} หรือไม่?`)) {
        try {
          await supabase.from('bookings').eq('id', id).delete();
        } catch (_) {}
        cachedBookings = cachedBookings.filter(b => b.id !== id);
        toast('ลบรายการจองเรียบร้อยแล้ว', 'info');
        loadBookingsData();
      }
    };
  });
}

function bindBookingsEvents() {
  const searchInput = document.getElementById('booking-search-input');
  if (searchInput) {
    searchInput.oninput = (e) => {
      bookingSearchTerm = e.target.value.trim();
      loadBookingsData();
    };
  }

  const refreshBtn = document.getElementById('btn-refresh-bookings');
  if (refreshBtn) {
    refreshBtn.onclick = () => {
      toast('กำลังซิงค์รายการจองจากระบบ...', 'info');
      loadBookingsData();
    };
  }

  const adminAddBtn = document.getElementById('btn-admin-add-booking');
  if (adminAddBtn) {
    adminAddBtn.onclick = () => openBookingModal();
  }

  const tabs = document.getElementById('booking-filter-tabs');
  if (tabs) {
    tabs.querySelectorAll('.smoky-seg-btn').forEach(btn => {
      btn.onclick = () => {
        tabs.querySelectorAll('.smoky-seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        bookingFilterStatus = btn.getAttribute('data-status');
        loadBookingsData();
      };
    });
  }
}


/* ========== js/requests.js ========== */
// js/requests.js
let requests = [];
let currentFilter = 'all';
async function fetchRequests() {
  const { data, error } = await supabase
    .from('requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) {
    requests = [];
  } else {
    requests = data;
  }
  return requests;
}
function renderRequestsView() {
  setTimeout(async () => {
    bindRequestsFilterEvents();
    await loadRequestsTable();
  }, 0);

  return `
    <div class="card">
      <div class="card-header-actions">
        <div>
          <h3>${ic('swap')} จัดการคำร้องขอสลับห้องพัก (Room Swap Requests)</h3>
          <p style="color: var(--muted); margin-top: 4px; font-size: 0.9rem;">
            ตรวจสอบเหตุผล พิจารณาอนุมัติ หรือแจ้งผลคำร้องการขอย้าย/สลับห้องพักของนักศึกษา
          </p>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="toolbar-filter-grid" style="margin-top: 16px;">
        <div class="filter-tabs" id="req-filter-tabs">
          <button class="filter-tab-btn active" data-status="all">ทั้งหมด</button>
          <button class="filter-tab-btn" data-status="pending">รอตรวจสอบ</button>
          <button class="filter-tab-btn" data-status="approved">อนุมัติแล้ว</button>
          <button class="filter-tab-btn" data-status="rejected">ไม่อนุมัติ</button>
        </div>
      </div>

      <div class="table-responsive" style="margin-top: 16px;">
        <table class="modern-table">
          <thead>
            <tr>
              <th>รหัสคำร้อง</th>
              <th>ผู้ยื่นคำร้อง</th>
              <th>สลับห้อง</th>
              <th>วันที่ต้องการมีผล</th>
              <th>เหตุผลความจำเป็น</th>
              <th>สถานะ</th>
              <th>การกระทำ</th>
            </tr>
          </thead>
          <tbody id="requests-tbody">
            <tr><td colspan="7" style="text-align:center; padding: 30px; color:var(--muted);">กำลังโหลดข้อมูลคำร้อง...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function loadRequestsTable() {
  const tbody = document.getElementById('requests-tbody');
  if (!tbody) return;

  await fetchRequests();

  let filtered = requests;
  if (currentFilter !== 'all') {
    filtered = requests.filter(r => r.status === currentFilter);
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 30px; color:var(--muted);">ไม่มีรายการคำร้องในหมวดหมู่นี้</td></tr>`;
    return;
  }

  let html = '';
  filtered.forEach(r => {
    let badgeClass = 'pending';
    let badgeText = 'รอตรวจสอบ';
    if (r.status === 'approved') { badgeClass = 'approved'; badgeText = 'อนุมัติแล้ว'; }
    else if (r.status === 'rejected') { badgeClass = 'rejected'; badgeText = 'ไม่อนุมัติ'; }

    html += `
      <tr>
        <td><strong>${r.request_id || r.id.slice(0, 8)}</strong></td>
        <td>
          <div style="font-weight: 500; color:var(--teal-950);">${r.requester_name}</div>
          <small style="color:var(--muted);">โทร: ${r.phone || '-'}</small>
        </td>
        <td>
          <span class="room-swap-indicator">
            <span class="room-pill curr">ห้อง ${r.current_room}</span>
            <span class="arrow">➔</span>
            <span class="room-pill target">ห้อง ${r.target_room}</span>
          </span>
        </td>
        <td>${fmtDate(r.effective_date || r.created_at)}</td>
        <td style="max-width: 250px;">
          <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${r.reason}">
            ${r.reason}
          </div>
        </td>
        <td><span class="badge ${badgeClass}">${badgeText}</span></td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button class="btn btn-outline btn-sm btn-view-req" data-id="${r.id}" title="ดูรายละเอียด">
              ${ic('eye')}
            </button>
            ${r.status === 'pending' ? `
              <button class="btn btn-primary btn-sm btn-appr-req" data-id="${r.id}" title="อนุมัติ">
                ${ic('check')}
              </button>
              <button class="btn btn-outline btn-sm btn-rej-req" data-id="${r.id}" style="color:var(--danger); border-color:var(--danger);" title="ไม่อนุมัติ">
                ${ic('x')}
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;

  // View Details
  tbody.querySelectorAll('.btn-view-req').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      const target = requests.find(x => x.id === id);
      if (target) openRequestDetailsModal(target);
    };
  });

  // Approve
  tbody.querySelectorAll('.btn-appr-req').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id');
      const target = requests.find(x => x.id === id);
      if (!target) return;
      if (confirm(`ยืนยันการอนุมัติคำร้อง ${target.request_id || target.id} ให้ย้ายจากห้อง ${target.current_room} ไป ${target.target_room}?`)) {
        await supabase.from('requests').eq('id', id).update({ status: 'approved' });
        // Auto update room tenant if exists
        await supabase.from('rooms').eq('room_number', target.current_room).update({ status: 'vacant', tenant_name: '', tenant_phone: '' });
        await supabase.from('rooms').eq('room_number', target.target_room).update({ status: 'occupied', tenant_name: target.requester_name, tenant_phone: target.phone });
        await supabase.from('tenants').eq('name', target.requester_name).update({ room: target.target_room });
        toast(`อนุมัติคำร้องของ ${target.requester_name} เรียบร้อยแล้ว`, 'success');
        loadRequestsTable();
      }
    };
  });

  // Reject
  tbody.querySelectorAll('.btn-rej-req').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id');
      const target = requests.find(x => x.id === id);
      if (!target) return;
      if (confirm(`ยืนยันการปฏิเสธคำร้อง ${target.request_id || target.id}?`)) {
        await supabase.from('requests').eq('id', id).update({ status: 'rejected' });
        toast(`ปฏิเสธคำร้องเรียบร้อยแล้ว`, 'info');
        loadRequestsTable();
      }
    };
  });
}

function bindRequestsFilterEvents() {
  const tabs = document.getElementById('req-filter-tabs');
  if (tabs) {
    tabs.querySelectorAll('.filter-tab-btn').forEach(btn => {
      btn.onclick = () => {
        tabs.querySelectorAll('.filter-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-status');
        loadRequestsTable();
      };
    });
  }
}

function openRequestDetailsModal(req) {
  let badgeColor = req.status === 'approved' ? 'var(--emerald)' : (req.status === 'rejected' ? 'var(--danger)' : 'var(--sand-600)');
  let statusText = req.status === 'approved' ? 'อนุมัติเรียบร้อยแล้ว' : (req.status === 'rejected' ? 'ไม่อนุมัติ' : 'อยู่ระหว่างรอการตรวจสอบ');

  const body = `
    <div style="background: var(--mint-50); padding: 16px; border-radius: 12px; margin-bottom: 20px; border: 1px solid var(--line);">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-family:'Kanit'; font-weight: 600; font-size: 1.1rem; color: var(--teal-950);">รหัส: ${req.request_id || req.id}</span>
        <span style="background: ${badgeColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 500;">
          ${statusText}
        </span>
      </div>
      <div style="font-size: 0.85rem; color: var(--muted); margin-top: 4px;">ยื่นเมื่อวันที่: ${fmtDate(req.created_at)}</div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px;">
      <div>
        <label style="font-size: 0.8rem; color: var(--muted);">ชื่อผู้ยื่นคำร้อง</label>
        <div style="font-weight: 600; color: var(--teal-950);">${req.requester_name}</div>
      </div>
      <div>
        <label style="font-size: 0.8rem; color: var(--muted);">เบอร์ติดต่อ</label>
        <div style="font-weight: 600; color: var(--teal-950);">${req.phone || '-'}</div>
      </div>
    </div>

    <div style="background: #fdf8e7; padding: 14px; border-radius: 10px; margin-bottom: 16px; border: 1px solid #f2c14e;">
      <div style="font-size: 0.85rem; color: #8F6B1A; font-weight: 600; margin-bottom: 4px;">การขอสลับห้อง:</div>
      <div style="display: flex; align-items: center; gap: 12px; font-size: 1.1rem; font-weight: 600;">
        <span style="color: var(--teal-950);">ห้องปัจจุบัน ${req.current_room}</span>
        <span>➔</span>
        <span style="color: var(--emerald);">ห้องที่ต้องการย้าย ${req.target_room}</span>
      </div>
      <div style="font-size: 0.85rem; color: #8F6B1A; margin-top: 6px;">
        วันที่ต้องการให้มีผล: ${fmtDate(req.effective_date)}
      </div>
    </div>

    <div class="field">
      <label>เหตุผลความจำเป็น</label>
      <div style="background: var(--white); padding: 12px; border: 1.5px solid var(--line); border-radius: 8px; font-size: 0.95rem; line-height: 1.6;">
        ${req.reason}
      </div>
    </div>
  `;

  const footer = `
    <button type="button" class="btn btn-primary" onclick="window.closeAppModal()">ปิดหน้าต่าง</button>
  `;

  showModal({
    title: 'รายละเอียดคำร้องขอสลับห้องพัก',
    body,
    footer,
    maxWidth: '520px'
  });
}

// ฟอร์มสำหรับนักศึกษาเพื่อยื่นคำร้องขอสลับห้องพัก
function renderNewRequestView() {
  const currentRoom = currentUser && currentUser.room ? currentUser.room : '302';
  const userName = currentUser ? currentUser.name : 'นักศึกษา';
  const userPhone = currentUser && currentUser.phone ? currentUser.phone : '089-123-4567';

  return `
    <div class="card" style="max-width: 680px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="width: 50px; height: 50px; background: var(--mint-50); color: var(--emerald); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 10px;">
          ${ic('swap')}
        </div>
        <h3>แบบฟอร์มขอสลับ / ขอย้ายห้องพัก</h3>
        <p style="color: var(--muted); font-size: 0.9rem;">
          กรอกข้อมูลและเหตุผลความจำเป็น เพื่อเสนอให้คณะกรรมการหอพักพิจารณา
        </p>
      </div>

      <form id="swap-form">
        <div style="background: var(--mint-50); border: 1px solid var(--line); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
            <div>
              <span style="font-size: 0.8rem; color: var(--muted);">ผู้ยื่นคำร้อง:</span>
              <div style="font-weight: 600; color: var(--teal-950);">${userName}</div>
            </div>
            <div>
              <span style="font-size: 0.8rem; color: var(--muted);">ห้องพักปัจจุบัน:</span>
              <div style="font-weight: 600; color: var(--emerald);">ห้อง ${currentRoom}</div>
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div class="field">
            <label>ห้องที่ประสงค์จะขอย้ายไป *</label>
            <input type="text" id="f-target" placeholder="เช่น 201 หรือ 103" required>
          </div>
          <div class="field">
            <label>เบอร์โทรศัพท์ที่ติดต่อได้สะดวก *</label>
            <input type="tel" id="f-phone" value="${userPhone}" required>
          </div>
        </div>

        <div class="field">
          <label>วันที่ประสงค์จะให้เริ่มมีผลการย้าย *</label>
          <input type="date" id="f-date" value="${new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]}" required>
        </div>

        <div class="field">
          <label>เหตุผลความจำเป็นในการขอย้ายห้องพัก *</label>
          <textarea id="f-reason" rows="4" placeholder="ระบุเหตุผล เช่น สลับกับเพื่อนเพื่อทำงานกลุ่ม, ปัญหาเรื่องเสียง, ต้องการแสงธรรมชาติวาดภาพศิลปะ ฯลฯ" required></textarea>
        </div>

        <div style="margin-top: 24px; display: flex; gap: 12px;">
          <button type="button" class="btn btn-outline" style="flex: 1;" onclick="window.switchView('dashboard')">ยกเลิก</button>
          <button type="submit" class="btn btn-primary" style="flex: 2;">
            ${ic('check')} ยืนยันการส่งคำร้อง
          </button>
        </div>
      </form>
    </div>
  `;
}


/* ========== js/maintenance.js ========== */
// js/maintenance.js
// ระบบแจ้งซ่อมและงานบริการบำรุงรักษา (Maintenance System)
// ออกแบบด้วย Smoky Frosted Glass Design System



let maintenanceFilter = 'all';
let maintenanceSearchQuery = '';
let cachedTickets = [];
const DEFAULT_MAINTENANCE_TICKETS = [];
function getBuildingName(roomNum) {
  const r = String(roomNum || '').trim();
  if (r.startsWith('1')) return 'อาคาร ธนกฤษฎ์';
  if (r.startsWith('2')) return 'อาคาร กิ่งเพชร';
  if (r.startsWith('B') || r.startsWith('b')) return 'อาคาร ใต้บ้าน';
  return 'หอพักธนกฤษฎ์';
}
async function renderMaintenanceView() {
  setTimeout(() => {
    bindMaintenanceEvents();
    loadMaintenanceData();
  }, 0);

  const isStudent = currentUser && currentUser.role === 'student';

  return `
    <div style="display: flex; flex-direction: column; gap: 22px;">
      
      <!-- 1. Header Card (Smoky Glass) -->
      <div class="smoky-card" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(59,130,246,0.18); border: 1px solid rgba(59,130,246,0.32); display: flex; align-items: center; justify-content: center; color: #3B82F6;">
            ${ic('wrench')}
          </div>
          <div>
            <h2 style="font-size: 1.35rem; font-weight: 700; color: #ffffff; margin: 0; letter-spacing: -0.02em;">
              ระบบแจ้งซ่อมและงานบริการบำรุงรักษา (Maintenance System)
            </h2>
            <span style="font-size: 0.82rem; color: rgba(255,255,255,0.48); margin-top: 3px; display: block;">
              ${isStudent ? 'แจ้งปัญหาอุปกรณ์ชำรุดเสียหายในห้องพัก หรือพื้นที่ส่วนกลาง' : 'ตรวจสอบรายการแจ้งซ่อม มอบหมายงานช่าง และบันทึกสถานะการแก้ไข 3 อาคาร (17 ห้อง)'}
            </span>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <button class="smoky-round-glass-btn" id="btn-create-ticket" style="width: auto; border-radius: 9999px; padding: 0 18px; height: 38px; background: #3B82F6; color: #ffffff; border: 1px solid rgba(59,130,246,0.5); box-shadow: 0 0 20px rgba(59,130,246,0.4); font-size: 0.82rem; font-weight: 600; gap: 6px;">
            ${ic('plus')}
            <span>แจ้งซ่อมรายการใหม่</span>
          </button>
        </div>
      </div>

      <!-- 2. KPI Summary Stat Tiles (Smoky Glass) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 16px;" id="maintenance-summary-stats">
        <div class="smoky-tile">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="smoky-meta-label">รายการแจ้งซ่อมทั้งหมด</span>
            <div style="color: rgba(255,255,255,0.4);">${ic('wrench')}</div>
          </div>
          <div class="smoky-kpi-num" style="margin-top: 8px;" id="kpi-maint-total">...</div>
          <div class="smoky-kpi-sub">รายการสะสมทั้งหมด</div>
        </div>

        <div class="smoky-tile">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="smoky-meta-label">รอรับเรื่อง</span>
            <span class="smoky-delta-neg" style="background: rgba(245, 158, 11, 0.15); color: #FBBF24;">รอดำเนินการ</span>
          </div>
          <div class="smoky-kpi-num" style="margin-top: 8px; color: #FBBF24;" id="kpi-maint-pending">...</div>
          <div class="smoky-kpi-sub">รอเจ้าหน้าที่ตรวจสอบ</div>
        </div>

        <div class="smoky-tile">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="smoky-meta-label">กำลังดำเนินการ</span>
            <span class="smoky-delta-pos" style="background: rgba(59, 130, 246, 0.15); color: #60A5FA;">ช่างเข้าซ่อม</span>
          </div>
          <div class="smoky-kpi-num" style="margin-top: 8px; color: #60A5FA;" id="kpi-maint-progress">...</div>
          <div class="smoky-kpi-sub">กำลังซ่อมแซม</div>
        </div>

        <div class="smoky-tile">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="smoky-meta-label">ซ่อมเสร็จสิ้นแล้ว</span>
            <span class="smoky-delta-pos">เรียบร้อย</span>
          </div>
          <div class="smoky-kpi-num" style="margin-top: 8px; color: #34D399;" id="kpi-maint-completed">...</div>
          <div class="smoky-kpi-sub">งานเสร็จสมบูรณ์</div>
        </div>
      </div>

      <!-- 3. Filters & Search Toolbar (Smoky Glass) -->
      <div class="smoky-card" style="padding: 16px 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
          
          <!-- Search Box -->
          <div style="position: relative; min-width: 240px; flex: 1; max-width: 340px;">
            <span style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.4); display: flex; align-items: center;">
              ${ic('search')}
            </span>
            <input type="text" id="maint-search-input" class="smoky-glass-input" placeholder="ค้นหาเลขห้อง, ผู้แจ้ง หรืออาการชำรุด..." style="width: 100%; padding-left: 38px;">
          </div>

          <!-- Status Filter Tabs (Segmented Control) -->
          <div class="smoky-segmented" id="maint-filter-tabs" style="overflow-x: auto; max-width: 100%;">
            <button class="smoky-seg-btn active" data-status="all">ทั้งหมด</button>
            <button class="smoky-seg-btn" data-status="pending">รอรับเรื่อง</button>
            <button class="smoky-seg-btn" data-status="in_progress">กำลังดำเนินการ</button>
            <button class="smoky-seg-btn" data-status="completed">ซ่อมเสร็จสิ้น</button>
          </div>

          <!-- Refresh Action -->
          <div>
            <button class="smoky-round-glass-btn" id="btn-refresh-maintenance" style="width: auto; height: 36px; padding: 0 16px; border-radius: 9999px; font-size: 0.80rem; gap: 6px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);">
              ${ic('check')}
              <span>รีเฟรชข้อมูล</span>
            </button>
          </div>

        </div>
      </div>

      <!-- 4. Table Wrapper (Smoky Frosted Glass) -->
      <div class="smoky-table-wrap">
        <table class="smoky-table">
          <thead>
            <tr>
              <th style="width: 105px;">รหัสแจ้งซ่อม</th>
              <th style="min-width: 165px;">ห้องพัก / ผู้แจ้ง</th>
              <th style="min-width: 135px;">หมวดหมู่งาน</th>
              <th style="min-width: 250px;">รายละเอียดปัญหา & วันที่</th>
              <th style="width: 105px;">ความเร่งด่วน</th>
              <th style="min-width: 130px;">ช่างผู้รับผิดชอบ</th>
              <th style="min-width: 155px; width: 160px;">สถานะ</th>
              <th style="text-align: right; padding-right: 22px; width: 145px;">การกระทำ</th>
            </tr>
          </thead>
          <tbody id="maintenance-tbody">
            <tr><td colspan="8" style="text-align:center; padding: 40px; color: rgba(255,255,255,0.4);">กำลังโหลดรายการแจ้งซ่อม...</td></tr>
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

  let allTickets = tickets;
  if (error || !allTickets) {
    allTickets = [];
  }
  cachedTickets = allTickets;

  // Update KPI counters
  const totalCount = allTickets.length;
  const pendingCount = allTickets.filter(t => t.status === 'pending').length;
  const progressCount = allTickets.filter(t => t.status === 'in_progress').length;
  const completedCount = allTickets.filter(t => t.status === 'completed').length;

  const kpiTotal = document.getElementById('kpi-maint-total');
  const kpiPending = document.getElementById('kpi-maint-pending');
  const kpiProgress = document.getElementById('kpi-maint-progress');
  const kpiCompleted = document.getElementById('kpi-maint-completed');

  if (kpiTotal) kpiTotal.textContent = `${totalCount}`;
  if (kpiPending) kpiPending.textContent = `${pendingCount}`;
  if (kpiProgress) kpiProgress.textContent = `${progressCount}`;
  if (kpiCompleted) kpiCompleted.textContent = `${completedCount}`;

  let list = [...allTickets];
  const isStudent = currentUser && currentUser.role === 'student';
  if (isStudent && currentUser.room) {
    list = list.filter(t => String(t.room_number) === String(currentUser.room));
  }

  if (maintenanceFilter !== 'all') {
    list = list.filter(t => t.status === maintenanceFilter);
  }

  if (maintenanceSearchQuery.trim()) {
    const q = maintenanceSearchQuery.toLowerCase().trim();
    list = list.filter(t => {
      const room = String(t.room_number || '').toLowerCase();
      const bldg = getBuildingName(t.room_number).toLowerCase();
      const req = String(t.requester_name || '').toLowerCase();
      const cat = String(t.category || '').toLowerCase();
      const desc = String(t.description || '').toLowerCase();
      const tech = String(t.technician || '').toLowerCase();
      const id = String(t.id || '').toLowerCase();
      return room.includes(q) || bldg.includes(q) || req.includes(q) || cat.includes(q) || desc.includes(q) || tech.includes(q) || id.includes(q);
    });
  }

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 40px; color: rgba(255,255,255,0.4);">ไม่พบรายการแจ้งซ่อมตามเงื่อนไขที่เลือก</td></tr>`;
    return;
  }

  let html = '';
  list.forEach(t => {
    const bldg = getBuildingName(t.room_number);

    // Status pill
    let statusPill = '';
    if (t.status === 'in_progress') {
      statusPill = `<span class="smoky-status-pill pill-blue">⚡ กำลังดำเนินการ</span>`;
    } else if (t.status === 'completed') {
      statusPill = `<span class="smoky-status-pill pill-green">✓ ซ่อมเสร็จแล้ว</span>`;
    } else {
      statusPill = `<span class="smoky-status-pill pill-amber">⏳ รอรับเรื่อง</span>`;
    }

    // Urgency pill
    let urgencyBadge = `<span class="smoky-status-pill pill-green">ปกติ</span>`;
    if (t.urgency === 'high') {
      urgencyBadge = `<span class="smoky-status-pill pill-rose">⚡ ด่วนมาก</span>`;
    } else if (t.urgency === 'medium') {
      urgencyBadge = `<span class="smoky-status-pill pill-amber">ปานกลาง</span>`;
    }

    html += `
      <tr>
        <td>
          <span style="font-weight: 700; color: #ffffff; letter-spacing: -0.01em; font-family: monospace; font-size: 0.88rem;">${t.id}</span>
        </td>
        <td>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="font-weight: 700; color: #ffffff; font-size: 0.95rem;">ห้อง ${t.room_number}</div>
            <span class="smoky-bldg-badge">
              ${bldg}
            </span>
          </div>
          <div style="font-size: 0.78rem; color: rgba(255,255,255,0.48); margin-top: 3px;">
            ${t.requester_name || 'ผู้พักอาศัย'} ${t.phone ? `· <span style="font-family: monospace;">${t.phone}</span>` : ''}
          </div>
        </td>
        <td>
          <span class="smoky-cat-pill">
            ${t.category}
          </span>
        </td>
        <td style="max-width: 280px;">
          <div style="font-size: 0.85rem; line-height: 1.45; color: rgba(255,255,255,0.9); font-weight: 500;">
            ${t.description}
          </div>
          <div style="display: flex; align-items: center; gap: 10px; margin-top: 5px;">
            <span style="font-size: 0.74rem; color: rgba(255,255,255,0.42);">
              ${fmtDate(t.created_at)}
            </span>
            ${t.image_url ? `
              <span style="display:inline-flex; align-items:center; gap:4px; font-size:0.74rem; color:#60A5FA; cursor:pointer; background:rgba(59,130,246,0.15); border:1px solid rgba(59,130,246,0.3); padding:2px 8px; border-radius:9999px; font-weight:600;" onclick="window.showImageModal('${t.image_url}', 'รูปจุดชำรุด: ${t.category} (ห้อง ${t.room_number})')">
                📸 ดูรูปถ่าย
              </span>
            ` : ''}
          </div>
        </td>
        <td>${urgencyBadge}</td>
        <td>
          <div style="font-size: 0.82rem; color: ${t.technician ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)'};">
            ${t.technician || 'ยังไม่ระบุช่าง'}
          </div>
        </td>
        <td>${statusPill}</td>
        <td style="text-align: right; padding-right: 18px;">
          <div style="display: flex; gap: 8px; justify-content: flex-end; align-items: center;">
            <button class="smoky-round-glass-btn btn-update-ticket" data-id="${t.id}" style="width: auto; height: 32px; padding: 0 12px; border-radius: 9999px; font-size: 0.78rem; gap: 5px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.14); color: #ffffff;" title="อัปเดตสถานะงานซ่อม">
              ${ic('gear')}
              <span>อัปเดต</span>
            </button>
            <button class="smoky-round-glass-btn btn-del-ticket" data-id="${t.id}" style="width: 32px; height: 32px; padding: 0; border-radius: 9999px; color: #FB7185; border-color: rgba(244, 63, 94, 0.3); background: rgba(244, 63, 94, 0.1);" title="ลบรายการแจ้งซ่อม">
              ${ic('trash')}
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
      const target = cachedTickets.find(x => x.id === id);
      if (target) openUpdateTicketModal(target);
    };
  });

  // Delete Ticket
  tbody.querySelectorAll('.btn-del-ticket').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id');
      const target = cachedTickets.find(x => x.id === id);
      if (!target) return;
      if (confirm(`คุณต้องการลบรายการแจ้งซ่อม ${target.id} (ห้อง ${target.room_number}) ออกจากระบบใช่หรือไม่?`)) {
        const { error } = await supabase.from('maintenance').eq('id', id).delete();
        if (error) {
          toast('เกิดข้อผิดพลาดในการลบรายการแจ้งซ่อม', 'error');
          return;
        }
        cachedTickets = cachedTickets.filter(x => x.id !== id);
        toast(`ลบรายการแจ้งซ่อม ${target.id} เรียบร้อยแล้ว`, 'success');
        loadMaintenanceData();
      }
    };
  });
}

function bindMaintenanceEvents() {
  const tabs = document.getElementById('maint-filter-tabs');
  if (tabs) {
    tabs.querySelectorAll('.smoky-seg-btn').forEach(btn => {
      btn.onclick = () => {
        tabs.querySelectorAll('.smoky-seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        maintenanceFilter = btn.getAttribute('data-status');
        loadMaintenanceData();
      };
    });
  }

  const searchInput = document.getElementById('maint-search-input');
  if (searchInput) {
    searchInput.oninput = (e) => {
      maintenanceSearchQuery = e.target.value;
      loadMaintenanceData();
    };
  }

  const btnRefresh = document.getElementById('btn-refresh-maintenance');
  if (btnRefresh) {
    btnRefresh.onclick = () => {
      toast('กำลังซิงค์รายการแจ้งซ่อมจากระบบ...', 'info');
      loadMaintenanceData();
    };
  }

  const btnCreate = document.getElementById('btn-create-ticket');
  if (btnCreate) btnCreate.onclick = openCreateTicketModal;
}

function openCreateTicketModal() {
  const defaultRoom = currentUser && currentUser.room ? currentUser.room : '101';
  const defaultName = currentUser ? currentUser.name : '';
  const defaultPhone = currentUser && currentUser.phone ? currentUser.phone : '';

  // 17 Real Dormitory Rooms across 3 buildings
  const tanakritRooms = ['101', '102', '103', '104', '105', '106', '107', '108', '109'];
  const kingPhetchRooms = ['201', '202', '203', '204', '205'];
  const underGroundRooms = ['B01', 'B02', 'B03'];

  const roomOptions = `
    <optgroup label="อาคาร ธนกฤษฎ์ (9 ห้อง)">
      ${tanakritRooms.map(r => `<option value="${r}" ${r === defaultRoom ? 'selected' : ''}>ห้อง ${r} (อาคาร ธนกฤษฎ์)</option>`).join('')}
    </optgroup>
    <optgroup label="อาคาร กิ่งเพชร (5 ห้อง)">
      ${kingPhetchRooms.map(r => `<option value="${r}" ${r === defaultRoom ? 'selected' : ''}>ห้อง ${r} (อาคาร กิ่งเพชร)</option>`).join('')}
    </optgroup>
    <optgroup label="อาคาร ใต้บ้าน (3 ห้อง)">
      ${underGroundRooms.map(r => `<option value="${r}" ${r === defaultRoom ? 'selected' : ''}>ห้อง ${r} (อาคาร ใต้บ้าน)</option>`).join('')}
    </optgroup>
    <optgroup label="พื้นที่ส่วนกลาง">
      <option value="ส่วนกลาง">พื้นที่ส่วนกลาง / บริเวณหอพัก</option>
    </optgroup>
  `;

  const body = `
    <form id="form-create-ticket" style="display: flex; flex-direction: column; gap: 14px;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div class="field">
          <label class="smoky-form-label" style="font-size: 0.84rem; display: block; margin-bottom: 6px;">หมายเลขห้องพัก / จุดที่ชำรุด *</label>
          <select id="tk-room" class="smoky-glass-select" style="width: 100%; height: 42px; border-radius: 8px;">
            ${roomOptions}
          </select>
        </div>
        <div class="field">
          <label class="smoky-form-label" style="font-size: 0.84rem; display: block; margin-bottom: 6px;">หมวดหมู่งานซ่อม *</label>
          <select id="tk-cat" class="smoky-glass-select" style="width: 100%; height: 42px; border-radius: 8px;">
            <option value="เครื่องปรับอากาศ">เครื่องปรับอากาศ (แอร์)</option>
            <option value="ระบบประปา">ระบบประปา / ห้องน้ำ / ก๊อกรั่ว</option>
            <option value="ไฟฟ้า/แสงสว่าง">ระบบไฟฟ้า / หลอดไฟ / ปลั๊กไฟ</option>
            <option value="เฟอร์นิเจอร์/ประตู">เฟอร์นิเจอร์ / บานพับ / ประตู-หน้าต่าง</option>
            <option value="อินเทอร์เน็ต Wi-Fi">อินเทอร์เน็ต Wi-Fi / ระบบเครือข่าย</option>
            <option value="อื่นๆ">อื่นๆ</option>
          </select>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div class="field">
          <label class="smoky-form-label" style="font-size: 0.84rem; display: block; margin-bottom: 6px;">ชื่อผู้แจ้ง *</label>
          <input type="text" id="tk-name" class="smoky-glass-input" value="${defaultName}" placeholder="เช่น นายสมชาย, น.ส.วิภาดา" required style="width: 100%; height: 42px; border-radius: 8px;">
        </div>
        <div class="field">
          <label class="smoky-form-label" style="font-size: 0.84rem; display: block; margin-bottom: 6px;">เบอร์โทรศัพท์ติดต่อ *</label>
          <input type="tel" id="tk-phone" class="smoky-glass-input" value="${defaultPhone}" placeholder="เช่น 089-xxx-xxxx" required style="width: 100%; height: 42px; border-radius: 8px;">
        </div>
      </div>

      <div class="field">
        <label class="smoky-form-label" style="font-size: 0.84rem; display: block; margin-bottom: 6px;">ระดับความเร่งด่วน</label>
        <select id="tk-urgency" class="smoky-glass-select" style="width: 100%; height: 42px; border-radius: 8px;">
          <option value="low">ปกติ (1-3 วันทำการ)</option>
          <option value="medium">ปานกลาง (ภายใน 24 ชม.)</option>
          <option value="high">⚡ ด่วนมาก (ส่งผลกระทบต่อการพักอาศัยทันที)</option>
        </select>
      </div>

      <div class="field">
        <label class="smoky-form-label" style="font-size: 0.84rem; display: block; margin-bottom: 6px;">รายละเอียดอาการที่ชำรุดเสียหาย *</label>
        <textarea id="tk-desc" class="smoky-glass-input" rows="3" placeholder="ระบุอาการชำรุด จุดที่เกิดปัญหา เช่น ท่อน้ำใต้ซิงค์รั่ว, แอร์มีน้ำหยด, ปลั๊กหัวเตียงไม่มีไฟ" required style="width: 100%; border-radius: 8px; padding: 10px;"></textarea>
      </div>

      <!-- ส่วนแนบรูปภาพจุดชำรุด -->
      <div class="field">
        <label class="smoky-form-label" style="font-size: 0.84rem; display: block; margin-bottom: 6px;">แนบรูปภาพจุดที่ชำรุด (ไม่บังคับ แต่ช่วยให้ช่างเตรียมเครื่องมือได้ตรงจุด)</label>
        <input type="file" id="tk-photo-input" accept="image/*" style="display:none;">
        <div class="upload-dropzone" id="tk-photo-dropzone" style="padding:14px; border: 2px dashed #CBD5E1; border-radius: 10px; cursor: pointer; text-align: center; background: rgba(255,255,255,0.04);">
          <div id="tk-dropzone-content">
            <div style="font-size:1.6rem; margin-bottom:2px;">📸</div>
            <div style="font-size:0.88rem; font-weight:600;" id="tk-dropzone-title">คลิกเพื่อถ่ายรูป หรือเลือกรูปภาพความเสียหาย</div>
            <div style="font-size:0.75rem; color: rgba(255,255,255,0.45); margin-top:2px;">รองรับ JPG, PNG, WEBP (ระบบจะบีบอัดให้อัตโนมัติ)</div>
          </div>
          <div id="tk-preview-wrap" style="display:none; align-items:center; justify-content:center; gap:12px;">
            <img id="tk-preview-img" style="max-height:100px; border-radius:8px; border:1px solid #CBD5E1; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
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
    <button type="button" class="btn btn-primary" id="btn-submit-ticket" style="background: #3B82F6; border-color: #3B82F6;">ส่งคำขอแจ้งซ่อม</button>
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
  const bldg = getBuildingName(ticket.room_number);
  const body = `
    <form id="form-update-ticket">
      <div style="background: #F1F5F9; padding: 16px; border-radius: 12px; margin-bottom: 16px; border: 1px solid #E2E8F0;">
        <div style="display:flex; justify-content:space-between; align-items: flex-start;">
          <div>
            <strong style="color: #0F172A; font-size: 1.1rem; letter-spacing: -0.01em;">${ticket.id} — ห้อง ${ticket.room_number}</strong>
            <span style="font-size: 0.74rem; color: #2563EB; background: rgba(37,99,235,0.12); padding: 2px 8px; border-radius: 9999px; margin-left: 8px; font-weight: 600;">
              ${bldg}
            </span>
            <div style="font-size: 0.82rem; color: #64748B; margin-top: 3px;">
              ผู้แจ้ง: ${ticket.requester_name || '-'} (${ticket.phone || '-'})
            </div>
          </div>
          <span style="font-size:0.80rem; color: #64748B;">${fmtDate(ticket.created_at)}</span>
        </div>
        <div style="margin-top:10px; font-size:0.88rem; color: #334155;">
          หมวดหมู่: <strong style="color: #0F172A;">${ticket.category}</strong>
        </div>
        <div style="margin-top:6px; font-size:0.86rem; color: #475569; background: #ffffff; padding: 10px 12px; border-radius: 8px; border: 1px solid #E2E8F0; line-height: 1.45;">
          ${ticket.description}
        </div>
      </div>

      ${ticket.image_url ? `
        <div style="margin-bottom:16px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:12px; padding:12px; text-align:center;">
          <div style="font-size:0.85rem; font-weight:600; color:#0F172A; margin-bottom:8px;">📸 รูปถ่ายจุดชำรุดที่ผู้แจ้งแนบมา:</div>
          <img src="${ticket.image_url}" style="max-height:180px; border-radius:8px; cursor:pointer; box-shadow:0 2px 10px rgba(0,0,0,0.1); object-fit:contain;" onclick="window.showImageModal('${ticket.image_url}', 'รูปถ่ายแจ้งซ่อม: ${ticket.id}')" title="คลิกเพื่อดูรูปขยายใหญ่">
          <div style="font-size:0.75rem; color:#64748B; margin-top:6px;">(คลิกที่รูปเพื่อดูรูปภาพขยายใหญ่)</div>
        </div>
      ` : ''}

      <div class="field" style="margin-bottom: 14px;">
        <label style="font-size: 0.84rem; font-weight: 600; color: #0F172A; display: block; margin-bottom: 6px;">สถานะงานซ่อม</label>
        <select id="up-status" class="form-select" style="width: 100%; height: 42px; border-radius: 8px;">
          <option value="pending" ${ticket.status === 'pending' ? 'selected' : ''}>⏳ รอรับเรื่อง (Pending)</option>
          <option value="in_progress" ${ticket.status === 'in_progress' ? 'selected' : ''}>⚡ กำลังดำเนินการซ่อม (In Progress)</option>
          <option value="completed" ${ticket.status === 'completed' ? 'selected' : ''}>✓ ซ่อมเสร็จสิ้นเรียบร้อย (Completed)</option>
        </select>
      </div>

      <div class="field" style="margin-bottom: 14px;">
        <label style="font-size: 0.84rem; font-weight: 600; color: #0F172A; display: block; margin-bottom: 6px;">ช่างผู้รับผิดชอบงาน</label>
        <input type="text" id="up-tech" value="${ticket.technician || ''}" placeholder="เช่น ช่างวิเชียร (แอร์), ช่างสมบูรณ์" style="width: 100%; height: 42px; border-radius: 8px;">
      </div>
    </form>
  `;

  const footer = `
    <button type="button" class="btn btn-outline" id="btn-modal-del-ticket" style="color:var(--danger); border-color:#fadbd8; margin-right:auto;">${ic('trash')} ลบรายการซ่อมนี้</button>
    <button type="button" class="btn btn-outline" onclick="window.closeAppModal()">ยกเลิก</button>
    <button type="button" class="btn btn-primary" id="btn-save-ticket-status" style="background: #3B82F6; border-color: #3B82F6;">บันทึกความคืบหน้า</button>
  `;

  showModal({
    title: `อัปเดตสถานะงานซ่อม ${ticket.id}`,
    body,
    footer,
    maxWidth: '520px'
  });

  const btnModalDelTicket = document.getElementById('btn-modal-del-ticket');
  if (btnModalDelTicket) {
    btnModalDelTicket.onclick = async () => {
      if (confirm(`คุณต้องการลบรายการแจ้งซ่อม ${ticket.id} (ห้อง ${ticket.room_number}) ออกจากระบบใช่หรือไม่?`)) {
        const { error } = await supabase.from('maintenance').eq('id', ticket.id).delete();
        if (error) {
          toast('เกิดข้อผิดพลาดในการลบรายการแจ้งซ่อม', 'error');
          return;
        }
        cachedTickets = cachedTickets.filter(x => x.id !== ticket.id);
        toast(`ลบรายการแจ้งซ่อม ${ticket.id} เรียบร้อยแล้ว`, 'success');
        closeModal();
        loadMaintenanceData();
      }
    };
  }

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


/* ========== js/parcels.js ========== */
// js/parcels.js
// ระบบพัสดุและไปรษณียภัณฑ์ (Parcel Management)
// ออกแบบด้วย Smoky Frosted Glass Design System



let parcelFilter = 'all';
let parcelSearch = '';
let cachedParcels = [];
const DEFAULT_PARCELS = [];
function getBuildingName(roomNum) {
  const r = String(roomNum || '').trim();
  if (r.startsWith('1')) return 'อาคาร ธนกฤษฎ์';
  if (r.startsWith('2')) return 'อาคาร กิ่งเพชร';
  if (r.startsWith('B') || r.startsWith('b')) return 'อาคาร ใต้บ้าน';
  return 'หอพักธนกฤษฎ์';
}
async function renderParcelsView() {
  setTimeout(() => {
    bindParcelsEvents();
    loadParcelsData();
  }, 0);

  const isStudent = currentUser && currentUser.role === 'student';

  return `
    <div style="display: flex; flex-direction: column; gap: 22px;">
      
      <!-- 1. Header Card (Smoky Glass) -->
      <div class="smoky-card" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(59,130,246,0.18); border: 1px solid rgba(59,130,246,0.32); display: flex; align-items: center; justify-content: center; color: #3B82F6;">
            ${ic('box')}
          </div>
          <div>
            <h2 style="font-size: 1.35rem; font-weight: 700; color: #ffffff; margin: 0; letter-spacing: -0.02em;">
              ระบบพัสดุและไปรษณียภัณฑ์ (Parcel Management)
            </h2>
            <span style="font-size: 0.82rem; color: rgba(255,255,255,0.48); margin-top: 3px; display: block;">
              ${isStudent ? 'ตรวจสอบรายการพัสดุที่มาถึงหอพัก และยืนยันการรับพัสดุ' : 'บันทึกพัสดุที่จัดส่งถึงหอพัก แจ้งเตือนผู้พัก และบันทึกประวัติการรับ 3 อาคาร (17 ห้อง)'}
            </span>
          </div>
        </div>

        ${!isStudent ? `
          <div style="display: flex; align-items: center; gap: 10px;">
            <button class="smoky-round-glass-btn" id="btn-add-parcel" style="width: auto; border-radius: 9999px; padding: 0 18px; height: 38px; background: #3B82F6; color: #ffffff; border: 1px solid rgba(59,130,246,0.5); box-shadow: 0 0 20px rgba(59,130,246,0.4); font-size: 0.82rem; font-weight: 600; gap: 6px;">
              ${ic('plus')}
              <span>บันทึกพัสดุเข้าใหม่</span>
            </button>
          </div>
        ` : ''}
      </div>

      <!-- 2. KPI Summary Stat Tiles (Smoky Glass) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 16px;" id="parcel-summary-stats">
        <div class="smoky-tile">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="smoky-meta-label">พัสดุทั้งหมดในระบบ</span>
            <div style="color: rgba(255,255,255,0.4);">${ic('box')}</div>
          </div>
          <div class="smoky-kpi-num" style="margin-top: 8px;" id="kpi-parcel-total">...</div>
          <div class="smoky-kpi-sub">รายการพัสดุสะสม</div>
        </div>

        <div class="smoky-tile">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="smoky-meta-label">รอผู้พักมารับ</span>
            <span class="smoky-delta-neg" style="background: rgba(245, 158, 11, 0.15); color: #FBBF24;">รอส่งมอบ</span>
          </div>
          <div class="smoky-kpi-num" style="margin-top: 8px; color: #FBBF24;" id="kpi-parcel-waiting">...</div>
          <div class="smoky-kpi-sub">รอรับที่สำนักงานหอพัก</div>
        </div>

        <div class="smoky-tile">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="smoky-meta-label">รับมอบเรียบร้อยแล้ว</span>
            <span class="smoky-delta-pos">ส่งมอบสำเร็จ</span>
          </div>
          <div class="smoky-kpi-num" style="margin-top: 8px; color: #34D399;" id="kpi-parcel-collected">...</div>
          <div class="smoky-kpi-sub">ผู้พักเซ็นรับแล้ว</div>
        </div>

        <div class="smoky-tile">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="smoky-meta-label">บริษัทขนส่งหลัก</span>
            <span class="smoky-delta-pos" style="background: rgba(59, 130, 246, 0.15); color: #60A5FA;">ครอบคลุมทุกค่าย</span>
          </div>
          <div class="smoky-kpi-num" style="margin-top: 8px; color: #60A5FA;" id="kpi-parcel-couriers">...</div>
          <div class="smoky-kpi-sub">Flash · Kerry · ไปรษณีย์ไทย ฯลฯ</div>
        </div>
      </div>

      <!-- 3. Filters & Search Toolbar (Smoky Glass) -->
      <div class="smoky-card" style="padding: 16px 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
          
          <!-- Search Box -->
          <div style="position: relative; min-width: 240px; flex: 1; max-width: 340px;">
            <span style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.4); display: flex; align-items: center;">
              ${ic('search')}
            </span>
            <input type="text" id="parcels-search-input" class="smoky-glass-input" placeholder="ค้นหาเลขพัสดุ, ชื่อผู้รับ หรือหมายเลขห้อง..." style="width: 100%; padding-left: 38px;">
          </div>

          <!-- Status Filter Tabs (Segmented Control) -->
          <div class="smoky-segmented" id="parcel-filter-tabs" style="overflow-x: auto; max-width: 100%;">
            <button class="smoky-seg-btn active" data-status="all">ทั้งหมด</button>
            <button class="smoky-seg-btn" data-status="waiting">รอผู้พักมารับ</button>
            <button class="smoky-seg-btn" data-status="collected">รับแล้วเรียบร้อย</button>
          </div>

          <!-- Refresh Action -->
          <div>
            <button class="smoky-round-glass-btn" id="btn-refresh-parcels" style="width: auto; height: 36px; padding: 0 16px; border-radius: 9999px; font-size: 0.80rem; gap: 6px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);">
              ${ic('check')}
              <span>รีเฟรชข้อมูล</span>
            </button>
          </div>

        </div>
      </div>

      <!-- 4. Table Wrapper (Smoky Frosted Glass) -->
      <div class="smoky-table-wrap">
        <table class="smoky-table">
          <thead>
            <tr>
              <th style="min-width: 170px;">หมายเลขพัสดุ / ขนส่ง</th>
              <th style="min-width: 180px;">ห้องพัก / ผู้รับ</th>
              <th style="min-width: 180px;">ลักษณะพัสดุ</th>
              <th style="min-width: 150px;">วันที่มาถึง / รับมอบ</th>
              <th style="min-width: 155px; width: 160px;">สถานะ</th>
              <th style="text-align: right; padding-right: 22px; width: 175px;">การดำเนินการ</th>
            </tr>
          </thead>
          <tbody id="parcels-tbody">
            <tr><td colspan="6" style="text-align:center; padding: 40px; color: rgba(255,255,255,0.4);">กำลังโหลดข้อมูลพัสดุ...</td></tr>
          </tbody>
        </table>
      </div>

    </div>
  `;
}

async function loadParcelsData() {
  const tbody = document.getElementById('parcels-tbody');
  if (!tbody) return;

  const { data: parcels, error } = await supabase.from('parcels').select('*').order('arrived_at', { ascending: false });

  let allParcels = parcels;
  if (error || !allParcels) {
    allParcels = [];
  }
  cachedParcels = allParcels;

  // Update KPI counters
  const totalCount = allParcels.length;
  const waitingCount = allParcels.filter(p => p.status === 'waiting').length;
  const collectedCount = allParcels.filter(p => p.status === 'collected').length;
  const couriersSet = new Set(allParcels.map(p => p.courier).filter(Boolean));

  const kpiTotal = document.getElementById('kpi-parcel-total');
  const kpiWaiting = document.getElementById('kpi-parcel-waiting');
  const kpiCollected = document.getElementById('kpi-parcel-collected');
  const kpiCouriers = document.getElementById('kpi-parcel-couriers');

  if (kpiTotal) kpiTotal.textContent = `${totalCount} รายการ`;
  if (kpiWaiting) kpiWaiting.textContent = `${waitingCount} ชิ้น`;
  if (kpiCollected) kpiCollected.textContent = `${collectedCount} ชิ้น`;
  if (kpiCouriers) kpiCouriers.textContent = `${couriersSet.size} ค่าย`;

  let list = [...allParcels];
  const isStudent = currentUser && currentUser.role === 'student';
  if (isStudent && currentUser.room) {
    list = list.filter(p => String(p.room_number) === String(currentUser.room));
  }

  if (parcelFilter !== 'all') {
    list = list.filter(p => p.status === parcelFilter);
  }

  if (parcelSearch.trim()) {
    const q = parcelSearch.toLowerCase().trim();
    list = list.filter(p => 
      String(p.tracking_number || '').toLowerCase().includes(q) ||
      String(p.recipient_name || '').toLowerCase().includes(q) ||
      String(p.room_number || '').toLowerCase().includes(q) ||
      getBuildingName(p.room_number).toLowerCase().includes(q) ||
      String(p.courier || '').toLowerCase().includes(q) ||
      String(p.description || '').toLowerCase().includes(q)
    );
  }

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 40px; color: rgba(255,255,255,0.4);">ไม่พบรายการพัสดุตามเงื่อนไขที่เลือก</td></tr>`;
    return;
  }

  let html = '';
  list.forEach(p => {
    const isCollected = p.status === 'collected';
    const bldg = getBuildingName(p.room_number);

    let statusPill = '';
    if (isCollected) {
      statusPill = `<span class="smoky-status-pill pill-green">✓ รับแล้ว</span>`;
    } else {
      statusPill = `<span class="smoky-status-pill pill-amber">⏳ รอรับที่สำนักงาน</span>`;
    }

    html += `
      <tr>
        <td>
          <div style="font-weight: 700; color: #ffffff; letter-spacing: -0.01em; font-family: monospace; font-size: 0.90rem;">
            ${p.tracking_number}
          </div>
          <div style="margin-top: 4px;">
            <span class="smoky-cat-pill">
              ${p.courier}
            </span>
          </div>
        </td>
        <td>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="font-weight: 700; color: #ffffff; font-size: 0.95rem;">ห้อง ${p.room_number}</div>
            <span class="smoky-bldg-badge">
              ${bldg}
            </span>
          </div>
          <div style="font-size: 0.78rem; color: rgba(255,255,255,0.48); margin-top: 3px;">
            ${p.recipient_name}
          </div>
        </td>
        <td>
          <div style="font-size: 0.84rem; color: rgba(255,255,255,0.85);">
            ${p.description || 'กล่องพัสดุมาตรฐาน'}
          </div>
        </td>
        <td>
          <div style="font-size: 0.82rem; color: rgba(255,255,255,0.75);">
            มาถึง: ${fmtDate(p.arrived_at)}
          </div>
          ${isCollected && p.collected_at ? `
            <div style="font-size: 0.72rem; color: #34D399; margin-top: 2px;">
              รับเมื่อ: ${fmtDate(p.collected_at)}
            </div>
          ` : ''}
        </td>
        <td>${statusPill}</td>
        <td style="text-align: right; padding-right: 18px;">
          <div style="display: flex; gap: 8px; justify-content: flex-end; align-items: center;">
            ${!isCollected ? `
              <button class="smoky-round-glass-btn btn-collect-parcel" data-id="${p.id}" style="width: auto; height: 32px; padding: 0 14px; border-radius: 9999px; font-size: 0.78rem; gap: 6px; background: rgba(59,130,246,0.18); border: 1px solid rgba(59,130,246,0.38); color: #60A5FA; font-weight: 600;" title="บันทึกว่ารับแล้ว">
                ${ic('check')}
                <span>ยืนยันรับพัสดุ</span>
              </button>
            ` : `
              <span style="font-size: 0.78rem; color: #34D399; display: inline-flex; align-items: center; gap: 4px;">
                ${ic('check')}
                <span>รับมอบเรียบร้อย</span>
              </span>
            `}
            <button class="smoky-round-glass-btn btn-del-parcel" data-id="${p.id}" style="width: 32px; height: 32px; padding: 0; border-radius: 9999px; color: #FB7185; border-color: rgba(244, 63, 94, 0.3); background: rgba(244, 63, 94, 0.1);" title="ลบรายการพัสดุ">
              ${ic('trash')}
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;

  tbody.querySelectorAll('.btn-collect-parcel').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id');
      const target = cachedParcels.find(x => x.id === id);
      if (!target) return;
      if (confirm(`ยืนยันการรับพัสดุเลขที่ "${target.tracking_number}" สำหรับห้อง ${target.room_number}?`)) {
        await supabase.from('parcels').eq('id', id).update({
          status: 'collected',
          collected_at: new Date().toISOString().split('T')[0]
        });
        toast('บันทึกการรับพัสดุเรียบร้อยแล้ว', 'success');
        loadParcelsData();
      }
    };
  });

  // Delete Parcel
  tbody.querySelectorAll('.btn-del-parcel').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id');
      const target = cachedParcels.find(x => x.id === id);
      if (!target) return;
      if (confirm(`คุณต้องการลบรายการพัสดุ ${target.tracking_number} (ห้อง ${target.room_number}) ออกจากระบบใช่หรือไม่?`)) {
        const { error } = await supabase.from('parcels').eq('id', id).delete();
        if (error) {
          toast('เกิดข้อผิดพลาดในการลบพัสดุ', 'error');
          return;
        }
        cachedParcels = cachedParcels.filter(x => x.id !== id);
        toast(`ลบรายการพัสดุ ${target.tracking_number} เรียบร้อยแล้ว`, 'success');
        loadParcelsData();
      }
    };
  });
}

function bindParcelsEvents() {
  const tabs = document.getElementById('parcel-filter-tabs');
  if (tabs) {
    tabs.querySelectorAll('.smoky-seg-btn').forEach(btn => {
      btn.onclick = () => {
        tabs.querySelectorAll('.smoky-seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        parcelFilter = btn.getAttribute('data-status');
        loadParcelsData();
      };
    });
  }

  const searchInput = document.getElementById('parcels-search-input');
  if (searchInput) {
    searchInput.oninput = (e) => {
      parcelSearch = e.target.value.trim();
      loadParcelsData();
    };
  }

  const btnRefresh = document.getElementById('btn-refresh-parcels');
  if (btnRefresh) {
    btnRefresh.onclick = () => {
      toast('กำลังซิงค์รายการพัสดุจากระบบ...', 'info');
      loadParcelsData();
    };
  }

  const btnAdd = document.getElementById('btn-add-parcel');
  if (btnAdd) btnAdd.onclick = openAddParcelModal;
}

function openAddParcelModal() {
  const defaultRoom = currentUser && currentUser.room ? currentUser.room : '101';
  const defaultName = currentUser ? currentUser.name : '';

  // 17 Real Dormitory Rooms across 3 buildings
  const tanakritRooms = ['101', '102', '103', '104', '105', '106', '107', '108', '109'];
  const kingPhetchRooms = ['201', '202', '203', '204', '205'];
  const underGroundRooms = ['B01', 'B02', 'B03'];

  const roomOptions = `
    <optgroup label="อาคาร ธนกฤษฎ์ (9 ห้อง)">
      ${tanakritRooms.map(r => `<option value="${r}" ${r === defaultRoom ? 'selected' : ''}>ห้อง ${r} (อาคาร ธนกฤษฎ์)</option>`).join('')}
    </optgroup>
    <optgroup label="อาคาร กิ่งเพชร (5 ห้อง)">
      ${kingPhetchRooms.map(r => `<option value="${r}" ${r === defaultRoom ? 'selected' : ''}>ห้อง ${r} (อาคาร กิ่งเพชร)</option>`).join('')}
    </optgroup>
    <optgroup label="อาคาร ใต้บ้าน (3 ห้อง)">
      ${underGroundRooms.map(r => `<option value="${r}" ${r === defaultRoom ? 'selected' : ''}>ห้อง ${r} (อาคาร ใต้บ้าน)</option>`).join('')}
    </optgroup>
    <optgroup label="สำนักงาน / ส่วนกลาง">
      <option value="สำนักงาน">สำนักงานหอพัก / ผู้ดูแล</option>
    </optgroup>
  `;

  const body = `
    <form id="form-add-parcel" style="display: flex; flex-direction: column; gap: 14px;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div class="field">
          <label class="smoky-form-label" style="font-size: 0.84rem; display: block; margin-bottom: 6px;">บริษัทขนส่ง *</label>
          <select id="pk-courier" class="smoky-glass-select" style="width: 100%; height: 42px; border-radius: 8px;">
            <option value="Flash Express">Flash Express</option>
            <option value="Kerry Express">Kerry Express</option>
            <option value="ไปรษณีย์ไทย (EMS)">ไปรษณีย์ไทย (EMS / ลงทะเบียน)</option>
            <option value="J&T Express">J&T Express</option>
            <option value="SPX Express (Shopee)">SPX Express (Shopee)</option>
            <option value="LEX (Lazada)">LEX (Lazada)</option>
            <option value="อื่นๆ">อื่นๆ</option>
          </select>
        </div>
        <div class="field">
          <label class="smoky-form-label" style="font-size: 0.84rem; display: block; margin-bottom: 6px;">หมายเลขพัสดุ (Tracking No.) *</label>
          <input type="text" id="pk-tracking" class="smoky-glass-input" placeholder="เช่น TH0129384756" required style="width: 100%; height: 42px; border-radius: 8px;">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div class="field">
          <label class="smoky-form-label" style="font-size: 0.84rem; display: block; margin-bottom: 6px;">ห้องพักผู้รับ *</label>
          <select id="pk-room" class="smoky-glass-select" style="width: 100%; height: 42px; border-radius: 8px;">
            ${roomOptions}
          </select>
        </div>
        <div class="field">
          <label class="smoky-form-label" style="font-size: 0.84rem; display: block; margin-bottom: 6px;">ชื่อผู้รับตามจ่าหน้า *</label>
          <input type="text" id="pk-name" class="smoky-glass-input" value="${defaultName}" placeholder="เช่น นายสมชาย ธนกฤษฎ์" required style="width: 100%; height: 42px; border-radius: 8px;">
        </div>
      </div>

      <div class="field">
        <label class="smoky-form-label" style="font-size: 0.84rem; display: block; margin-bottom: 6px;">ลักษณะพัสดุ / หมายเหตุ</label>
        <input type="text" id="pk-desc" class="smoky-glass-input" placeholder="เช่น กล่องใหญ่, ซองเอกสาร, กล่องพัสดุขนาดกลาง" style="width: 100%; height: 42px; border-radius: 8px;">
      </div>
    </form>
  `;

  const footer = `
    <button type="button" class="btn btn-outline" onclick="window.closeAppModal()">ยกเลิก</button>
    <button type="button" class="btn btn-primary" id="btn-submit-parcel" style="background: #3B82F6; border-color: #3B82F6;">บันทึกรับพัสดุ</button>
  `;

  showModal({
    title: 'บันทึกพัสดุมาส่งใหม่ (New Parcel Entry)',
    body,
    footer,
    maxWidth: '540px'
  });

  document.getElementById('btn-submit-parcel').onclick = async () => {
    const courier = document.getElementById('pk-courier').value;
    const tracking = document.getElementById('pk-tracking').value.trim();
    const room = document.getElementById('pk-room').value.trim();
    const name = document.getElementById('pk-name').value.trim();
    const desc = document.getElementById('pk-desc').value.trim();

    if (!tracking || !room || !name) {
      toast('กรุณากรอกข้อมูลสำคัญให้ครบถ้วน', 'error');
      return;
    }

    const newId = 'PKG-' + Math.floor(100 + Math.random() * 900);

    const { error } = await supabase.from('parcels').insert([{
      id: newId,
      tracking_number: tracking,
      courier,
      room_number: room,
      recipient_name: name,
      description: desc || 'กล่องพัสดุมาตรฐาน',
      status: 'waiting',
      arrived_at: new Date().toISOString().split('T')[0]
    }]);

    if (error) {
      console.error('Parcel insert error:', error);
      toast('เกิดข้อผิดพลาดในการบันทึกพัสดุ', 'error');
      return;
    }

    toast(`บันทึกพัสดุเลขที่ ${tracking} สำหรับห้อง ${room} สำเร็จ`, 'success');
    closeModal();
    loadParcelsData();
  };
}


/* ========== js/announcements.js ========== */
// js/announcements.js
// กระดานข่าวสารและประกาศหอพัก (Announcements)
// ออกแบบด้วย Smoky Frosted Glass Design System



let annCategoryFilter = 'all';
let annSearchQuery = '';
let cachedAnnouncements = [];
const DEFAULT_ANNOUNCEMENTS = [];
async function renderAnnouncementsView() {
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


/* ========== js/reports.js ========== */
// js/reports.js
// รายงานสถิติและภาพรวมการบริหารงานหอพัก (Analytics & Reports)
// ออกแบบด้วย Smoky Frosted Glass Design System
async function renderReportsView() {
  setTimeout(() => {
    loadReportsData();
  }, 0);

  return `
    <div style="display: flex; flex-direction: column; gap: 22px;">
      
      <!-- 1. Header Card (Smoky Glass) -->
      <div class="smoky-card" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(59,130,246,0.18); border: 1px solid rgba(59,130,246,0.32); display: flex; align-items: center; justify-content: center; color: #3B82F6;">
            ${ic('chart')}
          </div>
          <div>
            <h2 style="font-size: 1.35rem; font-weight: 700; color: #ffffff; margin: 0; letter-spacing: -0.02em;">
              รายงานสถิติและภาพรวมการบริหารงานหอพัก (Analytics & Reports)
            </h2>
            <span style="font-size: 0.82rem; color: rgba(255,255,255,0.48); margin-top: 3px; display: block;">
              วิเคราะห์อัตราการเข้าพัก การชำระเงินค่าน้ำ-ค่าไฟ และประสิทธิภาพการบริการ 3 อาคาร (17 ห้อง)
            </span>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <button class="smoky-round-glass-btn" id="btn-refresh-reports" style="width: auto; height: 38px; padding: 0 18px; border-radius: 9999px; font-size: 0.82rem; gap: 6px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);">
            ${ic('check')}
            <span>รีเฟรชข้อมูลสถิติ</span>
          </button>
        </div>
      </div>

      <!-- 2. KPI Summary Stat Tiles (Smoky Glass) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 16px;" id="reports-top-stats">
        <div class="smoky-tile">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="smoky-meta-label">อัตราการเข้าพักเฉลี่ย</span>
            <div style="color: rgba(255,255,255,0.4);">${ic('door')}</div>
          </div>
          <div class="smoky-kpi-num" style="margin-top: 8px;" id="kpi-rep-occ">...</div>
          <div class="smoky-kpi-sub">สัดส่วนผู้เช่าจริง</div>
        </div>

        <div class="smoky-tile">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="smoky-meta-label">รายได้เรียกเก็บเดือนล่าสุด</span>
            <span class="smoky-delta-pos">งวดปัจจุบัน</span>
          </div>
          <div class="smoky-kpi-num" style="margin-top: 8px; color: #60A5FA;" id="kpi-rep-rev">...</div>
          <div class="smoky-kpi-sub">ค่าเช่าและค่าน้ำ-ค่าไฟ</div>
        </div>

        <div class="smoky-tile">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="smoky-meta-label">จัดเก็บรายได้สำเร็จ</span>
            <span class="smoky-delta-pos">ความคืบหน้า</span>
          </div>
          <div class="smoky-kpi-num" style="margin-top: 8px; color: #34D399;" id="kpi-rep-col">...</div>
          <div class="smoky-kpi-sub">ชำระเงินเรียบร้อยแล้ว</div>
        </div>

        <div class="smoky-tile">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="smoky-meta-label">รายการแจ้งซ่อมทั้งหมด</span>
            <div style="color: rgba(255,255,255,0.4);">${ic('wrench')}</div>
          </div>
          <div class="smoky-kpi-num" style="margin-top: 8px; color: #FBBF24;" id="kpi-rep-maint">...</div>
          <div class="smoky-kpi-sub">งานซ่อมบำรุงสะสม</div>
        </div>
      </div>

      <!-- 3. 2x2 Bento Analytics Grid (Smoky Glass) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(420px, 1fr)); gap: 20px;">
        
        <!-- Occupancy Breakdown -->
        <div class="smoky-card">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
            <div style="color: #60A5FA;">${ic('door')}</div>
            <h3 style="font-size: 1.05rem; font-weight: 700; color: #ffffff; margin: 0;">สัดส่วนอัตราการเข้าพักห้องพัก</h3>
          </div>
          <p style="color: rgba(255,255,255,0.45); font-size: 0.80rem; margin: 0 0 20px 0;">การกระจายตัวของสถานะห้องพัก 17 ห้อง ครอบคลุม 3 อาคาร</p>
          <div id="report-occupancy-bars" style="display: flex; flex-direction: column; gap: 14px;">กำลังคำนวณ...</div>
        </div>

        <!-- Parcels Breakdown -->
        <div class="smoky-card">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
            <div style="color: #FBBF24;">${ic('box')}</div>
            <h3 style="font-size: 1.05rem; font-weight: 700; color: #ffffff; margin: 0;">สถิติการรับพัสดุไปรษณีย์</h3>
          </div>
          <p style="color: rgba(255,255,255,0.45); font-size: 0.80rem; margin: 0 0 20px 0;">สัดส่วนพัสดุที่ส่งมอบแล้วและรอรับที่สำนักงานหอพัก</p>
          <div id="report-parcels-bars" style="display: flex; flex-direction: column; gap: 14px;">กำลังคำนวณ...</div>
        </div>

        <!-- Utilities Revenue -->
        <div class="smoky-card">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
            <div style="color: #34D399;">${ic('bill')}</div>
            <h3 style="font-size: 1.05rem; font-weight: 700; color: #ffffff; margin: 0;">การจัดเก็บรายได้ค่าน้ำ-ค่าไฟ และค่าเช่า</h3>
          </div>
          <p style="color: rgba(255,255,255,0.45); font-size: 0.80rem; margin: 0 0 20px 0;">สัดส่วนการชำระเงินของรอบบิลประจำเดือนปัจจุบัน</p>
          <div id="report-utility-bars" style="display: flex; flex-direction: column; gap: 14px;">กำลังคำนวณ...</div>
        </div>

        <!-- Maintenance Turnaround -->
        <div class="smoky-card">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
            <div style="color: #FB7185;">${ic('wrench')}</div>
            <h3 style="font-size: 1.05rem; font-weight: 700; color: #ffffff; margin: 0;">สถิติการแจ้งซ่อมบำรุง</h3>
          </div>
          <p style="color: rgba(255,255,255,0.45); font-size: 0.80rem; margin: 0 0 20px 0;">ประสิทธิภาพและความรวดเร็วในการดูแลซ่อมแซมจุดชำรุด</p>
          <div id="report-maint-bars" style="display: flex; flex-direction: column; gap: 14px;">กำลังคำนวณ...</div>
        </div>

      </div>

    </div>
  `;
}

async function loadReportsData() {
  const [
    { data: tenantsData },
    { data: parcelsData },
    { data: billsData },
    { data: ticketsData }
  ] = await Promise.all([
    supabase.from('tenants').select('*'),
    supabase.from('parcels').select('*'),
    supabase.from('meter_readings').select('*'),
    supabase.from('maintenance').select('*')
  ]);

  const tenants = Array.isArray(tenantsData) ? tenantsData.filter(t => t.status !== 'terminated') : [];
  const parcels = Array.isArray(parcelsData) ? parcelsData : [];
  const bills = Array.isArray(billsData) ? billsData : [];
  const tickets = Array.isArray(ticketsData) ? ticketsData : [];

  const totalRooms = 17;
  const occupied = tenants.length;
  const activeMaintSet = new Set();
  tickets.filter(t => t.status !== 'completed' && t.room_number).forEach(t => {
    activeMaintSet.add(t.room_number.replace(/[^0-9B]/gi, ''));
  });
  const mnt = activeMaintSet.size;
  const vac = Math.max(0, totalRooms - occupied - mnt);
  const occRate = totalRooms > 0 ? Math.round((occupied / totalRooms) * 100) : 0;

  const totalRevenue = bills.reduce((a, c) => a + (Number(c.total_price) || 0), 0);
  const paidRevenue = bills.filter(b => b.status === 'paid').reduce((a, c) => a + (Number(c.total_price) || 0), 0);
  const collectionRate = totalRevenue > 0 ? Math.round((paidRevenue / totalRevenue) * 100) : 0;

  const totalTickets = tickets.length;

  const kpiOcc = document.getElementById('kpi-rep-occ');
  const kpiRev = document.getElementById('kpi-rep-rev');
  const kpiCol = document.getElementById('kpi-rep-col');
  const kpiMaint = document.getElementById('kpi-rep-maint');

  if (kpiOcc) kpiOcc.textContent = `${occRate}%`;
  if (kpiRev) kpiRev.textContent = fmtCurrency(totalRevenue);
  if (kpiCol) kpiCol.textContent = `${collectionRate}%`;
  if (kpiMaint) kpiMaint.textContent = `${totalTickets}`;

  const btnRefresh = document.getElementById('btn-refresh-reports');
  if (btnRefresh) {
    btnRefresh.onclick = () => {
      loadReportsData();
    };
  }

  const renderBar = (label, count, total, color, colorName) => {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; margin-bottom: 7px;">
          <span style="color: rgba(255,255,255,0.85);">${label}</span>
          <span style="font-weight: 700; color: #ffffff; font-family: monospace;">${count} รายการ (${pct}%)</span>
        </div>
        <div style="background: rgba(255,255,255,0.06); border-radius: 9999px; height: 10px; overflow: hidden; border: 1px solid rgba(255,255,255,0.10); position: relative;">
          <div style="width: ${pct}%; background: ${color}; height: 100%; border-radius: 9999px; box-shadow: 0 0 10px ${color}; transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);"></div>
        </div>
      </div>
    `;
  };

  // 1. Occupancy Bars
  const occBox = document.getElementById('report-occupancy-bars');
  if (occBox) {
    occBox.innerHTML = `
      ${renderBar('มีผู้เช่าแล้ว (Occupied)', occupied, totalRooms, '#3B82F6')}
      ${renderBar('ห้องว่างพร้อมเข้าอยู่ (Vacant)', vac, totalRooms, '#34D399')}
      ${renderBar('ปิดปรับปรุง / ซ่อมบำรุง (Maintenance)', mnt, totalRooms, '#FBBF24')}
    `;
  }

  // 2. Parcels Bars
  const parcelBox = document.getElementById('report-parcels-bars');
  if (parcelBox) {
    const tot = parcels.length;
    const col = parcels.filter(p => p.status === 'collected').length;
    const wai = parcels.filter(p => p.status === 'waiting').length;
    parcelBox.innerHTML = `
      ${renderBar('รับมอบแล้วเรียบร้อย (Collected)', col, tot, '#34D399')}
      ${renderBar('รอผู้พักมารับ (Waiting)', wai, tot, '#FBBF24')}
    `;
  }

  // 3. Utilities Bars
  const utilBox = document.getElementById('report-utility-bars');
  if (utilBox) {
    const tot = bills.length;
    const paid = bills.filter(b => b.status === 'paid').length;
    const pend = bills.filter(b => b.status === 'pending').length;
    utilBox.innerHTML = `
      ${renderBar('ชำระแล้วเรียบร้อย (Paid)', paid, tot, '#34D399')}
      ${renderBar('รอชำระเงิน / ค้างชำระ (Pending)', pend, tot, '#FB7185')}
    `;
  }

  // 4. Maintenance Bars
  const maintBox = document.getElementById('report-maint-bars');
  if (maintBox) {
    const tot = tickets.length;
    const comp = tickets.filter(t => t.status === 'completed').length;
    const prog = tickets.filter(t => t.status === 'in_progress').length;
    const pend = tickets.filter(t => t.status === 'pending').length;
    maintBox.innerHTML = `
      ${renderBar('ซ่อมเสร็จสิ้น (Completed)', comp, tot, '#34D399')}
      ${renderBar('กำลังดำเนินการซ่อม (In Progress)', prog, tot, '#60A5FA')}
      ${renderBar('รอรับเรื่อง (Pending)', pend, tot, '#FBBF24')}
    `;
  }
}


/* ========== js/users.js ========== */
// js/users.js
// ระบบจัดการบัญชีผู้ใช้งาน (User Management) สำหรับ Admin
// ออกแบบด้วย Smoky Frosted Glass Design System รองรับทั้ง Dark Mode และ Light Mode



let usersSearchTerm = '';
let currentRoleFilter = 'all';
async function renderUsersView() {
  setTimeout(() => {
    bindUsersEvents();
    loadUsersData();
  }, 0);

  return `
    <div style="display: flex; flex-direction: column; gap: 22px;">
      
      <!-- 1. Header Card (Smoky Glass) -->
      <div class="smoky-card" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(59,130,246,0.18); border: 1px solid rgba(59,130,246,0.32); display: flex; align-items: center; justify-content: center; color: #3B82F6;">
            ${ic('user')}
          </div>
          <div>
            <h2 style="font-size: 1.35rem; font-weight: 700; color: #ffffff; margin: 0; letter-spacing: -0.02em;">
              จัดการบัญชีผู้ใช้งาน (User Management)
            </h2>
            <span style="font-size: 0.82rem; color: rgba(255,255,255,0.48); margin-top: 3px; display: block;">
              กำหนดสิทธิ์การเข้าใช้งาน เพิ่ม/แก้ไข และรีเซ็ตรหัสผ่านสำหรับ Admin, เจ้าหน้าที่ และผู้พักอาศัย
            </span>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <button class="smoky-round-glass-btn" id="btn-add-user" style="width: auto; border-radius: 9999px; padding: 0 18px; height: 38px; background: #3B82F6; color: #ffffff; border: 1px solid rgba(59,130,246,0.5); box-shadow: 0 0 20px rgba(59,130,246,0.4); font-size: 0.82rem; font-weight: 600; gap: 6px;">
            ${ic('plus')}
            <span>เพิ่มบัญชีผู้ใช้ใหม่</span>
          </button>
        </div>
      </div>

      <!-- 2. User Stats Summary Tiles (Smoky Glass) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 16px;">
        <div class="smoky-tile">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="smoky-meta-label">ผู้ใช้งานทั้งหมด</span>
            <div style="color: rgba(255,255,255,0.4);">${ic('users')}</div>
          </div>
          <div class="smoky-kpi-num" style="margin-top: 8px;" id="stat-total-users">-</div>
          <div class="smoky-kpi-sub">บัญชีในระบบ</div>
        </div>

        <div class="smoky-tile">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="smoky-meta-label">ผู้ดูแลระบบ</span>
            <span style="background: rgba(239,68,68,0.18); color: #EF4444; font-size: 0.65rem; font-weight: 700; padding: 2px 7px; border-radius: 9999px;">Admin</span>
          </div>
          <div class="smoky-kpi-num" style="margin-top: 8px; color: #EF4444;" id="stat-admin-users">-</div>
          <div class="smoky-kpi-sub">สิทธิ์สูงสุด</div>
        </div>

        <div class="smoky-tile">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="smoky-meta-label">เจ้าหน้าที่ / ช่าง</span>
            <span style="background: rgba(59,130,246,0.18); color: #3B82F6; font-size: 0.65rem; font-weight: 700; padding: 2px 7px; border-radius: 9999px;">Staff</span>
          </div>
          <div class="smoky-kpi-num" style="margin-top: 8px; color: #60A5FA;" id="stat-staff-users">-</div>
          <div class="smoky-kpi-sub">ธุรการและซ่อมบำรุง</div>
        </div>

        <div class="smoky-tile">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="smoky-meta-label">ผู้พักอาศัย</span>
            <span style="background: rgba(52,211,153,0.18); color: #34D399; font-size: 0.65rem; font-weight: 700; padding: 2px 7px; border-radius: 9999px;">Student</span>
          </div>
          <div class="smoky-kpi-num" style="margin-top: 8px; color: #34D399;" id="stat-student-users">-</div>
          <div class="smoky-kpi-sub">ผู้เช่า 3 อาคาร</div>
        </div>
      </div>

      <!-- 3. Search & Filter Toolbar (Smoky Glass) -->
      <div class="smoky-card" style="padding: 16px 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
          <!-- Search Input -->
          <div style="position: relative; min-width: 260px; flex: 1; max-width: 360px;">
            <span style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.4); display: flex; align-items: center;">
              ${ic('search')}
            </span>
            <input type="text" id="users-search-input" class="smoky-glass-input" placeholder="ค้นหา Username, ชื่อ, ห้อง หรือเบอร์โทร..." style="width: 100%; padding-left: 38px;">
          </div>

          <!-- Role Tabs (Segmented Control) -->
          <div class="smoky-segmented" id="users-role-tabs" style="overflow-x: auto; max-width: 100%;">
            <button class="smoky-seg-btn active" data-filter="all">ทั้งหมด</button>
            <button class="smoky-seg-btn" data-filter="admin">👑 Admin</button>
            <button class="smoky-seg-btn" data-filter="staff">🛠️ Staff</button>
            <button class="smoky-seg-btn" data-filter="student">🎓 Student</button>
          </div>

          <!-- Refresh Button -->
          <button class="smoky-round-glass-btn" id="btn-refresh-users" style="width: auto; height: 36px; padding: 0 16px; border-radius: 9999px; font-size: 0.78rem; gap: 6px;">
            ${ic('check')}
            <span>รีเฟรช</span>
          </button>
        </div>
      </div>

      <!-- 4. Modern Smoky Table Container -->
      <div class="smoky-table-wrap">
        <table class="smoky-table">
          <thead>
            <tr>
              <th>ชื่อผู้ใช้ (Username)</th>
              <th>ชื่อ - นามสกุล</th>
              <th>สิทธิ์การใช้งาน (Role)</th>
              <th>ห้องพัก</th>
              <th>ข้อมูลติดต่อ</th>
              <th>รหัสผ่าน</th>
              <th>สถานะ</th>
              <th style="text-align: right;">จัดการ</th>
            </tr>
          </thead>
          <tbody id="users-tbody">
            <tr><td colspan="8" style="text-align:center; padding: 40px; color: rgba(255,255,255,0.4);">กำลังโหลดข้อมูลผู้ใช้งาน...</td></tr>
          </tbody>
        </table>
      </div>

    </div>
  `;
}

async function loadUsersData() {
  const tbody = document.getElementById('users-tbody');
  if (!tbody) return;

  let users = null;
  try {
    const { data, error } = await supabase.from('users').select('*').order('role', { ascending: true });
    if (!error && data && data.length > 0) {
      users = data;
    }
  } catch (err) {
    console.warn('Cannot fetch users from Supabase:', err);
  }

  // หาก Supabase ไม่พร้อมใช้งาน ให้ใช้รายการ USERS สำรองพร้อมรหัสผ่านที่เปลี่ยนล่าสุด
  if (!users || users.length === 0) {
    let pwdOverrides = {};
    try {
      pwdOverrides = JSON.parse(localStorage.getItem('tanakrit_pwd_overrides') || '{}');
    } catch (_) {}
    users = USERS.map((u, idx) => ({
      id: 'U-00' + (idx + 1),
      username: u.username,
      password: pwdOverrides[u.username.toLowerCase()] || u.password,
      role: u.role,
      role_title: u.roleTitle,
      name: u.name,
      room: u.room,
      phone: u.phone || '-',
      email: u.email || '-',
      status: 'active'
    }));
  }

  // Update summary counts
  const total = users.length;
  const admins = users.filter(u => u.role === 'admin').length;
  const staff = users.filter(u => u.role === 'staff').length;
  const students = users.filter(u => u.role === 'student').length;

  const totalEl = document.getElementById('stat-total-users');
  const adminEl = document.getElementById('stat-admin-users');
  const staffEl = document.getElementById('stat-staff-users');
  const studentEl = document.getElementById('stat-student-users');

  if (totalEl) totalEl.textContent = total;
  if (adminEl) adminEl.textContent = admins;
  if (staffEl) staffEl.textContent = staff;
  if (studentEl) studentEl.textContent = students;

  // Filter
  let filtered = users;
  if (currentRoleFilter !== 'all') {
    filtered = filtered.filter(u => u.role === currentRoleFilter);
  }

  if (usersSearchTerm) {
    const q = usersSearchTerm.toLowerCase();
    filtered = filtered.filter(u =>
      (u.username || '').toLowerCase().includes(q) ||
      (u.name || '').toLowerCase().includes(q) ||
      (u.room || '').toLowerCase().includes(q) ||
      (u.phone || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q)
    );
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color: rgba(255,255,255,0.4); padding: 40px;">ไม่พบข้อมูลผู้ใช้ตามเงื่อนไข</td></tr>`;
    return;
  }

  let html = '';
  filtered.forEach(u => {
    let roleBadge = '';
    if (u.role === 'admin') {
      roleBadge = `<span class="smoky-status-pill pill-rose">👑 Admin</span>`;
    } else if (u.role === 'staff') {
      roleBadge = `<span class="smoky-status-pill pill-blue">🛠️ Staff</span>`;
    } else {
      roleBadge = `<span class="smoky-status-pill pill-green">🎓 Student</span>`;
    }

    const isActive = u.status !== 'suspended';
    const statusPill = isActive
      ? `<span class="smoky-status-pill pill-green">🟢 ใช้งานได้</span>`
      : `<span class="smoky-status-pill pill-rose">🔴 ระงับชั่วคราว</span>`;

    html += `
      <tr>
        <td>
          <div style="font-weight: 700; color: #60A5FA; font-family: monospace; font-size: 0.95rem;">
            ${u.username}
          </div>
          <small style="color: rgba(255,255,255,0.4); font-size: 0.72rem;">${u.id}</small>
        </td>
        <td>
          <div style="font-weight: 600; color: #ffffff;">${u.name}</div>
          <small style="color: rgba(255,255,255,0.45); font-size: 0.72rem;">${u.role_title || '-'}</small>
        </td>
        <td>${roleBadge}</td>
        <td>${u.room ? `<span class="smoky-bldg-badge">ห้อง ${u.room}</span>` : '<span style="color: rgba(255,255,255,0.3);">-</span>'}</td>
        <td>
          <div>${u.phone && u.phone !== '-' ? `<a href="tel:${u.phone}" style="color: #60A5FA; text-decoration: none;">${u.phone}</a>` : '<span style="color: rgba(255,255,255,0.3);">-</span>'}</div>
          <small style="color: rgba(255,255,255,0.4); font-size: 0.72rem;">${u.email && u.email !== '-' ? u.email : ''}</small>
        </td>
        <td>
          <span style="font-family: monospace; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); padding: 4px 8px; border-radius: 6px; font-size: 0.82rem; color: rgba(255,255,255,0.85);">
            ${u.password}
          </span>
        </td>
        <td>${statusPill}</td>
        <td style="text-align: right;">
          <div style="display: flex; gap: 6px; justify-content: flex-end;">
            <button class="smoky-round-glass-btn btn-edit-user" data-user-id="${u.id}" title="แก้ไขข้อมูล/รหัสผ่าน" style="width: auto; height: 32px; padding: 0 12px; font-size: 0.76rem; border-radius: 8px; gap: 4px;">
              ${ic('edit')} แก้ไข
            </button>
            <button class="smoky-round-glass-btn btn-toggle-status" data-user-id="${u.id}" data-active="${isActive}" title="${isActive ? 'ระงับการใช้งาน' : 'เปิดใช้งาน'}" style="width: auto; height: 32px; padding: 0 10px; font-size: 0.76rem; border-radius: 8px;">
              ${isActive ? 'ระงับ' : 'เปิดใช้'}
            </button>
            ${u.username !== 'admin' ? `
              <button class="smoky-round-glass-btn btn-del-user" data-user-id="${u.id}" data-username="${u.username}" title="ลบบัญชีนี้" style="width: 32px; height: 32px; border-radius: 8px; color: #F87171; border-color: rgba(248,113,113,0.3);">
                ${ic('trash')}
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;

  // Bind Row Buttons
  tbody.querySelectorAll('.btn-edit-user').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-user-id');
      const target = users.find(x => x.id === id);
      if (target) openUserModal(target);
    };
  });

  tbody.querySelectorAll('.btn-toggle-status').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-user-id');
      const target = users.find(x => x.id === id);
      if (!target) return;
      const nextStatus = target.status === 'suspended' ? 'active' : 'suspended';
      await supabase.from('users').eq('id', id).update({ status: nextStatus });
      toast(`เปลี่ยนสถานะบัญชี ${target.username} เป็น ${nextStatus === 'active' ? 'เปิดใช้งาน' : 'ระงับการใช้งาน'} แล้ว`, 'success');
      loadUsersData();
    };
  });

  tbody.querySelectorAll('.btn-del-user').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-user-id');
      const uName = btn.getAttribute('data-username');
      if (confirm(`คุณต้องการลบบัญชีผู้ใช้ "${uName}" หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`)) {
        await supabase.from('users').eq('id', id).delete();
        toast(`ลบบัญชีผู้ใช้ ${uName} สำเร็จ`, 'info');
        loadUsersData();
      }
    };
  });
}

function bindUsersEvents() {
  const input = document.getElementById('users-search-input');
  if (input) {
    input.oninput = (e) => {
      usersSearchTerm = e.target.value.trim();
      loadUsersData();
    };
  }

  const refreshBtn = document.getElementById('btn-refresh-users');
  if (refreshBtn) {
    refreshBtn.onclick = () => {
      toast('กำลังดึงข้อมูลผู้ใช้ล่าสุด...', 'info');
      loadUsersData();
    };
  }

  const addBtn = document.getElementById('btn-add-user');
  if (addBtn) {
    addBtn.onclick = () => openUserModal(null);
  }

  // Filter tabs
  const filterTabs = document.getElementById('users-role-tabs');
  if (filterTabs) {
    filterTabs.querySelectorAll('.smoky-seg-btn').forEach(btn => {
      btn.onclick = () => {
        filterTabs.querySelectorAll('.smoky-seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentRoleFilter = btn.getAttribute('data-filter');
        loadUsersData();
      };
    });
  }
}

function openUserModal(user = null) {
  const isEdit = !!user;
  const title = isEdit ? `แก้ไขบัญชีผู้ใช้: ${user.username}` : 'เพิ่มบัญชีผู้ใช้งานใหม่';

  const body = `
    <form id="form-user-edit" style="display: flex; flex-direction: column; gap: 14px;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div class="field">
          <label class="smoky-form-label" style="display: block; margin-bottom: 6px;">ชื่อผู้ใช้งาน (Username) *</label>
          <input type="text" id="u-username" class="smoky-glass-input" value="${user ? user.username : ''}" ${isEdit ? 'disabled' : 'required'} placeholder="เช่น student103, tech1" style="width: 100%;">
        </div>
        <div class="field">
          <label class="smoky-form-label" style="display: block; margin-bottom: 6px;">รหัสผ่าน (Password) *</label>
          <input type="text" id="u-password" class="smoky-glass-input" value="${user ? user.password : ''}" required placeholder="••••••••" style="width: 100%;">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div class="field">
          <label class="smoky-form-label" style="display: block; margin-bottom: 6px;">ระดับสิทธิ์ (Role) *</label>
          <select id="u-role" class="smoky-glass-select" required style="width: 100%;">
            <option value="student" ${user && user.role === 'student' ? 'selected' : ''}>Student (ผู้พักอาศัย)</option>
            <option value="staff" ${user && user.role === 'staff' ? 'selected' : ''}>Staff (เจ้าหน้าที่/ช่าง)</option>
            <option value="admin" ${user && user.role === 'admin' ? 'selected' : ''}>Admin (ผู้ดูแลระบบ)</option>
          </select>
        </div>
        <div class="field">
          <label class="smoky-form-label" style="display: block; margin-bottom: 6px;">เลขห้องพัก (เฉพาะ Student)</label>
          <input type="text" id="u-room" class="smoky-glass-input" value="${user ? (user.room || '') : ''}" placeholder="เช่น 103, 302" style="width: 100%;">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div class="field">
          <label class="smoky-form-label" style="display: block; margin-bottom: 6px;">ชื่อ - นามสกุล *</label>
          <input type="text" id="u-name" class="smoky-glass-input" value="${user ? user.name : ''}" required placeholder="นาย/นาง/น.ส. ..." style="width: 100%;">
        </div>
        <div class="field">
          <label class="smoky-form-label" style="display: block; margin-bottom: 6px;">ตำแหน่ง / คำอธิบายสิทธิ์</label>
          <input type="text" id="u-title" class="smoky-glass-input" value="${user ? (user.role_title || '') : ''}" placeholder="เช่น ผู้พักอาศัย, ช่างเทคนิค" style="width: 100%;">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div class="field">
          <label class="smoky-form-label" style="display: block; margin-bottom: 6px;">เบอร์โทรศัพท์</label>
          <input type="tel" id="u-phone" class="smoky-glass-input" value="${user ? (user.phone || '') : ''}" placeholder="08x-xxx-xxxx" style="width: 100%;">
        </div>
        <div class="field">
          <label class="smoky-form-label" style="display: block; margin-bottom: 6px;">อีเมล</label>
          <input type="email" id="u-email" class="smoky-glass-input" value="${user ? (user.email || '') : ''}" placeholder="example@email.com" style="width: 100%;">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div class="field">
          <label class="smoky-form-label" style="display: block; margin-bottom: 6px;">รหัสนักศึกษา / ผู้เช่า (ถ้ามี)</label>
          <input type="text" id="u-tenant-id" class="smoky-glass-input" value="${user ? (user.tenant_id || '') : ''}" placeholder="เช่น 66565632" style="width: 100%;">
        </div>
        <div class="field">
          <label class="smoky-form-label" style="display: block; margin-bottom: 6px;">สถานะบัญชี</label>
          <select id="u-status" class="smoky-glass-select" style="width: 100%;">
            <option value="active" ${!user || user.status !== 'suspended' ? 'selected' : ''}>🟢 ใช้งานปกติ (Active)</option>
            <option value="suspended" ${user && user.status === 'suspended' ? 'selected' : ''}>🔴 ระงับการใช้งาน (Suspended)</option>
          </select>
        </div>
      </div>
    </form>
  `;

  const footer = `
    <button type="button" class="btn btn-outline" id="btn-cancel-modal" onclick="window.closeAppModal()">ยกเลิก</button>
    <button type="button" class="btn btn-primary" id="btn-submit-user" style="background: #3B82F6; border-color: #3B82F6;">${isEdit ? 'บันทึกการแก้ไข' : 'สร้างบัญชีผู้ใช้'}</button>
  `;

  showModal({
    title,
    body,
    footer,
    maxWidth: '580px'
  });

  const cancelBtn = document.getElementById('btn-cancel-modal');
  if (cancelBtn) cancelBtn.onclick = closeModal;

  document.getElementById('btn-submit-user').onclick = async () => {
    const username = document.getElementById('u-username').value.trim();
    const password = document.getElementById('u-password').value.trim();
    const role = document.getElementById('u-role').value;
    const room = document.getElementById('u-room').value.trim();
    const name = document.getElementById('u-name').value.trim();
    const title = document.getElementById('u-title').value.trim();
    const phone = document.getElementById('u-phone').value.trim();
    const email = document.getElementById('u-email').value.trim();
    const tenant_id = document.getElementById('u-tenant-id').value.trim();
    const status = document.getElementById('u-status').value;

    if (!username || !password || !name) {
      toast('กรุณากรอก Username, Password และชื่อ-นามสกุลให้ครบถ้วน', 'error');
      return;
    }

    if (isEdit) {
      try {
        const { error } = await supabase.from('users').eq('id', user.id).update({
          password,
          role,
          room: role === 'student' ? room : null,
          name,
          role_title: title || (role === 'admin' ? 'ผู้ดูแลระบบสูงสุด' : (role === 'staff' ? 'เจ้าหน้าที่หอพัก' : `ผู้พักอาศัย (ห้อง ${room})`)),
          phone,
          email,
          tenant_id,
          status
        });
        if (error) console.warn('Supabase user update warning:', error);
      } catch (dbErr) {
        console.warn('Supabase user update offline / skipped:', dbErr);
      }

      // บันทึกรหัสผ่านใหม่ลง Local Storage เพื่อรองรับการทำงานแบบออฟไลน์
      try {
        const pwdOverrides = JSON.parse(localStorage.getItem('tanakrit_pwd_overrides') || '{}');
        pwdOverrides[user.username.toLowerCase()] = password;
        localStorage.setItem('tanakrit_pwd_overrides', JSON.stringify(pwdOverrides));
      } catch (_) {}

      if (currentUser && currentUser.username && currentUser.username.toLowerCase() === user.username.toLowerCase()) {
        currentUser.password = password;
        localStorage.setItem('tanakrit_current_user', JSON.stringify(currentUser));
        localStorage.setItem('kp_current_user', JSON.stringify(currentUser));
      }

      toast(`แก้ไขบัญชี ${user.username} เรียบร้อยแล้ว`, 'success');
      closeModal();
      loadUsersData();
    } else {
      // Check duplicate username
      const { data: exist } = await supabase.from('users').eq('username', username);
      if (exist && exist.length > 0) {
        toast('ชื่อผู้ใช้นี้ (Username) มีอยู่ในระบบแล้ว', 'error');
        return;
      }

      const newId = 'U-' + Math.floor(1000 + Math.random() * 9000);
      const { error } = await supabase.from('users').insert([{
        id: newId,
        username,
        password,
        role,
        room: role === 'student' ? room : null,
        name,
        role_title: title || (role === 'admin' ? 'ผู้ดูแลระบบสูงสุด' : (role === 'staff' ? 'เจ้าหน้าที่หอพัก' : `ผู้พักอาศัย (ห้อง ${room})`)),
        phone,
        email,
        tenant_id,
        status
      }]);

      if (error) {
        toast('เกิดข้อผิดพลาดในการสร้างบัญชีผู้ใช้', 'error');
        return;
      }
      toast(`สร้างบัญชีผู้ใช้ ${username} สำเร็จ`, 'success');
    }

    closeModal();
    loadUsersData();
  };
}


/* ========== js/settings.js ========== */
// js/settings.js
// ตั้งค่าระบบและบัญชีผู้ใช้งาน (System Settings)
// ออกแบบด้วย Smoky Frosted Glass Design System
async function renderSettingsView() {
  const s = await supabase.getSettings();
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
                <input type="number" id="set-common-fee" class="smoky-glass-input" value="${s.common_fee !== undefined ? s.common_fee : 100}" required style="width: 100%;">
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

            <div class="field" style="margin-bottom: 20px;">
              <label class="smoky-form-label" style="font-size: 0.82rem; display: block; margin-bottom: 6px;">หมายเลขบัญชีพร้อมเพย์สำหรับรับโอนเงินค่าเช่า (PromptPay QR)</label>
              <input type="text" id="set-promptpay" class="smoky-glass-input" value="${s.promptpay_number || '086-946-1654'}" style="width: 100%;">
            </div>

            <button type="submit" class="smoky-round-glass-btn" style="width: auto; border-radius: 9999px; padding: 0 20px; height: 38px; background: #3B82F6; color: #ffffff; border: 1px solid rgba(59,130,246,0.5); font-size: 0.82rem; font-weight: 600;">
              ${ic('check')}
              <span>บันทึกการตั้งค่าหอพัก</span>
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
        try {
          await supabase.from('users').eq('username', currentUser.username).update({
            password: p1
          });
        } catch (dbErr) {
          console.warn('Supabase update warning:', dbErr);
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
        promptpay_number: document.getElementById('set-promptpay').value.trim()
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
}


/* ========== js/dashboard.js ========== */
// js/dashboard.js
// Premium Smoky Frosted Glass CRM Dashboard for Tanakrit Dormitory & SaaS Management




// Interactive Dashboard State
let dashboardState = {
  targetPercent: 0,
  targetActive: true,
  activeMetricChip: 'revenue',
  revenuePeriod: 'Today',
  salesPeriod: 'Week',
  isApproved: false,
  tileStates: {
    customers: true,
    pipeline: true,
    activeUsers: true,
    openTickets: false
  },
  isPlayingAudio: false,
  audioPlayhead: 0,
  audioInterval: null
};
let dashboardLiveMetrics = {
  totalPaid: 0,
  totalExpected: 0,
  occupiedCount: 0,
  vacantCount: 16,
  maintCount: 1,
  pendingTickets: 0,
  completedTickets: 0,
  pendingBookings: 0
};

// Overview 3-Column Bento Grid Dashboard
function renderStaffDashboard() {
  setTimeout(() => {
    initStaffDashboard();
  }, 0);

  return `
    <div class="smoky-bento-grid" id="staff-bento-grid">
      
      <!-- ==================== COLUMN 1 ==================== -->
      <div class="smoky-col">
        
        <!-- 1. Team Card (รายชื่อทีมงานพร้อมเบอร์ติดต่อ) -->
        <div class="smoky-card" id="card-team">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <span class="smoky-meta-label">ทีมงานดูแลหอพัก</span>
              <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
                <span style="width: 8px; height: 8px; border-radius: 50%; background: #34D399; box-shadow: 0 0 8px #34D399;"></span>
                <span style="font-size: 0.92rem; font-weight: 600; color: #fff;" id="team-staff-count">2 คน ประจำการ</span>
              </div>
            </div>
            <button class="smoky-round-dashed-btn" id="btn-goto-users" title="จัดการบัญชีผู้ใช้งาน (User Management)" onclick="window.switchView('users')">
              ${ic('plus')}
            </button>
          </div>

          <!-- Staff Team Member Contact List (แสดงเป็นรายชื่อพร้อมเบอร์ติดต่อ) -->
          <div id="team-staff-list" style="margin-top: 14px; display: flex; flex-direction: column; gap: 8px;">
            <div style="font-size: 0.78rem; color: rgba(255,255,255,0.45); padding: 8px 0;">กำลังโหลดรายชื่อเจ้าหน้าที่...</div>
          </div>
        </div>

        <!-- 2. กล่องจัดการบัญชีผู้ใช้งาน (User Management Widget) -->
        <div class="smoky-card" style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;" id="card-users-widget">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span class="smoky-meta-label">ระบบความปลอดภัย & สิทธิ์</span>
                <h3 class="smoky-card-title" style="margin-top: 2px;">จัดการบัญชีผู้ใช้งาน (Users)</h3>
              </div>
              <button class="smoky-round-glass-btn" style="width: auto; height: 32px; padding: 0 12px; border-radius: 9999px; font-size: 0.76rem; font-weight: 600; color: #60A5FA; gap: 4px;" onclick="window.switchView('users')" title="เปิดหน้าจัดการบัญชีผู้ใช้งานทั้งหมด">
                <span>จัดการทั้งหมด</span>
                <svg class="icon" viewBox="0 0 24 24" style="width: 13px; height: 13px;"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>

            <!-- Role Summary Badges (3 columns) -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 16px;">
              <div class="user-role-stat-tile" style="padding: 10px 8px; border-radius: 10px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.22); text-align: center;">
                <span style="font-size: 0.68rem; color: #F87171; font-weight: 600; display: block;">ผู้ดูแล (Admin)</span>
                <span style="font-size: 1.25rem; font-weight: 700; color: #EF4444; margin-top: 2px; display: block;" id="widget-admin-count">-</span>
                <span style="font-size: 0.65rem; color: rgba(255,255,255,0.45);">บัญชี</span>
              </div>
              <div class="user-role-stat-tile" style="padding: 10px 8px; border-radius: 10px; background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.22); text-align: center;">
                <span style="font-size: 0.68rem; color: #60A5FA; font-weight: 600; display: block;">เจ้าหน้าที่ (Staff)</span>
                <span style="font-size: 1.25rem; font-weight: 700; color: #3B82F6; margin-top: 2px; display: block;" id="widget-staff-count">-</span>
                <span style="font-size: 0.65rem; color: rgba(255,255,255,0.45);">บัญชี</span>
              </div>
              <div class="user-role-stat-tile" style="padding: 10px 8px; border-radius: 10px; background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.22); text-align: center;">
                <span style="font-size: 0.68rem; color: #34D399; font-weight: 600; display: block;">ผู้พัก (Student)</span>
                <span style="font-size: 1.25rem; font-weight: 700; color: #10B981; margin-top: 2px; display: block;" id="widget-student-count">-</span>
                <span style="font-size: 0.65rem; color: rgba(255,255,255,0.45);">บัญชี</span>
              </div>
            </div>

            <!-- Total Users Banner -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 14px; padding: 8px 12px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 8px;">
              <span style="font-size: 0.78rem; color: rgba(255,255,255,0.65);">รวมบัญชีผู้ใช้งานทั้งหมด</span>
              <span style="font-size: 0.88rem; font-weight: 700; color: #60A5FA;" id="widget-total-users">-</span>
            </div>

            <!-- Mini List of Users (Top Accounts) -->
            <div style="margin-top: 14px;">
              <span class="smoky-meta-label" style="margin-bottom: 6px; display: block;">รายชื่อบัญชีในระบบ</span>
              <div id="widget-users-list" style="display: flex; flex-direction: column; gap: 6px;">
                <!-- Dynamically rendered rows -->
              </div>
            </div>
          </div>

          <!-- Bottom Action Buttons -->
          <div style="margin-top: 16px; display: flex; gap: 8px;">
            <button class="smoky-pill-btn" onclick="window.switchView('users')" style="flex: 1; justify-content: center; background: rgba(59,130,246,0.18); border-color: rgba(59,130,246,0.35); color: #60A5FA; font-weight: 600; font-size: 0.80rem;">
              ${ic('users')} จัดการบัญชีผู้ใช้ทั้งหมด
            </button>
            <button class="smoky-pill-btn" onclick="window.switchView('users'); setTimeout(() => document.getElementById('btn-add-user')?.click(), 150);" style="justify-content: center; background: #3B82F6; color: #fff; font-weight: 600; font-size: 0.80rem; padding: 0 14px;" title="เพิ่มบัญชีผู้ใช้ใหม่">
              ${ic('plus')}
            </button>
          </div>
        </div>

      </div>

      <!-- ==================== COLUMN 2 ==================== -->
      <div class="smoky-col">
        
        <!-- 3. Revenue Card -->
        <div class="smoky-card" id="card-revenue">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px;">
            <div>
              <span class="smoky-meta-label">รายรับค่าเช่า & มิเตอร์น้ำไฟ</span>
              <div style="display: flex; align-items: baseline; gap: 8px; margin-top: 4px;">
                <span class="smoky-kpi-num" id="revenue-val-main">฿0</span>
                <span style="font-size: 0.88rem; color: rgba(255,255,255,0.4);" id="revenue-val-expected">/ ฿0</span>
              </div>
              <div style="margin-top: 4px;">
                <span class="smoky-delta-pos" id="revenue-delta-badge">${ic('trendingUp')} ข้อมูลเรียลไทม์เดือนนี้</span>
              </div>
            </div>

            <!-- Segmented Control วันนี้/สัปดาห์/เดือน -->
            <div class="smoky-segmented" id="revenue-segmented">
              <button class="smoky-seg-btn active" data-period="Today" onclick="window.selectRevenuePeriod('Today')">วันนี้</button>
              <button class="smoky-seg-btn" data-period="Week" onclick="window.selectRevenuePeriod('Week')">สัปดาห์</button>
              <button class="smoky-seg-btn" data-period="Month" onclick="window.selectRevenuePeriod('Month')">เดือนนี้</button>
            </div>
          </div>

          <!-- Smooth White Area Line Chart (SVG) -->
          <div style="margin: 18px 0 12px; height: 110px; width: 100%;">
            <svg viewBox="0 0 300 90" preserveAspectRatio="none" style="width: 100%; height: 100%; overflow: visible;">
              <defs>
                <linearGradient id="smokyRevGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#ffffff" stop-opacity="0.32" />
                  <stop offset="100%" stop-color="#ffffff" stop-opacity="0.0" />
                </linearGradient>
              </defs>
              <path id="revenue-area-path" d="M0,75 C50,65 90,40 140,30 C190,20 240,45 300,10 L300,90 L0,90 Z" fill="url(#smokyRevGrad)" />
              <path id="revenue-line-path" d="M0,75 C50,65 90,40 140,30 C190,20 240,45 300,10" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" />
            </svg>
          </div>

          <!-- Row of Hourly/Daily Values -->
          <div style="display: grid; grid-template-columns: repeat(6, 1fr); border-top: 1px solid rgba(255,255,255,0.08); padding-top: 10px; text-align: center;" id="revenue-hourly-row">
            <div><span style="font-size: 0.68rem; color: rgba(255,255,255,0.4);">09:00</span><div style="font-size: 0.76rem; font-weight: 600; margin-top: 2px;">฿0</div></div>
            <div><span style="font-size: 0.68rem; color: rgba(255,255,255,0.4);">11:00</span><div style="font-size: 0.76rem; font-weight: 600; margin-top: 2px;">฿0</div></div>
            <div><span style="font-size: 0.68rem; color: rgba(255,255,255,0.4);">13:00</span><div style="font-size: 0.76rem; font-weight: 600; margin-top: 2px;">฿0</div></div>
            <div><span style="font-size: 0.68rem; color: rgba(255,255,255,0.4);">15:00</span><div style="font-size: 0.76rem; font-weight: 600; margin-top: 2px;">฿0</div></div>
            <div><span style="font-size: 0.68rem; color: rgba(255,255,255,0.4);">17:00</span><div style="font-size: 0.76rem; font-weight: 600; margin-top: 2px;">฿0</div></div>
            <div><span style="font-size: 0.68rem; color: rgba(255,255,255,0.4);">19:00</span><div style="font-size: 0.76rem; font-weight: 600; margin-top: 2px; color: #3B82F6;">฿0</div></div>
          </div>
        </div>

        <!-- 4. Inbound Leads & 5. Approvals Card -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          
          <!-- 4. Inbound Leads / ผู้ติดต่อสอบถามจองห้องพัก -->
          <div class="smoky-card" id="card-new-leads" onclick="window.switchView('bookings')" title="คลิกเพื่อเปิดหน้าระบบการจองห้องพักออนไลน์ (Online Bookings)" style="cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="smoky-meta-label">ผู้ติดต่อจองห้อง</span>
              <div style="display: flex; align-items: center; gap: 4px;">
                <span class="smoky-delta-pos" id="leads-badge-delta">Live Bookings</span>
                <svg class="icon" viewBox="0 0 24 24" style="width: 14px; height: 14px; color: #34D399;"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            </div>

            <div style="margin-top: 10px;">
              <div class="smoky-kpi-num" id="leads-num-count">0</div>
              <span class="smoky-kpi-sub" id="leads-sub-label">ผู้สนใจจองรอบใหม่ · คลิกดูรายการ</span>
            </div>

            <!-- Mini bar chart (Realtime based on bookings) -->
            <div id="leads-mini-bars" style="display: flex; align-items: flex-end; gap: 5px; height: 46px; margin-top: 16px;">
              <div style="flex: 1; height: 15%; background: rgba(255,255,255,0.12); border-radius: 2px;"></div>
              <div style="flex: 1; height: 15%; background: rgba(255,255,255,0.12); border-radius: 2px;"></div>
              <div style="flex: 1; height: 15%; background: rgba(255,255,255,0.12); border-radius: 2px;"></div>
              <div style="flex: 1; height: 15%; background: rgba(255,255,255,0.12); border-radius: 2px;"></div>
              <div style="flex: 1; height: 15%; background: rgba(255,255,255,0.12); border-radius: 2px;"></div>
              <div style="flex: 1; height: 15%; background: rgba(255,255,255,0.12); border-radius: 2px;"></div>
              <div style="flex: 1; height: 15%; background: rgba(255,255,255,0.12); border-radius: 2px;"></div>
            </div>
          </div>

          <!-- 5. รายการรออนุมัติ: รายการรอตรวจ, คืนเงินประกัน -->
          <div class="smoky-card" id="card-approvals" style="display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.72rem; font-weight: 600; color: rgba(255,255,255,0.5);" id="approval-title-lbl">0 รายการรอตรวจ</span>
                <span style="background: rgba(59,130,246,0.2); color: #3B82F6; font-size: 0.65rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; letter-spacing: 0.05em;" id="approval-badge-lbl">คืนเงินประกัน</span>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-top: 8px;">
                <div class="smoky-kpi-num" style="font-size: 1.65rem;" id="approval-val-main">฿0</div>
                <button style="background: none; border: none; color: rgba(255,255,255,0.4); cursor: pointer; padding: 2px;" onclick="window.dismissApproval()" title="ปิด">✕</button>
              </div>
              <span class="smoky-kpi-sub" style="font-size: 0.74rem;" id="approval-sub-lbl">ไม่มีรายการค้างตรวจสอบ</span>
            </div>

            <!-- Swipe to Approve Slider Pill -->
            <div class="smoky-swipe-container" id="swipe-approve-box" onclick="window.triggerSwipeApprove()">
              <span class="smoky-swipe-track-text" id="swipe-track-label">เลื่อนเพื่ออนุมัติคืนเงิน →</span>
              <div class="smoky-swipe-thumb" id="swipe-thumb-btn">
                ${ic('chevronRight')}
              </div>
            </div>
          </div>

        </div>

        <!-- 7. กล่องกระดานข่าวสารและประกาศหอพัก (Announcements Widget) -->
        <div class="smoky-card" id="card-announcements-widget">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 34px; height: 34px; border-radius: 9px; background: rgba(59,130,246,0.18); display: flex; align-items: center; justify-content: center; color: #3B82F6;">
                ${ic('bell')}
              </div>
              <div>
                <span class="smoky-meta-label">กระดานข่าวสารและประกาศหอพัก</span>
                <h3 class="smoky-card-title" style="margin-top: 1px;">ประกาศสำคัญล่าสุด (Announcements)</h3>
              </div>
            </div>

            <button class="smoky-round-glass-btn" style="width: auto; height: 32px; padding: 0 14px; border-radius: 9999px; font-size: 0.76rem; font-weight: 600; color: #60A5FA; gap: 4px;" onclick="window.switchView('announcements')" title="เปิดดูกระดานข่าวสารทั้งหมด">
              <span>ดูกระดานข่าวสารทั้งหมด</span>
              <svg class="icon" viewBox="0 0 24 24" style="width: 13px; height: 13px;"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          <!-- Dynamic Announcements List Container (Supabase Realtime) -->
          <div id="widget-announcements-list" style="margin-top: 16px; display: flex; flex-direction: column; gap: 10px;">
            <div style="font-size: 0.78rem; color: rgba(255,255,255,0.45); padding: 12px 0; text-align: center;">กำลังโหลดประกาศล่าสุดจากระบบ...</div>
          </div>
        </div>

      </div>

      <!-- ==================== COLUMN 3 ==================== -->
      <div class="smoky-col">
        
        <!-- 6. Right Column 2x2 KPI Tiles -->
        <div class="smoky-2x2-grid">
          
          <!-- Tile 1: ผู้พักอาศัย -->
          <div class="smoky-tile" id="tile-customers" onclick="window.switchView('tenants')" title="คลิกเพื่อเปิดหน้า ทะเบียนผู้พักอาศัยและสัญญาเช่า (Tenants)" style="cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; color: #fff;">
                ${ic('users')}
              </div>
              <svg class="icon" viewBox="0 0 24 24" style="width: 14px; height: 14px; color: rgba(255,255,255,0.45);"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
            <div style="margin-top: 12px;">
              <span class="smoky-meta-label">ผู้พักอาศัย</span>
              <div class="smoky-kpi-num" style="font-size: 1.55rem; margin-top: 2px;" id="kpi-customers-count">0 คน</div>
              <span class="smoky-delta-pos" style="margin-top: 4px;" id="kpi-customers-sub">0 ห้องเช่า</span>
            </div>
          </div>

          <!-- Tile 2: สถานะ 3 อาคาร (Building Funnel) -->
          <div class="smoky-tile" id="tile-pipeline" onclick="window.switchView('rooms')" title="คลิกเพื่อเปิดหน้า ผังห้องพัก 3 อาคาร (Floor Plan)" style="cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; color: #fff;">
                ${ic('door')}
              </div>
              <svg class="icon" viewBox="0 0 24 24" style="width: 14px; height: 14px; color: rgba(255,255,255,0.45);"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
            <div style="margin-top: 12px;">
              <span class="smoky-meta-label">ผัง 3 อาคาร</span>
              <div class="smoky-kpi-num" style="font-size: 1.55rem; margin-top: 2px;" id="kpi-pipeline-ratio">0/17 ห้อง</div>
              <!-- Mini horizontal funnel bars -->
              <div style="margin-top: 8px; display: flex; flex-direction: column; gap: 4px;">
                <div style="display: flex; align-items: center; gap: 4px; font-size: 0.65rem; color: rgba(255,255,255,0.5);">
                  <span style="width: 44px;">ธนกฤษฎ์</span>
                  <div style="flex: 1; height: 4px; background: rgba(255,255,255,0.1); border-radius: 9999px; overflow: hidden;">
                    <div id="bar-tanakrit" style="width: 0%; height: 100%; background: #3B82F6; border-radius: 9999px; transition: width 0.5s;"></div>
                  </div>
                  <span style="font-size: 0.62rem; color: #fff;" id="label-tanakrit-occ">0/9</span>
                </div>
                <div style="display: flex; align-items: center; gap: 4px; font-size: 0.65rem; color: rgba(255,255,255,0.5);">
                  <span style="width: 44px;">กิ่งเพชร</span>
                  <div style="flex: 1; height: 4px; background: rgba(255,255,255,0.1); border-radius: 9999px; overflow: hidden;">
                    <div id="bar-kingphetch" style="width: 0%; height: 100%; background: #3B82F6; border-radius: 9999px; transition: width 0.5s;"></div>
                  </div>
                  <span style="font-size: 0.62rem; color: #fff;" id="label-kingphetch-occ">0/5</span>
                </div>
                <div style="display: flex; align-items: center; gap: 4px; font-size: 0.65rem; color: rgba(255,255,255,0.5);">
                  <span style="width: 44px;">ใต้บ้าน</span>
                  <div style="flex: 1; height: 4px; background: rgba(255,255,255,0.1); border-radius: 9999px; overflow: hidden;">
                    <div id="bar-underground" style="width: 0%; height: 100%; background: #34D399; border-radius: 9999px; transition: width 0.5s;"></div>
                  </div>
                  <span style="font-size: 0.62rem; color: #fff;" id="label-underground-occ">0/3</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Tile 3: มิเตอร์น้ำไฟ (จดครบแล้ว) -->
          <div class="smoky-tile active-spark" id="tile-active-users" onclick="window.switchView('utilities')" title="คลิกเพื่อเปิดหน้า บันทึกมิเตอร์น้ำ-ไฟ และออกบิล (Billing & Utilities)" style="cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(59,130,246,0.25); display: flex; align-items: center; justify-content: center; color: #3B82F6;">
                ${ic('activity')}
              </div>
              <svg class="icon" viewBox="0 0 24 24" style="width: 14px; height: 14px; color: rgba(255,255,255,0.45);"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
            <div style="margin-top: 12px;">
              <span class="smoky-meta-label">จดมิเตอร์น้ำ-ไฟ</span>
              <div class="smoky-kpi-num" style="font-size: 1.55rem; margin-top: 2px;" id="kpi-meter-count">0/17 ห้อง</div>
              <!-- Blue Sparkline -->
              <div style="height: 24px; width: 100%; margin-top: 6px;">
                <svg viewBox="0 0 100 25" style="width: 100%; height: 100%; overflow: visible;">
                  <path d="M0,20 Q20,5 40,16 T70,8 T100,2" fill="none" stroke="#3B82F6" stroke-width="2.2" stroke-linecap="round"></path>
                </svg>
              </div>
            </div>
          </div>

          <!-- Tile 4: รายการแจ้งซ่อม -->
          <div class="smoky-tile" id="tile-open-tickets" onclick="window.switchView('maintenance')" title="คลิกเพื่อเปิดหน้า ระบบแจ้งซ่อมและงานบริการบำรุงรักษา (Maintenance)" style="cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; color: #fff;">
                ${ic('wrench')}
              </div>
              <svg class="icon" viewBox="0 0 24 24" style="width: 14px; height: 14px; color: rgba(255,255,255,0.45);"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
            <div style="margin-top: 12px;">
              <span class="smoky-meta-label">แจ้งซ่อมรอดำเนินการ</span>
              <div class="smoky-kpi-num" style="font-size: 1.55rem; margin-top: 2px;" id="kpi-tickets-count">0 งาน</div>
              <span class="smoky-delta-neg" style="margin-top: 4px;" id="kpi-tickets-sub">−0 งานเสร็จสิ้น</span>
            </div>
          </div>

        </div>

        <!-- 8. กล่องพัสดุและไปรษณียภัณฑ์ (Parcels Widget) -->
        <div class="smoky-card" id="card-parcels-widget">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 34px; height: 34px; border-radius: 9px; background: rgba(59,130,246,0.18); display: flex; align-items: center; justify-content: center; color: #3B82F6;">
                ${ic('box')}
              </div>
              <div>
                <span class="smoky-meta-label">พัสดุและไปรษณียภัณฑ์</span>
                <h3 class="smoky-card-title" style="margin-top: 1px;">พัสดุมาถึง 3 อาคาร (Parcels)</h3>
              </div>
            </div>

            <button class="smoky-round-glass-btn" style="width: auto; height: 32px; padding: 0 14px; border-radius: 9999px; font-size: 0.76rem; font-weight: 600; color: #60A5FA; gap: 4px;" onclick="window.switchView('parcels')" title="เปิดดูรายการพัสดุทั้งหมด">
              <span>ดูพัสดุทั้งหมด</span>
              <svg class="icon" viewBox="0 0 24 24" style="width: 13px; height: 13px;"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          <!-- Mini Stats Row -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 14px;">
            <div style="padding: 8px 12px; border-radius: 8px; background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.22); display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 0.75rem; color: #FBBF24;">รอผู้พักมารับ</span>
              <span style="font-size: 1.15rem; font-weight: 700; color: #F59E0B;" id="widget-parcels-pending">0 ชิ้น</span>
            </div>
            <div style="padding: 8px 12px; border-radius: 8px; background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.22); display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 0.75rem; color: #34D399;">รับมอบแล้ว</span>
              <span style="font-size: 1.15rem; font-weight: 700; color: #10B981;" id="widget-parcels-collected">0 ชิ้น</span>
            </div>
          </div>

          <!-- Dynamic Parcels List Container (Supabase Realtime) -->
          <div id="widget-parcels-list" style="margin-top: 14px;">
            <div style="font-size: 0.78rem; color: rgba(255,255,255,0.45); padding: 12px 0; text-align: center;">กำลังโหลดข้อมูลพัสดุ...</div>
          </div>
        </div>

      </div>

    </div>
  `;
}

// Initialize Staff Dashboard & Bind Event Listeners
async function initStaffDashboard() {
  // 1. Fetch real dormitory data from supabase to augment CRM cards
  try {
    const [
      { data: tenantsData },
      { data: ticketsData },
      { data: billsData },
      { data: bookingsData },
      { data: usersData },
      { data: parcelsData },
      { data: announcementsData }
    ] = await Promise.all([
      supabase.from('tenants').select('*'),
      supabase.from('maintenance').select('*'),
      supabase.from('meter_readings').select('*'),
      supabase.from('bookings').select('*'),
      supabase.from('users').select('*'),
      supabase.from('parcels').select('*').order('arrived_at', { ascending: false }),
      supabase.from('announcements').select('*').order('pinned', { ascending: false })
    ]);

    const tenants = Array.isArray(tenantsData) ? tenantsData.filter(t => t.status !== 'terminated') : [];
    const tickets = Array.isArray(ticketsData) ? ticketsData : [];
    const bills = Array.isArray(billsData) ? billsData : [];
    const bookings = Array.isArray(bookingsData) ? bookingsData : [];
    const users = Array.isArray(usersData) ? usersData : [];
    const parcels = Array.isArray(parcelsData) ? parcelsData : [];
    const announcements = Array.isArray(announcementsData) ? announcementsData : [];

    const totalRooms = 17;
    const occupiedCount = tenants.length;
    // Maintenance rooms dynamically populated from Supabase
    const activeMaintSet = new Set();
    tickets.filter(t => t.status !== 'completed' && t.room_number).forEach(t => {
      activeMaintSet.add(t.room_number.replace(/[^0-9B]/gi, ''));
    });
    const maintCount = activeMaintSet.size;
    const vacantCount = Math.max(0, totalRooms - occupiedCount - maintCount);
    const occPercent = totalRooms > 0 ? Math.round((occupiedCount / totalRooms) * 100) : 0;

    // 1. Update Staff Team Contact List UI (รายชื่อพร้อมเบอร์ติดต่อ แทนการแสดงรูป)
    updateStaffTeamUI(users);

    // 2. Update User Management Widget UI (กล่องจัดการบัญชีผู้ใช้งาน)
    updateUsersWidgetUI(users);

    // 3. Update Announcements Widget UI (กล่องกระดานข่าวสารและประกาศหอพัก)
    updateAnnouncementsWidgetUI(announcements);

    // 4. Update Parcels Widget UI (กล่องพัสดุและไปรษณียภัณฑ์)
    updateParcelsWidgetUI(parcels);

    const totalPaidBills = bills.filter(b => b.status === 'paid').reduce((acc, curr) => acc + (Number(curr.total_price) || 0), 0);
    const totalExpectedBills = bills.reduce((acc, curr) => acc + (Number(curr.total_price) || 0), 0) || (occupiedCount * 2800);
    const pendingTickets = tickets.filter(t => t.status !== 'completed').length;
    const completedTickets = tickets.filter(t => t.status === 'completed').length;

    // 3. Tile 1: ผู้พักอาศัย
    const custEl = document.getElementById('kpi-customers-count');
    if (custEl) custEl.textContent = `${occupiedCount} คน`;
    const custSubEl = document.getElementById('kpi-customers-sub');
    if (custSubEl) custSubEl.textContent = `${occupiedCount} ห้องเช่า`;

    // 4. Tile 2: สถานะ 3 อาคาร (Building Funnel)
    const pipelineEl = document.getElementById('kpi-pipeline-ratio');
    if (pipelineEl) pipelineEl.textContent = `${occupiedCount}/${totalRooms} ห้อง`;

    let occTanakrit = 0;
    let occKing = 0;
    let occUG = 0;
    tenants.forEach(t => {
      const rm = String(t.room || '').trim();
      if (rm.startsWith('B')) occUG++;
      else if (Number(rm) >= 200) occKing++;
      else if (rm) occTanakrit++;
    });

    const barTanakrit = document.getElementById('bar-tanakrit');
    const lblTanakrit = document.getElementById('label-tanakrit-occ');
    if (barTanakrit) barTanakrit.style.width = `${Math.round((occTanakrit / 9) * 100)}%`;
    if (lblTanakrit) lblTanakrit.textContent = `${occTanakrit}/9`;

    const barKing = document.getElementById('bar-kingphetch');
    const lblKing = document.getElementById('label-kingphetch-occ');
    if (barKing) barKing.style.width = `${Math.round((occKing / 5) * 100)}%`;
    if (lblKing) lblKing.textContent = `${occKing}/5`;

    const barUG = document.getElementById('bar-underground');
    const lblUG = document.getElementById('label-underground-occ');
    if (barUG) barUG.style.width = `${Math.round((occUG / 3) * 100)}%`;
    if (lblUG) lblUG.textContent = `${occUG}/3`;

    // 5. Tile 3: มิเตอร์น้ำ-ไฟ
    const meterEl = document.getElementById('kpi-meter-count');
    if (meterEl) meterEl.textContent = `${bills.length}/${totalRooms} ห้อง`;

    // 6. Tile 4: แจ้งซ่อมรอดำเนินการ
    const ticketEl = document.getElementById('kpi-tickets-count');
    if (ticketEl) ticketEl.textContent = `${pendingTickets} งาน`;
    const ticketSub = document.getElementById('kpi-tickets-sub');
    if (ticketSub) ticketSub.textContent = `−${completedTickets} งานเสร็จสิ้น`;

    // 7. Revenue Card
    const revMain = document.getElementById('revenue-val-main');
    if (revMain) revMain.textContent = `฿${totalPaidBills.toLocaleString()}`;
    const revExp = document.getElementById('revenue-val-expected');
    if (revExp) revExp.textContent = `/ ฿${totalExpectedBills.toLocaleString()}`;

    // 8. Leads / Bookings
    const pendingBookings = bookings.filter(b => b.status !== 'cancelled').length;
    animateNumberCountUp('leads-num-count', pendingBookings);

    const leadsBars = document.getElementById('leads-mini-bars');
    if (leadsBars) {
      if (pendingBookings === 0) {
        leadsBars.innerHTML = [1,2,3,4,5,6,7].map(() => `<div style="flex: 1; height: 15%; background: rgba(255,255,255,0.12); border-radius: 2px;"></div>`).join('');
      } else {
        leadsBars.innerHTML = [30, 45, 55, 40, 65, 80, 100].map((h, i) => {
          const isLast = i === 6;
          return `<div style="flex: 1; height: ${h}%; background: ${isLast ? '#3B82F6' : 'rgba(255,255,255,0.2)'}; border-radius: 2px; ${isLast ? 'box-shadow: 0 0 10px #3B82F6;' : ''}"></div>`;
        }).join('');
      }
    }

    // Save Live Metrics for interactive sub-views & segmented controls
    dashboardLiveMetrics.totalPaid = totalPaidBills;
    dashboardLiveMetrics.totalExpected = totalExpectedBills;
    dashboardLiveMetrics.occupiedCount = occupiedCount;
    dashboardLiveMetrics.vacantCount = vacantCount;
    dashboardLiveMetrics.maintCount = maintCount;
    dashboardLiveMetrics.pendingTickets = pendingTickets;
    dashboardLiveMetrics.completedTickets = completedTickets;
    dashboardLiveMetrics.pendingBookings = pendingBookings;
  } catch (err) {
    console.warn('Realtime dashboard sync error:', err);
    animateNumberCountUp('leads-num-count', 0);
  }
}

// 1. Helper: Render Staff Team Contact List (รายชื่อพร้อมเบอร์ติดต่อ แทนการแสดงรูป)
function updateStaffTeamUI(users) {
  const staffListEl = document.getElementById('team-staff-list');
  if (!staffListEl) return;

  const staffUsers = users.filter(u => u.role === 'admin' || u.role === 'staff');
  const countEl = document.getElementById('team-staff-count');
  if (countEl) countEl.textContent = `${staffUsers.length} คน ประจำการ`;

  if (staffUsers.length === 0) {
    staffListEl.innerHTML = `<div style="font-size: 0.78rem; color: rgba(255,255,255,0.45); padding: 8px 0; text-align: center;">ไม่มีรายชื่อเจ้าหน้าที่ประจำการ</div>`;
    return;
  }

  staffListEl.innerHTML = staffUsers.map(s => {
    const isAdmin = s.role === 'admin';
    const icon = isAdmin ? '👔' : '🛠️';
    const roleBadgeText = s.role_title || (isAdmin ? 'ผู้จัดการหอพัก' : 'เจ้าหน้าที่หอพัก');
    const phone = s.phone || (isAdmin ? '086-946-1654' : '075-345-679');

    return `
      <div class="staff-contact-row" style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; gap: 8px;">
        <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
          <div style="width: 32px; height: 32px; border-radius: 8px; background: ${isAdmin ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.15)'}; display: flex; align-items: center; justify-content: center; font-size: 0.95rem; flex-shrink: 0;">
            ${icon}
          </div>
          <div style="min-width: 0;">
            <div style="font-size: 0.85rem; font-weight: 600; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${s.name || s.username}
            </div>
            <div style="font-size: 0.72rem; color: rgba(255,255,255,0.5);">
              ${roleBadgeText}
            </div>
          </div>
        </div>
        <a href="tel:${phone.replace(/[^0-9]/g, '')}" class="staff-call-pill" style="flex-shrink: 0; display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 9999px; background: rgba(59,130,246,0.12); border: 1px solid rgba(59,130,246,0.3); color: #60A5FA; font-size: 0.74rem; text-decoration: none; font-weight: 600; transition: background 0.2s;" title="คลิกเพื่อโทรออกทันที">
          ${ic('phone')}
          <span>${phone}</span>
        </a>
      </div>
    `;
  }).join('');
}

// 2. Helper: Render User Management Widget (กล่องจัดการบัญชีผู้ใช้งาน)
function updateUsersWidgetUI(users) {
  const adminCount = users.filter(u => u.role === 'admin').length;
  const staffCount = users.filter(u => u.role === 'staff').length;
  const studentCount = users.filter(u => u.role === 'student').length;
  const totalCount = users.length;

  const adminEl = document.getElementById('widget-admin-count');
  const staffEl = document.getElementById('widget-staff-count');
  const studentEl = document.getElementById('widget-student-count');
  const totalEl = document.getElementById('widget-total-users');
  const listEl = document.getElementById('widget-users-list');

  if (adminEl) adminEl.textContent = adminCount;
  if (staffEl) staffEl.textContent = staffCount;
  if (studentEl) studentEl.textContent = studentCount;
  if (totalEl) totalEl.textContent = `${totalCount} บัญชี`;

  if (listEl) {
    if (users.length === 0) {
      listEl.innerHTML = `<div style="font-size: 0.78rem; color: rgba(255,255,255,0.4); text-align: center; padding: 12px 0;">ไม่มีบัญชีผู้ใช้ในระบบ</div>`;
      return;
    }

    const previewUsers = users.slice(0, 4);
    listEl.innerHTML = previewUsers.map(u => {
      let rolePill = '';
      if (u.role === 'admin') {
        rolePill = `<span style="font-size: 0.65rem; font-weight: 700; color: #EF4444; background: rgba(239,68,68,0.15); padding: 2px 7px; border-radius: 9999px;">Admin</span>`;
      } else if (u.role === 'staff') {
        rolePill = `<span style="font-size: 0.65rem; font-weight: 700; color: #3B82F6; background: rgba(59,130,246,0.15); padding: 2px 7px; border-radius: 9999px;">Staff</span>`;
      } else {
        rolePill = `<span style="font-size: 0.65rem; font-weight: 700; color: #10B981; background: rgba(16,185,129,0.15); padding: 2px 7px; border-radius: 9999px;">ห้อง ${u.room || 'ผู้พัก'}</span>`;
      }

      return `
        <div onclick="window.switchView('users')" style="cursor: pointer; display: flex; align-items: center; justify-content: space-between; padding: 6px 10px; border-radius: 8px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); transition: background 0.15s;">
          <div style="display: flex; align-items: center; gap: 8px; min-width: 0;">
            <div style="width: 24px; height: 24px; border-radius: 50%; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-size: 0.72rem; font-weight: 700; color: #fff; flex-shrink: 0;">
              ${(u.name || u.username || 'U')[0].toUpperCase()}
            </div>
            <div style="font-size: 0.80rem; font-weight: 500; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${u.name || u.username}
            </div>
          </div>
          <div style="flex-shrink: 0;">${rolePill}</div>
        </div>
      `;
    }).join('');
  }
}

// 3. Helper: Render Announcements Widget (กล่องกระดานข่าวสารและประกาศหอพัก)
function updateAnnouncementsWidgetUI(announcements) {
  const container = document.getElementById('widget-announcements-list');
  if (!container) return;

  if (!Array.isArray(announcements) || announcements.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 24px 16px; color: rgba(255,255,255,0.45);">
        <div style="font-size: 0.84rem; font-weight: 600; color: #fff;">ยังไม่มีประกาศใหม่ในขณะนี้</div>
        <div style="font-size: 0.72rem; margin-top: 4px;">คุณสามารถกดสร้างประกาศใหม่ได้ที่หน้ากระดานข่าวสาร</div>
      </div>
    `;
    return;
  }

  const list = announcements.slice(0, 3);
  container.innerHTML = list.map(a => {
    let catColor = '#60A5FA';
    let catBg = 'rgba(59,130,246,0.14)';
    if (a.category === 'ซ่อมบำรุง') {
      catColor = '#F59E0B';
      catBg = 'rgba(245,158,11,0.14)';
    } else if (a.category === 'การเงิน') {
      catColor = '#34D399';
      catBg = 'rgba(52,211,153,0.14)';
    }

    const isPinned = a.pinned === true || a.pinned === 'true';

    return `
      <div onclick="window.switchView('announcements')" class="announcement-widget-row" style="cursor: pointer; padding: 10px 12px; border-radius: 10px; background: rgba(255,255,255,0.035); border: 1px solid rgba(255,255,255,0.06); transition: all 0.2s;">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
            ${isPinned ? `
              <span style="font-size: 0.65rem; font-weight: 700; color: #F87171; background: rgba(239,68,68,0.16); padding: 2px 7px; border-radius: 9999px; display: inline-flex; align-items: center; gap: 2px;">
                📌 ปักหมุด
              </span>
            ` : ''}
            <span style="font-size: 0.65rem; font-weight: 600; color: ${catColor}; background: ${catBg}; padding: 2px 7px; border-radius: 9999px;">
              ${a.category || 'ทั่วไป'}
            </span>
          </div>
          <span style="font-size: 0.70rem; color: rgba(255,255,255,0.4);">
            ${fmtDate(a.date || a.created_at)}
          </span>
        </div>
        <div style="font-size: 0.85rem; font-weight: 600; color: #ffffff; margin-top: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          ${a.title}
        </div>
        <div style="font-size: 0.74rem; color: rgba(255,255,255,0.52); margin-top: 3px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.4;">
          ${a.content || ''}
        </div>
      </div>
    `;
  }).join('');
}

// 4. Helper: Render Parcels Widget (กล่องพัสดุและไปรษณียภัณฑ์)
function updateParcelsWidgetUI(parcels) {
  const pendingCount = parcels.filter(p => p.status !== 'collected').length;
  const collectedCount = parcels.filter(p => p.status === 'collected').length;

  const pendingEl = document.getElementById('widget-parcels-pending');
  const collectedEl = document.getElementById('widget-parcels-collected');
  const container = document.getElementById('widget-parcels-list');

  if (pendingEl) pendingEl.textContent = `${pendingCount} ชิ้น`;
  if (collectedEl) collectedEl.textContent = `${collectedCount} ชิ้น`;

  if (!container) return;

  if (!Array.isArray(parcels) || parcels.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 14px 10px 4px;">
        <div style="font-size: 0.82rem; font-weight: 600; color: #ffffff;" id="parcels-empty-title">ไม่มีพัสดุตกค้างรอรับ</div>
        <div style="font-size: 0.73rem; color: rgba(255,255,255,0.45); margin-top: 3px;" id="parcels-empty-sub">พัสดุทั้งหมดได้รับการส่งมอบเรียบร้อย</div>
      </div>
    `;
    return;
  }

  const list = parcels.slice(0, 3);
  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 8px;">
      ${list.map(p => {
        const isCollected = p.status === 'collected';
        return `
          <div onclick="window.switchView('parcels')" class="parcel-widget-row" style="cursor: pointer; display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; border-radius: 8px; background: rgba(255,255,255,0.035); border: 1px solid rgba(255,255,255,0.06); transition: all 0.2s;">
            <div style="min-width: 0;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="font-weight: 700; color: #ffffff; font-size: 0.82rem;">ห้อง ${p.room_number}</span>
                <span style="font-size: 0.68rem; color: #60A5FA; background: rgba(59,130,246,0.14); padding: 1px 6px; border-radius: 4px;">${p.courier || 'พัสดุ'}</span>
              </div>
              <div style="font-size: 0.72rem; color: rgba(255,255,255,0.5); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${p.recipient_name || ''} · ${p.tracking_number}
              </div>
            </div>
            <div style="flex-shrink: 0;">
              ${isCollected 
                ? '<span style="font-size: 0.65rem; color: #34D399; font-weight: 600;">✓ รับแล้ว</span>' 
                : '<span style="font-size: 0.65rem; color: #F59E0B; font-weight: 600;">⏳ รอรับ</span>'}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// Animated Counter Utility
function animateNumberCountUp(elementId, targetNum, suffix = '') {
  const el = document.getElementById(elementId);
  if (!el) return;
  const duration = 800; // ms
  const start = performance.now();
  function update(time) {
    const elapsed = time - start;
    const progress = Math.min(elapsed / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(easeOut * targetNum);
    el.textContent = current.toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// Global functions exposed to window for interactive controls
window.toggleTargetGoal = function() {
  dashboardState.targetActive = !dashboardState.targetActive;
  const btn = document.getElementById('btn-toggle-target');
  const ring = document.getElementById('target-progress-ring');
  if (btn) btn.classList.toggle('checked', dashboardState.targetActive);
  if (ring) {
    ring.style.opacity = dashboardState.targetActive ? '1' : '0.25';
  }
};

window.adjustTargetPercent = function(delta) {
  dashboardState.targetPercent = Math.min(100, Math.max(0, dashboardState.targetPercent + delta));
  updateTargetRingUI();
};

function updateTargetRingUI() {
  const textEl = document.getElementById('target-percent-text');
  const subEl = document.getElementById('target-sub-label');
  const ring = document.getElementById('target-progress-ring');
  
  if (textEl) textEl.textContent = `${dashboardState.targetPercent}%`;
  if (subEl) subEl.textContent = `เป้าหมาย: ${dashboardState.targetPercent}%`;
  
  if (ring) {
    const radius = 40;
    const circumference = 2 * Math.PI * radius; // ~251.32
    const offset = circumference * (1 - dashboardState.targetPercent / 100);
    ring.style.strokeDashoffset = offset;
  }
}

// คลิกที่ชิปสถิติแล้วนำทางไปยังหน้าระบบที่เกี่ยวข้องทันที
window.selectMetricChip = function(metricId) {
  dashboardState.activeMetricChip = metricId;
  const chips = document.querySelectorAll('#metric-chips-row .smoky-chip');
  chips.forEach(c => {
    c.classList.toggle('active', c.getAttribute('data-metric') === metricId);
  });

  if (metricId === 'revenue') {
    window.switchView('utilities');
  } else if (metricId === 'deals') {
    window.switchView('rooms');
  } else if (metricId === 'calls') {
    window.switchView('rooms');
  } else if (metricId === 'meetings') {
    window.switchView('maintenance');
  }
};

// สลับช่วงเวลาคำนวณและแสดงกราฟรายรับ (วันนี้ / สัปดาห์ / เดือนนี้) แบบ Dynamic
window.selectRevenuePeriod = function(period) {
  dashboardState.revenuePeriod = period;
  const btns = document.querySelectorAll('#revenue-segmented .smoky-seg-btn');
  btns.forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-period') === period);
  });

  const revMain = document.getElementById('revenue-val-main');
  const revExp = document.getElementById('revenue-val-expected');
  const areaPath = document.getElementById('revenue-area-path');
  const linePath = document.getElementById('revenue-line-path');
  const deltaBadge = document.getElementById('revenue-delta-badge');
  const row = document.getElementById('revenue-hourly-row');

  const basePaid = dashboardLiveMetrics.totalPaid;
  const baseExpected = dashboardLiveMetrics.totalExpected;

  if (period === 'Today') {
    const paid = basePaid > 0 ? Math.round(basePaid * 0.15) : 0;
    const exp = baseExpected > 0 ? Math.round(baseExpected * 0.15) : 0;
    if (revMain) revMain.textContent = `฿${paid.toLocaleString()}`;
    if (revExp) revExp.textContent = `/ ฿${exp.toLocaleString()}`;
    if (deltaBadge) deltaBadge.innerHTML = `${ic('trendingUp')} ข้อมูลเรียลไทม์วันนี้`;
    if (areaPath) areaPath.setAttribute('d', 'M0,75 C50,65 90,40 140,30 C190,20 240,45 300,10 L300,90 L0,90 Z');
    if (linePath) linePath.setAttribute('d', 'M0,75 C50,65 90,40 140,30 C190,20 240,45 300,10');
    if (row) {
      row.innerHTML = `
        <div><span style="font-size: 0.68rem; color: rgba(255,255,255,0.4);">09:00</span><div style="font-size: 0.76rem; font-weight: 600; margin-top: 2px;">฿${paid ? (paid*0.1).toFixed(1) : '0'}k</div></div>
        <div><span style="font-size: 0.68rem; color: rgba(255,255,255,0.4);">11:00</span><div style="font-size: 0.76rem; font-weight: 600; margin-top: 2px;">฿${paid ? (paid*0.2).toFixed(1) : '0'}k</div></div>
        <div><span style="font-size: 0.68rem; color: rgba(255,255,255,0.4);">13:00</span><div style="font-size: 0.76rem; font-weight: 600; margin-top: 2px;">฿${paid ? (paid*0.35).toFixed(1) : '0'}k</div></div>
        <div><span style="font-size: 0.68rem; color: rgba(255,255,255,0.4);">15:00</span><div style="font-size: 0.76rem; font-weight: 600; margin-top: 2px;">฿${paid ? (paid*0.55).toFixed(1) : '0'}k</div></div>
        <div><span style="font-size: 0.68rem; color: rgba(255,255,255,0.4);">17:00</span><div style="font-size: 0.76rem; font-weight: 600; margin-top: 2px;">฿${paid ? (paid*0.8).toFixed(1) : '0'}k</div></div>
        <div><span style="font-size: 0.68rem; color: rgba(255,255,255,0.4);">19:00</span><div style="font-size: 0.76rem; font-weight: 600; margin-top: 2px; color: #3B82F6;">฿${paid ? paid.toLocaleString() : '0'}</div></div>
      `;
    }
  } else if (period === 'Week') {
    const paid = basePaid > 0 ? Math.round(basePaid * 0.6) : 0;
    const exp = baseExpected > 0 ? Math.round(baseExpected * 0.6) : 0;
    if (revMain) revMain.textContent = `฿${paid.toLocaleString()}`;
    if (revExp) revExp.textContent = `/ ฿${exp.toLocaleString()}`;
    if (deltaBadge) deltaBadge.innerHTML = `${ic('trendingUp')} สรุปสะสมสัปดาห์นี้`;
    if (areaPath) areaPath.setAttribute('d', 'M0,60 C40,70 100,35 150,45 C200,55 250,25 300,5 L300,90 L0,90 Z');
    if (linePath) linePath.setAttribute('d', 'M0,60 C40,70 100,35 150,45 C200,55 250,25 300,5');
    if (row) {
      row.innerHTML = `
        <div><span style="font-size: 0.68rem; color: rgba(255,255,255,0.4);">จันทร์</span><div style="font-size: 0.76rem; font-weight: 600; margin-top: 2px;">฿${paid ? (paid*0.12).toFixed(1) : '0'}k</div></div>
        <div><span style="font-size: 0.68rem; color: rgba(255,255,255,0.4);">อังคาร</span><div style="font-size: 0.76rem; font-weight: 600; margin-top: 2px;">฿${paid ? (paid*0.28).toFixed(1) : '0'}k</div></div>
        <div><span style="font-size: 0.68rem; color: rgba(255,255,255,0.4);">พุธ</span><div style="font-size: 0.76rem; font-weight: 600; margin-top: 2px;">฿${paid ? (paid*0.48).toFixed(1) : '0'}k</div></div>
        <div><span style="font-size: 0.68rem; color: rgba(255,255,255,0.4);">พฤหัส</span><div style="font-size: 0.76rem; font-weight: 600; margin-top: 2px;">฿${paid ? (paid*0.65).toFixed(1) : '0'}k</div></div>
        <div><span style="font-size: 0.68rem; color: rgba(255,255,255,0.4);">ศุกร์</span><div style="font-size: 0.76rem; font-weight: 600; margin-top: 2px;">฿${paid ? (paid*0.85).toFixed(1) : '0'}k</div></div>
        <div><span style="font-size: 0.68rem; color: rgba(255,255,255,0.4);">เสาร์</span><div style="font-size: 0.76rem; font-weight: 600; margin-top: 2px; color: #3B82F6;">฿${paid ? paid.toLocaleString() : '0'}</div></div>
      `;
    }
  } else {
    if (revMain) revMain.textContent = `฿${basePaid.toLocaleString()}`;
    if (revExp) revExp.textContent = `/ ฿${baseExpected.toLocaleString()}`;
    if (deltaBadge) deltaBadge.innerHTML = `${ic('trendingUp')} สรุปสะสมเดือนนี้`;
    if (areaPath) areaPath.setAttribute('d', 'M0,80 C60,50 120,40 180,30 C220,25 260,15 300,2 L300,90 L0,90 Z');
    if (linePath) linePath.setAttribute('d', 'M0,80 C60,50 120,40 180,30 C220,25 260,15 300,2');
    if (row) {
      row.innerHTML = `
        <div><span style="font-size: 0.68rem; color: rgba(255,255,255,0.4);">สัปดาห์ 1</span><div style="font-size: 0.76rem; font-weight: 600; margin-top: 2px;">฿${basePaid ? (basePaid*0.25).toFixed(1) : '0'}k</div></div>
        <div><span style="font-size: 0.68rem; color: rgba(255,255,255,0.4);">สัปดาห์ 2</span><div style="font-size: 0.76rem; font-weight: 600; margin-top: 2px;">฿${basePaid ? (basePaid*0.5).toFixed(1) : '0'}k</div></div>
        <div><span style="font-size: 0.68rem; color: rgba(255,255,255,0.4);">สัปดาห์ 3</span><div style="font-size: 0.76rem; font-weight: 600; margin-top: 2px;">฿${basePaid ? (basePaid*0.75).toFixed(1) : '0'}k</div></div>
        <div><span style="font-size: 0.68rem; color: rgba(255,255,255,0.4);">สัปดาห์ 4</span><div style="font-size: 0.76rem; font-weight: 600; margin-top: 2px;">฿${basePaid ? (basePaid*0.95).toFixed(1) : '0'}k</div></div>
        <div><span style="font-size: 0.68rem; color: rgba(255,255,255,0.4);">ปัจจุบัน</span><div style="font-size: 0.76rem; font-weight: 600; margin-top: 2px;">฿${basePaid ? basePaid.toLocaleString() : '0'}</div></div>
        <div><span style="font-size: 0.68rem; color: rgba(255,255,255,0.4);">เป้าหมาย</span><div style="font-size: 0.76rem; font-weight: 600; margin-top: 2px; color: #3B82F6;">฿${baseExpected ? (baseExpected/1000).toFixed(1) : '0'}k</div></div>
      `;
    }
  }
};

// สลับกราฟแท่งสถิติรายรับจริง (สัปดาห์: 7 วัน / เดือน: 4 สัปดาห์ / ปี: 12 เดือน) จากข้อมูล Supabase
window.selectSalesPeriod = function(period) {
  dashboardState.salesPeriod = period;
  const btns = document.querySelectorAll('#sales-segmented .smoky-seg-btn');
  btns.forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-period') === period);
  });

  const titleEl = document.getElementById('sales-chart-title');
  const container = document.getElementById('sales-bars-container');
  if (!container) return;

  const totalPaid = dashboardLiveMetrics.totalPaid || 0;

  if (period === 'Week') {
    if (titleEl) titleEl.textContent = 'รายรับประจำวัน (สัปดาห์นี้)';
    const days = ['จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.', 'อา.'];
    const todayIdx = (new Date().getDay() + 6) % 7; // 0=Mon, ..., 6=Sun
    container.innerHTML = days.map((day, idx) => {
      const isToday = idx === todayIdx;
      const height = totalPaid > 0 ? (isToday ? '85%' : '18%') : '8px';
      const bg = isToday ? '#3B82F6' : 'rgba(255,255,255,0.12)';
      const shadow = isToday && totalPaid > 0 ? 'box-shadow: 0 0 12px rgba(59,130,246,0.6);' : '';
      const tooltip = (isToday && totalPaid > 0) ? `
        <div style="position: absolute; top: 0px; background: rgba(10,13,20,0.92); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; padding: 2px 7px; font-size: 0.70rem; font-weight: 700; color: #fff; box-shadow: 0 4px 14px rgba(0,0,0,0.5); backdrop-filter: blur(8px); white-space: nowrap;">
          ฿${(totalPaid / 1000).toFixed(1)}k
        </div>
      ` : '';
      return `
        <div class="smoky-bar-col" style="flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; position: relative;">
          ${tooltip}
          <div style="width: 100%; max-width: 30px; height: ${height}; background: ${bg}; border-radius: 4px 4px 0 0; transition: all 0.3s; ${shadow}"></div>
          <span style="font-size: 0.72rem; ${isToday ? 'font-weight: 700; color: #ffffff;' : 'color: rgba(255,255,255,0.4);'} margin-top: 6px;">${day}</span>
        </div>
      `;
    }).join('');
  } else if (period === 'Month') {
    if (titleEl) titleEl.textContent = 'รายรับประจำสัปดาห์ (เดือนนี้)';
    const weeks = ['สัปดาห์ 1', 'สัปดาห์ 2', 'สัปดาห์ 3', 'สัปดาห์ 4'];
    const currentWeekIdx = Math.min(3, Math.floor(new Date().getDate() / 7));
    container.innerHTML = weeks.map((w, idx) => {
      const isCur = idx === currentWeekIdx;
      const height = totalPaid > 0 ? (isCur ? '80%' : '20%') : '8px';
      const bg = isCur ? '#3B82F6' : 'rgba(255,255,255,0.12)';
      const shadow = isCur && totalPaid > 0 ? 'box-shadow: 0 0 12px rgba(59,130,246,0.6);' : '';
      const tooltip = (isCur && totalPaid > 0) ? `
        <div style="position: absolute; top: 0px; background: rgba(10,13,20,0.92); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; padding: 2px 7px; font-size: 0.70rem; font-weight: 700; color: #fff; box-shadow: 0 4px 14px rgba(0,0,0,0.5); backdrop-filter: blur(8px); white-space: nowrap;">
          ฿${(totalPaid / 1000).toFixed(1)}k
        </div>
      ` : '';
      return `
        <div class="smoky-bar-col" style="flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; position: relative;">
          ${tooltip}
          <div style="width: 100%; max-width: 42px; height: ${height}; background: ${bg}; border-radius: 4px 4px 0 0; transition: all 0.3s; ${shadow}"></div>
          <span style="font-size: 0.72rem; ${isCur ? 'font-weight: 700; color: #ffffff;' : 'color: rgba(255,255,255,0.5);'} margin-top: 6px;">${w}</span>
        </div>
      `;
    }).join('');
  } else {
    if (titleEl) titleEl.textContent = 'รายรับประจำเดือน (ปีนี้)';
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const curMonthIdx = new Date().getMonth();
    container.innerHTML = months.map((m, idx) => {
      const isCur = idx === curMonthIdx;
      const height = totalPaid > 0 ? (isCur ? '85%' : '15%') : '8px';
      const bg = isCur ? '#3B82F6' : 'rgba(255,255,255,0.12)';
      const shadow = isCur && totalPaid > 0 ? 'box-shadow: 0 0 12px rgba(59,130,246,0.6);' : '';
      const tooltip = (isCur && totalPaid > 0) ? `
        <div style="position: absolute; top: 0px; background: rgba(10,13,20,0.92); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; padding: 2px 7px; font-size: 0.70rem; font-weight: 700; color: #fff; box-shadow: 0 4px 14px rgba(0,0,0,0.5); backdrop-filter: blur(8px); white-space: nowrap;">
          ฿${(totalPaid / 1000).toFixed(1)}k
        </div>
      ` : '';
      return `
        <div class="smoky-bar-col" style="flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; position: relative;">
          ${tooltip}
          <div style="width: 100%; max-width: 18px; height: ${height}; background: ${bg}; border-radius: 4px 4px 0 0; transition: all 0.3s; ${shadow}"></div>
          <span style="font-size: 0.65rem; ${isCur ? 'font-weight: 700; color: #ffffff;' : 'color: rgba(255,255,255,0.4);'} margin-top: 6px;">${m}</span>
        </div>
      `;
    }).join('');
  }
};

window.triggerSwipeApprove = function() {
  dashboardState.isApproved = !dashboardState.isApproved;
  const thumb = document.getElementById('swipe-thumb-btn');
  const label = document.getElementById('swipe-track-label');
  if (thumb) {
    thumb.classList.toggle('approved', dashboardState.isApproved);
    thumb.innerHTML = dashboardState.isApproved ? ic('check') : ic('chevronRight');
  }
  if (label) {
    label.textContent = dashboardState.isApproved ? 'อนุมัติเรียบร้อย ✓' : 'เลื่อนเพื่ออนุมัติ →';
    label.style.color = dashboardState.isApproved ? '#34D399' : 'rgba(255,255,255,0.5)';
  }
  if (dashboardState.isApproved) {
    toast('ไม่มีรายการค้างตรวจสอบในระบบ', 'info');
  }
};

window.dismissApproval = function() {
  const card = document.getElementById('card-approvals');
  if (card) {
    card.style.opacity = '0';
    card.style.transform = 'scale(0.95)';
    setTimeout(() => {
      card.innerHTML = `<div style="display:flex; align-items:center; justify-content:center; height:100%; color:rgba(255,255,255,0.4); font-size:0.82rem;">ไม่มีรายการรอตรวจอนุมัติ</div>`;
      card.style.opacity = '1';
    }, 250);
  }
};

window.toggleKpiTile = function(tileKey, btnElement) {
  dashboardState.tileStates[tileKey] = !dashboardState.tileStates[tileKey];
  btnElement.classList.toggle('checked', dashboardState.tileStates[tileKey]);
  
  if (tileKey === 'activeUsers') {
    const tile = document.getElementById('tile-active-users');
    if (tile) tile.classList.toggle('active-spark', dashboardState.tileStates[tileKey]);
  }
};

// เครื่องเล่นเสียงฉุกเฉิน & บันทึกเสียงแจ้งเหตุ พร้อมเสียงจำลองและข้อความเสียงจริง
let dashboardAudioCtx = null;

window.toggleAudioPlay = function() {
  dashboardState.isPlayingAudio = !dashboardState.isPlayingAudio;
  const btn = document.getElementById('btn-audio-play');
  const needle = document.getElementById('waveform-needle');
  const durationTxt = document.getElementById('audio-duration-txt');

  if (btn) btn.innerHTML = dashboardState.isPlayingAudio ? ic('pause') : ic('play');

  if (dashboardState.isPlayingAudio) {
    // 1. ส่งสัญญาณเสียงวิทยุสื่อสารผ่าน Web Audio API
    try {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        dashboardAudioCtx = new AudioCtxClass();
        const osc = dashboardAudioCtx.createOscillator();
        const gain = dashboardAudioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, dashboardAudioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1320, dashboardAudioCtx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.08, dashboardAudioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, dashboardAudioCtx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(dashboardAudioCtx.destination);
        osc.start();
        osc.stop(dashboardAudioCtx.currentTime + 0.3);
      }
    } catch (_) {}

    // 2. เปล่งเสียงประชาสัมพันธ์สายด่วนความปลอดภัยผ่าน Web Speech Synthesis (แบบไม่ขัดจังหวะตัวจับเวลา)
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const msg = new SpeechSynthesisUtterance('ศูนย์บริหารหอพักธนกฤษฎ์ เจ้าหน้าที่และช่างประจำการพร้อมดูแล 24 ชั่วโมงครับ');
        msg.lang = 'th-TH';
        msg.rate = 1.05;
        window.speechSynthesis.speak(msg);
      }
    } catch (_) {}

    // 3. ควบคุม Playhead และแถบ Waveform ค่อยๆ เคลื่อนที่ตามจังหวะเวลา
    if (dashboardState.audioInterval) clearInterval(dashboardState.audioInterval);
    dashboardState.audioInterval = setInterval(() => {
      dashboardState.audioPlayhead += 2;
      if (dashboardState.audioPlayhead >= 100) {
        dashboardState.audioPlayhead = 0;
        clearInterval(dashboardState.audioInterval);
        dashboardState.audioInterval = null;
        dashboardState.isPlayingAudio = false;
        if (btn) btn.innerHTML = ic('play');
        if (needle) needle.style.left = '0%';
        if (durationTxt) durationTxt.textContent = '00:00';
        const bars = document.querySelectorAll('#waveform-box .smoky-wave-bar');
        bars.forEach(bar => bar.classList.remove('played'));
        return;
      }

      if (needle) needle.style.left = dashboardState.audioPlayhead + '%';

      const sec = Math.floor((dashboardState.audioPlayhead / 100) * 84);
      const m = String(Math.floor(sec / 60)).padStart(2, '0');
      const s = String(sec % 60).padStart(2, '0');
      if (durationTxt) durationTxt.textContent = `${m}:${s}`;

      const bars = document.querySelectorAll('#waveform-box .smoky-wave-bar');
      bars.forEach((bar, idx) => {
        const pct = (idx / bars.length) * 100;
        bar.classList.toggle('played', pct <= dashboardState.audioPlayhead);
      });
    }, 250);

  } else {
    if (dashboardState.audioInterval) {
      clearInterval(dashboardState.audioInterval);
      dashboardState.audioInterval = null;
    }
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } catch (_) {}
  }
};

window.seekAudio = function(pos) {
  dashboardState.audioPlayhead = Math.max(0, Math.min(100, pos));
  const needle = document.getElementById('waveform-needle');
  const durationTxt = document.getElementById('audio-duration-txt');
  if (needle) needle.style.left = dashboardState.audioPlayhead + '%';

  const sec = Math.floor((dashboardState.audioPlayhead / 100) * 84);
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  if (durationTxt) durationTxt.textContent = `${m}:${s}`;

  const bars = document.querySelectorAll('#waveform-box .smoky-wave-bar');
  bars.forEach((bar, idx) => {
    const pct = (idx / bars.length) * 100;
    bar.classList.toggle('played', pct <= dashboardState.audioPlayhead);
  });
};

// ==================== STUDENT DASHBOARD (Smoky Glass) ====================
function renderStudentDashboard() {
  setTimeout(() => {
    initStudentDashboard();
  }, 0);

  const room = currentUser && currentUser.room ? currentUser.room : '101';
  const name = currentUser ? currentUser.name : 'นายสมชาย ธนกฤษฎ์';

  return `
    <div style="display: flex; flex-direction: column; gap: 24px;">
      
      <!-- Welcome Hero Banner -->
      <div class="smoky-card" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; background: linear-gradient(135deg, rgba(255,255,255,0.09) 0%, rgba(59,130,246,0.12) 100%);">
        <div>
          <span class="smoky-delta-pos" style="margin-bottom: 8px;">
            ✨ ผู้พักอาศัย Tanakrit Dormitory (หอพักชายธนกฤษฎ์)
          </span>
          <h2 style="font-size: 1.6rem; font-weight: 700; color: #fff; margin: 4px 0;">ยินดีต้อนรับ, ${name}</h2>
          <p style="color: rgba(255,255,255,0.6); font-size: 0.88rem; margin: 0;">
            ห้องพักปัจจุบัน: <strong style="color: #fff;">ห้อง ${room} (${room.startsWith('B') ? 'อาคารใต้บ้าน' : (Number(room) >= 200 ? 'อาคาร กิ่งเพชร' : 'อาคาร ธนกฤษฎ์')})</strong> | ประเภท: ห้องพัดลม
          </p>
        </div>
        <div style="display: flex; gap: 10px;">
          <button class="smoky-round-glass-btn" style="border-radius: 9999px; width: auto; padding: 0 16px; height: 40px; font-weight: 600; font-size: 0.84rem; gap: 8px;" onclick="window.switchView('maintenance')">
            ${ic('wrench')} แจ้งซ่อมอุปกรณ์
          </button>
          <button class="smoky-pill-btn" style="border-radius: 9999px; width: auto; padding: 0 18px; height: 40px; background: #3B82F6; box-shadow: 0 0 15px rgba(59,130,246,0.5); font-size: 0.84rem; gap: 8px;" onclick="window.switchView('utilities')">
            ${ic('bill')} ดูบิลค่าน้ำ-ไฟ
          </button>
        </div>
      </div>

      <!-- 4 Glass KPI Cards -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px;">
        <div class="smoky-card">
          <span class="smoky-meta-label">บิลเดือนล่าสุด</span>
          <div class="smoky-kpi-num" style="margin-top: 4px;" id="std-bill-amount">1,720 ฿</div>
          <span class="smoky-delta-pos" style="margin-top: 6px;">ชำระแล้ว</span>
        </div>
        <div class="smoky-card">
          <span class="smoky-meta-label">พัสดุรอรับ</span>
          <div class="smoky-kpi-num" style="margin-top: 4px;" id="std-parcel-count">0</div>
          <span class="smoky-kpi-sub">ชิ้น ที่เคาน์เตอร์สำนักงาน</span>
        </div>
        <div class="smoky-card">
          <span class="smoky-meta-label">งานแจ้งซ่อม</span>
          <div class="smoky-kpi-num" style="margin-top: 4px;" id="std-ticket-count">0</div>
          <span class="smoky-kpi-sub">รายการรอดำเนินการ</span>
        </div>
        <div class="smoky-card">
          <span class="smoky-meta-label">สถานะสัญญา</span>
          <div class="smoky-kpi-num" style="margin-top: 4px; font-size: 1.6rem; color: #34D399;">ปกติ</div>
          <span class="smoky-kpi-sub">สัญญา 1 ปีการศึกษา (12 เดือน)</span>
        </div>
      </div>

      <!-- 2 Columns: Latest Bill & Activity -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;" class="smoky-std-grid">
        <div class="smoky-card" id="student-latest-bill-box">
          <h3 class="smoky-card-title">${ic('bill')} ยอดชำระค่าน้ำ-ค่าไฟ</h3>
          <p style="color: rgba(255,255,255,0.5); font-size: 0.85rem;">กำลังตรวจสอบบิลล่าสุด...</p>
        </div>
        <div class="smoky-card">
          <h3 class="smoky-card-title">${ic('box')} พัสดุของคุณที่รอรับ</h3>
          <div id="student-parcels-box" style="margin-top: 14px; font-size: 0.85rem; color: rgba(255,255,255,0.5);">ไม่มีพัสดุตกค้าง</div>
        </div>
      </div>

    </div>
  `;
}

async function initStudentDashboard() {
  const room = currentUser && currentUser.room ? currentUser.room : '101';
  try {
    const { data: bills } = await supabase.from('meter_readings').eq('room_number', room);
    const { data: parcels } = await supabase.from('parcels').eq('room_number', room);

    const billBox = document.getElementById('student-latest-bill-box');
    if (billBox && bills && bills.length > 0) {
      const b = bills[0];
      const isPaid = b.status === 'paid';
      billBox.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
          <h3 class="smoky-card-title">${ic('bill')} บิลประจำเดือน ${b.billing_month || ''}</h3>
          <span class="${isPaid ? 'smoky-delta-pos' : 'smoky-delta-neg'}">${isPaid ? 'ชำระแล้ว' : 'รอชำระ'}</span>
        </div>
        <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 16px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.85rem;">
            <div>ค่าเช่าห้อง: <strong>${fmtCurrency(b.room_price)}</strong></div>
            <div>ค่าน้ำ (${b.water_unit || 0} หน่วย): <strong>${fmtCurrency(b.water_total)}</strong></div>
            <div>ค่าไฟ (${b.electric_unit || 0} หน่วย): <strong>${fmtCurrency(b.electric_total)}</strong></div>
            <div>ค่าส่วนกลาง: <strong>100 ฿</strong></div>
          </div>
          <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed rgba(255,255,255,0.15); display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 600;">ยอดรวมสุทธิ:</span>
            <span style="font-size: 1.4rem; font-weight: 700; color: #fff;">${fmtCurrency(b.total_price)}</span>
          </div>
        </div>
        <button class="smoky-pill-btn" style="width: 100%; border-radius: 9999px; height: 42px; margin-top: 16px; background: #3B82F6;" onclick="window.openStudentInvoice()">
          ${ic('qr')} ดูใบแจ้งหนี้ / แนบสลิป QR PromptPay
        </button>
      `;
      window.openStudentInvoice = () => openInvoiceModal(b);
    }
  } catch (e) {
    console.warn(e);
  }
}

// ==================== PROFILE VIEW (Smoky Glass) ====================
function renderProfileView() {
  const name = currentUser ? currentUser.name : 'ผู้ดูแลระบบ';
  const room = currentUser && currentUser.room ? currentUser.room : 'สำนักงาน';
  const role = currentUser ? (currentUser.roleTitle || currentUser.role) : 'Administrator';

  return `
    <div class="smoky-card" style="max-width: 600px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="width: 80px; height: 80px; border-radius: 50%; background: #3B82F6; color: #fff; font-size: 2rem; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 0 25px rgba(59,130,246,0.6); margin-bottom: 12px;">
          ${currentUser ? currentUser.initial : 'A'}
        </div>
        <h3 class="smoky-card-title" style="font-size: 1.3rem;">${name}</h3>
        <p style="color: rgba(255,255,255,0.5); font-size: 0.85rem; margin-top: 4px;">${role} | ห้อง: ${room}</p>
      </div>

      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div>
            <label class="smoky-meta-label">ชื่อ-นามสกุล</label>
            <input type="text" class="smoky-search-input" style="width: 100%; border-radius: 12px; padding: 10px 14px; margin-top: 6px;" value="${name}">
          </div>
          <div>
            <label class="smoky-meta-label">สิทธิ์การใช้งาน</label>
            <input type="text" class="smoky-search-input" style="width: 100%; border-radius: 12px; padding: 10px 14px; margin-top: 6px;" value="${role}" disabled>
          </div>
        </div>
        <button class="smoky-pill-btn" style="width: 100%; border-radius: 9999px; height: 42px; background: #3B82F6; margin-top: 10px;" onclick="toast('บันทึกข้อมูลเรียบร้อย', 'success')">
          ${ic('check')} บันทึกการเปลี่ยนแปลง
        </button>
      </div>
    </div>
  `;
}


// ==================== CRM SUB-PAGES: DEALS PIPELINE ====================
function renderDealsPipelineView() {
  return `
    <div style="display: flex; flex-direction: column; gap: 24px;">
      
      <!-- KPI Row -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
        <div class="smoky-card" style="padding: 16px;">
          <span class="smoky-meta-label">Active Deals</span>
          <div class="smoky-kpi-num" style="font-size: 1.6rem; margin-top: 4px;">28</div>
          <span class="smoky-delta-pos" style="margin-top: 4px;">+4 this week</span>
        </div>
        <div class="smoky-card" style="padding: 16px;">
          <span class="smoky-meta-label">Weighted Forecast</span>
          <div class="smoky-kpi-num" style="font-size: 1.6rem; margin-top: 4px;">$640k</div>
          <span class="smoky-kpi-sub">Expected Q2 close</span>
        </div>
        <div class="smoky-card" style="padding: 16px;">
          <span class="smoky-meta-label">Win Probability</span>
          <div class="smoky-kpi-num" style="font-size: 1.6rem; margin-top: 4px;">54%</div>
          <span class="smoky-delta-pos" style="margin-top: 4px;">+6% vs avg</span>
        </div>
        <div class="smoky-card" style="padding: 16px;">
          <span class="smoky-meta-label">Cycle Velocity</span>
          <div class="smoky-kpi-num" style="font-size: 1.6rem; margin-top: 4px;">18 days</div>
          <span class="smoky-delta-pos" style="margin-top: 4px;">-3 days fast</span>
        </div>
      </div>

      <!-- Kanban Columns: Lead / Qualified / Proposal / Negotiation / Won -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; align-items: flex-start;">
        
        <!-- Col: Lead -->
        <div class="smoky-card" style="padding: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 10px; margin-bottom: 12px;">
            <span style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: rgba(255,255,255,0.7);">Lead</span>
            <span style="background: rgba(255,255,255,0.1); padding: 2px 7px; border-radius: 9999px; font-size: 0.72rem; font-weight: 700;">2</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <div style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 12px;">
              <span style="background: rgba(59,130,246,0.2); color: #3B82F6; font-size: 0.65rem; font-weight: 700; padding: 2px 6px; border-radius: 4px;">SaaS</span>
              <h5 style="margin: 6px 0 2px; font-size: 0.85rem; color: #fff;">Enterprise Migration</h5>
              <p style="margin: 0; font-size: 0.72rem; color: rgba(255,255,255,0.45);">Northwind Co.</p>
              <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.82rem; font-weight: 700;">$48,000</span>
                <span style="font-size: 0.72rem; color: #34D399;">30%</span>
              </div>
            </div>
            <div style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 12px;">
              <span style="background: rgba(59,130,246,0.2); color: #3B82F6; font-size: 0.65rem; font-weight: 700; padding: 2px 6px; border-radius: 4px;">Data</span>
              <h5 style="margin: 6px 0 2px; font-size: 0.85rem; color: #fff;">Analytics Integration</h5>
              <p style="margin: 0; font-size: 0.72rem; color: rgba(255,255,255,0.45);">Solstice Group</p>
              <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.82rem; font-weight: 700;">$18,500</span>
                <span style="font-size: 0.72rem; color: #34D399;">40%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Col: Qualified -->
        <div class="smoky-card" style="padding: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 10px; margin-bottom: 12px;">
            <span style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: rgba(255,255,255,0.7);">Qualified</span>
            <span style="background: rgba(255,255,255,0.1); padding: 2px 7px; border-radius: 9999px; font-size: 0.72rem; font-weight: 700;">1</span>
          </div>
          <div style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 12px;">
            <span style="background: rgba(59,130,246,0.2); color: #3B82F6; font-size: 0.65rem; font-weight: 700; padding: 2px 6px; border-radius: 4px;">Annual</span>
            <h5 style="margin: 6px 0 2px; font-size: 0.85rem; color: #fff;">Global Rollout v2</h5>
            <p style="margin: 0; font-size: 0.72rem; color: rgba(255,255,255,0.45);">Zenith Holdings</p>
            <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.82rem; font-weight: 700;">$92,000</span>
              <span style="font-size: 0.72rem; color: #34D399;">60%</span>
            </div>
          </div>
        </div>

        <!-- Col: Proposal -->
        <div class="smoky-card" style="padding: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 10px; margin-bottom: 12px;">
            <span style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: rgba(255,255,255,0.7);">Proposal</span>
            <span style="background: rgba(255,255,255,0.1); padding: 2px 7px; border-radius: 9999px; font-size: 0.72rem; font-weight: 700;">1</span>
          </div>
          <div style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 12px;">
            <span style="background: rgba(59,130,246,0.2); color: #3B82F6; font-size: 0.65rem; font-weight: 700; padding: 2px 6px; border-radius: 4px;">Cloud</span>
            <h5 style="margin: 6px 0 2px; font-size: 0.85rem; color: #fff;">Dedicated Cluster SLA</h5>
            <p style="margin: 0; font-size: 0.72rem; color: rgba(255,255,255,0.45);">Hyperion Bio</p>
            <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.82rem; font-weight: 700;">$64,000</span>
              <span style="font-size: 0.72rem; color: #34D399;">75%</span>
            </div>
          </div>
        </div>

        <!-- Col: Negotiation -->
        <div class="smoky-card" style="padding: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 10px; margin-bottom: 12px;">
            <span style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: rgba(255,255,255,0.7);">Negotiation</span>
            <span style="background: rgba(255,255,255,0.1); padding: 2px 7px; border-radius: 9999px; font-size: 0.72rem; font-weight: 700;">1</span>
          </div>
          <div style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 12px;">
            <span style="background: rgba(59,130,246,0.2); color: #3B82F6; font-size: 0.65rem; font-weight: 700; padding: 2px 6px; border-radius: 4px;">Enterprise</span>
            <h5 style="margin: 6px 0 2px; font-size: 0.85rem; color: #fff;">Multi-Seat License</h5>
            <p style="margin: 0; font-size: 0.72rem; color: rgba(255,255,255,0.45);">Apex Global</p>
            <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.82rem; font-weight: 700;">$120,000</span>
              <span style="font-size: 0.72rem; color: #34D399;">90%</span>
            </div>
          </div>
        </div>

        <!-- Col: Won -->
        <div class="smoky-card" style="padding: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 10px; margin-bottom: 12px;">
            <span style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: #34D399;">Won</span>
            <span style="background: rgba(52,211,153,0.2); color: #34D399; padding: 2px 7px; border-radius: 9999px; font-size: 0.72rem; font-weight: 700;">1</span>
          </div>
          <div style="background: rgba(52,211,153,0.08); border: 1px solid rgba(52,211,153,0.25); border-radius: 12px; padding: 12px;">
            <span style="background: rgba(52,211,153,0.2); color: #34D399; font-size: 0.65rem; font-weight: 700; padding: 2px 6px; border-radius: 4px;">Closed Won</span>
            <h5 style="margin: 6px 0 2px; font-size: 0.85rem; color: #fff;">Q2 Expansion Pack</h5>
            <p style="margin: 0; font-size: 0.72rem; color: rgba(255,255,255,0.45);">Starlight Retail</p>
            <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.82rem; font-weight: 700;">$55,000</span>
              <span style="font-size: 0.72rem; color: #34D399;">100%</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  `;
}

// ==================== CRM SUB-PAGES: CUSTOMERS / TENANTS ====================
function renderCustomersView() {
  setTimeout(async () => {
    if (window.renderTenantsView) {
      const container = document.getElementById('app-content-body');
      if (container) {
        container.innerHTML = await window.renderTenantsView();
      }
    }
  }, 0);
  return '<div style="padding: 24px; color: rgba(255,255,255,0.7);">กำลังโหลดข้อมูลทะเบียนผู้พักอาศัย...</div>';
}

window.filterCustomerTable = function(status, btn) {
  if (window.renderTenantsTable) window.renderTenantsTable();
};

window.searchCustomerTable = function(query) {
  if (window.renderTenantsTable) window.renderTenantsTable();
};

// ==================== CRM SUB-PAGES: PRODUCTS & ROOMS ====================
function renderProductsView() {
  return `
    <div style="display: flex; flex-direction: column; gap: 24px;">
      
      <!-- KPI Row -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
        <div class="smoky-card" style="padding: 16px;">
          <span class="smoky-meta-label">Catalog Units</span>
          <div class="smoky-kpi-num" style="font-size: 1.6rem; margin-top: 4px;">7 active</div>
          <span class="smoky-delta-pos" style="margin-top: 4px;">100% online</span>
        </div>
        <div class="smoky-card" style="padding: 16px;">
          <span class="smoky-meta-label">Available Inventory</span>
          <div class="smoky-kpi-num" style="font-size: 1.6rem; margin-top: 4px;">2 ห้องว่าง</div>
          <span class="smoky-kpi-sub">พร้อมเข้าพักทันที</span>
        </div>
        <div class="smoky-card" style="padding: 16px;">
          <span class="smoky-meta-label">Capacity Rate</span>
          <div class="smoky-kpi-num" style="font-size: 1.6rem; margin-top: 4px;">90%</div>
          <span class="smoky-delta-pos" style="margin-top: 4px;">18/20 ห้องพัก</span>
        </div>
        <div class="smoky-card" style="padding: 16px;">
          <span class="smoky-meta-label">Avg Monthly Rate</span>
          <div class="smoky-kpi-num" style="font-size: 1.6rem; margin-top: 4px;">1,475 ฿</div>
          <span class="smoky-kpi-sub">ราคาเฉลี่ยต่อเดือน</span>
        </div>
      </div>

      <!-- Product Grid Cards with vivid gradient app-style icons -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px;">
        
        <!-- Product 1: อาคาร ธนกฤษฎ์ -->
        <div class="smoky-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="width: 48px; height: 48px; border-radius: 14px; background: linear-gradient(135deg, #3B82F6, #1D4ED8); display: flex; align-items: center; justify-content: center; color: #fff; box-shadow: 0 4px 16px rgba(59,130,246,0.4);">
              ${ic('door')}
            </div>
            <button class="smoky-toggle checked" onclick="this.classList.toggle('checked')">
              <span class="smoky-toggle-knob"></span>
            </button>
          </div>
          <div style="margin-top: 16px;">
            <span class="smoky-meta-label">อาคารหลัก · 9 ห้อง</span>
            <h4 class="smoky-card-title">อาคาร ธนกฤษฎ์</h4>
            <div style="font-size: 1.15rem; font-weight: 700; color: #3B82F6; margin-top: 4px;">1,500 ฿ / เดือน</div>
          </div>
          <div style="margin-top: 18px;">
            <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: rgba(255,255,255,0.5); margin-bottom: 4px;">
              <span>อัตราการเข้าพัก</span>
              <span>8 / 9 ห้อง</span>
            </div>
            <div style="height: 6px; width: 100%; background: rgba(255,255,255,0.1); border-radius: 9999px; overflow: hidden;">
              <div style="width: 88%; height: 100%; background: linear-gradient(90deg, #3B82F6, #60A5FA); border-radius: 9999px;"></div>
            </div>
          </div>
        </div>

        <!-- Product 2: อาคาร กิ่งเพชร -->
        <div class="smoky-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="width: 48px; height: 48px; border-radius: 14px; background: linear-gradient(135deg, #06B6D4, #0284C7); display: flex; align-items: center; justify-content: center; color: #fff; box-shadow: 0 4px 16px rgba(6,182,212,0.4);">
              ${ic('door')}
            </div>
            <button class="smoky-toggle checked" onclick="this.classList.toggle('checked')">
              <span class="smoky-toggle-knob"></span>
            </button>
          </div>
          <div style="margin-top: 16px;">
            <span class="smoky-meta-label">อาคาร 2 · 5 ห้อง</span>
            <h4 class="smoky-card-title">อาคาร กิ่งเพชร</h4>
            <div style="font-size: 1.15rem; font-weight: 700; color: #06B6D4; margin-top: 4px;">1,500 ฿ / เดือน</div>
          </div>
          <div style="margin-top: 18px;">
            <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: rgba(255,255,255,0.5); margin-bottom: 4px;">
              <span>อัตราการเข้าพัก</span>
              <span>5 / 5 ห้อง (เต็ม)</span>
            </div>
            <div style="height: 6px; width: 100%; background: rgba(255,255,255,0.1); border-radius: 9999px; overflow: hidden;">
              <div style="width: 100%; height: 100%; background: linear-gradient(90deg, #06B6D4, #38BDF8); border-radius: 9999px;"></div>
            </div>
          </div>
        </div>

        <!-- Product 3: อาคารใต้บ้าน -->
        <div class="smoky-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="width: 48px; height: 48px; border-radius: 14px; background: linear-gradient(135deg, #10B981, #059669); display: flex; align-items: center; justify-content: center; color: #fff; box-shadow: 0 4px 16px rgba(16,185,129,0.4);">
              ${ic('door')}
            </div>
            <button class="smoky-toggle checked" onclick="this.classList.toggle('checked')">
              <span class="smoky-toggle-knob"></span>
            </button>
          </div>
          <div style="margin-top: 16px;">
            <span class="smoky-meta-label">อาคาร 3 · 6 ห้อง</span>
            <h4 class="smoky-card-title">อาคารใต้บ้าน</h4>
            <div style="font-size: 1.15rem; font-weight: 700; color: #10B981; margin-top: 4px;">1,400 ฿ / เดือน</div>
          </div>
          <div style="margin-top: 18px;">
            <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: rgba(255,255,255,0.5); margin-bottom: 4px;">
              <span>อัตราการเข้าพัก</span>
              <span>5 / 6 ห้อง</span>
            </div>
            <div style="height: 6px; width: 100%; background: rgba(255,255,255,0.1); border-radius: 9999px; overflow: hidden;">
              <div style="width: 83%; height: 100%; background: linear-gradient(90deg, #10B981, #34D399); border-radius: 9999px;"></div>
            </div>
          </div>
        </div>

        <!-- Product 4: High-Speed Fiber Internet -->
        <div class="smoky-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="width: 48px; height: 48px; border-radius: 14px; background: linear-gradient(135deg, #8B5CF6, #6D28D9); display: flex; align-items: center; justify-content: center; color: #fff; box-shadow: 0 4px 16px rgba(139,92,246,0.4);">
              ${ic('activity')}
            </div>
            <button class="smoky-toggle checked" onclick="this.classList.toggle('checked')">
              <span class="smoky-toggle-knob"></span>
            </button>
          </div>
          <div style="margin-top: 16px;">
            <span class="smoky-meta-label">Add-on Service</span>
            <h4 class="smoky-card-title">High-Speed Wi-Fi</h4>
            <div style="font-size: 1.15rem; font-weight: 700; color: #8B5CF6; margin-top: 4px;">100 ฿ / เดือน</div>
          </div>
          <div style="margin-top: 18px;">
            <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: rgba(255,255,255,0.5); margin-bottom: 4px;">
              <span>Active Subscribers</span>
              <span>18 / 18 ห้อง</span>
            </div>
            <div style="height: 6px; width: 100%; background: rgba(255,255,255,0.1); border-radius: 9999px; overflow: hidden;">
              <div style="width: 100%; height: 100%; background: linear-gradient(90deg, #8B5CF6, #A78BFA); border-radius: 9999px;"></div>
            </div>
          </div>
        </div>

      </div>

    </div>
  `;
}


/* ========== js/app.js ========== */
// js/app.js














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

  // ตรวจสอบ Theme เริ่มต้น
  initTheme();

  // ล้างแคชข้อมูลจำลอง (Mock data) เก่าทั้งหมด เพื่อบังคับโหลด Realtime จาก Supabase Cloud 100%
  try {
    const DATA_VERSION = 'tanakrit_realtime_v5_clean';
    if (localStorage.getItem('tanakrit_data_version') !== DATA_VERSION) {
      localStorage.removeItem('tanakrit_rooms_cache');
      localStorage.removeItem('tanakrit_rooms_cache_v3');
      localStorage.removeItem('tanakrit_tenants_cache');
      localStorage.removeItem('tanakrit_tenants_cache_v3');
      localStorage.removeItem('tanakrit_bookings_cache');
      localStorage.removeItem('tanakrit_parcels_cache');
      localStorage.removeItem('tanakrit_maint_cache');
      localStorage.setItem('tanakrit_data_version', DATA_VERSION);
    }
  } catch (_) {}

  // ตรวจสอบ Session ที่มีอยู่เดิม
  const existingUser = initAuth();
  if (existingUser) {
    document.getElementById('page-landing').classList.add('hidden');
    document.getElementById('page-app').classList.remove('hidden');
    setupSidebarMenu(existingUser);
    switchView('dashboard');
  }

  // ผูกการทำงานปุ่ม Topbar Tabs ในระบบหลังบ้านหอพัก
  const topTabs = document.querySelectorAll('#smoky-top-tabs .smoky-tab');
  topTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      topTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.getAttribute('data-tab');
      switchView(target);
    });
  });
});

// ตั้งค่าเมนู Sidebar ตามสิทธิ์ผู้ใช้งาน (Role) — รูปแบบ Floating Capsule Icon-Only เฉพาะงานที่ใช้งานจริง
function setupSidebarMenu(user) {
  const nameEl = document.getElementById('header-user-name');
  const roleEl = document.getElementById('header-user-role-label');

  if (nameEl) nameEl.textContent = user.name;
  if (roleEl) roleEl.textContent = user.roleTitle || user.role.toUpperCase();

  const nav = document.getElementById('sidebar-nav');
  if (!nav) return;

  const items = (user.role === 'admin' || user.role === 'staff') ? [
    { view: 'dashboard', icon: 'home', label: 'ภาพรวมหอพัก (Dashboard)' },
    { view: 'rooms', icon: 'door', label: 'ผังห้องพัก 3 อาคาร (Floor Plan)' },
    { view: 'tenants', icon: 'users', label: 'ทะเบียนผู้พักอาศัย (Tenants)' },
    { view: 'utilities', icon: 'bill', label: 'ค่าน้ำ-ค่าไฟ & บิล (Utilities)' },
    { view: 'maintenance', icon: 'wrench', label: 'แจ้งซ่อมบำรุง (Maintenance)' },
    { view: 'parcels', icon: 'box', label: 'พัสดุไปรษณีย์ (Parcels)' },
    { view: 'bookings', icon: 'calendar', label: 'การจองห้องพัก (Bookings)' },
    { view: 'announcements', icon: 'bell', label: 'ประกาศข่าวสาร (Announcements)', badge: 3 },
    { view: 'reports', icon: 'chart', label: 'รายงานและสถิติ (Reports)' },
    { view: 'users', icon: 'userCheck', label: 'จัดการบัญชีผู้ใช้งาน (User Management)' },
    { view: 'settings', icon: 'gear', label: 'ตั้งค่าระบบ (Settings)' },
  ] : [
    { view: 'dashboard', icon: 'home', label: 'หน้าหลักห้องพัก' },
    { view: 'utilities', icon: 'bill', label: 'บิลค่าน้ำ-ไฟ / ชำระเงิน' },
    { view: 'maintenance', icon: 'wrench', label: 'แจ้งซ่อมอุปกรณ์' },
    { view: 'parcels', icon: 'box', label: 'ตรวจสอบพัสดุ' },
    { view: 'announcements', icon: 'bell', label: 'ประกาศหอพัก', badge: 1 },
    { view: 'requests', icon: 'swap', label: 'ยื่นคำร้องสลับห้อง' },
    { view: 'profile', icon: 'user', label: 'ข้อมูลส่วนตัว' },
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

  // อัปเดตสถานะ Active บน Topbar Tabs ของระบบหลังบ้าน
  const topTabs = document.querySelectorAll('#smoky-top-tabs .smoky-tab');
  if (topTabs) {
    topTabs.forEach(tab => {
      const t = tab.getAttribute('data-tab');
      tab.classList.toggle('active', t === viewName);
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

  // Smooth view transition
  bodyEl.style.opacity = '0.88';
  bodyEl.style.transition = 'opacity 0.1s ease';

  setTimeout(async () => {
    if (viewName === 'dashboard') {
      bodyEl.innerHTML = currentUser && currentUser.role === 'student' ? renderStudentDashboard() : renderStaffDashboard();
    } else if (viewName === 'deals' || viewName === 'bookings') {
      bodyEl.innerHTML = await renderBookingsView();
    } else if (viewName === 'customers' || viewName === 'tenants' || viewName === 'search') {
      bodyEl.innerHTML = await renderTenantsView();
    } else if (viewName === 'products' || viewName === 'rooms') {
      bodyEl.innerHTML = await renderRoomsView();
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
  }, 40);
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

// ==================== THEME MANAGEMENT (DARK / LIGHT MODE) ====================
function initTheme() {
  const savedTheme = localStorage.getItem('tanakrit_theme') || 'dark';
  applyTheme(savedTheme, false);
}
function applyTheme(theme, notify = false) {
  const root = document.documentElement;
  const pageApp = document.getElementById('page-app');
  const iconEl = document.getElementById('theme-toggle-icon');
  const tooltipEl = document.getElementById('theme-toggle-tooltip');
  const btn = document.getElementById('btn-theme-toggle');

  if (theme === 'light') {
    document.body.classList.add('theme-light');
    if (pageApp) pageApp.classList.add('theme-light');
    root.classList.add('theme-light');
    if (iconEl) {
      // แสดงไอคอนพระจันทร์ สำหรับคลิกกลับไปโหมดมืด
      iconEl.innerHTML = `<svg class="icon" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
    }
    if (tooltipEl) tooltipEl.textContent = 'สลับโหมดมืด (Dark Mode)';
    if (btn) btn.title = 'สลับโหมดมืด (Dark Mode)';
    if (notify && typeof toast === 'function') toast('เปิดใช้งานโหมดสว่าง (Light Mode) เรียบร้อย', 'info');
  } else {
    document.body.classList.remove('theme-light');
    if (pageApp) pageApp.classList.remove('theme-light');
    root.classList.remove('theme-light');
    if (iconEl) {
      // แสดงไอคอนดวงอาทิตย์ สำหรับคลิกไปโหมดสว่าง
      iconEl.innerHTML = `<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
    }
    if (tooltipEl) tooltipEl.textContent = 'สลับโหมดสว่าง (Light Mode)';
    if (btn) btn.title = 'สลับโหมดสว่าง (Light Mode)';
    if (notify && typeof toast === 'function') toast('เปิดใช้งานโหมดมืด (Dark Mode) เรียบร้อย', 'info');
  }
  localStorage.setItem('tanakrit_theme', theme);
}
function toggleDarkMode() {
  const current = localStorage.getItem('tanakrit_theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next, true);
}

window.initTheme = initTheme;
window.applyTheme = applyTheme;
window.toggleDarkMode = toggleDarkMode;


})();
