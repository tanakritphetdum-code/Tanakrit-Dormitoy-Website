// js/supabase.js
// ระบบเชื่อมต่อฐานข้อมูล Supabase Cloud (Live Production Database)
// เชื่อมต่อผ่าน REST API (PostgREST) อัตโนมัติ รองรับสิทธิ์ anon key

export const SUPABASE_URL = 'https://ewvqgccmyxpwnhjzagye.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_QOYngsbMMfzYdDvHA34yyQ_BD1RMnjW';
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
export function applySettingsToLandingPage(settings) {
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

// ดึงข้อมูลบัญชีพร้อมเพย์ (หมายเลข + ชื่อผู้รับเงิน)
export function getPromptPayDetails() {
  const settings = (typeof window !== 'undefined' && window.getCurrentSettings) ? window.getCurrentSettings() : cachedSettings;
  const raw = settings?.promptpay_number || '086-946-1654';
  if (raw.includes('|')) {
    const parts = raw.split('|');
    return {
      number: parts[0].trim(),
      name: parts.slice(1).join('|').trim() || 'นายธนกฤษฎ์ เพชรดำ ผู้จัดการหอพัก'
    };
  }
  return {
    number: raw.trim(),
    name: 'นายธนกฤษฎ์ เพชรดำ ผู้จัดการหอพัก'
  };
}

// อัปเดตข้อมูลบัญชีพร้อมเพย์ขึ้น Supabase Cloud
export async function savePromptPayDetails(number, name) {
  const cleanNumber = (number || '086-946-1654').trim();
  const cleanName = (name || 'นายธนกฤษฎ์ เพชรดำ ผู้จัดการหอพัก').trim();
  const combined = `${cleanNumber}|${cleanName}`;
  
  if (cachedSettings) {
    cachedSettings.promptpay_number = combined;
  }
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_CACHE_KEY) || '{}');
    saved.promptpay_number = combined;
    localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(saved));
  } catch (_) {}

  const res = await supabase.from('settings').eq('id', 'default').update({
    promptpay_number: combined
  });

  return res;
}

// ผูกฟังก์ชันระดับ Window
if (typeof window !== 'undefined') {
  window.applySettingsToLandingPage = applySettingsToLandingPage;
  window.getCurrentSettings = () => cachedSettings;
  window.getPromptPayDetails = getPromptPayDetails;
  window.savePromptPayDetails = savePromptPayDetails;
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
export const supabase = {
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
