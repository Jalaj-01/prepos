"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { motion, AnimatePresence } from "framer-motion";

import {
    Library,
    Search,
    Eye,
    FileText,
    Image as ImageIcon,
    File,
    ChevronLeft,
    ChevronRight,
    X,
    User as UserIcon,
    Trash2,
    Lock,
    Shield,
    Sparkles,
    Star,
    FolderOpen,
    LayoutGrid,
    BookOpen,
    ArrowLeft,
    Bookmark,
    BookmarkCheck
} from "lucide-react";

import Link from "next/link";

import axios from "axios";

import Sidebar from "@/components/layout/Sidebar";

import TopHeader from "@/components/layout/TopHeader";

import Footer from "@/components/layout/Footer";

import MobileNav from "@/components/layout/MobileNav";

import SecurePDFViewer from "@/components/pdf/SecurePDFViewer";

import { showToast } from "@/components/ui/Toast";

import { confirmAction } from "@/components/ui/ConfirmModal";

import { GridSkeleton } from "@/components/ui/Skeleton";

import EmptyState from "@/components/ui/EmptyState";

import PageHeader from "@/components/ui/PageHeader";

const SUBJECT_COLORS = [
    "from-blue-400 to-cyan-500",
    "from-purple-400 to-pink-500",
    "from-green-400 to-emerald-500",
    "from-orange-400 to-red-500",
    "from-yellow-400 to-orange-500",
    "from-indigo-400 to-purple-500",
    "from-pink-400 to-rose-500",
    "from-teal-400 to-cyan-500"
];

export default function CommunityLibraryLogic() {

    const router = useRouter();

    const [user, setUser] = useState(null);

    const [viewMode, setViewMode] = useState("folders");

    const [groupedData, setGroupedData] = useState([]);

    const [selectedSubject, setSelectedSubject] = useState(null);

    const [selectedTopic, setSelectedTopic] = useState(null);

    const [documents, setDocuments] = useState([]);

    const [featured, setFeatured] = useState([]);

    const [loading, setLoading] = useState(true);

    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    const [search, setSearch] = useState("");

    const [page, setPage] = useState(1);

    const [totalPages, setTotalPages] = useState(1);

    const [total, setTotal] = useState(0);

    const [viewingDoc, setViewingDoc] = useState(null);

    const [viewUrl, setViewUrl] = useState(null);

    const [watermark, setWatermark] = useState(null);

    useEffect(() => {

        const info =
            localStorage.getItem("userInfo");

        if (!info) {
            router.push("/login");
            return;
        }

        setUser(JSON.parse(info));

    }, []);

    useEffect(() => {

        if (user) {

            loadFeatured();

            if (viewMode === "folders" && !selectedSubject) {

                loadGrouped();

            } else if (viewMode === "all" || selectedSubject) {

                loadDocuments();
            }
        }

    }, [user, viewMode, selectedSubject, selectedTopic, search, page]);

    const loadGrouped = async () => {

        setLoading(true);

        try {

            const { data } = await axios.get(

                `${process.env.NEXT_PUBLIC_API_URL}/api/documents/community/grouped`,

                {
                    headers: {
                        Authorization:
                            `Bearer ${user.token}`
                    }
                }
            );

            setGroupedData(data);

        } catch (err) {

            console.error("Grouped load", err);

            showToast.error("Failed to load library");

        } finally {

            setLoading(false);
        }
    };

    const loadFeatured = async () => {

        try {

            const { data } = await axios.get(

                `${process.env.NEXT_PUBLIC_API_URL}/api/documents/community/featured?limit=4`,

                {
                    headers: {
                        Authorization:
                            `Bearer ${user.token}`
                    }
                }
            );

            setFeatured(data);

        } catch (err) {

            console.error("Featured load", err);
        }
    };

    const loadDocuments = async () => {

        setLoading(true);

        try {

            const params = {
                page,
                limit: 24
            };

            if (search) params.search = search;

            if (selectedSubject) params.subject = selectedSubject;

            if (selectedTopic) params.topic = selectedTopic;

            const { data } = await axios.get(

                `${process.env.NEXT_PUBLIC_API_URL}/api/documents/community/browse`,

                {
                    headers: {
                        Authorization:
                            `Bearer ${user.token}`
                    },
                    params
                }
            );

            setDocuments(data.documents);

            setTotal(data.total);

            setTotalPages(data.totalPages);

        } catch (err) {

            console.error("Load docs", err);

            showToast.error("Failed to load documents");

        } finally {

            setLoading(false);
        }
    };

    const openViewer = async (doc) => {

        const loadingId = showToast.loading("Loading document...");

        try {

            const { data } = await axios.get(

                `${process.env.NEXT_PUBLIC_API_URL}/api/documents/${doc._id}/view-url`,

                {
                    headers: {
                        Authorization:
                            `Bearer ${user.token}`
                    }
                }
            );

            showToast.dismiss(loadingId);

            setViewUrl(data.viewUrl);

            setWatermark(data.watermark);

            setViewingDoc(doc);

        } catch (err) {

            showToast.dismiss(loadingId);

            showToast.error(
                err.response?.data?.message ||
                "Failed to load document"
            );
        }
    };

    // =========================
    // TOGGLE BOOKMARK
    // =========================

    const toggleBookmark = async (doc) => {

        try {

            const { data } = await axios.put(

                `${process.env.NEXT_PUBLIC_API_URL}/api/documents/${doc._id}/bookmark`,

                {},

                {
                    headers: {
                        Authorization:
                            `Bearer ${user.token}`
                    }
                }
            );

            const updateFn = (d) =>
                d._id === doc._id
                    ? {
                        ...d,
                        bookmarkedBy:
                            data.isBookmarked
                                ? [...(d.bookmarkedBy || []), user._id]
                                : (d.bookmarkedBy || []).filter(b => b !== user._id)
                    }
                    : d;

            setDocuments(prev => prev.map(updateFn));

            setFeatured(prev => prev.map(updateFn));

            showToast.success(data.message);

        } catch (err) {

            showToast.error(
                err.response?.data?.message ||
                "Failed to bookmark"
            );
        }
    };

    const isBookmarked = (doc) => {

        return (doc.bookmarkedBy || []).some(b =>

            b.toString() === user._id?.toString()
        );
    };

    // =========================
    // ADMIN ACTIONS
    // =========================

    const adminToggleFeatured = async (id) => {

        try {

            const { data } = await axios.put(

                `${process.env.NEXT_PUBLIC_API_URL}/api/documents/admin/feature/${id}`,

                {},

                {
                    headers: {
                        Authorization:
                            `Bearer ${user.token}`
                    }
                }
            );

            showToast.success(data.message);

            if (selectedSubject) loadDocuments();

            loadFeatured();

            loadGrouped();

        } catch (err) {

            showToast.error(
                err.response?.data?.message ||
                "Failed to toggle featured"
            );
        }
    };

    const adminForcePrivate = async (id, title) => {

        const confirmed = await confirmAction({
            title: `Make "${title}" private?`,
            message: "[ADMIN ACTION] This document will be removed from Community Library.",
            type: "warning",
            confirmText: "Make Private",
            cancelText: "Cancel"
        });

        if (!confirmed) return;

        try {

            await axios.put(

                `${process.env.NEXT_PUBLIC_API_URL}/api/documents/admin/force-private/${id}`,

                {},

                {
                    headers: {
                        Authorization:
                            `Bearer ${user.token}`
                    }
                }
            );

            showToast.success("Document made private");

            if (selectedSubject) loadDocuments();

            loadFeatured();

            loadGrouped();

        } catch (err) {

            showToast.error("Failed to update");
        }
    };

    const adminForceDelete = async (id, title) => {

        const confirmed = await confirmAction({
            title: `Delete "${title}" forever?`,
            message: "[ADMIN ACTION] This cannot be undone. The file will be permanently removed from storage.",
            type: "danger",
            confirmText: "Delete Forever",
            cancelText: "Cancel"
        });

        if (!confirmed) return;

        try {

            await axios.delete(

                `${process.env.NEXT_PUBLIC_API_URL}/api/documents/admin/force/${id}`,

                {
                    headers: {
                        Authorization:
                            `Bearer ${user.token}`
                    }
                }
            );

            showToast.success("Document deleted");

            if (selectedSubject) loadDocuments();

            loadFeatured();

            loadGrouped();

        } catch (err) {

            showToast.error("Failed to delete");
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

    const getFileIcon = (fileType, size = 32) => {

        const props = { size, className: "shrink-0" };

        switch (fileType) {

            case "pdf":
                return <FileText {...props} className="text-red-500" />;

            case "image":
                return <ImageIcon {...props} className="text-blue-500" />;

            case "doc":
                return <FileText {...props} className="text-blue-600" />;

            case "ppt":
                return <FileText {...props} className="text-orange-500" />;

            default:
                return <File {...props} className="text-brand-muted" />;
        }
    };

    const getRelativeTime = (date) => {

        const now = new Date();

        const then = new Date(date);

        const diffMs = now - then;

        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (days === 0) return "Today";

        if (days === 1) return "Yesterday";

        if (days < 7) return `${days}d ago`;

        if (days < 30) return `${Math.floor(days / 7)}w ago`;

        return `${Math.floor(days / 30)}mo ago`;
    };

    const getSubjectColor = (index) =>
        SUBJECT_COLORS[index % SUBJECT_COLORS.length];

    if (!user) return null;

    const showingFiles =
        viewMode === "all" ||
        (viewMode === "folders" && selectedSubject);

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
                        icon={Library}
                        iconBg="bg-blue-500/10"
                        iconColor="text-blue-600"
                        title="Community Library"
                        description={
                            viewMode === "folders" && !selectedSubject
                                ? "Browse resources organized by subject"
                                : `${total > 0 ? total : "Browse"} resources from the community`
                        }
                    >
                        <Link
                            href="/vault"
                            className="flex items-center gap-2 px-4 py-2.5 bg-brand-dark text-white rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-brand-accent transition-all"
                        >
                            <FolderOpen size={14} />
                            <span className="hidden sm:inline">Go to Vault</span>
                            <span className="sm:hidden">Vault</span>
                        </Link>
                    </PageHeader>

                    {/* INFO BANNER */}

                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 flex items-start gap-2 sm:gap-3">

                        <Sparkles size={14} className="text-blue-600 shrink-0 mt-0.5" />

                        <p className="text-[11px] sm:text-xs font-bold text-blue-900 leading-relaxed">

                            <strong>Share your notes:</strong> Upload to <Link href="/vault" className="underline">Vault</Link> and click 🌍 to share — files appear here organized by subject.

                        </p>

                    </div>

                    {/* FEATURED SECTION */}

                    {featured.length > 0 && viewMode === "folders" && !selectedSubject && (

                        <div className="mb-6 sm:mb-8">

                            <div className="flex items-center gap-2 mb-3 sm:mb-4">

                                <Star size={14} className="text-yellow-500 fill-yellow-500" />

                                <h2 className="text-sm sm:text-lg font-black uppercase tracking-widest text-brand-dark">

                                    Featured

                                </h2>

                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">

                                {featured.map((d) => (

                                    <motion.div
                                        key={d._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        whileHover={{ y: -2 }}
                                        className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl sm:rounded-3xl p-4 sm:p-5 group relative cursor-pointer"
                                        onClick={() => openViewer(d)}
                                    >

                                        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-yellow-500 text-white rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest flex items-center gap-1">

                                            <Star size={9} className="fill-white" />

                                            Featured

                                        </div>

                                        <div className="mb-3">

                                            {getFileIcon(d.fileType, 28)}

                                        </div>

                                        <h3 className="font-black text-brand-dark text-xs sm:text-sm mb-1 line-clamp-2 leading-snug pr-12">

                                            {d.title}

                                        </h3>

                                        <p className="text-[10px] font-bold text-brand-muted truncate mb-3">

                                            by {d.uploadedBy?.name || "Anonymous"}

                                        </p>

                                        <div className="flex gap-2">

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openViewer(d);
                                                }}
                                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-brand-dark text-white rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-brand-accent transition-all"
                                            >
                                                <Eye size={11} />
                                                View
                                            </button>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleBookmark(d);
                                                }}
                                                title={isBookmarked(d) ? "Remove bookmark" : "Bookmark"}
                                                className={`px-3 py-2 rounded-xl text-xs font-black transition-all ${
                                                    isBookmarked(d)
                                                        ? "bg-yellow-500 text-white hover:bg-yellow-600"
                                                        : "bg-white text-yellow-700 hover:bg-yellow-100"
                                                }`}
                                            >
                                                {isBookmarked(d) ? (
                                                    <BookmarkCheck size={12} fill="currentColor" />
                                                ) : (
                                                    <Bookmark size={12} />
                                                )}
                                            </button>

                                        </div>

                                    </motion.div>
                                ))}

                            </div>

                        </div>
                    )}

                    {/* VIEW MODE TOGGLE + SEARCH */}

                    <div className="bg-white rounded-2xl sm:rounded-3xl border border-brand-border p-3 sm:p-4 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 flex-wrap">

                        {selectedSubject && (

                            <button
                                onClick={() => {
                                    setSelectedSubject(null);
                                    setSelectedTopic(null);
                                    setPage(1);
                                }}
                                className="flex items-center gap-1 px-3 py-2 bg-brand-light hover:bg-brand-dark hover:text-white rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all"
                            >
                                <ArrowLeft size={12} />
                                Back
                            </button>
                        )}

                        {!selectedSubject && (

                            <div className="flex gap-1 bg-brand-light rounded-xl p-1">

                                <button
                                    onClick={() => setViewMode("folders")}
                                    className={`px-3 py-1.5 rounded-lg font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all flex items-center gap-1.5 ${
                                        viewMode === "folders"
                                            ? "bg-brand-dark text-white"
                                            : "text-brand-muted"
                                    }`}
                                >
                                    <FolderOpen size={12} />
                                    <span className="hidden sm:inline">Folders</span>
                                </button>

                                <button
                                    onClick={() => setViewMode("all")}
                                    className={`px-3 py-1.5 rounded-lg font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all flex items-center gap-1.5 ${
                                        viewMode === "all"
                                            ? "bg-brand-dark text-white"
                                            : "text-brand-muted"
                                    }`}
                                >
                                    <LayoutGrid size={12} />
                                    <span className="hidden sm:inline">All</span>
                                </button>

                            </div>
                        )}

                        <div className="flex items-center gap-2 flex-1 min-w-[120px]">

                            <Search size={14} className="text-brand-muted shrink-0" />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                    if (e.target.value && viewMode === "folders") {
                                        setViewMode("all");
                                    }
                                }}
                                placeholder="Search..."
                                className="bg-transparent outline-none text-xs sm:text-sm font-bold flex-1 min-w-0"
                            />

                        </div>

                    </div>

                    {selectedSubject && (

                        <div className="flex items-center gap-2 mb-4 text-xs sm:text-sm font-bold overflow-x-auto">

                            <BookOpen size={12} className="text-brand-accent shrink-0" />

                            <span className="text-brand-dark truncate">{selectedSubject}</span>

                            {selectedTopic && (
                                <>
                                    <ChevronRight size={12} className="text-brand-muted shrink-0" />
                                    <span className="text-brand-dark truncate">{selectedTopic}</span>
                                </>
                            )}

                        </div>
                    )}

                    {/* CONTENT */}

                    {loading ? (

                        <GridSkeleton count={8} columns={4} />

                    ) : (

                        <>

                            {/* FOLDERS VIEW */}

                            {viewMode === "folders" && !selectedSubject && (

                                groupedData.length === 0 ? (

                                    <EmptyState
                                        emoji="📚"
                                        title="Library is Empty"
                                        description="Upload notes to your Vault and toggle them public to share with the community!"
                                        actionLabel="Go to Vault"
                                        actionHref="/vault"
                                    />

                                ) : (

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">

                                        {groupedData.map((subject, idx) => (

                                            <motion.button
                                                key={subject.subject}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                whileHover={{ y: -3 }}
                                                onClick={() => {
                                                    setSelectedSubject(subject.subject);
                                                    setPage(1);
                                                }}
                                                className="text-left bg-white border border-brand-border rounded-2xl sm:rounded-3xl p-5 sm:p-6 hover:border-brand-accent transition-all relative overflow-hidden group"
                                            >

                                                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${getSubjectColor(idx)}`} />

                                                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${getSubjectColor(idx)} flex items-center justify-center mb-3 sm:mb-4`}>
                                                    <BookOpen size={20} className="text-white" />
                                                </div>

                                                <h3 className="font-black text-base sm:text-lg text-brand-dark mb-1 line-clamp-1">
                                                    {subject.subject}
                                                </h3>

                                                <p className="text-[11px] sm:text-xs text-brand-muted font-bold mb-3">
                                                    {subject.totalFiles} file{subject.totalFiles === 1 ? "" : "s"} • {formatBytes(subject.totalSize)}
                                                </p>

                                                {subject.topics.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {subject.topics.slice(0, 3).map(t => (
                                                            t.name && (
                                                                <span key={t.name} className="text-[9px] font-black uppercase tracking-widest bg-brand-light text-brand-muted px-2 py-0.5 rounded-full">
                                                                    {t.name} ({t.count})
                                                                </span>
                                                            )
                                                        ))}
                                                        {subject.topics.length > 3 && (
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-brand-accent">
                                                                +{subject.topics.length - 3} more
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                            </motion.button>
                                        ))}

                                    </div>
                                )
                            )}

                            {/* TOPICS LIST */}

                            {selectedSubject && !selectedTopic && (() => {

                                const subjectData =
                                    groupedData.find(g => g.subject === selectedSubject);

                                const topicsWithName =
                                    subjectData?.topics.filter(t => t.name) || [];

                                const topicsWithoutName =
                                    subjectData?.topics.find(t => !t.name);

                                return (

                                    <div className="space-y-6">

                                        {topicsWithName.length > 0 && (

                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-3">
                                                    Topics ({topicsWithName.length})
                                                </p>

                                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">

                                                    {topicsWithName.map(t => (

                                                        <motion.button
                                                            key={t.name}
                                                            initial={{ opacity: 0, y: 5 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            whileHover={{ y: -2 }}
                                                            onClick={() => {
                                                                setSelectedTopic(t.name);
                                                                setPage(1);
                                                            }}
                                                            className="text-left bg-white border border-brand-border rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:border-brand-accent transition-all"
                                                        >
                                                            <div className="text-xl sm:text-2xl mb-2">📂</div>
                                                            <p className="font-black text-xs sm:text-sm text-brand-dark truncate mb-1">
                                                                {t.name}
                                                            </p>
                                                            <p className="text-[10px] font-bold text-brand-muted">
                                                                {t.count} files • {formatBytes(t.totalSize)}
                                                            </p>
                                                        </motion.button>
                                                    ))}

                                                </div>
                                            </div>
                                        )}

                                        {topicsWithoutName && (

                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-3">
                                                    General Files ({topicsWithoutName.count})
                                                </p>

                                                <button
                                                    onClick={() => {
                                                        setSelectedTopic("__no_topic__");
                                                        setPage(1);
                                                    }}
                                                    className="text-left bg-white border border-brand-border rounded-xl sm:rounded-2xl p-4 hover:border-brand-accent transition-all w-full sm:w-72"
                                                >
                                                    <div className="text-2xl mb-2">📄</div>
                                                    <p className="font-black text-sm text-brand-dark mb-1">Untagged Files</p>
                                                    <p className="text-[10px] font-bold text-brand-muted">{topicsWithoutName.count} files</p>
                                                </button>
                                            </div>
                                        )}

                                    </div>
                                );
                            })()}

                            {/* FILES VIEW */}

                            {(showingFiles && selectedTopic) || viewMode === "all" ? (

                                documents.length === 0 ? (

                                    <EmptyState
                                        emoji="📂"
                                        title="No files found"
                                        description="Try a different search or filter"
                                    />

                                ) : (

                                    <>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">

                                            {documents.map((d) => (

                                                <motion.div
                                                    key={d._id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="bg-white border border-brand-border rounded-2xl sm:rounded-3xl p-4 sm:p-5 hover:border-brand-accent transition-all group relative flex flex-col"
                                                >

                                                    <div className="mb-3 sm:mb-4 flex items-center justify-between">

                                                        {getFileIcon(d.fileType, 32)}

                                                        <div className="flex items-center gap-1">

                                                            {d.isFeatured && (
                                                                <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                                                                    <Star size={9} className="fill-current" />
                                                                    <span className="hidden sm:inline">Featured</span>
                                                                </span>
                                                            )}

                                                            <span className="text-[9px] font-black uppercase tracking-widest bg-brand-light text-brand-muted px-2 py-1 rounded-full">
                                                                {d.fileType}
                                                            </span>

                                                        </div>

                                                    </div>

                                                    <h3 className="font-black text-brand-dark text-xs sm:text-sm mb-1 line-clamp-2 leading-snug">
                                                        {d.title}
                                                    </h3>

                                                    {d.description && (
                                                        <p className="text-[11px] sm:text-xs text-brand-muted font-medium mb-3 line-clamp-2 leading-relaxed">
                                                            {d.description}
                                                        </p>
                                                    )}

                                                    {(d.subject || d.topic) && (
                                                        <div className="flex items-center gap-1.5 flex-wrap mb-3">
                                                            {d.subject && (
                                                                <span className="text-[9px] font-black uppercase tracking-widest bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                                                                    {d.subject}
                                                                </span>
                                                            )}
                                                            {d.topic && (
                                                                <span className="text-[9px] font-black uppercase tracking-widest bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                                                                    {d.topic}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}

                                                    <div className="text-[10px] font-bold text-brand-muted space-y-1 mb-3 sm:mb-4 mt-auto">

                                                        <div className="flex items-center gap-1.5">
                                                            <UserIcon size={10} />
                                                            <span className="truncate">{d.uploadedBy?.name || "Anonymous"}</span>
                                                        </div>

                                                        <div className="flex items-center justify-between">
                                                            <span>{formatBytes(d.fileSize)}</span>
                                                            <span>{getRelativeTime(d.createdAt)}</span>
                                                        </div>

                                                        {d.viewCount > 0 && (
                                                            <div className="flex items-center gap-1.5">
                                                                <Eye size={10} />
                                                                <span>{d.viewCount} views</span>
                                                            </div>
                                                        )}

                                                    </div>

                                                    <div className="flex gap-2">

                                                        <button
                                                            onClick={() => openViewer(d)}
                                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 sm:py-2.5 bg-brand-light hover:bg-brand-dark hover:text-white text-brand-dark rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all"
                                                        >
                                                            <Eye size={11} />
                                                            View
                                                        </button>

                                                        <button
                                                            onClick={() => toggleBookmark(d)}
                                                            title={isBookmarked(d) ? "Remove bookmark" : "Bookmark"}
                                                            className={`px-3 py-2 sm:py-2.5 rounded-xl text-xs font-black transition-all ${
                                                                isBookmarked(d)
                                                                    ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                                                    : "bg-brand-light text-brand-muted hover:bg-yellow-50 hover:text-yellow-600"
                                                            }`}
                                                        >
                                                            {isBookmarked(d) ? (
                                                                <BookmarkCheck size={13} fill="currentColor" />
                                                            ) : (
                                                                <Bookmark size={13} />
                                                            )}
                                                        </button>

                                                    </div>

                                                    {user.isAdmin && (

                                                        <div className="mt-2 grid grid-cols-3 gap-1">

                                                            <button
                                                                onClick={() => adminToggleFeatured(d._id)}
                                                                className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                                                    d.isFeatured
                                                                        ? "bg-yellow-500 text-white hover:bg-yellow-600"
                                                                        : "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                                                                }`}
                                                                title={d.isFeatured ? "Unfeature" : "Feature"}
                                                            >
                                                                <Star size={10} fill={d.isFeatured ? "currentColor" : "none"} />
                                                            </button>

                                                            <button
                                                                onClick={() => adminForcePrivate(d._id, d.title)}
                                                                className="flex items-center justify-center gap-1 px-2 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                                                                title="Make private"
                                                            >
                                                                <Lock size={10} />
                                                            </button>

                                                            <button
                                                                onClick={() => adminForceDelete(d._id, d.title)}
                                                                className="flex items-center justify-center gap-1 px-2 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                                                                title="Delete forever"
                                                            >
                                                                <Trash2 size={10} />
                                                            </button>

                                                        </div>
                                                    )}

                                                </motion.div>
                                            ))}

                                        </div>

                                        {totalPages > 1 && (

                                            <div className="flex items-center justify-center gap-2 mt-6 sm:mt-8">

                                                <button
                                                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                                                    disabled={page === 1}
                                                    className="p-2.5 rounded-xl bg-white border border-brand-border hover:bg-brand-light disabled:opacity-30 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronLeft size={16} />
                                                </button>

                                                <span className="px-4 py-2 bg-brand-dark text-white rounded-xl font-black text-xs">
                                                    Page {page} / {totalPages}
                                                </span>

                                                <button
                                                    onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                                                    disabled={page === totalPages}
                                                    className="p-2.5 rounded-xl bg-white border border-brand-border hover:bg-brand-light disabled:opacity-30 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronRight size={16} />
                                                </button>

                                            </div>
                                        )}

                                    </>
                                )
                            ) : null}

                        </>
                    )}

                </main>

                <Footer />

            </div>

            {/* PDF VIEWER */}

            <AnimatePresence>

                {viewingDoc && (

                    <div className="fixed inset-0 bg-brand-dark/95 z-[100] flex flex-col p-3 sm:p-4 lg:p-8">

                        <div className="flex items-center justify-between mb-3 sm:mb-4">

                            <div className="text-white flex-1 min-w-0 mr-3">

                                <div className="flex items-center gap-2 mb-1">
                                    <Shield size={12} className="text-brand-accent" />
                                    <p className="text-[10px] sm:text-xs font-bold opacity-60 uppercase tracking-widest">
                                        Community Resource
                                    </p>
                                </div>

                                <p className="font-black text-sm sm:text-lg truncate">
                                    {viewingDoc.title}
                                </p>

                                {viewingDoc.uploadedBy && (
                                    <p className="text-xs opacity-60 font-medium truncate">
                                        Shared by {viewingDoc.uploadedBy.name}
                                    </p>
                                )}

                            </div>

                            <button
                                onClick={() => {
                                    setViewingDoc(null);
                                    setViewUrl(null);
                                    setWatermark(null);
                                }}
                                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all shrink-0"
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <div className="flex-1 overflow-hidden">

                            {viewingDoc.fileType === "pdf" ? (

                                <SecurePDFViewer
                                    fileUrl={viewUrl}
                                    watermark={watermark}
                                />

                            ) : viewingDoc.fileType === "image" ? (

                                <div className="h-full flex items-center justify-center relative overflow-hidden bg-white rounded-2xl">

                                    {watermark && (
                                        <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center overflow-hidden">
                                            <div
                                                className="text-brand-dark opacity-[0.06] font-black tracking-tight whitespace-nowrap"
                                                style={{
                                                    fontSize: "80px",
                                                    transform: "rotate(-30deg)"
                                                }}
                                            >
                                                PrepOS • {watermark.userEmail}
                                            </div>
                                        </div>
                                    )}

                                    <img
                                        src={viewUrl}
                                        alt={viewingDoc.title}
                                        className="max-h-full max-w-full object-contain select-none pointer-events-none"
                                        draggable={false}
                                        onContextMenu={(e) => e.preventDefault()}
                                    />
                                </div>

                            ) : (

                                <div className="h-full bg-white rounded-2xl flex items-center justify-center">
                                    <div className="text-center">
                                        <File size={48} className="text-brand-muted mx-auto mb-4" />
                                        <p className="font-black text-brand-dark mb-2">
                                            Preview not available
                                        </p>
                                    </div>
                                </div>
                            )}

                        </div>

                    </div>
                )}

            </AnimatePresence>

        </div>
    );
}