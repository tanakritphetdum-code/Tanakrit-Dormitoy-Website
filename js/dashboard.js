// js/dashboard.js
// Premium Smoky Frosted Glass CRM Dashboard for Tanakrit Dormitory & SaaS Management
import { supabase } from './supabase.js';
import { ic, fmtCurrency, fmtDate, showModal, closeModal, toast } from './api.js';
import { currentUser } from './auth.js';
import { openInvoiceModal } from './utilities.js';

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

export let dashboardLiveMetrics = {
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
export function renderStaffDashboard() {
  setTimeout(() => {
    initStaffDashboard();
  }, 0);

  return `
    <div class="smoky-bento-grid" id="staff-bento-grid">
      
      <!-- ==================== COLUMN 1 ==================== -->
      <div class="smoky-col">
        
        <!-- 1. Team Card -->
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

          <!-- Overlapping Avatars + 3 -->
          <div style="margin-top: 18px; display: flex; align-items: center;">
            <div style="display: flex; margin-left: 6px;">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="ผู้จัดการ" style="width: 38px; height: 38px; border-radius: 50%; border: 2px solid #0e121a; object-fit: cover; margin-left: -6px;" title="นายเกียรติศักดิ์ (ผู้จัดการหอพัก)">
              <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80" alt="ธุรการ" style="width: 38px; height: 38px; border-radius: 50%; border: 2px solid #0e121a; object-fit: cover; margin-left: -8px;" title="นางสาวสมหญิง (เจ้าหน้าที่ธุรการ)">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="ช่างซ่อม" style="width: 38px; height: 38px; border-radius: 50%; border: 2px solid #0e121a; object-fit: cover; margin-left: -8px;" title="นายสมศักดิ์ (ช่างเทคนิคอาคาร)">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" alt="บริการ" style="width: 38px; height: 38px; border-radius: 50%; border: 2px solid #0e121a; object-fit: cover; margin-left: -8px;" title="เจ้าหน้าที่ดูแลผู้พักอาศัย">
              <div style="width: 38px; height: 38px; border-radius: 50%; border: 2px solid #0e121a; background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.85); font-size: 0.75rem; font-weight: 700; display: flex; align-items: center; justify-content: center; margin-left: -8px;">
                +3
              </div>
            </div>
            <div style="margin-left: 14px; font-size: 0.76rem; color: rgba(255,255,255,0.5);">
              หอพักชายธนกฤษฎ์ ทีมบริหาร
            </div>
          </div>
        </div>

        <!-- 2. Quarterly Target (TALL CARD) -->
        <div class="smoky-card" style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;" id="card-quarterly-target">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <span class="smoky-meta-label">เป้าหมายอัตราการเข้าพัก</span>
              <h3 class="smoky-card-title">Occupancy Target (3 อาคาร)</h3>
            </div>
          </div>

          <!-- Circular Progress Ring with Draggable / Interactive Knob -->
          <div class="smoky-ring-box">
            <svg class="smoky-ring-svg" viewBox="0 0 100 100">
              <!-- Dashed Background Track -->
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="7" stroke-dasharray="2 3"></circle>
              <!-- Glowing Blue Progress Circle -->
              <circle id="target-progress-ring" cx="50" cy="50" r="40" fill="none" stroke="#3B82F6" stroke-width="7" stroke-linecap="round" stroke-dasharray="251.32" stroke-dashoffset="251.32" style="filter: drop-shadow(0 0 10px rgba(59,130,246,0.7)); transition: stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1);"></circle>
            </svg>

            <!-- Center KPI Label -->
            <div class="smoky-ring-center">
              <span class="smoky-kpi-num" id="target-percent-text">0%</span>
              <span class="smoky-meta-label" style="margin-top: 2px;" id="target-rooms-label">เข้าพักแล้ว 0/17 ห้อง</span>
            </div>
          </div>

          <!-- - / + Buttons to Adjust Target -->
          <div class="smoky-ring-btn-group">
            <button class="smoky-pill-btn" onclick="window.adjustTargetPercent(-5)" title="ลด 5%">−</button>
            <span style="font-size: 0.78rem; font-family: monospace; color: rgba(255,255,255,0.6);" id="target-sub-label">เป้าหมาย: 0%</span>
            <button class="smoky-pill-btn" onclick="window.adjustTargetPercent(5)" title="เพิ่ม 5%">+</button>
          </div>

          <!-- Bottom Row of Round Metric Chips -->
          <div class="smoky-metric-chips" id="metric-chips-row">
            <div class="smoky-chip active" data-metric="revenue" onclick="window.selectMetricChip('revenue')" title="คลิกเพื่อเปิดดูบิลและรายรับค่าน้ำ-ค่าไฟ (Billing & Utilities)" style="cursor: pointer;">
              <span class="chip-lbl">รายรับ</span>
              <span class="chip-val" id="chip-val-revenue">0 ฿</span>
            </div>
            <div class="smoky-chip" data-metric="deals" onclick="window.selectMetricChip('deals')" title="คลิกเพื่อเปิดดูผังห้องพักและห้องว่าง (Floor Plan)" style="cursor: pointer;">
              <span class="chip-lbl">ห้องว่าง</span>
              <span class="chip-val" id="chip-val-vacant">16 ห้อง</span>
            </div>
            <div class="smoky-chip" data-metric="calls" onclick="window.selectMetricChip('calls')" title="คลิกเพื่อเปิดดูห้องที่กำลังซ่อมบำรุง" style="cursor: pointer;">
              <span class="chip-lbl">ซ่อมบำรุง</span>
              <span class="chip-val" id="chip-val-maint">1 ห้อง</span>
            </div>
            <div class="smoky-chip" data-metric="meetings" onclick="window.selectMetricChip('meetings')" title="คลิกเพื่อเปิดดูรายการแจ้งซ่อมบำรุง (Maintenance)" style="cursor: pointer;">
              <span class="chip-lbl">แจ้งซ่อม</span>
              <span class="chip-val" id="chip-val-tickets">0 งาน</span>
            </div>
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

        <!-- 7. สรุปรายรับ 7 วันล่าสุด -->
        <div class="smoky-card" id="card-sales-weekly">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <span class="smoky-meta-label">สถิติรายรับ</span>
              <h3 class="smoky-card-title" id="sales-chart-title">รายรับประจำวัน (สัปดาห์นี้)</h3>
            </div>

            <!-- Week/Month/Year Control -->
            <div class="smoky-segmented" id="sales-segmented">
              <button class="smoky-seg-btn active" data-period="Week" onclick="window.selectSalesPeriod('Week')">สัปดาห์</button>
              <button class="smoky-seg-btn" data-period="Month" onclick="window.selectSalesPeriod('Month')">เดือน</button>
              <button class="smoky-seg-btn" data-period="Year" onclick="window.selectSalesPeriod('Year')">ปี</button>
            </div>
          </div>

          <!-- Dynamic Bars Container -->
          <div id="sales-bars-container" style="position: relative; margin-top: 26px; height: 140px; display: flex; align-items: flex-end; justify-content: space-between; gap: 10px;">
            <div class="smoky-bar-col" style="flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end;">
              <div style="width: 100%; max-width: 30px; height: 8px; background: rgba(255,255,255,0.12); border-radius: 4px 4px 0 0;"></div>
              <span style="font-size: 0.72rem; color: rgba(255,255,255,0.4); margin-top: 6px;">จ.</span>
            </div>
            <div class="smoky-bar-col" style="flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end;">
              <div style="width: 100%; max-width: 30px; height: 8px; background: rgba(255,255,255,0.12); border-radius: 4px 4px 0 0;"></div>
              <span style="font-size: 0.72rem; color: rgba(255,255,255,0.4); margin-top: 6px;">อ.</span>
            </div>
            <div class="smoky-bar-col" style="flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end;">
              <div style="width: 100%; max-width: 30px; height: 8px; background: #3B82F6; border-radius: 4px 4px 0 0;"></div>
              <span style="font-size: 0.72rem; font-weight: 700; color: #ffffff; margin-top: 6px;">พ.</span>
            </div>
            <div class="smoky-bar-col" style="flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end;">
              <div style="width: 100%; max-width: 30px; height: 8px; background: rgba(255,255,255,0.12); border-radius: 4px 4px 0 0;"></div>
              <span style="font-size: 0.72rem; color: rgba(255,255,255,0.4); margin-top: 6px;">พฤ.</span>
            </div>
            <div class="smoky-bar-col" style="flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end;">
              <div style="width: 100%; max-width: 30px; height: 8px; background: rgba(255,255,255,0.12); border-radius: 4px 4px 0 0;"></div>
              <span style="font-size: 0.72rem; color: rgba(255,255,255,0.4); margin-top: 6px;">ศ.</span>
            </div>
            <div class="smoky-bar-col" style="flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end;">
              <div style="width: 100%; max-width: 30px; height: 8px; background: rgba(255,255,255,0.12); border-radius: 4px 4px 0 0;"></div>
              <span style="font-size: 0.72rem; color: rgba(255,255,255,0.4); margin-top: 6px;">ส.</span>
            </div>
            <div class="smoky-bar-col" style="flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end;">
              <div style="width: 100%; max-width: 30px; height: 8px; background: rgba(255,255,255,0.12); border-radius: 4px 4px 0 0;"></div>
              <span style="font-size: 0.72rem; color: rgba(255,255,255,0.4); margin-top: 6px;">อา.</span>
            </div>

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

        <!-- 8. สายด่วนฉุกเฉิน & บันทึกเสียงแจ้งเหตุ -->
        <div class="smoky-card" id="card-media-discovery">
          <span class="smoky-meta-label">สายด่วนฉุกเฉิน · ผู้จัดการหอพัก</span>
          
          <div style="display: flex; align-items: center; gap: 12px; margin-top: 12px;">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="ผู้จัดการ" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 1px solid rgba(255,255,255,0.2);">
            <div>
              <div style="font-size: 0.90rem; font-weight: 600; color: #fff;">นายเกียรติศักดิ์ บริหาร</div>
              <a href="tel:0869461654" style="font-size: 0.74rem; color: #60A5FA; text-decoration: none; display: flex; align-items: center; gap: 4px; margin-top: 2px;" title="คลิกเพื่อโทรออกทันที">
                ${ic('phone')} โทร 086-946-1654 (คลิกเพื่อโทรออก 24 ชม.)
              </a>
            </div>
          </div>

          <!-- Blue Audio Waveform with Playhead -->
          <div class="smoky-waveform-box" id="waveform-box">
            <!-- 24 bars -->
            <div class="smoky-wave-bar played" style="height: 35%;"></div>
            <div class="smoky-wave-bar played" style="height: 55%;"></div>
            <div class="smoky-wave-bar played" style="height: 80%;"></div>
            <div class="smoky-wave-bar played" style="height: 100%;"></div>
            <div class="smoky-wave-bar played" style="height: 65%;"></div>
            <div class="smoky-wave-bar played" style="height: 45%;"></div>
            <div class="smoky-wave-bar played" style="height: 90%;"></div>
            <div class="smoky-wave-bar played" style="height: 75%;"></div>
            <div class="smoky-wave-bar" style="height: 50%;"></div>
            <div class="smoky-wave-bar" style="height: 70%;"></div>
            <div class="smoky-wave-bar" style="height: 85%;"></div>
            <div class="smoky-wave-bar" style="height: 95%;"></div>
            <div class="smoky-wave-bar" style="height: 40%;"></div>
            <div class="smoky-wave-bar" style="height: 30%;"></div>
            <div class="smoky-wave-bar" style="height: 60%;"></div>
            <div class="smoky-wave-bar" style="height: 85%;"></div>
            <div class="smoky-wave-bar" style="height: 70%;"></div>
            <div class="smoky-wave-bar" style="height: 50%;"></div>
            <div class="smoky-wave-bar" style="height: 90%;"></div>
            <div class="smoky-wave-bar" style="height: 65%;"></div>
            <div class="smoky-wave-bar" style="height: 40%;"></div>
            <div class="smoky-wave-bar" style="height: 55%;"></div>
            <div class="smoky-wave-bar" style="height: 80%;"></div>
            <div class="smoky-wave-bar" style="height: 45%;"></div>

            <!-- Animated Playhead Line -->
            <div class="smoky-waveform-needle" id="waveform-needle" style="left: 35%;"></div>
          </div>

          <!-- Audio Controls: prev / play-pause / next -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
            <span style="font-size: 0.76rem; font-family: monospace; color: rgba(255,255,255,0.4);" id="audio-duration-txt">01:24</span>

            <div style="display: flex; align-items: center; gap: 8px;">
              <button class="smoky-round-glass-btn" style="width: 32px; height: 32px;" onclick="window.seekAudio(0)" title="ย้อนกลับ">
                <svg class="icon" viewBox="0 0 24 24"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/></svg>
              </button>
              <button class="smoky-round-glass-btn" id="btn-audio-play" style="width: 38px; height: 38px; background: #3B82F6; color: #fff; box-shadow: 0 0 15px rgba(59,130,246,0.6);" onclick="window.toggleAudioPlay()" title="เล่น / หยุด">
                ${ic('play')}
              </button>
              <button class="smoky-round-glass-btn" style="width: 32px; height: 32px;" onclick="window.seekAudio(100)" title="ถัดไป">
                <svg class="icon" viewBox="0 0 24 24"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>
              </button>
            </div>
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
      { data: usersData }
    ] = await Promise.all([
      supabase.from('tenants').select('*'),
      supabase.from('maintenance').select('*'),
      supabase.from('meter_readings').select('*'),
      supabase.from('bookings').select('*'),
      supabase.from('users').select('*')
    ]);

    const tenants = Array.isArray(tenantsData) ? tenantsData.filter(t => t.status !== 'terminated') : [];
    const tickets = Array.isArray(ticketsData) ? ticketsData : [];
    const bills = Array.isArray(billsData) ? billsData : [];
    const bookings = Array.isArray(bookingsData) ? bookingsData : [];
    const users = Array.isArray(usersData) ? usersData : [];

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

    // 1. Team Staff Count
    const staffCount = users.filter(u => u.role === 'admin' || u.role === 'staff').length;
    const teamEl = document.getElementById('team-staff-count');
    if (teamEl) teamEl.textContent = `${staffCount} คน ประจำการ`;

    // 2. Target Ring & Chips
    dashboardState.targetPercent = occPercent;
    updateTargetRingUI();
    const targetRoomsLabel = document.getElementById('target-rooms-label');
    if (targetRoomsLabel) targetRoomsLabel.textContent = `เข้าพักแล้ว ${occupiedCount}/${totalRooms} ห้อง`;

    const chipRev = document.getElementById('chip-val-revenue');
    const chipVac = document.getElementById('chip-val-vacant');
    const chipMaint = document.getElementById('chip-val-maint');
    const chipTix = document.getElementById('chip-val-tickets');

    const totalPaidBills = bills.filter(b => b.status === 'paid').reduce((acc, curr) => acc + (Number(curr.total_price) || 0), 0);
    const totalExpectedBills = bills.reduce((acc, curr) => acc + (Number(curr.total_price) || 0), 0) || (occupiedCount * 2800);

    if (chipRev) chipRev.textContent = `฿${totalPaidBills.toLocaleString()}`;
    if (chipVac) chipVac.textContent = `${vacantCount} ห้อง`;
    if (chipMaint) chipMaint.textContent = `${maintCount} ห้อง`;
    const pendingTickets = tickets.filter(t => t.status !== 'completed').length;
    const completedTickets = tickets.filter(t => t.status === 'completed').length;
    if (chipTix) chipTix.textContent = `${pendingTickets} งาน`;

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

    // Initialize Sales Chart according to current period
    window.selectSalesPeriod(dashboardState.salesPeriod || 'Week');

    // Animate target percent text
    animateNumberCountUp('target-percent-text', occPercent, '%');
  } catch (err) {
    console.warn('Realtime dashboard sync error:', err);
    animateNumberCountUp('target-percent-text', dashboardState.targetPercent, '%');
    animateNumberCountUp('leads-num-count', 0);
  }
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
export function renderStudentDashboard() {
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
export function renderProfileView() {
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
export function renderDealsPipelineView() {
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
export function renderCustomersView() {
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
export function renderProductsView() {
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
