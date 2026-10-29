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
  phone: '075-345-678, 089-999-8877',
  line_id: '@tanakritdorm',
  address: '123 หมู่ 4 ต.ท่าเรือ อ.เมือง จ.นครศรีธรรมราช 80000',
  water_rate: 18,
  electric_rate: 8,
  common_fee: 100,
  promptpay_number: '0899998877'
};

// ซิงค์การตั้งค่าเริ่มต้นจาก LocalStorage Cache ถ้ามี
try {
  const localSaved = localStorage.getItem(SETTINGS_CACHE_KEY);
  if (localSaved) {
    cachedSettings = { ...cachedSettings, ...JSON.parse(localSaved) };
  }
} catch (e) {
  console.warn('Could not load local settings cache:', e);
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
