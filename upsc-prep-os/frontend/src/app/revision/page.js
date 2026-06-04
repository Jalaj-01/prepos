"use client";

import {
    useEffect,
    useState,
    Suspense
} from "react";

import axios from "axios";

import {
    motion,
    AnimatePresence
} from "framer-motion";

import {
    CheckCircle2,
    XCircle,
    ArrowRight,
    Timer,
    Brain,
    Info,
    LayoutDashboard,
    AlertTriangle,
    Target,
    Trophy,
    RotateCcw,
    Sparkles,
    Layers,
    ChevronRight,
    Calendar,
    Award,
    TrendingUp
} from "lucide-react";

import Link from "next/link";

import { useSearchParams, useRouter } from "next/navigation";

import Sidebar from "@/components/layout/Sidebar";
import TopHeader from "@/components/layout/TopHeader";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";

import { showToast } from "@/components/ui/Toast";

// =========================
// CONSTANTS
// =========================

const MISTAKE_TYPES = [
    "Conceptual",
    "Factual Confusion",
    "Silly Mistake",
    "Guessing",
    "Elimination Failure"
];

const STAGE_LABELS = ["New", "Stage 1", "Stage 2", "Stage 3"];
const STAGE_INTERVALS = ["1 day", "3 days", "7 days", "21 days"];

// =========================
// INNER COMPONENT
// =========================

function RevisionContent() {

    const router = useRouter();
    const searchParams = useSearchParams();
    const initialMode = searchParams.get("mode") || "GS";

    const [user, setUser] = useState(null);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    // Mode
    const [mode, setMode] = useState(initialMode);

    // Pre-session state
    const [summary, setSummary] = useState(null);
    const [summaryLoading, setSummaryLoading] = useState(true);

    // Session state
    const [sessionActive, setSessionActive] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [sessionLoading, setSessionLoading] = useState(false);

    // Question state
    const [selectedOption, setSelectedOption] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);
    const [showMistakeModal, setShowMistakeModal] = useState(false);
    const [lastResult, setLastResult] = useState(null); // { action, newStage, mastered }

    // Session stats
    const [sessionStats, setSessionStats] = useState({
        correct: 0,
        wrong: 0,
        advanced: 0,
        mastered: 0,
        reset: 0,
        totalTime: 0
    });

    const [sessionComplete, setSessionComplete] = useState(false);

    // =========================
    // AUTH
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
    // FETCH SUMMARY (on mount + mode change)
    // =========================

    useEffect(() => {
        if (user) fetchSummary();
    }, [user, mode]);

    const fetchSummary = async () => {
        try {
            setSummaryLoading(true);

            const { data } = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/revisions/summary?mode=${mode}`,
                {
                    headers: { Authorization: `Bearer ${user.token}` }
                }
            );

            setSummary(data);

        } catch (error) {
            if (error.response?.status === 404) {
                setSummary({ status: "no_track" });
            } else {
                console.error("Summary Fetch Error:", error);
                showToast.error("Failed to load revision data");
            }
        } finally {
            setSummaryLoading(false);
        }
    };

    // =========================
    // START SESSION
    // =========================

    const startSession = async () => {

        try {
            setSessionLoading(true);

            const { data } = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/revisions/due?mode=${mode}&limit=20`,
                {
                    headers: { Authorization: `Bearer ${user.token}` }
                }
            );

            if (data.status === "caught_up" || !data.questions?.length) {
                showToast.info("All caught up! Nothing due today.");
                fetchSummary();
                return;
            }

            setQuestions(data.questions);
            setCurrentIndex(0);
            setSelectedOption(null);
            setSubmitted(false);
            setTimeLeft(60);
            setLastResult(null);
            setSessionStats({
                correct: 0,
                wrong: 0,
                advanced: 0,
                mastered: 0,
                reset: 0,
                totalTime: 0
            });
            setSessionActive(true);
            setSessionComplete(false);

        } catch (error) {
            console.error("Start Session Error:", error);
            showToast.error("Failed to start revision session");
        } finally {
            setSessionLoading(false);
        }
    };

    // =========================
    // TIMER
    // =========================

    useEffect(() => {
        if (!sessionActive || submitted || sessionComplete) return;

        if (timeLeft <= 0) {
            handleSubmit();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);

    }, [timeLeft, sessionActive, submitted, sessionComplete]);

    // =========================
    // HANDLE ANSWER SELECT
    // =========================

    const handleAnswer = (label) => {
        if (submitted) return;
        setSelectedOption(label);
    };

    // =========================
    // SUBMIT (button click or timeout)
    // =========================

    const handleSubmit = () => {
        if (!selectedOption) {
            finalizeAnswer("Time Pressure");
            return;
        }

        const currentQ = questions[currentIndex];
        const isCorrect = selectedOption === currentQ.correctOption;

        if (isCorrect) {
            finalizeAnswer("None");
        } else {
            setShowMistakeModal(true);
        }
    };

    // =========================
    // FINALIZE ANSWER
    // =========================

    const finalizeAnswer = async (mistakeCategory = "None") => {

        const currentQ = questions[currentIndex];
        const isCorrect = selectedOption === currentQ.correctOption;
        const timeTaken = 60 - timeLeft;

        setSubmitted(true);
        setShowMistakeModal(false);

        try {
            const { data } = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/revisions/process`,
                {
                    questionId: currentQ._id,
                    isCorrect,
                    mode,
                    timeTaken,
                    selectedOption: selectedOption || "",
                    mistakeCategory
                },
                {
                    headers: { Authorization: `Bearer ${user.token}` }
                }
            );

            setLastResult({
                action: data.action,
                newStage: data.newStage,
                mastered: data.mastered
            });

            // Update session stats
            setSessionStats(prev => ({
                ...prev,
                correct: prev.correct + (isCorrect ? 1 : 0),
                wrong: prev.wrong + (isCorrect ? 0 : 1),
                advanced: prev.advanced + (data.action === "advanced" ? 1 : 0),
                mastered: prev.mastered + (data.action === "mastered" ? 1 : 0),
                reset: prev.reset + (data.action === "reset" ? 1 : 0),
                totalTime: prev.totalTime + timeTaken
            }));

        } catch (error) {
            console.error("Process Revision Error:", error);
            showToast.error("Failed to save revision");
        }
    };

    // =========================
    // NEXT QUESTION
    // =========================

    const nextQuestion = () => {

        if (currentIndex >= questions.length - 1) {
            // Session complete
            setSessionComplete(true);
            fetchSummary();
            return;
        }

        setCurrentIndex(prev => prev + 1);
        setSelectedOption(null);
        setSubmitted(false);
        setTimeLeft(60);
        setLastResult(null);
    };

    // =========================
    // END SESSION EARLY
    // =========================

    const endSession = () => {
        setSessionComplete(true);
        fetchSummary();
    };

    // =========================
    // FORMAT TIME
    // =========================

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    // =========================
    // FORMAT DATE
    // =========================

    const formatDate = (date) => {
        if (!date) return null;
        return new Date(date).toLocaleDateString("en-IN", {
            weekday: "short",
            day: "numeric",
            month: "short"
        });
    };

    // =========================
    // LOADING SHELL
    // =========================

    if (!user || summaryLoading) {
        return (
            <div className="min-h-screen bg-brand-light flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-brand-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-sm font-black text-brand-muted uppercase tracking-widest">
                        Loading Revisions...
                    </p>
                </div>
            </div>
        );
    }

    // =========================
    // NO TRACK
    // =========================

    if (summary?.status === "no_track") {
        return (
            <PageShell user={user} mobileNavOpen={mobileNavOpen} setMobileNavOpen={setMobileNavOpen}>
                <div className="flex items-center justify-center min-h-[60vh] p-6">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-brand-border text-center"
                    >
                        <div className="w-16 h-16 bg-brand-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Target size={28} className="text-brand-accent" />
                        </div>
                        <h2 className="text-2xl font-black text-brand-dark mb-3 tracking-tight">
                            No Active Track
                        </h2>
                        <p className="text-brand-muted font-medium mb-6 text-sm leading-relaxed">
                            Create a preparation track first. Wrong answers from daily practice will appear here for spaced revision.
                        </p>
                        <Link
                            href={`/practice/setup?mode=${mode}`}
                            className="block w-full bg-brand-dark text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-accent transition-all"
                        >
                            Setup Practice Track
                        </Link>
                    </motion.div>
                </div>
            </PageShell>
        );
    }

    // =========================
    // SESSION COMPLETE FEEDBACK
    // =========================

    if (sessionComplete) {

        const total = sessionStats.correct + sessionStats.wrong;
        const accuracy = total > 0 ? Math.round((sessionStats.correct / total) * 100) : 0;
        const avgTime = total > 0 ? Math.round(sessionStats.totalTime / total) : 0;

        return (
            <PageShell user={user} mobileNavOpen={mobileNavOpen} setMobileNavOpen={setMobileNavOpen}>
                <div className="flex items-center justify-center min-h-[80vh] p-4 sm:p-6">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="max-w-lg w-full bg-white p-8 sm:p-10 rounded-3xl border border-brand-border"
                    >
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-brand-dark rounded-3xl flex items-center justify-center mx-auto mb-5">
                                <Trophy size={32} className="text-brand-accent" />
                            </div>
                            <h2 className="text-3xl font-black text-brand-dark mb-2 tracking-tight">
                                Session Complete
                            </h2>
                            <p className="text-brand-muted font-medium text-sm">
                                You revised {total} {total === 1 ? "question" : "questions"}
                            </p>
                        </div>

                        {/* CORE STATS */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <StatBox label="Correct" value={sessionStats.correct} variant="dark" />
                            <StatBox label="Wrong" value={sessionStats.wrong} />
                            <StatBox label="Accuracy" value={`${accuracy}%`} />
                            <StatBox label="Avg Time" value={`${avgTime}s`} />
                        </div>

                        {/* REVISION OUTCOMES */}
                        <div className="bg-brand-light/50 border border-brand-border rounded-2xl p-4 mb-6">
                            <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-3">
                                Revision Outcomes
                            </p>
                            <div className="space-y-2">
                                <OutcomeRow icon={TrendingUp} label="Advanced to next stage" value={sessionStats.advanced} />
                                <OutcomeRow icon={Award} label="Mastered" value={sessionStats.mastered} highlight />
                                <OutcomeRow icon={RotateCcw} label="Reset to start" value={sessionStats.reset} />
                            </div>
                        </div>

                        {/* NEXT DUE */}
                        {summary?.nextDue?.date && (
                            <div className="border border-brand-border rounded-2xl p-4 mb-6 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-1">
                                        Next Batch
                                    </p>
                                    <p className="font-black text-sm text-brand-dark">
                                        {formatDate(summary.nextDue.date)}
                                    </p>
                                </div>
                                <span className="text-2xl font-black text-brand-dark tracking-tighter">
                                    {summary.nextDue.count}
                                </span>
                            </div>
                        )}

                        {/* ACTIONS */}
                        <div className="flex flex-col sm:flex-row gap-2">
                            <button
                                onClick={() => { setSessionActive(false); setSessionComplete(false); }}
                                className="flex-1 bg-brand-light text-brand-dark py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-border transition-all"
                            >
                                Back
                            </button>
                            {summary?.totalDue > 0 && (
                                <button
                                    onClick={() => { setSessionComplete(false); startSession(); }}
                                    className="flex-1 bg-brand-dark text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-accent transition-all"
                                >
                                    Continue · {summary.totalDue} left
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            </PageShell>
        );
    }

    // =========================
    // ACTIVE SESSION — QUESTION RUNNER
    // =========================

    if (sessionActive && questions.length > 0) {

        const currentQ = questions[currentIndex];
        const isLast = currentIndex >= questions.length - 1;
        const progress = Math.round(((currentIndex + 1) / questions.length) * 100);

        return (
            <div className="min-h-screen bg-brand-light pb-20">

                {/* SESSION HEADER */}
                <div className="bg-white border-b border-brand-border p-3 sm:p-4 sticky top-0 z-40">
                    <div className="max-w-4xl mx-auto flex items-center justify-between px-2 gap-4">

                        <button
                            onClick={endSession}
                            className="text-brand-muted hover:text-brand-dark p-1 shrink-0"
                            title="End session"
                        >
                            <LayoutDashboard size={18} />
                        </button>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[9px] font-black text-brand-muted uppercase tracking-widest">
                                    Revision · {currentIndex + 1} / {questions.length}
                                </span>
                                <span className="text-[9px] font-black text-brand-accent uppercase tracking-widest">
                                    {progress}%
                                </span>
                            </div>
                            <div className="h-2 bg-brand-light rounded-full overflow-hidden border border-brand-border">
                                <motion.div
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.3 }}
                                    className="h-full bg-brand-accent"
                                />
                            </div>
                        </div>

                        <div className={`flex items-center gap-1.5 font-black text-xs px-3 py-1.5 rounded-full shrink-0 ${
                            timeLeft < 15
                                ? "text-red-600 bg-red-50 animate-pulse"
                                : "text-brand-muted bg-brand-light"
                        }`}>
                            <Timer size={14} />
                            {formatTime(timeLeft)}
                        </div>
                    </div>
                </div>

                {/* QUESTION CONTENT */}
                <main className="max-w-3xl mx-auto p-4 sm:p-6 mt-6 sm:mt-10">

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentQ._id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-5 sm:space-y-6"
                        >

                            {/* QUESTION CARD */}
                            <div className="bg-white p-6 sm:p-10 rounded-3xl border border-brand-border">

                                <div className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-widest flex-wrap">
                                    <RotateCcw size={12} className="text-brand-accent" />
                                    <span className="text-brand-accent">Revision</span>
                                    <span className="text-brand-muted">·</span>
                                    <span className="text-brand-muted">
                                        {STAGE_LABELS[currentQ.revisionMeta?.currentStage || 0]}
                                    </span>
                                    <span className="text-brand-muted">·</span>
                                    <span className="text-brand-muted">{currentQ.year}</span>
                                    <span className="text-brand-muted">·</span>
                                    <span className="text-brand-muted">{currentQ.subjectName || "General"}</span>
                                    {currentQ.revisionMeta?.wrongCount > 1 && (
                                        <>
                                            <span className="text-brand-muted">·</span>
                                            <span className="text-red-600">
                                                Wrong {currentQ.revisionMeta.wrongCount}x
                                            </span>
                                        </>
                                    )}
                                </div>

                                <h2 className="text-base sm:text-xl font-bold leading-relaxed text-brand-dark">
                                    {currentQ.questionText}
                                </h2>
                            </div>

                            {/* OPTIONS */}
                            <div className="grid grid-cols-1 gap-3">
                                {currentQ.options.map(opt => {
                                    const isCorrect = opt.label === currentQ.correctOption;
                                    const isSelected = selectedOption === opt.label;

                                    return (
                                        <button
                                            key={opt.label}
                                            onClick={() => handleAnswer(opt.label)}
                                            disabled={submitted}
                                            className={`p-4 sm:p-5 rounded-2xl text-left font-bold transition-all border-2 flex items-center justify-between ${
                                                isSelected && !submitted
                                                    ? "border-brand-accent bg-brand-accent/5"
                                                    : "border-brand-border bg-white"
                                            } ${
                                                submitted && isCorrect
                                                    ? "!border-green-500 !bg-green-50"
                                                    : ""
                                            } ${
                                                submitted && isSelected && !isCorrect
                                                    ? "!border-red-500 !bg-red-50"
                                                    : ""
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 sm:gap-4">
                                                <span className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border-2 text-sm font-black ${
                                                    isSelected
                                                        ? "bg-brand-accent text-white border-brand-accent"
                                                        : "bg-brand-light border-brand-border"
                                                }`}>
                                                    {opt.label}
                                                </span>
                                                <span className="text-sm">{opt.text}</span>
                                            </div>

                                            {submitted && isCorrect && <CheckCircle2 className="text-green-600 shrink-0" size={20} />}
                                            {submitted && isSelected && !isCorrect && <XCircle className="text-red-600 shrink-0" size={20} />}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* RESULT BANNER + EXPLANATION */}
                            {submitted && (
                                <motion.div
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-4"
                                >
                                    {/* STAGE TRANSITION BADGE */}
                                    {lastResult && (
                                        <StageTransitionBadge
                                            action={lastResult.action}
                                            oldStage={currentQ.revisionMeta?.currentStage || 0}
                                            newStage={lastResult.newStage}
                                            mastered={lastResult.mastered}
                                        />
                                    )}

                                    {/* EXPLANATION */}
                                    <div className="bg-brand-dark text-white p-6 sm:p-8 rounded-3xl">
                                        <h4 className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest mb-4 opacity-60">
                                            <Info size={14} />
                                            Explanation
                                        </h4>
                                        <p className="text-xs sm:text-sm font-medium leading-relaxed opacity-90">
                                            {currentQ.explanation || "Explanation not available."}
                                        </p>
                                    </div>

                                    <button
                                        onClick={nextQuestion}
                                        className="w-full bg-brand-accent text-white p-4 sm:p-5 rounded-2xl font-black flex items-center justify-center gap-3 hover:opacity-90 transition-all text-sm"
                                    >
                                        {isLast ? "Finish Session" : "Next Question"}
                                        <ArrowRight size={18} />
                                    </button>
                                </motion.div>
                            )}

                            {/* SUBMIT BUTTON */}
                            {!submitted && (
                                <button
                                    onClick={handleSubmit}
                                    disabled={!selectedOption}
                                    className="w-full bg-brand-dark text-white p-4 sm:p-5 rounded-2xl font-black disabled:opacity-30 text-sm hover:bg-brand-accent transition-all"
                                >
                                    Submit Answer
                                </button>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </main>

                {/* MISTAKE MODAL */}
                <AnimatePresence>
                    {showMistakeModal && (
                        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
                            <motion.div
                                initial={{ y: 40, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 40, opacity: 0 }}
                                className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8"
                            >
                                <div className="text-center mb-6">
                                    <div className="bg-red-50 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-600">
                                        <AlertTriangle size={26} />
                                    </div>
                                    <h3 className="text-xl font-black tracking-tight">
                                        What went wrong?
                                    </h3>
                                    <p className="text-xs text-brand-muted font-medium mt-2">
                                        This stays in your revision queue.
                                    </p>
                                </div>

                                <div className="grid gap-2">
                                    {MISTAKE_TYPES.map(type => (
                                        <button
                                            key={type}
                                            onClick={() => finalizeAnswer(type)}
                                            className="p-3 sm:p-4 bg-brand-light hover:bg-brand-dark hover:text-white rounded-xl text-left font-bold text-xs sm:text-sm transition-all"
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    // =========================
    // DEFAULT — SUMMARY / LANDING
    // =========================

    const dueToday = summary?.dueToday || 0;
    const totalDue = summary?.totalDue || 0;
    const breakdown = summary?.stageBreakdown || { stage0: 0, stage1: 0, stage2: 0, stage3: 0, mastered: 0 };
    const nextDue = summary?.nextDue;
    const totalInQueue = summary?.totalInQueue || 0;

    return (
        <PageShell user={user} mobileNavOpen={mobileNavOpen} setMobileNavOpen={setMobileNavOpen}>

            <main className="flex-1 p-4 sm:p-6 md:p-10 pb-28 md:pb-10">
                <div className="max-w-6xl mx-auto">

                    
                    {/* HEADER */}
                    <motion.header
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 sm:mb-10"
                    >
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-3">
                                    Spaced Repetition
                                </p>
                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-dark tracking-tighter leading-none">
                                    Revision Center
                                </h1>
                                <p className="text-brand-muted font-medium mt-3 text-sm sm:text-base max-w-xl">
                                    Lock in your memory. Questions surface at the right time — not too soon, not too late.
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

                    {/* MAIN GRID */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

                        {/* LEFT 2/3 */}
                        <div className="lg:col-span-2 space-y-4 sm:space-y-6">

                            {/* HERO CARD — DUE TODAY OR CAUGHT UP */}
                            <motion.section
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 }}
                                className="bg-brand-dark text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden"
                            >
                                {dueToday > 0 ? (
                                    <>
                                        <div className="flex items-start justify-between mb-6">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-brand-accent mb-2">
                                                    Due Today
                                                </p>
                                                <div className="flex items-baseline gap-3">
                                                    <span className="text-6xl sm:text-7xl font-black tracking-tighter leading-none">
                                                        {dueToday}
                                                    </span>
                                                    <span className="text-sm font-black opacity-50 uppercase tracking-widest">
                                                        Questions
                                                    </span>
                                                </div>
                                                {summary?.hasMore && (
                                                    <p className="text-xs font-bold opacity-70 mt-3">
                                                        Showing 20 of {totalDue}. Complete this batch first.
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            onClick={startSession}
                                            disabled={sessionLoading}
                                            className="w-full bg-white text-brand-dark py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-accent hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {sessionLoading ? "Loading..." : "Start Revision"}
                                            <ChevronRight size={16} />
                                        </button>
                                    </>
                                ) : (
                                    <div className="text-center py-4">
                                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                                            <CheckCircle2 size={28} className="text-brand-accent" />
                                        </div>
                                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
                                            All Caught Up
                                        </h2>
                                        <p className="text-sm opacity-70 font-medium mb-6 max-w-sm mx-auto">
                                            No revisions due today. Your memory cycle is on track.
                                        </p>

                                        {nextDue?.date && (
                                            <div className="border border-white/15 rounded-2xl p-4 max-w-sm mx-auto mb-5">
                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">
                                                    Next Batch
                                                </p>
                                                <p className="font-black text-sm">
                                                    {formatDate(nextDue.date)}
                                                </p>
                                                <p className="text-xs opacity-60 font-bold mt-1">
                                                    {nextDue.count} {nextDue.count === 1 ? "question" : "questions"} due in {nextDue.daysAway} {nextDue.daysAway === 1 ? "day" : "days"}
                                                </p>
                                            </div>
                                        )}

                                        <Link
                                            href={`/practice?mode=${mode}`}
                                            className="inline-block bg-white text-brand-dark px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-brand-accent hover:text-white transition-all"
                                        >
                                            Continue Daily Practice
                                        </Link>
                                    </div>
                                )}
                            </motion.section>

                            {/* STAGE BREAKDOWN */}
                            <motion.section
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-border"
                            >
                                <h2 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-brand-muted flex items-center gap-2 mb-5">
                                    <Layers size={14} className="text-brand-accent" />
                                    Memory Pipeline
                                </h2>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-5">
                                    <StageCard label="New" count={breakdown.stage0} interval="1 day" />
                                    <StageCard label="Stage 1" count={breakdown.stage1} interval="3 days" />
                                    <StageCard label="Stage 2" count={breakdown.stage2} interval="7 days" />
                                    <StageCard label="Stage 3" count={breakdown.stage3} interval="21 days" />
                                </div>

                                <div className="bg-brand-light/50 border border-brand-border rounded-2xl p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Award size={16} className="text-brand-accent" />
                                        <span className="text-xs font-black uppercase tracking-widest text-brand-muted">
                                            Mastered
                                        </span>
                                    </div>
                                    <span className="text-2xl font-black text-brand-dark tracking-tighter">
                                        {breakdown.mastered}
                                    </span>
                                </div>
                            </motion.section>
                        </div>

                        {/* RIGHT 1/3 — INFO */}
                        <motion.aside
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="lg:col-span-1"
                        >
                            <div className="bg-white border border-brand-border rounded-3xl p-6 lg:sticky lg:top-24">

                                <div className="flex items-center gap-2 mb-5">
                                    <Sparkles size={14} className="text-brand-accent" />
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
                                        How It Works
                                    </h3>
                                </div>

                                <div className="space-y-3 mb-6">
                                    {[
                                        { stage: "New", days: "1 day", desc: "Just got it wrong" },
                                        { stage: "Stage 1", days: "3 days", desc: "Passed 1st review" },
                                        { stage: "Stage 2", days: "7 days", desc: "Passed 2nd review" },
                                        { stage: "Stage 3", days: "21 days", desc: "Passed 3rd review" },
                                        { stage: "Mastered", days: "Done", desc: "Locked in memory" }
                                    ].map((step, i) => (
                                        <div key={step.stage} className="flex items-start gap-3">
                                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${
                                                i === 4
                                                    ? "bg-brand-accent text-white"
                                                    : "bg-brand-light text-brand-dark border border-brand-border"
                                            }`}>
                                                {i + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-baseline justify-between gap-2">
                                                    <span className="text-xs font-black text-brand-dark">{step.stage}</span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
                                                        {step.days}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] font-bold text-brand-muted mt-0.5">
                                                    {step.desc}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-brand-border pt-5">
                                    <SummaryRow label="Total in queue" value={totalInQueue} />
                                    <SummaryRow label="Upcoming (7 days)" value={summary?.upcoming7Days || 0} />
                                    <SummaryRow label="Mastered" value={breakdown.mastered} />
                                </div>
                            </div>
                        </motion.aside>
                    </div>
                </div>
            </main>

            <div className="hidden md:block">
                <Footer />
            </div>

            {/* MOBILE STICKY CTA — only if dues available */}
            {dueToday > 0 && (
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-brand-border p-3 z-30">
                    <button
                        onClick={startSession}
                        disabled={sessionLoading}
                        className="w-full bg-brand-dark text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-brand-accent transition-all"
                    >
                        {sessionLoading ? "Loading..." : `Start Revision · ${dueToday}`}
                        <ChevronRight size={14} />
                    </button>
                </div>
            )}
        </PageShell>
    );
}

// =========================
// PAGE SHELL (Sidebar + TopHeader + MobileNav)
// =========================

function PageShell({ user, mobileNavOpen, setMobileNavOpen, children }) {
    return (
        <div className="min-h-screen bg-brand-light flex">
            <Sidebar isAdmin={user.isAdmin} />
            <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
            <div className="flex-1 flex flex-col min-h-screen min-w-0">
                <TopHeader user={user} onMenuClick={() => setMobileNavOpen(true)} />
                {children}
            </div>
        </div>
    );
}

// =========================
// STAGE CARD
// =========================

function StageCard({ label, count, interval }) {
    return (
        <div className="border border-brand-border rounded-2xl p-3 sm:p-4 bg-brand-light/30">
            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2">
                {label}
            </p>
            <p className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tighter leading-none">
                {count}
            </p>
            <p className="text-[9px] font-bold text-brand-muted mt-2">
                {interval}
            </p>
        </div>
    );
}

// =========================
// STAT BOX (Session feedback)
// =========================

function StatBox({ label, value, variant }) {
    const isDark = variant === "dark";
    return (
        <div className={`rounded-2xl p-4 border ${
            isDark
                ? "bg-brand-dark border-brand-dark text-white"
                : "bg-white border-brand-border"
        }`}>
            <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${
                isDark ? "text-brand-accent" : "text-brand-muted"
            }`}>
                {label}
            </p>
            <p className={`text-2xl sm:text-3xl font-black tracking-tighter leading-none ${
                isDark ? "text-white" : "text-brand-dark"
            }`}>
                {value}
            </p>
        </div>
    );
}

// =========================
// OUTCOME ROW
// =========================

function OutcomeRow({ icon: Icon, label, value, highlight }) {
    return (
        <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-bold text-brand-dark">
                <Icon size={12} className={highlight ? "text-brand-accent" : "text-brand-muted"} />
                {label}
            </span>
            <span className={`text-sm font-black ${highlight ? "text-brand-accent" : "text-brand-dark"}`}>
                {value}
            </span>
        </div>
    );
}

// =========================
// SUMMARY ROW
// =========================

function SummaryRow({ label, value }) {
    return (
        <div className="flex items-center justify-between py-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
                {label}
            </span>
            <span className="text-xs font-black text-brand-dark">
                {value}
            </span>
        </div>
    );
}

// =========================
// STAGE TRANSITION BADGE
// =========================

function StageTransitionBadge({ action, oldStage, newStage, mastered }) {

    if (action === "mastered") {
        return (
            <div className="bg-brand-accent/10 border border-brand-accent/30 rounded-2xl p-4 flex items-center gap-3">
                <Award size={20} className="text-brand-accent shrink-0" />
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-accent">
                        Mastered
                    </p>
                    <p className="text-xs font-bold text-brand-dark">
                        This question is locked in your memory.
                    </p>
                </div>
            </div>
        );
    }

    if (action === "advanced") {
        return (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
                <TrendingUp size={20} className="text-green-600 shrink-0" />
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-green-700">
                        Advanced
                    </p>
                    <p className="text-xs font-bold text-brand-dark">
                        Moved {STAGE_LABELS[oldStage]} → {STAGE_LABELS[newStage]} · Next in {STAGE_INTERVALS[newStage]}
                    </p>
                </div>
            </div>
        );
    }

    // Reset
    return (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
            <RotateCcw size={20} className="text-red-600 shrink-0" />
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-red-700">
                    Back to start
                </p>
                <p className="text-xs font-bold text-brand-dark">
                    Stays in queue · See again in 1 day
                </p>
            </div>
        </div>
    );
}

// =========================
// MAIN EXPORT (with Suspense)
// =========================

export default function RevisionPage() {
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
            <RevisionContent />
        </Suspense>
    );
}