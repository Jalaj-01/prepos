"use client";

import { useState, useEffect, useRef, useCallback } from "react";

import { useRouter } from "next/navigation";

import { motion, AnimatePresence } from "framer-motion";

import {
    Search,
    X,
    FileText,
    Image as ImageIcon,
    File,
    FolderOpen,
    BookOpen,
    GraduationCap,
    Loader2,
    ArrowRight,
    Command,
    Globe,
    Lock
} from "lucide-react";

import axios from "axios";

export default function GlobalSearch({
    isOpen,
    onClose
}) {

    const router = useRouter();

    const inputRef = useRef(null);

    const [query, setQuery] = useState("");

    const [results, setResults] = useState(null);

    const [loading, setLoading] = useState(false);

    const [selectedIndex, setSelectedIndex] = useState(0);

    // =========================
    // FOCUS INPUT ON OPEN
    // =========================

    useEffect(() => {

        if (isOpen) {

            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }

    }, [isOpen]);

    // =========================
    // RESET ON CLOSE
    // =========================

    useEffect(() => {

        if (!isOpen) {

            setQuery("");

            setResults(null);

            setSelectedIndex(0);
        }

    }, [isOpen]);

    // =========================
    // DEBOUNCED SEARCH
    // =========================

    useEffect(() => {

        if (!query || query.trim().length < 2) {

            setResults(null);

            return;
        }

        const timer = setTimeout(() => {

            performSearch(query);

        }, 300);

        return () => clearTimeout(timer);

    }, [query]);

    const performSearch = async (q) => {

        setLoading(true);

        try {

            const info =
                localStorage.getItem("userInfo");

            if (!info) return;

            const parsed = JSON.parse(info);

            const { data } = await axios.get(

                `${process.env.NEXT_PUBLIC_API_URL}/api/global-search/universal`,

                {
                    headers: {
                        Authorization:
                            `Bearer ${parsed.token}`
                    },

                    params: {
                        q,
                        limit: 4
                    }
                }
            );

            setResults(data.results);

        } catch (err) {

            console.error("Search error", err);

        } finally {

            setLoading(false);
        }
    };

    // =========================
    // FLAT RESULTS ARRAY (for keyboard nav)
    // =========================

    const flatResults =
        results
            ? [
                ...results.documents.map(d => ({
                    ...d,
                    type: "document",
                    href:
                        d.isMine
                            ? d.folderId
                                ? `/vault/${d.folderId}`
                                : `/vault`
                            : `/library`
                })),

                ...results.folders.map(f => ({
                    ...f,
                    type: "folder",
                    href: `/vault/${f._id}`
                })),

                ...results.prelimsQuestions.map(q => ({
                    ...q,
                    type: "prelims",
                    href: `/admin/questions/question-library`
                })),

                ...results.mainsQuestions.map(q => ({
                    ...q,
                    type: "mains",
                    href: `/mains/library`
                }))
            ]
            : [];

    // =========================
    // KEYBOARD NAVIGATION
    // =========================

    const handleKeyDown = useCallback((e) => {

        if (!isOpen) return;

        if (e.key === "Escape") {

            onClose();

            return;
        }

        if (e.key === "ArrowDown") {

            e.preventDefault();

            setSelectedIndex(prev =>
                Math.min(prev + 1, flatResults.length - 1)
            );
        }

        if (e.key === "ArrowUp") {

            e.preventDefault();

            setSelectedIndex(prev =>
                Math.max(prev - 1, 0)
            );
        }

        if (e.key === "Enter" && flatResults[selectedIndex]) {

            e.preventDefault();

            navigate(flatResults[selectedIndex]);
        }

    }, [isOpen, flatResults, selectedIndex]);

    useEffect(() => {

        window.addEventListener("keydown", handleKeyDown);

        return () =>
            window.removeEventListener("keydown", handleKeyDown);

    }, [handleKeyDown]);

    const navigate = (item) => {

        router.push(item.href);

        onClose();
    };

    const getFileIcon = (fileType) => {

        switch (fileType) {

            case "pdf":
                return <FileText size={16} className="text-red-500" />;

            case "image":
                return <ImageIcon size={16} className="text-blue-500" />;

            case "doc":
                return <FileText size={16} className="text-blue-600" />;

            case "ppt":
                return <FileText size={16} className="text-orange-500" />;

            default:
                return <File size={16} className="text-brand-muted" />;
        }
    };

    if (!isOpen) return null;

    return (

        <AnimatePresence>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-brand-dark/80 backdrop-blur-md z-[9998] flex items-start justify-center p-4 sm:p-6 pt-[10vh] sm:pt-[15vh]"
            >

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: -10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: -10 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
                >

                    {/* SEARCH INPUT */}

                    <div className="flex items-center gap-3 p-4 sm:p-5 border-b border-brand-border">

                        <Search size={20} className="text-brand-muted shrink-0" />

                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setSelectedIndex(0);
                            }}
                            placeholder="Search questions, notes, files, folders..."
                            className="flex-1 bg-transparent outline-none text-base sm:text-lg font-bold text-brand-dark min-w-0"
                        />

                        {loading && (
                            <Loader2 size={16} className="animate-spin text-brand-muted shrink-0" />
                        )}

                        <button
                            onClick={onClose}
                            className="p-1.5 hover:bg-brand-light rounded-lg text-brand-muted shrink-0"
                        >
                            <X size={18} />
                        </button>

                    </div>

                    {/* RESULTS */}

                    <div className="flex-1 overflow-y-auto">

                        {!query.trim() ? (

                            // EMPTY STATE

                            <div className="p-8 text-center">

                                <Search size={32} className="text-brand-muted mx-auto mb-3 opacity-40" />

                                <p className="text-sm font-bold text-brand-dark mb-1">

                                    Start typing to search

                                </p>

                                <p className="text-xs font-medium text-brand-muted mb-6">

                                    Find anything across PrepOS

                                </p>

                                <div className="space-y-2 max-w-xs mx-auto">

                                    <SearchHint
                                        keyword="constitution"
                                        label="Search Polity questions"
                                    />

                                    <SearchHint
                                        keyword="history notes"
                                        label="Find study material"
                                    />

                                    <SearchHint
                                        keyword="GS1"
                                        label="Filter by paper"
                                    />

                                </div>

                            </div>

                        ) : loading ? (

                            <div className="p-8 text-center">

                                <Loader2 size={24} className="animate-spin text-brand-muted mx-auto" />

                            </div>

                        ) : !results || flatResults.length === 0 ? (

                            <div className="p-8 text-center">

                                <div className="text-4xl mb-3">🔍</div>

                                <p className="text-sm font-bold text-brand-dark mb-1">

                                    No results for "{query}"

                                </p>

                                <p className="text-xs font-medium text-brand-muted">

                                    Try different keywords

                                </p>

                            </div>

                        ) : (

                            <div className="py-2">

                                {/* DOCUMENTS */}

                                {results.documents.length > 0 && (

                                    <ResultSection
                                        title="Documents"
                                        icon={FileText}
                                    >

                                        {results.documents.map((d, i) => {

                                            const globalIdx = i;

                                            return (

                                                <ResultRow
                                                    key={d._id}
                                                    isSelected={selectedIndex === globalIdx}
                                                    onClick={() => navigate(flatResults[globalIdx])}
                                                    onHover={() => setSelectedIndex(globalIdx)}
                                                >

                                                    {getFileIcon(d.fileType)}

                                                    <div className="flex-1 min-w-0">

                                                        <p className="text-sm font-black text-brand-dark truncate">
                                                            {d.title}
                                                        </p>

                                                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">

                                                            {d.isMine ? (
                                                                <span className="text-[9px] font-black uppercase tracking-widest bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                                                                    My Vault
                                                                </span>
                                                            ) : (
                                                                <span className="text-[9px] font-black uppercase tracking-widest bg-green-50 text-green-700 px-1.5 py-0.5 rounded">
                                                                    Community
                                                                </span>
                                                            )}

                                                            {d.visibility === "public" && (
                                                                <Globe size={10} className="text-green-600" />
                                                            )}

                                                            {d.subject && (
                                                                <span className="text-[9px] font-bold text-brand-muted">
                                                                    {d.subject}
                                                                </span>
                                                            )}

                                                        </div>

                                                    </div>

                                                    <ArrowRight size={12} className="text-brand-muted shrink-0" />

                                                </ResultRow>
                                            );
                                        })}

                                    </ResultSection>
                                )}

                                {/* FOLDERS */}

                                {results.folders.length > 0 && (

                                    <ResultSection
                                        title="Folders"
                                        icon={FolderOpen}
                                    >

                                        {results.folders.map((f, i) => {

                                            const globalIdx =
                                                results.documents.length + i;

                                            return (

                                                <ResultRow
                                                    key={f._id}
                                                    isSelected={selectedIndex === globalIdx}
                                                    onClick={() => navigate(flatResults[globalIdx])}
                                                    onHover={() => setSelectedIndex(globalIdx)}
                                                >

                                                    <div className="text-base">{f.icon || "📁"}</div>

                                                    <div className="flex-1 min-w-0">

                                                        <p className="text-sm font-black text-brand-dark truncate">
                                                            {f.name}
                                                        </p>

                                                        <p className="text-[10px] font-bold text-brand-muted">
                                                            Folder
                                                        </p>

                                                    </div>

                                                    <ArrowRight size={12} className="text-brand-muted shrink-0" />

                                                </ResultRow>
                                            );
                                        })}

                                    </ResultSection>
                                )}

                                {/* PRELIMS QUESTIONS */}

                                {results.prelimsQuestions.length > 0 && (

                                    <ResultSection
                                        title="Prelims Questions"
                                        icon={BookOpen}
                                    >

                                        {results.prelimsQuestions.map((q, i) => {

                                            const globalIdx =
                                                results.documents.length +
                                                results.folders.length + i;

                                            return (

                                                <ResultRow
                                                    key={q._id}
                                                    isSelected={selectedIndex === globalIdx}
                                                    onClick={() => navigate(flatResults[globalIdx])}
                                                    onHover={() => setSelectedIndex(globalIdx)}
                                                >

                                                    <BookOpen size={16} className="text-blue-500" />

                                                    <div className="flex-1 min-w-0">

                                                        <p className="text-sm font-black text-brand-dark line-clamp-1">
                                                            {q.questionText}
                                                        </p>

                                                        <div className="flex items-center gap-2 mt-0.5">

                                                            <span className="text-[9px] font-black uppercase tracking-widest bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                                                                {q.paper || "GS1"} • {q.year}
                                                            </span>

                                                            {q.subjectName && (
                                                                <span className="text-[9px] font-bold text-brand-muted">
                                                                    {q.subjectName}
                                                                </span>
                                                            )}

                                                        </div>

                                                    </div>

                                                    <ArrowRight size={12} className="text-brand-muted shrink-0" />

                                                </ResultRow>
                                            );
                                        })}

                                    </ResultSection>
                                )}

                                {/* MAINS QUESTIONS */}

                                {results.mainsQuestions.length > 0 && (

                                    <ResultSection
                                        title="Mains Questions"
                                        icon={GraduationCap}
                                    >

                                        {results.mainsQuestions.map((q, i) => {

                                            const globalIdx =
                                                results.documents.length +
                                                results.folders.length +
                                                results.prelimsQuestions.length + i;

                                            return (

                                                <ResultRow
                                                    key={q._id}
                                                    isSelected={selectedIndex === globalIdx}
                                                    onClick={() => navigate(flatResults[globalIdx])}
                                                    onHover={() => setSelectedIndex(globalIdx)}
                                                >

                                                    <GraduationCap size={16} className="text-purple-500" />

                                                    <div className="flex-1 min-w-0">

                                                        <p className="text-sm font-black text-brand-dark line-clamp-1">
                                                            {q.questionText}
                                                        </p>

                                                        <div className="flex items-center gap-2 mt-0.5">

                                                            <span className="text-[9px] font-black uppercase tracking-widest bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded">
                                                                {q.paper} • {q.year} • {q.marks}M
                                                            </span>

                                                            {q.subjectName && (
                                                                <span className="text-[9px] font-bold text-brand-muted">
                                                                    {q.subjectName}
                                                                </span>
                                                            )}

                                                        </div>

                                                    </div>

                                                    <ArrowRight size={12} className="text-brand-muted shrink-0" />

                                                </ResultRow>
                                            );
                                        })}

                                    </ResultSection>
                                )}

                            </div>
                        )}

                    </div>

                    {/* FOOTER */}

                    <div className="border-t border-brand-border p-3 flex items-center justify-between text-[10px] font-bold text-brand-muted">

                        <div className="flex items-center gap-3">

                            <span className="flex items-center gap-1">
                                <kbd className="bg-brand-light px-1.5 py-0.5 rounded text-[9px]">↑↓</kbd>
                                Navigate
                            </span>

                            <span className="flex items-center gap-1">
                                <kbd className="bg-brand-light px-1.5 py-0.5 rounded text-[9px]">↵</kbd>
                                Open
                            </span>

                            <span className="hidden sm:flex items-center gap-1">
                                <kbd className="bg-brand-light px-1.5 py-0.5 rounded text-[9px]">esc</kbd>
                                Close
                            </span>

                        </div>

                        <span className="font-black text-brand-accent uppercase tracking-widest">

                            PrepOS Search

                        </span>

                    </div>

                </motion.div>

            </motion.div>

        </AnimatePresence>
    );
}

// =========================
// HELPER COMPONENTS
// =========================

function ResultSection({ title, icon: Icon, children }) {

    return (

        <div>

            <div className="flex items-center gap-2 px-4 sm:px-5 py-2 bg-brand-light/50 sticky top-0 backdrop-blur-sm">

                <Icon size={11} className="text-brand-muted" />

                <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">

                    {title}

                </p>

            </div>

            <div>{children}</div>

        </div>
    );
}

function ResultRow({ children, isSelected, onClick, onHover }) {

    return (

        <button
            onClick={onClick}
            onMouseEnter={onHover}
            className={`w-full flex items-center gap-3 px-4 sm:px-5 py-3 transition-all text-left ${
                isSelected
                    ? "bg-brand-accent/10"
                    : "hover:bg-brand-light"
            }`}
        >
            {children}
        </button>
    );
}

function SearchHint({ keyword, label }) {

    return (

        <div className="flex items-center justify-between px-3 py-2 bg-brand-light rounded-lg">

            <span className="text-xs font-bold text-brand-dark">
                "{keyword}"
            </span>

            <span className="text-[10px] font-medium text-brand-muted">
                {label}
            </span>

        </div>
    );
}