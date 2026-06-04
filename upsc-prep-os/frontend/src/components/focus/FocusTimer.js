"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Timer,
    Play,
    Pause,
    RotateCcw,
    X,
    Hourglass,
    Watch,
    CheckCircle2,
    VolumeX,
} from "lucide-react";
import { useFocusTimer } from "./FocusTimerProvider";

const TIMER_PRESETS = [
    { label: "15", ms: 15 * 60 * 1000 },
    { label: "25", ms: 25 * 60 * 1000 },
    { label: "45", ms: 45 * 60 * 1000 },
    { label: "60", ms: 60 * 60 * 1000 },
    { label: "90", ms: 90 * 60 * 1000 },
];

const CUSTOM_MIN = 1;     // minimum 1 minute
const CUSTOM_MAX = 480;   // max 8 hours

const formatTime = (ms) => {
    if (ms < 0) ms = 0;
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const mm = String(m).padStart(2, "0");
    const ss = String(s).padStart(2, "0");
    if (h > 0) return `${h}:${mm}:${ss}`;
    return `${mm}:${ss}`;
};

export default function FocusTimer() {
    const {
    mode,
    status,
    durationMs,
    elapsedLive,
    open,
    setOpen,
    start,
    pause,
    resume,
    reset,
    setMode,
    setDuration,
    label,
    setLabel,
    stopSound,
} = useFocusTimer();

    // Check if current duration matches any preset
const matchesPreset = TIMER_PRESETS.some((p) => p.ms === durationMs);
const customLabel =
    !matchesPreset && durationMs > 0
        ? `${Math.round(durationMs / 60000)}m`
        : "Custom";

const applyCustom = () => {
    const n = parseInt(customMin, 10);
    if (!n || n < CUSTOM_MIN || n > CUSTOM_MAX) return;
    setDuration(n * 60 * 1000);
    setShowCustom(false);
    setCustomMin("");
};

    const isRunning = status === "running";
    const [showCustom, setShowCustom] = useState(false);
    const [customMin, setCustomMin] = useState("");
    const isPaused = status === "paused";
    const isFinished = status === "finished";

    const display =
        mode === "stopwatch"
            ? formatTime(elapsedLive)
            : formatTime(Math.max(0, durationMs - elapsedLive));

    const progress =
        mode === "timer" && durationMs > 0
            ? Math.min((elapsedLive / durationMs) * 100, 100)
            : 0;

    // ─── Don't show on auth pages etc ───
    if (typeof window !== "undefined") {
        const path = window.location.pathname;
        if (
            path === "/" ||
            path.startsWith("/login") ||
            path.startsWith("/signup") ||
            path.startsWith("/about") ||
            path.startsWith("/forgot-password") ||
            path.startsWith("/privacy") ||
            path.startsWith("/terms") ||
            path.startsWith("/contact")
        ) {
            // hide unless currently running (don't surprise user)
            if (status === "idle") return null;
        }
    }

    return (
        <>
            {/* FLOATING BUBBLE */}
            <AnimatePresence>
                {!open && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setOpen(true)}
                        className={`fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-[80] flex items-center gap-2 pl-3 pr-4 py-2.5 rounded-full shadow-xl border transition-all ${
                            isRunning
                                ? "bg-brand-dark text-white border-brand-dark"
                                : isFinished
                                ? "bg-green-600 text-white border-green-600"
                                : "bg-white text-brand-dark border-brand-border hover:border-brand-dark"
                        }`}
                        title="Focus Timer"
                    >
                        <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center ${
                                isRunning
                                    ? "bg-white/15"
                                    : isFinished
                                    ? "bg-white/15"
                                    : "bg-brand-light"
                            }`}
                        >
                            {isFinished ? (
                                <CheckCircle2 size={14} />
                            ) : mode === "stopwatch" ? (
                                <Watch size={14} />
                            ) : (
                                <Hourglass size={14} />
                            )}
                        </div>
                        <span className="text-xs font-black tabular-nums">
                            {status === "idle" ? "Focus" : display}
                        </span>
                        {isRunning && (
                            <span className="relative flex h-2 w-2 ml-0.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                            </span>
                        )}
                    </motion.button>
                )}
            </AnimatePresence>

            {/* EXPANDED MODAL */}
            <AnimatePresence>
                {open && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setOpen(false)}
                            className="fixed inset-0 bg-brand-dark/70 backdrop-blur-md z-[110]"
                        />

                        <motion.div
                            initial={{ scale: 0.92, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.92, opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 24, stiffness: 280 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[120] w-[92%] max-w-md"
                        >
                            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl relative">
                                <button
                                    onClick={() => setOpen(false)}
                                    className="absolute top-4 right-4 p-2 hover:bg-brand-light rounded-xl text-brand-muted"
                                >
                                    <X size={16} />
                                </button>

                                <div className="flex items-center gap-2 mb-1">
                                    <div className="bg-brand-accent/10 p-1.5 rounded-lg">
                                        <Timer size={14} className="text-brand-accent" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
                                        Focus Session
                                    </p>
                                </div>
                                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-brand-dark mb-5">
                                    {mode === "stopwatch" ? "Stopwatch" : "Pomodoro Timer"}
                                </h2>

                                {/* MODE TABS */}
                                <div className="bg-brand-light rounded-xl p-1 flex gap-1 mb-6">
                                    <button
                                        onClick={() => setMode("stopwatch")}
                                        disabled={isRunning}
                                        className={`flex-1 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 ${
                                            mode === "stopwatch"
                                                ? "bg-white text-brand-dark shadow-sm"
                                                : "text-brand-muted hover:text-brand-dark"
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        <Watch size={12} />
                                        Stopwatch
                                    </button>
                                    <button
                                        onClick={() => setMode("timer")}
                                        disabled={isRunning}
                                        className={`flex-1 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 ${
                                            mode === "timer"
                                                ? "bg-white text-brand-dark shadow-sm"
                                                : "text-brand-muted hover:text-brand-dark"
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        <Hourglass size={12} />
                                        Timer
                                    </button>
                                </div>

                                {/* DISPLAY */}
                                <div className="relative bg-gradient-to-br from-brand-dark to-gray-900 text-white rounded-2xl p-8 mb-6 overflow-hidden">
                                    {/* Progress ring for timer */}
                                    {mode === "timer" && (
                                        <div
                                            className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-brand-accent to-purple-400 transition-all duration-300"
                                            style={{ width: `${progress}%` }}
                                        />
                                    )}

                                    <p className="text-center text-[10px] font-black uppercase tracking-widest text-white/50 mb-2">
                                        {isFinished
                                            ? "Session complete 🎉"
                                            : isRunning
                                            ? "In session"
                                            : isPaused
                                            ? "Paused"
                                            : "Ready"}
                                    </p>
                                    <p className="text-center text-5xl sm:text-6xl font-black tracking-tighter tabular-nums">
                                        {display}
                                    </p>
                                </div>

                               {/* PRESETS — timer mode only */}
{mode === "timer" && status === "idle" && (
    <div className="mb-5">
        <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2">
            Duration (minutes)
        </p>

        <div className="grid grid-cols-6 gap-1.5">
            {TIMER_PRESETS.map((p) => (
                <button
                    key={p.label}
                    onClick={() => {
                        setDuration(p.ms);
                        setShowCustom(false);
                    }}
                    className={`py-2 rounded-lg text-xs font-black transition-all ${
                        durationMs === p.ms && !showCustom
                            ? "bg-brand-dark text-white"
                            : "bg-brand-light text-brand-muted hover:text-brand-dark"
                    }`}
                >
                    {p.label}
                </button>
            ))}
            <button
                onClick={() => {
                    setShowCustom(!showCustom);
                    if (!matchesPreset && durationMs > 0) {
                        setCustomMin(String(Math.round(durationMs / 60000)));
                    }
                }}
                className={`py-2 rounded-lg text-xs font-black transition-all ${
                    !matchesPreset || showCustom
                        ? "bg-brand-dark text-white"
                        : "bg-brand-light text-brand-muted hover:text-brand-dark"
                }`}
            >
                {customLabel}
            </button>
        </div>

        {/* CUSTOM INPUT (expands inline) */}
        <AnimatePresence>
            {showCustom && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                >
                    <div className="mt-3 p-3 bg-brand-light border border-brand-border rounded-xl">
                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2">
                            Custom duration ({CUSTOM_MIN}–{CUSTOM_MAX} min)
                        </p>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                min={CUSTOM_MIN}
                                max={CUSTOM_MAX}
                                value={customMin}
                                onChange={(e) => setCustomMin(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        applyCustom();
                                    }
                                }}
                                placeholder="e.g. 50"
                                autoFocus
                                className="flex-1 px-3 py-2 bg-white border border-brand-border rounded-lg text-sm font-bold outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all"
                            />
                            <button
                                onClick={applyCustom}
                                disabled={
                                    !customMin ||
                                    parseInt(customMin, 10) < CUSTOM_MIN ||
                                    parseInt(customMin, 10) > CUSTOM_MAX
                                }
                                className="px-4 py-2 bg-brand-dark text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-brand-accent transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Set
                            </button>
                        </div>
                        <p className="text-[10px] font-bold text-brand-muted mt-2">
                            Tip: press Enter to apply
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
)}

                                {/* LABEL */}
                                {status === "idle" && (
                                    <div className="mb-5">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2">
                                            What are you focusing on?
                                        </p>
                                        <input
                                            type="text"
                                            value={label}
                                            onChange={(e) => setLabel(e.target.value)}
                                            placeholder="e.g. Polity revision"
                                            className="w-full px-3 py-2.5 bg-brand-light border border-brand-border rounded-xl text-sm font-bold outline-none focus:border-brand-accent transition-all"
                                        />
                                    </div>
                                )}

                                {/* CONTROLS */}
                                <div className="flex gap-2">
                                    {status === "idle" && (
                                        <button
                                            onClick={() => start()}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-brand-dark text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-accent transition-all"
                                        >
                                            <Play size={14} />
                                            Start
                                        </button>
                                    )}

                                    {isRunning && (
                                        <>
                                            <button
                                                onClick={pause}
                                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-brand-dark text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-accent transition-all"
                                            >
                                                <Pause size={14} />
                                                Pause
                                            </button>
                                            <button
                                                onClick={reset}
                                                className="px-4 py-3 bg-brand-light text-brand-dark rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-border/50 transition-all"
                                                title="Reset"
                                            >
                                                <RotateCcw size={14} />
                                            </button>
                                        </>
                                    )}

                                    {isPaused && (
                                        <>
                                            <button
                                                onClick={resume}
                                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-brand-dark text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-accent transition-all"
                                            >
                                                <Play size={14} />
                                                Resume
                                            </button>
                                            <button
                                                onClick={reset}
                                                className="px-4 py-3 bg-brand-light text-brand-dark rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-border/50 transition-all"
                                                title="Reset"
                                            >
                                                <RotateCcw size={14} />
                                            </button>
                                        </>
                                    )}

                                    {isFinished && (
    <>
        <button
            onClick={stopSound}
            className="px-4 py-3 bg-brand-light text-brand-dark rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-border/50 transition-all flex items-center gap-1.5"
            title="Stop sound"
        >
            <VolumeX size={14} />
            Mute
        </button>
        <button
            onClick={reset}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-green-700 transition-all"
        >
            <RotateCcw size={14} />
            Start New Session
        </button>
    </>
)}
                                </div>

                                <p className="text-[10px] font-bold text-center text-brand-muted mt-4 leading-relaxed">
                                    Timer keeps running across pages.
                                    {mode === "timer" &&
                                        " You'll get a notification when it ends."}
                                </p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}