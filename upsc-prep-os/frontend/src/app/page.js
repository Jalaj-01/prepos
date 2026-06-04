"use client";

import { useEffect, useRef, useState } from "react";

import {
    motion,
    useScroll,
    useTransform,
    useSpring,
    useMotionValue,
} from "framer-motion";

import Link from "next/link";

import {
    ArrowRight,
    Sparkles,
    Target,
    Brain,
    Trophy,
    BookOpen,
    Library,
    GraduationCap,
    TrendingUp,
    FolderOpen,
    CheckCircle2,
    ChevronDown,
    CalendarDays,
    StickyNote,
    BookOpenCheck,
    Lock,
    Heart,
    Gift,
} from "lucide-react";

import Footer from "@/components/layout/Footer";

export default function Home() {

    const containerRef = useRef(null);

    const { scrollYProgress } = useScroll();

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
    });

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    useEffect(() => {
        const handleMouse = (e) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };
        window.addEventListener("mousemove", handleMouse);
        return () => window.removeEventListener("mousemove", handleMouse);
    }, []);

    return (
        <div
            ref={containerRef}
            className="bg-brand-light text-brand-dark overflow-x-hidden"
        >
            {/* Scroll progress bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-accent via-purple-500 to-pink-500 origin-left z-[100]"
                style={{ scaleX: smoothProgress }}
            />

            <Navbar />

            <HeroSection mouseX={mouseX} mouseY={mouseY} />

            <PhilosophySection />

            <InteractiveFeatures />

            <LivePreviewSection />

            <CompleteFeatureGrid />

            <DualStageSection />

            <JourneySection />

            <ManifestoSection />

            <TrustStrip />

            <FinalCTA />

            <Footer />
        </div>
    );
}

// =====================================================
// NAVBAR
// =====================================================

function Navbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
                scrolled
                    ? "bg-white/80 backdrop-blur-xl border-b border-brand-border"
                    : "bg-transparent"
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2 group">
                    <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                        className="w-9 h-9 bg-brand-dark rounded-xl flex items-center justify-center"
                    >
                        <span className="text-white font-black text-base">P</span>
                    </motion.div>
                    <span className="font-black text-xl tracking-tighter">
                        PrepOS
                    </span>
                </Link>

                <div className="flex items-center gap-2 sm:gap-3">
                    <Link
                        href="/login"
                        className="hidden sm:inline-block font-bold text-sm hover:text-brand-accent transition-colors px-4 py-2"
                    >
                        Sign in
                    </Link>
                    <Link
                        href="/signup"
                        className="bg-brand-dark text-white px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group"
                    >
                        Start Free
                        <ArrowRight
                            size={14}
                            className="group-hover:translate-x-0.5 transition-transform"
                        />
                    </Link>
                </div>
            </div>
        </nav>
    );
}

// =====================================================
// HERO SECTION
// =====================================================

function HeroSection({ mouseX, mouseY }) {
    const heroRef = useRef(null);

    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"],
    });

    const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
    const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

    return (
        <section
            ref={heroRef}
            className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6 pt-20"
        >
            <div className="absolute inset-0 opacity-[0.03]">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, #0A0A0A 1px, transparent 0)`,
                        backgroundSize: "32px 32px",
                    }}
                />
            </div>

            <motion.div
                className="pointer-events-none fixed w-96 h-96 rounded-full bg-brand-accent/10 blur-3xl"
                style={{
                    x: useTransform(mouseX, (v) => v - 192),
                    y: useTransform(mouseY, (v) => v - 192),
                }}
            />

            <FloatingShape
                className="top-32 left-10 sm:left-20"
                color="bg-blue-500/10"
                size="w-32 h-32"
                delay={0}
            />
            <FloatingShape
                className="top-20 right-10 sm:right-20"
                color="bg-purple-500/10"
                size="w-48 h-48"
                delay={1}
            />
            <FloatingShape
                className="bottom-32 left-1/4"
                color="bg-pink-500/10"
                size="w-40 h-40"
                delay={2}
            />

            <motion.div
                style={{ y, opacity }}
                className="relative z-10 max-w-5xl mx-auto text-center"
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="inline-flex items-center gap-2 bg-white border border-brand-border px-4 py-2 rounded-full mb-8 shadow-sm"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                    </span>
                    <span className="text-xs font-black uppercase tracking-widest text-brand-dark">
                        A new way to prepare
                    </span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black leading-[0.95] tracking-tighter mb-8"
                >
                    Your mind.
                    <br />
                    <span className="relative inline-block">
                        <motion.span
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            className="bg-gradient-to-r from-brand-accent via-purple-500 to-pink-500 bg-clip-text text-transparent"
                        >
                            Organized.
                        </motion.span>
                        <motion.svg
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ delay: 1, duration: 1.2 }}
                            viewBox="0 0 300 12"
                            className="absolute -bottom-2 left-0 w-full h-3"
                        >
                            <motion.path
                                d="M 5 6 Q 150 0 295 6"
                                stroke="#6366F1"
                                strokeWidth="3"
                                fill="none"
                                strokeLinecap="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ delay: 1, duration: 1.2 }}
                            />
                        </motion.svg>
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    className="text-base sm:text-xl text-brand-muted font-medium max-w-2xl mx-auto leading-relaxed mb-10"
                >
                    An operating system built for UPSC aspirants who think clearly,
                    study deeply, and want every minute of preparation to count.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
                >
                    <Link
                        href="/signup"
                        className="group relative bg-brand-dark text-white px-8 py-4 rounded-2xl font-black text-base overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            Begin your preparation
                            <ArrowRight
                                size={18}
                                className="group-hover:translate-x-1 transition-transform"
                            />
                        </span>
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-brand-accent via-purple-500 to-pink-500"
                            initial={{ x: "-100%" }}
                            whileHover={{ x: 0 }}
                            transition={{ duration: 0.3 }}
                        />
                    </Link>

                    <Link
                        href="#philosophy"
                        className="group bg-white border-2 border-brand-border px-8 py-4 rounded-2xl font-black text-base hover:border-brand-dark transition-all flex items-center justify-center gap-2"
                    >
                        Understand the philosophy
                        <ChevronDown
                            size={18}
                            className="group-hover:translate-y-1 transition-transform"
                        />
                    </Link>
                </motion.div>
            </motion.div>

            <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-brand-muted"
            >
                <span className="text-[10px] font-black uppercase tracking-widest">
                    Scroll
                </span>
                <ChevronDown size={20} />
            </motion.div>
        </section>
    );
}

// =====================================================
// PHILOSOPHY SECTION
// =====================================================

function PhilosophySection() {
    return (
        <section
            id="philosophy"
            className="py-32 sm:py-48 px-4 sm:px-6 relative"
        >
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-muted mb-6">
                        <div className="w-8 h-[2px] bg-brand-accent" />
                        Our belief
                    </div>

                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-[1.1] mb-8"
                    >
                        UPSC preparation isn't about doing more.
                        <br />
                        <span className="text-brand-muted">
                            It's about doing it{" "}
                            <span className="text-brand-dark italic">right.</span>
                        </span>
                    </motion.h2>

                    <div className="space-y-6 text-base sm:text-lg text-brand-muted font-medium leading-relaxed max-w-3xl">
                        <RevealParagraph delay={0}>
                            Most aspirants don't fail because they didn't work hard. They
                            fail because their preparation was{" "}
                            <strong className="text-brand-dark">scattered</strong> — notes
                            in WhatsApp, PYQs in PDFs, mocks in registers, doubts in their
                            head.
                        </RevealParagraph>

                        <RevealParagraph delay={0.1}>
                            PrepOS exists for a different kind of aspirant. The one who
                            understands that{" "}
                            <strong className="text-brand-dark">
                                systems beat motivation
                            </strong>
                            , that{" "}
                            <strong className="text-brand-dark">
                                data reveals what feelings hide
                            </strong>
                            , and that the best time to revise something is exactly when
                            your brain is about to forget it.
                        </RevealParagraph>

                        <RevealParagraph delay={0.2}>
                            We didn't build another question bank. We built an environment
                            where your preparation finally makes sense to itself.
                        </RevealParagraph>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

// =====================================================
// INTERACTIVE FEATURES (4 deep dives)
// =====================================================

function InteractiveFeatures() {
    const features = [
        {
            number: "01",
            title: "Daily clarity",
            subtitle: "What to solve today, decided for you.",
            description:
                "No more analysis paralysis. Based on your target date, weak areas, and revision schedule, we generate exactly what you should solve today. You just show up.",
            icon: Target,
            gradient: "from-blue-500 via-cyan-500 to-teal-500",
            preview: <DailyClarityPreview />,
        },
        {
            number: "02",
            title: "Memory science",
            subtitle: "Never forget what you've learned.",
            description:
                "Every wrong answer is automatically scheduled for revision on Sunday using spaced repetition. By exam day, you'll remember what others have forgotten three times over.",
            icon: Brain,
            gradient: "from-purple-500 via-pink-500 to-rose-500",
            preview: <MemorySciencePreview />,
        },
        {
            number: "03",
            title: "Pattern intelligence",
            subtitle: "See what UPSC actually tests.",
            description:
                "Our system analyzes years of PYQs to surface the themes that repeat, the topics that dominate, and the trends that matter. Study what counts, ignore what doesn't.",
            icon: TrendingUp,
            gradient: "from-orange-500 via-red-500 to-pink-500",
            preview: <PatternPreview />,
        },
        {
            number: "04",
            title: "Your private library",
            subtitle: "Notes that breathe across devices.",
            description:
                "Store every PDF, screenshot, and handwritten scan in your private vault. Share with the community if you want. Access anywhere, anytime. Forever yours.",
            icon: FolderOpen,
            gradient: "from-green-500 via-emerald-500 to-teal-500",
            preview: <VaultPreview />,
        },
    ];

    return (
        <section className="py-32 px-4 sm:px-6 relative bg-white">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-24"
                >
                    <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-muted mb-6">
                        <div className="w-8 h-[2px] bg-brand-accent" />
                        How it works
                        <div className="w-8 h-[2px] bg-brand-accent" />
                    </div>

                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-[1.1]">
                        Four ideas that
                        <br />
                        <span className="italic text-brand-muted">
                            change everything.
                        </span>
                    </h2>
                </motion.div>

                <div className="space-y-32 sm:space-y-48">
                    {features.map((feature, i) => (
                        <FeatureBlock
                            key={i}
                            feature={feature}
                            reverse={i % 2 !== 0}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

function FeatureBlock({ feature, reverse }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${
                reverse ? "lg:grid-flow-dense" : ""
            }`}
        >
            <div className={reverse ? "lg:col-start-2" : ""}>
                <div className="flex items-center gap-4 mb-6">
                    <span
                        className={`text-6xl sm:text-7xl font-black bg-gradient-to-br ${feature.gradient} bg-clip-text text-transparent leading-none`}
                    >
                        {feature.number}
                    </span>
                    <div
                        className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center`}
                    >
                        <feature.icon className="text-white" size={22} />
                    </div>
                </div>

                <h3 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter mb-4">
                    {feature.title}
                </h3>

                <p className="text-xl sm:text-2xl font-bold text-brand-muted mb-6 italic">
                    {feature.subtitle}
                </p>

                <p className="text-base sm:text-lg text-brand-muted font-medium leading-relaxed">
                    {feature.description}
                </p>
            </div>

            <div className={reverse ? "lg:col-start-1 lg:row-start-1" : ""}>
                {feature.preview}
            </div>
        </motion.div>
    );
}

// =====================================================
// FEATURE PREVIEWS
// =====================================================

function DailyClarityPreview() {
    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="bg-gradient-to-br from-brand-dark to-gray-900 text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-4">
                    Today's Mission
                </p>

                <h4 className="text-3xl font-black mb-2">14 questions to go</h4>

                <p className="text-sm text-white/60 font-medium mb-6">
                    Designed for your target exam date
                </p>

                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mb-6">
                    <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "30%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"
                    />
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                    {["Polity", "History", "Economy"].map((s, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.15 }}
                            className="bg-white/5 rounded-2xl p-3 border border-white/10"
                        >
                            <p className="text-[9px] font-black uppercase text-white/40 tracking-widest mb-1">
                                {s}
                            </p>
                            <p className="text-xl font-black">{[5, 4, 5][i]}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

function MemorySciencePreview() {
    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-100 rounded-3xl p-8 relative overflow-hidden"
        >
            <p className="text-[10px] font-black uppercase tracking-widest text-purple-700 mb-4">
                Sunday Revision
            </p>

            <div className="space-y-3">
                {[
                    { q: "Article 32 vs Article 226", correct: true },
                    { q: "Battle of Plassey causes", correct: false },
                    { q: "Monetary policy tools", correct: true },
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.15 }}
                        className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm"
                    >
                        <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                item.correct ? "bg-green-100" : "bg-orange-100"
                            }`}
                        >
                            {item.correct ? (
                                <CheckCircle2 size={16} className="text-green-600" />
                            ) : (
                                <Brain size={16} className="text-orange-600" />
                            )}
                        </div>

                        <div className="flex-1">
                            <p className="text-sm font-bold text-brand-dark">{item.q}</p>
                            <p className="text-[10px] font-bold text-brand-muted">
                                {item.correct ? "Mastered ✓" : "Revising..."}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-6 bg-purple-100 rounded-2xl p-3 text-center">
                <p className="text-xs font-black text-purple-900">
                    🧠 Reviewed at day 1, 3, 7, 21
                </p>
            </div>
        </motion.div>
    );
}

function PatternPreview() {
    const data = [
        { year: "2024", count: 8 },
        { year: "2023", count: 6 },
        { year: "2022", count: 7 },
        { year: "2021", count: 5 },
        { year: "2020", count: 4 },
    ];

    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-100 rounded-3xl p-8 relative overflow-hidden"
        >
            <p className="text-[10px] font-black uppercase tracking-widest text-orange-700 mb-2">
                Trend Analysis
            </p>

            <h4 className="text-xl font-black text-brand-dark mb-1">
                "Fundamental Rights"
            </h4>

            <p className="text-xs text-brand-muted font-bold mb-6">
                Appears every year — 30 total in 5 years
            </p>

            <div className="space-y-2">
                {data.map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3"
                    >
                        <span className="text-xs font-black text-brand-muted w-12">
                            {item.year}
                        </span>

                        <div className="flex-1 bg-white rounded-full h-8 overflow-hidden border border-orange-100 relative">
                            <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: `${item.count * 10}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: i * 0.1 }}
                                className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-end pr-3"
                            >
                                <span className="text-xs font-black text-white">
                                    {item.count}
                                </span>
                            </motion.div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <p className="text-[10px] font-bold text-orange-900 mt-6 text-center italic">
                🎯 Study what UPSC actually loves
            </p>
        </motion.div>
    );
}

function VaultPreview() {
    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-100 rounded-3xl p-8 relative overflow-hidden"
        >
            <p className="text-[10px] font-black uppercase tracking-widest text-green-700 mb-4">
                Your Vault
            </p>

            <div className="grid grid-cols-2 gap-3">
                {[
                    { name: "Polity", icon: "📜", count: "23 files" },
                    { name: "History", icon: "🏛️", count: "18 files" },
                    { name: "Geography", icon: "🌍", count: "15 files" },
                    { name: "Economy", icon: "💰", count: "12 files" },
                ].map((folder, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all"
                    >
                        <div className="text-3xl mb-2">{folder.icon}</div>
                        <p className="font-black text-sm text-brand-dark">{folder.name}</p>
                        <p className="text-[10px] font-bold text-brand-muted">
                            {folder.count}
                        </p>
                    </motion.div>
                ))}
            </div>

            <div className="mt-4 bg-green-100 rounded-2xl p-3 text-center">
                <p className="text-xs font-black text-green-900">
                    🔒 Private by default. Shareable anytime.
                </p>
            </div>
        </motion.div>
    );
}

// =====================================================
// LIVE PREVIEW (counters)
// =====================================================

function LivePreviewSection() {
    return (
        <section className="py-32 px-4 sm:px-6 bg-brand-dark text-white relative overflow-hidden">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-accent/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />

            <div className="relative max-w-5xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-accent mb-6">
                        <div className="w-8 h-[2px] bg-brand-accent" />
                        Built for depth
                        <div className="w-8 h-[2px] bg-brand-accent" />
                    </div>

                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter mb-12 leading-[1.1]">
                        Every action you take
                        <br />
                        <span className="bg-gradient-to-r from-brand-accent via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            becomes a data point.
                        </span>
                    </h2>
                </motion.div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <Counter target={365} label="Days of preparation tracked" />
                    <Counter
                        target={50}
                        label="Questions analyzed per session"
                        suffix="+"
                    />
                    <Counter target={12} label="Intelligence signals captured" />
                    <Counter target={100} label="Yours forever" suffix="%" />
                </div>
            </div>
        </section>
    );
}

function Counter({ target, label, suffix = "" }) {
    const [value, setValue] = useState(0);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    let start = 0;
                    const duration = 1500;
                    const step = target / (duration / 16);
                    const timer = setInterval(() => {
                        start += step;
                        if (start >= target) {
                            setValue(target);
                            clearInterval(timer);
                        } else {
                            setValue(Math.floor(start));
                        }
                    }, 16);
                    observer.disconnect();
                }
            },
            { threshold: 0.5 }
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [target]);

    return (
        <div ref={ref}>
            <p className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter mb-2 bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">
                {value}
                {suffix}
            </p>
            <p className="text-xs sm:text-sm font-bold text-white/40 uppercase tracking-widest">
                {label}
            </p>
        </div>
    );
}

// =====================================================
// COMPLETE FEATURE GRID — 12 modules
// =====================================================

function CompleteFeatureGrid() {
    const features = [
        {
            icon: Target,
            title: "Daily Practice",
            desc: "Smart MCQ sessions calibrated to your exam date.",
            color: "from-blue-500 to-cyan-500",
        },
        {
            icon: GraduationCap,
            title: "Mains Library",
            desc: "GS1–GS4, Essay & Optional answer-writing practice.",
            color: "from-green-500 to-emerald-500",
        },
        {
            icon: Sparkles,
            title: "Spaced Revision",
            desc: "Wrong answers auto-scheduled for review.",
            color: "from-purple-500 to-pink-500",
        },
        {
            icon: Brain,
            title: "PYQ Intelligence",
            desc: "Years of pattern analysis on what UPSC actually asks.",
            color: "from-orange-500 to-red-500",
        },
        {
            icon: BookOpenCheck,
            title: "Syllabus Tracker",
            desc: "Official UPSC syllabus + your progress, side by side.",
            color: "from-indigo-500 to-blue-500",
        },
        {
            icon: CalendarDays,
            title: "Personal Planner",
            desc: "Plan your week, build habits, never miss a topic.",
            color: "from-pink-500 to-rose-500",
        },
        {
            icon: StickyNote,
            title: "Sticky Notes",
            desc: "Capture insights, formulas & key facts. Always at hand.",
            color: "from-yellow-500 to-amber-500",
        },
        {
            icon: FolderOpen,
            title: "Private Vault",
            desc: "100MB encrypted storage for notes, PDFs & scans.",
            color: "from-teal-500 to-cyan-500",
        },
        {
            icon: Library,
            title: "Community Library",
            desc: "Shared notes from aspirants who've cracked it.",
            color: "from-violet-500 to-purple-500",
        },
        {
            icon: TrendingUp,
            title: "Deep Analytics",
            desc: "Subject-wise accuracy, time trends, readiness score.",
            color: "from-emerald-500 to-green-500",
        },
        {
            icon: Trophy,
            title: "Leaderboard",
            desc: "Compete with serious aspirants. Stay motivated.",
            color: "from-amber-500 to-orange-500",
        },
        {
            icon: BookOpen,
            title: "Book Tracker",
            desc: "NCERTs, standard books, monthly current affairs.",
            color: "from-rose-500 to-pink-500",
        },
    ];

    return (
        <section className="py-32 px-4 sm:px-6 bg-white relative">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-20"
                >
                    <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-muted mb-6">
                        <div className="w-8 h-[2px] bg-brand-accent" />
                        Everything inside
                        <div className="w-8 h-[2px] bg-brand-accent" />
                    </div>

                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-[1.1]">
                        Twelve modules.
                        <br />
                        <span className="italic text-brand-muted">One ecosystem.</span>
                    </h2>

                    <p className="text-base sm:text-lg text-brand-muted font-medium max-w-2xl mx-auto mt-6 leading-relaxed">
                        Everything a serious aspirant needs — no app-switching, no
                        missing pieces, no excuses.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ delay: (i % 3) * 0.1, duration: 0.5 }}
                            whileHover={{ y: -4 }}
                            className="group relative bg-white border border-brand-border rounded-3xl p-6 hover:shadow-xl hover:border-brand-dark/20 transition-all overflow-hidden"
                        >
                            <div
                                className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500`}
                            />

                            <div
                                className={`relative w-11 h-11 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-sm`}
                            >
                                <feature.icon className="text-white" size={20} />
                            </div>

                            <h3 className="text-lg font-black tracking-tight text-brand-dark mb-2">
                                {feature.title}
                            </h3>

                            <p className="text-sm text-brand-muted font-medium leading-relaxed">
                                {feature.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// =====================================================
// DUAL STAGE SECTION (Prelims + Mains)
// =====================================================

function DualStageSection() {
    return (
        <section className="py-32 px-4 sm:px-6 relative bg-brand-light">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-muted mb-6">
                        <div className="w-8 h-[2px] bg-brand-accent" />
                        Built for both stages
                    </div>

                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-[1.1]">
                        Most platforms pick a side.
                        <br />
                        <span className="italic text-brand-muted">
                            We don't make you choose.
                        </span>
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* PRELIMS */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        whileHover={{ y: -6 }}
                        className="bg-gradient-to-br from-brand-dark to-gray-900 text-white rounded-3xl p-8 sm:p-10 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-brand-accent/20 p-2 rounded-xl">
                                    <Target size={20} className="text-brand-accent" />
                                </div>
                                <p className="text-xs font-black uppercase tracking-widest text-brand-accent">
                                    Stage One
                                </p>
                            </div>

                            <h3 className="text-3xl sm:text-4xl font-black tracking-tighter mb-4">
                                Prelims
                            </h3>

                            <p className="text-white/70 font-medium mb-8 leading-relaxed">
                                Master 5000+ PYQs with smart pacing, instant explanations,
                                and spaced repetition. CSAT + GS, both tracks.
                            </p>

                            <ul className="space-y-3">
                                {[
                                    "Daily target calibrated to your exam date",
                                    "GS + CSAT separate progress tracks",
                                    "Subject-wise accuracy heatmap",
                                    "Sunday revision for weak topics",
                                    "Question library with smart filters",
                                ].map((item, i) => (
                                    <motion.li
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.08 }}
                                        className="flex items-start gap-3 text-sm font-medium"
                                    >
                                        <CheckCircle2
                                            size={16}
                                            className="text-brand-accent shrink-0 mt-0.5"
                                        />
                                        <span>{item}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>

                    {/* MAINS */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        whileHover={{ y: -6 }}
                        className="bg-white border-2 border-brand-border rounded-3xl p-8 sm:p-10 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-green-500/10 p-2 rounded-xl">
                                    <GraduationCap size={20} className="text-green-600" />
                                </div>
                                <p className="text-xs font-black uppercase tracking-widest text-green-600">
                                    Stage Two
                                </p>
                            </div>

                            <h3 className="text-3xl sm:text-4xl font-black tracking-tighter text-brand-dark mb-4">
                                Mains
                            </h3>

                            <p className="text-brand-muted font-medium mb-8 leading-relaxed">
                                Answer-writing practice for GS1–GS4, Essay & Optional. Track
                                weekly progress, find your weakest paper.
                            </p>

                            <ul className="space-y-3">
                                {[
                                    "All 6 papers: Essay, GS1–GS4, Optional",
                                    "Word count & time tracking per answer",
                                    "Weakest paper detection",
                                    "Weekly & monthly progress charts",
                                    "Model answers + key points",
                                ].map((item, i) => (
                                    <motion.li
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.08 }}
                                        className="flex items-start gap-3 text-sm font-medium text-brand-dark"
                                    >
                                        <CheckCircle2
                                            size={16}
                                            className="text-green-600 shrink-0 mt-0.5"
                                        />
                                        <span>{item}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

// =====================================================
// JOURNEY SECTION
// =====================================================

function JourneySection() {
    const steps = [
        {
            time: "Day 1",
            title: "You arrive",
            desc: "Set your target. We calculate your daily pace.",
            color: "from-blue-500 to-cyan-500",
        },
        {
            time: "Day 7",
            title: "Patterns emerge",
            desc: "We surface your strongest and weakest areas with data.",
            color: "from-purple-500 to-pink-500",
        },
        {
            time: "Day 30",
            title: "Habits form",
            desc: "Your Sunday revision automates. Your streak builds itself.",
            color: "from-orange-500 to-red-500",
        },
        {
            time: "Exam Day",
            title: "You're ready",
            desc: "Because every step was tracked, measured, and optimized.",
            color: "from-green-500 to-emerald-500",
        },
    ];

    return (
        <section className="py-32 px-4 sm:px-6 bg-white">
            <div className="max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-20"
                >
                    <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-muted mb-6">
                        <div className="w-8 h-[2px] bg-brand-accent" />
                        Your journey
                    </div>

                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-[1.1]">
                        From day one,
                        <br />
                        <span className="italic text-brand-muted">
                            to that one day.
                        </span>
                    </h2>
                </motion.div>

                <div className="relative">
                    <div className="absolute left-8 sm:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-blue-500 via-purple-500 via-orange-500 to-green-500 sm:-translate-x-1/2" />

                    <div className="space-y-12 sm:space-y-24">
                        {steps.map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.6 }}
                                className={`relative flex ${
                                    i % 2 === 0 ? "sm:justify-start" : "sm:justify-end"
                                }`}
                            >
                                <div
                                    className={`w-full sm:w-[45%] pl-20 sm:pl-0 ${
                                        i % 2 === 0 ? "sm:pr-12" : "sm:pl-12"
                                    }`}
                                >
                                    <div className="bg-white border border-brand-border rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all">
                                        <span
                                            className={`inline-block text-xs font-black uppercase tracking-widest bg-gradient-to-r ${step.color} bg-clip-text text-transparent mb-3`}
                                        >
                                            {step.time}
                                        </span>

                                        <h3 className="text-2xl sm:text-3xl font-black tracking-tight mb-3">
                                            {step.title}
                                        </h3>

                                        <p className="text-brand-muted font-medium leading-relaxed">
                                            {step.desc}
                                        </p>
                                    </div>
                                </div>

                                <div
                                    className={`absolute left-8 sm:left-1/2 top-8 w-4 h-4 rounded-full bg-gradient-to-br ${step.color} -translate-x-1/2 ring-4 ring-white shadow-lg`}
                                />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

// =====================================================
// MANIFESTO
// =====================================================

function ManifestoSection() {
    const phrases = [
        "We believe in mornings spent learning, not searching for what to learn.",
        "We believe data tells the truth that anxiety cannot.",
        "We believe knowledge belongs to everyone, not just those who can afford it.",
        "We believe the right system makes you 10x more effective than willpower.",
        "We believe in building, in shipping, in shipping again.",
    ];

    return (
        <section className="py-32 px-4 sm:px-6 relative">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center mb-20"
                >
                    <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-muted mb-6">
                        <div className="w-8 h-[2px] bg-brand-accent" />
                        Manifesto
                        <div className="w-8 h-[2px] bg-brand-accent" />
                    </div>

                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-[1.1]">
                        What we
                        <br />
                        <span className="italic">stand for.</span>
                    </h2>
                </motion.div>

                <div className="space-y-1">
                    {phrases.map((phrase, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ delay: i * 0.1, duration: 0.6 }}
                            className="group py-6 border-b border-brand-border last:border-b-0"
                        >
                            <p className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight leading-relaxed group-hover:translate-x-2 transition-transform">
                                {phrase}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// =====================================================
// TRUST STRIP (3 promises before final CTA)
// =====================================================

function TrustStrip() {
    const promises = [
        {
            icon: Gift,
            title: "100% Free",
            desc: "No paywalls. No premium tier. Built for every aspirant.",
        },
        {
            icon: Lock,
            title: "Private by default",
            desc: "Your notes, your data. Encrypted. Never sold. Never shared.",
        },
        {
            icon: Heart,
            title: "Built with care",
            desc: "By aspirants, for aspirants. Shaped by real feedback, every week.",
        },
    ];

    return (
        <section className="py-24 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {promises.map((p, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white border border-brand-border rounded-3xl p-8 hover:shadow-lg transition-all text-center sm:text-left"
                        >
                            <div className="inline-flex w-12 h-12 rounded-2xl bg-brand-dark items-center justify-center mb-4">
                                <p.icon className="text-white" size={20} />
                            </div>

                            <h3 className="text-lg font-black tracking-tight text-brand-dark mb-2">
                                {p.title}
                            </h3>

                            <p className="text-sm text-brand-muted font-medium leading-relaxed">
                                {p.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// =====================================================
// FINAL CTA
// =====================================================

function FinalCTA() {
    return (
        <section className="py-32 px-4 sm:px-6 relative">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="max-w-4xl mx-auto text-center relative"
            >
                <h2 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-[0.95] mb-8">
                    Start.
                    <br />
                    <span className="bg-gradient-to-r from-brand-accent via-purple-500 to-pink-500 bg-clip-text text-transparent italic">
                        Today.
                    </span>
                </h2>

                <p className="text-base sm:text-lg text-brand-muted font-medium max-w-xl mx-auto mb-10 leading-relaxed">
                    No credit card. No commitment. Just a thoughtful preparation
                    environment that makes the next 365 days count.
                </p>

                <Link
                    href="/signup"
                    className="group inline-flex items-center gap-3 bg-brand-dark text-white px-10 py-5 rounded-2xl font-black text-lg hover:scale-105 transition-all"
                >
                    Begin
                    <motion.div
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        <ArrowRight size={22} />
                    </motion.div>
                </Link>

                <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mt-8">
                    Sign up in 30 seconds
                </p>
            </motion.div>
        </section>
    );
}

// =====================================================
// HELPERS
// =====================================================

function FloatingShape({ className, color, size, delay }) {
    return (
        <motion.div
            animate={{
                y: [0, -20, 0],
                rotate: [0, 5, 0],
            }}
            transition={{
                duration: 6,
                delay,
                repeat: Infinity,
                ease: "easeInOut",
            }}
            className={`absolute ${className} ${size} ${color} rounded-full blur-2xl`}
        />
    );
}

function RevealParagraph({ children, delay }) {
    return (
        <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay, duration: 0.6 }}
        >
            {children}
        </motion.p>
    );
}