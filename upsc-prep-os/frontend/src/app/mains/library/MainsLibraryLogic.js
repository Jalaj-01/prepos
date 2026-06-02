"use client";

import { useEffect, useState } from "react";

import { motion } from "framer-motion";

import {
    Search,
    Filter,
    CheckCircle2,
    Circle,
    Bookmark,
    BookOpen,
    Calendar,
    Award,
    ChevronLeft,
    ChevronRight,
    X
} from "lucide-react";

import axios from "axios";

import Sidebar from "@/components/layout/Sidebar";

import TopHeader from "@/components/layout/TopHeader";

import Footer from "@/components/layout/Footer";

import MobileNav from "@/components/layout/MobileNav";

const PAPERS = [
    "GS1",
    "GS2",
    "GS3",
    "GS4",
    "Essay",
    "Optional"
];

export default function MainsLibraryLogic() {

    const [user, setUser] = useState(null);

    const [questions, setQuestions] = useState([]);

    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState({
        paper: "",
        year: "",
        subject: "",
        difficulty: "",
        search: ""
    });

    const [filtersMeta, setFiltersMeta] = useState({
        years: [],
        papers: [],
        subjects: []
    });

    const [page, setPage] = useState(1);

    const [totalPages, setTotalPages] = useState(1);

    const [total, setTotal] = useState(0);

    const [expandedId, setExpandedId] = useState(null);

    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {

        const info =
            localStorage.getItem("userInfo");

        if (!info) {
            window.location.href = "/login";
            return;
        }

        setUser(JSON.parse(info));

        fetchFiltersMeta();

    }, []);

    useEffect(() => {

        if (user) {
            fetchQuestions();
        }

    }, [filters, page, user]);

    const fetchFiltersMeta = async () => {

        try {

            const info =
                localStorage.getItem("userInfo");

            const parsed = JSON.parse(info);

            const { data } = await axios.get(

                `${process.env.NEXT_PUBLIC_API_URL}/api/mains/questions/filters/metadata`,

                {
                    headers: {
                        Authorization: `Bearer ${parsed.token}`
                    }
                }
            );

            setFiltersMeta(data);

        } catch (err) {

            console.error("Filters meta error", err);
        }
    };

    const fetchQuestions = async () => {

        setLoading(true);

        try {

            const params = {
                page,
                limit: 20
            };

            Object.entries(filters).forEach(([k, v]) => {

                if (v) params[k] = v;
            });

            const { data } = await axios.get(

                `${process.env.NEXT_PUBLIC_API_URL}/api/mains/questions`,

                {
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    },
                    params
                }
            );

            setQuestions(data.questions);

            setTotal(data.total);

            setTotalPages(data.totalPages);

        } catch (err) {

            console.error("Fetch questions error", err);

        } finally {

            setLoading(false);
        }
    };

    const toggleComplete = async (questionId) => {

        try {

            await axios.put(

                `${process.env.NEXT_PUBLIC_API_URL}/api/mains/attempts/toggle/${questionId}`,

                {},

                {
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    }
                }
            );

            // Optimistic update

            setQuestions(prev =>

                prev.map(q =>

                    q._id === questionId

                        ? { ...q, isCompleted: !q.isCompleted }

                        : q
                )
            );

        } catch (err) {

            alert("Failed to update. Try again.");
        }
    };

    const toggleBookmark = async (questionId) => {

        try {

            await axios.put(

                `${process.env.NEXT_PUBLIC_API_URL}/api/mains/attempts/bookmark/${questionId}`,

                {},

                {
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    }
                }
            );

            setQuestions(prev =>

                prev.map(q =>

                    q._id === questionId

                        ? { ...q, isBookmarked: !q.isBookmarked }

                        : q
                )
            );

        } catch (err) {

            alert("Failed to bookmark.");
        }
    };

    const clearFilters = () => {

        setFilters({
            paper: "",
            year: "",
            subject: "",
            difficulty: "",
            search: ""
        });

        setPage(1);
    };

    const activeFilterCount =
        Object.values(filters).filter(Boolean).length;

    if (!user) {

        return (

            <div className="min-h-screen bg-brand-light flex items-center justify-center">

                <div className="font-black text-brand-muted animate-pulse uppercase tracking-widest text-sm">

                    Loading...

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

                    <div className="mb-8">

                        <div className="flex items-center gap-3 mb-2">

                            <div className="bg-purple-500/10 p-3 rounded-2xl">

                                <BookOpen className="text-purple-600" size={24} />

                            </div>

                            <h1 className="text-3xl sm:text-4xl font-black text-brand-dark tracking-tighter">

                                Mains Library

                            </h1>

                        </div>

                        <p className="text-brand-muted font-medium text-sm sm:text-base">

                            {total > 0 ? `${total} questions found` : "Browse Mains questions"}

                        </p>

                    </div>

                    {/* SEARCH + FILTER BAR */}

                    <div className="bg-white rounded-3xl border border-brand-border p-4 mb-6 flex items-center gap-3">

                        <Search size={18} className="text-brand-muted" />

                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => {
                                setFilters({ ...filters, search: e.target.value });
                                setPage(1);
                            }}
                            placeholder="Search questions, topics, keywords..."
                            className="flex-1 bg-transparent outline-none text-sm font-bold text-brand-dark"
                        />

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                                activeFilterCount > 0
                                    ? "bg-brand-dark text-white"
                                    : "bg-brand-light text-brand-muted hover:text-brand-dark"
                            }`}
                        >

                            <Filter size={14} />

                            Filters

                            {activeFilterCount > 0 && (
                                <span className="bg-brand-accent text-white px-1.5 py-0.5 rounded-full text-[9px]">
                                    {activeFilterCount}
                                </span>
                            )}

                        </button>

                    </div>

                    {/* FILTER PANEL */}

                    {showFilters && (

                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-white rounded-3xl border border-brand-border p-6 mb-6"
                        >

                            <div className="flex items-center justify-between mb-4">

                                <p className="text-xs font-black uppercase tracking-widest text-brand-muted">

                                    Refine Results

                                </p>

                                {activeFilterCount > 0 && (

                                    <button
                                        onClick={clearFilters}
                                        className="flex items-center gap-1 text-xs font-black text-red-500 hover:underline"
                                    >
                                        <X size={12} />
                                        Clear All
                                    </button>
                                )}

                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

                                <div>

                                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2 block">

                                        Paper

                                    </label>

                                    <select
                                        value={filters.paper}
                                        onChange={(e) => {
                                            setFilters({ ...filters, paper: e.target.value });
                                            setPage(1);
                                        }}
                                        className="w-full bg-brand-light border border-brand-border rounded-xl px-3 py-2.5 font-bold text-sm outline-none"
                                    >
                                        <option value="">All Papers</option>
                                        {PAPERS.map(p => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>

                                </div>

                                <div>

                                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2 block">

                                        Year

                                    </label>

                                    <select
                                        value={filters.year}
                                        onChange={(e) => {
                                            setFilters({ ...filters, year: e.target.value });
                                            setPage(1);
                                        }}
                                        className="w-full bg-brand-light border border-brand-border rounded-xl px-3 py-2.5 font-bold text-sm outline-none"
                                    >
                                        <option value="">All Years</option>
                                        {filtersMeta.years.map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>

                                </div>

                                <div>

                                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2 block">

                                        Subject

                                    </label>

                                    <select
                                        value={filters.subject}
                                        onChange={(e) => {
                                            setFilters({ ...filters, subject: e.target.value });
                                            setPage(1);
                                        }}
                                        className="w-full bg-brand-light border border-brand-border rounded-xl px-3 py-2.5 font-bold text-sm outline-none"
                                    >
                                        <option value="">All Subjects</option>
                                        {filtersMeta.subjects.map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>

                                </div>

                                <div>

                                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2 block">

                                        Difficulty

                                    </label>

                                    <select
                                        value={filters.difficulty}
                                        onChange={(e) => {
                                            setFilters({ ...filters, difficulty: e.target.value });
                                            setPage(1);
                                        }}
                                        className="w-full bg-brand-light border border-brand-border rounded-xl px-3 py-2.5 font-bold text-sm outline-none"
                                    >
                                        <option value="">All Levels</option>
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                    </select>

                                </div>

                            </div>

                        </motion.div>
                    )}

                    {/* QUESTION LIST */}

                    {loading ? (

                        <div className="bg-white rounded-3xl border border-brand-border p-16 text-center">

                            <p className="font-black text-brand-muted animate-pulse uppercase tracking-widest text-sm">

                                Loading questions...

                            </p>

                        </div>

                    ) : questions.length === 0 ? (

                        <div className="bg-white rounded-3xl border border-brand-border p-16 text-center">

                            <div className="text-6xl mb-4">📚</div>

                            <h2 className="text-2xl font-black text-brand-dark mb-2">

                                No Questions Found

                            </h2>

                            <p className="text-brand-muted font-bold text-sm">

                                {activeFilterCount > 0
                                    ? "Try adjusting your filters"
                                    : "No Mains questions in database yet"}

                            </p>

                        </div>

                    ) : (

                        <div className="space-y-4">

                            {questions.map((q) => (

                                <motion.div
                                    key={q._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`bg-white rounded-3xl border p-6 transition-all ${
                                        q.isCompleted
                                            ? "border-green-200 bg-green-50/30"
                                            : "border-brand-border"
                                    }`}
                                >

                                    {/* TAGS */}

                                    <div className="flex items-center gap-2 flex-wrap mb-4">

                                        <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 text-[10px] font-black uppercase tracking-widest">

                                            {q.paper}

                                        </span>

                                        <span className="px-2.5 py-1 rounded-full bg-brand-light text-brand-muted text-[10px] font-black uppercase tracking-widest">

                                            {q.year}

                                        </span>

                                        <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest">

                                            {q.marks} Marks

                                        </span>

                                        {q.wordLimit && (

                                            <span className="px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 text-[10px] font-black uppercase tracking-widest">

                                                {q.wordLimit} Words

                                            </span>
                                        )}

                                        {q.subjectName && (

                                            <span className="px-2.5 py-1 rounded-full bg-brand-light text-brand-dark text-[10px] font-black uppercase tracking-widest">

                                                {q.subjectName}

                                            </span>
                                        )}

                                        {q.isRepeated && (

                                            <span className="px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 text-[10px] font-black uppercase tracking-widest">

                                                Repeated

                                            </span>
                                        )}

                                    </div>

                                    {/* QUESTION TEXT */}

                                    <p className="text-base sm:text-lg font-bold text-brand-dark leading-relaxed mb-4">

                                        {q.questionText}

                                    </p>

                                    {/* TOPIC */}

                                    {q.topicName && (

                                        <p className="text-xs font-bold text-brand-muted mb-4">

                                            <span className="text-brand-accent">Topic:</span> {q.topicName}
                                            {q.subtopicName && ` • ${q.subtopicName}`}

                                        </p>
                                    )}

                                    {/* MODEL ANSWER (EXPANDABLE) */}

                                    {expandedId === q._id && q.modelAnswer && (

                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            className="bg-brand-light rounded-2xl p-4 mb-4 border border-brand-border"
                                        >

                                            <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2">

                                                Model Answer / Approach

                                            </p>

                                            <p className="text-sm text-brand-dark font-medium leading-relaxed whitespace-pre-wrap">

                                                {q.modelAnswer}

                                            </p>

                                            {q.answerKeyPoints && q.answerKeyPoints.length > 0 && (

                                                <div className="mt-4">

                                                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2">

                                                        Key Points

                                                    </p>

                                                    <ul className="space-y-1">

                                                        {q.answerKeyPoints.map((kp, i) => (

                                                            <li key={i} className="text-sm font-medium text-brand-dark flex gap-2">

                                                                <span className="text-brand-accent font-black">•</span>

                                                                <span>{kp}</span>

                                                            </li>
                                                        ))}

                                                    </ul>

                                                </div>
                                            )}

                                        </motion.div>
                                    )}

                                    {/* ACTIONS */}

                                    <div className="flex items-center gap-2 flex-wrap">

                                        <button
                                            onClick={() => toggleComplete(q._id)}
                                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                                                q.isCompleted
                                                    ? "bg-green-500 text-white"
                                                    : "bg-brand-light text-brand-dark hover:bg-green-100"
                                            }`}
                                        >

                                            {q.isCompleted ? <CheckCircle2 size={14} /> : <Circle size={14} />}

                                            {q.isCompleted ? "Done" : "Mark Done"}

                                        </button>

                                        <button
                                            onClick={() => toggleBookmark(q._id)}
                                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                                                q.isBookmarked
                                                    ? "bg-yellow-500 text-white"
                                                    : "bg-brand-light text-brand-dark hover:bg-yellow-100"
                                            }`}
                                        >

                                            <Bookmark
                                                size={14}
                                                fill={q.isBookmarked ? "currentColor" : "none"}
                                            />

                                            {q.isBookmarked ? "Saved" : "Bookmark"}

                                        </button>

                                        {q.modelAnswer && (

                                            <button
                                                onClick={() => setExpandedId(expandedId === q._id ? null : q._id)}
                                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-dark text-white font-black text-xs uppercase tracking-widest hover:bg-brand-accent transition-all"
                                            >
                                                {expandedId === q._id ? "Hide Answer" : "Show Answer"}
                                            </button>
                                        )}

                                    </div>

                                </motion.div>
                            ))}

                        </div>
                    )}

                    {/* PAGINATION */}

                    {totalPages > 1 && (

                        <div className="flex items-center justify-center gap-2 mt-8">

                            <button
                                onClick={() => setPage(p => Math.max(p - 1, 1))}
                                disabled={page === 1}
                                className="p-2 rounded-xl bg-white border border-brand-border hover:bg-brand-light disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={16} />
                            </button>

                            <span className="px-4 py-2 bg-brand-dark text-white rounded-xl font-black text-xs">

                                Page {page} / {totalPages}

                            </span>

                            <button
                                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                                disabled={page === totalPages}
                                className="p-2 rounded-xl bg-white border border-brand-border hover:bg-brand-light disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronRight size={16} />
                            </button>

                        </div>
                    )}

                </main>

                <Footer />

            </div>

        </div>
    );
}