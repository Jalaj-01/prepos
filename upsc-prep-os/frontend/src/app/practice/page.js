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
    Flame,
    Target,
    Trophy,
    Clock,
    BarChart3,
    ArrowLeft,
    RotateCcw,
    Sparkles
} from "lucide-react";

import Link from "next/link";

import { useSearchParams } from "next/navigation";

import Sidebar from "@/components/layout/Sidebar";

import TopHeader from "@/components/layout/TopHeader";

import Footer from "@/components/layout/Footer";

import MobileNav from "@/components/layout/MobileNav";

import { showToast } from "@/components/ui/Toast";

const MISTAKE_TYPES = [
    "Conceptual",
    "Factual Confusion",
    "Silly Mistake",
    "Guessing",
    "Elimination Failure"
];

// =========================
// INNER COMPONENT
// =========================

function PracticeContent() {

    const searchParams = useSearchParams();

    const currentMode = searchParams.get("mode") || "GS";

    const [user, setUser] = useState(null);

    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    // Question state

    const [question, setQuestion] = useState(null);

    const [loading, setLoading] = useState(true);

    const [submitted, setSubmitted] = useState(false);

    const [selectedOption, setSelectedOption] = useState(null);

    // Status states

    const [practiceStatus, setPracticeStatus] = useState(null);

    const [dailySession, setDailySession] = useState(null);

    const [progress, setProgress] = useState(null);

    const [statusMessage, setStatusMessage] = useState("");

    // Session results (running total)

    const [results, setResults] = useState({
        correct: 0,
        wrong: 0
    });

    const [showMistakeModal, setShowMistakeModal] = useState(false);

    const [timeLeft, setTimeLeft] = useState(60);

    const [mode, setMode] = useState("GS");

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
    // FETCH NEXT QUESTION
    // =========================

    useEffect(() => {

        if (user) {
            fetchNextQuestion();
        }

    }, [user]);

    const fetchNextQuestion = async () => {

        try {

            setLoading(true);

            const { data } = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/api/preparation-track/next-question?mode=${currentMode}`,

    {
        headers: {
            Authorization: `Bearer ${user.token}`
        }
    }
);

            // Handle different statuses

            setPracticeStatus(data.status || (data.completed ? "pool_exhausted" : "continue"));

            setDailySession(data.dailySession || null);

            setProgress(data.progress || null);

            setStatusMessage(data.message || "");

            if (data.status === "continue" && data.question) {

                // Revision mode check

                if (data.mode === "REVISION" && data.questions?.length > 0) {

                    setQuestion(data.questions[0]);

                } else {

                    setQuestion(data.question);
                }

                setMode(data.mode);

                setSelectedOption(null);

                setSubmitted(false);

                setTimeLeft(60);

            } else {

                setQuestion(null);
            }

        } catch (error) {

            console.error("Fetch Question Error:", error);

            if (error.response?.status === 404) {

                setPracticeStatus("no_track");

                setStatusMessage("No active preparation track. Set one up first.");

            } else {

                showToast.error("Failed to load question");
            }

        } finally {

            setLoading(false);
        }
    };

    // =========================
    // TIMER
    // =========================

    useEffect(() => {

        if (loading || submitted || !question || practiceStatus !== "continue") return;

        if (timeLeft <= 0) {
            handleSubmit();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);

    }, [timeLeft, loading, submitted, question, practiceStatus]);

    // =========================
    // HANDLE ANSWER
    // =========================

    const handleAnswer = (label) => {

        if (submitted) return;

        setSelectedOption(label);
    };

    // =========================
    // FINALIZE ANSWER
    // =========================

    const finalizeAnswer = async (mistakeCategory = "None") => {

        const isCorrect =
            selectedOption === question.correctOption;

        setSubmitted(true);

        setShowMistakeModal(false);

        try {

            const { data } = await axios.post(

                `${process.env.NEXT_PUBLIC_API_URL}/api/preparation-track/submit-answer`,

                {
                    questionId: question._id,
                    isCorrect,
                    subjectName: question.subjectName,
                    topicName: question.topicName,
                    mode: currentMode,
                    timeTaken: 60 - timeLeft
                },

                {
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    }
                }
            );

            // Also log to Attempt model

            await axios.post(

                `${process.env.NEXT_PUBLIC_API_URL}/api/attempts/log`,

                {
                    questionId: question._id,
                    isCorrect,
                    selectedOption,
                    mistakeCategory,
                    timeTaken: 60 - timeLeft
                },

                {
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    }
                }
            );

            // Update local results

            if (isCorrect) {
                setResults(prev => ({ ...prev, correct: prev.correct + 1 }));
            } else {
                setResults(prev => ({ ...prev, wrong: prev.wrong + 1 }));
            }

            // Update daily session from response

            if (data.dailySession) {
                setDailySession(data.dailySession);
            }

            // Check if daily target is now complete

            if (data.dailyComplete) {
                setPracticeStatus("daily_complete");
            }

        } catch (error) {

            console.error("Submit Error:", error);

            showToast.error("Failed to submit answer");
        }
    };

    // =========================
    // HANDLE SUBMIT
    // =========================

    const handleSubmit = () => {

        if (!selectedOption) {
            finalizeAnswer("Time Pressure");
            return;
        }

        const isCorrect =
            selectedOption === question.correctOption;

        if (isCorrect) {
            finalizeAnswer("None");
        } else {
            setShowMistakeModal(true);
        }
    };

    // =========================
    // NEXT QUESTION
    // =========================

    const nextQuestion = () => {

        fetchNextQuestion();
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
    // LOADING
    // =========================

    if (loading || !user) {

        return (

            <div className="min-h-screen bg-brand-light flex items-center justify-center">

                <div className="text-center">

                    <div className="w-12 h-12 border-4 border-brand-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />

                    <p className="text-sm font-black text-brand-muted uppercase tracking-widest">
                        Loading...
                    </p>

                </div>

            </div>
        );
    }

    // =========================
    // NO TRACK SETUP
    // =========================

    if (practiceStatus === "no_track") {

        return (

            <div className="min-h-screen bg-brand-light flex">

                <Sidebar isAdmin={user.isAdmin} />

                <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

                <div className="flex-1 flex flex-col min-h-screen min-w-0">

                    <TopHeader user={user} onMenuClick={() => setMobileNavOpen(true)} />

                    <main className="flex-1 flex items-center justify-center p-6">

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl shadow-xl text-center border border-brand-border"
                        >

                            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Target size={28} className="text-blue-600" />
                            </div>

                            <h2 className="text-2xl font-black text-brand-dark mb-3">
                                No Active Track
                            </h2>

                            <p className="text-brand-muted font-medium mb-6 leading-relaxed">
                                Set up a preparation track to start your daily practice session.
                            </p>

                            <Link
                                href={`/practice/setup?mode=${currentMode}`}
                                className="block w-full bg-brand-dark text-white py-3.5 rounded-2xl font-black text-sm hover:bg-brand-accent transition-all"
                            >
                                Setup Practice Track
                            </Link>

                        </motion.div>

                    </main>

                    <Footer />

                </div>

            </div>
        );
    }

    // =========================
    // DAILY TARGET COMPLETED
    // =========================

    if (practiceStatus === "daily_complete") {

        const accuracy =
            dailySession?.attempted > 0
                ? Math.round((dailySession.correct / dailySession.attempted) * 100)
                : 0;

        const avgTime =
            dailySession?.attempted > 0
                ? Math.round(dailySession.totalTimeTaken / dailySession.attempted)
                : 0;

        return (

            <div className="min-h-screen bg-brand-light flex">

                <Sidebar isAdmin={user.isAdmin} />

                <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

                <div className="flex-1 flex flex-col min-h-screen min-w-0">

                    <TopHeader user={user} onMenuClick={() => setMobileNavOpen(true)} />

                    <main className="flex-1 flex items-center justify-center p-6">

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="max-w-lg w-full bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-brand-border"
                        >

                            <div className="text-center mb-8">

                                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
                                    <Trophy size={36} className="text-white" />
                                </div>

                                <h2 className="text-3xl font-black text-brand-dark mb-2">
                                    Daily Target Done! 🎉
                                </h2>

                                <p className="text-brand-muted font-medium">
                                    You've completed today's practice session
                                </p>

                            </div>

                            {/* Stats Grid */}

                            <div className="grid grid-cols-2 gap-3 mb-6">

                                <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-green-700 mb-1">Correct</p>
                                    <p className="text-3xl font-black text-green-600">{dailySession?.correct || results.correct}</p>
                                </div>

                                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-red-700 mb-1">Wrong</p>
                                    <p className="text-3xl font-black text-red-600">{dailySession?.wrong || results.wrong}</p>
                                </div>

                                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-700 mb-1">Accuracy</p>
                                    <p className="text-3xl font-black text-blue-600">{accuracy}%</p>
                                </div>

                                <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 text-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-purple-700 mb-1">Avg Time</p>
                                    <p className="text-3xl font-black text-purple-600">{avgTime}s</p>
                                </div>

                            </div>

                            {/* Overall Progress */}

                            {progress && (

                                <div className="bg-brand-light rounded-2xl p-4 border border-brand-border mb-6">

                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-black text-brand-muted uppercase tracking-widest">Overall Progress</span>
                                        <span className="text-xs font-black text-brand-accent">
                                            {progress.total > 0
    ? Math.min(Math.round((progress.solved / progress.total) * 100), 100)
    : 0}%
                                        </span>
                                    </div>

                                    <div className="w-full bg-white h-2.5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-brand-accent to-purple-500 rounded-full"
                                            style={{ width: `${progress.total > 0 ? Math.min((progress.solved / progress.total) * 100, 100) : 0}%` }}
                                        />
                                    </div>

                                    <p className="text-[10px] font-bold text-brand-muted mt-2">
                                        {progress.solved} / {progress.total} questions completed
                                    </p>

                                </div>
                            )}

                            {/* Actions */}

                            <div className="flex gap-3">

                                <Link
                                    href="/dashboard"
                                    className="flex-1 bg-brand-light text-brand-dark py-3.5 rounded-2xl font-black text-sm text-center hover:bg-brand-border transition-all"
                                >
                                    Dashboard
                                </Link>

                                <Link
                                    href="/analytics"
                                    className="flex-1 bg-brand-dark text-white py-3.5 rounded-2xl font-black text-sm text-center hover:bg-brand-accent transition-all"
                                >
                                    View Analytics
                                </Link>

                            </div>

                            <p className="text-[10px] text-brand-muted text-center mt-4 font-bold">
                                Come back tomorrow for your next session! 🌅
                            </p>

                        </motion.div>

                    </main>

                    <Footer />

                </div>

            </div>
        );
    }

    // =========================
    // POOL EXHAUSTED
    // =========================

    if (practiceStatus === "pool_exhausted" || practiceStatus === "no_questions") {

        return (

            <div className="min-h-screen bg-brand-light flex">

                <Sidebar isAdmin={user.isAdmin} />

                <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

                <div className="flex-1 flex flex-col min-h-screen min-w-0">

                    <TopHeader user={user} onMenuClick={() => setMobileNavOpen(true)} />

                    <main className="flex-1 flex items-center justify-center p-6">

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl shadow-xl text-center border border-brand-border"
                        >

                            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 size={28} className="text-green-600" />
                            </div>

                            <h2 className="text-2xl font-black text-brand-dark mb-3">
                                {practiceStatus === "no_questions"
                                    ? "No Questions Found"
                                    : "Track Completed!"}
                            </h2>

                            <p className="text-brand-muted font-medium mb-6 leading-relaxed">
                                {statusMessage || "Create a new track to continue practicing."}
                            </p>

                            {progress && (

                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <div className="bg-green-50 p-4 rounded-2xl border border-green-100 text-center">
                                        <p className="text-xs font-black uppercase mb-1 text-green-600">Solved</p>
                                        <p className="text-2xl font-black">{progress.solved}</p>
                                    </div>
                                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-center">
                                        <p className="text-xs font-black uppercase mb-1 text-blue-600">Total</p>
                                        <p className="text-2xl font-black">{progress.total}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3">

                                <Link
                                    href={`/practice/setup?mode=${currentMode}`}
                                    className="flex-1 bg-brand-dark text-white py-3.5 rounded-2xl font-black text-sm hover:bg-brand-accent transition-all"
                                >
                                    New Track
                                </Link>

                                <Link
                                    href="/dashboard"
                                    className="flex-1 bg-brand-light text-brand-dark py-3.5 rounded-2xl font-black text-sm hover:bg-brand-border transition-all"
                                >
                                    Dashboard
                                </Link>

                            </div>

                        </motion.div>

                    </main>

                    <Footer />

                </div>

            </div>
        );
    }

    // =========================
    // NO QUESTION (safety)
    // =========================

    if (!question) return null;

    // =========================
    // ACTIVE PRACTICE UI
    // =========================

    const dailyProgress =
        dailySession
            ? Math.round((dailySession.attempted / (progress?.dailyTarget || 10)) * 100)
            : 0;

    return (

        <div className="min-h-screen bg-brand-light pb-20">

            {/* HEADER */}

            <div className="bg-white border-b border-brand-border p-3 sm:p-4 sticky top-0 z-50">

                <div className="max-w-4xl mx-auto flex items-center justify-between px-2">

                    <Link
                        href="/dashboard"
                        className="text-brand-muted p-1"
                    >
                        <LayoutDashboard size={18} />
                    </Link>

                    {/* Progress bar */}

                    <div className="flex-1 mx-4 sm:mx-8">

                        <div className="flex items-center justify-between mb-1">

                            <span className="text-[9px] font-black text-brand-muted uppercase tracking-widest">
                                Today: {dailySession?.attempted || 0}/{progress?.dailyTarget || 10}
                            </span>

                            <span className="text-[9px] font-black text-brand-accent uppercase tracking-widest">
                                {dailyProgress}%
                            </span>

                        </div>

                        <div className="h-2 bg-brand-light rounded-full overflow-hidden border border-brand-border">

                            <motion.div
                                animate={{ width: `${dailyProgress}%` }}
                                className="h-full bg-gradient-to-r from-brand-accent to-purple-500"
                            />

                        </div>

                    </div>

                    {/* Timer */}

                    <div className={`flex items-center gap-1.5 font-black text-xs px-3 py-1.5 rounded-full ${
                        timeLeft < 15
                            ? "text-red-500 bg-red-50 animate-pulse"
                            : "text-brand-muted bg-brand-light"
                    }`}>

                        <Timer size={14} />

                        {formatTime(timeLeft)}

                    </div>

                </div>

            </div>

            {/* CONTENT */}

            <main className="max-w-3xl mx-auto p-4 sm:p-6 mt-6 sm:mt-10">

                <AnimatePresence mode="wait">

                    <motion.div
                        key={question._id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6 sm:space-y-8"
                    >

                        {/* QUESTION CARD */}

                        <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-sm border border-brand-border">

                            <div className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-widest text-brand-accent flex-wrap">

                                <Brain size={12} />

                                {mode}
                                {" · "}
                                {question.year}
                                {" · "}
                                {question.subjectName || "General"}

                                {question.topicName && (
                                    <span className="text-brand-muted">
                                        · {question.topicName}
                                    </span>
                                )}

                            </div>

                           <h2 className="text-base sm:text-xl font-bold leading-relaxed text-brand-dark whitespace-pre-wrap">
    {question.questionText}
</h2>
                        </div>

                        {/* OPTIONS */}

                        <div className="grid grid-cols-1 gap-3">

                            {question.options.map(opt => {

                                const isCorrect = opt.label === question.correctOption;
                                const isSelected = selectedOption === opt.label;

                                return (

                                    <button
                                        key={opt.label}
                                        onClick={() => handleAnswer(opt.label)}
                                        disabled={submitted}
                                        className={`p-4 sm:p-5 rounded-2xl text-left font-bold transition-all border-2 flex items-center justify-between ${
                                            isSelected
                                                ? "border-brand-accent bg-indigo-50/30"
                                                : "border-brand-border bg-white"
                                        } ${
                                            submitted && isCorrect
                                                ? "!border-green-500 bg-green-50"
                                                : ""
                                        } ${
                                            submitted && isSelected && !isCorrect
                                                ? "!border-red-500 bg-red-50"
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

                                            <span className="text-sm">
                                                {opt.text}
                                            </span>

                                        </div>

                                        {submitted && isCorrect && <CheckCircle2 className="text-green-600 shrink-0" size={20} />}

                                        {submitted && isSelected && !isCorrect && <XCircle className="text-red-600 shrink-0" size={20} />}

                                    </button>
                                );
                            })}

                        </div>

                        {/* EXPLANATION */}

                        {submitted && (

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4 sm:space-y-6"
                            >

                                <div className="bg-brand-dark text-white p-6 sm:p-8 rounded-3xl shadow-xl">

                                    <h4 className="flex items-center gap-2 font-black text-[10px] sm:text-xs uppercase tracking-widest mb-4 opacity-60">
                                        <Info size={14} />
                                        Explanation
                                    </h4>

                                    <p className="text-xs sm:text-sm font-medium leading-relaxed opacity-90">
                                        {question.explanation || "Explanation not available."}
                                    </p>

                                </div>

                                <button
                                    onClick={nextQuestion}
                                    className="w-full bg-brand-accent text-white p-4 sm:p-5 rounded-2xl font-black flex items-center justify-center gap-3 hover:opacity-90 transition-all text-sm sm:text-base"
                                >
                                    Next Question
                                    <ArrowRight size={18} />
                                </button>

                            </motion.div>
                        )}

                        {/* SUBMIT BUTTON */}

                        {!submitted && (

                            <button
                                onClick={handleSubmit}
                                disabled={!selectedOption}
                                className="w-full bg-brand-dark text-white p-4 sm:p-5 rounded-2xl font-black disabled:opacity-30 text-sm sm:text-base hover:bg-brand-accent transition-all"
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
                            className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl"
                        >

                            <div className="text-center mb-6 sm:mb-8">

                                <div className="bg-red-50 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-500">
                                    <AlertTriangle size={28} />
                                </div>

                                <h3 className="text-xl sm:text-2xl font-black">
                                    What went wrong?
                                </h3>

                                <p className="text-xs text-brand-muted font-medium mt-2">
                                    This helps us understand your mistake patterns
                                </p>

                            </div>

                            <div className="grid gap-2 sm:gap-3">

                                {MISTAKE_TYPES.map(type => (

                                    <button
                                        key={type}
                                        onClick={() => finalizeAnswer(type)}
                                        className="p-3 sm:p-4 bg-brand-light hover:bg-brand-accent hover:text-white rounded-xl sm:rounded-2xl text-left font-bold text-xs sm:text-sm transition-all"
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
// MAIN EXPORT (with Suspense)
// =========================

export default function PracticePage() {

    return (

        <Suspense fallback={

            <div className="min-h-screen bg-brand-light flex items-center justify-center">

                <div className="text-center">

                    <div className="w-12 h-12 border-4 border-brand-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />

                    <p className="text-sm font-black text-brand-muted uppercase tracking-widest">
                        Loading...
                    </p>

                </div>

            </div>
        }>

            <PracticeContent />

        </Suspense>
    );
}