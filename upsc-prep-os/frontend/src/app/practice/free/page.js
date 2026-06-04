"use client";

import { useState, useEffect } from "react";

import { motion, AnimatePresence } from "framer-motion";

import axios from "axios";

import {
    Zap, CheckCircle2, XCircle,
    ArrowRight, Timer, Brain, Info, AlertTriangle,
    Loader2, RotateCcw, BarChart3, Trophy
} from "lucide-react";

import Sidebar from "@/components/layout/Sidebar";

import TopHeader from "@/components/layout/TopHeader";

import Footer from "@/components/layout/Footer";

import MobileNav from "@/components/layout/MobileNav";

import PageHeader from "@/components/ui/PageHeader";

import { showToast } from "@/components/ui/Toast";

const MISTAKE_TYPES = [
    "Conceptual",
    "Factual Confusion",
    "Silly Mistake",
    "Guessing",
    "Elimination Failure"
];

export default function FreePracticePage() {

    const [user, setUser] = useState(null);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    // Filters
    const [year, setYear] = useState("");
    const [subject, setSubject] = useState("");
    const [topic, setTopic] = useState("");
    const [paper, setPaper] = useState("");
    const [questionCount, setQuestionCount] = useState(10);
    const [customCount, setCustomCount] = useState("");

    // Dropdown data
    const [subjects, setSubjects] = useState([]);
    const [topics, setTopics] = useState([]);

    // State
    const [phase, setPhase] = useState("setup");
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [showMistakeModal, setShowMistakeModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);

    // Session results
    const [results, setResults] = useState({
        correct: 0,
        wrong: 0,
        totalTime: 0,
        answers: []
    });

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
    // FETCH SUBJECTS & TOPICS
    // =========================

    useEffect(() => {
        if (!user) return;

        const fetchFilters = async () => {
            try {
                const { data } = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/questions/filters`
                );
                setSubjects(data.subjects || []);
                setTopics(data.topics || []);
            } catch (err) {
                console.error("Filter fetch error", err);
                setSubjects([
                    "History", "Geography", "Polity", "Economy",
                    "Environment", "Science & Technology",
                    "International Relations", "Art & Culture", "Current Affairs"
                ]);
            }
        };

        fetchFilters();
    }, [user]);

    // Filter topics based on selected subject
    const filteredTopics = topics;

    // =========================
    // START FREE PRACTICE
    // =========================

    const startFreePractice = async () => {
        setLoading(true);
        try {
            const params = { limit: questionCount };
            if (year) params.year = year;
            if (subject) params.subject = subject;
            if (topic) params.topic = topic;
            if (paper) params.paper = paper;

            const { data } = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/preparation-track/free-practice`,
                {
                    headers: { Authorization: `Bearer ${user.token}` },
                    params
                }
            );

            if (!data.questions?.length) {
                showToast.error("No questions match your filters");
                return;
            }

            setQuestions(data.questions);
            setCurrentIndex(0);
            setResults({ correct: 0, wrong: 0, totalTime: 0, answers: [] });
            setPhase("practice");
            setTimeLeft(60);
            setSelectedOption(null);
            setSubmitted(false);
            showToast.success(`${data.questions.length} questions loaded!`);
        } catch (err) {
            showToast.error("Failed to load questions");
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // TIMER
    // =========================

    useEffect(() => {
        if (phase !== "practice" || submitted || !questions.length) return;
        if (timeLeft <= 0) { handleSubmit(); return; }
        const timer = setInterval(() => { setTimeLeft(prev => prev - 1); }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft, phase, submitted]);

    // =========================
    // ANSWER HANDLERS
    // =========================

    const handleAnswer = (label) => {
        if (submitted) return;
        setSelectedOption(label);
    };

    const finalizeAnswer = async (mistakeCategory = "None") => {
        const question = questions[currentIndex];
        const isCorrect = selectedOption === question.correctOption;
        const timeTaken = 60 - timeLeft;
        setSubmitted(true);
        setShowMistakeModal(false);

        setResults(prev => ({
            ...prev,
            correct: prev.correct + (isCorrect ? 1 : 0),
            wrong: prev.wrong + (isCorrect ? 0 : 1),
            totalTime: prev.totalTime + timeTaken,
            answers: [...prev.answers, { questionId: question._id, isCorrect, timeTaken, mistakeCategory }]
        }));

        try {
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/attempts/log`,
                { questionId: question._id, isCorrect, selectedOption, mistakeCategory, timeTaken },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
        } catch (err) {
            console.error("Failed to log attempt", err);
        }
    };

    const handleSubmit = () => {
        if (!selectedOption) { finalizeAnswer("Time Pressure"); return; }
        const question = questions[currentIndex];
        if (selectedOption === question.correctOption) {
            finalizeAnswer("None");
        } else {
            setShowMistakeModal(true);
        }
    };

    const nextQuestion = () => {
        if (currentIndex + 1 >= questions.length) { setPhase("results"); return; }
        setCurrentIndex(prev => prev + 1);
        setSelectedOption(null);
        setSubmitted(false);
        setTimeLeft(60);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    if (!user) return null;

    const question = questions[currentIndex];

    return (
        <div className="min-h-screen bg-brand-light flex">
            <Sidebar isAdmin={user.isAdmin} />
            <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

            <div className="flex-1 flex flex-col min-h-screen min-w-0">
                <TopHeader user={user} onMenuClick={() => setMobileNavOpen(true)} />

                <main className="flex-1 p-3 sm:p-6 lg:p-10 max-w-[1200px] w-full mx-auto">

                    {/* ═══════ SETUP PHASE ═══════ */}
                    {phase === "setup" && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>

                            <PageHeader
                                icon={Zap}
                                iconBg="bg-yellow-500/10"
                                iconColor="text-yellow-600"
                                title="Free Practice"
                                description="Pick any subject, topic, or year and start practicing instantly"
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

                                {/* YEAR */}
                                <div className="bg-white rounded-2xl border border-brand-border p-5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-3 block">Year</label>
                                    <select value={year} onChange={(e) => setYear(e.target.value)} className="w-full p-3 bg-brand-light border border-brand-border rounded-xl font-bold text-sm outline-none focus:border-brand-accent">
                                        <option value="">All Years</option>
                                        {[2024,2023,2022,2021,2020,2019,2018,2017].map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>

                                {/* PAPER */}
                                <div className="bg-white rounded-2xl border border-brand-border p-5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-3 block">Paper</label>
                                    <select value={paper} onChange={(e) => setPaper(e.target.value)} className="w-full p-3 bg-brand-light border border-brand-border rounded-xl font-bold text-sm outline-none focus:border-brand-accent">
                                        <option value="">All Papers</option>
                                        <option value="GS1">GS1</option>
                                        <option value="CSAT">CSAT</option>
                                    </select>
                                </div>

                                {/* SUBJECT */}
                                <div className="bg-white rounded-2xl border border-brand-border p-5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-3 block">Subject</label>
                                    <select value={subject} onChange={(e) => { setSubject(e.target.value); setTopic(""); }} className="w-full p-3 bg-brand-light border border-brand-border rounded-xl font-bold text-sm outline-none focus:border-brand-accent">
                                        <option value="">All Subjects</option>
                                        {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>

                                {/* TOPIC */}
                                <div className="bg-white rounded-2xl border border-brand-border p-5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-3 block">Topic</label>
                                    <select value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full p-3 bg-brand-light border border-brand-border rounded-xl font-bold text-sm outline-none focus:border-brand-accent">
                                        <option value="">All Topics</option>
                                        {filteredTopics.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>

                            </div>

                            {/* QUESTION COUNT */}
                            <div className="bg-white rounded-2xl border border-brand-border p-5 mb-6">
                                <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-3 block">How many questions?</label>

                                <div className="flex gap-2 sm:gap-3 flex-wrap mb-3">
                                    {[5,10,15,20,30,50].map(n => (
                                        <button key={n} onClick={() => { setQuestionCount(n); setCustomCount(""); }}
                                            className={`px-4 sm:px-5 py-2.5 rounded-xl font-black text-sm border-2 transition-all ${
                                                questionCount === n && !customCount ? "bg-yellow-500 border-yellow-500 text-white" : "bg-brand-light border-brand-border text-brand-muted hover:border-yellow-400"
                                            }`}>{n}</button>
                                    ))}
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted shrink-0">Or type:</span>
                                    <input type="number" value={customCount}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setCustomCount(val);
                                            if (val && parseInt(val) > 0) setQuestionCount(parseInt(val));
                                        }}
                                        placeholder="Custom number" min="1" max="200"
                                        className="flex-1 p-2.5 bg-brand-light border border-brand-border rounded-xl font-bold text-sm outline-none focus:border-yellow-500"
                                    />
                                </div>
                            </div>

                            {/* START */}
                            <button onClick={startFreePractice} disabled={loading}
                                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:opacity-90 transition-all disabled:opacity-50">
                                {loading ? <Loader2 size={22} className="animate-spin" /> : <Zap size={22} />}
                                {loading ? "Loading..." : `Start with ${questionCount} Questions`}
                            </button>

                            <p className="text-[10px] text-brand-muted text-center mt-3 font-bold">
                                💡 Leave filters empty to practice ALL subjects randomly
                            </p>
                        </motion.div>
                    )}

                    {/* ═══════ PRACTICE PHASE ═══════ */}
                    {phase === "practice" && question && (
                        <div>
                            <div className="bg-white rounded-2xl border border-brand-border p-3 mb-6 flex items-center gap-4">
                                <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest shrink-0">{currentIndex + 1}/{questions.length}</span>
                                <div className="flex-1 h-2 bg-brand-light rounded-full overflow-hidden">
                                    <motion.div animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} className="h-full bg-gradient-to-r from-yellow-400 to-orange-500" />
                                </div>
                                <div className={`flex items-center gap-1.5 font-black text-xs px-3 py-1.5 rounded-full ${timeLeft < 15 ? "text-red-500 bg-red-50 animate-pulse" : "text-brand-muted bg-brand-light"}`}>
                                    <Timer size={14} />{formatTime(timeLeft)}
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div key={question._id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">

                                    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-border">
                                        <div className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-widest text-brand-accent flex-wrap">
                                            <Brain size={12} />{question.year} · {question.subjectName || "General"} · {question.topicName || "Mixed"}
                                        </div>
                                        <h2 className="text-base sm:text-lg font-bold leading-relaxed text-brand-dark">{question.questionText}</h2>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3">
                                        {question.options?.map(opt => {
                                            const isCorrect = opt.label === question.correctOption;
                                            const isSelected = selectedOption === opt.label;
                                            return (
                                                <button key={opt.label} onClick={() => handleAnswer(opt.label)} disabled={submitted}
                                                    className={`p-4 rounded-2xl text-left font-bold transition-all border-2 flex items-center justify-between text-sm ${
                                                        isSelected ? "border-brand-accent bg-indigo-50/30" : "border-brand-border bg-white"
                                                    } ${submitted && isCorrect ? "!border-green-500 bg-green-50" : ""} ${submitted && isSelected && !isCorrect ? "!border-red-500 bg-red-50" : ""}`}>
                                                    <div className="flex items-center gap-3">
                                                        <span className={`w-9 h-9 rounded-xl flex items-center justify-center border-2 text-sm font-black ${isSelected ? "bg-brand-accent text-white border-brand-accent" : "bg-brand-light border-brand-border"}`}>{opt.label}</span>
                                                        <span>{opt.text}</span>
                                                    </div>
                                                    {submitted && isCorrect && <CheckCircle2 className="text-green-600 shrink-0" size={18} />}
                                                    {submitted && isSelected && !isCorrect && <XCircle className="text-red-600 shrink-0" size={18} />}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {submitted && (
                                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                            <div className="bg-brand-dark text-white p-6 rounded-3xl">
                                                <h4 className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest mb-3 opacity-60"><Info size={12} /> Explanation</h4>
                                                <p className="text-xs font-medium leading-relaxed opacity-90">{question.explanation || "Explanation not available."}</p>
                                            </div>
                                            <button onClick={nextQuestion} className="w-full bg-brand-accent text-white p-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:opacity-90 transition-all">
                                                {currentIndex + 1 >= questions.length ? "See Results" : "Next Question"}<ArrowRight size={16} />
                                            </button>
                                        </motion.div>
                                    )}

                                    {!submitted && (
                                        <button onClick={handleSubmit} disabled={!selectedOption} className="w-full bg-brand-dark text-white p-4 rounded-2xl font-black disabled:opacity-30 hover:bg-brand-accent transition-all">Submit Answer</button>
                                    )}

                                </motion.div>
                            </AnimatePresence>
                        </div>
                    )}

                    {/* ═══════ RESULTS PHASE ═══════ */}
                    {phase === "results" && (
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-lg mx-auto">
                            <div className="bg-white p-8 rounded-3xl border border-brand-border text-center">
                                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                    <Trophy size={36} className="text-white" />
                                </div>
                                <h2 className="text-3xl font-black text-brand-dark mb-2">Session Complete! 🎉</h2>
                                <p className="text-brand-muted font-medium mb-6">Here's how you did</p>

                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-center">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-green-700 mb-1">Correct</p>
                                        <p className="text-3xl font-black text-green-600">{results.correct}</p>
                                    </div>
                                    <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-red-700 mb-1">Wrong</p>
                                        <p className="text-3xl font-black text-red-600">{results.wrong}</p>
                                    </div>
                                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-700 mb-1">Accuracy</p>
                                        <p className="text-3xl font-black text-blue-600">{questions.length > 0 ? Math.round((results.correct / questions.length) * 100) : 0}%</p>
                                    </div>
                                    <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 text-center">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-purple-700 mb-1">Avg Time</p>
                                        <p className="text-3xl font-black text-purple-600">{questions.length > 0 ? Math.round(results.totalTime / questions.length) : 0}s</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button onClick={() => setPhase("setup")} className="flex-1 bg-brand-light text-brand-dark py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-brand-border transition-all">
                                        <RotateCcw size={14} />Again
                                    </button>
                                    <button onClick={() => window.location.href = "/analytics"} className="flex-1 bg-brand-dark text-white py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-brand-accent transition-all">
                                        <BarChart3 size={14} />Analytics
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* MISTAKE MODAL */}
                    <AnimatePresence>
                        {showMistakeModal && (
                            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                                <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl">
                                    <div className="text-center mb-6">
                                        <div className="bg-red-50 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 text-red-500"><AlertTriangle size={24} /></div>
                                        <h3 className="text-xl font-black">What went wrong?</h3>
                                    </div>
                                    <div className="grid gap-2">
                                        {MISTAKE_TYPES.map(type => (
                                            <button key={type} onClick={() => finalizeAnswer(type)} className="p-3 bg-brand-light hover:bg-brand-accent hover:text-white rounded-xl text-left font-bold text-sm transition-all">{type}</button>
                                        ))}
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                </main>
                <Footer />
            </div>
        </div>
    );
}