"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Calendar,
    AlertCircle,
    CheckCircle2,
    Circle,
    ArrowUpRight,
} from "lucide-react";
import { format, isToday, isTomorrow, isPast } from "date-fns";

export default function PlannerWidget() {
    const [stats, setStats] = useState(null);
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    const getConfig = () => {
        const info = JSON.parse(localStorage.getItem("userInfo") || "{}");
        return { headers: { Authorization: `Bearer ${info.token}` } };
    };

    const fetchStats = async () => {
        try {
            const { data } = await axios.get(
                `${baseUrl}/api/tasks/stats`,
                getConfig()
            );
            setStats(data);
        } catch (e) {
            console.warn("Planner stats:", e.message);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleToggle = async (taskId) => {
        try {
            await axios.patch(
                `${baseUrl}/api/tasks/${taskId}/toggle`,
                {},
                getConfig()
            );
            fetchStats();
        } catch (e) {}
    };

    const formatDue = (date, time) => {
        if (!date) return null;
        const d = new Date(date);
        if (isToday(d)) return time ? `Today · ${time}` : "Today";
        if (isTomorrow(d)) return "Tomorrow";
        return format(d, "MMM d");
    };

    if (!stats) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-brand-border rounded-2xl sm:rounded-3xl p-5 sm:p-6"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="bg-purple-100 p-1.5 rounded-lg">
                        <Calendar size={14} className="text-purple-600" />
                    </div>
                    <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-brand-muted">
                        Day Planner
                    </p>
                </div>
                <Link
                    href="/planner"
                    className="text-[10px] font-black uppercase tracking-widest text-brand-accent hover:text-brand-dark transition-all flex items-center gap-1"
                >
                    Open <ArrowUpRight size={10} />
                </Link>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-blue-50 rounded-xl p-2.5 text-center">
                    <p className="text-xl font-black text-blue-600 leading-none">
                        {stats.todayCount || 0}
                    </p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-blue-600/70 mt-1">
                        Today
                    </p>
                </div>
                <div className="bg-red-50 rounded-xl p-2.5 text-center">
                    <p className="text-xl font-black text-red-600 leading-none">
                        {stats.overdueCount || 0}
                    </p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-red-600/70 mt-1">
                        Overdue
                    </p>
                </div>
                <div className="bg-green-50 rounded-xl p-2.5 text-center">
                    <p className="text-xl font-black text-green-600 leading-none">
                        {stats.doneThisWeek || 0}
                    </p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-green-600/70 mt-1">
                        Done/Wk
                    </p>
                </div>
            </div>

            {stats.todayTasks && stats.todayTasks.length > 0 ? (
                <div className="space-y-1.5">
                    {stats.todayTasks.slice(0, 4).map((t) => {
                        const due = t.dueDate ? new Date(t.dueDate) : null;
                        const overdue = due && isPast(due) && !isToday(due);
                        return (
                            <div
                                key={t._id}
                                className="flex items-center gap-2 p-2 rounded-xl hover:bg-brand-light transition-all"
                            >
                                <button
                                    onClick={() => handleToggle(t._id)}
                                    className="shrink-0"
                                >
                                    <Circle
                                        size={14}
                                        className="text-brand-muted hover:text-brand-dark"
                                    />
                                </button>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-black text-brand-dark truncate">
                                        {t.title}
                                    </p>
                                    {due && (
                                        <p
                                            className={`text-[10px] font-bold ${
                                                overdue ? "text-red-500" : "text-brand-muted"
                                            }`}
                                        >
                                            {formatDue(t.dueDate, t.dueTime)}
                                        </p>
                                    )}
                                </div>
                                {overdue && (
                                    <AlertCircle size={12} className="text-red-500 shrink-0" />
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-4">
                    <CheckCircle2
                        size={20}
                        className="text-green-500 mx-auto mb-1"
                    />
                    <p className="text-xs font-black text-brand-dark">All clear</p>
                    <p className="text-[10px] font-bold text-brand-muted">
                        No tasks pending
                    </p>
                </div>
            )}
        </motion.div>
    );
}