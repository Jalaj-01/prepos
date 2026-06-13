"use client";

import { useState, useEffect } from "react";

import { motion, AnimatePresence } from "framer-motion";

import axios from "axios";

import {
    Brain,
    TrendingUp,
    Flame,
    Calendar,
    Layers,
    BarChart3,
    Search,
    ArrowUpDown,
    ChevronRight,
    Loader2,
    Table2
} from "lucide-react";

import Sidebar from "@/components/layout/Sidebar";

import TopHeader from "@/components/layout/TopHeader";

import Footer from "@/components/layout/Footer";

import MobileNav from "@/components/layout/MobileNav";

import PageHeader from "@/components/ui/PageHeader";

import EmptyState from "@/components/ui/EmptyState";

// =========================
// TABS
// =========================

const TABS = [

    // { id: "trends", label: "Subject Trends", icon: BarChart3 },

    { id: "repeated", label: "Repeated Themes", icon: Flame },

    { id: "marks", label: "Year-wise Table", icon: Table2 }
];

// =========================
// HEATMAP COLORS
// =========================

const getHeatColor = (count, max) => {

    if (count === 0) return "bg-brand-light text-brand-muted";

    const ratio = count / max;

    if (ratio > 0.7) return "bg-brand-accent text-white font-black";

    if (ratio > 0.4) return "bg-brand-accent/60 text-white font-black";

    if (ratio > 0.2) return "bg-brand-accent/30 text-brand-dark font-bold";

    return "bg-brand-accent/10 text-brand-dark font-medium";
};

export default function IntelligencePage() {

    const [user, setUser] = useState(null);

   const [activeTab, setActiveTab] = useState("repeated");

    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    // Data

    const [trends, setTrends] = useState([]);

    const [themes, setThemes] = useState([]);

    const [trendsLoading, setTrendsLoading] = useState(true);

    const [themesLoading, setThemesLoading] = useState(true);

    const [search, setSearch] = useState("");

    useEffect(() => {

        const info = localStorage.getItem("userInfo");

        if (!info) {
            window.location.href = "/login";
            return;
        }

        const parsed = JSON.parse(info);

        setUser(parsed);

        fetchAll(parsed.token);

    }, []);

    const fetchAll = async (token) => {

        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        await Promise.all([

            fetchTrends(config),

            fetchThemes(config)
        ]);
    };

    const fetchTrends = async (config) => {

        setTrendsLoading(true);

        try {

            const { data } = await axios.get(

                `${process.env.NEXT_PUBLIC_API_URL}/api/intelligence/trends`,

                config
            );

            setTrends(data);

        } catch (err) {

            console.error("Trends error", err);

        } finally {

            setTrendsLoading(false);
        }
    };

    const fetchThemes = async (config) => {

        setThemesLoading(true);

        try {

            const { data } = await axios.get(

                `${process.env.NEXT_PUBLIC_API_URL}/api/intelligence/repeated-themes`,

                config
            );

            setThemes(data);

        } catch (err) {

            console.error("Themes error", err);

        } finally {

            setThemesLoading(false);
        }
    };

    // =========================
    // PROCESS TRENDS INTO TABLE
    // =========================

    const processedTable = (() => {

        if (!trends.length) return { subjects: [], years: [], data: {} };

        const subjectSet = new Set();

        const yearSet = new Set();

        const dataMap = {};

        trends.forEach(item => {

            const subject = item.subject || "General";

            const year = item.year;

            subjectSet.add(subject);

            yearSet.add(year);

            if (!dataMap[subject]) dataMap[subject] = {};

            dataMap[subject][year] = item.count;
        });

        const subjects = Array.from(subjectSet).sort();

        const years = Array.from(yearSet).sort((a, b) => b - a);

        // Calculate totals

        subjects.forEach(s => {

            dataMap[s] = dataMap[s] || {};

            dataMap[s]._total = years.reduce((sum, y) => sum + (dataMap[s][y] || 0), 0);
        });

        // Calculate max for heatmap coloring

        let maxCount = 0;

        subjects.forEach(s => {

            years.forEach(y => {

                const count = dataMap[s]?.[y] || 0;

                if (count > maxCount) maxCount = count;
            });
        });

        return { subjects, years, data: dataMap, maxCount };

    })();

    // Filter themes

    const filteredThemes =
        search
            ? themes.filter(t =>
                t.sampleQuestion?.toLowerCase().includes(search.toLowerCase()) ||
                t.topics?.some(topic => topic?.toLowerCase().includes(search.toLowerCase())) ||
                t.subjects?.some(s => s?.toLowerCase().includes(search.toLowerCase()))
            )
            : themes;

    if (!user) return null;

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

                    {/* HEADER */}

                    <PageHeader
                        icon={Brain}
                        iconBg="bg-orange-500/10"
                        iconColor="text-orange-600"
                        title="PYQ Intelligence"
                        description="Patterns, trends, and insights from years of UPSC questions"
                    />

                    {/* TABS */}

                    <div className="bg-white rounded-2xl sm:rounded-3xl border border-brand-border p-3 sm:p-4 mb-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

                        <div className="flex gap-1 bg-brand-light rounded-xl p-1 overflow-x-auto">

                            {TABS.map(tab => {

                                const Icon = tab.icon;

                                const isActive = activeTab === tab.id;

                                return (

                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all whitespace-nowrap ${
                                            isActive
                                                ? "bg-brand-dark text-white"
                                                : "text-brand-muted hover:text-brand-dark"
                                        }`}
                                    >
                                        <Icon size={14} />
                                        <span className="hidden sm:inline">{tab.label}</span>
                                    </button>
                                );
                            })}

                        </div>

                    
                    </div>

                    {/* TAB CONTENT */}

                    <AnimatePresence mode="wait">

                        {/* ===== TRENDS TAB ===== */}

                        {activeTab === "trends" && (

                            <motion.div
                                key="trends"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >

                                {trendsLoading ? (

                                    <LoadingState text="Analyzing subject trends..." />

                                ) : processedTable.subjects.length === 0 ? (

                                    <EmptyState
                                        emoji="📊"
                                        title="No trend data yet"
                                        description="Upload more PYQs to see subject-wise trends across years"
                                    />

                                ) : (

                                    <div className="bg-white rounded-2xl sm:rounded-3xl border border-brand-border overflow-hidden">

                                        <div className="p-4 sm:p-6 border-b border-brand-border">

                                            <h2 className="font-black text-base sm:text-lg text-brand-dark mb-1">

                                                Subject × Year Distribution

                                            </h2>

                                            <p className="text-xs text-brand-muted font-medium">

                                                How many questions came from each subject per year. Darker = more questions.

                                            </p>

                                        </div>

                                        <div className="overflow-x-auto">

                                            <table className="w-full text-sm">

                                                <thead>

                                                    <tr className="bg-brand-light">

                                                        <th className="text-left px-4 py-3 font-black text-[10px] uppercase tracking-widest text-brand-muted sticky left-0 bg-brand-light z-10 min-w-[150px]">

                                                            Subject

                                                        </th>

                                                        {processedTable.years.map(year => (

                                                            <th
                                                                key={year}
                                                                className="text-center px-3 py-3 font-black text-[10px] uppercase tracking-widest text-brand-muted min-w-[60px]"
                                                            >
                                                                {year}
                                                            </th>
                                                        ))}

                                                        <th className="text-center px-4 py-3 font-black text-[10px] uppercase tracking-widest text-brand-dark bg-brand-light min-w-[70px]">

                                                            Total

                                                        </th>

                                                    </tr>

                                                </thead>

                                                <tbody>

                                                    {processedTable.subjects
                                                        .sort((a, b) =>
                                                            (processedTable.data[b]?._total || 0) -
                                                            (processedTable.data[a]?._total || 0)
                                                        )
                                                        .map((subject, idx) => (

                                                        <tr
                                                            key={subject}
                                                            className={`border-t border-brand-border hover:bg-brand-light/50 transition-colors ${
                                                                idx % 2 === 0 ? "" : "bg-brand-light/20"
                                                            }`}
                                                        >

                                                            <td className="px-4 py-3 font-black text-brand-dark text-xs sticky left-0 bg-white z-10 border-r border-brand-border">

                                                                {subject}

                                                            </td>

                                                            {processedTable.years.map(year => {

                                                                const count =
                                                                    processedTable.data[subject]?.[year] || 0;

                                                                return (

                                                                    <td
                                                                        key={year}
                                                                        className="text-center px-2 py-2"
                                                                    >

                                                                        <div className={`mx-auto w-10 h-10 rounded-xl flex items-center justify-center text-xs transition-all ${
                                                                            getHeatColor(count, processedTable.maxCount)
                                                                        }`}>

                                                                            {count || "—"}

                                                                        </div>

                                                                    </td>
                                                                );
                                                            })}

                                                            <td className="text-center px-4 py-3 font-black text-brand-dark text-sm bg-brand-light/50">

                                                                {processedTable.data[subject]?._total || 0}

                                                            </td>

                                                        </tr>
                                                    ))}

                                                </tbody>

                                                {/* YEAR TOTALS */}

                                                <tfoot>

                                                    <tr className="bg-brand-dark text-white border-t-2 border-brand-dark">

                                                        <td className="px-4 py-3 font-black text-xs sticky left-0 bg-brand-dark z-10">

                                                            TOTAL

                                                        </td>

                                                        {processedTable.years.map(year => {

                                                            const yearTotal =
                                                                processedTable.subjects.reduce(
                                                                    (sum, s) => sum + (processedTable.data[s]?.[year] || 0),
                                                                    0
                                                                );

                                                            return (

                                                                <td key={year} className="text-center px-2 py-3 font-black text-sm">

                                                                    {yearTotal}

                                                                </td>
                                                            );
                                                        })}

                                                        <td className="text-center px-4 py-3 font-black text-base bg-brand-accent">

                                                            {processedTable.subjects.reduce(
                                                                (sum, s) => sum + (processedTable.data[s]?._total || 0),
                                                                0
                                                            )}

                                                        </td>

                                                    </tr>

                                                </tfoot>

                                            </table>

                                        </div>

                                        <div className="p-4 bg-brand-light/50 border-t border-brand-border">

                                            <p className="text-[10px] font-bold text-brand-muted text-center italic">

                                                💡 Darker cells indicate more questions. Focus on high-frequency subjects.

                                            </p>

                                        </div>

                                    </div>
                                )}

                            </motion.div>
                        )}

                        {/* ===== REPEATED THEMES TAB ===== */}

                        {activeTab === "repeated" && (

                            <motion.div
                                key="repeated"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >

                                {themesLoading ? (

                                    <LoadingState text="Analyzing patterns..." />

                                ) : filteredThemes.length === 0 ? (

                                    <EmptyState
                                        emoji="🔥"
                                        title={search ? "No matching themes" : "No repeated themes yet"}
                                        description={
                                            search
                                                ? "Try different search terms"
                                                : "The system hasn't detected repeated patterns yet. Add more PYQs."
                                        }
                                    />

                                ) : (

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                                        {filteredThemes.map((theme, idx) => (

                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="bg-white rounded-2xl sm:rounded-3xl border border-brand-border p-5 sm:p-6 hover:border-brand-accent transition-all"
                                            >

                                                {/* Top */}

                                                <div className="flex items-start justify-between gap-3 mb-4">

                                                    <div>

                                                        <div className="flex items-center gap-2 mb-2">

                                                            <Flame size={14} className="text-orange-500" />

                                                            <span className="text-[10px] uppercase tracking-widest font-black text-orange-600">

                                                                Repeated {theme.totalOccurrences}x

                                                            </span>

                                                        </div>

                                                        <h3 className="text-base sm:text-lg font-black text-brand-dark leading-snug">

                                                            {theme.topics?.[0] || "General Theme"}

                                                        </h3>

                                                    </div>

                                                    <div className="bg-brand-dark text-white rounded-2xl px-3 py-2 text-center shrink-0">

                                                        <div className="text-xl font-black leading-none">

                                                            {theme.totalOccurrences}

                                                        </div>

                                                        <div className="text-[8px] uppercase tracking-widest font-bold opacity-60 mt-0.5">

                                                            times

                                                        </div>

                                                    </div>

                                                </div>

                                                {/* Years */}

                                                <div className="flex items-center gap-2 mb-3 flex-wrap">

                                                    <Calendar size={12} className="text-brand-muted" />

                                                    {theme.years?.sort((a, b) => b - a).map(year => (

                                                        <span
                                                            key={year}
                                                            className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[9px] font-black"
                                                        >
                                                            {year}
                                                        </span>
                                                    ))}

                                                </div>

                                                {/* Subjects */}

                                                <div className="flex items-center gap-2 mb-4 flex-wrap">

                                                    <Layers size={12} className="text-brand-muted" />

                                                    {theme.subjects?.filter(Boolean).map((subject, i) => (

                                                        <span
                                                            key={i}
                                                            className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[9px] font-black"
                                                        >
                                                            {subject}
                                                        </span>
                                                    ))}

                                                </div>

                                                {/* Sample Question */}

                                                <div className="bg-brand-light rounded-xl p-3 border border-brand-border">

                                                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-1">

                                                        Sample Question

                                                    </p>

                                                    <p className="text-xs font-bold text-brand-dark leading-relaxed line-clamp-3">

                                                        {theme.sampleQuestion}

                                                    </p>

                                                </div>

                                            </motion.div>
                                        ))}

                                    </div>
                                )}

                            </motion.div>
                        )}

                        {/* ===== MARKS ANALYSIS TAB ===== */}

                        {activeTab === "marks" && (

                            <motion.div
                                key="marks"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >

                                {trendsLoading ? (

                                    <LoadingState text="Building analysis table..." />

                                ) : processedTable.subjects.length === 0 ? (

                                    <EmptyState
                                        emoji="📈"
                                        title="No data for analysis"
                                        description="Add PYQs to see year-wise subject distribution"
                                    />

                                ) : (

                                    <div className="space-y-6">

                                        {/* SUMMARY CARDS */}

                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

                                            <SummaryCard
                                                label="Total Questions"
                                                value={processedTable.subjects.reduce(
                                                    (sum, s) => sum + (processedTable.data[s]?._total || 0),
                                                    0
                                                )}
                                                color="from-blue-500 to-cyan-500"
                                            />

                                            <SummaryCard
                                                label="Subjects Covered"
                                                value={processedTable.subjects.length}
                                                color="from-purple-500 to-pink-500"
                                            />

                                            <SummaryCard
                                                label="Years Tracked"
                                                value={processedTable.years.length}
                                                color="from-orange-500 to-red-500"
                                            />

                                            <SummaryCard
                                                label="Top Subject"
                                                value={
                                                    processedTable.subjects
                                                        .sort((a, b) =>
                                                            (processedTable.data[b]?._total || 0) -
                                                            (processedTable.data[a]?._total || 0)
                                                        )[0] || "N/A"
                                                }
                                                color="from-green-500 to-emerald-500"
                                                isText
                                            />

                                        </div>

                                        {/* DETAILED TABLE */}

                                        <div className="bg-white rounded-2xl sm:rounded-3xl border border-brand-border overflow-hidden">

                                            <div className="p-4 sm:p-6 border-b border-brand-border">

                                                <h2 className="font-black text-base sm:text-lg text-brand-dark mb-1">

                                                    Detailed Subject-Year Breakdown

                                                </h2>

                                                <p className="text-xs text-brand-muted font-medium">

                                                    Complete analysis of question distribution

                                                </p>

                                            </div>

                                            <div className="overflow-x-auto">

                                                <table className="w-full text-sm">

                                                    <thead>

                                                        <tr className="bg-brand-light">

                                                            <th className="text-left px-4 py-3 font-black text-[10px] uppercase tracking-widest text-brand-muted sticky left-0 bg-brand-light z-10 min-w-[150px]">

                                                                Subject

                                                            </th>

                                                            {processedTable.years.map(year => (

                                                                <th
                                                                    key={year}
                                                                    className="text-center px-3 py-3 font-black text-[10px] uppercase tracking-widest text-brand-muted min-w-[65px]"
                                                                >
                                                                    {year}
                                                                </th>
                                                            ))}

                                                            <th className="text-center px-4 py-3 font-black text-[10px] uppercase tracking-widest text-brand-dark min-w-[70px]">

                                                                Total

                                                            </th>

                                                            <th className="text-center px-4 py-3 font-black text-[10px] uppercase tracking-widest text-brand-dark min-w-[70px]">

                                                                Avg/Year

                                                            </th>

                                                        </tr>

                                                    </thead>

                                                    <tbody>

                                                        {processedTable.subjects
                                                            .sort((a, b) =>
                                                                (processedTable.data[b]?._total || 0) -
                                                                (processedTable.data[a]?._total || 0)
                                                            )
                                                            .map((subject, idx) => {

                                                            const total = processedTable.data[subject]?._total || 0;

                                                            const avg = processedTable.years.length > 0
                                                                ? Math.round(total / processedTable.years.length)
                                                                : 0;

                                                            return (

                                                                <tr
                                                                    key={subject}
                                                                    className={`border-t border-brand-border hover:bg-blue-50/30 transition-colors ${
                                                                        idx % 2 === 0 ? "" : "bg-brand-light/20"
                                                                    }`}
                                                                >

                                                                    <td className="px-4 py-3 font-black text-brand-dark text-xs sticky left-0 bg-white z-10 border-r border-brand-border">

                                                                        <div className="flex items-center gap-2">

                                                                            <div className={`w-2 h-2 rounded-full ${
                                                                                idx === 0 ? "bg-green-500" :
                                                                                idx === 1 ? "bg-blue-500" :
                                                                                idx === 2 ? "bg-purple-500" :
                                                                                "bg-brand-muted"
                                                                            }`} />

                                                                            {subject}

                                                                        </div>

                                                                    </td>

                                                                    {processedTable.years.map(year => {

                                                                        const count =
                                                                            processedTable.data[subject]?.[year] || 0;

                                                                        return (

                                                                            <td key={year} className="text-center px-2 py-2">

                                                                                <span className={`inline-block min-w-[32px] px-2 py-1 rounded-lg text-xs ${
                                                                                    count === 0
                                                                                        ? "text-brand-muted"
                                                                                        : count >= 10
                                                                                        ? "bg-brand-accent/20 text-brand-accent font-black"
                                                                                        : count >= 5
                                                                                        ? "bg-blue-50 text-blue-700 font-bold"
                                                                                        : "text-brand-dark font-medium"
                                                                                }`}>

                                                                                    {count || "—"}

                                                                                </span>

                                                                            </td>
                                                                        );
                                                                    })}

                                                                    <td className="text-center px-4 py-3 font-black text-brand-dark text-sm bg-brand-light/30">

                                                                        {total}

                                                                    </td>

                                                                    <td className="text-center px-4 py-3 font-bold text-brand-accent text-sm">

                                                                        ~{avg}

                                                                    </td>

                                                                </tr>
                                                            );
                                                        })}

                                                    </tbody>

                                                

                                                </table>

                                            </div>

                                            <div className="p-4 bg-brand-light/50 border-t border-brand-border">

                                                <p className="text-[10px] font-bold text-brand-muted text-center italic">

                                                    💡 Use this data to prioritize subjects. Higher avg/year = more important for UPSC.

                                                </p>

                                            </div>

                                        </div>

                                    </div>
                                )}

                            </motion.div>
                        )}

                    </AnimatePresence>

                </main>

                <Footer />

            </div>

        </div>
    );
}

// =========================
// HELPER COMPONENTS
// =========================

function LoadingState({ text }) {

    return (

        <div className="bg-white rounded-3xl border border-brand-border p-16 text-center">

            <Loader2 size={24} className="animate-spin text-brand-muted mx-auto mb-4" />

            <p className="text-sm font-black text-brand-muted uppercase tracking-widest">

                {text}

            </p>

        </div>
    );
}

function SummaryCard({ label, value, color, isText }) {

    return (

        <motion.div
            whileHover={{ y: -2 }}
            className="bg-white rounded-2xl p-4 border border-brand-border relative overflow-hidden"
        >

            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${color}`} />

            <p className="text-[9px] font-black uppercase tracking-widest text-brand-muted mb-2 mt-1">

                {label}

            </p>

            <p className={`font-black text-brand-dark leading-none ${
                isText ? "text-sm truncate" : "text-2xl"
            }`}>

                {value}

            </p>

        </motion.div>
    );
}