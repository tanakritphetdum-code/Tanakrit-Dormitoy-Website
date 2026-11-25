// js/realtime.js
// ระบบซิงก์ข้อมูลสดแบบ Realtime WebSocket ผ่าน Supabase Cloud
// อัปเดตข้อมูลบนหน้าจอทันทีเมื่อมีการเปลี่ยนแปลงในฐานข้อมูล โดยไม่ต้องกดรีเฟรช F5

import { SUPABASE_URL, SUPABASE_ANON_KEY, supabase } from './supabase.js';
import { toast } from './api.js';

let socket = null;
let heartbeatInterval = null;
let reconnectTimer = null;
let refCounter = 0;
let isConnected = false;
let registeredListeners = [];

// เสียงแจ้งเตือนนุ่มนวลผ่าน Web Audio API (ไม่ต้องพึ่งพาไฟล์ภายนอก)
export function playChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    // คอร์ดคู่เสียงน่ารักสองจังหวะ (D5 -> A5)
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (_) {}
}

// อัปเดตสถานะป้ายไฟ Realtime บน Topbar
function updateStatusUI(status) {
  const pill = document.getElementById('realtime-status-pill');
  const text = document.getElementById('realtime-status-text');
  if (!pill || !text) return;

  if (status === 'connected') {
    pill.style.background = 'rgba(52, 211, 153, 0.12)';
    pill.style.borderColor = 'rgba(52, 211, 153, 0.35)';
    pill.style.color = '#34D399';
    pill.innerHTML = `
      <span style="width: 7px; height: 7px; border-radius: 50%; background: #34D399; box-shadow: 0 0 8px #34D399; display: inline-block;"></span>
      <span id="realtime-status-text">Realtime Live</span>
    `;
    pill.title = 'เชื่อมต่อสดแบบ WebSocket สำเร็จ: ข้อมูลจะอัปเดตบนหน้าจอทันทีเมื่อมีความเคลื่อนไหว';
  } else if (status === 'connecting') {
    pill.style.background = 'rgba(245, 158, 11, 0.12)';
    pill.style.borderColor = 'rgba(245, 158, 11, 0.35)';
    pill.style.color = '#F59E0B';
    pill.innerHTML = `
      <span style="width: 7px; height: 7px; border-radius: 50%; background: #F59E0B; display: inline-block;"></span>
      <span id="realtime-status-text">กำลังเชื่อมต่อสด...</span>
    `;
    pill.title = 'กำลังเชื่อมต่อ WebSocket กับ Supabase Cloud...';
  } else {
    pill.style.background = 'rgba(255, 255, 255, 0.05)';
    pill.style.borderColor = 'rgba(255, 255, 255, 0.12)';
    pill.style.color = 'rgba(255, 255, 255, 0.5)';
    pill.innerHTML = `
      <span style="width: 7px; height: 7px; border-radius: 50%; background: rgba(255, 255, 255, 0.3); display: inline-block;"></span>
      <span id="realtime-status-text">ออฟไลน์</span>
    `;
    pill.title = 'ไม่ได้เชื่อมต่อ WebSocket (ใช้ระบบ REST API ปกติ)';
  }
}

// ตัวหน่วงเวลาสำหรับการรีเฟรชหน้าจอ (Debounce) ป้องกันหน้าจอกระพริบถี่
let refreshDebounceTimer = null;
function triggerSmartRefresh(tableName) {
  clearTimeout(refreshDebounceTimer);
  refreshDebounceTimer = setTimeout(() => {
    const currentView = window.currentAppView || 'dashboard';

    // 1. ถ้าอยู่หน้า Dashboard ให้ดึงข้อมูลมาอัปเดตการ์ดตัวเลขและทีมงานทันที
    if (currentView === 'dashboard' && typeof window.initStaffDashboard === 'function') {
      window.initStaffDashboard();
    }

    // 2. ถ้าอยู่หน้าจอที่ตรงกับตารางที่มีการเปลี่ยนแปลง ให้รีเฟรชหน้าจอนั้นทันที
    if (tableName === 'rooms' && currentView === 'rooms') {
      if (typeof window.reloadRoomsData === 'function') {
        window.reloadRoomsData();
        return;
      }
    }
    if (typeof window.switchView === 'function') {
      if (tableName === 'rooms' && currentView === 'rooms') {
        window.switchView('rooms');
      } else if ((tableName === 'meter_readings' || tableName === 'bills') && currentView === 'utilities') {
        window.switchView('utilities');
      } else if (tableName === 'maintenance' && currentView === 'maintenance') {
        window.switchView('maintenance');
      } else if (tableName === 'parcels' && currentView === 'parcels') {
        window.switchView('parcels');
      } else if (tableName === 'bookings' && (currentView === 'bookings' || currentView === 'deals')) {
        window.switchView('bookings');
      } else if (tableName === 'announcements' && currentView === 'announcements') {
        window.switchView('announcements');
      } else if (tableName === 'tenants' && currentView === 'tenants') {
        window.switchView('tenants');
      } else if (tableName === 'users' && currentView === 'users') {
        window.switchView('users');
      }
    }
  }, 250);
}

// ประมวลผลข้อความที่ถูกส่งมาจาก Supabase Realtime
function handlePostgresChanges(payload) {
  if (!payload || !payload.data) return;

  const data = payload.data;
  const table = data.table;
  const type = data.type; // 'INSERT', 'UPDATE', 'DELETE'
  const record = data.record || {};
  const oldRecord = data.old_record || {};

  console.info(`[Supabase Realtime] ${type} on table: ${table}`, record);

  // แจ้งเตือน Toast และเสียงเตือนตามเหตุการณ์สำคัญ
  if (table === 'bookings' && type === 'INSERT') {
    playChime();
    toast(`🔔 คำขอจองห้องใหม่: ${record.name || 'ผู้สนใจเช่า'} (ห้อง ${record.room_number || ''})`, 'info');
  } else if (table === 'maintenance') {
    if (type === 'INSERT') {
      playChime();
      toast(`🛠️ แจ้งซ่อมใหม่: ห้อง ${record.room_number || ''} — ${record.category || 'อุปกรณ์ชำรุด'}`, 'warning');
    } else if (type === 'UPDATE' && oldRecord.status !== record.status) {
      toast(`🛠️ งานซ่อมห้อง ${record.room_number || ''}: ปรับสถานะเป็น "${record.status}"`, 'info');
    }
  } else if (table === 'meter_readings' || table === 'bills') {
    if (type === 'UPDATE' && record.status === 'verifying') {
      playChime();
      toast(`💰 ผู้พักอัปโหลดสลิปชำระเงินใหม่: ห้อง ${record.room_number || ''}`, 'info');
    } else if (type === 'UPDATE' && record.status === 'paid' && oldRecord.status !== 'paid') {
      playChime();
      toast(`✅ อนุมัติการชำระเงินบิลห้อง ${record.room_number || ''} สำเร็จ`, 'success');
    }
  } else if (table === 'parcels' && type === 'INSERT') {
    playChime();
    toast(`📦 มีพัสดุมาส่งใหม่: ห้อง ${record.room_number || ''} (${record.carrier || 'พัสดุ'})`, 'info');
  } else if (table === 'rooms' && type === 'UPDATE' && oldRecord.status !== record.status) {
    const statusLabelMap = { vacant: 'ห้องว่างพร้อมอยู่', occupied: 'มีผู้พักอาศัย', maintenance: 'ปิดปรับปรุง / ซ่อมบำรุง' };
    const statusText = statusLabelMap[record.status] || record.status;
    toast(`🚪 สถานะห้อง ${record.number || record.room_number || ''} เปลี่ยนเป็น: ${statusText}`, 'info');
  } else if (table === 'announcements' && type === 'INSERT') {
    playChime();
    toast(`📢 มีประกาศข่าวสารใหม่: ${record.title || ''}`, 'info');
  }

  // เรียกใช้ตัวแทนรีเฟรชหน้าจออัตโนมัติ
  triggerSmartRefresh(table);

  // แจ้งผู้ฟังแบบกำหนดเอง (Custom Listeners)
  registeredListeners.forEach(fn => {
    try {
      fn({ table, type, record, oldRecord });
    } catch (e) {
      console.warn('Listener callback error:', e);
    }
  });
}

// เริ่มการเชื่อมต่อ WebSocket
export function initRealtime() {
  if (typeof window === 'undefined' || !window.WebSocket) return;
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return;
  }

  updateStatusUI('connecting');

  // Supabase Realtime Phoenix WebSocket endpoint
  const wsUrl = `${SUPABASE_URL.replace('https://', 'wss://')}/realtime/v1/websocket?apikey=${SUPABASE_ANON_KEY}&vsn=1.0.0`;

  try {
    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      isConnected = true;
      updateStatusUI('connected');
      console.info('[Supabase Realtime] WebSocket Connected successfully!');

      // ส่งคำสั่งเข้าร่วม (Join) ห้อง realtime:public และดักฟังการเปลี่ยนแปลงทุกตาราง
      refCounter++;
      const joinMsg = {
        topic: 'realtime:public',
        event: 'phx_join',
        payload: {
          config: {
            postgres_changes: [
              { event: '*', schema: 'public' }
            ]
          }
        },
        ref: String(refCounter)
      };
      socket.send(JSON.stringify(joinMsg));

      // เริ่มส่ง Heartbeat ทุก 25 วินาทีเพื่อรักษาท่อการเชื่อมต่อ
      clearInterval(heartbeatInterval);
      heartbeatInterval = setInterval(() => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          refCounter++;
          socket.send(JSON.stringify({
            topic: 'phoenix',
            event: 'heartbeat',
            payload: {},
            ref: String(refCounter)
          }));
        }
      }, 25000);
    };

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.event === 'postgres_changes') {
          handlePostgresChanges(msg.payload);
        }
      } catch (err) {
        console.warn('[Supabase Realtime] Parse message warning:', err);
      }
    };

    socket.onclose = () => {
      isConnected = false;
      clearInterval(heartbeatInterval);
      updateStatusUI('disconnected');
      console.warn('[Supabase Realtime] WebSocket disconnected. Auto-reconnecting in 4s...');

      // หน่วงเวลาแล้วต่อใหม่อัตโนมัติ
      clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(() => {
        initRealtime();
      }, 4000);
    };

    socket.onerror = (err) => {
      console.warn('[Supabase Realtime] WebSocket error:', err);
      socket.close();
    };

  } catch (err) {
    console.warn('[Supabase Realtime] Initialization warning:', err);
    updateStatusUI('disconnected');
  }
}

// ลงทะเบียนฟังก์ชันตรวจจับการเปลี่ยนแปลง
export function onRealtimeChange(callback) {
  if (typeof callback === 'function') {
    registeredListeners.push(callback);
  }
}

// ผูกเข้ากับระดับ window เพื่อเรียกใช้ได้จากทุกหน้า
if (typeof window !== 'undefined') {
  window.initRealtime = initRealtime;
  window.playChime = playChime;
}
