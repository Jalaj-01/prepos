"use client";

import { useEffect, useState } from "react";

import { motion } from "framer-motion";

import {
    GraduationCap,
    BookOpen,
    CheckCircle2,
    Clock,
    TrendingUp,
    Calendar,
    ArrowUpRight,
    Target,
    Award,
    BarChart3,
    Sparkles,
    FileText
} from "lucide-react";

import Link from "next/link";

import axios from "axios";

import Sidebar from "@/components/layout/Sidebar";

import TopHeader from "@/components/layout/TopHeader";

import Footer from "@/components/layout/Footer";

import MobileNav from "@/components/layout/MobileNav";

export default function MainsDashboardLogic() {

    const [user, setUser] = useState(null);

    const [stats, setStats] = useState(null);

    const [papers, setPapers] = useState([]);

    const [subjects, setSubjects] = useState([]);

    const [recent, setRecent] = useState([]);

    const [loading, setLoading] = useState(true);

    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    useEffect(() => {

        const info =
            localStorage.getItem("userInfo");

        if (!info) {
            window.location.href = "/login";
            return;
        }

        const parsed = JSON.parse(info);

        setUser(parsed);

        fetchData(parsed.token);

    }, []);

    const fetchData = async (token) => {

        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };

        try {

            const [
                statsRes,
                papersRes,
                subjectsRes,
                recentRes
            ] = await Promise.all([

                axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/mains/analytics/dashboard`,
                    config
                ),

                axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/mains/analytics/papers`,
                    config
                ),

                axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/mains/analytics/subjects`,
                    config
                ),

                axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/mains/analytics/recent`,
                    config
                )
            ]);

            setStats(statsRes.data);

            setPapers(papersRes.data);

            setSubjects(subjectsRes.data);

            setRecent(recentRes.data);

        } catch (err) {

            console.error(
                "Mains Dashboard Error:",
                err
            );

        } finally {

            setLoading(false);
        }
    };

    if (loading || !user) {

        return (

            <div className="min-h-screen bg-brand-light flex items-center justify-center">

                <div className="font-black text-brand-muted animate-pulse uppercase tracking-widest text-sm">

                    Loading Mains...

                </div>

            </div>
        );
    }

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

                <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-[1600px] w-full mx-auto">

                    {/* HEADER */}

                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
                    >

                        <div>

                            <div className="flex items-center gap-3 mb-2">

                                <div className="bg-purple-500/10 p-3 rounded-2xl">

                                    <GraduationCap
                                        className="text-purple-600"
                                        size={24}
                                    />

                                </div>

                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark tracking-tighter">

                                    Mains

                                </h1>

                            </div>

                            <p className="text-brand-muted font-medium text-sm sm:text-base">

                                Track your Mains preparation journey across all papers.

                            </p>

                        </div>

                        <Link
                            href="/mains/library"
                            className="self-start sm:self-auto flex items-center gap-2 px-5 py-3 bg-brand-dark text-white rounded-2xl font-black text-sm hover:bg-brand-accent transition-all"
                        >

                            Browse All Questions

                            <ArrowUpRight size={16} />

                        </Link>

                    </motion.div>

                    {/* KPIs */}

                    {stats && (

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

                            <KpiCard
                                icon={FileText}
                                label="Total Questions"
                                value={stats.totalQuestions}
                                sub="in question bank"
                                color="from-blue-500 to-cyan-500"
                            />

                            <KpiCard
                                icon={CheckCircle2}
                                label="Completed"
                                value={stats.completed}
                                sub={`${stats.completionPercentage}% done`}
                                color="from-green-500 to-emerald-500"
                            />

                            <KpiCard
                                icon={Clock}
                                label="Remaining"
                                value={stats.remaining}
                                sub="questions to go"
                                color="from-orange-500 to-red-500"
                            />

                            <KpiCard
                                icon={Award}
                                label="This Week"
                                value={stats.doneThisWeek}
                                sub="completed"
                                color="from-purple-500 to-pink-500"
                            />

                        </div>
                    )}

                    {/* MAIN GRID */}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                        {/* LEFT — 8 cols */}

                        <div className="lg:col-span-8 space-y-6">

                            {/* OVERALL PROGRESS */}

                            {stats && (

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden"
                                >

                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-32 translate-x-32" />

                                    <div className="relative z-10">

                                        <p className="text-xs font-black uppercase tracking-widest text-white/80 mb-2">

                                            Overall Progress

                                        </p>

                                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-1">

                                            {stats.completed} / {stats.totalQuestions}

                                        </h2>

                                        <p className="text-white/70 font-medium text-sm mb-6">

                                            {stats.completionPercentage}% of your Mains journey complete

                                        </p>

                                        <div className="w-full bg-white/20 h-3 rounded-full overflow-hidden mb-6">

                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{
                                                    width: `${stats.completionPercentage}%`
                                                }}
                                                transition={{
                                                    duration: 1,
                                                    ease: "easeOut"
                                                }}
                                                className="h-full bg-white rounded-full"
                                            />

                                        </div>

                                        <div className="grid grid-cols-3 gap-4">

                                            <div>

                                                <p className="text-2xl font-black">{stats.doneToday}</p>

                                                <p className="text-xs text-white/70 font-bold uppercase tracking-widest mt-1">

                                                    Today

                                                </p>

                                            </div>

                                            <div>

                                                <p className="text-2xl font-black">{stats.doneThisWeek}</p>

                                                <p className="text-xs text-white/70 font-bold uppercase tracking-widest mt-1">

                                                    This Week

                                                </p>

                                            </div>

                                            <div>

                                                <p className="text-2xl font-black">{stats.doneThisMonth}</p>

                                                <p className="text-xs text-white/70 font-bold uppercase tracking-widest mt-1">

                                                    This Month

                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                </motion.div>
                            )}

                            {/* PAPER-WISE PROGRESS */}

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border"
                            >

                                <div className="flex items-center gap-3 mb-6">

                                    <div className="bg-brand-accent/10 p-2.5 rounded-xl">
                                        <BarChart3 className="text-brand-accent" size={20} />
                                    </div>

                                    <h2 className="text-lg sm:text-xl font-black text-brand-dark">

                                        Paper-wise Progress

                                    </h2>

                                </div>

                                {papers.length > 0 ? (

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                        {papers.map((p) => (

                                            <Link
                                                key={p.paper}
                                                href={`/mains/library?paper=${p.paper}`}
                                                className="group bg-brand-light hover:bg-white border border-transparent hover:border-brand-accent rounded-2xl p-4 transition-all"
                                            >

                                                <div className="flex items-center justify-between mb-3">

                                                    <span className="font-black text-brand-dark">

                                                        {p.paper}

                                                    </span>

                                                    <span className="text-xs font-black text-brand-accent">

                                                        {p.percentage}%

                                                    </span>

                                                </div>

                                                <div className="w-full bg-white h-2 rounded-full overflow-hidden mb-2">

                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{
                                                            width: `${p.percentage}%`
                                                        }}
                                                        className={`h-full rounded-full ${
                                                            p.percentage >= 70
                                                                ? "bg-green-500"
                                                                : p.percentage >= 40
                                                                ? "bg-yellow-500"
                                                                : "bg-red-500"
                                                        }`}
                                                    />

                                                </div>

                                                <p className="text-[10px] font-bold text-brand-muted">

                                                    {p.completed} / {p.total} questions

                                                </p>

                                            </Link>
                                        ))}

                                    </div>

                                ) : (

                                    <p className="text-brand-muted text-center py-8 text-sm font-medium">

                                        No questions in database yet.

                                    </p>
                                )}

                            </motion.div>

                            {/* SUBJECT-WISE PROGRESS */}

                            {subjects.length > 0 && (

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border"
                                >

                                    <div className="flex items-center gap-3 mb-6">

                                        <div className="bg-green-500/10 p-2.5 rounded-xl">
                                            <Target className="text-green-500" size={20} />
                                        </div>

                                        <h2 className="text-lg sm:text-xl font-black text-brand-dark">

                                            Subject Completion

                                        </h2>

                                    </div>

                                    <div className="space-y-3">

                                        {subjects.slice(0, 6).map((s) => (

                                            <div key={s.name}>

                                                <div className="flex justify-between items-center mb-2">

                                                    <span className="font-bold text-sm text-brand-dark">

                                                        {s.name}

                                                    </span>

                                                    <span className="font-black text-sm text-brand-dark">

                                                        {s.completed}/{s.total}

                                                        <span className="ml-2 text-brand-accent">

                                                            ({s.percentage}%)

                                                        </span>

                                                    </span>

                                                </div>

                                                <div className="w-full bg-brand-light h-2 rounded-full overflow-hidden">

                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{
                                                            width: `${s.percentage}%`
                                                        }}
                                                        className={`h-full rounded-full ${
                                                            s.percentage >= 70
                                                                ? "bg-gradient-to-r from-green-400 to-green-600"
                                                                : s.percentage >= 40
                                                                ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                                                                : "bg-gradient-to-r from-red-400 to-red-600"
                                                        }`}
                                                    />

                                                </div>

                                            </div>
                                        ))}

                                    </div>

                                </motion.div>
                            )}

                        </div>

                        {/* RIGHT — 4 cols */}

                        <div className="lg:col-span-4 space-y-6">

                            {/* QUICK ACTIONS */}

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white border border-brand-border rounded-3xl p-6"
                            >

                                <p className="text-xs font-black uppercase tracking-widest text-brand-muted mb-4">

                                    Quick Actions

                                </p>

                                <div className="space-y-2">

                                    <Link
                                        href="/mains/library"
                                        className="flex items-center gap-3 p-3 rounded-2xl hover:bg-brand-light transition-all group"
                                    >

                                        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">

                                            <BookOpen size={18} />

                                        </div>

                                        <div className="flex-1">

                                            <p className="font-black text-sm text-brand-dark">

                                                Browse Library

                                            </p>

                                            <p className="text-[10px] text-brand-muted font-bold">

                                                All Mains questions

                                            </p>

                                        </div>

                                        <ArrowUpRight
                                            size={16}
                                            className="text-brand-muted group-hover:text-brand-accent"
                                        />

                                    </Link>

                                    {user.isAdmin && (

                                        <Link
                                            href="/admin/mains-bulk"
                                            className="flex items-center gap-3 p-3 rounded-2xl hover:bg-brand-light transition-all group"
                                        >

                                            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">

                                                <Sparkles size={18} />

                                            </div>

                                            <div className="flex-1">

                                                <p className="font-black text-sm text-brand-dark">

                                                    Bulk Import

                                                </p>

                                                <p className="text-[10px] text-brand-muted font-bold">

                                                    Admin upload

                                                </p>

                                            </div>

                                            <ArrowUpRight
                                                size={16}
                                                className="text-brand-muted group-hover:text-brand-accent"
                                            />

                                        </Link>
                                    )}

                                </div>

                            </motion.div>

                            {/* RECENT ACTIVITY */}

                            {recent.length > 0 && (

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white border border-brand-border rounded-3xl p-6"
                                >

                                    <div className="flex items-center gap-2 mb-4">

                                        <Calendar size={16} className="text-brand-accent" />

                                        <p className="text-xs font-black uppercase tracking-widest text-brand-muted">

                                            Recent Activity

                                        </p>

                                    </div>

                                    <div className="space-y-3">

                                        {recent.slice(0, 5).map((r) => (

                                            <Link
                                                key={r.questionId}
                                                href={`/mains/library?id=${r.questionId}`}
                                                className="block p-3 rounded-2xl hover:bg-brand-light transition-all"
                                            >

                                                <div className="flex items-center gap-2 mb-1">

                                                    <span className="text-[10px] font-black bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">

                                                        {r.paper}

                                                    </span>

                                                    <span className="text-[10px] font-bold text-brand-muted">

                                                        {r.year} • {r.marks}M

                                                    </span>

                                                </div>

                                                <p className="text-xs font-bold text-brand-dark line-clamp-2 leading-relaxed">

                                                    {r.questionText}

                                                </p>

                                            </Link>
                                        ))}

                                    </div>

                                </motion.div>
                            )}

                            {/* EMPTY STATE */}

                            {stats?.totalQuestions === 0 && (

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-yellow-50 border border-yellow-200 rounded-3xl p-6"
                                >

                                    <p className="text-xs font-black uppercase tracking-widest text-yellow-700 mb-2">

                                        Empty Library

                                    </p>

                                    <p className="text-sm font-bold text-yellow-900 mb-3 leading-relaxed">

                                        No Mains questions yet. {user.isAdmin ? "Use bulk import to add questions." : "Ask admin to add questions."}

                                    </p>

                                    {user.isAdmin && (

                                        <Link
                                            href="/admin/mains-bulk"
                                            className="inline-flex items-center gap-2 mt-2 text-xs font-black text-yellow-700 hover:underline"
                                        >

                                            Start Importing <ArrowUpRight size={12} />

                                        </Link>
                                    )}

                                </motion.div>
                            )}

                        </div>

                    </div>

                </main>

                <Footer />

            </div>

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
            className="bg-white rounded-2xl p-5 border border-brand-border"
        >

            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4`}>

                <Icon size={18} className="text-white" />

            </div>

            <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-1">

                {label}

            </p>

            <p className="text-2xl font-black text-brand-dark leading-none">

                {value}

            </p>

            <p className="text-xs text-brand-muted font-medium mt-2 truncate">

                {sub}

            </p>

        </motion.div>
    );
}