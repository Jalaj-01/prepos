"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sparkles,
    Target,
    GraduationCap,
    Brain,
    Calendar,
    StickyNote,
    Trophy,
    X,
    ArrowRight,
} from "lucide-react";

const Joyride = dynamic(
    async () => {
        const mod = await import("react-joyride");
        return mod.default || mod.Joyride || mod;
    },
    { ssr: false, loading: () => null }
);

const ONBOARDING_KEY = "prepos-onboarding-completed";

const isNewUser = () => {
    if (typeof window === "undefined") return false;
    try {
        if (localStorage.getItem(ONBOARDING_KEY) === "true") return false;
        const userInfo = localStorage.getItem("userInfo");
        if (!userInfo) return false;
        const justSignedUp = localStorage.getItem("just-signed-up");
        if (justSignedUp !== "true") {
            localStorage.setItem(ONBOARDING_KEY, "true");
            return false;
        }
        localStorage.removeItem("just-signed-up");
        return true;
    } catch {
        return false;
    }
};

const markCompleted = () => {
    try {
        localStorage.setItem(ONBOARDING_KEY, "true");
    } catch {}
};

const isMobile = () => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 1024;
};

// ─── DESKTOP JOYRIDE STEPS ───
const tourSteps = [
    {
        target: "body",
        title: "Welcome to PrepOS 🎉",
        content:
            "Your all-in-one UPSC operating system. Let's take a 60-second tour of the essentials.",
        placement: "center",
        disableBeacon: true,
    },
    {
        target: '[data-tour="sidebar"]',
        title: "Your Command Center",
        content:
            "The sidebar is organised into 5 sections — Overview, Prelims, Mains, Resources & Insights.",
        placement: "right",
        disableBeacon: true,
    },
    {
        target: '[data-tour="nav-prelims"]',
        title: "Prelims Tools",
        content:
            "Daily Practice for MCQs, Practice Sets, Question Library, and Revision.",
        placement: "right",
        disableBeacon: true,
    },
    {
        target: '[data-tour="nav-mains"]',
        title: "Mains Tools",
        content:
            "Track Mains progress and browse questions for GS1–GS4, Essay & Optional.",
        placement: "right",
        disableBeacon: true,
    },
    {
        target: '[data-tour="nav-insights"]',
        title: "Insights & Syllabus",
        content:
            "Analytics, PYQ Intelligence, Syllabus tracker, Leaderboard.",
        placement: "right",
        disableBeacon: true,
    },
    {
        target: '[data-tour="search"]',
        title: "Global Search",
        content:
            "Press ⌘K (Mac) or Ctrl+K (Windows) anywhere to search instantly.",
        placement: "bottom",
        disableBeacon: true,
    },
    {
        target: '[data-tour="streak"]',
        title: "Daily Streak",
        content:
            "Practice daily — even 10 questions a day will compound massively.",
        placement: "bottom",
        disableBeacon: true,
    },
    {
        target: '[data-tour="kpi-cards"]',
        title: "Your Key Metrics",
        content:
            "Streak, readiness, Prelims solved, and Mains answered — at a glance.",
        placement: "bottom",
        disableBeacon: true,
    },
    {
        target: '[data-tour="quick-access"]',
        title: "Quick Access",
        content: "One-tap shortcuts to your most-used pages.",
        placement: "left",
        disableBeacon: true,
    },
    {
        target: '[data-tour="adjust-target"]',
        title: "Adjust Your Target",
        content:
            "Change your exam date anytime — we'll recalculate your daily target.",
        placement: "left",
        disableBeacon: true,
    },
    {
        target: "body",
        title: "You're all set 🚀",
        content:
            "Practice daily, upload notes to My Vault, and use ⌘K to navigate fast. Good luck!",
        placement: "center",
        disableBeacon: true,
    },
];

// ─── MOBILE WELCOME CARD ───
function MobileWelcomeCard({ onClose }) {
    const features = [
        { icon: Target, label: "Daily Practice", color: "from-blue-500 to-cyan-500", desc: "Smart MCQs calibrated to your exam date" },
        { icon: GraduationCap, label: "Mains Library", color: "from-green-500 to-emerald-500", desc: "GS1–GS4, Essay & Optional papers" },
        { icon: Brain, label: "PYQ Intelligence", color: "from-orange-500 to-red-500", desc: "Pattern analysis on what UPSC asks" },
        { icon: Calendar, label: "Personal Planner", color: "from-pink-500 to-rose-500", desc: "Plan your week, build habits" },
        { icon: StickyNote, label: "Sticky Notes", color: "from-yellow-500 to-amber-500", desc: "Capture insights, formulas & key facts" },
        { icon: Trophy, label: "Leaderboard", color: "from-amber-500 to-orange-500", desc: "Stay motivated with the community" },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-dark/80 backdrop-blur-md z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden"
            >
                {/* Header */}
                <div className="relative bg-gradient-to-br from-brand-accent to-purple-600 text-white p-6 pb-8">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
                    >
                        <X size={16} />
                    </button>
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-3">
                        <Sparkles size={22} className="text-white fill-white" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">
                        Welcome to PrepOS 🎉
                    </h2>
                    <p className="text-white/80 text-sm font-medium mt-1.5 leading-relaxed">
                        Your all-in-one UPSC command center. Here's what you can do.
                    </p>
                </div>

                {/* Features */}
                <div className="flex-1 overflow-y-auto p-5 space-y-3 -mt-3 bg-white rounded-t-3xl">
                    {features.map((f, i) => {
                        const Icon = f.icon;
                        return (
                            <motion.div
                                key={f.label}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 + i * 0.05 }}
                                className="flex items-start gap-3 p-3 bg-brand-light rounded-2xl"
                            >
                                <div
                                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center shrink-0`}
                                >
                                    <Icon size={16} className="text-white" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-black text-brand-dark">
                                        {f.label}
                                    </p>
                                    <p className="text-[11px] font-medium text-brand-muted mt-0.5 leading-relaxed">
                                        {f.desc}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}

                    {/* Pro tips */}
                    <div className="bg-gradient-to-br from-brand-dark to-gray-900 text-white rounded-2xl p-4 mt-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-accent mb-2">
                            💡 Pro tips
                        </p>
                        <ul className="space-y-1.5 text-xs font-medium text-white/80 leading-relaxed">
                            <li>1️⃣ Practice DAILY to build your streak</li>
                            <li>2️⃣ Tap the menu icon ☰ to explore sections</li>
                            <li>3️⃣ Upload your notes to My Vault</li>
                            <li>4️⃣ Use Sticky Notes for quick captures</li>
                        </ul>
                    </div>
                </div>

                {/* Footer CTA */}
                <div className="p-5 border-t border-brand-border bg-white">
                    <button
                        onClick={onClose}
                        className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-dark text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-accent transition-all"
                    >
                        Let's Begin
                        <ArrowRight size={14} />
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ─── MAIN COMPONENT ───
export default function OnboardingTour() {
    const [run, setRun] = useState(false);
    const [showMobileWelcome, setShowMobileWelcome] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (!isNewUser()) return;

        const timer = setTimeout(() => {
            if (isMobile()) {
                setShowMobileWelcome(true);
            } else {
                setRun(true);
            }
        }, 800);

        return () => clearTimeout(timer);
    }, []);

    const handleJoyrideCallback = (data) => {
        const { status, action } = data;
        if (status === "finished" || status === "skipped" || action === "close") {
            setRun(false);
            markCompleted();
        }
    };

    const handleMobileClose = () => {
        setShowMobileWelcome(false);
        markCompleted();
    };

    if (!mounted) return null;

    return (
        <>
            {/* Desktop — Joyride tour */}
            {run && (
                <Joyride
                    steps={tourSteps}
                    run={run}
                    continuous
                    showProgress
                    showSkipButton
                    scrollToFirstStep
                    disableScrolling={false}
                    disableOverlayClose
                    spotlightClicks={false}
                    callback={handleJoyrideCallback}
                    floaterProps={{
                        styles: {
                            arrow: { length: 8, spread: 12 },
                            floater: {
                                filter: "drop-shadow(0 10px 30px rgba(10,10,10,0.18))",
                            },
                        },
                    }}
                    styles={{
                        options: {
                            primaryColor: "#0A0A0A",
                            textColor: "#0A0A0A",
                            backgroundColor: "#FFFFFF",
                            overlayColor: "rgba(10, 10, 10, 0.78)",
                            arrowColor: "#FFFFFF",
                            zIndex: 9999,
                            width: 380,
                        },
                        spotlight: { borderRadius: 16 },
                        tooltip: {
                            borderRadius: 20,
                            padding: 24,
                            boxShadow: "0 20px 60px -10px rgba(10,10,10,0.25)",
                        },
                        tooltipTitle: {
                            fontSize: "18px",
                            fontWeight: 900,
                            color: "#0A0A0A",
                            marginBottom: "10px",
                            letterSpacing: "-0.02em",
                            lineHeight: 1.3,
                        },
                        tooltipContent: {
                            fontSize: "13.5px",
                            fontWeight: 500,
                            color: "#525252",
                            lineHeight: 1.65,
                            whiteSpace: "pre-line",
                            padding: 0,
                        },
                        tooltipFooter: { marginTop: 20, alignItems: "center" },
                        buttonNext: {
                            backgroundColor: "#0A0A0A",
                            color: "#FFFFFF",
                            fontWeight: 900,
                            fontSize: "10px",
                            padding: "11px 20px",
                            borderRadius: "12px",
                            textTransform: "uppercase",
                            letterSpacing: "0.15em",
                            border: "none",
                        },
                        buttonBack: {
                            color: "#737373",
                            fontWeight: 800,
                            fontSize: "10px",
                            marginRight: 8,
                            textTransform: "uppercase",
                            letterSpacing: "0.15em",
                            padding: "11px 16px",
                        },
                        buttonSkip: {
                            color: "#737373",
                            fontWeight: 800,
                            fontSize: "10px",
                            textTransform: "uppercase",
                            letterSpacing: "0.15em",
                            padding: "11px 16px",
                        },
                        buttonClose: { display: "none" },
                    }}
                    locale={{
                        back: "Back",
                        close: "Close",
                        last: "Get Started 🚀",
                        next: "Next",
                        open: "Open tour",
                        skip: "Skip Tour",
                    }}
                />
            )}

            {/* Mobile — Detailed welcome card */}
            <AnimatePresence>
                {showMobileWelcome && (
                    <MobileWelcomeCard onClose={handleMobileClose} />
                )}
            </AnimatePresence>
        </>
    );
}