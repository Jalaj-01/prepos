"use client";

import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    useCallback,
} from "react";

const FocusTimerContext = createContext(null);

const STORAGE_KEY = "prepos-focus-timer";

// mode: "stopwatch" | "timer"
// status: "idle" | "running" | "paused" | "finished"

const DEFAULT_STATE = {
    mode: "stopwatch",
    status: "idle",
    durationMs: 25 * 60 * 1000, // for timer mode
    elapsedMs: 0, // computed when paused
    startedAt: null, // ISO when last started
    label: "",
};

export function FocusTimerProvider({ children }) {
    const [state, setState] = useState(DEFAULT_STATE);
    const [tick, setTick] = useState(0); // forces re-render every second
    const [open, setOpenRaw] = useState(false);

const setOpen = (val) => {
    if (val === true) stopSound(); // opening modal stops the alert
    setOpenRaw(val);
};
    const intervalRef = useRef(null);
    const audioCtxRef = useRef(null);
    const hydrated = useRef(false);

    // ─── Hydrate from localStorage on mount ───
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                setState((s) => ({ ...s, ...parsed }));
            }
        } catch {}
        hydrated.current = true;
    }, []);

    // ─── Persist ───
    useEffect(() => {
        if (!hydrated.current) return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch {}
    }, [state]);

    // ─── Tick interval when running ───
    useEffect(() => {
        if (state.status === "running") {
            intervalRef.current = setInterval(() => setTick((t) => t + 1), 250);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [state.status]);

    // ─── Computed elapsed (live) ───
    const getElapsed = useCallback(() => {
        if (state.status === "running" && state.startedAt) {
            return state.elapsedMs + (Date.now() - new Date(state.startedAt).getTime());
        }
        return state.elapsedMs;
    }, [state]);

    // ─── Auto-finish timer when it hits 0 ───
    useEffect(() => {
        if (state.mode !== "timer" || state.status !== "running") return;
        const elapsed = getElapsed();
        if (elapsed >= state.durationMs) {
            setState((s) => ({
                ...s,
                status: "finished",
                elapsedMs: s.durationMs,
                startedAt: null,
            }));
            notifyDone();
        }
    }, [tick, state, getElapsed]);

   // ─── Notification + beep ───
const notifyDone = () => {
    // Browser notification
    try {
        if ("Notification" in window) {
            if (Notification.permission === "granted") {
                new Notification("⏰ Focus session complete!", {
                    body: state.label || "Take a short break — you earned it.",
                    icon: "/icon-192x192.png",
                    tag: "prepos-focus",
                });
            }
        }
    } catch {}

    // Audio beep — Web Audio API (stoppable via stopSound())
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
            // Close any previous context first
            if (audioCtxRef.current) {
                try {
                    audioCtxRef.current.close();
                } catch {}
            }

            const ctx = new AudioCtx();
            audioCtxRef.current = ctx;

            const playBeep = (freq, startOffset) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = "sine";
                osc.frequency.value = freq;
                osc.connect(gain);
                gain.connect(ctx.destination);

                const t = ctx.currentTime + startOffset;
                gain.gain.setValueAtTime(0, t);
                gain.gain.linearRampToValueAtTime(0.3, t + 0.05);
                gain.gain.linearRampToValueAtTime(0, t + 0.6);

                osc.start(t);
                osc.stop(t + 0.6);
            };

            // Play 3 ding-dong cycles over ~3 seconds so user notices
            playBeep(880, 0);     // A5
            playBeep(660, 0.4);   // E5
            playBeep(880, 1.2);
            playBeep(660, 1.6);
            playBeep(880, 2.4);
            playBeep(660, 2.8);

            // Auto-cleanup after 4 seconds
            setTimeout(() => {
                if (audioCtxRef.current === ctx) {
                    try {
                        ctx.close();
                    } catch {}
                    audioCtxRef.current = null;
                }
            }, 4000);
        }
    } catch {}
};

// ─── Stop the alert sound manually ───
const stopSound = () => {
    if (audioCtxRef.current) {
        try {
            audioCtxRef.current.close();
        } catch {}
        audioCtxRef.current = null;
    }
};

    // ─── Actions ───
    const start = (opts = {}) => {
        const next = { ...state, ...opts };

        // If switching mode or starting fresh, reset elapsed
        if (state.status === "idle" || state.status === "finished" || opts.mode) {
            next.elapsedMs = 0;
        }

        next.status = "running";
        next.startedAt = new Date().toISOString();

        // Request notification permission on first start
        try {
            if (
                "Notification" in window &&
                Notification.permission === "default"
            ) {
                Notification.requestPermission();
            }
        } catch {}

        setState(next);
    };

    const pause = () => {
        setState((s) => ({
            ...s,
            status: "paused",
            elapsedMs: getElapsed(),
            startedAt: null,
        }));
    };

    const resume = () => {
        setState((s) => ({
            ...s,
            status: "running",
            startedAt: new Date().toISOString(),
        }));
    };

    const reset = () => {
        stopSound(); 
        setState((s) => ({
            ...s,
            status: "idle",
            elapsedMs: 0,
            startedAt: null,
        }));
    };

    const setMode = (mode) => {
        setState((s) => ({
            ...s,
            mode,
            status: "idle",
            elapsedMs: 0,
            startedAt: null,
        }));
    };

    const setDuration = (ms) => {
        setState((s) => ({
            ...s,
            durationMs: ms,
            elapsedMs: 0,
            status: "idle",
            startedAt: null,
        }));
    };

    const setLabel = (label) => setState((s) => ({ ...s, label }));

   const value = {
    ...state,
    elapsedLive: getElapsed(),
    tick,
    open,
    setOpen,
    start,
    pause,
    resume,
    reset,
    setMode,
    setDuration,
    setLabel,
    stopSound,
};

    return (
        <FocusTimerContext.Provider value={value}>
            {children}
        </FocusTimerContext.Provider>
    );
}

export function useFocusTimer() {
    const ctx = useContext(FocusTimerContext);
    if (!ctx)
        throw new Error("useFocusTimer must be used inside FocusTimerProvider");
    return ctx;
}