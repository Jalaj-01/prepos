"use client";

import {
    useState,
    useEffect,
    Suspense,
    useMemo
} from "react";

import {
    motion,
    AnimatePresence
} from "framer-motion";

import {
    Book,
    Calendar,
    Play,
    ArrowLeft,
    Layers,
    Hash,
    Loader2,
    Minus,
    Plus
} from "lucide-react";

import axios from "axios";

import { useRouter, useSearchParams } from "next/navigation";

import Link from "next/link";

import Sidebar from "@/components/layout/Sidebar";
import TopHeader from "@/components/layout/TopHeader";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";

import { showToast } from "@/components/ui/Toast";

// =========================
// CONSTANTS
// =========================

const PRESET_LIMITS = [5, 10, 20, 50];

const MIN_LIMIT = 1;
const MAX_LIMIT = 200;

// =========================
// INNER COMPONENT
// =========================

function PracticeSetupContent() {

    const router = useRouter();
    const searchParams = useSearchParams();
    const initialMode = searchParams.get("mode") || "GS";

    // =========================
    // STATE
    // =========================

    const [user, setUser] = useState(null);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    const [mode, setMode] = useState(initialMode);
    const [taxonomies, setTaxonomies] = useState([]);
    const [availableYears, setAvailableYears] = useState([]);

    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [selectedTopics, setSelectedTopics] = useState([]);
    const [selectedYears, setSelectedYears] = useState([]);
    const [limit, setLimit] = useState(10);
    const [customInput, setCustomInput] = useState("");

    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);

    // =========================
    // AUTH GUARD
    // =========================

    useEffect(() => {
        const info = localStorage.getItem("userInfo");
        if (!info) {
            window.location.href = "/login";
            return;
        }
        setUser(JSON.parse(info));
    }, []);

    // =========================
    // FETCH TAXONOMY + FILTERS
    // =========================

    useEffect(() => {
        const fetchData = async () => {
            try {
                setFetchingData(true);

                const [taxRes, filtersRes] = await Promise.all([
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/taxonomy`),
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/questions/filters`)
                ]);

                setTaxonomies(taxRes.data || []);
                setAvailableYears(filtersRes.data?.years || []);

            } catch (error) {
                console.error("Setup Data Fetch Error:", error);
                showToast.error("Failed to load setup data");
            } finally {
                setFetchingData(false);
            }
        };

        if (user) fetchData();
    }, [user]);

    // =========================
    // DERIVED
    // =========================

    const subjects = useMemo(
        () => taxonomies.filter(t => t.level === "subject"),
        [taxonomies]
    );

    const topicsBySubject = useMemo(() => {
        const map = {};
        subjects.forEach(s => {
            map[s._id] = taxonomies.filter(
                t => t.parentId?._id === s._id || t.parentId === s._id
            );
        });
        return map;
    }, [subjects, taxonomies]);

    const isPreset = PRESET_LIMITS.includes(limit);

    // =========================
    // TOGGLE HELPER
    // =========================

    const toggle = (list, setList, id) => {
        if (list.includes(id)) {
            setList(list.filter(i => i !== id));
        } else {
            setList([...list, id]);
        }
    };

    // =========================
    // QUICK ACTIONS
    // =========================

    const selectAllYears = () => setSelectedYears([...availableYears]);
    const clearYears = () => setSelectedYears([]);

    const selectAllSubjects = () => setSelectedSubjects(subjects.map(s => s._id));
    const clearSubjects = () => {
        setSelectedSubjects([]);
        setSelectedTopics([]);
    };

    // =========================
    // LIMIT HANDLERS
    // =========================

    const handleCustomInput = (val) => {
        const cleaned = val.replace(/\D/g, "");
        setCustomInput(cleaned);

        if (cleaned === "") return;

        let num = parseInt(cleaned, 10);
        if (num > MAX_LIMIT) num = MAX_LIMIT;
        if (num < MIN_LIMIT) num = MIN_LIMIT;
        setLimit(num);
    };

    const handleCustomBlur = () => {
        if (customInput === "" || parseInt(customInput, 10) < MIN_LIMIT) {
            setCustomInput(String(MIN_LIMIT));
            setLimit(MIN_LIMIT);
        }
    };

    const incrementLimit = () => {
        const next = Math.min(limit + 1, MAX_LIMIT);
        setLimit(next);
        setCustomInput(String(next));
    };

    const decrementLimit = () => {
        const next = Math.max(limit - 1, MIN_LIMIT);
        setLimit(next);
        setCustomInput(String(next));
    };

    const selectPreset = (val) => {
        setLimit(val);
        setCustomInput("");
    };

    // =========================
    // START PRACTICE
    // =========================

    const startPractice = async () => {
        if (limit < MIN_LIMIT || limit > MAX_LIMIT) {
            showToast.error(`Daily target must be between ${MIN_LIMIT} and ${MAX_LIMIT}`);
            return;
        }

        try {
            setLoading(true);

            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/preparation-track/create`,
                {
                    title: `Daily ${mode} Preparation`,
                    mode,
                    selectedYears,
                    selectedSubjects,
                    selectedTopics,
                    dailyQuestionTarget: limit
                },
                {
                    headers: { Authorization: `Bearer ${user.token}` }
                }
            );

            showToast.success("Track created — let's go!");
            router.push(`/practice?mode=${mode}`);

        } catch (error) {
            console.error("Track Creation Error:", error);
            showToast.error(
                error.response?.data?.message || "Failed to create track"
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // LOADING
    // =========================

    if (!user || fetchingData) {
        return (
            <div className="min-h-screen bg-brand-light flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-brand-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-sm font-black text-brand-muted uppercase tracking-widest">
                        Loading Setup...
                    </p>
                </div>
            </div>
        );
    }

    const totalSelections =
        selectedYears.length + selectedSubjects.length + selectedTopics.length;

    // =========================
    // UI
    // =========================

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

                <main className="flex-1 p-4 sm:p-6 md:p-10 pb-28 md:pb-10">

                    <div className="max-w-6xl mx-auto">

                        {/* BACK */}
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 text-brand-muted hover:text-brand-dark mb-8 font-bold text-xs sm:text-sm transition-colors group"
                        >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Dashboard
                        </Link>

                        {/* HEADER */}
                        <motion.header
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-10 sm:mb-12"
                        >
                            <div className="flex items-start justify-between gap-4 flex-wrap">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-3">
                                        Customize Practice
                                    </p>
                                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-dark tracking-tighter leading-none">
                                        Build Your Track
                                    </h1>
                                    <p className="text-brand-muted font-medium mt-3 text-sm sm:text-base max-w-xl">
                                        Pick years, subjects & topics. Leave any section empty to include everything.
                                    </p>
                                </div>

                                {/* MODE TOGGLE */}
                                <div className="bg-white border border-brand-border rounded-2xl p-1 flex">
                                    {["GS", "CSAT"].map(m => (
                                        <button
                                            key={m}
                                            onClick={() => setMode(m)}
                                            className={`px-5 sm:px-7 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                                mode === m
                                                    ? "bg-brand-dark text-white"
                                                    : "text-brand-muted hover:text-brand-dark"
                                            }`}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.header>

                        {/* GRID */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

                            {/* LEFT: SELECTIONS */}
                            <div className="lg:col-span-2 space-y-4 sm:space-y-6">

                               {/* QUESTION COUNT — COMPACT */}
<motion.section
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.05 }}
    className="bg-white p-6 sm:p-7 rounded-3xl border border-brand-border shadow-sm"
>
    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-brand-muted flex items-center gap-2">
            <Hash size={14} className="text-brand-accent" />
            Daily Question Target
        </h2>
        {!isPreset && (
            <span className="text-[9px] font-black uppercase tracking-widest text-brand-accent">
                Custom · {limit}
            </span>
        )}
    </div>

    {/* COMBINED ROW: PRESETS + STEPPER INPUT */}
    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">

        {/* PRESETS */}
        <div className="flex gap-2 flex-1 min-w-0">
            {PRESET_LIMITS.map(val => {
                const active = limit === val;
                return (
                    <button
                        key={val}
                        onClick={() => selectPreset(val)}
                        className={`flex-1 h-12 rounded-xl text-sm font-black border-2 transition-all ${
                            active
                                ? "bg-brand-dark text-white border-brand-dark"
                                : "bg-white border-brand-border text-brand-dark hover:border-brand-dark"
                        }`}
                    >
                        {val}
                    </button>
                );
            })}
        </div>

        {/* DIVIDER */}
        <span className="hidden sm:block text-[9px] font-black uppercase tracking-widest text-brand-muted px-1">
            Or
        </span>

        {/* STEPPER + INPUT */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <button
                onClick={decrementLimit}
                disabled={limit <= MIN_LIMIT}
                className="w-10 h-12 rounded-xl border border-brand-border flex items-center justify-center text-brand-dark hover:border-brand-dark hover:bg-brand-light disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0"
            >
                <Minus size={14} strokeWidth={2.5} />
            </button>

            <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={customInput !== "" ? customInput : limit}
                onChange={(e) => handleCustomInput(e.target.value)}
                onBlur={handleCustomBlur}
                onFocus={(e) => e.target.select()}
                className="w-full sm:w-20 h-12 px-2 rounded-xl border border-brand-border bg-white text-center text-sm font-black text-brand-dark focus:border-brand-dark focus:outline-none transition-all"
            />

            <button
                onClick={incrementLimit}
                disabled={limit >= MAX_LIMIT}
                className="w-10 h-12 rounded-xl border border-brand-border flex items-center justify-center text-brand-dark hover:border-brand-dark hover:bg-brand-light disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0"
            >
                <Plus size={14} strokeWidth={2.5} />
            </button>
        </div>
    </div>

    <p className="text-[10px] text-brand-muted font-bold mt-3">
        Range: {MIN_LIMIT}–{MAX_LIMIT} questions per day
    </p>
</motion.section>

                                {/* YEARS */}
                                <motion.section
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-border shadow-sm"
                                >
                                    <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
                                        <h2 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-brand-muted flex items-center gap-2">
                                            <Calendar size={14} className="text-brand-accent" />
                                            Years
                                            {selectedYears.length > 0 && (
                                                <span className="ml-1 px-2 py-0.5 bg-brand-dark text-white rounded-full text-[9px]">
                                                    {selectedYears.length}
                                                </span>
                                            )}
                                        </h2>
                                        <div className="flex gap-3 items-center">
                                            <button
                                                onClick={selectAllYears}
                                                className="text-[10px] font-black uppercase tracking-widest text-brand-dark hover:text-brand-accent transition-colors"
                                            >
                                                Select All
                                            </button>
                                            <span className="w-px h-3 bg-brand-border" />
                                            <button
                                                onClick={clearYears}
                                                className="text-[10px] font-black uppercase tracking-widest text-brand-muted hover:text-brand-dark transition-colors"
                                            >
                                                Clear
                                            </button>
                                        </div>
                                    </div>

                                    {availableYears.length === 0 ? (
                                        <p className="text-xs text-brand-muted font-medium">
                                            No years available yet.
                                        </p>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {availableYears.map(year => {
                                                const active = selectedYears.includes(year);
                                                return (
                                                    <button
                                                        key={year}
                                                        onClick={() => toggle(selectedYears, setSelectedYears, year)}
                                                        className={`px-4 py-2.5 rounded-xl text-xs font-black border-2 transition-all ${
                                                            active
                                                                ? "bg-brand-dark text-white border-brand-dark"
                                                                : "bg-white border-brand-border text-brand-muted hover:border-brand-dark hover:text-brand-dark"
                                                        }`}
                                                    >
                                                        {year}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </motion.section>

                                {/* SUBJECTS + TOPICS */}
                                <motion.section
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 }}
                                    className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-border shadow-sm"
                                >
                                    <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                                        <h2 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-brand-muted flex items-center gap-2">
                                            <Book size={14} className="text-brand-accent" />
                                            Subjects & Topics
                                            {(selectedSubjects.length + selectedTopics.length) > 0 && (
                                                <span className="ml-1 px-2 py-0.5 bg-brand-dark text-white rounded-full text-[9px]">
                                                    {selectedSubjects.length + selectedTopics.length}
                                                </span>
                                            )}
                                        </h2>
                                        <div className="flex gap-3 items-center">
                                            <button
                                                onClick={selectAllSubjects}
                                                className="text-[10px] font-black uppercase tracking-widest text-brand-dark hover:text-brand-accent transition-colors"
                                            >
                                                Select All
                                            </button>
                                            <span className="w-px h-3 bg-brand-border" />
                                            <button
                                                onClick={clearSubjects}
                                                className="text-[10px] font-black uppercase tracking-widest text-brand-muted hover:text-brand-dark transition-colors"
                                            >
                                                Clear
                                            </button>
                                        </div>
                                    </div>

                                    {subjects.length === 0 ? (
                                        <p className="text-xs text-brand-muted font-medium">
                                            No subjects available yet.
                                        </p>
                                    ) : (
                                        <div className="space-y-3">
                                            {subjects.map(subject => {
                                                const subjectActive = selectedSubjects.includes(subject._id);
                                                const topics = topicsBySubject[subject._id] || [];

                                                return (
                                                    <div
                                                        key={subject._id}
                                                        className="p-4 sm:p-5 rounded-2xl border border-brand-border bg-brand-light/30"
                                                    >
                                                        {/* SUBJECT PILL */}
                                                        <button
                                                            onClick={() => toggle(selectedSubjects, setSelectedSubjects, subject._id)}
                                                            className={`font-black uppercase tracking-tight text-xs sm:text-sm mb-3 px-4 py-2 rounded-full border-2 transition-all ${
                                                                subjectActive
                                                                    ? "bg-brand-dark border-brand-dark text-white"
                                                                    : "bg-white border-brand-border text-brand-dark hover:border-brand-dark"
                                                            }`}
                                                        >
                                                            {subject.name}
                                                        </button>

                                                        {/* TOPICS */}
                                                        {topics.length > 0 && (
                                                            <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3">
                                                                {topics.map(topic => {
                                                                    const topicActive = selectedTopics.includes(topic._id);
                                                                    return (
                                                                        <button
                                                                            key={topic._id}
                                                                            onClick={() => toggle(selectedTopics, setSelectedTopics, topic._id)}
                                                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide border transition-all ${
                                                                                topicActive
                                                                                    ? "bg-brand-accent text-white border-brand-accent"
                                                                                    : "bg-white border-brand-border text-brand-muted hover:border-brand-dark hover:text-brand-dark"
                                                                            }`}
                                                                        >
                                                                            {topic.name}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </motion.section>
                            </div>

                            {/* RIGHT: SUMMARY */}
                            <motion.aside
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="lg:col-span-1"
                            >
                                <div className="bg-brand-dark text-white rounded-3xl lg:sticky lg:top-24 overflow-hidden">

                                    {/* HEADER */}
                                    <div className="px-6 sm:px-7 pt-6 sm:pt-7 pb-5 border-b border-white/10">
                                        <div className="flex items-center gap-2">
                                            <Layers size={14} className="text-brand-accent" />
                                            <h3 className="text-[10px] font-black uppercase tracking-widest opacity-60">
                                                Your Setup
                                            </h3>
                                        </div>
                                    </div>

                                    {/* HERO NUMBER */}
                                    <div className="px-6 sm:px-7 py-6 border-b border-white/10">
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-2">
                                            Daily Target
                                        </p>
                                        <div className="flex items-baseline gap-2">
                                            <AnimatePresence mode="wait">
                                                <motion.span
                                                    key={limit}
                                                    initial={{ opacity: 0, y: 6 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -6 }}
                                                    transition={{ duration: 0.15 }}
                                                    className="text-5xl sm:text-6xl font-black leading-none tracking-tighter"
                                                >
                                                    {limit}
                                                </motion.span>
                                            </AnimatePresence>
                                            <span className="text-[10px] font-black opacity-50 uppercase tracking-widest">
                                                Questions
                                            </span>
                                        </div>
                                    </div>

                                    {/* ROWS */}
                                    <div className="px-6 sm:px-7 py-5 space-y-3.5">
                                        <SummaryRow label="Mode" value={mode} />
                                        <SummaryRow
                                            label="Years"
                                            value={selectedYears.length === 0 ? "All" : `${selectedYears.length} selected`}
                                        />
                                        <SummaryRow
                                            label="Subjects"
                                            value={selectedSubjects.length === 0 ? "All" : `${selectedSubjects.length} selected`}
                                        />
                                        <SummaryRow
                                            label="Topics"
                                            value={selectedTopics.length === 0 ? "All" : `${selectedTopics.length} selected`}
                                        />
                                    </div>

                                    {/* HINT */}
                                    {totalSelections === 0 && (
                                        <div className="mx-6 sm:mx-7 mb-5 border border-white/10 rounded-xl p-3">
                                            <p className="text-[10px] font-bold opacity-70 leading-relaxed">
                                                No filters applied. You'll practice from all available questions.
                                            </p>
                                        </div>
                                    )}

                                    {/* CTA */}
                                    <div className="px-6 sm:px-7 pb-6 sm:pb-7">
                                        <button
                                            onClick={startPractice}
                                            disabled={loading}
                                            className="hidden lg:flex w-full bg-white text-brand-dark py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-brand-accent hover:text-white transition-all items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 size={14} className="animate-spin" />
                                                    Creating
                                                </>
                                            ) : (
                                                <>
                                                    <Play size={14} fill="currentColor" />
                                                    Start Practice
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </motion.aside>
                        </div>

                    </div>

                </main>

                {/* DESKTOP FOOTER */}
                <div className="hidden md:block">
                    <Footer />
                </div>

            </div>

            {/* MOBILE STICKY CTA */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-brand-border p-3 z-40">
                <button
                    onClick={startPractice}
                    disabled={loading}
                    className="w-full bg-brand-dark text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-brand-accent transition-all"
                >
                    {loading ? (
                        <>
                            <Loader2 size={14} className="animate-spin" />
                            Creating Track
                        </>
                    ) : (
                        <>
                            <Play size={14} fill="currentColor" />
                            Start {mode} · {limit} Qs
                        </>
                    )}
                </button>
            </div>

        </div>
    );
}

// =========================
// SUMMARY ROW
// =========================

function SummaryRow({ label, value }) {
    return (
        <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-50">
                {label}
            </span>
            <span className="text-xs font-black text-white">
                {value}
            </span>
        </div>
    );
}

// =========================
// MAIN EXPORT
// =========================

export default function PracticeSetup() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-brand-light flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-brand-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-sm font-black text-brand-muted uppercase tracking-widest">
                            Loading...
                        </p>
                    </div>
                </div>
            }
        >
            <PracticeSetupContent />
        </Suspense>
    );
}