"use client";

import { useState, useEffect } from "react";

import { motion } from "framer-motion";

import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip
} from "recharts";

import {
    TrendingUp,
    AlertCircle,
    Calendar,
    Target,
    Award,
    GraduationCap,
    Brain,
    Zap,
    Sparkles,
    Clock,
    CheckCircle2,
    XCircle,
    BarChart3,
    Flame,
    ArrowUpRight
} from "lucide-react";

import axios from "axios";

import Link from "next/link";

import Sidebar from "@/components/layout/Sidebar";

import TopHeader from "@/components/layout/TopHeader";

import Footer from "@/components/layout/Footer";

import MobileNav from "@/components/layout/MobileNav";

import PageHeader from "@/components/ui/PageHeader";

const COLORS = ["#6366F1", "#22C55E", "#F59E0B", "#EF4444", "#A855F7", "#EC4899", "#14B8A6"];

export default function AnalyticsPage() {

    const [data, setData] = useState(null);

    const [mainsData, setMainsData] = useState(null);

    const [loading, setLoading] = useState(true);

    const [user, setUser] = useState(null);

    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    useEffect(() => {

        const info = localStorage.getItem("userInfo");

        if (!info) {
            window.location.href = "/login";
            return;
        }

        const parsed = JSON.parse(info);

        setUser(parsed);

        fetchAllData(parsed);

    }, []);

    const fetchAllData = async (parsedUser) => {

        try {

            const config = {
                headers: { Authorization: `Bearer ${parsedUser.token}` }
            };

            const [prelimsRes, mainsRes] = await Promise.all([

                axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/analytics/dashboard`,
                    config
                ).catch(() => ({ data: null })),

                axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/mains/analytics/dashboard`,
                    config
                ).catch(() => ({ data: null }))
            ]);

            setData(prelimsRes.data);

            setMainsData(mainsRes.data);

        } catch (err) {

            console.error("Analytics fetch failed", err);

        } finally {

            setLoading(false);
        }
    };

    // =========================
    // HEATMAP GRID
    // =========================

    const generateGrid = () => {

        const weeks = [];

        const today = new Date();

        const startDate = new Date(today);

        startDate.setDate(today.getDate() - (51 * 7) - today.getDay());

        for (let w = 0; w < 52; w++) {

            const days = [];

            for (let d = 0; d < 7; d++) {

                const currentDate = new Date(startDate);

                currentDate.setDate(startDate.getDate() + (w * 7) + d);

                const dateStr = currentDate.toISOString().split("T")[0];

                const record = data?.heatmapData?.find(h => h._id === dateStr);

                const count = record ? record.count : 0;

                const isFuture = currentDate > today;

                days.push({
                    count: isFuture ? -1 : count,
                    date: dateStr,
                    dayName: currentDate.toLocaleDateString("en-IN", { weekday: "short" }),
                    fullDate: currentDate.toLocaleDateString("en-IN", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                    }),
                    isFuture
                });
            }

            weeks.push(days);
        }

        return weeks;
    };

    const getMonthLabels = () => {

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        const labels = [];

        const today = new Date();

        for (let i = 11; i >= 0; i--) {

            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);

            labels.push(months[d.getMonth()]);
        }

        return labels;
    };

    if (loading || !user) {

        return (

            <div className="min-h-screen bg-brand-light flex items-center justify-center">

                <div className="text-center">

                    <div className="w-12 h-12 border-4 border-brand-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />

                    <p className="text-sm font-black text-brand-muted uppercase tracking-widest">

                        Crunching your data...

                    </p>

                </div>

            </div>
        );
    }

    const grid = generateGrid();

    const monthLabels = getMonthLabels();

    // Computed stats

    const totalActiveDays = grid.flat().filter(d => d.count > 0).length;

    const totalSolved = data?.totalSolvedYear || 0;

    const totalMainsDone = mainsData?.completed || 0;

    const combined = totalSolved + totalMainsDone;

    const accuracy = totalSolved > 0
        ? Math.round(
            ((data?.subjectAccuracy?.reduce((s, a) => s + a.accuracy, 0) || 0) /
            Math.max(data?.subjectAccuracy?.length || 1, 1))
        )
        : 0;

    const longestStreak = (() => {

        let longest = 0;
        let current = 0;

        grid.flat().forEach(day => {
            if (day.count > 0) {
                current++;
                longest = Math.max(longest, current);
            } else {
                current = 0;
            }
        });

        return longest;
    })();

    // Weekly trend (last 8 weeks)

    const weeklyTrend = (() => {

        const weeks = [];

        const today = new Date();

        for (let i = 7; i >= 0; i--) {

            const weekStart = new Date(today);

            weekStart.setDate(today.getDate() - (i * 7));

            const weekLabel = weekStart.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

            const weekData = data?.streakData?.weeklyDensity?.find(w => {

                const wStart = new Date(w.weekStart);

                return Math.abs(wStart - weekStart) < 7 * 24 * 60 * 60 * 1000;
            });

            weeks.push({
                week: weekLabel,
                count: weekData?.count || 0
            });
        }

        return weeks;
    })();

    return (

        <div className="min-h-screen bg-brand-light flex">

            <Sidebar isAdmin={user.isAdmin} />

            <MobileNav
                isOpen={mobileNavOpen}
                onClose={() => setMobileNavOpen(false)}
            />

            <div className="flex-1 flex flex-col min-h-screen min-w-0">

                <TopHeader
                    user={user}
                    onMenuClick={() => setMobileNavOpen(true)}
                />

                <main className="flex-1 p-3 sm:p-6 lg:p-10 max-w-[1600px] w-full mx-auto">

                    {/* ============== HEADER ============== */}

                    <PageHeader
                        icon={BarChart3}
                        iconBg="bg-brand-accent/10"
                        iconColor="text-brand-accent"
                        title="Your Analytics"
                        description="Everything about your preparation, in numbers"
                    />

                    {/* ============== OVERVIEW STATS ============== */}

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">

                        <OverviewCard
                            icon={CheckCircle2}
                            label="Questions Solved"
                            value={combined}
                            sub={`${totalSolved} Prelims · ${totalMainsDone} Mains`}
                            gradient="from-green-500 to-emerald-600"
                        />

                        <OverviewCard
                            icon={Target}
                            label="Avg. Accuracy"
                            value={`${accuracy}%`}
                            sub="Across all subjects"
                            gradient="from-blue-500 to-cyan-600"
                        />

                        <OverviewCard
                            icon={Flame}
                            label="Best Streak"
                            value={`${longestStreak}d`}
                            sub={`${totalActiveDays} active days total`}
                            gradient="from-orange-500 to-red-600"
                        />

                        <OverviewCard
                            icon={Clock}
                            label="This Week"
                            value={weeklyTrend[weeklyTrend.length - 1]?.count || 0}
                            sub="questions this week"
                            gradient="from-purple-500 to-pink-600"
                        />

                    </div>

                    {/* ============== MAIN GRID ============== */}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">

                        {/* LEFT — 8 cols */}

                        <div className="lg:col-span-8 space-y-4 sm:space-y-6">

                            {/* SUBJECT MASTERY */}

                            <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-brand-border">

                                <div className="flex items-center justify-between mb-6">

                                    <div className="flex items-center gap-3">

                                        <div className="w-10 h-10 bg-brand-accent/10 rounded-xl flex items-center justify-center">
                                            <Target size={18} className="text-brand-accent" />
                                        </div>

                                        <h2 className="font-black text-base sm:text-lg text-brand-dark">
                                            Subject Performance
                                        </h2>

                                    </div>

                                    <Link
                                        href="/intelligence"
                                        className="text-[10px] font-black uppercase tracking-widest text-brand-accent hover:underline flex items-center gap-1"
                                    >
                                        Deep Dive <ArrowUpRight size={10} />
                                    </Link>

                                </div>

                                {data?.subjectAccuracy?.length > 0 ? (

                                    <div className="space-y-3">

                                        {data.subjectAccuracy
                                            .sort((a, b) => a.accuracy - b.accuracy)
                                            .map((subject, i) => (

                                            <div key={i}>

                                                <div className="flex items-center justify-between mb-1.5">

                                                    <span className="text-xs sm:text-sm font-bold text-brand-dark truncate pr-3">
                                                        {subject.name}
                                                    </span>

                                                    <span className={`text-xs font-black shrink-0 ${
                                                        subject.accuracy >= 70
                                                            ? "text-green-600"
                                                            : subject.accuracy >= 40
                                                            ? "text-yellow-600"
                                                            : "text-red-600"
                                                    }`}>
                                                        {subject.accuracy}%
                                                    </span>

                                                </div>

                                                <div className="w-full bg-brand-light h-2.5 rounded-full overflow-hidden">

                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${subject.accuracy}%` }}
                                                        transition={{ duration: 0.8, delay: i * 0.05 }}
                                                        className={`h-full rounded-full ${
                                                            subject.accuracy >= 70
                                                                ? "bg-gradient-to-r from-green-400 to-green-600"
                                                                : subject.accuracy >= 40
                                                                ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                                                                : "bg-gradient-to-r from-red-400 to-red-600"
                                                        }`}
                                                    />

                                                </div>

                                            </div>
                                        ))}

                                    </div>

                                ) : (

                                    <EmptyBox emoji="📊" text="Solve questions to see subject performance" />

                                )}

                            </div>

                            {/* WEEKLY ACTIVITY CHART */}

                            <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-brand-border">

                                <div className="flex items-center gap-3 mb-6">

                                    <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                                        <TrendingUp size={18} className="text-green-600" />
                                    </div>

                                    <h2 className="font-black text-base sm:text-lg text-brand-dark">
                                        Weekly Activity
                                    </h2>

                                </div>

                                {weeklyTrend.some(w => w.count > 0) ? (

                                    <div className="h-48 sm:h-56">

                                        <ResponsiveContainer width="100%" height="100%">

                                            <BarChart data={weeklyTrend}>

                                                <XAxis
                                                    dataKey="week"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fontSize: 10, fontWeight: 800, fill: "#737373" }}
                                                    dy={10}
                                                />

                                                <YAxis hide />

                                                <Tooltip
                                                    cursor={{ fill: "#FBFBFA" }}
                                                    contentStyle={{
                                                        borderRadius: "16px",
                                                        border: "none",
                                                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                                                        fontWeight: 800
                                                    }}
                                                    formatter={(value) => [`${value} questions`, "Solved"]}
                                                />

                                                <Bar
                                                    dataKey="count"
                                                    fill="#6366F1"
                                                    radius={[8, 8, 8, 8]}
                                                    barSize={35}
                                                />

                                            </BarChart>

                                        </ResponsiveContainer>

                                    </div>

                                ) : (

                                    <EmptyBox emoji="📈" text="Practice this week to see activity trends" />

                                )}

                            </div>

                            {/* CONSISTENCY ROADMAP */}

                            <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-brand-border">

                                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">

                                    <div className="flex items-center gap-3">

                                        <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                                            <Calendar size={18} className="text-blue-600" />
                                        </div>

                                        <div>
                                            <h2 className="font-black text-base sm:text-lg text-brand-dark">365-Day Activity</h2>
                                            <p className="text-[10px] text-brand-muted font-medium">Hover any cell for details</p>
                                        </div>

                                    </div>

                                    <div className="flex gap-2 items-center bg-brand-light p-2 rounded-xl border border-brand-border text-[10px] font-black text-brand-muted">
                                        <span>Less</span>
                                        <div className="flex gap-1">
                                            <div className="w-3 h-3 bg-brand-light rounded-[2px] border border-black/5" />
                                            <div className="w-3 h-3 bg-brand-accent/30 rounded-[2px]" />
                                            <div className="w-3 h-3 bg-brand-accent/70 rounded-[2px]" />
                                            <div className="w-3 h-3 bg-brand-accent rounded-[2px]" />
                                        </div>
                                        <span>More</span>
                                    </div>

                                </div>

                                <div className="overflow-x-auto pb-2">

                                    <div className="min-w-[850px]">

                                        <div className="flex text-[10px] font-bold text-brand-muted mb-3 ml-10">
                                            {monthLabels.map((m, i) => (
                                                <div key={i} className="flex-1">{m}</div>
                                            ))}
                                        </div>

                                        <div className="flex gap-4">

                                            <div className="flex flex-col justify-between text-[10px] font-black text-brand-muted/40 py-1 uppercase h-[130px]">
                                                <span>Mon</span>
                                                <span>Wed</span>
                                                <span>Fri</span>
                                            </div>

                                            <div className="flex flex-1 gap-1.5">

                                                {grid.map((week, wIdx) => (

                                                    <div key={wIdx} className="flex flex-col gap-1.5">

                                                        {week.map((day, dIdx) => (

                                                            <motion.div
                                                                key={dIdx}
                                                                whileHover={day.isFuture ? {} : { scale: 1.5, zIndex: 10 }}
                                                                title={day.isFuture ? "Future" : `${day.fullDate}\n${day.count} questions solved`}
                                                                className={`w-3.5 h-3.5 rounded-[3px] border transition-colors duration-500 ${
                                                                    day.isFuture
                                                                        ? "bg-transparent border-dashed border-brand-border/50"
                                                                        : day.count > 20
                                                                        ? "bg-brand-accent border-brand-accent/50 cursor-pointer"
                                                                        : day.count > 10
                                                                        ? "bg-brand-accent/70 border-brand-accent/30 cursor-pointer"
                                                                        : day.count > 0
                                                                        ? "bg-brand-accent/30 border-brand-accent/20 cursor-pointer"
                                                                        : "bg-brand-light border-black/5 cursor-pointer"
                                                                }`}
                                                            />

                                                        ))}

                                                    </div>
                                                ))}

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                        {/* RIGHT — 4 cols */}

                        <div className="lg:col-span-4 space-y-4 sm:space-y-6">

                            {/* MISTAKE PATTERNS */}

                            <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-brand-border">

                                <div className="flex items-center gap-3 mb-6">

                                    <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
                                        <XCircle size={18} className="text-red-500" />
                                    </div>

                                    <h2 className="font-black text-sm sm:text-base text-brand-dark">
                                        Mistake Patterns
                                    </h2>

                                </div>

                                {data?.mistakeStats?.length > 0 ? (

                                    <>
                                        <div className="h-44">

                                            <ResponsiveContainer width="100%" height="100%">

                                                <PieChart>
                                                    <Pie
                                                        data={data.mistakeStats}
                                                        innerRadius={50}
                                                        outerRadius={75}
                                                        paddingAngle={4}
                                                        dataKey="value"
                                                        stroke="none"
                                                    >
                                                        {data.mistakeStats.map((entry, index) => (
                                                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                </PieChart>

                                            </ResponsiveContainer>

                                        </div>

                                        <div className="space-y-2 mt-2">

                                            {data.mistakeStats.slice(0, 4).map((stat, i) => (

                                                <div key={i} className="flex items-center justify-between">

                                                    <div className="flex items-center gap-2">

                                                        <div
                                                            className="w-2.5 h-2.5 rounded-full shrink-0"
                                                            style={{ backgroundColor: COLORS[i] }}
                                                        />

                                                        <span className="text-xs font-bold text-brand-dark truncate">
                                                            {stat.name}
                                                        </span>

                                                    </div>

                                                    <span className="text-xs font-black text-brand-muted shrink-0 ml-2">
                                                        {stat.value}
                                                    </span>

                                                </div>
                                            ))}

                                        </div>
                                    </>

                                ) : (

                                    <EmptyBox emoji="🎯" text="Practice more to see mistake patterns" small />
                                )}

                            </div>

                            {/* WEAK AREAS */}

                            <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-brand-border">

                                <div className="flex items-center gap-3 mb-6">

                                    <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
                                        <AlertCircle size={18} className="text-orange-600" />
                                    </div>

                                    <h2 className="font-black text-sm sm:text-base text-brand-dark">
                                        Focus Areas
                                    </h2>

                                </div>

                                {data?.weakTopics?.length > 0 ? (

                                    <div className="space-y-3">

                                        {data.weakTopics.slice(0, 4).map((topic, i) => (

                                            <div key={i} className="bg-brand-light rounded-xl p-3 border border-brand-border">

                                                <div className="flex items-center justify-between mb-2">

                                                    <span className="text-xs font-black text-brand-dark truncate pr-2">
                                                        {topic.name}
                                                    </span>

                                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                                                        topic.accuracy >= 70
                                                            ? "bg-green-100 text-green-700"
                                                            : topic.accuracy >= 40
                                                            ? "bg-yellow-100 text-yellow-700"
                                                            : "bg-red-100 text-red-700"
                                                    }`}>
                                                        {topic.accuracy}%
                                                    </span>

                                                </div>

                                                <div className="w-full bg-white rounded-full h-1.5 overflow-hidden">

                                                    <div
                                                        className={`h-full rounded-full ${
                                                            topic.accuracy >= 70 ? "bg-green-500" :
                                                            topic.accuracy >= 40 ? "bg-yellow-500" :
                                                            "bg-red-500"
                                                        }`}
                                                        style={{ width: `${topic.accuracy}%` }}
                                                    />

                                                </div>

                                                <p className="text-[10px] font-bold text-brand-muted mt-1.5">
                                                    ⏱ {topic.avgTime}s avg
                                                </p>

                                            </div>
                                        ))}

                                    </div>

                                ) : (

                                    <EmptyBox emoji="🧠" text="Solve more to identify weak areas" small />
                                )}

                            </div>

                            {/* RECOMMENDATIONS */}

                            <div className="bg-gradient-to-br from-brand-dark to-gray-900 text-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl relative overflow-hidden">

                                <div className="absolute top-0 right-0 w-48 h-48 bg-brand-accent/10 rounded-full blur-3xl -translate-y-24 translate-x-24" />

                                <div className="relative z-10">

                                    <div className="flex items-center gap-3 mb-5">

                                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                            <Sparkles size={18} className="text-brand-accent" />
                                        </div>

                                        <h2 className="font-black text-sm sm:text-base">
                                            Insights
                                        </h2>

                                    </div>

                                    {data?.recommendations?.length > 0 ? (

                                        <div className="space-y-2.5">

                                            {data.recommendations.slice(0, 3).map((rec, i) => (

                                                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3">

                                                    <p className="text-xs font-bold text-white/80 leading-relaxed">
                                                        {rec}
                                                    </p>

                                                </div>
                                            ))}

                                        </div>

                                    ) : (

                                        <div className="py-6 text-center">

                                            <p className="text-white/30 font-bold text-xs">
                                                ✨ Practice more for personalized insights
                                            </p>

                                        </div>
                                    )}

                                </div>

                            </div>

                        </div>

                    </div>

                </main>

                <Footer />

            </div>

        </div>
    );
}

// =========================
// OVERVIEW CARD
// =========================

function OverviewCard({ icon: Icon, label, value, sub, gradient }) {

    return (

        <motion.div
            whileHover={{ y: -3 }}
            className="relative bg-white rounded-2xl p-4 sm:p-5 border border-brand-border overflow-hidden group"
        >

            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${gradient}`} />

            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <Icon size={18} className="text-white" />
            </div>

            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-brand-muted mb-1">
                {label}
            </p>

            <p className="text-2xl sm:text-3xl font-black text-brand-dark leading-none mb-1">
                {value}
            </p>

            <p className="text-[10px] sm:text-xs text-brand-muted font-medium truncate">
                {sub}
            </p>

        </motion.div>
    );
}

// =========================
// EMPTY STATE
// =========================

function EmptyBox({ emoji, text, small }) {

    return (

        <div className={`flex flex-col items-center justify-center text-center ${small ? "py-8" : "py-12"}`}>

            <div className={`${small ? "text-3xl" : "text-4xl"} mb-3 opacity-30`}>
                {emoji}
            </div>

            <p className="text-brand-muted font-bold text-xs max-w-xs">
                {text}
            </p>

        </div>
    );
}