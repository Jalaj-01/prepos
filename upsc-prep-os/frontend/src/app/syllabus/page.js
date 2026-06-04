// frontend/src/app/syllabus/page.js
"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
    BookOpenCheck,
    Search,
    Filter,
    Printer,
    Bookmark,
    Maximize2,
    Minimize2,
    Database,
    Library,
    GraduationCap,
    Target,
    ChevronDown,
} from "lucide-react";
import Fuse from "fuse.js";
import axios from "axios";

import Sidebar from "@/components/layout/Sidebar";
import TopHeader from "@/components/layout/TopHeader";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import { showToast } from "@/components/ui/Toast";

import {
    PRELIMS_SYLLABUS,
    MAINS_SYLLABUS,
    OPTIONAL_PAPERS,
    buildSearchIndex,
} from "@/lib/upscSyllabus";

import TopicNode from "@/components/syllabus/TopicNode";
import BookmarksDrawer from "@/components/syllabus/BookmarksDrawer";

const VIEWS = [
    { id: "official", label: "Official UPSC", icon: Library },
    { id: "content", label: "Our Content", icon: Database },
];

const EXAM_TABS = [
    { id: "prelims", label: "Prelims", icon: Target },
    { id: "mains", label: "Mains", icon: GraduationCap },
    { id: "optional", label: "Optional", icon: BookOpenCheck },
];

const FILTERS = [
    { id: "all", label: "All" },
    { id: "pending", label: "Not Started" },
    { id: "progress", label: "In Progress" },
    { id: "done", label: "Completed" },
];

export default function SyllabusPage() {
    const [user, setUser] = useState(null);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    const [view, setView] = useState("official");
    const [exam, setExam] = useState("prelims");
    const [activePaper, setActivePaper] = useState("gs1");
    const [selectedOptional, setSelectedOptional] =
        useState("political-science");
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [expandAll, setExpandAll] = useState(false);
    const [bookmarksOpen, setBookmarksOpen] = useState(false);

    const [taxonomyTree, setTaxonomyTree] = useState([]);
    const [progress, setProgress] = useState({});
    const [stats, setStats] = useState({
        covered: 0,
        bookmarked: 0,
        taxonomyTotal: 0,
    });
    const [loading, setLoading] = useState(true);

    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    // Load user
    useEffect(() => {
        const info = localStorage.getItem("userInfo");
        if (!info) {
            window.location.href = "/login";
            return;
        }
        setUser(JSON.parse(info));
    }, []);

    // Fetch tree + progress
    useEffect(() => {
        if (!user) return;
        const config = {
            headers: { Authorization: `Bearer ${user.token}` },
        };

        const fetchAll = async () => {
            try {
                const [treeRes, progRes, statsRes] = await Promise.all([
                    axios
                        .get(`${baseUrl}/api/syllabus/tree`, config)
                        .catch(() => ({ data: { tree: [] } })),
                    axios
                        .get(`${baseUrl}/api/syllabus/progress`, config)
                        .catch(() => ({ data: { progress: {} } })),
                    axios
                        .get(`${baseUrl}/api/syllabus/stats`, config)
                        .catch(() => ({ data: {} })),
                ]);
                setTaxonomyTree(treeRes.data.tree || []);
                setProgress(progRes.data.progress || {});
                setStats(statsRes.data || {});
            } catch (e) {
                console.warn("Syllabus fetch:", e.message);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    // Reset active paper when exam tab changes
    useEffect(() => {
        if (exam === "prelims") setActivePaper("gs1");
        if (exam === "mains") setActivePaper("essay");
    }, [exam]);

    // Build searchable index
    const searchIndex = useMemo(() => buildSearchIndex(), []);
    const fuse = useMemo(
        () =>
            new Fuse(searchIndex, {
                keys: ["text", "breadcrumb"],
                threshold: 0.35,
                ignoreLocation: true,
                includeMatches: true,
            }),
        [searchIndex]
    );

    const searchResults = useMemo(() => {
        if (!search.trim()) return null;
        return fuse.search(search.trim()).slice(0, 40);
    }, [search, fuse]);

    // Build tree for active view
    const officialTree = useMemo(() => {
        const buildOfficial = (exam, paper) => {
            // Convert official syllabus structure into TopicNode-friendly nodes
            return paper.sections.map((sec) => ({
                nodeKey: `official:${exam}.${paper.id}.${sec.id}`,
                label: sec.label,
                children: sec.topics.map((t) => ({
                    nodeKey: `official:${exam}.${paper.id}.${sec.id}.${t.id}`,
                    label: t.label,
                    subtopics: t.subtopics || [],
                })),
            }));
        };

        if (view !== "official") return [];

        if (exam === "prelims") {
            const p = PRELIMS_SYLLABUS.papers.find(
                (x) => x.id === activePaper
            );
            return p ? buildOfficial("prelims", p) : [];
        }
        if (exam === "mains") {
            const p = MAINS_SYLLABUS.papers.find(
                (x) => x.id === activePaper
            );
            return p ? buildOfficial("mains", p) : [];
        }
        return [];
    }, [view, exam, activePaper]);

    // DB taxonomy tree mapped to TopicNode format
    const contentTree = useMemo(() => {
        const map = (nodes) =>
            nodes.map((n) => ({
                nodeKey: `taxonomy:${n._id}`,
                label: n.name,
                totalCount: n.totalCount || 0,
                prelimsCount: n.prelimsCount || 0,
                mainsCount: n.mainsCount || 0,
                children: n.children ? map(n.children) : [],
            }));
        return view === "content" ? map(taxonomyTree) : [];
    }, [view, taxonomyTree]);

    const activeTree = view === "official" ? officialTree : contentTree;

    // Filtered nodes (by status)
    const filterMatches = (node) => {
        if (filter === "all") return true;
        const p = progress[node.nodeKey];
        const covered = p?.covered;
        const pct = p?.percent ?? 0;
        if (filter === "done") return covered || pct >= 100;
        if (filter === "pending") return !covered && pct === 0;
        if (filter === "progress")
            return !covered && pct > 0 && pct < 100;
        return true;
    };

    const filterTree = (nodes) => {
        if (filter === "all") return nodes;
        return nodes
            .map((n) => {
                const kids = n.children ? filterTree(n.children) : [];
                if (filterMatches(n) || kids.length > 0) {
                    return { ...n, children: kids };
                }
                return null;
            })
            .filter(Boolean);
    };

    const visibleTree = useMemo(
        () => filterTree(activeTree),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [activeTree, filter, progress]
    );

    // Mark covered / bookmarked
    const handleMark = async ({ nodeKey, nodeLabel, breadcrumb, field, value }) => {
        // Optimistic update
        setProgress((prev) => ({
            ...prev,
            [nodeKey]: {
                ...(prev[nodeKey] || {}),
                [field]: value,
                nodeLabel,
                breadcrumb,
            },
        }));

        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            await axios.post(
                `${baseUrl}/api/syllabus/mark`,
                { nodeKey, nodeLabel, breadcrumb, field, value },
                config
            );
            if (field === "bookmarked") {
                showToast.success(
                    value ? "Bookmarked" : "Bookmark removed"
                );
            }
        } catch (e) {
            showToast.error("Couldn't save change");
            // Rollback
            setProgress((prev) => ({
                ...prev,
                [nodeKey]: {
                    ...(prev[nodeKey] || {}),
                    [field]: !value,
                },
            }));
        }
    };

    if (!user) return null;

    const papersForExam =
        exam === "prelims"
            ? PRELIMS_SYLLABUS.papers
            : exam === "mains"
            ? MAINS_SYLLABUS.papers
            : [];

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

                <main className="flex-1 p-3 sm:p-6 lg:p-10 max-w-[1600px] w-full mx-auto print:p-0">
                    {/* HERO */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 sm:mb-8 print:hidden"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                            <div className="min-w-0 flex-1">
                                <p className="text-brand-muted font-bold text-xs sm:text-sm tracking-tight">
                                    UPSC Civil Services
                                </p>
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-brand-dark tracking-tighter mt-1">
                                    Syllabus
                                </h1>
                                <p className="text-brand-muted font-medium mt-2 text-xs sm:text-sm">
                                    Track every topic — Prelims, Mains &
                                    Optional. Stay focused, stay covered.
                                </p>
                            </div>

                            {/* STATS */}
                            <div className="flex items-center gap-2">
                                <StatPill
                                    label="Covered"
                                    value={stats.covered || 0}
                                    color="text-green-600 bg-green-50 border-green-100"
                                />
                                <StatPill
                                    label="Bookmarked"
                                    value={stats.bookmarked || 0}
                                    color="text-amber-600 bg-amber-50 border-amber-100"
                                    onClick={() => setBookmarksOpen(true)}
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* VIEW TOGGLE */}
                    <div className="bg-white border border-brand-border rounded-2xl p-1.5 inline-flex gap-1 mb-4 print:hidden">
                        {VIEWS.map((v) => {
                            const Icon = v.icon;
                            const active = view === v.id;
                            return (
                                <button
                                    key={v.id}
                                    onClick={() => setView(v.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                        active
                                            ? "bg-brand-dark text-white shadow-sm"
                                            : "text-brand-muted hover:text-brand-dark"
                                    }`}
                                >
                                    <Icon size={12} />
                                    {v.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* EXAM TABS — only for official view */}
                    {view === "official" && (
                        <div className="flex items-center gap-2 mb-4 print:hidden">
                            {EXAM_TABS.map((e) => {
                                const Icon = e.icon;
                                const active = exam === e.id;
                                return (
                                    <button
                                        key={e.id}
                                        onClick={() => setExam(e.id)}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
                                            active
                                                ? "bg-brand-dark text-white border-brand-dark"
                                                : "bg-white text-brand-muted border-brand-border hover:text-brand-dark hover:border-brand-accent"
                                        }`}
                                    >
                                        <Icon size={12} />
                                        {e.label}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* PAPER TABS — only for prelims/mains in official */}
                    {view === "official" &&
                        exam !== "optional" &&
                        papersForExam.length > 0 && (
                            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 print:hidden">
                                {papersForExam.map((p) => {
                                    const active = activePaper === p.id;
                                    return (
                                        <button
                                            key={p.id}
                                            onClick={() => setActivePaper(p.id)}
                                            className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all border ${
                                                active
                                                    ? "bg-brand-accent text-white border-brand-accent"
                                                    : "bg-white text-brand-muted border-brand-border hover:text-brand-dark"
                                            }`}
                                        >
                                            {p.label}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                    {/* OPTIONAL DROPDOWN */}
                    {view === "official" && exam === "optional" && (
                        <OptionalSelector
                            value={selectedOptional}
                            onChange={setSelectedOptional}
                        />
                    )}

                    {/* TOOLBAR */}
                    <div className="bg-white border border-brand-border rounded-2xl p-3 mb-4 flex flex-col lg:flex-row lg:items-center gap-3 print:hidden">
                        {/* SEARCH */}
                        <div className="relative flex-1 min-w-[200px]">
                            <Search
                                size={14}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted"
                            />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search syllabus..."
                                className="w-full pl-9 pr-3 py-2 bg-brand-light border border-brand-border rounded-xl text-xs font-bold outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all"
                            />
                        </div>

                        {/* FILTERS */}
                        <div className="flex items-center gap-1 flex-wrap">
                            <Filter
                                size={12}
                                className="text-brand-muted mr-1"
                            />
                            {FILTERS.map((f) => (
                                <button
                                    key={f.id}
                                    onClick={() => setFilter(f.id)}
                                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                                        filter === f.id
                                            ? "bg-brand-dark text-white"
                                            : "bg-brand-light text-brand-muted hover:text-brand-dark"
                                    }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        {/* ACTIONS */}
                        <div className="flex items-center gap-1.5 ml-auto">
                            <button
                                onClick={() => setExpandAll(!expandAll)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-light hover:bg-brand-border/50 rounded-lg text-[10px] font-black uppercase tracking-widest text-brand-muted hover:text-brand-dark transition-all"
                                title={
                                    expandAll ? "Collapse all" : "Expand all"
                                }
                            >
                                {expandAll ? (
                                    <Minimize2 size={12} />
                                ) : (
                                    <Maximize2 size={12} />
                                )}
                                {expandAll ? "Collapse" : "Expand"}
                            </button>
                            <button
                                onClick={() => setBookmarksOpen(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-light hover:bg-amber-50 rounded-lg text-[10px] font-black uppercase tracking-widest text-brand-muted hover:text-amber-700 transition-all"
                            >
                                <Bookmark size={12} />
                                Saved
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-light hover:bg-brand-border/50 rounded-lg text-[10px] font-black uppercase tracking-widest text-brand-muted hover:text-brand-dark transition-all"
                            >
                                <Printer size={12} />
                                Print
                            </button>
                        </div>
                    </div>

                    {/* SEARCH RESULTS */}
                    {searchResults && (
                        <div className="bg-white border border-brand-border rounded-2xl p-4 mb-4 print:hidden">
                            <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-3">
                                {searchResults.length} match
                                {searchResults.length === 1 ? "" : "es"}
                            </p>
                            <div className="space-y-1 max-h-72 overflow-y-auto">
                                {searchResults.map((r, i) => (
                                    <div
                                        key={i}
                                        className="p-2.5 hover:bg-brand-light rounded-lg"
                                    >
                                        <p className="text-xs font-black text-brand-dark">
                                            {r.item.text}
                                        </p>
                                        <p className="text-[10px] font-bold text-brand-muted mt-0.5">
                                            {r.item.breadcrumb}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TREE */}
                    <motion.div
                        key={view + exam + activePaper + expandAll}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-brand-border rounded-2xl p-4 sm:p-6 print:border-0 print:p-0"
                    >
                        {/* Optional placeholder content */}
                        {view === "official" && exam === "optional" ? (
                            <OptionalNotice optionalId={selectedOptional} />
                        ) : loading && view === "content" ? (
                            <p className="text-center text-xs font-bold text-brand-muted py-12">
                                Loading...
                            </p>
                        ) : visibleTree.length === 0 ? (
                            <p className="text-center text-xs font-bold text-brand-muted py-12">
                                No topics match the current filter.
                            </p>
                        ) : (
                            <div className="space-y-0.5">
                                {visibleTree.map((node) => (
                                    <TopicNode
                                        key={node.nodeKey}
                                        node={node}
                                        progress={progress}
                                        onMark={handleMark}
                                        searchHighlight={search.trim()}
                                    />
                                ))}
                            </div>
                        )}
                    </motion.div>
                </main>

                <Footer />
            </div>

            <BookmarksDrawer
                open={bookmarksOpen}
                onClose={() => setBookmarksOpen(false)}
                progress={progress}
            />

            {/* PRINT STYLES */}
            <style jsx global>{`
                @media print {
                    aside,
                    header,
                    footer,
                    nav {
                        display: none !important;
                    }
                    main {
                        padding: 0 !important;
                    }
                    body {
                        background: white !important;
                    }
                    .group:hover {
                        background: transparent !important;
                    }
                }
            `}</style>
        </div>
    );
}

function StatPill({ label, value, color, onClick }) {
    const Comp = onClick ? "button" : "div";
    return (
        <Comp
            onClick={onClick}
            className={`flex items-center gap-2 px-3 py-1.5 border rounded-full ${color} ${
                onClick ? "hover:opacity-80 cursor-pointer" : ""
            }`}
        >
            <span className="text-xs font-black">{value}</span>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-70">
                {label}
            </span>
        </Comp>
    );
}

function OptionalSelector({ value, onChange }) {
    const [open, setOpen] = useState(false);
    const current = OPTIONAL_PAPERS.find((o) => o.id === value);

    return (
        <div className="relative inline-block mb-4 print:hidden">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-brand-border rounded-xl text-xs font-black uppercase tracking-widest text-brand-dark hover:border-brand-accent transition-all"
            >
                {current?.label || "Select Optional"}
                <ChevronDown
                    size={14}
                    className={`transition-transform ${
                        open ? "rotate-180" : ""
                    }`}
                />
            </button>
            {open && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setOpen(false)}
                    />
                    <div className="absolute z-50 mt-2 w-80 max-h-80 overflow-y-auto bg-white border border-brand-border rounded-xl shadow-xl p-2">
                        {OPTIONAL_PAPERS.map((o) => (
                            <button
                                key={o.id}
                                onClick={() => {
                                    onChange(o.id);
                                    setOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                                    o.id === value
                                        ? "bg-brand-dark text-white"
                                        : "text-brand-dark hover:bg-brand-light"
                                }`}
                            >
                                {o.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

function OptionalNotice({ optionalId }) {
    const o = OPTIONAL_PAPERS.find((x) => x.id === optionalId);
    if (!o) return null;
    return (
        <div className="text-center py-12 px-4">
            <BookOpenCheck
                size={36}
                className="text-brand-accent mx-auto mb-3"
            />
            <h3 className="text-lg font-black text-brand-dark mb-1">
                {o.label}
            </h3>
            <p className="text-xs font-bold text-brand-muted max-w-md mx-auto leading-relaxed">
                Detailed syllabus for optional papers is published in the
                official UPSC notification. Refer to the latest UPSC CSE
                notification PDF for the complete paper structure.
            </p>
            {o.note && (
                <p className="text-[11px] font-medium text-brand-muted/80 mt-3 max-w-lg mx-auto leading-relaxed">
                    {o.note}
                </p>
            )}
            <a
                href="https://upsc.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-5 px-5 py-2.5 bg-brand-dark text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-accent transition-all"
            >
                Visit UPSC.gov.in
            </a>
        </div>
    );
}