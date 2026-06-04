"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    Calendar,
    Layers,
    AlertCircle,
    Search,
    Filter,
} from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import TopHeader from "@/components/layout/TopHeader";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import TaskCard from "@/components/planner/TaskCard";
import TaskDrawer from "@/components/planner/TaskDrawer";
import { DashboardSkeleton } from "@/components/ui/Skeleton";

const VIEWS = [
    { id: "today", label: "Today" },
    { id: "week", label: "This Week" },
    { id: "overdue", label: "Overdue" },
    { id: "all", label: "All" },
];

const CATEGORY_LABELS = {
    prelims: { label: "Prelims", color: "text-blue-600" },
    mains: { label: "Mains", color: "text-purple-600" },
    revision: { label: "Revision", color: "text-yellow-600" },
    general: { label: "General", color: "text-gray-600" },
};

export default function PlannerPage() {
    const [user, setUser] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState("today");
    const [category, setCategory] = useState(null);
    const [search, setSearch] = useState("");
    const [showDone, setShowDone] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const getConfig = () => {
        const info = JSON.parse(localStorage.getItem("userInfo") || "{}");
        return { headers: { Authorization: `Bearer ${info.token}` } };
    };

    useEffect(() => {
        const info = localStorage.getItem("userInfo");
        if (!info) {
            window.location.href = "/login";
            return;
        }
        setUser(JSON.parse(info));
    }, []);

    const fetchTasks = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (view !== "all") params.append("view", view);
            if (category) params.append("category", category);
            if (search.trim()) params.append("search", search.trim());
            if (!showDone) params.append("status", "pending");

            const [tRes, sRes] = await Promise.all([
                axios.get(
                    `${baseUrl}/api/tasks?${params.toString()}`,
                    getConfig()
                ),
                axios.get(`${baseUrl}/api/tasks/stats`, getConfig()),
            ]);
            setTasks(tRes.data.tasks || []);
            setStats(sRes.data);
        } catch (e) {
            console.warn("Tasks fetch:", e.message);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, view, category, search, showDone]);

    useEffect(() => {
        if (user) fetchTasks();
    }, [user, fetchTasks]);

    const handleToggle = async (task) => {
        try {
            await axios.patch(
                `${baseUrl}/api/tasks/${task._id}/toggle`,
                {},
                getConfig()
            );
            fetchTasks();
        } catch (e) {}
    };

    const handleSubtaskToggle = async (task, sub) => {
        try {
            await axios.patch(
                `${baseUrl}/api/tasks/${task._id}/subtasks/${sub._id}/toggle`,
                {},
                getConfig()
            );
            fetchTasks();
        } catch (e) {}
    };

    const handleEdit = (task) => {
        setEditingTask(task);
        setDrawerOpen(true);
    };

    const handleNew = () => {
        setEditingTask("new");
        setDrawerOpen(true);
    };

    const handleDelete = async (task) => {
        try {
            await axios.delete(`${baseUrl}/api/tasks/${task._id}`, getConfig());
            fetchTasks();
        } catch (e) {}
    };

    if (!user || loading) {
        return (
            <div className="min-h-screen bg-brand-light flex">
                {user && <Sidebar isAdmin={user.isAdmin} />}
                <div className="flex-1 flex flex-col min-h-screen min-w-0">
                    {user && (
                        <TopHeader user={user} readinessScore={0} onMenuClick={() => {}} />
                    )}
                    <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-[1600px] w-full mx-auto">
                        <DashboardSkeleton />
                    </main>
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
                    readinessScore={0}
                    onMenuClick={() => setMobileNavOpen(true)}
                />

                <main className="flex-1 p-3 sm:p-6 lg:p-10 max-w-[1600px] w-full mx-auto">
                    {/* HERO */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
                    >
                        <div>
                            <p className="text-brand-muted font-bold text-xs sm:text-sm tracking-tight">
                                Day Planner
                            </p>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-brand-dark tracking-tighter mt-1">
                                Plan. Execute. Win. 📅
                            </h1>
                            <p className="text-brand-muted font-medium mt-2 text-xs sm:text-sm">
                                Tasks, deadlines, and reminders — all in one place.
                            </p>
                        </div>

                        <button
                            onClick={handleNew}
                            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 bg-brand-dark text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-brand-accent transition-all"
                        >
                            <Plus size={14} />
                            New Task
                        </button>
                    </motion.div>

                    {/* STATS BAR */}
                    {stats && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                            <StatBox label="Today" value={stats.todayCount} accent="blue" />
                            <StatBox
                                label="Overdue"
                                value={stats.overdueCount}
                                accent="red"
                            />
                            <StatBox
                                label="This Week"
                                value={stats.weekCount}
                                accent="purple"
                            />
                            <StatBox
                                label="Done This Week"
                                value={stats.doneThisWeek}
                                accent="green"
                            />
                        </div>
                    )}

                    {/* MAIN GRID */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
                        {/* SIDEBAR */}
                        <aside className="lg:col-span-3 space-y-4">
                            <div className="bg-white border border-brand-border rounded-2xl p-4 sm:p-5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-3">
                                    Categories
                                </p>
                                <div className="space-y-1">
                                    <CategoryBtn
                                        label="All"
                                        count={stats?.totalActive || 0}
                                        active={!category}
                                        onClick={() => setCategory(null)}
                                    />
                                    {Object.entries(CATEGORY_LABELS).map(([key, cfg]) => (
                                        <CategoryBtn
                                            key={key}
                                            label={cfg.label}
                                            count={stats?.categories?.[key] || 0}
                                            active={category === key}
                                            onClick={() => setCategory(key)}
                                            color={cfg.color}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white border border-brand-border rounded-2xl p-4 sm:p-5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-3">
                                    Filters
                                </p>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={showDone}
                                        onChange={(e) => setShowDone(e.target.checked)}
                                        className="w-4 h-4 accent-brand-dark"
                                    />
                                    <span className="text-xs font-bold text-brand-dark">
                                        Show completed
                                    </span>
                                </label>
                            </div>
                        </aside>

                        {/* MAIN */}
                        <div className="lg:col-span-9 space-y-4">
                            {/* VIEWS + SEARCH */}
                            <div className="bg-white border border-brand-border rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                                <div className="flex gap-1 bg-brand-light rounded-xl p-1">
                                    {VIEWS.map((v) => (
                                        <button
                                            key={v.id}
                                            onClick={() => setView(v.id)}
                                            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all ${
                                                view === v.id
                                                    ? "bg-brand-dark text-white"
                                                    : "text-brand-muted hover:text-brand-dark"
                                            }`}
                                        >
                                            {v.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="relative flex-1 sm:max-w-xs">
                                    <Search
                                        size={14}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted"
                                    />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search tasks..."
                                        className="w-full pl-9 pr-3 py-2 bg-brand-light border border-brand-border rounded-xl text-sm font-bold outline-none focus:border-brand-accent transition-all"
                                    />
                                </div>
                            </div>

                            {/* TASK LIST */}
                            <div className="space-y-2">
                                <AnimatePresence>
                                    {tasks.length === 0 ? (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="bg-white border-2 border-dashed border-brand-border rounded-2xl p-12 text-center"
                                        >
                                            <Layers
                                                size={32}
                                                className="text-brand-muted mx-auto mb-3"
                                            />
                                            <p className="text-sm font-black text-brand-dark">
                                                No tasks here
                                            </p>
                                            <p className="text-xs font-bold text-brand-muted mt-1">
                                                {view === "today"
                                                    ? "Nothing scheduled for today. Enjoy the breather."
                                                    : "Click 'New Task' to get started."}
                                            </p>
                                        </motion.div>
                                    ) : (
                                        tasks.map((t) => (
                                            <TaskCard
                                                key={t._id}
                                                task={t}
                                                onToggle={handleToggle}
                                                onEdit={handleEdit}
                                                onDelete={handleDelete}
                                                onToggleSubtask={handleSubtaskToggle}
                                            />
                                        ))
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>

            <TaskDrawer
                open={drawerOpen}
                task={editingTask}
                onClose={() => setDrawerOpen(false)}
                onSaved={fetchTasks}
            />
        </div>
    );
}

function StatBox({ label, value, accent }) {
    const accents = {
        blue: "text-blue-600 bg-blue-50",
        red: "text-red-600 bg-red-50",
        purple: "text-purple-600 bg-purple-50",
        green: "text-green-600 bg-green-50",
    };
    return (
        <div className={`rounded-2xl p-4 border border-brand-border bg-white`}>
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
                {label}
            </p>
            <p className={`text-2xl sm:text-3xl font-black mt-1 ${accents[accent]?.split(" ")[0]}`}>
                {value || 0}
            </p>
        </div>
    );
}

function CategoryBtn({ label, count, active, onClick, color }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-black transition-all ${
                active
                    ? "bg-brand-dark text-white"
                    : "text-brand-muted hover:bg-brand-light hover:text-brand-dark"
            }`}
        >
            <span className={active ? "" : color}>{label}</span>
            <span className="opacity-70">{count}</span>
        </button>
    );
}