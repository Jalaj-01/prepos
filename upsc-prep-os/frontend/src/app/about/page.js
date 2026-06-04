// "use client";

// import { motion } from "framer-motion";

// import Link from "next/link";

// import {
//     Target,
//     Heart,
//     Sparkles,
//     Users,
//     BookOpen,
//     GraduationCap,
//     Library,
//     FolderOpen,
//     Trophy,
//     Brain,
//     TrendingUp,
//     Shield,
//     Zap,
//     ArrowLeft,
//     Rocket,
//     Calendar,
//     RotateCcw,
//     Bookmark,
//     Layers,
//     BarChart3,
//     Search
// } from "lucide-react";

// import Footer from "@/components/layout/Footer";

// export default function AboutPage() {

//     return (

//         <div className="min-h-screen bg-brand-light flex flex-col">

//             {/* TOP BAR */}

//             <header className="bg-white border-b border-brand-border sticky top-0 z-30">

//                 <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">

//                     <Link
//                         href="/dashboard"
//                         className="flex items-center gap-2"
//                     >

//                         <div className="w-8 h-8 bg-brand-dark rounded-xl flex items-center justify-center">
//                             <span className="text-white font-black text-sm">P</span>
//                         </div>

//                         <span className="font-black text-lg tracking-tighter text-brand-dark">
//                             PrepOS
//                         </span>

//                     </Link>

//                     <Link
//                         href="/dashboard"
//                         className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-muted hover:text-brand-dark transition-all"
//                     >
//                         <ArrowLeft size={14} />
//                         Back
//                     </Link>

//                 </div>

//             </header>

//             <main className="flex-1">

//                 {/* HERO */}

//                 <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-12">

//                     <motion.div
//                         initial={{ opacity: 0, y: 20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         className="text-center"
//                     >

//                         <div className="inline-flex items-center gap-2 bg-brand-accent/10 text-brand-accent px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">

//                             <Sparkles size={12} />

//                             About PrepOS

//                         </div>

//                         <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-brand-dark tracking-tighter mb-6 leading-tight">

//                             Built by aspirants,<br />

//                             <span className="bg-gradient-to-r from-brand-accent to-purple-600 bg-clip-text text-transparent">

//                                 for aspirants

//                             </span>

//                         </h1>

//                         <p className="text-base sm:text-lg text-brand-muted font-medium max-w-2xl mx-auto leading-relaxed">

//                             PrepOS is a modern, free, and intelligent UPSC preparation platform designed to help you crack one of India's toughest exams — without burning a hole in your pocket.

//                         </p>

//                     </motion.div>

//                 </section>

//                 {/* OUR MISSION */}

//                 <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

//                     <motion.div
//                         initial={{ opacity: 0, y: 20 }}
//                         whileInView={{ opacity: 1, y: 0 }}
//                         viewport={{ once: true }}
//                         className="bg-gradient-to-br from-brand-dark to-gray-900 text-white rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden"
//                     >

//                         <div className="absolute top-0 right-0 w-96 h-96 bg-brand-accent/20 rounded-full blur-3xl -translate-y-48 translate-x-48" />

//                         <div className="relative z-10">

//                             <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">

//                                 <Target size={12} />

//                                 Our Mission

//                             </div>

//                             <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-6 leading-tight">

//                                 Democratize UPSC preparation
//                                 <br />

//                                 <span className="text-brand-accent">

//                                     so every aspirant has a fair shot

//                                 </span>

//                             </h2>

//                             <p className="text-base sm:text-lg text-white/70 font-medium leading-relaxed max-w-3xl">

//                                 Traditional UPSC coaching costs ₹1.5-3 lakh per year. Quality study material is locked behind paywalls. Notes are scattered across WhatsApp groups and Telegram channels. We believe knowledge shouldn't be a privilege — it should be a right.

//                             </p>

//                             <p className="text-base sm:text-lg text-white/70 font-medium leading-relaxed mt-4 max-w-3xl">

//                                 PrepOS brings everything together: PYQ practice, Mains library, secure notes storage, community-shared resources, and smart analytics — all in one place, 100% free.

//                             </p>

//                         </div>

//                     </motion.div>

//                 </section>

//                 {/* FEATURES GRID — PRELIMS */}

//                 <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

//                     <motion.div
//                         initial={{ opacity: 0, y: 20 }}
//                         whileInView={{ opacity: 1, y: 0 }}
//                         viewport={{ once: true }}
//                         className="text-center mb-12"
//                     >

//                         <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">

//                             <Target size={12} />

//                             Prelims Toolkit

//                         </div>

//                         <h2 className="text-3xl sm:text-4xl font-black text-brand-dark tracking-tighter mb-3">

//                             Everything for Prelims

//                         </h2>

//                         <p className="text-brand-muted font-medium max-w-xl mx-auto">

//                             Master MCQ-based questions with smart practice, analytics & spaced repetition

//                         </p>

//                     </motion.div>

//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

//                         <FeatureCard
//                             icon={Target}
//                             title="Daily Practice"
//                             description="Solve curated MCQs daily with smart subject mixing. Adaptive difficulty based on your performance."
//                             color="from-blue-500 to-cyan-500"
//                         />

//                         <FeatureCard
//                             icon={BookOpen}
//                             title="Question Library"
//                             description="Browse years of UPSC PYQs with filters by year, subject, topic, paper (GS1, CSAT), and difficulty."
//                             color="from-purple-500 to-pink-500"
//                         />

//                         <FeatureCard
//                             icon={Layers}
//                             title="Practice Sets"
//                             description="Create custom collections of questions. Practice specific topics or weak areas anytime."
//                             color="from-green-500 to-emerald-500"
//                         />

//                         <FeatureCard
//                             icon={RotateCcw}
//                             title="Smart Revision System"
//                             description="Sunday spaced-repetition system automatically revives wrong answers. Never forget what you've learned."
//                             color="from-yellow-500 to-orange-500"
//                             badge="Smart"
//                         />

//                         <FeatureCard
//                             icon={Brain}
//                             title="Repeated Themes"
//                             description="AI analyzes patterns in PYQs to show you which topics repeat across years. Focus on what matters."
//                             color="from-red-500 to-pink-500"
//                         />

//                         <FeatureCard
//                             icon={TrendingUp}
//                             title="Trend Heatmaps"
//                             description="Visualize subject-wise question distribution across years. See which subjects deserve more attention."
//                             color="from-indigo-500 to-purple-500"
//                         />

//                     </div>

//                 </section>

//                 {/* SMART REVISION SPOTLIGHT */}

//                 <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

//                     <motion.div
//                         initial={{ opacity: 0, y: 20 }}
//                         whileInView={{ opacity: 1, y: 0 }}
//                         viewport={{ once: true }}
//                         className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-3xl p-8 sm:p-12 relative overflow-hidden"
//                     >

//                         <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl -translate-y-32 translate-x-32" />

//                         <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

//                             <div>

//                                 <div className="inline-flex items-center gap-2 bg-yellow-500 text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">

//                                     <Sparkles size={12} />

//                                     Featured System

//                                 </div>

//                                 <h2 className="text-3xl sm:text-4xl font-black text-brand-dark tracking-tighter mb-4 leading-tight">

//                                     Smart Revision System

//                                     <br />

//                                     <span className="text-orange-600">

//                                         that actually works

//                                     </span>

//                                 </h2>

//                                 <p className="text-base text-brand-muted font-medium leading-relaxed mb-6">

//                                     Most aspirants attempt 10,000+ MCQs but forget 70% of them. Our Sunday-based spaced repetition system uses proven memory science to make sure you never forget what you've learned.

//                                 </p>

//                                 <div className="space-y-3">

//                                     <RevisionPoint text="Wrong questions auto-saved for revision" />

//                                     <RevisionPoint text="Reappears every Sunday until you master it" />

//                                     <RevisionPoint text="Tracks 'Mastered' vs 'Still Learning' status" />

//                                     <RevisionPoint text="Smart notifications: 'You have 15 questions due for revision'" />

//                                 </div>

//                             </div>

//                             <div className="bg-white rounded-3xl p-6 shadow-xl">

//                                 <div className="flex items-center gap-3 mb-4 pb-4 border-b border-brand-border">

//                                     <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center">

//                                         <Calendar size={22} className="text-white" />

//                                     </div>

//                                     <div>

//                                         <p className="font-black text-brand-dark">📅 Sunday Revision Day</p>

//                                         <p className="text-xs text-brand-muted font-bold">15 questions due</p>

//                                     </div>

//                                 </div>

//                                 <div className="space-y-3">

//                                     <StatRow label="Total Wrong Questions" value="42" color="text-red-600" />

//                                     <StatRow label="Due for Revision" value="15" color="text-orange-600" />

//                                     <StatRow label="Mastered" value="27" color="text-green-600" />

//                                 </div>

//                                 <button className="w-full mt-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-widest">

//                                     Start Revision Session

//                                 </button>

//                             </div>

//                         </div>

//                     </motion.div>

//                 </section>

//                 {/* FEATURES GRID — MAINS */}

//                 <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

//                     <motion.div
//                         initial={{ opacity: 0, y: 20 }}
//                         whileInView={{ opacity: 1, y: 0 }}
//                         viewport={{ once: true }}
//                         className="text-center mb-12"
//                     >

//                         <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">

//                             <GraduationCap size={12} />

//                             Mains Module

//                         </div>

//                         <h2 className="text-3xl sm:text-4xl font-black text-brand-dark tracking-tighter mb-3">

//                             Complete Mains Library

//                         </h2>

//                         <p className="text-brand-muted font-medium max-w-xl mx-auto">

//                             Browse, practice, and track all UPSC Mains questions

//                         </p>

//                     </motion.div>

//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

//                         <FeatureCard
//                             icon={GraduationCap}
//                             title="All Papers Covered"
//                             description="GS1, GS2, GS3, GS4, Essay, and Optional papers. Filter by year, marks, word limit, and topic."
//                             color="from-purple-500 to-pink-500"
//                         />

//                         <FeatureCard
//                             icon={BarChart3}
//                             title="Mains Dashboard"
//                             description="See paper-wise, subject-wise, topic-wise progress. Know exactly how much you've covered."
//                             color="from-pink-500 to-rose-500"
//                         />

//                         <FeatureCard
//                             icon={Bookmark}
//                             title="Done/Not Done Tracking"
//                             description="Simple completion tracking for Mains. No revision pressure — focus on answer writing."
//                             color="from-violet-500 to-purple-500"
//                         />

//                     </div>

//                 </section>

//                 {/* FEATURES GRID — RESOURCES */}

//                 <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

//                     <motion.div
//                         initial={{ opacity: 0, y: 20 }}
//                         whileInView={{ opacity: 1, y: 0 }}
//                         viewport={{ once: true }}
//                         className="text-center mb-12"
//                     >

//                         <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">

//                             <Library size={12} />

//                             Resources & Storage

//                         </div>

//                         <h2 className="text-3xl sm:text-4xl font-black text-brand-dark tracking-tighter mb-3">

//                             Your study material, organized

//                         </h2>

//                         <p className="text-brand-muted font-medium max-w-xl mx-auto">

//                             Personal vault, community sharing, and smart organization

//                         </p>

//                     </motion.div>

//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

//                         <FeatureCard
//                             icon={FolderOpen}
//                             title="Personal Vault"
//                             description="Secure cloud storage for notes, PDFs, images. Nested folders, drag-drop, and auto-compression."
//                             color="from-green-500 to-emerald-500"
//                         />

//                         <FeatureCard
//                             icon={Library}
//                             title="Community Library"
//                             description="Browse notes shared by other aspirants, organized by subject and topic. Bookmark favorites."
//                             color="from-blue-500 to-cyan-500"
//                         />

//                         <FeatureCard
//                             icon={Shield}
//                             title="Secure PDF Viewer"
//                             description="View PDFs with watermark, no download, no print. Protect intellectual property of shared content."
//                             color="from-red-500 to-orange-500"
//                         />

//                     </div>

//                 </section>

//                 {/* FEATURES GRID — INTELLIGENCE */}

//                 <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

//                     <motion.div
//                         initial={{ opacity: 0, y: 20 }}
//                         whileInView={{ opacity: 1, y: 0 }}
//                         viewport={{ once: true }}
//                         className="text-center mb-12"
//                     >

//                         <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">

//                             <Brain size={12} />

//                             Intelligence Layer

//                         </div>

//                         <h2 className="text-3xl sm:text-4xl font-black text-brand-dark tracking-tighter mb-3">

//                             Smart insights, better decisions

//                         </h2>

//                         <p className="text-brand-muted font-medium max-w-xl mx-auto">

//                             Data-driven analytics to guide your preparation

//                         </p>

//                     </motion.div>

//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

//                         <FeatureCard
//                             icon={Brain}
//                             title="Weak Area Intelligence"
//                             description="AI identifies your weakest subjects, topics, and mistake patterns. Focus your time wisely."
//                             color="from-red-500 to-pink-500"
//                         />

//                         <FeatureCard
//                             icon={Trophy}
//                             title="Leaderboard"
//                             description="See how you rank against other aspirants. Healthy competition keeps you motivated."
//                             color="from-yellow-500 to-orange-500"
//                         />

//                         <FeatureCard
//                             icon={Search}
//                             title="Global Search (Cmd+K)"
//                             description="Search across questions, notes, folders — everything in one place with one keyboard shortcut."
//                             color="from-indigo-500 to-purple-500"
//                         />

//                     </div>

//                 </section>

//                 {/* VALUES */}

//                 <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

//                     <motion.div
//                         initial={{ opacity: 0, y: 20 }}
//                         whileInView={{ opacity: 1, y: 0 }}
//                         viewport={{ once: true }}
//                         className="text-center mb-12"
//                     >

//                         <h2 className="text-3xl sm:text-4xl font-black text-brand-dark tracking-tighter mb-3">

//                             What we stand for

//                         </h2>

//                     </motion.div>

//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

//                         <ValueCard
//                             icon={Heart}
//                             title="100% Free, Forever"
//                             description="Core features will always be free. No hidden charges, no premium walls for serious students."
//                             color="bg-red-50 border-red-100 text-red-600"
//                         />

//                         <ValueCard
//                             icon={Shield}
//                             title="Privacy First"
//                             description="Your data belongs to you. We don't sell your information. Period."
//                             color="bg-blue-50 border-blue-100 text-blue-600"
//                         />

//                         <ValueCard
//                             icon={Zap}
//                             title="Built for Speed"
//                             description="Lightning-fast UI, instant search, offline-ready. Time is your most precious resource."
//                             color="bg-yellow-50 border-yellow-100 text-yellow-600"
//                         />

//                         <ValueCard
//                             icon={Users}
//                             title="Community Driven"
//                             description="Every feature is shaped by real aspirant feedback. Your voice matters."
//                             color="bg-green-50 border-green-100 text-green-600"
//                         />

//                     </div>

//                 </section>

//                 {/* STATS */}

//                 <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

//                     <motion.div
//                         initial={{ opacity: 0, y: 20 }}
//                         whileInView={{ opacity: 1, y: 0 }}
//                         viewport={{ once: true }}
//                         className="bg-white rounded-3xl p-8 sm:p-12 border border-brand-border"
//                     >

//                         <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center">

//                             <StatCard label="Free Forever" value="100%" sub="Core features" />

//                             <StatCard label="Modules" value="4+" sub="Prelims, Mains, Vault, Library" />

//                             <StatCard label="Storage Free" value="100MB" sub="Per user, always" />

//                             <StatCard label="Built On" value="₹0" sub="Open infrastructure" />

//                         </div>

//                     </motion.div>

//                 </section>

//                 {/* CTA */}

//                 <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">

//                     <motion.div
//                         initial={{ opacity: 0, y: 20 }}
//                         whileInView={{ opacity: 1, y: 0 }}
//                         viewport={{ once: true }}
//                         className="bg-gradient-to-br from-brand-accent to-purple-600 rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden"
//                     >

//                         <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-32 translate-x-32" />

//                         <div className="relative z-10">

//                             <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">

//                                 <Rocket size={12} />

//                                 Ready to Start?

//                             </div>

//                             <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">

//                                 Your UPSC journey starts now

//                             </h2>

//                             <p className="text-white/80 font-medium mb-8 max-w-xl mx-auto">

//                                 Join thousands of aspirants already preparing smarter with PrepOS.

//                             </p>

//                             <Link
//                                 href="/dashboard"
//                                 className="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-dark rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-all"
//                             >
//                                 Go to Dashboard
//                                 <ArrowLeft size={14} className="rotate-180" />
//                             </Link>

//                         </div>

//                     </motion.div>

//                 </section>

//             </main>

//             <Footer />

//         </div>
//     );
// }

// // =========================
// // HELPER COMPONENTS
// // =========================

// function FeatureCard({ icon: Icon, title, description, color, badge }) {

//     return (

//         <motion.div
//             whileHover={{ y: -4 }}
//             className="bg-white border border-brand-border rounded-3xl p-6 transition-all hover:border-brand-accent relative"
//         >

//             {badge && (

//                 <span className="absolute top-4 right-4 bg-yellow-500 text-white px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest">

//                     {badge}

//                 </span>
//             )}

//             <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4`}>
//                 <Icon size={22} className="text-white" />
//             </div>

//             <h3 className="font-black text-brand-dark text-lg mb-2">
//                 {title}
//             </h3>

//             <p className="text-sm text-brand-muted font-medium leading-relaxed">
//                 {description}
//             </p>

//         </motion.div>
//     );
// }

// function ValueCard({ icon: Icon, title, description, color }) {

//     return (

//         <motion.div
//             whileHover={{ y: -2 }}
//             className={`rounded-3xl p-6 border ${color}`}
//         >

//             <Icon size={24} className="mb-4" />

//             <h3 className="font-black text-brand-dark text-lg mb-2">
//                 {title}
//             </h3>

//             <p className="text-sm text-brand-muted font-medium leading-relaxed">
//                 {description}
//             </p>

//         </motion.div>
//     );
// }

// function StatCard({ label, value, sub }) {

//     return (

//         <div>

//             <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2">
//                 {label}
//             </p>

//             <p className="text-3xl sm:text-4xl font-black text-brand-dark leading-none mb-2">
//                 {value}
//             </p>

//             <p className="text-xs text-brand-muted font-medium">
//                 {sub}
//             </p>

//         </div>
//     );
// }

// function RevisionPoint({ text }) {

//     return (

//         <div className="flex items-start gap-3">

//             <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center shrink-0 mt-0.5">

//                 <span className="text-white text-[10px] font-black">✓</span>

//             </div>

//             <p className="text-sm font-bold text-brand-dark">

//                 {text}

//             </p>

//         </div>
//     );
// }

// function StatRow({ label, value, color }) {

//     return (

//         <div className="flex items-center justify-between py-2">

//             <span className="text-sm font-bold text-brand-muted">

//                 {label}

//             </span>

//             <span className={`text-2xl font-black ${color}`}>

//                 {value}

//             </span>

//         </div>
//     );
// }

"use client";

import { motion } from "framer-motion";

import Link from "next/link";

import {
    Target,
    Heart,
    Sparkles,
    Users,
    BookOpen,
    GraduationCap,
    Library,
    FolderOpen,
    Trophy,
    Brain,
    TrendingUp,
    Shield,
    Zap,
    ArrowLeft,
    Rocket,
    Calendar,
    RotateCcw,
    Bookmark,
    Layers,
    BarChart3,
    Search,
    CalendarDays,
    StickyNote,
    BookOpenCheck,
} from "lucide-react";

import Footer from "@/components/layout/Footer";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-brand-light flex flex-col">

            {/* TOP BAR */}

            <header className="bg-white border-b border-brand-border sticky top-0 z-30">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-brand-dark rounded-xl flex items-center justify-center">
                            <span className="text-white font-black text-sm">P</span>
                        </div>
                        <span className="font-black text-lg tracking-tighter text-brand-dark">
                            PrepOS
                        </span>
                    </Link>

                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-muted hover:text-brand-dark transition-all"
                    >
                        <ArrowLeft size={14} />
                        Back
                    </Link>
                </div>
            </header>

            <main className="flex-1">

                {/* HERO */}

                <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <div className="inline-flex items-center gap-2 bg-brand-accent/10 text-brand-accent px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                            <Sparkles size={12} />
                            About PrepOS
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-brand-dark tracking-tighter mb-6 leading-tight">
                            Built by aspirants,
                            <br />
                            <span className="bg-gradient-to-r from-brand-accent to-purple-600 bg-clip-text text-transparent">
                                for aspirants
                            </span>
                        </h1>

                        <p className="text-base sm:text-lg text-brand-muted font-medium max-w-2xl mx-auto leading-relaxed">
                            PrepOS is a modern, free, and intelligent UPSC preparation
                            platform designed to help you crack one of India's toughest
                            exams — without burning a hole in your pocket.
                        </p>
                    </motion.div>
                </section>

                {/* OUR MISSION */}

                <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-gradient-to-br from-brand-dark to-gray-900 text-white rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-accent/20 rounded-full blur-3xl -translate-y-48 translate-x-48" />

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                                <Target size={12} />
                                Our Mission
                            </div>

                            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-6 leading-tight">
                                Democratize UPSC preparation
                                <br />
                                <span className="text-brand-accent">
                                    so every aspirant has a fair shot
                                </span>
                            </h2>

                            <p className="text-base sm:text-lg text-white/70 font-medium leading-relaxed max-w-3xl">
                                Traditional UPSC coaching costs ₹1.5–3 lakh per year. Quality
                                study material is locked behind paywalls. Notes are scattered
                                across WhatsApp groups and Telegram channels. We believe
                                knowledge shouldn't be a privilege — it should be a right.
                            </p>

                            <p className="text-base sm:text-lg text-white/70 font-medium leading-relaxed mt-4 max-w-3xl">
                                PrepOS brings everything together: PYQ practice, Mains library,
                                a personal planner, sticky notes, syllabus tracking, secure
                                storage, community-shared resources, and smart analytics — all
                                in one place, 100% free.
                            </p>
                        </div>
                    </motion.div>
                </section>

                {/* FEATURES GRID — PRELIMS */}

                <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                            <Target size={12} />
                            Prelims Toolkit
                        </div>

                        <h2 className="text-3xl sm:text-4xl font-black text-brand-dark tracking-tighter mb-3">
                            Everything for Prelims
                        </h2>

                        <p className="text-brand-muted font-medium max-w-xl mx-auto">
                            Master MCQ-based questions with smart practice, analytics &
                            spaced repetition
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <FeatureCard
                            icon={Target}
                            title="Daily Practice"
                            description="Solve curated MCQs daily with smart subject mixing. Adaptive difficulty based on your performance."
                            color="from-blue-500 to-cyan-500"
                        />
                        <FeatureCard
                            icon={BookOpen}
                            title="Question Library"
                            description="Browse years of UPSC PYQs with filters by year, subject, topic, paper (GS1, CSAT), and difficulty."
                            color="from-purple-500 to-pink-500"
                        />
                        <FeatureCard
                            icon={Layers}
                            title="Practice Sets"
                            description="Create custom collections of questions. Practice specific topics or weak areas anytime."
                            color="from-green-500 to-emerald-500"
                        />
                        <FeatureCard
                            icon={RotateCcw}
                            title="Smart Revision System"
                            description="Sunday spaced-repetition system automatically revives wrong answers. Never forget what you've learned."
                            color="from-yellow-500 to-orange-500"
                            badge="Smart"
                        />
                        <FeatureCard
                            icon={Brain}
                            title="Repeated Themes"
                            description="AI analyzes patterns in PYQs to show you which topics repeat across years. Focus on what matters."
                            color="from-red-500 to-pink-500"
                        />
                        <FeatureCard
                            icon={TrendingUp}
                            title="Trend Heatmaps"
                            description="Visualize subject-wise question distribution across years. See which subjects deserve more attention."
                            color="from-indigo-500 to-purple-500"
                        />
                    </div>
                </section>

                {/* SMART REVISION SPOTLIGHT */}

                <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-3xl p-8 sm:p-12 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl -translate-y-32 translate-x-32" />

                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                            <div>
                                <div className="inline-flex items-center gap-2 bg-yellow-500 text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                                    <Sparkles size={12} />
                                    Featured System
                                </div>

                                <h2 className="text-3xl sm:text-4xl font-black text-brand-dark tracking-tighter mb-4 leading-tight">
                                    Smart Revision System
                                    <br />
                                    <span className="text-orange-600">
                                        that actually works
                                    </span>
                                </h2>

                                <p className="text-base text-brand-muted font-medium leading-relaxed mb-6">
                                    Most aspirants attempt 10,000+ MCQs but forget 70% of them.
                                    Our Sunday-based spaced repetition system uses proven memory
                                    science to make sure you never forget what you've learned.
                                </p>

                                <div className="space-y-3">
                                    <RevisionPoint text="Wrong questions auto-saved for revision" />
                                    <RevisionPoint text="Reappears every Sunday until you master it" />
                                    <RevisionPoint text="Tracks 'Mastered' vs 'Still Learning' status" />
                                    <RevisionPoint text="Smart notifications: 'You have 15 questions due for revision'" />
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl p-6 shadow-xl">
                                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-brand-border">
                                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center">
                                        <Calendar size={22} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="font-black text-brand-dark">
                                            📅 Sunday Revision Day
                                        </p>
                                        <p className="text-xs text-brand-muted font-bold">
                                            15 questions due
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <StatRow
                                        label="Total Wrong Questions"
                                        value="42"
                                        color="text-red-600"
                                    />
                                    <StatRow
                                        label="Due for Revision"
                                        value="15"
                                        color="text-orange-600"
                                    />
                                    <StatRow
                                        label="Mastered"
                                        value="27"
                                        color="text-green-600"
                                    />
                                </div>

                                <button className="w-full mt-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-widest">
                                    Start Revision Session
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* FEATURES GRID — MAINS */}

                <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                            <GraduationCap size={12} />
                            Mains Module
                        </div>

                        <h2 className="text-3xl sm:text-4xl font-black text-brand-dark tracking-tighter mb-3">
                            Complete Mains Library
                        </h2>

                        <p className="text-brand-muted font-medium max-w-xl mx-auto">
                            Browse, practice, and track all UPSC Mains questions
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <FeatureCard
                            icon={GraduationCap}
                            title="All Papers Covered"
                            description="GS1, GS2, GS3, GS4, Essay, and Optional papers. Filter by year, marks, word limit, and topic."
                            color="from-purple-500 to-pink-500"
                        />
                        <FeatureCard
                            icon={BarChart3}
                            title="Mains Dashboard"
                            description="See paper-wise, subject-wise, topic-wise progress. Know exactly how much you've covered."
                            color="from-pink-500 to-rose-500"
                        />
                        <FeatureCard
                            icon={Bookmark}
                            title="Done / Not Done Tracking"
                            description="Simple completion tracking for Mains. No revision pressure — focus on answer writing."
                            color="from-violet-500 to-purple-500"
                        />
                    </div>
                </section>

                {/* FEATURES GRID — ORGANIZATION & PRODUCTIVITY (NEW) */}

                <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-700 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                            <CalendarDays size={12} />
                            Organization & Productivity
                        </div>

                        <h2 className="text-3xl sm:text-4xl font-black text-brand-dark tracking-tighter mb-3">
                            Plan deeply. Capture quickly.
                        </h2>

                        <p className="text-brand-muted font-medium max-w-xl mx-auto">
                            The everyday tools that turn intentions into habits — and habits
                            into results.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <FeatureCard
                            icon={CalendarDays}
                            title="Personal Planner"
                            description="Plan your week with tasks, recurring habits, and topic-wise scheduling. Never miss a day of preparation again."
                            color="from-pink-500 to-rose-500"
                            badge="New"
                        />

                        <FeatureCard
                            icon={StickyNote}
                            title="Sticky Notes"
                            description="Quick capture for insights, formulas, mnemonics & must-remember facts. Pin them, color-code them, find them instantly."
                            color="from-yellow-500 to-amber-500"
                            badge="New"
                        />

                        <FeatureCard
                            icon={BookOpenCheck}
                            title="Syllabus Tracker"
                            description="The official UPSC syllabus side-by-side with your progress. Mark topics covered, bookmark must-revisit areas, never lose direction."
                            color="from-indigo-500 to-blue-500"
                            badge="New"
                        />
                    </div>
                </section>

                {/* FEATURES GRID — RESOURCES */}

                <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                            <Library size={12} />
                            Resources & Storage
                        </div>

                        <h2 className="text-3xl sm:text-4xl font-black text-brand-dark tracking-tighter mb-3">
                            Your study material, organized
                        </h2>

                        <p className="text-brand-muted font-medium max-w-xl mx-auto">
                            Personal vault, community sharing, and smart organization
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <FeatureCard
                            icon={FolderOpen}
                            title="Personal Vault"
                            description="Secure cloud storage for notes, PDFs, images. Nested folders, drag-drop, and auto-compression."
                            color="from-green-500 to-emerald-500"
                        />
                        <FeatureCard
                            icon={Library}
                            title="Community Library"
                            description="Browse notes shared by other aspirants, organized by subject and topic. Bookmark favorites."
                            color="from-blue-500 to-cyan-500"
                        />
                        <FeatureCard
                            icon={Shield}
                            title="Secure PDF Viewer"
                            description="View PDFs with watermark, no download, no print. Protect intellectual property of shared content."
                            color="from-red-500 to-orange-500"
                        />
                    </div>
                </section>

                {/* FEATURES GRID — INTELLIGENCE */}

                <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                            <Brain size={12} />
                            Intelligence Layer
                        </div>

                        <h2 className="text-3xl sm:text-4xl font-black text-brand-dark tracking-tighter mb-3">
                            Smart insights, better decisions
                        </h2>

                        <p className="text-brand-muted font-medium max-w-xl mx-auto">
                            Data-driven analytics to guide your preparation
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <FeatureCard
                            icon={Brain}
                            title="Weak Area Intelligence"
                            description="AI identifies your weakest subjects, topics, and mistake patterns. Focus your time wisely."
                            color="from-red-500 to-pink-500"
                        />
                        <FeatureCard
                            icon={Trophy}
                            title="Leaderboard"
                            description="See how you rank against other aspirants. Healthy competition keeps you motivated."
                            color="from-yellow-500 to-orange-500"
                        />
                        <FeatureCard
                            icon={Search}
                            title="Global Search (Cmd+K)"
                            description="Search across questions, notes, folders — everything in one place with one keyboard shortcut."
                            color="from-indigo-500 to-purple-500"
                        />
                    </div>
                </section>

                {/* VALUES */}

                <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl sm:text-4xl font-black text-brand-dark tracking-tighter mb-3">
                            What we stand for
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <ValueCard
                            icon={Heart}
                            title="100% Free, Forever"
                            description="Core features will always be free. No hidden charges, no premium walls for serious students."
                            color="bg-red-50 border-red-100 text-red-600"
                        />
                        <ValueCard
                            icon={Shield}
                            title="Privacy First"
                            description="Your data belongs to you. We don't sell your information. Period."
                            color="bg-blue-50 border-blue-100 text-blue-600"
                        />
                        <ValueCard
                            icon={Zap}
                            title="Built for Speed"
                            description="Lightning-fast UI, instant search, offline-ready. Time is your most precious resource."
                            color="bg-yellow-50 border-yellow-100 text-yellow-600"
                        />
                        <ValueCard
                            icon={Users}
                            title="Community Driven"
                            description="Every feature is shaped by real aspirant feedback. Your voice matters."
                            color="bg-green-50 border-green-100 text-green-600"
                        />
                    </div>
                </section>

                {/* STATS — UPDATED */}

                <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white rounded-3xl p-8 sm:p-12 border border-brand-border"
                    >
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center">
                            <StatCard
                                label="Free Forever"
                                value="100%"
                                sub="Core features"
                            />
                            <StatCard
                                label="Modules"
                                value="12+"
                                sub="Built into one ecosystem"
                            />
                            <StatCard
                                label="Storage Free"
                                value="100MB"
                                sub="Per user, always"
                            />
                            <StatCard
                                label="Hidden Costs"
                                value="₹0"
                                sub="No paywalls. Ever."
                            />
                        </div>
                    </motion.div>
                </section>

                {/* CTA */}

                <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-gradient-to-br from-brand-accent to-purple-600 rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-32 translate-x-32" />

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                                <Rocket size={12} />
                                Ready to Start?
                            </div>

                            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
                                Your UPSC journey starts now
                            </h2>

                            <p className="text-white/80 font-medium mb-8 max-w-xl mx-auto">
                                Join thousands of aspirants already preparing smarter with
                                PrepOS.
                            </p>

                            <Link
                                href="/dashboard"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-dark rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-all"
                            >
                                Go to Dashboard
                                <ArrowLeft size={14} className="rotate-180" />
                            </Link>
                        </div>
                    </motion.div>
                </section>

            </main>

            <Footer />
        </div>
    );
}

// =========================
// HELPER COMPONENTS
// =========================

function FeatureCard({ icon: Icon, title, description, color, badge }) {
    const badgeColor =
        badge === "New"
            ? "bg-brand-accent"
            : badge === "Smart"
            ? "bg-yellow-500"
            : "bg-brand-dark";

    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="bg-white border border-brand-border rounded-3xl p-6 transition-all hover:border-brand-accent relative"
        >
            {badge && (
                <span
                    className={`absolute top-4 right-4 ${badgeColor} text-white px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest`}
                >
                    {badge}
                </span>
            )}

            <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4`}
            >
                <Icon size={22} className="text-white" />
            </div>

            <h3 className="font-black text-brand-dark text-lg mb-2">{title}</h3>

            <p className="text-sm text-brand-muted font-medium leading-relaxed">
                {description}
            </p>
        </motion.div>
    );
}

function ValueCard({ icon: Icon, title, description, color }) {
    return (
        <motion.div
            whileHover={{ y: -2 }}
            className={`rounded-3xl p-6 border ${color}`}
        >
            <Icon size={24} className="mb-4" />

            <h3 className="font-black text-brand-dark text-lg mb-2">{title}</h3>

            <p className="text-sm text-brand-muted font-medium leading-relaxed">
                {description}
            </p>
        </motion.div>
    );
}

function StatCard({ label, value, sub }) {
    return (
        <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2">
                {label}
            </p>

            <p className="text-3xl sm:text-4xl font-black text-brand-dark leading-none mb-2">
                {value}
            </p>

            <p className="text-xs text-brand-muted font-medium">{sub}</p>
        </div>
    );
}

function RevisionPoint({ text }) {
    return (
        <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-white text-[10px] font-black">✓</span>
            </div>

            <p className="text-sm font-bold text-brand-dark">{text}</p>
        </div>
    );
}

function StatRow({ label, value, color }) {
    return (
        <div className="flex items-center justify-between py-2">
            <span className="text-sm font-bold text-brand-muted">{label}</span>

            <span className={`text-2xl font-black ${color}`}>{value}</span>
        </div>
    );
}