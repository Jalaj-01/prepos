// dashboard/page.js — UNIFIED COMMAND CENTER (Prelims + Mains + Planner + Notes)
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  Flame,
  Calendar,
  Trophy,
  Settings,
  X,
  Sparkles,
  ArrowUpRight,
  Award,
  Library,
  FolderOpen,
  GraduationCap,
  AlertCircle,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import axios from "axios";
import Sidebar from "@/components/layout/Sidebar";
import TopHeader from "@/components/layout/TopHeader";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import StorageWidget from "@/components/dashboard/StorageWidget";
import AnnouncementBanner from "@/components/dashboard/AnnouncementBanner";
import RecentlyViewedWidget from "@/components/dashboard/RecentlyViewedWidget";
import LeaderboardWidget from "@/components/dashboard/LeaderboardWidget";
import PlannerWidget from "@/components/dashboard/PlannerWidget";
import StickyNotesWidget from "@/components/dashboard/StickyNotesWidget";
import OnboardingTour from "@/components/onboarding/OnboardingTour";
import { showToast } from "@/components/ui/Toast";
import { DashboardSkeleton } from "@/components/ui/Skeleton";

export default function UnifiedDashboard() {
  const [user, setUser] = useState(null);
  const [unified, setUnified] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [updating, setUpdating] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    const info = localStorage.getItem("userInfo");
    if (!info) {
      window.location.href = "/login";
      return;
    }
    const parsedUser = JSON.parse(info);
    setUser(parsedUser);
    fetchUnified(parsedUser);
  }, []);

  const fetchUnified = async (parsedUser) => {
    const config = { headers: { Authorization: `Bearer ${parsedUser.token}` } };
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!baseUrl) {
      console.error("NEXT_PUBLIC_API_URL is not defined");
      setApiError(true);
      setLoading(false);
      return;
    }

    try {
      const unifiedRes = await axios
        .get(`${baseUrl}/api/analytics/unified-dashboard`, config)
        .catch((e) => {
          console.warn("Unified API:", e.message);
          return { data: null };
        });

      if (unifiedRes.data) setUnified(unifiedRes.data);
    } catch (err) {
      console.error("Unified Dashboard Fetch Error:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("userInfo");
        window.location.href = "/login";
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDate = async () => {
    if (!newDate) return;
    setUpdating(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`,
        { targetCompletionDate: newDate },
        config
      );
      localStorage.setItem("userInfo", JSON.stringify(data));
      setUser(data);
      setShowSettings(false);
      showToast.success("Target updated! Daily goal recalculated.");
    } catch (err) {
      showToast.error("Failed to update target.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-brand-light flex">
        {user && <Sidebar isAdmin={user.isAdmin} />}
        <div className="flex-1 flex flex-col min-h-screen min-w-0">
          {user && <TopHeader user={user} onMenuClick={() => {}} />}
          <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-[1600px] w-full mx-auto">
            <DashboardSkeleton />
          </main>
        </div>
      </div>
    );
  }

  const prelims = unified?.prelims || {};
  const mains = unified?.mains || {};
  const overall = unified?.overall || {};

  const prelimsProgressPct = Math.min(
    ((prelims.todaySolved || 0) / (prelims.dailyTarget || 1)) * 100,
    100
  );

  const greetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen bg-brand-light flex">
      <Sidebar isAdmin={user.isAdmin} />
      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <TopHeader user={user} onMenuClick={() => setMobileNavOpen(true)} />

        <main className="flex-1 p-3 sm:p-6 lg:p-10 max-w-[1600px] w-full mx-auto">
          <AnnouncementBanner />

          {apiError && (
            <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-sm font-bold">
              <AlertCircle size={16} className="shrink-0" />
              <span>
                Could not connect to server. Check that{" "}
                <code className="bg-red-100 px-1 rounded">
                  NEXT_PUBLIC_API_URL
                </code>{" "}
                is set in your{" "}
                <code className="bg-red-100 px-1 rounded">.env.local</code>.
              </span>
            </div>
          )}

          {/* ── HERO ── */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
          >
            <div className="min-w-0 flex-1">
              <p className="text-brand-muted font-bold text-xs sm:text-sm tracking-tight">
                {greetingTime()},
              </p>
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black text-brand-dark tracking-tighter mt-1 truncate">
                {user.name.split(" ")[0]} 👋
              </h1>
              <p className="text-brand-muted font-medium mt-2 text-xs sm:text-sm lg:text-base">
                Your UPSC command center — Prelims & Mains, all in one view.
              </p>
            </div>

            <button
              data-tour="adjust-target"
              onClick={() => setShowSettings(true)}
              className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 bg-white border border-brand-border rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest text-brand-muted hover:text-brand-dark hover:border-brand-accent transition-all shrink-0"
            >
              <Settings size={14} />
              Adjust Target
            </button>
          </motion.div>

          {/* ── KPI GRID ── */}
          <div
            data-tour="kpi-cards"
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8"
          >
            <KpiCard
              icon={Flame}
              label="Current Streak"
              value={overall.currentStreak || 0}
              color="from-orange-500 to-red-500"
              sub={`longest: ${overall.longestStreak || 0} days`}
            />
            <KpiCard
              icon={Award}
              label="Overall Readiness"
              value={`${overall.readinessScore || 0}%`}
              color="from-purple-500 to-pink-500"
              sub="UPSC preparedness"
            />
            <KpiCard
              icon={Target}
              label="Prelims Solved"
              value={prelims.totalSolved || 0}
              color="from-blue-500 to-cyan-500"
              sub={`${prelims.completionPercentage || 0}% of pool`}
            />
            <KpiCard
              icon={GraduationCap}
              label="Mains Done"
              value={mains.totalDone || 0}
              color="from-green-500 to-emerald-500"
              sub={`${mains.completionPercentage || 0}% of pool`}
            />
          </div>

          {/* ── MAIN GRID ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            {/* ════ LEFT — 8 cols (Primary actions) ════ */}
            <div className="lg:col-span-8 space-y-4 sm:space-y-6">
              {/* PRELIMS + MAINS — side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* PRELIMS CARD */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-brand-dark to-gray-900 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 relative overflow-hidden flex flex-col"
                >
                  <div className="absolute top-0 right-0 w-48 h-48 bg-brand-accent/10 rounded-full blur-3xl -translate-y-24 translate-x-24" />

                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="bg-brand-accent/20 p-1.5 rounded-lg">
                        <Target size={14} className="text-brand-accent" />
                      </div>
                      <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-brand-accent">
                        Prelims
                      </p>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black tracking-tight mb-1">
                      {(prelims.todaySolved || 0) >= (prelims.dailyTarget || 0)
                        ? "Target Crushed! 🎯"
                        : `${(prelims.dailyTarget || 0) - (prelims.todaySolved || 0)} to go today`}
                    </h2>
                    <p className="text-white/60 text-xs font-medium mb-4">
                      {prelims.todaySolved || 0} of {prelims.dailyTarget || 0}{" "}
                      MCQs completed today
                    </p>

                    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mb-4">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${prelimsProgressPct}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-brand-accent to-purple-400 rounded-full"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-4 text-[11px]">
                      <div className="bg-white/5 rounded-lg p-2">
                        <p className="text-white/50 font-bold uppercase tracking-wider text-[9px]">
                          Revisions
                        </p>
                        <p className="font-black text-lg leading-tight">
                          {prelims.revisionsDue || 0}
                        </p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2">
                        <p className="text-white/50 font-bold uppercase tracking-wider text-[9px]">
                          Pool
                        </p>
                        <p className="font-black text-lg leading-tight">
                          {prelims.totalSolved || 0}/
                          {prelims.totalAvailable || 0}
                        </p>
                      </div>
                    </div>

                    {prelims.weakestSubject && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2 mb-4">
                        <p className="text-[9px] font-black uppercase tracking-wider text-red-300">
                          Weakest
                        </p>
                        <p className="text-xs font-black truncate">
                          {prelims.weakestSubject.name}{" "}
                          <span className="text-red-300">
                            ({prelims.weakestSubject.accuracy}%)
                          </span>
                        </p>
                      </div>
                    )}

                    <div className="mt-auto flex flex-col gap-2">
                      <div className="flex gap-2">
                        <Link
                          href={
                            prelims.hasGsTrack
                              ? "/practice?mode=GS"
                              : "/practice/setup?mode=GS"
                          }
                          className="flex-1 bg-white text-brand-dark py-2.5 rounded-xl font-black text-[11px] text-center hover:bg-brand-accent hover:text-white transition-all"
                        >
                          {prelims.hasGsTrack ? "GS" : "Start GS"}
                        </Link>
                        <Link
                          href={
                            prelims.hasCsatTrack
                              ? "/practice?mode=CSAT"
                              : "/practice/setup?mode=CSAT"
                          }
                          className="flex-1 bg-white/10 border border-white/20 text-white py-2.5 rounded-xl font-black text-[11px] text-center hover:bg-white/20 transition-all"
                        >
                          {prelims.hasCsatTrack ? "CSAT" : "Start CSAT"}
                        </Link>
                      </div>
                      <Link
                        href="/prelims-dashboard"
                        className="flex items-center justify-center gap-1.5 text-[11px] font-black text-brand-accent hover:text-white transition-all py-1"
                      >
                        Open Prelims Dashboard <ArrowUpRight size={12} />
                      </Link>
                    </div>
                  </div>
                </motion.div>

                {/* MAINS CARD */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-brand-border rounded-2xl sm:rounded-3xl p-5 sm:p-7 relative overflow-hidden flex flex-col"
                >
                  <div className="absolute top-0 right-0 w-48 h-48 bg-green-500/5 rounded-full blur-3xl -translate-y-24 translate-x-24" />

                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="bg-green-500/10 p-1.5 rounded-lg">
                        <GraduationCap size={14} className="text-green-600" />
                      </div>
                      <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-green-600">
                        Mains
                      </p>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black tracking-tight mb-1 text-brand-dark">
                      {mains.todayDone || 0} answered today
                    </h2>
                    <p className="text-brand-muted text-xs font-medium mb-4">
                      {mains.totalDone || 0} of {mains.totalAvailable || 0}{" "}
                      questions completed
                    </p>

                    <div className="w-full bg-brand-light h-2 rounded-full overflow-hidden mb-4">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${mains.completionPercentage || 0}%`,
                        }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-4 text-[11px]">
                      <div className="bg-brand-light rounded-lg p-2">
                        <p className="text-brand-muted font-bold uppercase tracking-wider text-[9px]">
                          This Week
                        </p>
                        <p className="font-black text-lg leading-tight text-brand-dark">
                          {mains.doneThisWeek || 0}
                        </p>
                      </div>
                      <div className="bg-brand-light rounded-lg p-2">
                        <p className="text-brand-muted font-bold uppercase tracking-wider text-[9px]">
                          This Month
                        </p>
                        <p className="font-black text-lg leading-tight text-brand-dark">
                          {mains.doneThisMonth || 0}
                        </p>
                      </div>
                    </div>

                    {mains.weakestPaper && (
                      <div className="bg-orange-50 border border-orange-100 rounded-lg p-2 mb-4">
                        <p className="text-[9px] font-black uppercase tracking-wider text-orange-600">
                          Weakest Paper
                        </p>
                        <p className="text-xs font-black text-brand-dark truncate">
                          {mains.weakestPaper.name}{" "}
                          <span className="text-orange-500">
                            ({mains.weakestPaper.percentage}%)
                          </span>
                        </p>
                      </div>
                    )}

                    <div className="mt-auto flex flex-col gap-2">
                      <Link
                        href="/mains"
                        className="block w-full bg-brand-dark text-white py-2.5 rounded-xl font-black text-[11px] text-center hover:bg-brand-accent transition-all"
                      >
                        Go to Mains Dashboard
                      </Link>
                      <Link
                        href="/mains/library"
                        className="flex items-center justify-center gap-1.5 text-[11px] font-black text-brand-muted hover:text-brand-dark transition-all py-1"
                      >
                        Open Mains Library <ArrowUpRight size={12} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* PLANNER + STICKY NOTES — side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <PlannerWidget />
                <StickyNotesWidget />
              </div>

              {/* CONSISTENCY CARD */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 relative overflow-hidden"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Flame size={16} className="fill-white" />
                  <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-white/80">
                    Combined Consistency (Prelims + Mains)
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-[10px] font-bold opacity-70 uppercase tracking-wider">
                      Current
                    </p>
                    <p className="text-2xl sm:text-3xl font-black">
                      {overall.currentStreak || 0}
                    </p>
                    <p className="text-[10px] opacity-70 font-bold">days</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold opacity-70 uppercase tracking-wider">
                      Longest
                    </p>
                    <p className="text-2xl sm:text-3xl font-black">
                      {overall.longestStreak || 0}
                    </p>
                    <p className="text-[10px] opacity-70 font-bold">days</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold opacity-70 uppercase tracking-wider">
                      Active Days
                    </p>
                    <p className="text-2xl sm:text-3xl font-black">
                      {overall.consistencyDays || 0}
                    </p>
                    <p className="text-[10px] opacity-70 font-bold">total</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* ════ RIGHT — 4 cols (Quick refs & passive widgets) ════ */}
            <div className="lg:col-span-4 space-y-4 sm:space-y-6">
              {/* QUICK ACCESS */}
              <motion.div
                data-tour="quick-access"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-brand-border rounded-2xl sm:rounded-3xl p-5 sm:p-6"
              >
                <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-brand-muted mb-4">
                  Quick Access
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <QuickAccessTile
                    href="/prelims-dashboard"
                    icon={BarChart3}
                    label="Prelims"
                    color="bg-blue-50 text-blue-600"
                  />
                  <QuickAccessTile
                    href="/mains"
                    icon={GraduationCap}
                    label="Mains"
                    color="bg-purple-50 text-purple-600"
                  />
                  <QuickAccessTile
                    href="/planner"
                    icon={Calendar}
                    label="Planner"
                    color="bg-pink-50 text-pink-600"
                  />
                  <QuickAccessTile
                    href="/library"
                    icon={Library}
                    label="Library"
                    color="bg-cyan-50 text-cyan-600"
                  />
                  <QuickAccessTile
                    href="/vault"
                    icon={FolderOpen}
                    label="My Vault"
                    color="bg-green-50 text-green-600"
                  />
                  <QuickAccessTile
                    href="/revision"
                    icon={Sparkles}
                    label="Revision"
                    color="bg-yellow-50 text-yellow-600"
                  />
                </div>
              </motion.div>

              {/* LEADERBOARD */}
              <div data-tour="leaderboard">
                <LeaderboardWidget />
              </div>

              {/* RECENTLY VIEWED */}
              <RecentlyViewedWidget />

              {/* STORAGE WIDGET */}
              <div data-tour="storage">
                <StorageWidget />
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>

      {/* ── SETTINGS MODAL ── */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 bg-brand-dark/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl relative"
            >
              <button
                onClick={() => setShowSettings(false)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 hover:bg-brand-light rounded-xl text-brand-muted"
              >
                <X size={18} />
              </button>

              <h2 className="text-xl sm:text-2xl font-black mb-2 tracking-tight">
                Adjust Preparation Goal
              </h2>
              <p className="text-brand-muted text-xs sm:text-sm mb-5 sm:mb-6 leading-relaxed">
                Updating your target date will automatically recalculate your
                required daily MCQ count.
              </p>

              <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted ml-1">
                New Completion Date
              </label>
              <input
                type="date"
                className="w-full mt-2 p-3 sm:p-4 bg-brand-light border border-brand-border rounded-xl sm:rounded-2xl font-bold outline-none focus:border-brand-accent transition-all text-sm"
                onChange={(e) => setNewDate(e.target.value)}
              />

              <button
                onClick={handleUpdateDate}
                disabled={updating || !newDate}
                className="w-full mt-5 sm:mt-6 bg-brand-dark text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black shadow-lg hover:bg-brand-accent transition-all disabled:opacity-50 text-xs sm:text-sm uppercase tracking-widest"
              >
                {updating ? "Recalculating..." : "Save New Target"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <OnboardingTour />
    </div>
  );
}

// ─────────────────────────────────────────────
// Shared sub-components
// ─────────────────────────────────────────────

function KpiCard({ icon: Icon, label, value, sub, color }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-brand-border"
    >
      <div
        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 sm:mb-4`}
      >
        <Icon size={16} className="text-white" />
      </div>
      <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-brand-muted mb-1">
        {label}
      </p>
      <p className="text-lg sm:text-2xl font-black text-brand-dark leading-none">
        {value}
      </p>
      <p className="text-[10px] sm:text-xs text-brand-muted font-medium mt-1 sm:mt-2 truncate">
        {sub}
      </p>
    </motion.div>
  );
}

function QuickAccessTile({ href, icon: Icon, label, color }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-start gap-2 p-3 rounded-xl sm:rounded-2xl hover:bg-brand-light transition-all border border-transparent hover:border-brand-border"
    >
      <div
        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center ${color}`}
      >
        <Icon size={14} />
      </div>
      <span className="text-[11px] sm:text-xs font-black text-brand-dark">
        {label}
      </span>
    </Link>
  );
}