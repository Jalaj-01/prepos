"use client";

import {
    useEffect,
    useState
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
    AlertTriangle
} from "lucide-react";

import Link from "next/link";

import {
    useSearchParams
} from "next/navigation";

const MISTAKE_TYPES = [

    "Conceptual",
    "Factual Confusion",
    "Silly Mistake",
    "Guessing",
    "Elimination Failure"
];

export default function PracticePage() {

    // =========================
    // STATE
    // =========================

    const searchParams =
    useSearchParams();

const currentMode =
    searchParams.get("mode") || "GS";

    const [

        question,
        setQuestion

    ] = useState(null);

    const [

        loading,
        setLoading

    ] = useState(true);

    const [

        submitted,
        setSubmitted

    ] = useState(false);

    const [

        selectedOption,
        setSelectedOption

    ] = useState(null);

    const [

        completed,
        setCompleted

    ] = useState(false);

    const [

        progress,
        setProgress

    ] = useState(null);

    const [

        results,
        setResults

    ] = useState({

        correct: 0,
        wrong: 0
    });

    const [

        showMistakeModal,
        setShowMistakeModal

    ] = useState(false);

    const [

        timeLeft,
        setTimeLeft

    ] = useState(45);

    const [

        mode,
        setMode

    ] = useState("GS");

    // =========================
    // FETCH NEXT QUESTION
    // =========================

    const fetchNextQuestion =
    async () => {

        try {

            setLoading(true);

            const userInfo =
                JSON.parse(

                    localStorage.getItem(
                        "userInfo"
                    )
                );

            const { data } =
                await axios.get(

                    `${process.env.NEXT_PUBLIC_API_URL}/api/preparation-track/next-question?mode=${currentMode}`,

                    {

                        headers: {

                            Authorization:
                                `Bearer ${userInfo.token}`
                        }
                    }
                );

            // =========================
            // COMPLETION
            // =========================

            if (data.completed) {

                setCompleted(true);

                setQuestion(null);

                return;
            }

            // =========================
            // REVISION MODE
            // =========================

            if (

                data.mode === "REVISION" &&
                data.questions?.length > 0

            ) {

                setQuestion(
                    data.questions[0]
                );

            } else {

                setQuestion(
                    data.question
                );
            }

            setMode(
                data.mode
            );

            setProgress(
                data.progress
            );

            setSelectedOption(null);

            setSubmitted(false);

            setTimeLeft(45);

        } catch (error) {

            console.error(
                "Fetch Question Error:",
                error
            );

        } finally {

            setLoading(false);
        }
    };

    // =========================
    // INITIAL LOAD
    // =========================

    useEffect(() => {

        fetchNextQuestion();

    }, []);

    // =========================
    // TIMER
    // =========================

    useEffect(() => {

        if (

            loading ||

            submitted ||

            completed ||

            !question

        ) return;

        if (timeLeft <= 0) {

            handleSubmit();

            return;
        }

        const timer =
            setInterval(() => {

                setTimeLeft(prev => prev - 1);

            }, 1000);

        return () =>
            clearInterval(timer);

    }, [

        timeLeft,
        loading,
        submitted,
        completed,
        question
    ]);

    // =========================
    // HANDLE ANSWER
    // =========================

    const handleAnswer =
    (
        label
    ) => {

        if (submitted) return;

        setSelectedOption(label);
    };

    // =========================
    // FINALIZE ANSWER
    // =========================

    const finalizeAnswer =
    async (
        mistakeCategory = "None"
    ) => {

        const isCorrect =
            selectedOption ===
            question.correctOption;

        setSubmitted(true);

        setShowMistakeModal(false);

        try {

            const userInfo =
                JSON.parse(

                    localStorage.getItem(
                        "userInfo"
                    )
                );

            // =========================
            // TRACK SUBMISSION
            // =========================

            await axios.post(

                `${process.env.NEXT_PUBLIC_API_URL}/api/preparation-track/submit-answer`,

                {

                    questionId:
                        question._id,

                    isCorrect,

                    subjectName:
                        question.subjectName,

                    topicName:
                        question.topicName,

                    mode:
                        currentMode
                },
                

                {

                    headers: {

                        Authorization:
                            `Bearer ${userInfo.token}`
                    }
                }
            );

            // =========================
            // ATTEMPT LOGGING
            // =========================

            await axios.post(

                `${process.env.NEXT_PUBLIC_API_URL}/api/attempts/log`,

                {

                    questionId:
                        question._id,

                    isCorrect,

                    selectedOption,

                    mistakeCategory,

                    timeTaken:
                        45 - timeLeft
                },

                {

                    headers: {

                        Authorization:
                            `Bearer ${userInfo.token}`
                    }
                }
            );

            // =========================
            // RESULTS
            // =========================

            if (isCorrect) {

                setResults(prev => ({

                    ...prev,

                    correct:
                        prev.correct + 1
                }));

            } else {

                setResults(prev => ({

                    ...prev,

                    wrong:
                        prev.wrong + 1
                }));
            }

        } catch (error) {

            console.error(
                "Submit Error:",
                error
            );
        }
    };

    // =========================
    // HANDLE SUBMIT
    // =========================

    const handleSubmit =
    () => {

        if (!selectedOption) {

            finalizeAnswer(
                "Time Pressure"
            );

            return;
        }

        const isCorrect =
            selectedOption ===
            question.correctOption;

        if (isCorrect) {

            finalizeAnswer("None");

        } else {

            setShowMistakeModal(true);
        }
    };

    // =========================
    // NEXT QUESTION
    // =========================

    const nextQuestion =
    () => {

        fetchNextQuestion();
    };

    // =========================
    // LOADING
    // =========================

    if (loading) {

        return (

            <div className="min-h-screen bg-brand-light flex items-center justify-center font-black animate-pulse uppercase tracking-widest text-brand-muted">

                Initializing PrepOS Engine...

            </div>
        );
    }

    // =========================
    // COMPLETED
    // =========================

    if (completed) {

        return (

            <div className="min-h-screen bg-brand-light flex items-center justify-center p-6">

                <motion.div

                    initial={{
                        scale: 0.9,
                        opacity: 0
                    }}

                    animate={{
                        scale: 1,
                        opacity: 1
                    }}

                    className="max-w-md w-full bg-white p-10 rounded-[40px] shadow-premium text-center border border-brand-border"

                >

                    <h2 className="text-3xl font-black mb-2">

                        Track Completed

                    </h2>

                    <p className="text-brand-muted font-medium mb-8">

                        Entire preparation pool solved.
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-8">

                        <div className="bg-green-50 p-6 rounded-3xl border border-green-100">

                            <p className="text-xs font-black uppercase mb-1 text-green-600">

                                Correct

                            </p>

                            <p className="text-3xl font-black">

                                {results.correct}

                            </p>

                        </div>

                        <div className="bg-red-50 p-6 rounded-3xl border border-red-100">

                            <p className="text-xs font-black uppercase mb-1 text-red-600">

                                Wrong

                            </p>

                            <p className="text-3xl font-black">

                                {results.wrong}

                            </p>

                        </div>

                    </div>

                    <Link

                        href="/dashboard"

                        className="block w-full bg-brand-dark text-white p-4 rounded-2xl font-bold"

                    >

                        Back To Dashboard

                    </Link>

                </motion.div>

            </div>
        );
    }

    if (!question) return null;

    // =========================
    // UI
    // =========================

    return (

        <div className="min-h-screen bg-brand-light pb-20">

            {/* HEADER */}

            <div className="bg-white border-b border-brand-border p-4 sticky top-0 z-50">

                <div className="max-w-4xl mx-auto flex items-center justify-between px-2">

                    <Link
                        href="/dashboard"
                        className="text-brand-muted"
                    >

                        <LayoutDashboard size={20} />

                    </Link>

                    <div className="flex-1 mx-8">

                        <div className="h-2 bg-brand-light rounded-full overflow-hidden border border-brand-border">

                            <motion.div

                                animate={{
                                    width:
                                        `${((progress?.solved || 0) / (progress?.total || 1)) * 100}%`
                                }}

                                className="h-full bg-brand-accent"

                            />

                        </div>

                    </div>

                    <div className={`flex items-center gap-2 font-black text-xs ${timeLeft < 10 ? "text-red-500 animate-pulse" : "text-brand-muted"}`}>

                        <Timer size={16} />

                        00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}

                    </div>

                </div>

            </div>

            {/* CONTENT */}

            <main className="max-w-3xl mx-auto p-6 mt-10">

                <AnimatePresence mode="wait">

                    <motion.div

                        key={question._id}

                        initial={{
                            opacity: 0,
                            x: 20
                        }}

                        animate={{
                            opacity: 1,
                            x: 0
                        }}

                        exit={{
                            opacity: 0,
                            x: -20
                        }}

                        className="space-y-8"

                    >

                        {/* QUESTION */}

                        <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-premium border border-brand-border">

                            <div className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-widest text-brand-accent">

                                <Brain size={12} />

                                {mode}
                                {" • "}
                                {question.year}
                                {" • "}
                                {question.subjectName}

                            </div>

                            <h2 className="text-xl md:text-2xl font-bold leading-relaxed text-brand-dark">

                                {question.questionText}

                            </h2>

                        </div>

                        {/* OPTIONS */}

                        <div className="grid grid-cols-1 gap-4">

                            {question.options.map(opt => {

                                const isCorrect =
                                    opt.label ===
                                    question.correctOption;

                                const isSelected =
                                    selectedOption ===
                                    opt.label;

                                return (

                                    <button

                                        key={opt.label}

                                        onClick={() =>
                                            handleAnswer(
                                                opt.label
                                            )
                                        }

                                        className={`

                                            p-5 rounded-3xl text-left font-bold transition-all border-2 flex items-center justify-between

                                            ${isSelected
                                                ? "border-brand-accent bg-indigo-50/30"
                                                : "border-brand-border bg-white"
                                            }

                                            ${submitted && isCorrect
                                                ? "!border-green-500 bg-green-50"
                                                : ""
                                            }

                                            ${submitted && isSelected && !isCorrect
                                                ? "!border-red-500 bg-red-50"
                                                : ""
                                            }
                                        `}
                                    >

                                        <div className="flex items-center gap-4">

                                            <span className={`w-10 h-10 rounded-xl flex items-center justify-center border-2

                                                ${isSelected
                                                    ? "bg-brand-accent text-white border-brand-accent"
                                                    : "bg-brand-light border-brand-border"
                                                }
                                            `}>

                                                {opt.label}

                                            </span>

                                            <span>

                                                {opt.text}

                                            </span>

                                        </div>

                                        {submitted && isCorrect &&
                                            <CheckCircle2 className="text-green-600" />
                                        }

                                        {submitted && isSelected && !isCorrect &&
                                            <XCircle className="text-red-600" />
                                        }

                                    </button>
                                );
                            })}
                        </div>

                        {/* EXPLANATION */}

                        {submitted && (

                            <motion.div

                                initial={{
                                    opacity: 0,
                                    y: 20
                                }}

                                animate={{
                                    opacity: 1,
                                    y: 0
                                }}

                                className="space-y-6"

                            >

                                <div className="bg-brand-dark text-white p-8 rounded-[40px] shadow-xl">

                                    <h4 className="flex items-center gap-2 font-black text-xs uppercase tracking-widest mb-4 opacity-60">

                                        <Info size={14} />

                                        Explanation

                                    </h4>

                                    <p className="text-sm font-medium leading-relaxed opacity-90">

                                        {question.explanation}

                                    </p>

                                </div>

                                <button

                                    onClick={nextQuestion}

                                    className="w-full bg-brand-accent text-white p-5 rounded-[24px] font-black flex items-center justify-center gap-3"

                                >

                                    Continue

                                    <ArrowRight size={20} />

                                </button>

                            </motion.div>
                        )}

                        {/* SUBMIT */}

                        {!submitted && (

                            <button

                                onClick={handleSubmit}

                                disabled={!selectedOption}

                                className="w-full bg-brand-dark text-white p-5 rounded-[24px] font-black disabled:opacity-30"

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

                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6">

                        <motion.div

                            initial={{
                                y: 40,
                                opacity: 0
                            }}

                            animate={{
                                y: 0,
                                opacity: 1
                            }}

                            exit={{
                                y: 40,
                                opacity: 0
                            }}

                            className="bg-white w-full max-w-md rounded-[40px] p-8 shadow-2xl"

                        >

                            <div className="text-center mb-8">

                                <div className="bg-red-50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 text-red-500">

                                    <AlertTriangle size={32} />

                                </div>

                                <h3 className="text-2xl font-black">

                                    Analyze Mistake

                                </h3>

                            </div>

                            <div className="grid gap-3">

                                {MISTAKE_TYPES.map(type => (

                                    <button

                                        key={type}

                                        onClick={() =>
                                            finalizeAnswer(type)
                                        }

                                        className="p-4 bg-brand-light hover:bg-brand-accent hover:text-white rounded-2xl text-left font-bold text-sm transition-all"

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