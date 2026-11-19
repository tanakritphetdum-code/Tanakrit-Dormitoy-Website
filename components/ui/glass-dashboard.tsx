"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Home,
  Search,
  ShoppingBag,
  Box,
  Users,
  LayoutGrid,
  MessageCircle,
  Calendar,
  BarChart3,
  ChevronDown,
  Settings,
  Power,
  Plus,
  Grid,
  Bell,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Check,
  X,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Filter,
  Download,
  PhoneCall,
  Flame,
  ShieldCheck,
  Sliders,
  DollarSign,
  Activity,
  Layers,
  ChevronRight,
  Volume2
} from "lucide-react";
import {
  MOCK_CRM_DATA,
  Customer,
  DealCard,
  ProductItem,
  MetricChip
} from "./mock-crm-data";

// Helper for Animated Counter
function AnimatedCounter({ value, duration = 0.8 }: { value: string | number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  // Extract numeric part
  const stringVal = String(value);
  const numericPart = parseFloat(stringVal.replace(/[^0-9.]/g, "")) || 0;
  const isPrefix = stringVal.startsWith("$") ? "$" : "";
  const isSuffix = stringVal.endsWith("k") ? "k" : stringVal.endsWith("M") ? "M" : stringVal.endsWith("%") ? "%" : "";

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(numericPart);
      return;
    }
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      const easeOutProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(easeOutProgress * numericPart * 10) / 10);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(numericPart);
      }
    };
    window.requestAnimationFrame(step);
  }, [numericPart, duration, shouldReduceMotion]);

  if (isNaN(numericPart)) return <span>{value}</span>;

  return (
    <span>
      {isPrefix}
      {numericPart % 1 === 0 ? Math.floor(displayValue).toLocaleString() : displayValue.toFixed(1)}
      {isSuffix}
    </span>
  );
}

// Spring Toggle Switch Component
interface ToggleProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  accent?: string;
}

function SpringToggle({ checked, onChange, accent = "bg-[#3B82F6]" }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border border-white/10 transition-colors duration-200 ease-in-out focus:outline-none ${
        checked ? accent : "bg-white/10"
      }`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 ${
          checked ? "translate-x-5" : "translate-x-0.5"
        } mt-0.5`}
      />
    </button>
  );
}

export function GlassCrmDashboard() {
  const shouldReduceMotion = useReducedMotion();

  // Navigation State
  const [activeTab, setActiveTab] = useState<"Overview" | "Sales" | "Marketing" | "Support">("Overview");
  const [activeSidebar, setActiveSidebar] = useState<"home" | "search" | "products" | "parcels" | "customers" | "grid" | "messages" | "calendar" | "reports">("home");

  // Interactive Target
  const [targetPercent, setTargetPercent] = useState(MOCK_CRM_DATA.target.initialPercent);
  const [targetToggle, setTargetToggle] = useState(true);
  const [activeMetricChip, setActiveMetricChip] = useState("revenue");

  // Revenue Card Segmented Control
  const [revenuePeriod, setRevenuePeriod] = useState<"Today" | "Week" | "Month">("Today");

  // Approvals State
  const [approvalsList, setApprovalsList] = useState(MOCK_CRM_DATA.approvals);
  const [swipeApproveProgress, setSwipeApproveProgress] = useState(0);
  const [isApproved, setIsApproved] = useState(false);

  // 2x2 KPI Tiles Toggles
  const [tileState, setTileState] = useState({
    customers: true,
    pipeline: true,
    activeUsers: true,
    openTickets: false
  });

  // Sales Chart Period
  const [salesPeriod, setSalesPeriod] = useState<"Week" | "Month" | "Year">("Week");
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(2);

  // Audio Player State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioPlayhead, setAudioPlayhead] = useState(35);

  // Customers View Filter & Search
  const [customerFilter, setCustomerFilter] = useState<"All" | "Active" | "Trial" | "Lead" | "Churned">("All");
  const [customerSearch, setCustomerSearch] = useState("");

  // Products View Filter & Search
  const [productSearch, setProductSearch] = useState("");
  const [productsList, setProductsList] = useState(MOCK_CRM_DATA.products);

  // Audio waveform animation timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlayingAudio) {
      interval = setInterval(() => {
        setAudioPlayhead((prev) => (prev >= 100 ? 0 : prev + 2));
      }, 250);
    }
    return () => clearInterval(interval);
  }, [isPlayingAudio]);

  const handleAdjustTarget = (delta: number) => {
    setTargetPercent((prev) => Math.min(100, Math.max(0, prev + delta)));
  };

  const removeApproval = (id: string) => {
    setApprovalsList((prev) => prev.filter((item) => item.id !== id));
  };

  // Card Variants
  const cardMotion = {
    initial: { opacity: 0, scale: 0.96, y: 12 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, filter: "blur(8px)" },
    whileHover: shouldReduceMotion ? {} : { y: -5, transition: { duration: 0.2 } }
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#0a0d14] font-['Outfit','Lexend',sans-serif] text-white selection:bg-[#3B82F6]/30">
      
      {/* Background Layer: Full-Bleed B&W photo of modern living room with heavy blur + fallback gradient */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center opacity-30 mix-blend-luminosity filter blur-3xl scale-110 pointer-events-none transition-opacity duration-1000"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 30%, rgba(40, 50, 75, 0.4) 0%, rgba(10, 13, 20, 0.95) 75%), url('https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=80')`
        }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-transparent via-[#090b10]/60 to-[#07090e] pointer-events-none" />

      {/* Main Wrapper with Padding */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-3 sm:p-6 md:p-8 lg:p-10">
        
        {/* App Shell: Large floating glass panel */}
        <div className="relative flex w-full max-w-[1520px] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.06] backdrop-blur-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.2)] md:flex-row">
          
          {/* Inner top ambient highlight */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />

          {/* ==================== LEFT SIDEBAR ==================== */}
          <aside className="relative flex flex-row items-center justify-between border-b border-white/10 p-3 md:w-20 md:flex-col md:border-b-0 md:border-r md:py-6">
            
            {/* Top Brand / Home */}
            <div className="flex flex-row items-center gap-2 md:flex-col md:gap-6">
              <button
                onClick={() => setActiveSidebar("home")}
                className="group relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8] shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-transform hover:scale-105 active:scale-95"
                title="Tanakrit & Co. CRM"
              >
                <Layers className="h-5 w-5 text-white" />
                <span className="sr-only">Dashboard Home</span>
              </button>

              {/* Navigation Capsule */}
              <div className="flex flex-row items-center gap-1 rounded-full border border-white/10 bg-white/[0.05] p-1.5 backdrop-blur-xl md:flex-col md:gap-2">
                
                {[
                  { id: "home", icon: Home, label: "Overview" },
                  { id: "search", icon: Search, label: "Quick Find" },
                  { id: "products", icon: ShoppingBag, label: "Products / Rooms" },
                  { id: "parcels", icon: Box, label: "Deliveries" },
                  { id: "customers", icon: Users, label: "Customers / Tenants" },
                  { id: "grid", icon: LayoutGrid, label: "Deals Pipeline" },
                  { id: "messages", icon: MessageCircle, label: "Messages", badge: 3 },
                  { id: "calendar", icon: Calendar, label: "Schedules" },
                  { id: "reports", icon: BarChart3, label: "Analytics & Reports" },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSidebar === item.id;
                  return (
                    <div key={item.id} className="group relative">
                      <button
                        onClick={() => setActiveSidebar(item.id as any)}
                        className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 ${
                          isActive
                            ? "bg-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.25)] ring-1 ring-white/30"
                            : "text-white/60 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {item.badge && (
                          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#3B82F6] text-[10px] font-bold text-white shadow-sm">
                            {item.badge}
                          </span>
                        )}
                      </button>

                      {/* Tooltip to the right */}
                      <div className="pointer-events-none absolute left-14 top-1/2 z-50 hidden -translate-y-1/2 whitespace-nowrap rounded-lg border border-white/15 bg-black/80 px-2.5 py-1 text-xs font-medium text-white shadow-xl backdrop-blur-md md:group-hover:block">
                        {item.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions: Settings & Power */}
            <div className="flex flex-row items-center gap-1.5 md:flex-col md:gap-3">
              <button 
                onClick={() => alert("Settings opened")}
                className="group relative flex h-10 w-10 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                title="System Settings"
              >
                <Settings className="h-4 w-4" />
                <div className="pointer-events-none absolute left-14 top-1/2 z-50 hidden -translate-y-1/2 whitespace-nowrap rounded-lg border border-white/15 bg-black/80 px-2.5 py-1 text-xs font-medium text-white shadow-xl backdrop-blur-md md:group-hover:block">
                  Settings
                </div>
              </button>

              <button 
                onClick={() => {
                  if (confirm("Sign out of CRM session?")) {
                    window.location.reload();
                  }
                }}
                className="group relative flex h-10 w-10 items-center justify-center rounded-full text-rose-400/80 transition-colors hover:bg-rose-500/20 hover:text-rose-300"
                title="Sign Out"
              >
                <Power className="h-4 w-4" />
                <div className="pointer-events-none absolute left-14 top-1/2 z-50 hidden -translate-y-1/2 whitespace-nowrap rounded-lg border border-white/15 bg-black/80 px-2.5 py-1 text-xs font-medium text-white shadow-xl backdrop-blur-md md:group-hover:block">
                  Sign Out
                </div>
              </button>
            </div>
          </aside>

          {/* ==================== RIGHT MAIN CONTAINER ==================== */}
          <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden min-h-[820px]">
            
            {/* Top Bar: Tabs & Header Controls */}
            <header className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-white/[0.04] px-6 py-4 backdrop-blur-xl">
              
              {/* Text Tabs: Overview / Sales / Marketing / Support */}
              <nav className="flex items-center space-x-6 sm:space-x-8">
                {(["Overview", "Sales", "Marketing", "Support"] as const).map((tab) => {
                  const isActive = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveTab(tab);
                        if (tab === "Sales") setActiveSidebar("reports");
                        else if (tab === "Marketing") setActiveSidebar("grid");
                        else if (tab === "Support") setActiveSidebar("parcels");
                        else setActiveSidebar("home");
                      }}
                      className={`relative pb-1 text-sm font-medium transition-colors ${
                        isActive ? "text-white" : "text-white/50 hover:text-white/80"
                      }`}
                    >
                      {tab}
                      {isActive && (
                        <motion.div
                          layoutId="activeTabUnderline"
                          className="absolute -bottom-1.5 left-0 right-0 h-0.5 rounded-full bg-white shadow-[0_0_8px_white]"
                          transition={{ type: "spring", stiffness: 500, damping: 35 }}
                        />
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Right Side Controls */}
              <div className="flex items-center space-x-3">
                {/* Dashed outline round '+' button */}
                <button
                  onClick={() => alert("Quick create opened")}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-dashed border-white/30 text-white/70 transition-colors hover:border-white hover:bg-white/10 hover:text-white"
                  title="Create New Action"
                >
                  <Plus className="h-4 w-4" />
                </button>

                {/* Grid Button */}
                <button
                  onClick={() => setActiveSidebar("grid")}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                  title="Change Layout View"
                >
                  <Grid className="h-4 w-4" />
                </button>

                {/* Bell with blue count badge */}
                <div className="relative">
                  <button
                    onClick={() => alert("3 new notifications pending")}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                    title="Notifications"
                  >
                    <Bell className="h-4 w-4" />
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#3B82F6] text-[10px] font-bold text-white shadow-[0_0_10px_rgba(59,130,246,0.8)]">
                      3
                    </span>
                  </button>
                </div>

                {/* Avatar with green online dot */}
                <div className="relative flex items-center pl-2">
                  <div className="relative h-9 w-9 overflow-hidden rounded-full border border-white/20 ring-2 ring-white/10">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                      alt="Alex Morgan"
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#0e121a] bg-emerald-400 shadow-[0_0_8px_#34D399]" />
                  </div>
                  <div className="ml-3 hidden text-left lg:block">
                    <p className="text-xs font-semibold text-white">Alex Morgan</p>
                    <p className="text-[11px] text-white/40">Administrator</p>
                  </div>
                </div>
              </div>
            </header>

            {/* ==================== PAGE CONTENT BODY ==================== */}
            <main className="flex-1 p-5 md:p-8">
              <AnimatePresence mode="wait">
                
                {/* 1. OVERVIEW PAGE (3-Column Bento Grid) */}
                {activeSidebar === "home" && (
                  <motion.div
                    key="page-overview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, filter: "blur(8px)" }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 gap-6 lg:grid-cols-3"
                  >
                    
                    {/* ========== COLUMN 1 ========== */}
                    <div className="flex flex-col gap-6">
                      
                      {/* 1. Team Card */}
                      <motion.div
                        {...cardMotion}
                        className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.12]"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-medium uppercase tracking-wider text-white/40">Active Crew</span>
                            <div className="mt-1 flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399]" />
                              <h3 className="text-sm font-semibold text-white/90">4 online now</h3>
                            </div>
                          </div>
                          <button
                            onClick={() => alert("Invite team member")}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 transition-colors hover:border-white/30 hover:bg-white/15 hover:text-white"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Overlapping Avatars */}
                        <div className="mt-5 flex items-center">
                          <div className="flex -space-x-3 overflow-hidden">
                            {MOCK_CRM_DATA.team.map((member, i) => (
                              <motion.img
                                key={member.id}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.1 + i * 0.05, type: "spring", stiffness: 400 }}
                                src={member.avatar}
                                alt={member.name}
                                className="inline-block h-10 w-10 rounded-full border-2 border-[#121622] object-cover ring-1 ring-white/20"
                                title={`${member.name} (${member.role})`}
                              />
                            ))}
                            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#121622] bg-white/10 text-xs font-semibold text-white/80 ring-1 ring-white/20">
                              +{MOCK_CRM_DATA.extraCount}
                            </div>
                          </div>
                          <div className="ml-4 text-xs text-white/50">
                            Engineering & Operations
                          </div>
                        </div>
                      </motion.div>

                      {/* 2. Quarterly Target (TALL CARD) */}
                      <motion.div
                        {...cardMotion}
                        className="group relative flex flex-1 flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-white/[0.07] p-6 backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.12]"
                      >
                        {/* Header + Toggle */}
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-medium uppercase tracking-wider text-white/40">Performance</span>
                            <h3 className="text-base font-semibold text-white">Quarterly Target</h3>
                          </div>
                          <SpringToggle checked={targetToggle} onChange={setTargetToggle} />
                        </div>

                        {/* Circular Progress Ring with Draggable / Interactive Knob */}
                        <div className="my-6 flex flex-col items-center justify-center">
                          <div className="relative flex h-52 w-52 items-center justify-center">
                            <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                              {/* Background track with subtle tick dashes */}
                              <circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke="rgba(255,255,255,0.08)"
                                strokeWidth="7"
                                strokeDasharray="2 3"
                              />
                              {/* Glowing progress stroke */}
                              <motion.circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke="#3B82F6"
                                strokeWidth="7"
                                strokeLinecap="round"
                                strokeDasharray={2 * Math.PI * 40}
                                initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                                animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - targetPercent / 100) }}
                                transition={{ duration: 1.2, ease: "easeOut" }}
                                style={{ filter: "drop-shadow(0 0 8px rgba(59,130,246,0.6))" }}
                              />
                            </svg>

                            {/* Centered Target KPI */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                              <span className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                                <AnimatedCounter value={`${targetPercent}%`} />
                              </span>
                              <span className="mt-0.5 text-xs font-medium uppercase tracking-wider text-white/50">
                                Achieved
                              </span>
                            </div>
                          </div>

                          {/* - / + Target Adjust Buttons */}
                          <div className="mt-2 flex items-center gap-3">
                            <button
                              onClick={() => handleAdjustTarget(-5)}
                              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-colors hover:bg-white/15 hover:text-white active:scale-95"
                              title="Decrease target by 5%"
                            >
                              -
                            </button>
                            <span className="text-xs font-mono text-white/60">Target {targetPercent}%</span>
                            <button
                              onClick={() => handleAdjustTarget(5)}
                              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-colors hover:bg-white/15 hover:text-white active:scale-95"
                              title="Increase target by 5%"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Bottom Row of Round Metric Chips: Revenue, Deals, Calls, Meetings */}
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                          {MOCK_CRM_DATA.target.metricChips.map((chip) => {
                            const isSelected = activeMetricChip === chip.id;
                            return (
                              <button
                                key={chip.id}
                                onClick={() => setActiveMetricChip(chip.id)}
                                className={`flex flex-col items-center rounded-xl p-2.5 text-center transition-all ${
                                  isSelected
                                    ? "bg-white text-[#0a0d14] shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                                    : "border border-white/5 bg-white/[0.04] text-white/60 hover:bg-white/10 hover:text-white"
                                }`}
                              >
                                <span className={`text-[10px] uppercase font-semibold ${isSelected ? "text-[#0a0d14]/70" : "text-white/40"}`}>
                                  {chip.label}
                                </span>
                                <span className="mt-0.5 text-xs font-bold tracking-tight">
                                  {chip.value}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>

                    </div>

                    {/* ========== COLUMN 2 ========== */}
                    <div className="flex flex-col gap-6">
                      
                      {/* 3. Revenue Card */}
                      <motion.div
                        {...cardMotion}
                        className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.07] p-6 backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.12]"
                      >
                        {/* Header + Segmented Control */}
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <span className="text-xs font-medium uppercase tracking-wider text-white/40">Gross Volume</span>
                            <div className="mt-1 flex items-baseline gap-2">
                              <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                                <AnimatedCounter value={MOCK_CRM_DATA.revenue.current} />
                              </h2>
                              <span className="text-sm font-medium text-white/40">/ {MOCK_CRM_DATA.revenue.target}</span>
                            </div>
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
                              <TrendingUp className="h-3 w-3" /> {MOCK_CRM_DATA.revenue.delta}
                            </span>
                          </div>

                          {/* Segmented Control Today/Week/Month */}
                          <div className="flex rounded-full border border-white/10 bg-white/[0.05] p-1 backdrop-blur-md">
                            {(["Today", "Week", "Month"] as const).map((period) => (
                              <button
                                key={period}
                                onClick={() => setRevenuePeriod(period)}
                                className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                                  revenuePeriod === period
                                    ? "bg-white text-[#0a0d14] shadow-sm font-semibold"
                                    : "text-white/60 hover:text-white"
                                }`}
                              >
                                {period}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Smooth Area Line Chart (SVG) */}
                        <div className="my-5 h-28 w-full">
                          <svg className="h-full w-full overflow-visible" viewBox="0 0 300 90" preserveAspectRatio="none">
                            <defs>
                              <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
                              </linearGradient>
                            </defs>
                            {/* Area fill */}
                            <path
                              d="M0,75 C50,65 90,40 140,30 C190,20 240,45 300,10 L300,90 L0,90 Z"
                              fill="url(#revenueGradient)"
                            />
                            {/* Smooth stroke */}
                            <motion.path
                              d="M0,75 C50,65 90,40 140,30 C190,20 240,45 300,10"
                              fill="none"
                              stroke="#ffffff"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ duration: 1.2, ease: "easeOut" }}
                            />
                          </svg>
                        </div>

                        {/* Row of hourly values */}
                        <div className="grid grid-cols-6 border-t border-white/10 pt-3 text-center">
                          {MOCK_CRM_DATA.revenue.hourly.map((h, i) => (
                            <div key={i} className="flex flex-col">
                              <span className="text-[10px] text-white/40">{h.time}</span>
                              <span className="mt-0.5 text-xs font-semibold text-white/80">{h.val}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>

                      {/* 4. New Leads Card & 5. Approvals Card */}
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        
                        {/* 4. New Leads "1,186" with green delta pill & mini bar chart */}
                        <motion.div
                          {...cardMotion}
                          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.12]"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium uppercase tracking-wider text-white/40">Inbound</span>
                            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
                              {MOCK_CRM_DATA.leads.delta}
                            </span>
                          </div>

                          <div className="mt-3">
                            <h3 className="text-3xl font-bold tracking-tight text-white">
                              <AnimatedCounter value={MOCK_CRM_DATA.leads.count} />
                            </h3>
                            <p className="text-xs text-white/50">New Leads MTD</p>
                          </div>

                          {/* Mini Bar Chart with last bar blue */}
                          <div className="mt-4 flex items-end gap-1.5 h-12">
                            {MOCK_CRM_DATA.leads.miniBars.map((height, i) => {
                              const isLast = i === MOCK_CRM_DATA.leads.miniBars.length - 1;
                              return (
                                <motion.div
                                  key={i}
                                  initial={{ height: 0 }}
                                  animate={{ height: `${height}%` }}
                                  transition={{ delay: 0.1 + i * 0.05, duration: 0.5 }}
                                  className={`flex-1 rounded-t-sm transition-all ${
                                    isLast ? "bg-[#3B82F6] shadow-[0_0_10px_#3B82F6]" : "bg-white/20 hover:bg-white/40"
                                  }`}
                                />
                              );
                            })}
                          </div>
                        </motion.div>

                        {/* 5. Approvals Card: 4 pending, DISCOUNT badge, $4,800, swipe slider */}
                        <motion.div
                          {...cardMotion}
                          className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.12]"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-white/50">
                                {approvalsList.length} Pending Actions
                              </span>
                              <span className="rounded bg-[#3B82F6]/20 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-[#3B82F6]">
                                DISCOUNT
                              </span>
                            </div>

                            <div className="mt-2 flex items-baseline justify-between">
                              <h4 className="text-2xl font-bold tracking-tight text-white">$4,800</h4>
                              <button
                                onClick={() => removeApproval("app-1")}
                                className="text-white/40 hover:text-white"
                                title="Dismiss"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                            <p className="text-xs text-white/50">Northwind Co. · 20% discount</p>
                          </div>

                          {/* Swipe to Approve Slider Pill */}
                          <div className="mt-4">
                            <div className="relative flex h-9 w-full items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/5 px-2">
                              <span className="text-xs font-medium text-white/50 pointer-events-none">
                                {isApproved ? "Approved ✓" : "Slide to Approve →"}
                              </span>
                              <motion.div
                                drag="x"
                                dragConstraints={{ left: 0, right: 120 }}
                                dragElastic={0.1}
                                onDrag={(_, info) => {
                                  if (info.point.x > 100) {
                                    setIsApproved(true);
                                  }
                                }}
                                className={`absolute left-1 flex h-7 w-7 cursor-grab items-center justify-center rounded-full text-white shadow-md active:cursor-grabbing ${
                                  isApproved ? "bg-emerald-500" : "bg-[#3B82F6]"
                                }`}
                              >
                                {isApproved ? <Check className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                              </motion.div>
                            </div>
                          </div>
                        </motion.div>

                      </div>

                      {/* 7. Sales (k$) Bar Chart Mon-Sun */}
                      <motion.div
                        {...cardMotion}
                        className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.07] p-6 backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.12]"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-medium uppercase tracking-wider text-white/40">Revenue Stream</span>
                            <h3 className="text-base font-semibold text-white">Weekly Invoiced (k$)</h3>
                          </div>

                          {/* Week / Month / Year control */}
                          <div className="flex rounded-full border border-white/10 bg-white/[0.05] p-1">
                            {(["Week", "Month", "Year"] as const).map((period) => (
                              <button
                                key={period}
                                onClick={() => setSalesPeriod(period)}
                                className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-all ${
                                  salesPeriod === period ? "bg-white text-[#0a0d14] font-semibold" : "text-white/60 hover:text-white"
                                }`}
                              >
                                {period}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Mon-Sun Bars with Wednesday highlighted in Blue + Floating Tooltip */}
                        <div className="relative mt-6 flex h-40 items-end justify-between gap-3 pt-6">
                          {MOCK_CRM_DATA.weeklySales.days.map((day, i) => {
                            const val = MOCK_CRM_DATA.weeklySales.values[i];
                            const isHighlighted = i === MOCK_CRM_DATA.weeklySales.highlightIndex;
                            const isHovered = hoveredBarIndex === i;

                            return (
                              <div
                                key={day}
                                onMouseEnter={() => setHoveredBarIndex(i)}
                                className="relative flex flex-1 flex-col items-center h-full justify-end cursor-pointer group/bar"
                              >
                                {/* Floating Tooltip */}
                                {isHovered && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute -top-7 z-20 whitespace-nowrap rounded-md border border-white/20 bg-black/90 px-2 py-0.5 text-[11px] font-bold text-white shadow-lg backdrop-blur-md"
                                  >
                                    ${val}k
                                  </motion.div>
                                )}

                                <motion.div
                                  initial={{ height: 0 }}
                                  animate={{ height: `${(val / 28) * 100}%` }}
                                  transition={{ delay: 0.1 + i * 0.05, duration: 0.6 }}
                                  className={`w-full max-w-[32px] rounded-t-md transition-colors ${
                                    isHighlighted
                                      ? "bg-[#3B82F6] shadow-[0_0_15px_rgba(59,130,246,0.6)]"
                                      : "bg-white/15 hover:bg-white/30"
                                  }`}
                                />
                                <span className={`mt-2 text-xs font-medium ${isHighlighted ? "text-white font-bold" : "text-white/40"}`}>
                                  {day}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>

                    </div>

                    {/* ========== COLUMN 3 ========== */}
                    <div className="flex flex-col gap-6">
                      
                      {/* 6. Right column 2x2 KPI Tiles */}
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        
                        {/* Tile 1: Customers 2,739 with toggle */}
                        <motion.div
                          {...cardMotion}
                          className={`rounded-2xl border border-white/10 p-4 backdrop-blur-xl transition-all duration-300 ${
                            tileState.customers ? "bg-white/[0.09] shadow-lg" : "bg-white/[0.04] opacity-75"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white">
                              <Users className="h-4 w-4" />
                            </div>
                            <SpringToggle
                              checked={tileState.customers}
                              onChange={(val) => setTileState((p) => ({ ...p, customers: val }))}
                            />
                          </div>
                          <div className="mt-3">
                            <span className="text-xs text-white/50">Total Customers</span>
                            <div className="text-2xl font-bold tracking-tight text-white">
                              <AnimatedCounter value={MOCK_CRM_DATA.kpiTiles.customers.count} />
                            </div>
                            <span className="text-[11px] font-medium text-emerald-400">
                              {MOCK_CRM_DATA.kpiTiles.customers.delta}
                            </span>
                          </div>
                        </motion.div>

                        {/* Tile 2: Pipeline $1.19M with mini horizontal funnel bars */}
                        <motion.div
                          {...cardMotion}
                          className={`rounded-2xl border border-white/10 p-4 backdrop-blur-xl transition-all duration-300 ${
                            tileState.pipeline ? "bg-white/[0.09] shadow-lg" : "bg-white/[0.04] opacity-75"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white">
                              <Flame className="h-4 w-4" />
                            </div>
                            <SpringToggle
                              checked={tileState.pipeline}
                              onChange={(val) => setTileState((p) => ({ ...p, pipeline: val }))}
                            />
                          </div>
                          <div className="mt-3">
                            <span className="text-xs text-white/50">Pipeline Value</span>
                            <div className="text-2xl font-bold tracking-tight text-white">
                              <AnimatedCounter value={MOCK_CRM_DATA.kpiTiles.pipeline.total} />
                            </div>
                            {/* Mini Horizontal Funnel Bars */}
                            <div className="mt-2 flex flex-col gap-1">
                              {MOCK_CRM_DATA.kpiTiles.pipeline.funnel.map((item) => (
                                <div key={item.stage} className="flex items-center gap-1 text-[10px] text-white/50">
                                  <span className="w-10 truncate">{item.stage}</span>
                                  <div className="h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden">
                                    <div
                                      className="h-full rounded-full bg-[#3B82F6]"
                                      style={{ width: `${item.pct}%` }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>

                        {/* Tile 3: Active Users 300 with blue sparkline (toggled ON = card lights up) */}
                        <motion.div
                          {...cardMotion}
                          className={`rounded-2xl border transition-all duration-300 p-4 backdrop-blur-xl ${
                            tileState.activeUsers
                              ? "border-[#3B82F6]/40 bg-[#3B82F6]/10 shadow-[0_0_25px_rgba(59,130,246,0.2)]"
                              : "border-white/10 bg-white/[0.04] opacity-70"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white">
                              <Activity className="h-4 w-4" />
                            </div>
                            <SpringToggle
                              checked={tileState.activeUsers}
                              onChange={(val) => setTileState((p) => ({ ...p, activeUsers: val }))}
                            />
                          </div>
                          <div className="mt-3">
                            <span className="text-xs text-white/50">Active Users</span>
                            <div className="text-2xl font-bold tracking-tight text-white">
                              <AnimatedCounter value={MOCK_CRM_DATA.kpiTiles.activeUsers.count} />
                            </div>
                            {/* Blue Sparkline */}
                            <div className="mt-2 h-7 w-full">
                              <svg className="h-full w-full" viewBox="0 0 100 25" preserveAspectRatio="none">
                                <path
                                  d="M0,20 Q20,5 40,16 T70,8 T100,2"
                                  fill="none"
                                  stroke="#3B82F6"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                />
                              </svg>
                            </div>
                          </div>
                        </motion.div>

                        {/* Tile 4: Open Tickets 17 with red delta */}
                        <motion.div
                          {...cardMotion}
                          className={`rounded-2xl border border-white/10 p-4 backdrop-blur-xl transition-all duration-300 ${
                            tileState.openTickets ? "bg-white/[0.09] shadow-lg" : "bg-white/[0.04] opacity-75"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white">
                              <ShieldCheck className="h-4 w-4" />
                            </div>
                            <SpringToggle
                              checked={tileState.openTickets}
                              onChange={(val) => setTileState((p) => ({ ...p, openTickets: val }))}
                            />
                          </div>
                          <div className="mt-3">
                            <span className="text-xs text-white/50">Open Tickets</span>
                            <div className="text-2xl font-bold tracking-tight text-white">
                              <AnimatedCounter value={MOCK_CRM_DATA.kpiTiles.openTickets.count} />
                            </div>
                            <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-semibold text-rose-400">
                              {MOCK_CRM_DATA.kpiTiles.openTickets.delta}
                            </span>
                          </div>
                        </motion.div>

                      </div>

                      {/* 8. Media Card: "Discovery Call · Northwind Co." */}
                      <motion.div
                        {...cardMotion}
                        className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.12]"
                      >
                        <span className="text-xs font-medium uppercase tracking-wider text-white/40">Latest Recording</span>
                        
                        <div className="mt-3 flex items-center gap-3">
                          <img
                            src={MOCK_CRM_DATA.discoveryCall.avatar}
                            alt={MOCK_CRM_DATA.discoveryCall.caller}
                            className="h-10 w-10 rounded-full border border-white/20 object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="truncate text-sm font-semibold text-white">
                              {MOCK_CRM_DATA.discoveryCall.title}
                            </h4>
                            <p className="text-xs text-white/50">
                              {MOCK_CRM_DATA.discoveryCall.caller} · {MOCK_CRM_DATA.discoveryCall.callerTitle}
                            </p>
                          </div>
                        </div>

                        {/* Blue Audio Waveform with Animated Playhead */}
                        <div className="relative mt-4 flex h-14 items-center justify-between gap-1 rounded-xl bg-black/20 p-2.5">
                          {MOCK_CRM_DATA.discoveryCall.waveform.map((amp, idx) => {
                            const pct = (idx / MOCK_CRM_DATA.discoveryCall.waveform.length) * 100;
                            const isPassed = pct <= audioPlayhead;

                            return (
                              <div
                                key={idx}
                                className="flex-1 flex items-center justify-center h-full"
                              >
                                <div
                                  className={`w-1 rounded-full transition-all duration-200 ${
                                    isPassed ? "bg-[#3B82F6]" : "bg-white/20"
                                  }`}
                                  style={{ height: `${amp}%` }}
                                />
                              </div>
                            );
                          })}

                          {/* Playhead marker line */}
                          <div
                            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_white] transition-all pointer-events-none"
                            style={{ left: `${audioPlayhead}%` }}
                          />
                        </div>

                        {/* Prev / Play-Pause / Next Controls */}
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-xs font-mono text-white/40">
                            {MOCK_CRM_DATA.discoveryCall.duration}
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setAudioPlayhead(0)}
                              className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"
                              title="Previous"
                            >
                              <SkipBack className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3B82F6] text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-transform hover:scale-105 active:scale-95"
                              title={isPlayingAudio ? "Pause" : "Play"}
                            >
                              {isPlayingAudio ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                            </button>
                            <button
                              onClick={() => setAudioPlayhead(100)}
                              className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"
                              title="Next"
                            >
                              <SkipForward className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>

                    </div>

                  </motion.div>
                )}

                {/* 2. REPORTS PAGE */}
                {activeSidebar === "reports" && (
                  <motion.div
                    key="page-reports"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, filter: "blur(8px)" }}
                    className="flex flex-col gap-6"
                  >
                    {/* 4 KPI Cards */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {[
                        { label: "Total Revenue", val: "$284,500", delta: "+14.8%", up: true },
                        { label: "Target Attainment", val: "94.2%", delta: "+3.1%", up: true },
                        { label: "Average Deal Size", val: "$18,400", delta: "+8.0%", up: true },
                        { label: "CAC Payback", val: "4.2 mo", delta: "-0.5 mo", up: true },
                      ].map((item, idx) => (
                        <div key={idx} className="rounded-2xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur-xl">
                          <span className="text-xs text-white/50">{item.label}</span>
                          <div className="mt-1 text-2xl font-bold text-white"><AnimatedCounter value={item.val} /></div>
                          <span className="text-xs font-semibold text-emerald-400">{item.delta}</span>
                        </div>
                      ))}
                    </div>

                    {/* Revenue vs Target Line Chart & Donut Chart */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-6 backdrop-blur-xl lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-base font-semibold text-white">Revenue vs Target (Annual)</h3>
                          <span className="text-xs text-white/40">Fiscal Year 2026</span>
                        </div>
                        <div className="h-64 w-full flex items-center justify-center">
                          <svg className="h-full w-full" viewBox="0 0 500 200">
                            {/* Target dashed line */}
                            <line x1="0" y1="60" x2="500" y2="60" stroke="rgba(255,255,255,0.2)" strokeDasharray="4 4" strokeWidth="2" />
                            {/* Revenue Path */}
                            <path
                              d="M0,170 Q100,140 200,90 T350,50 T500,30"
                              fill="none"
                              stroke="#3B82F6"
                              strokeWidth="3"
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>
                      </div>

                      {/* Donut Chart: Revenue by Channel */}
                      <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-6 backdrop-blur-xl flex flex-col items-center justify-between">
                        <h3 className="text-base font-semibold text-white self-start">Revenue by Channel</h3>
                        <div className="relative h-44 w-44 my-4 flex items-center justify-center">
                          <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
                            <circle cx="50" cy="50" r="38" fill="none" stroke="#3B82F6" strokeWidth="12" strokeDasharray="160 240" />
                            <circle cx="50" cy="50" r="38" fill="none" stroke="#10B981" strokeWidth="12" strokeDasharray="60 240" strokeDashoffset="-160" />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-xs text-white/40">Direct Enterprise</span>
                            <span className="text-lg font-bold text-white">68%</span>
                          </div>
                        </div>
                        <div className="w-full flex justify-between text-xs text-white/60">
                          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#3B82F6]" /> Direct Sales</span>
                          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Inbound / Web</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 3. DEALS PIPELINE KANBAN PAGE */}
                {activeSidebar === "grid" && (
                  <motion.div
                    key="page-pipeline"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, filter: "blur(8px)" }}
                    className="flex flex-col gap-6"
                  >
                    {/* KPI Row */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      {[
                        { label: "Active Deals", val: "28" },
                        { label: "Weighted Forecast", val: "$640k" },
                        { label: "Win Probability", val: "54%" },
                        { label: "Cycle Velocity", val: "18 days" },
                      ].map((k, i) => (
                        <div key={i} className="rounded-xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-xl">
                          <span className="text-xs text-white/50">{k.label}</span>
                          <div className="text-xl font-bold text-white">{k.val}</div>
                        </div>
                      ))}
                    </div>

                    {/* Kanban Columns: Lead / Qualified / Proposal / Negotiation / Won */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                      {(["lead", "qualified", "proposal", "negotiation", "won"] as const).map((stage) => {
                        const items = MOCK_CRM_DATA.dealsPipeline[stage] || [];
                        return (
                          <div key={stage} className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-xl">
                            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                              <span className="text-xs font-bold uppercase tracking-wider text-white/70">
                                {stage}
                              </span>
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px] font-semibold text-white">
                                {items.length}
                              </span>
                            </div>

                            <div className="flex flex-col gap-2.5">
                              {items.map((deal) => (
                                <div
                                  key={deal.id}
                                  className="rounded-xl border border-white/10 bg-white/[0.07] p-3 transition-transform hover:-translate-y-1 hover:border-white/30"
                                >
                                  <span className="rounded bg-[#3B82F6]/20 px-1.5 py-0.5 text-[9px] font-bold text-[#3B82F6]">
                                    {deal.tag}
                                  </span>
                                  <h5 className="mt-1.5 text-xs font-semibold text-white">{deal.title}</h5>
                                  <p className="text-[11px] text-white/50">{deal.company}</p>
                                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/5">
                                    <span className="text-xs font-bold text-white">{deal.value}</span>
                                    <span className="text-[10px] text-emerald-400">{deal.probability}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* 4. CUSTOMERS PAGE */}
                {activeSidebar === "customers" && (
                  <motion.div
                    key="page-customers"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, filter: "blur(8px)" }}
                    className="flex flex-col gap-6"
                  >
                    {/* 4 KPI Cards */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      {[
                        { label: "Total Accounts", val: "2,739" },
                        { label: "Active Subscriptions", val: "2,410" },
                        { label: "Net Retention", val: "118%" },
                        { label: "Avg LTV", val: "$34,200" },
                      ].map((item, idx) => (
                        <div key={idx} className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-xl">
                          <span className="text-xs text-white/50">{item.label}</span>
                          <div className="text-xl font-bold text-white">{item.val}</div>
                        </div>
                      ))}
                    </div>

                    {/* Filter Chips + Search + Export + Add Customer */}
                    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-xl">
                      <div className="flex flex-wrap items-center gap-2">
                        {(["All", "Active", "Trial", "Lead", "Churned"] as const).map((chip) => (
                          <button
                            key={chip}
                            onClick={() => setCustomerFilter(chip)}
                            className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                              customerFilter === chip
                                ? "bg-white text-[#0a0d14] font-semibold"
                                : "border border-white/10 bg-white/5 text-white/60 hover:text-white"
                            }`}
                          >
                            {chip}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
                          <input
                            type="text"
                            placeholder="Filter accounts..."
                            value={customerSearch}
                            onChange={(e) => setCustomerSearch(e.target.value)}
                            className="h-8 rounded-full border border-white/10 bg-white/5 pl-8 pr-3 text-xs text-white placeholder-white/40 focus:border-white/30 focus:outline-none"
                          />
                        </div>
                        <button
                          onClick={() => alert("Exported customers CSV")}
                          className="flex h-8 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 text-xs text-white/70 hover:text-white"
                        >
                          <Download className="h-3 w-3" /> Export
                        </button>
                        <button
                          onClick={() => alert("Add customer form")}
                          className="flex h-8 items-center gap-1 rounded-full bg-white px-3.5 text-xs font-semibold text-[#0a0d14] shadow-md hover:bg-white/90"
                        >
                          <Plus className="h-3.5 w-3.5" /> Add Customer
                        </button>
                      </div>
                    </div>

                    {/* Customers Table */}
                    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.07] backdrop-blur-xl">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-white/10 text-white/40">
                            <th className="p-4 font-medium">Customer</th>
                            <th className="p-4 font-medium">Company</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium">Owner</th>
                            <th className="p-4 font-medium">LTV</th>
                            <th className="p-4 font-medium">Last Contact</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {MOCK_CRM_DATA.customersList
                            .filter((c) => customerFilter === "All" || c.status === customerFilter)
                            .filter((c) => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.company.toLowerCase().includes(customerSearch.toLowerCase()))
                            .map((c) => (
                              <tr key={c.id} className="transition-colors hover:bg-white/[0.04]">
                                <td className="p-4 flex items-center gap-2.5">
                                  <img src={c.avatar} alt={c.name} className="h-7 w-7 rounded-full object-cover" />
                                  <span className="font-semibold text-white">{c.name}</span>
                                </td>
                                <td className="p-4 text-white/80">{c.company}</td>
                                <td className="p-4">
                                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                    c.status === "Active" ? "bg-emerald-500/15 text-emerald-400" :
                                    c.status === "Trial" ? "bg-amber-500/15 text-amber-400" :
                                    c.status === "Lead" ? "bg-[#3B82F6]/15 text-[#3B82F6]" : "bg-rose-500/15 text-rose-400"
                                  }`}>
                                    {c.status}
                                  </span>
                                </td>
                                <td className="p-4 text-white/60">{c.owner}</td>
                                <td className="p-4 font-mono font-semibold text-white">{c.ltv}</td>
                                <td className="p-4 text-white/40">{c.lastContact}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}

                {/* 5. PRODUCTS / ROOMS PAGE */}
                {activeSidebar === "products" && (
                  <motion.div
                    key="page-products"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, filter: "blur(8px)" }}
                    className="flex flex-col gap-6"
                  >
                    {/* KPI Row */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      {[
                        { label: "Catalog Units", val: "4 active" },
                        { label: "Available Inventory", val: "84 slots" },
                        { label: "Capacity Rate", val: "89%" },
                        { label: "Avg Monthly Rate", val: "$1,024" },
                      ].map((item, idx) => (
                        <div key={idx} className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-xl">
                          <span className="text-xs text-white/50">{item.label}</span>
                          <div className="text-xl font-bold text-white">{item.val}</div>
                        </div>
                      ))}
                    </div>

                    {/* Product Grid Cards with vivid gradient icons */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                      {productsList.map((prod) => (
                        <div
                          key={prod.id}
                          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur-xl transition-all hover:bg-white/[0.12] hover:-translate-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr ${prod.gradient} text-white shadow-lg`}>
                              <Box className="h-6 w-6" />
                            </div>
                            <SpringToggle
                              checked={prod.active}
                              onChange={(val) => {
                                setProductsList((list) =>
                                  list.map((p) => (p.id === prod.id ? { ...p, active: val } : p))
                                );
                              }}
                            />
                          </div>

                          <div className="mt-4">
                            <span className="text-[10px] uppercase font-semibold text-white/40">{prod.category}</span>
                            <h4 className="mt-0.5 text-base font-bold text-white">{prod.name}</h4>
                            <p className="mt-1 text-sm font-semibold text-[#3B82F6]">{prod.price}</p>
                          </div>

                          {/* Stock progress bar */}
                          <div className="mt-5">
                            <div className="flex justify-between text-xs text-white/50 mb-1">
                              <span>Inventory</span>
                              <span>{prod.stock} / {prod.maxStock}</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-[#3B82F6] to-cyan-400"
                                style={{ width: `${(prod.stock / prod.maxStock) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </main>

          </div>

        </div>

      </div>

    </div>
  );
}

export default GlassCrmDashboard;
