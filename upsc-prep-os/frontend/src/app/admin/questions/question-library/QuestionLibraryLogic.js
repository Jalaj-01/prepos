"use client";

import { useEffect, useState } from "react";

import axios from "axios";
import QuestionStatusBadge from "@/components/ui/QuestionStatusBadge";
import useQuestionStatus from "@/hooks/useQuestionStatus";
import {
    Search,
    Star,
    Layers,
    X
} from "lucide-react";
import { Edit3, Trash2, CheckSquare, Square } from "lucide-react";
import QuestionEditDrawer from "@/components/admin/QuestionEditDrawer";
import DeleteQuestionsModal from "@/components/admin/DeleteQuestionsModal";

import Sidebar from "@/components/layout/Sidebar";
import TopHeader from "@/components/layout/TopHeader";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import { showToast } from "@/components/ui/Toast";
import { GridSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import QuestionImageGallery from "@/components/admin/QuestionImageGallery";
import Pagination from "@/components/ui/Pagination";
export default function QuestionLibraryLogic() {

    const [user, setUser] = useState(() => {
        if (typeof window === "undefined") return null;
        const info = localStorage.getItem("userInfo");
        return info ? JSON.parse(info) : null;
    });
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedQuestion, setExpandedQuestion] = useState(null);
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");
    const [selectedTopic, setSelectedTopic] = useState("");
    const [selectedPaper, setSelectedPaper] = useState("");
    const [search, setSearch] = useState("");
    const [repeatedOnly, setRepeatedOnly] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [deleteTarget, setDeleteTarget] = useState(null); // single question or "bulk"
    const [deleting, setDeleting] = useState(false);
    const [taxonomies, setTaxonomies] = useState([]);
    const [statusFilter, setStatusFilter] = useState("all"); // "all" | "done" | "new"
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(25);
    const [totalPages, setTotalPages] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(0);
    // PER-USER bookmark tracking

    const [bookmarkedIds, setBookmarkedIds] = useState(new Set());

    // =========================
    // AUTH
    // =========================

    useEffect(() => {

        // Avoid synchronous setState inside effect to prevent cascading renders
        const info = localStorage.getItem("userInfo");

        // Defer state update/redirection to next tick
        setTimeout(() => {
            if (!info) {
                window.location.href = "/login";
                return;
            }

            setUser(JSON.parse(info));
        }, 0);

    }, []);

    // =========================
// FETCH TAXONOMY (subjects + topics)
// =========================
useEffect(() => {
    const fetchTaxonomy = async () => {
        try {
            const { data } = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/taxonomy`
            );
            setTaxonomies(data);
        } catch (err) {
            console.warn("Taxonomy fetch failed:", err.message);
        }
    };
    fetchTaxonomy();
}, []);

    // =========================
    // FETCH QUESTIONS + BOOKMARKS
    // =========================

    // Reset to page 1 whenever filters change
useEffect(() => {
    setPage(1);
}, [
    selectedYear,
    selectedSubject,
    selectedTopic,
    selectedPaper,
    search,
    repeatedOnly,
    limit,
    statusFilter,
]);

    useEffect(() => {

        if (user) {

            fetchQuestions();

            fetchMyBookmarkIds();
        }

    }, [
        user,
        selectedYear,
        selectedSubject,
        selectedTopic,
        selectedPaper,
        search,
        repeatedOnly,
        page,
        limit,
        statusFilter, 
        ]);

    const toggleSelect = (id) => {
    setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
    });
};

const selectAll = () => {
    if (selectedIds.size === questions.length) {
        setSelectedIds(new Set());
    } else {
        setSelectedIds(new Set(questions.map((q) => q._id)));
    }
};

const handleDeleteSingle = async () => {
    if (!deleteTarget || deleteTarget === "bulk") return;
    setDeleting(true);
    try {
        await axios.delete(
            `${process.env.NEXT_PUBLIC_API_URL}/api/questions/${deleteTarget._id}`,
            { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setQuestions((qs) => qs.filter((q) => q._id !== deleteTarget._id));
        setSelectedIds((prev) => {
            const next = new Set(prev);
            next.delete(deleteTarget._id);
            return next;
        });
        showToast.success("Question deleted");
        setDeleteTarget(null);
    } catch (e) {
        showToast.error(e.response?.data?.message || "Delete failed");
    } finally {
        setDeleting(false);
    }
};

const handleBulkDelete = async () => {
    setDeleting(true);
    try {
        const ids = Array.from(selectedIds);
        const { data } = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/questions/bulk-delete`,
            { ids },
            { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setQuestions((qs) => qs.filter((q) => !selectedIds.has(q._id)));
        setSelectedIds(new Set());
        showToast.success(data.message);
        setDeleteTarget(null);
    } catch (e) {
        showToast.error(e.response?.data?.message || "Bulk delete failed");
    } finally {
        setDeleting(false);
    }
};

const handleQuestionUpdated = (updated) => {
    setQuestions((qs) =>
        qs.map((q) => (q._id === updated._id ? { ...q, ...updated } : q))
    );
};

   async function fetchQuestions() {

    try {

        setLoading(true);

        const params = { page, limit };

        if (selectedYear) params.year = selectedYear;

        if (selectedSubject) params.subject = selectedSubject;

        if (selectedTopic) params.topic = selectedTopic;

        if (selectedPaper) params.paper = selectedPaper;

        if (search) params.q = search;

        if (repeatedOnly) params.repeated = true;
        if (statusFilter !== "all") params.status = statusFilter;

        const response = await axios.get(

        `${process.env.NEXT_PUBLIC_API_URL}/api/search`,

        {
            params,
            headers: { Authorization: `Bearer ${user.token}` }
        }
    );

        // New paginated response format: { questions, pagination }
        if (response.data.questions) {
            setQuestions(response.data.questions);
            setTotalPages(response.data.pagination?.totalPages || 0);
            setTotalQuestions(response.data.pagination?.total || 0);
        } else {
            // Fallback for old non-paginated response
            setQuestions(Array.isArray(response.data) ? response.data : []);
            setTotalPages(1);
            setTotalQuestions(response.data?.length || 0);
        }

    } catch (error) {

        console.error("Failed to fetch questions", error);

        showToast.error("Failed to load questions");

    } finally {

        setLoading(false);
    }
}

    // =========================
    // FETCH USER'S BOOKMARKED IDS
    // =========================

    const fetchMyBookmarkIds = async () => {

        try {

            const { data } = await axios.get(

                `${process.env.NEXT_PUBLIC_API_URL}/api/bookmarks`,

                {
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    }
                }
            );

            // Create a Set of bookmarked question IDs for fast lookup

            const ids = new Set(
                data.map(q => q._id)
            );

            setBookmarkedIds(ids);

        } catch (error) {

            console.error("Failed to fetch bookmark IDs", error);
        }
    };

    // =========================
    // TOGGLE BOOKMARK (PER-USER)
    // =========================

  const toggleBookmark = async (questionId) => {

    try {

        const { data } = await axios.put(

            `${process.env.NEXT_PUBLIC_API_URL}/api/bookmarks/${questionId}`,

            {},

            {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            }
        );

        // Update local state

        setBookmarkedIds(prev => {

            const newSet = new Set(prev);

            if (data.isBookmarked) {

                newSet.add(questionId);

            } else {

                newSet.delete(questionId);
            }

            return newSet;
        });

        // Show toast OUTSIDE the state updater

        if (data.isBookmarked) {

            showToast.success("Bookmarked!");

        } else {

            showToast.success("Bookmark removed");
        }

    } catch (error) {

        console.error("Bookmark failed", error);

        showToast.error("Failed to bookmark");
    }
};

    // =========================
    // SAVE TO PRACTICE SET
    // =========================

    const saveToPracticeSet = async (questionId) => {

        const title = prompt("Practice Set Name");

        if (!title) return;

        try {

            await axios.post(

                `${process.env.NEXT_PUBLIC_API_URL}/api/practice-sets`,

                {
                    title,
                    description: "Saved from Question Library",
                    questions: [questionId]
                },

                {
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    }
                }
            );

            showToast.success("Saved to Practice Set!");

        } catch (error) {

            console.error("Save failed", error);

            showToast.error("Failed to save");
        }
    };
    // ─── Fetch attempted status across ALL matching questions (whole pool, not just page) ───
const { isAttempted, totals } = useQuestionStatus(
    {
        year: selectedYear,
        subject: selectedSubject,
        topic: selectedTopic,
        paper: selectedPaper,
        q: search,
        repeated: repeatedOnly,
    },
    user?.token
);

// ─── Apply Done/New filter to the CURRENT PAGE only ───
const visibleQuestions = questions.filter((q) => {
    if (statusFilter === "done") return isAttempted(q._id);
    if (statusFilter === "new") return !isAttempted(q._id);
    return true;
});

// ─── True totals across whole pool (from backend) ───
const doneCount = totals.attempted;
const newCount = totals.notAttempted;
const allCount = totals.total;

    // =========================
    // CHECK IF BOOKMARKED
    // =========================

    const isBookmarked = (questionId) => {

        return bookmarkedIds.has(questionId);
    };

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
                        icon={Search}
                        iconBg="bg-brand-accent/10"
                        iconColor="text-brand-accent"
                        title="Question Library"
                        description="Explore UPSC PYQs by year, subject, topic, and paper."
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">

                        {/* SIDEBAR FILTERS */}

                        <div className="lg:col-span-3">

                            {/* <div className="bg-white rounded-2xl sm:rounded-3xl border border-brand-border p-4 sm:p-6 lg:sticky lg:top-24"> */}
                            <div className="bg-white rounded-2xl sm:rounded-3xl border border-brand-border p-4 sm:p-6 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto custom-scrollbar">

                                <h2 className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-4 sm:mb-6">

                                    Filters

                                </h2>

                                {/* YEAR */}

                                <div className="mb-4 sm:mb-6">

                                    <label className="text-[10px] font-black uppercase text-brand-muted mb-2 block">

                                        Year

                                    </label>

                                    <select
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(e.target.value)}
                                        className="w-full rounded-xl border border-brand-border px-3 py-2.5 bg-brand-light font-bold text-sm"
                                    >
                                        <option value="">All Years</option>
                                        {[2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017].map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>

                                </div>

                                {/* PAPER */}

                                <div className="mb-4 sm:mb-6">

                                    <label className="text-[10px] font-black uppercase text-brand-muted mb-2 block">

                                        Paper

                                    </label>

                                    <select
                                        value={selectedPaper}
                                        onChange={(e) => setSelectedPaper(e.target.value)}
                                        className="w-full rounded-xl border border-brand-border px-3 py-2.5 bg-brand-light font-bold text-sm"
                                    >
                                        <option value="">All Papers</option>
                                        <option value="GS1">GS1</option>
                                        <option value="CSAT">CSAT</option>
                                    </select>

                                </div>

                                {/* SUBJECT */}

<div className="mb-4 sm:mb-6">
    <label className="text-[10px] font-black uppercase text-brand-muted mb-2 block">
        Subject
    </label>
    <select
        value={selectedSubject}
        onChange={(e) => {
            setSelectedSubject(e.target.value);
            setSelectedTopic(""); // reset topic when subject changes
        }}
        className="w-full rounded-xl border border-brand-border px-3 py-2.5 bg-brand-light font-bold text-sm cursor-pointer outline-none focus:border-brand-accent transition-all"
    >
        <option value="">All Subjects</option>
        {taxonomies
            .filter((t) => t.level === "subject")
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((s) => (
                <option key={s._id} value={s.name}>
                    {s.name}
                </option>
            ))}
    </select>
</div>

{/* TOPIC */}

<div className="mb-4 sm:mb-6">
    <label className="text-[10px] font-black uppercase text-brand-muted mb-2 block">
        Topic
    </label>
    <select
        value={selectedTopic}
        onChange={(e) => setSelectedTopic(e.target.value)}
        disabled={!selectedSubject}
        className="w-full rounded-xl border border-brand-border px-3 py-2.5 bg-brand-light font-bold text-sm cursor-pointer outline-none focus:border-brand-accent transition-all disabled:opacity-40 disabled:cursor-not-allowed"
    >
        <option value="">
            {selectedSubject ? "All Topics" : "Pick subject first"}
        </option>
        {taxonomies
            .filter((t) => {
                if (t.level !== "topic") return false;
                if (!selectedSubject) return false;
                // Match by parent subject NAME (since selectedSubject stores name not id)
                const parent = taxonomies.find(
                    (p) => p._id === (t.parentId?._id || t.parentId)
                );
                return parent?.name === selectedSubject;
            })
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((t) => (
                <option key={t._id} value={t.name}>
                    {t.name}
                </option>
            ))}
    </select>
</div>

{/* STATUS FILTER */}
<div className="mb-4 sm:mb-6">
    <label className="text-[10px] font-black uppercase text-brand-muted mb-2 block">
        Status
    </label>
    <div className="flex flex-col gap-1.5">
        {[
            { id: "all", label: "All", count: allCount || totalQuestions || questions.length },
            { id: "new", label: "Not Attempted", count: newCount },
            { id: "done", label: "Attempted", count: doneCount },
        ].map((f) => (
            <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                    statusFilter === f.id
                        ? "bg-brand-dark text-white"
                        : "bg-brand-light text-brand-muted hover:text-brand-dark"
                }`}
            >
                <span>{f.label}</span>
                <span className="opacity-70 text-[10px]">{f.count}</span>
            </button>
        ))}
    </div>
</div>

                                {/* REPEATED ONLY */}

                                <label className="flex items-center gap-3 cursor-pointer p-3 bg-brand-light rounded-xl border border-brand-border">

                                    <input
                                        type="checkbox"
                                        checked={repeatedOnly}
                                        onChange={() => setRepeatedOnly(!repeatedOnly)}
                                        className="w-4 h-4 accent-brand-dark"
                                    />

                                    <span className="font-bold text-xs text-brand-dark uppercase tracking-wider">

                                        Repeated Only

                                    </span>

                                </label>

                            </div>

                        </div>

                        {/* MAIN CONTENT */}

                        <div className="lg:col-span-9">

                            {/* SEARCH */}

                            <div className="bg-white rounded-2xl sm:rounded-3xl border border-brand-border p-3 sm:p-4 mb-4 sm:mb-6 flex items-center gap-3">

                                <Search size={18} className="text-brand-muted shrink-0" />

                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search questions..."
                                    className="w-full outline-none bg-transparent font-bold text-sm min-w-0"
                                />

                                {search && (

                                    <button
                                        onClick={() => setSearch("")}
                                        className="p-1 hover:bg-brand-light rounded-lg"
                                    >
                                        <X size={14} className="text-brand-muted" />
                                    </button>
                                )}

                            </div>

                            {/* QUESTIONS LIST */}
                            {user.isAdmin && questions.length > 0 && (
    <div className="bg-white border border-brand-border rounded-2xl p-3 mb-4 flex items-center justify-between gap-3 flex-wrap">
        <button
            onClick={selectAll}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest text-brand-muted hover:bg-brand-light hover:text-brand-dark transition-colors"
        >
            {selectedIds.size === questions.length && questions.length > 0 ? (
                <CheckSquare size={14} />
            ) : (
                <Square size={14} />
            )}
            {selectedIds.size === questions.length && questions.length > 0
                ? "Deselect all"
                : "Select all"}
        </button>

        {selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
                <span className="text-xs font-black text-brand-dark">
                    {selectedIds.size} selected
                </span>
                <button
                    onClick={() => setDeleteTarget("bulk")}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-colors"
                >
                    <Trash2 size={12} />
                    Delete {selectedIds.size}
                </button>
            </div>
        )}
    </div>
)}

                           {loading ? (

    <GridSkeleton count={4} columns={2} />

) : questions.length === 0 ? (

    <EmptyState
        emoji="📭"
        title="No Questions Found"
        description="No questions match the selected filters. Try changing the year, paper, subject, topic, or search query."
    />

) : visibleQuestions.length === 0 ? (

    <EmptyState
        emoji="✨"
        title={
            statusFilter === "done"
                ? "No solved questions yet"
                : statusFilter === "new"
                ? "All caught up!"
                : "No Questions Found"
        }
        description={
            statusFilter === "done"
                ? "Start practicing to see your solved questions here."
                : statusFilter === "new"
                ? "You've attempted every question matching these filters."
                : "Try changing the filters."
        }
    />

) : (

    <div className="space-y-4 sm:space-y-6">

        {visibleQuestions.map((q) => (

                                        <div
                                            key={q._id}
                                            className="bg-white rounded-2xl sm:rounded-3xl border border-brand-border p-4 sm:p-6"
                                        >

                                            {/* HEADER */}

                                            <div className="flex items-start justify-between gap-3 mb-4 sm:mb-6">

                                                {/* TAGS */}

                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {/* Status badge — first for prominence */}
                                                        <QuestionStatusBadge attempted={isAttempted(q._id)} />          

                                                    <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[9px] font-black uppercase tracking-widest">

                                                        {q.year}

                                                    </span>

                                                    <span className="px-2.5 py-1 rounded-full bg-brand-light text-brand-muted text-[9px] font-black uppercase tracking-widest">

                                                        {q.paper || "GS1"}

                                                    </span>

                                                    <span className="px-2.5 py-1 rounded-full bg-brand-light text-brand-dark text-[9px] font-black uppercase tracking-widest">

                                                        {q.subjectName || "General"}

                                                    </span>

                                                    <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-[9px] font-black uppercase tracking-widest">

                                                        {q.topicName || "Mixed"}

                                                    </span>

                                                    {q.isRepeatedConcept && (

                                                        <span className="px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 text-[9px] font-black uppercase tracking-widest">

                                                            Repeated

                                                        </span>
                                                    )}

                                                </div>

                                                {/* BOOKMARK STAR (PER-USER) */}

                                                <div className="flex items-center gap-1.5 shrink-0">
    {/* Admin: select checkbox */}
    {user.isAdmin && (
        <button
            onClick={() => toggleSelect(q._id)}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center transition-all ${
                selectedIds.has(q._id)
                    ? "bg-brand-dark border-brand-dark text-white"
                    : "bg-white border-brand-border text-brand-muted hover:border-brand-dark hover:text-brand-dark"
            }`}
            title={selectedIds.has(q._id) ? "Deselect" : "Select"}
        >
            {selectedIds.has(q._id) ? (
                <CheckSquare size={16} />
            ) : (
                <Square size={16} />
            )}
        </button>
    )}

    {/* Admin: edit button */}
    {user.isAdmin && (
        <button
            onClick={() => setEditingQuestion(q)}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-brand-border bg-white text-brand-muted hover:border-blue-500 hover:text-blue-600 flex items-center justify-center transition-all"
            title="Edit question"
        >
            <Edit3 size={15} />
        </button>
    )}

    {/* Admin: delete button */}
    {user.isAdmin && (
        <button
            onClick={() => setDeleteTarget(q)}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-brand-border bg-white text-brand-muted hover:border-red-500 hover:text-red-600 flex items-center justify-center transition-all"
            title="Delete question"
        >
            <Trash2 size={15} />
        </button>
    )}

    {/* Bookmark star — for all users */}
    <button
        onClick={() => toggleBookmark(q._id)}
        title={isBookmarked(q._id) ? "Remove bookmark" : "Bookmark"}
        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl border flex items-center justify-center transition-all ${
            isBookmarked(q._id)
                ? "bg-yellow-100 border-yellow-300 text-yellow-600"
                : "bg-white border-brand-border text-brand-muted hover:border-yellow-300 hover:text-yellow-600"
        }`}
    >
        <Star
            size={18}
            fill={isBookmarked(q._id) ? "currentColor" : "none"}
        />
    </button>
</div>

                                            </div>

                                         

                                           {/* QUESTION TEXT */}

<h2 className="text-base sm:text-xl font-black text-brand-dark leading-relaxed mb-4 sm:mb-6 whitespace-pre-wrap">

    {q.questionText}

</h2>
                                            {/* IMAGES — for map/chart/diagram questions */}
{q.images?.length > 0 && (
    <div className="mb-4 sm:mb-6">
        <QuestionImageGallery images={q.images} readOnly />
    </div>
)}

                                            {/* OPTIONS */}

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">

                                                {q.options?.map((option) => (

                                                    <div
                                                        key={option.label}
                                                        className="border border-brand-border rounded-xl sm:rounded-2xl p-3 sm:p-4 font-bold text-sm"
                                                    >
                                                        <span className="text-brand-accent mr-2 font-black">

                                                            {option.label}.

                                                        </span>

                                                        {option.text}

                                                    </div>
                                                ))}

                                            </div>

                                            {/* ACTION BUTTONS */}

                                            <div className="mt-4 sm:mt-6 flex flex-wrap gap-2 sm:gap-3">

                                                <button
                                                    onClick={() =>
                                                        setExpandedQuestion(
                                                            expandedQuestion === q._id
                                                                ? null
                                                                : q._id
                                                        )
                                                    }
                                                    className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-brand-dark text-white font-bold text-xs sm:text-sm hover:opacity-90 transition-all"
                                                >
                                                    {expandedQuestion === q._id
                                                        ? "Hide Explanation"
                                                        : "Show Answer & Explanation"}
                                                </button>

                                                <button
                                                    onClick={() => saveToPracticeSet(q._id)}
                                                    className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-brand-accent text-white font-bold text-xs sm:text-sm hover:opacity-90 transition-all inline-flex items-center gap-2"
                                                >
                                                    <Layers size={14} />
                                                    <span className="hidden sm:inline">Save To Practice Set</span>
                                                    <span className="sm:hidden">Save</span>
                                                </button>

                                            </div>

                                            {/* EXPANDED ANSWER */}

                                            {expandedQuestion === q._id && (

                                                <div className="mt-4 border border-brand-border rounded-2xl sm:rounded-3xl p-4 sm:p-6 bg-brand-light">

                                                    <div className="mb-4">

                                                        <span className="text-[10px] uppercase font-black text-brand-muted tracking-widest">

                                                            Correct Answer

                                                        </span>

                                                        <h3 className="text-xl sm:text-2xl font-black text-green-600 mt-1">

                                                            {q.correctOption}

                                                        </h3>

                                                    </div>

                                                    <div>

                                                        <span className="text-[10px] uppercase font-black text-brand-muted tracking-widest">

                                                            Explanation

                                                        </span>

                                                        <p className="mt-2 text-brand-dark leading-relaxed font-medium text-sm">

                                                            {q.explanation || "Explanation not available."}

                                                        </p>

                                                    </div>

                                                </div>
                                            )}

                                        </div>
                                    ))}

                                </div>
                            )}
                            {/* PAGINATION */}
                            {totalPages > 0 && !loading && (
                                <div className="mt-4 sm:mt-6">
                                    <Pagination
                                        page={page}
                                        totalPages={totalPages}
                                        total={totalQuestions}
                                        limit={limit}
                                        onPageChange={(p) => {
                                            setPage(p);
                                            // Scroll to top of list for better UX
                                            window.scrollTo({
                                                top: 0,
                                                behavior: "smooth",
                                            });
                                        }}
                                        onLimitChange={(l) => {
                                            setLimit(l);
                                            setPage(1);
                                        }}
                                    />
                                </div>
                            )}

                        </div>

                    </div>

                </main>

                <Footer />

            </div>
            <QuestionEditDrawer
    open={!!editingQuestion}
    question={editingQuestion}
    onClose={() => setEditingQuestion(null)}
    onSaved={handleQuestionUpdated}
    token={user?.token}
/>

<DeleteQuestionsModal
    open={!!deleteTarget}
    count={deleteTarget === "bulk" ? selectedIds.size : 1}
    onClose={() => setDeleteTarget(null)}
    onConfirm={
        deleteTarget === "bulk" ? handleBulkDelete : handleDeleteSingle
    }
    loading={deleting}
/>

        </div>
    );
}