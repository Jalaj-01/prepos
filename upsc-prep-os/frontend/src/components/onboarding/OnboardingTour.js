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

    {
        ssr: false,
        loading: () => null
    }
);

// =========================
// STORAGE KEY
// =========================

const ONBOARDING_KEY = "prepos-onboarding-completed";

// =========================
// HELPER: CHECK IF NEW USER
// =========================

const isNewUser = () => {

    if (typeof window === "undefined") return false;

    try {

        // Already completed tour?

        const completed =
            localStorage.getItem(ONBOARDING_KEY);

        if (completed === "true") {

            return false;
        }

        // Is user actually logged in?

        const userInfo =
            localStorage.getItem("userInfo");

        if (!userInfo) {

            return false;
        }

        // CRITICAL: Only show for users who JUST signed up

        const justSignedUp =
            localStorage.getItem("just-signed-up");

        if (justSignedUp !== "true") {

            // Mark as completed so we never check again

            localStorage.setItem(ONBOARDING_KEY, "true");

            return false;
        }

        // Remove the flag so tour doesn't appear again

        localStorage.removeItem("just-signed-up");

        return true;

    } catch (err) {

        console.warn("Cannot access localStorage:", err);

        return false;
    }
};

// =========================
// HELPER: MARK COMPLETED
// =========================

const markCompleted = () => {

    if (typeof window === "undefined") return;

    try {

        localStorage.setItem(ONBOARDING_KEY, "true");

    } catch (err) {

        console.warn("Cannot save to localStorage:", err);
    }
};

// =========================
// TOUR STEPS
// =========================

const tourSteps = [

    {
        target: "body",

        title: "Welcome to PrepOS! 🎉",

        content:
            "Hi! Let's take a quick 2-minute tour to show you everything PrepOS can do. You'll learn about the dashboard, sidebar, search, and all features. Ready? Let's go!",

        placement: "center",

        disableBeacon: true
    },

    {
        target: '[data-tour="sidebar"]',

        title: "📚 The Sidebar — Your Command Center",

        content:
            "This is your navigation hub. It's organized into 5 sections: Overview, Prelims, Mains, Resources, and Insights. Each section contains tools for a specific part of your UPSC journey.",

        placement: "right",

        disableBeacon: true
    },

    {
        target: '[data-tour="nav-prelims"]',

        title: "📝 Prelims Section",

        content:
            "All Prelims tools live here: Daily Practice (solve MCQs), Practice Sets (custom collections), Question Library (browse PYQs), and Revision (Sunday spaced repetition).",

        placement: "right",

        disableBeacon: true
    },

    {
        target: '[data-tour="nav-mains"]',

        title: "🎓 Mains Section",

        content:
            "For Mains preparation: View your Mains Dashboard with progress tracking, and browse the Mains Library with GS1, GS2, GS3, GS4, Essay, and Optional questions.",

        placement: "right",

        disableBeacon: true
    },

    {
        target: '[data-tour="nav-resources"]',

        title: "📂 Resources Section",

        content:
            "Manage your study materials: Community Library (notes shared by other aspirants), My Vault (your personal storage), Book Tracker (track NCERTs/standard books), and Bookmarks.",

        placement: "right",

        disableBeacon: true
    },

    {
        target: '[data-tour="nav-insights"]',

        title: "📊 Insights Section",

        content:
            "Deep analytics on your performance: Analytics (overall trends), Repeated Themes (patterns in PYQs), Trends (subject heatmaps), and Leaderboard (where you rank).",

        placement: "right",

        disableBeacon: true
    },

    {
        target: '[data-tour="search"]',

        title: "🔍 Global Search — Find Anything Instantly",

        content:
            "Press Cmd+K (Mac) or Ctrl+K (Windows) anywhere to open search. Search across questions, notes, folders, study material — everything in one place. Type just 2 letters and see instant results!",

        placement: "bottom",

        disableBeacon: true
    },

    {
        target: '[data-tour="streak"]',

        title: "🔥 Your Streak Counter",

        content:
            "This shows your current daily practice streak. UPSC toppers say consistency beats intensity. Practice every day to keep it growing. Miss a day, and it resets to 0!",

        placement: "bottom",

        disableBeacon: true
    },

    {
        target: '[data-tour="kpi-cards"]',

        title: "📈 Your Key Metrics",

        content:
            "These 4 cards show your most important stats at a glance: Today's Progress, Current Streak, UPSC Readiness Score, and Total Questions Solved. Check them daily for motivation.",

        placement: "bottom",

        disableBeacon: true
    },

    {
        target: '[data-tour="daily-mission"]',

        title: "🎯 Today's Mission",

        content:
            "Based on your target exam date, we calculate exactly how many questions you need daily. The progress bar fills up as you practice. Click 'Continue GS' or 'Continue CSAT' to start instantly!",

        placement: "right",

        disableBeacon: true
    },

    {
        target: '[data-tour="subject-completion"]',

        title: "📚 Subject-wise Progress",

        content:
            "Track how much of each subject you've completed. Green = strong (70%+), Yellow = medium (40-70%), Red = needs work. Toggle between GS and CSAT mode using the buttons.",

        placement: "right",

        disableBeacon: true
    },

    {
        target: '[data-tour="weak-areas"]',

        title: "🧠 Weak Area Intelligence",

        content:
            "AI-powered insights into your weaknesses. See your weakest subject, weakest topic, most common mistake type, and slowest subject. Use this to focus your study time wisely.",

        placement: "right",

        disableBeacon: true
    },

    {
        target: '[data-tour="exam-target"]',

        title: "📅 Your Exam Target",

        content:
            "Shows your daily question target and exam date. Adjust your target date anytime — we'll recalculate how many questions you need to solve daily.",

        placement: "left",

        disableBeacon: true
    },

    {
        target: '[data-tour="quick-access"]',

        title: "⚡ Quick Access",

        content:
            "Shortcuts to the most-used features. One tap to open Mains, Library, Vault, Revision, Books, or Rankings. Pin this in your mind!",

        placement: "left",

        disableBeacon: true
    },

    {
        target: '[data-tour="storage"]',

        title: "💾 Your Storage",

        content:
            "You get 100MB of free storage to upload notes, PDFs, and images. Files are auto-compressed to save space. Click 'Manage Files' to go to your Vault.",

        placement: "left",

        disableBeacon: true
    },

    {
        target: '[data-tour="leaderboard"]',

        title: "🏆 Leaderboard",

        content:
            "See how you rank against other aspirants. Top 5 users are shown here. Click 'View All' for the full rankings. Healthy competition keeps you motivated!",

        placement: "left",

        disableBeacon: true
    },

    {
        target: '[data-tour="adjust-target"]',

        title: "⚙️ Adjust Your Target",

        content:
            "Click this anytime to change your UPSC target date. We'll instantly recalculate how many questions you need to solve per day. Keep it realistic but ambitious!",

        placement: "left",

        disableBeacon: true
    },

    {
        target: '[data-tour="profile"]',

        title: "👤 Profile & Settings",

        content:
            "Click your avatar to access your profile, settings, and logout. The bell icon shows notifications. The percentage shows your overall UPSC readiness score.",

        placement: "bottom",

        disableBeacon: true
    },

    {
        target: "body",

        title: "🚀 You're All Set!",

        content:
            "That's everything! Here are 3 pro tips:\n\n1️⃣ Practice DAILY to build a streak\n2️⃣ Upload your notes to /vault and share with community\n3️⃣ Use Cmd+K to navigate fast\n\nGood luck with your UPSC preparation! 🎯",

        placement: "center",

        disableBeacon: true
    }
];

// =========================
// MAIN COMPONENT
// =========================

export default function OnboardingTour() {

    const [run, setRun] = useState(false);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {

        setMounted(true);

        // Check if user is new

        if (!isNewUser()) {

            return;
        }

        // Wait 1.5 seconds then start tour

        const timer =
            setTimeout(() => {

                setRun(true);

            }, 1500);

        return () => clearTimeout(timer);

    }, []);

    const handleCallback = (data) => {

        const { status, action } = data;

        // Save completion when:
        // - Tour finishes (user goes through all steps)
        // - User skips
        // - User closes

        if (
            status === "finished" ||
            status === "skipped" ||
            action === "close"
        ) {

            setRun(false);

            // CRITICAL: Mark as completed so it never shows again

            markCompleted();
        }
    };

    if (!mounted) return null;

    if (!run) return null;

    return (

        <Joyride

            steps={tourSteps}

            run={run}

            continuous={true}

            showProgress={true}

            showSkipButton={true}

            scrollToFirstStep={true}

            disableScrolling={false}

            disableOverlayClose={true}

            spotlightClicks={false}

            callback={handleCallback}

            styles={{

                options: {

                    primaryColor: "#6366F1",

                    textColor: "#0A0A0A",

                    backgroundColor: "#FFFFFF",

                    overlayColor: "rgba(10, 10, 10, 0.85)",

                    arrowColor: "#FFFFFF",

                    zIndex: 9999,

                    width: 400
                },

                tooltipContainer: {

                    textAlign: "left"
                },

                tooltipTitle: {

                    fontSize: "20px",

                    fontWeight: 900,

                    color: "#0A0A0A",

                    marginBottom: "8px",

                    letterSpacing: "-0.02em",

                    lineHeight: "1.3"
                },

                tooltipContent: {

                    fontSize: "14px",

                    fontWeight: 500,

                    color: "#525252",

                    lineHeight: 1.7,

                    whiteSpace: "pre-line",

                    padding: "8px 0"
                },

                buttonNext: {

                    backgroundColor: "#0A0A0A",

                    color: "#FFFFFF",

                    fontWeight: 900,

                    fontSize: "11px",

                    padding: "10px 22px",

                    borderRadius: "12px",

                    textTransform: "uppercase",

                    letterSpacing: "2px",

                    outline: "none",

                    border: "none"
                },

                buttonBack: {

                    color: "#737373",

                    fontWeight: 700,

                    fontSize: "11px",

                    marginRight: "8px",

                    textTransform: "uppercase",

                    letterSpacing: "2px"
                },

                buttonSkip: {

                    color: "#737373",

                    fontWeight: 700,

                    fontSize: "11px",

                    textTransform: "uppercase",

                    letterSpacing: "2px"
                }
            }}

            locale={{

                back: "Back",

                close: "Close",

                last: "Get Started! 🚀",

                next: "Next →",

                open: "Open tour",

                skip: "Skip Tour"
            }}
        />
    );
}