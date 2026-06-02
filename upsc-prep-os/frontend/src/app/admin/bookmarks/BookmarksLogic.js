"use client";

import { useEffect, useState } from "react";

import { motion, AnimatePresence } from "framer-motion";

import axios from "axios";

import Link from "next/link";

import {
    Star,
    Search,
    BookOpen,
    GraduationCap,
    FileText,
    Image as ImageIcon,
    File,
    Eye,
    Trash2,
    ChevronRight,
    Bookmark,
    BookmarkCheck,
    Loader2,
    X,
    Globe
} from "lucide-react";

import Sidebar from "@/components/layout/Sidebar";

import TopHeader from "@/components/layout/TopHeader";

import Footer from "@/components/layout/Footer";

import MobileNav from "@/components/layout/MobileNav";

import { showToast } from "@/components/ui/Toast";

import { confirmAction } from "@/components/ui/ConfirmModal";

import { GridSkeleton } from "@/components/ui/Skeleton";

import EmptyState from "@/components/ui/EmptyState";

import PageHeader from "@/components/ui/PageHeader";

// =========================
// TABS
// =========================

const TABS = [

    {
        id: "prelims",
        label: "Prelims",
        icon: BookOpen,
        color: "blue"
    },

    {
        id: "mains",
        label: "Mains",
        icon: GraduationCap,
        color: "purple"
    },

    {
        id: "documents",
        label: "Documents",
        icon: FileText,
        color: "green"
    }
];

export default function BookmarksLogic() {

    const [user, setUser] = useState(null);

    const [activeTab, setActiveTab] = useState("prelims");

    const [search, setSearch] = useState("");

    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    // Prelims

    const [prelimsQuestions, setPrelimsQuestions] = useState([]);

    const [prelimsLoading, setPrelimsLoading] = useState(true);

    const [expandedQuestion, setExpandedQuestion] = useState(null);

    // Mains

    const [mainsQuestions, setMainsQuestions] = useState([]);

    const [mainsLoading, setMainsLoading] = useState(true);

    // Documents

    const [documents, setDocuments] = useState([]);

    const [docsLoading, setDocsLoading] = useState(true);

    // =========================
    // AUTH
    // =========================

    useEffect(() => {

        const info =
            localStorage.getItem("userInfo");

        if (!info) {
            window.location.href = "/login";
            return;
        }

        const parsed = JSON.parse(info);

        setUser(parsed);

        // Fetch all bookmark types in parallel

        fetchAll(parsed.token);

    }, []);

    const getConfig = (token) => ({

        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    // =========================
    // FETCH ALL BOOKMARKS
    // =========================

    const fetchAll = async (token) => {

        const config = getConfig(token);

        // Fetch all 3 types in parallel

        await Promise.all([

            fetchPrelims(config),

            fetchMains(config),

            fetchDocuments(config)
        ]);
    };

    // =========================
    // FETCH PRELIMS BOOKMARKS
    // =========================

    const fetchPrelims = async (config) => {

        setPrelimsLoading(true);

        try {

            const { data } = await axios.get(

                `${process.env.NEXT_PUBLIC_API_URL}/api/bookmarks`,

                config
            );

            setPrelimsQuestions(data);

        } catch (err) {

            console.error("Prelims bookmarks error", err);

        } finally {

            setPrelimsLoading(false);
        }
    };

    // =========================
    // FETCH MAINS BOOKMARKS
    // =========================

    const fetchMains = async (config) => {

        setMainsLoading(true);

        try {

            const { data } = await axios.get(

                `${process.env.NEXT_PUBLIC_API_URL}/api/mains/attempts/bookmarked`,

                config
            );

            setMainsQuestions(data);

        } catch (err) {

            console.error("Mains bookmarks error", err);

        } finally {

            setMainsLoading(false);
        }
    };

    // =========================
    // FETCH DOCUMENT BOOKMARKS
    // =========================

    const fetchDocuments = async (config) => {

        setDocsLoading(true);

        try {

            const { data } = await axios.get(

                `${process.env.NEXT_PUBLIC_API_URL}/api/documents/my-bookmarks`,

                config
            );

            setDocuments(data);

        } catch (err) {

            console.error("Document bookmarks error", err);

        } finally {

            setDocsLoading(false);
        }
    };

    // =========================
    // REMOVE PRELIMS BOOKMARK
    // =========================

    const removePrelims = async (questionId) => {

        const confirmed = await confirmAction({
            title: "Remove bookmark?",
            message: "This question will be removed from your bookmarks.",
            type: "warning",
            confirmText: "Remove",
            cancelText: "Keep"
        });

        if (!confirmed) return;

        try {

            await axios.put(

                `${process.env.NEXT_PUBLIC_API_URL}/api/bookmarks/${questionId}`,

                {},

                getConfig(user.token)
            );

            setPrelimsQuestions(prev =>
                prev.filter(q => q._id !== questionId)
            );

            showToast.success("Bookmark removed");

        } catch (err) {

            showToast.error("Failed to remove bookmark");
        }
    };

    // =========================
    // REMOVE MAINS BOOKMARK
    // =========================

    const removeMains = async (questionId) => {

        const confirmed = await confirmAction({
            title: "Remove bookmark?",
            message: "This Mains question will be removed from your bookmarks.",
            type: "warning",
            confirmText: "Remove",
            cancelText: "Keep"
        });

        if (!confirmed) return;

        try {

            await axios.put(

                `${process.env.NEXT_PUBLIC_API_URL}/api/mains/attempts/bookmark/${questionId}`,

                {},

                getConfig(user.token)
            );

            setMainsQuestions(prev =>
                prev.filter(q => q._id !== questionId)
            );

            showToast.success("Bookmark removed");

        } catch (err) {

            showToast.error("Failed to remove bookmark");
        }
    };

    // =========================
    // REMOVE DOCUMENT BOOKMARK
    // =========================

    const removeDocument = async (docId) => {

        const confirmed = await confirmAction({
            title: "Remove bookmark?",
            message: "This document will be removed from your bookmarks.",
            type: "warning",
            confirmText: "Remove",
            cancelText: "Keep"
        });

        if (!confirmed) return;

        try {

            await axios.put(

                `${process.env.NEXT_PUBLIC_API_URL}/api/documents/${docId}/bookmark`,

                {},

                getConfig(user.token)
            );

            setDocuments(prev =>
                prev.filter(d => d._id !== docId)
            );

            showToast.success("Bookmark removed");

        } catch (err) {

            showToast.error("Failed to remove bookmark");
        }
    };

    // =========================
    // HELPERS
    // =========================

    const formatBytes = (bytes) => {

        if (!bytes) return "0 B";

        const k = 1024;

        const sizes = ["B", "KB", "MB", "GB"];

        const i =
            Math.floor(
                Math.log(bytes) / Math.log(k)
            );

        return (
            parseFloat(
                (bytes / Math.pow(k, i)).toFixed(1)
            ) + " " + sizes[i]
        );
    };

    const getFileIcon = (fileType) => {

        switch (fileType) {

            case "pdf":
                return <FileText size={20} className="text-red-500" />;

            case "image":
                return <ImageIcon size={20} className="text-blue-500" />;

            default:
                return <File size={20} className="text-brand-muted" />;
        }
    };

    // =========================
    // FILTERED DATA
    // =========================

    const filteredPrelims =
        search
            ? prelimsQuestions.filter(q =>
                q.questionText?.toLowerCase().includes(search.toLowerCase()) ||
                q.subjectName?.toLowerCase().includes(search.toLowerCase()) ||
                q.topicName?.toLowerCase().includes(search.toLowerCase())
            )
            : prelimsQuestions;

    const filteredMains =
        search
            ? mainsQuestions.filter(q =>
                q.questionText?.toLowerCase().includes(search.toLowerCase()) ||
                q.subjectName?.toLowerCase().includes(search.toLowerCase()) ||
                q.topicName?.toLowerCase().includes(search.toLowerCase())
            )
            : mainsQuestions;

    const filteredDocs =
        search
            ? documents.filter(d =>
                d.title?.toLowerCase().includes(search.toLowerCase()) ||
                d.subject?.toLowerCase().includes(search.toLowerCase()) ||
                d.topic?.toLowerCase().includes(search.toLowerCase())
            )
            : documents;

    // Counts for tab badges

    const counts = {
        prelims: prelimsQuestions.length,
        mains: mainsQuestions.length,
        documents: documents.length
    };

    const totalBookmarks =
        counts.prelims + counts.mains + counts.documents;

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
                        icon={Bookmark}
                        iconBg="bg-yellow-500/10"
                        iconColor="text-yellow-600"
                        title="My Bookmarks"
                        description={`${totalBookmarks} items saved across your preparation`}
                    />

                    {/* TABS + SEARCH */}

                    <div className="bg-white rounded-2xl sm:rounded-3xl border border-brand-border p-3 sm:p-4 mb-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

                        {/* TABS */}

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

                                        {counts[tab.id] > 0 && (

                                            <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${
                                                isActive
                                                    ? "bg-white/20"
                                                    : "bg-brand-border"
                                            }`}>

                                                {counts[tab.id]}

                                            </span>
                                        )}

                                    </button>
                                );
                            })}

                        </div>

                        {/* SEARCH */}

                        <div className="flex items-center gap-2 flex-1 min-w-0">

                            <Search size={16} className="text-brand-muted shrink-0" />

                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search bookmarks..."
                                className="bg-transparent outline-none text-sm font-bold flex-1 min-w-0"
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

                    </div>

                    {/* ===================== */}
                    {/* TAB CONTENT */}
                    {/* ===================== */}

                    <AnimatePresence mode="wait">

                        {/* ===== PRELIMS TAB ===== */}

                        {activeTab === "prelims" && (

                            <motion.div
                                key="prelims"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >

                                {prelimsLoading ? (

                                    <GridSkeleton count={4} columns={2} />

                                ) : filteredPrelims.length === 0 ? (

                                    <EmptyState
                                        emoji="📝"
                                        title={search ? "No matching questions" : "No Prelims bookmarks yet"}
                                        description={
                                            search
                                                ? "Try a different search term"
                                                : "Bookmark questions from the Question Library to see them here"
                                        }
                                        actionLabel={!search ? "Go to Question Library" : null}
                                        actionHref="/admin/questions/question-library"
                                    />

                                ) : (

                                    <div className="space-y-4">

                                        {filteredPrelims.map((q) => (

                                            <motion.div
                                                key={q._id}
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-white rounded-2xl sm:rounded-3xl border border-brand-border p-4 sm:p-6"
                                            >

                                                {/* Tags Row */}

                                                <div className="flex items-start justify-between gap-3 mb-4">

                                                    <div className="flex items-center gap-2 flex-wrap">

                                                        <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[9px] font-black uppercase tracking-widest">

                                                            {q.year}

                                                        </span>

                                                        <span className="px-2.5 py-1 rounded-full bg-brand-light text-brand-muted text-[9px] font-black uppercase tracking-widest">

                                                            {q.paper || "GS1"}

                                                        </span>

                                                        {q.subjectName && (

                                                            <span className="px-2.5 py-1 rounded-full bg-brand-light text-brand-dark text-[9px] font-black uppercase tracking-widest">

                                                                {q.subjectName}

                                                            </span>
                                                        )}

                                                        {q.topicName && (

                                                            <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-[9px] font-black uppercase tracking-widest">

                                                                {q.topicName}

                                                            </span>
                                                        )}

                                                        {q.isRepeatedConcept && (

                                                            <span className="px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 text-[9px] font-black uppercase tracking-widest">

                                                                Repeated

                                                            </span>
                                                        )}

                                                    </div>

                                                    <button
                                                        onClick={() => removePrelims(q._id)}
                                                        title="Remove bookmark"
                                                        className="p-2 rounded-xl bg-yellow-100 text-yellow-600 hover:bg-red-100 hover:text-red-600 transition-all shrink-0"
                                                    >
                                                        <Star size={16} fill="currentColor" />
                                                    </button>

                                                </div>

                                                {/* Question */}

                                                <h2 className="text-sm sm:text-base font-bold text-brand-dark leading-relaxed mb-4">

                                                    {q.questionText}

                                                </h2>

                                                {/* Options */}

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">

                                                    {q.options?.map((opt) => (

                                                        <div
                                                            key={opt.label}
                                                            className="border border-brand-border rounded-xl p-3 text-xs sm:text-sm font-bold"
                                                        >

                                                            <span className="text-brand-accent mr-2 font-black">

                                                                {opt.label}.

                                                            </span>

                                                            {opt.text}

                                                        </div>
                                                    ))}

                                                </div>

                                                {/* Answer Toggle */}

                                                <button
                                                    onClick={() =>
                                                        setExpandedQuestion(
                                                            expandedQuestion === q._id
                                                                ? null
                                                                : q._id
                                                        )
                                                    }
                                                    className="px-4 py-2.5 rounded-xl bg-brand-dark text-white font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-brand-accent transition-all"
                                                >
                                                    {expandedQuestion === q._id
                                                        ? "Hide Answer"
                                                        : "Show Answer"}
                                                </button>

                                                {expandedQuestion === q._id && (

                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: "auto" }}
                                                        className="mt-4 border border-brand-border rounded-2xl p-4 sm:p-5 bg-brand-light"
                                                    >

                                                        <div className="mb-3">

                                                            <span className="text-[10px] uppercase font-black text-brand-muted tracking-widest">

                                                                Correct Answer

                                                            </span>

                                                            <p className="text-xl sm:text-2xl font-black text-green-600 mt-1">

                                                                {q.correctOption}

                                                            </p>

                                                        </div>

                                                        <div>

                                                            <span className="text-[10px] uppercase font-black text-brand-muted tracking-widest">

                                                                Explanation

                                                            </span>

                                                            <p className="mt-2 text-brand-dark leading-relaxed font-medium text-sm">

                                                                {q.explanation || "Explanation not available."}

                                                            </p>

                                                        </div>

                                                    </motion.div>
                                                )}

                                            </motion.div>
                                        ))}

                                    </div>
                                )}

                            </motion.div>
                        )}

                        {/* ===== MAINS TAB ===== */}

                        {activeTab === "mains" && (

                            <motion.div
                                key="mains"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >

                                {mainsLoading ? (

                                    <GridSkeleton count={4} columns={2} />

                                ) : filteredMains.length === 0 ? (

                                    <EmptyState
                                        emoji="🎓"
                                        title={search ? "No matching questions" : "No Mains bookmarks yet"}
                                        description={
                                            search
                                                ? "Try a different search term"
                                                : "Bookmark Mains questions from the Mains Library to see them here"
                                        }
                                        actionLabel={!search ? "Go to Mains Library" : null}
                                        actionHref="/mains/library"
                                    />

                                ) : (

                                    <div className="space-y-4">

                                        {filteredMains.map((q) => (

                                            <motion.div
                                                key={q._id}
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-white rounded-2xl sm:rounded-3xl border border-brand-border p-4 sm:p-6"
                                            >

                                                {/* Tags */}

                                                <div className="flex items-start justify-between gap-3 mb-4">

                                                    <div className="flex items-center gap-2 flex-wrap">

                                                        <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 text-[9px] font-black uppercase tracking-widest">

                                                            {q.paper}

                                                        </span>

                                                        <span className="px-2.5 py-1 rounded-full bg-brand-light text-brand-muted text-[9px] font-black uppercase tracking-widest">

                                                            {q.year}

                                                        </span>

                                                        <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[9px] font-black uppercase tracking-widest">

                                                            {q.marks}M • {q.wordLimit}W

                                                        </span>

                                                        {q.subjectName && (

                                                            <span className="px-2.5 py-1 rounded-full bg-brand-light text-brand-dark text-[9px] font-black uppercase tracking-widest">

                                                                {q.subjectName}

                                                            </span>
                                                        )}

                                                    </div>

                                                    <button
                                                        onClick={() => removeMains(q._id)}
                                                        title="Remove bookmark"
                                                        className="p-2 rounded-xl bg-yellow-100 text-yellow-600 hover:bg-red-100 hover:text-red-600 transition-all shrink-0"
                                                    >
                                                        <Star size={16} fill="currentColor" />
                                                    </button>

                                                </div>

                                                {/* Question */}

                                                <p className="text-sm sm:text-base font-bold text-brand-dark leading-relaxed mb-4">

                                                    {q.questionText}

                                                </p>

                                                {/* Notes (if any) */}

                                                {q.userNotes && (

                                                    <div className="bg-brand-light rounded-xl p-3 mb-4 border border-brand-border">

                                                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-1">

                                                            Your Notes

                                                        </p>

                                                        <p className="text-xs font-medium text-brand-dark leading-relaxed">

                                                            {q.userNotes}

                                                        </p>

                                                    </div>
                                                )}

                                                {/* Completion status */}

                                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                    q.isCompleted
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-orange-100 text-orange-700"
                                                }`}>

                                                    {q.isCompleted ? "✓ Done" : "⏳ Pending"}

                                                </div>

                                            </motion.div>
                                        ))}

                                    </div>
                                )}

                            </motion.div>
                        )}

                        {/* ===== DOCUMENTS TAB ===== */}

                        {activeTab === "documents" && (

                            <motion.div
                                key="documents"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >

                                {docsLoading ? (

                                    <GridSkeleton count={6} columns={3} />

                                ) : filteredDocs.length === 0 ? (

                                    <EmptyState
                                        emoji="📁"
                                        title={search ? "No matching documents" : "No Document bookmarks yet"}
                                        description={
                                            search
                                                ? "Try a different search term"
                                                : "Bookmark documents from the Community Library to see them here"
                                        }
                                        actionLabel={!search ? "Go to Community Library" : null}
                                        actionHref="/library"
                                    />

                                ) : (

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">

                                        {filteredDocs.map((d) => (

                                            <motion.div
                                                key={d._id}
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-white border border-brand-border rounded-2xl p-4 sm:p-5 hover:border-brand-accent transition-all group"
                                            >

                                                {/* Icon + type */}

                                                <div className="flex items-start justify-between mb-3">

                                                    <div className="flex items-center gap-2">

                                                        {getFileIcon(d.fileType)}

                                                        <span className="text-[9px] font-black uppercase tracking-widest bg-brand-light text-brand-muted px-2 py-1 rounded-full">

                                                            {d.fileType}

                                                        </span>

                                                    </div>

                                                    <button
                                                        onClick={() => removeDocument(d._id)}
                                                        title="Remove bookmark"
                                                        className="p-1.5 rounded-lg bg-yellow-100 text-yellow-600 hover:bg-red-100 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Star size={14} fill="currentColor" />
                                                    </button>

                                                </div>

                                                {/* Title */}

                                                <h3 className="font-black text-sm text-brand-dark mb-1 line-clamp-2 leading-snug">

                                                    {d.title}

                                                </h3>

                                                {/* Tags */}

                                                {(d.subject || d.topic) && (

                                                    <div className="flex gap-1 mb-3 flex-wrap">

                                                        {d.subject && (

                                                            <span className="text-[9px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">

                                                                {d.subject}

                                                            </span>
                                                        )}

                                                        {d.topic && (

                                                            <span className="text-[9px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">

                                                                {d.topic}

                                                            </span>
                                                        )}

                                                    </div>
                                                )}

                                                {/* Meta */}

                                                <div className="text-[10px] font-bold text-brand-muted space-y-1 mb-3">

                                                    <div className="flex items-center justify-between">

                                                        <span>{formatBytes(d.fileSize)}</span>

                                                        {d.uploadedBy?.name && (

                                                            <span>by {d.uploadedBy.name}</span>
                                                        )}

                                                    </div>

                                                    {d.viewCount > 0 && (

                                                        <div className="flex items-center gap-1">

                                                            <Eye size={10} />

                                                            <span>{d.viewCount} views</span>

                                                        </div>
                                                    )}

                                                </div>

                                                {/* View Button */}

                                                <Link
                                                    href="/library"
                                                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-brand-light hover:bg-brand-dark hover:text-white text-brand-dark rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all"
                                                >
                                                    <Eye size={11} />
                                                    View in Library
                                                </Link>

                                            </motion.div>
                                        ))}

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