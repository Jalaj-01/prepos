"use client";

import { useState, useEffect } from "react";

import { motion, AnimatePresence } from "framer-motion";

import {
    Target,
    Flame,
    BookOpen,
    TrendingUp,
    Calendar,
    Clock,
    BarChart3,
    Trophy,
    Settings,
    X,
    Brain,
    Sparkles,
    ArrowUpRight,
    Zap,
    Award,
    Library,
    FolderOpen,
    GraduationCap
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

import OnboardingTour from "@/components/onboarding/OnboardingTour";

import { showToast } from "@/components/ui/Toast";

import { DashboardSkeleton } from "@/components/ui/Skeleton";

export default function Dashboard() {

    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [dailyProgress, setDailyProgress] = useState(0);
    const [loading, setLoading] = useState(true);
    const [gsTrack, setGsTrack] = useState(null);
    const [csatTrack, setCsatTrack] = useState(null);
    const [completionData, setCompletionData] = useState(null);
    const [selectedMode, setSelectedMode] = useState("GS");
    const [weakAreaData, setWeakAreaData] = useState(null);
    const [recommendationData, setRecommendationData] = useState(null);
    const [showSettings, setShowSettings] = useState(false);
    const [newDate, setNewDate] = useState("");
    const [updating, setUpdating] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    // =========================
    // INITIAL FETCH
    // =========================

    useEffect(() => {
        const info = localStorage.getItem("userInfo");
        if (!info) {
            window.location.href = "/login";
            return;
        }
        const parsedUser = JSON.parse(info);
        setUser(parsedUser);
        fetchAllData(parsedUser);
    }, []);

    // =========================
    // MODE CHANGE
    // =========================

    useEffect(() => {
        if (user && (gsTrack || csatTrack)) {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            fetchModeData(config);
        }
    }, [selectedMode]);

    // =========================
    // FETCH ALL — PARALLEL
    // =========================

    const fetchAllData = async (parsedUser) => {
        const config = {
            headers: { Authorization: `Bearer ${parsedUser.token}` }
        };

        try {
            const [dashRes, statsRes, trackRes] = await Promise.all([
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/dashboard`, config),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/attempts/stats`, config),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/preparation-track/me`, config)
            ]);

            setStats(dashRes.data);
            setDailyProgress(statsRes.data.totalSolvedToday || 0);
            setGsTrack(trackRes.data.gsTrack);
            setCsatTrack(trackRes.data.csatTrack);

            await fetchModeData(config);
        } catch (err) {
            console.error("Dashboard Fetch Error:", err);
            if (err.response?.status === 401) {
                localStorage.removeItem("userInfo");
                window.location.href = "/login";
            }
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // FETCH MODE-SPECIFIC
    // =========================

    const fetchModeData = async (config) => {
        try {
            const [completionRes, weakRes, recRes] = await Promise.all([
                axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/analytics/completion-breakdown?mode=${selectedMode}`,
                    config
                ).catch(() => ({ data: null })),
                axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/analytics/weak-area-intelligence?mode=${selectedMode}`,
                    config
                ).catch(() => ({ data: null })),
                axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/analytics/smart-recommendations?mode=${selectedMode}`,
                    config
                ).catch(() => ({ data: null }))
            ]);

            setCompletionData(completionRes.data);
            setWeakAreaData(weakRes.data);
            setRecommendationData(recRes.data);
        } catch (err) {
            console.error("Mode Data Error:", err);
        }
    };

    // =========================
    // UPDATE TARGET DATE
    // =========================

    const handleUpdateDate = async () => {
        if (!newDate) return;
        setUpdating(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
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

    // =========================
    // LOADING STATE
    // =========================

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-brand-light flex">

                {user && <Sidebar isAdmin={user.isAdmin} />}

                <div className="flex-1 flex flex-col min-h-screen min-w-0">

                    {user && (
                        <TopHeader
                            user={user}
                            readinessScore={0}
                            onMenuClick={() => {}}
                        />
                    )}

                    <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-[1600px] w-full mx-auto">
                        <DashboardSkeleton />
                    </main>

                </div>

            </div>
        );
    }

    const progressPercentage = Math.min(
        (dailyProgress / user.dailyMcqTarget) * 100,
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

            {/* SIDEBAR */}
            <Sidebar isAdmin={user.isAdmin} />

            {/* MOBILE NAV */}
            <MobileNav
                isOpen={mobileNavOpen}
                onClose={() => setMobileNavOpen(false)}
            />

            {/* MAIN */}
            <div className="flex-1 flex flex-col min-h-screen min-w-0">

                <TopHeader
                    user={user}
                    readinessScore={stats?.readinessScore || 0}
                    onMenuClick={() => setMobileNavOpen(true)}
                />

                <main className="flex-1 p-3 sm:p-6 lg:p-10 max-w-[1600px] w-full mx-auto">

                    {/* ANNOUNCEMENTS BANNER */}
                    <AnnouncementBanner />

                    {/* HERO */}
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
                                Let's make today count. Every question solved is one step closer.
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

                    {/* KPI GRID */}
                    <div data-tour="kpi-cards" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                        <KpiCard
                            icon={Zap}
                            label="Today's Progress"
                            value={`${dailyProgress}/${user.dailyMcqTarget}`}
                            color="from-blue-500 to-cyan-500"
                            sub={`${Math.round(progressPercentage)}% complete`}
                        />
                        <KpiCard
                            icon={Flame}
                            label="Current Streak"
                            value={user.streak || 0}
                            color="from-orange-500 to-red-500"
                            sub="days in a row"
                        />
                        <KpiCard
                            icon={Award}
                            label="Readiness Score"
                            value={`${stats?.readinessScore || 0}%`}
                            color="from-purple-500 to-pink-500"
                            sub="UPSC preparedness"
                        />
                        <KpiCard
                            icon={Target}
                            label="Total Solved"
                            value={stats?.totalSolvedYear || 0}
                            color="from-green-500 to-emerald-500"
                            sub="all-time questions"
                        />
                    </div>

                    {/* MAIN GRID */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">

                        {/* LEFT — 8 cols */}
                        <div className="lg:col-span-8 space-y-4 sm:space-y-6">

                            {/* DAILY MISSION */}
                            <motion.div
                                data-tour="daily-mission"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gradient-to-br from-brand-dark to-gray-900 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/10 rounded-full blur-3xl -translate-y-32 translate-x-32" />

                                <div className="relative z-10">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5 sm:mb-6">
                                        <div>
                                            <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-brand-accent mb-2">
                                                Today's Mission
                                            </p>
                                            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight">
                                                {dailyProgress >= user.dailyMcqTarget
                                                    ? "Target Crushed! 🎯"
                                                    : `${user.dailyMcqTarget - dailyProgress} questions to go`}
                                            </h2>
                                            <p className="text-white/60 text-xs sm:text-sm font-medium mt-2">
                                                {dailyProgress} of {user.dailyMcqTarget} completed today
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-4xl sm:text-5xl font-black leading-none">
                                                {Math.round(progressPercentage)}%
                                            </p>
                                            <p className="text-[10px] sm:text-xs text-white/60 font-bold uppercase tracking-widest mt-1">
                                                progress
                                            </p>
                                        </div>
                                    </div>

                                    <div className="w-full bg-white/10 h-2.5 sm:h-3 rounded-full overflow-hidden mb-5 sm:mb-6">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progressPercentage}%` }}
                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                            className="h-full bg-gradient-to-r from-brand-accent to-purple-400 rounded-full"
                                        />
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <Link
                                            href={gsTrack ? "/practice?mode=GS" : "/practice/setup?mode=GS"}
                                            className="flex-1 bg-white text-brand-dark py-3 sm:py-3.5 rounded-2xl font-black text-xs sm:text-sm text-center hover:bg-brand-accent hover:text-white transition-all flex items-center justify-center gap-2"
                                        >
                                            {gsTrack ? "Continue GS" : "Start GS"}
                                            <ArrowUpRight size={14} />
                                        </Link>
                                        <Link
                                            href={csatTrack ? "/practice?mode=CSAT" : "/practice/setup?mode=CSAT"}
                                            className="flex-1 bg-white/10 border border-white/20 text-white py-3 sm:py-3.5 rounded-2xl font-black text-xs sm:text-sm text-center hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                                        >
                                            {csatTrack ? "Continue CSAT" : "Start CSAT"}
                                            <ArrowUpRight size={14} />
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>

                            {/* SUBJECT COMPLETION */}
                            {completionData && (
                                <motion.div
                                    data-tour="subject-completion"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-brand-border"
                                >
                                    <div className="flex items-center justify-between mb-5 sm:mb-6 flex-wrap gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-brand-accent/10 p-2 sm:p-2.5 rounded-xl">
                                                <BarChart3 className="text-brand-accent" size={18} />
                                            </div>
                                            <h2 className="text-base sm:text-lg lg:text-xl font-black text-brand-dark">
                                                Subject Completion
                                            </h2>
                                        </div>

                                        <div className="flex gap-1 bg-brand-light rounded-xl p-1">
                                            {["GS", "CSAT"].map((mode) => (
                                                <button
                                                    key={mode}
                                                    onClick={() => setSelectedMode(mode)}
                                                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-black text-[10px] sm:text-xs transition-all ${
                                                        selectedMode === mode
                                                            ? "bg-brand-dark text-white"
                                                            : "text-brand-muted hover:text-brand-dark"
                                                    }`}
                                                >
                                                    {mode}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {completionData.subjects.length > 0 ? (
                                        <div className="space-y-3 sm:space-y-4">
                                            {completionData.subjects.slice(0, 5).map((subject) => (
                                                <div key={subject.name}>
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="font-bold text-xs sm:text-sm text-brand-dark truncate pr-2">
                                                            {subject.name}
                                                        </span>
                                                        <span className="font-black text-xs sm:text-sm text-brand-dark shrink-0">
                                                            {subject.solved}/{subject.total}
                                                            <span className="ml-2 text-brand-accent">
                                                                ({subject.percentage}%)
                                                            </span>
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-brand-light h-2 sm:h-2.5 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${subject.percentage}%` }}
                                                            transition={{ duration: 0.6, ease: "easeOut" }}
                                                            className={`h-full rounded-full ${
                                                                subject.percentage >= 70
                                                                    ? "bg-gradient-to-r from-green-400 to-green-600"
                                                                    : subject.percentage >= 40
                                                                    ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                                                                    : "bg-gradient-to-r from-red-400 to-red-600"
                                                            }`}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-brand-muted text-center py-8 text-xs sm:text-sm font-medium">
                                            Start a preparation track to see progress.
                                        </p>
                                    )}
                                </motion.div>
                            )}

                            {/* WEAK AREAS */}
                            {weakAreaData && (
                                <motion.div
                                    data-tour="weak-areas"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-brand-border"
                                >
                                    <div className="flex items-center gap-3 mb-5 sm:mb-6">
                                        <div className="bg-red-500/10 p-2 sm:p-2.5 rounded-xl">
                                            <Brain className="text-red-500" size={18} />
                                        </div>
                                        <h2 className="text-base sm:text-lg lg:text-xl font-black text-brand-dark">
                                            Weak Area Intelligence
                                        </h2>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                        {weakAreaData.weakestSubject && (
                                            <WeakCard
                                                label="Weakest Subject"
                                                name={weakAreaData.weakestSubject.name}
                                                value={`${weakAreaData.weakestSubject.accuracy}%`}
                                                sub={`${weakAreaData.weakestSubject.total} attempted`}
                                                color="red"
                                            />
                                        )}
                                        {weakAreaData.weakestTopic && (
                                            <WeakCard
                                                label="Weakest Topic"
                                                name={weakAreaData.weakestTopic.name}
                                                value={`${weakAreaData.weakestTopic.accuracy}%`}
                                                sub={`${weakAreaData.weakestTopic.total} attempted`}
                                                color="orange"
                                            />
                                        )}
                                        {weakAreaData.mostCommonMistake && (
                                            <WeakCard
                                                label="Common Mistake"
                                                name={weakAreaData.mostCommonMistake.name}
                                                value={`${weakAreaData.mostCommonMistake.count}x`}
                                                sub="frequent pattern"
                                                color="purple"
                                            />
                                        )}
                                        {weakAreaData.slowestSubject && (
                                            <WeakCard
                                                label="Slowest Subject"
                                                name={weakAreaData.slowestSubject.name}
                                                value={`${Math.round(weakAreaData.slowestSubject.avgTime / 60)}m`}
                                                sub="avg per question"
                                                color="blue"
                                            />
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {/* RECOMMENDATIONS */}
                            {recommendationData?.recommendations?.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-brand-border"
                                >
                                    <div className="flex items-center gap-3 mb-5 sm:mb-6">
                                        <div className="bg-green-500/10 p-2 sm:p-2.5 rounded-xl">
                                            <Sparkles className="text-green-500" size={18} />
                                        </div>
                                        <h2 className="text-base sm:text-lg lg:text-xl font-black text-brand-dark">
                                            Smart Recommendations
                                        </h2>
                                    </div>

                                    <div className="space-y-3">
                                        {recommendationData.recommendations.map((rec, index) => (
                                            <Link
                                                key={index}
                                                href={rec.actionUrl}
                                                className={`block rounded-2xl p-4 sm:p-5 border transition-all hover:shadow-md ${
                                                    rec.priority === "high"
                                                        ? "bg-red-50 border-red-100 hover:border-red-300"
                                                        : "bg-blue-50 border-blue-100 hover:border-blue-300"
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`p-2 rounded-xl shrink-0 ${
                                                        rec.priority === "high" ? "bg-red-500" : "bg-blue-500"
                                                    }`}>
                                                        {rec.type === "revision" && <BookOpen className="text-white" size={14} />}
                                                        {rec.type === "progress" && <TrendingUp className="text-white" size={14} />}
                                                        {rec.type === "focus" && <Target className="text-white" size={14} />}
                                                        {rec.type === "speed" && <Clock className="text-white" size={14} />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-black text-brand-dark text-xs sm:text-sm">{rec.title}</p>
                                                        <p className="text-[11px] sm:text-xs text-brand-muted font-medium mt-1 leading-relaxed">
                                                            {rec.description}
                                                        </p>
                                                        <p className="text-[11px] sm:text-xs font-black text-brand-accent mt-2 flex items-center gap-1">
                                                            {rec.action} <ArrowUpRight size={11} />
                                                        </p>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                        </div>

                        {/* RIGHT — 4 cols */}
                        <div className="lg:col-span-4 space-y-4 sm:space-y-6">

                            {/* TARGET CARD */}
                            <motion.div
                                data-tour="exam-target"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white border border-brand-border rounded-2xl sm:rounded-3xl p-5 sm:p-6 relative overflow-hidden"
                            >
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-accent/5 rounded-full" />

                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Calendar size={14} className="text-brand-accent" />
                                        <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-brand-muted">
                                            Exam Target
                                        </p>
                                    </div>

                                    <p className="text-3xl sm:text-4xl font-black text-brand-dark leading-none mb-1">
                                        {user.dailyMcqTarget}
                                    </p>
                                    <p className="text-[11px] sm:text-xs font-bold text-brand-muted mb-4">
                                        questions/day to finish on time
                                    </p>

                                    <div className="border-t border-brand-border pt-4">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
                                            Target Date
                                        </p>
                                        <p className="font-black text-brand-dark mt-1 text-sm">
                                            {user.targetCompletionDate
                                                ? new Date(user.targetCompletionDate).toLocaleDateString("en-IN", {
                                                      day: "numeric",
                                                      month: "long",
                                                      year: "numeric"
                                                  })
                                                : "Not Set"}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>

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
                                        href="/mains"
                                        icon={GraduationCap}
                                        label="Mains"
                                        color="bg-purple-50 text-purple-600"
                                    />
                                    <QuickAccessTile
                                        href="/library"
                                        icon={Library}
                                        label="Library"
                                        color="bg-blue-50 text-blue-600"
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
                                    <QuickAccessTile
                                        href="/books"
                                        icon={BookOpen}
                                        label="Books"
                                        color="bg-pink-50 text-pink-600"
                                    />
                                    <QuickAccessTile
                                        href="/rankings"
                                        icon={Trophy}
                                        label="Rankings"
                                        color="bg-orange-50 text-orange-600"
                                    />
                                </div>
                            </motion.div>

                            {/* STORAGE WIDGET */}
                            <div data-tour="storage">
                                <StorageWidget />
                            </div>

                            {/* RECENTLY VIEWED */}
                            <RecentlyViewedWidget />

                            {/* LEADERBOARD */}
                            <div data-tour="leaderboard">
                                <LeaderboardWidget />
                            </div>

                            {/* STREAK CARD */}
                            {stats?.streakData && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-6"
                                >
                                    <div className="flex items-center gap-2 mb-4">
                                        <Flame size={16} className="fill-white" />
                                        <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-white/80">
                                            Streak Stats
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs sm:text-sm font-bold opacity-80">Current</span>
                                            <span className="text-xl sm:text-2xl font-black">{stats.streakData.currentStreak}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs sm:text-sm font-bold opacity-80">Longest</span>
                                            <span className="text-xl sm:text-2xl font-black">{stats.streakData.longestStreak}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs sm:text-sm font-bold opacity-80">Consistent Days</span>
                                            <span className="text-xl sm:text-2xl font-black">{stats.streakData.consistencyDays}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                        </div>

                    </div>

                </main>

                <Footer />

            </div>

            {/* SETTINGS MODAL */}
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
                                Updating your target date will automatically recalculate your required daily MCQ count.
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

            {/* ONBOARDING TOUR */}
            <OnboardingTour />

        </div>
    );
}

// =========================
// KPI CARD
// =========================

function KpiCard({ icon: Icon, label, value, sub, color }) {
    return (
        <motion.div
            whileHover={{ y: -2 }}
            className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-brand-border"
        >
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 sm:mb-4`}>
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

// =========================
// WEAK CARD
// =========================

function WeakCard({ label, name, value, sub, color }) {
    const colorMap = {
        red: "bg-red-50 border-red-100 text-red-600",
        orange: "bg-orange-50 border-orange-100 text-orange-600",
        purple: "bg-purple-50 border-purple-100 text-purple-600",
        blue: "bg-blue-50 border-blue-100 text-blue-600"
    };

    return (
        <div className={`rounded-2xl p-3 sm:p-4 border ${colorMap[color]}`}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-1">
                {label}
            </p>
            <p className="text-sm sm:text-base font-black text-brand-dark truncate">
                {name}
            </p>
            <p className={`text-xl sm:text-2xl font-black mt-1 ${colorMap[color].split(" ")[2]}`}>
                {value}
            </p>
            <p className="text-[10px] text-brand-muted font-medium mt-1">
                {sub}
            </p>
        </div>
    );
}

// =========================
// QUICK ACCESS TILE
// =========================

function QuickAccessTile({ href, icon: Icon, label, color }) {
    return (
        <Link
            href={href}
            className="flex flex-col items-start gap-2 p-3 rounded-xl sm:rounded-2xl hover:bg-brand-light transition-all border border-transparent hover:border-brand-border"
        >
            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={14} />
            </div>
            <span className="text-[11px] sm:text-xs font-black text-brand-dark">
                {label}
            </span>
        </Link>
    );
}