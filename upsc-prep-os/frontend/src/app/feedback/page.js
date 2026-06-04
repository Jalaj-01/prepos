"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
    MessageSquare,
    Plus,
    Search,
    Filter,
    Sparkles,
    TrendingUp,
    Clock,
    Lightbulb,
    Bug,
    HelpCircle,
    Heart,
    Megaphone,
} from "lucide-react";

import Sidebar from "@/components/layout/Sidebar";
import TopHeader from "@/components/layout/TopHeader";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import { showToast } from "@/components/ui/Toast";

import FeedbackPostCard from "@/components/feedback/FeedbackPostCard";
import FeedbackComposer from "@/components/feedback/FeedbackComposer";

const CATEGORIES = [
    { id: "all", label: "All", icon: MessageSquare },
    { id: "suggestion", label: "Suggestion", icon: Lightbulb },
    { id: "bug", label: "Bug Report", icon: Bug },
    { id: "question", label: "Question", icon: HelpCircle },
    { id: "praise", label: "Praise", icon: Heart },
    { id: "discussion", label: "Discussion", icon: MessageSquare },
];

const SORTS = [
    { id: "newest", label: "Newest", icon: Clock },
    { id: "top", label: "Top", icon: TrendingUp },
];

const STATUS_FILTERS = [
    { id: "all", label: "All Status" },
    { id: "open", label: "Open" },
    { id: "planned", label: "Planned" },
    { id: "in-progress", label: "In Progress" },
    { id: "shipped", label: "Shipped" },
    { id: "resolved", label: "Resolved" },
];

const SEEN_KEY = "feedback-last-seen-admin";

export default function FeedbackPage() {
    const [user, setUser] = useState(null);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [composerOpen, setComposerOpen] = useState(false);

    const [category, setCategory] = useState("all");
    const [status, setStatus] = useState("all");
    const [sort, setSort] = useState("newest");
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [officialOnly, setOfficialOnly] = useState(false);

    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {
        const info = localStorage.getItem("userInfo");
        if (!info) {
            window.location.href = "/login";
            return;
        }
        setUser(JSON.parse(info));
        // Mark as seen now so the sidebar red dot clears
        localStorage.setItem(SEEN_KEY, new Date().toISOString());
    }, []);

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => setSearch(searchInput), 300);
        return () => clearTimeout(t);
    }, [searchInput]);

    const fetchPosts = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (category !== "all") params.append("category", category);
            if (status !== "all") params.append("status", status);
            params.append("sort", sort);
            if (search.trim()) params.append("search", search.trim());
            if (officialOnly) params.append("officialOnly", "true");

            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            const { data } = await axios.get(
                `${baseUrl}/api/feedback?${params.toString()}`,
                config
            );
            setPosts(data.posts || []);
        } catch (e) {
            console.warn("Feedback fetch:", e.message);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, category, status, sort, search, officialOnly]);

    useEffect(() => {
        if (user) fetchPosts();
    }, [user, fetchPosts]);

    // Poll every 30s
    useEffect(() => {
        if (!user) return;
        const id = setInterval(fetchPosts, 30000);
        return () => clearInterval(id);
    }, [user, fetchPosts]);

    const handleCreated = (newPost) => {
        setPosts((p) => [newPost, ...p]);
    };

    const handleChange = (updated) => {
        setPosts((p) =>
            p.map((x) => (x._id === updated._id ? { ...x, ...updated } : x))
        );
    };

    const handleDelete = (id) => {
        setPosts((p) => p.filter((x) => x._id !== id));
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-brand-light flex">
                <div className="flex-1 flex flex-col min-h-screen min-w-0">
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
                    onMenuClick={() => setMobileNavOpen(true)}
                />

                <main className="flex-1 p-3 sm:p-6 lg:p-10 max-w-[1400px] w-full mx-auto">
                    {/* HERO */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
                    >
                        <div>
                            <p className="text-brand-muted font-bold text-xs sm:text-sm tracking-tight">
                                Community
                            </p>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-brand-dark tracking-tighter mt-1">
                                Feedback & Ideas 💬
                            </h1>
                            <p className="text-brand-muted font-medium mt-2 text-xs sm:text-sm max-w-xl">
                                Share what's working, what's not, and what you'd love
                                to see next. Every voice shapes the platform.
                            </p>
                        </div>

                        <button
                            onClick={() => setComposerOpen(true)}
                            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 bg-brand-dark text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-brand-accent transition-all shrink-0"
                        >
                            <Plus size={14} />
                            New Post
                        </button>
                    </motion.div>

                    {/* MAIN GRID */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
                        {/* LEFT SIDEBAR */}
                        <aside className="lg:col-span-3 space-y-4">
                            {/* Categories */}
                            <div className="bg-white border border-brand-border rounded-2xl p-4 sm:p-5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-3">
                                    Categories
                                </p>
                                <div className="space-y-1">
                                    {CATEGORIES.map((c) => {
                                        const Icon = c.icon;
                                        const active = category === c.id;
                                        return (
                                            <button
                                                key={c.id}
                                                onClick={() => setCategory(c.id)}
                                                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black transition-all ${
                                                    active
                                                        ? "bg-brand-dark text-white"
                                                        : "text-brand-muted hover:bg-brand-light hover:text-brand-dark"
                                                }`}
                                            >
                                                <Icon size={13} />
                                                {c.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Status filter */}
                            {/* <div className="bg-white border border-brand-border rounded-2xl p-4 sm:p-5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-3">
                                    Status
                                </p>
                                <div className="space-y-1">
                                    {STATUS_FILTERS.map((s) => (
                                        <button
                                            key={s.id}
                                            onClick={() => setStatus(s.id)}
                                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-black transition-all ${
                                                status === s.id
                                                    ? "bg-brand-dark text-white"
                                                    : "text-brand-muted hover:bg-brand-light hover:text-brand-dark"
                                            }`}
                                        >
                                            {s.label}
                                        </button>
                                    ))}
                                </div>
                            </div> */}

                            {/* Official only */}
                            <div className="bg-white border border-brand-border rounded-2xl p-4 sm:p-5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-3">
                                    Filters
                                </p>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={officialOnly}
                                        onChange={(e) =>
                                            setOfficialOnly(e.target.checked)
                                        }
                                        className="w-4 h-4 accent-brand-dark"
                                    />
                                    <span className="text-xs font-bold text-brand-dark flex items-center gap-1">
                                        <Megaphone size={11} />
                                        Official updates only
                                    </span>
                                </label>
                            </div>
                        </aside>

                        {/* MAIN COLUMN */}
                        <div className="lg:col-span-9 space-y-4">
                            {/* Control bar */}
                            <div className="bg-white border border-brand-border rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                                <div className="relative flex-1 sm:max-w-xs">
                                    <Search
                                        size={14}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted"
                                    />
                                    <input
                                        type="text"
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        placeholder="Search posts..."
                                        className="w-full pl-9 pr-3 py-2 bg-brand-light border border-brand-border rounded-xl text-sm font-bold outline-none focus:border-brand-accent transition-all"
                                    />
                                </div>

                                <div className="flex bg-brand-light rounded-xl p-1 gap-0.5">
                                    {SORTS.map((s) => {
                                        const Icon = s.icon;
                                        const active = sort === s.id;
                                        return (
                                            <button
                                                key={s.id}
                                                onClick={() => setSort(s.id)}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                                    active
                                                        ? "bg-white text-brand-dark shadow-sm"
                                                        : "text-brand-muted hover:text-brand-dark"
                                                }`}
                                            >
                                                <Icon size={11} />
                                                {s.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Posts */}
                            <div className="space-y-3">
                                {loading && posts.length === 0 ? (
                                    <p className="text-center text-xs font-bold text-brand-muted py-12">
                                        Loading...
                                    </p>
                                ) : posts.length === 0 ? (
                                    <div className="bg-white border-2 border-dashed border-brand-border rounded-2xl p-12 text-center">
                                        <Sparkles
                                            size={32}
                                            className="text-brand-muted mx-auto mb-3"
                                        />
                                        <p className="text-sm font-black text-brand-dark">
                                            Be the first to post
                                        </p>
                                        <p className="text-xs font-bold text-brand-muted mt-1">
                                            Share an idea, a bug, or a kind word.
                                        </p>
                                        <button
                                            onClick={() => setComposerOpen(true)}
                                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-brand-dark text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-accent transition-all"
                                        >
                                            <Plus size={12} />
                                            New Post
                                        </button>
                                    </div>
                                ) : (
                                    <AnimatePresence>
                                        {posts.map((p) => (
                                            <FeedbackPostCard
                                                key={p._id}
                                                post={p}
                                                user={user}
                                                onChange={handleChange}
                                                onDelete={handleDelete}
                                            />
                                        ))}
                                    </AnimatePresence>
                                )}
                            </div>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>

            <FeedbackComposer
                open={composerOpen}
                onClose={() => setComposerOpen(false)}
                user={user}
                onCreated={handleCreated}
            />
        </div>
    );
}