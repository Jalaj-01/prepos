"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// =========================
// DYNAMIC IMPORT
// =========================
const Joyride = dynamic(
    async () => {
        const mod = await import("react-joyride");
        return mod.default || mod.Joyride || mod;
    },
    { ssr: false, loading: () => null }
);

const ONBOARDING_KEY = "prepos-onboarding-completed";

// =========================
// IS NEW USER?
// Only show RIGHT after signup (just-signed-up flag set by signup page)
// =========================
const isNewUser = () => {
    if (typeof window === "undefined") return false;
    try {
        if (localStorage.getItem(ONBOARDING_KEY) === "true") return false;

        const userInfo = localStorage.getItem("userInfo");
        if (!userInfo) return false;

        const justSignedUp = localStorage.getItem("just-signed-up");
        if (justSignedUp !== "true") {
            // Existing user — never show
            localStorage.setItem(ONBOARDING_KEY, "true");
            return false;
        }

        // Clear flag so it never triggers again
        localStorage.removeItem("just-signed-up");
        return true;
    } catch {
        return false;
    }
};

const markCompleted = () => {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(ONBOARDING_KEY, "true");
    } catch {}
};

// =========================
// TOUR STEPS — matches new dashboard
// =========================
const tourSteps = [
    {
        target: "body",
        title: "Welcome to PrepOS 🎉",
        content:
            "Your all-in-one UPSC operating system. Let's take a 60-second tour of the essentials — Prelims, Mains, Planner, Notes & more.",
        placement: "center",
        disableBeacon: true,
    },
    {
        target: '[data-tour="sidebar"]',
        title: "Your Command Center",
        content:
            "The sidebar is organised into 5 sections — Overview, Prelims, Mains, Resources & Insights. Everything you need, one click away.",
        placement: "right",
        disableBeacon: true,
    },
    {
        target: '[data-tour="nav-prelims"]',
        title: "Prelims Tools",
        content:
            "Daily Practice for MCQs, Practice Sets for custom collections, Question Library for PYQs, and Revision for spaced repetition.",
        placement: "right",
        disableBeacon: true,
    },
    {
        target: '[data-tour="nav-mains"]',
        title: "Mains Tools",
        content:
            "Track Mains progress in the dashboard and browse questions for GS1–GS4, Essay & Optional from the library.",
        placement: "right",
        disableBeacon: true,
    },
    {
        target: '[data-tour="nav-insights"]',
        title: "Insights & Syllabus",
        content:
            "Analytics, PYQ Intelligence, the full UPSC Syllabus tracker, and the Leaderboard — all your performance data lives here.",
        placement: "right",
        disableBeacon: true,
    },
    {
        target: '[data-tour="search"]',
        title: "Global Search",
        content:
            "Press ⌘K (Mac) or Ctrl+K (Windows) anywhere to search across questions, notes, folders & more — instantly.",
        placement: "bottom",
        disableBeacon: true,
    },
    {
        target: '[data-tour="streak"]',
        title: "Daily Streak",
        content:
            "Your streak grows when you practice daily. Consistency beats intensity — even 10 questions a day will compound massively.",
        placement: "bottom",
        disableBeacon: true,
    },
    {
        target: '[data-tour="kpi-cards"]',
        title: "Your Key Metrics",
        content:
            "Streak, overall readiness, Prelims solved, and Mains answered — your most important numbers at a glance.",
        placement: "bottom",
        disableBeacon: true,
    },
    {
        target: '[data-tour="quick-access"]',
        title: "Quick Access",
        content:
            "One-tap shortcuts to your most-used pages. Customise your study flow.",
        placement: "left",
        disableBeacon: true,
    },
    {
        target: '[data-tour="storage"]',
        title: "Personal Storage",
        content:
            "100MB free to upload notes, PDFs & images. Files are auto-compressed. Manage everything in My Vault.",
        placement: "left",
        disableBeacon: true,
    },
    {
        target: '[data-tour="leaderboard"]',
        title: "Leaderboard",
        content:
            "See how you stack up against other aspirants. A little healthy competition goes a long way.",
        placement: "left",
        disableBeacon: true,
    },
    {
        target: '[data-tour="adjust-target"]',
        title: "Adjust Your Target",
        content:
            "Change your exam date anytime — we'll auto-recalculate your daily question target. Keep it realistic but ambitious.",
        placement: "left",
        disableBeacon: true,
    },
    {
        target: '[data-tour="profile"]',
        title: "Profile & Settings",
        content:
            "Click your avatar for profile, settings & logout. The bell shows notifications, the streak chip shows your current streak.",
        placement: "bottom",
        disableBeacon: true,
    },
    {
        target: "body",
        title: "You're all set 🚀",
        content:
            "3 quick tips:\n\n1️⃣ Practice DAILY to build your streak\n2️⃣ Upload notes to My Vault and share with the community\n3️⃣ Use ⌘K to navigate faster than the sidebar\n\nGood luck — your UPSC journey starts now.",
        placement: "center",
        disableBeacon: true,
    },
];

// =========================
// COMPONENT
// =========================
export default function OnboardingTour() {
    const [run, setRun] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (!isNewUser()) return;

        // Reduced delay — feels more responsive after signup
        const timer = setTimeout(() => setRun(true), 800);
        return () => clearTimeout(timer);
    }, []);

    const handleCallback = (data) => {
        const { status, action } = data;
        if (
            status === "finished" ||
            status === "skipped" ||
            action === "close"
        ) {
            setRun(false);
            markCompleted();
        }
    };

    if (!mounted || !run) return null;

    return (
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
            callback={handleCallback}
            floaterProps={{
                styles: {
                    arrow: {
                        length: 8,
                        spread: 12,
                    },
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
                spotlight: {
                    borderRadius: 16,
                },
                tooltip: {
                    borderRadius: 20,
                    padding: 24,
                    boxShadow: "0 20px 60px -10px rgba(10,10,10,0.25)",
                },
                tooltipContainer: {
                    textAlign: "left",
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
                tooltipFooter: {
                    marginTop: 20,
                    alignItems: "center",
                },
                buttonNext: {
                    backgroundColor: "#0A0A0A",
                    color: "#FFFFFF",
                    fontWeight: 900,
                    fontSize: "10px",
                    padding: "11px 20px",
                    borderRadius: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    outline: "none",
                    border: "none",
                    transition: "all 0.15s ease",
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
                buttonClose: {
                    display: "none",
                },
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
    );
}