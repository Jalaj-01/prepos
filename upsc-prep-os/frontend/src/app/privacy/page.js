"use client";

import { motion } from "framer-motion";

import Link from "next/link";

import {
    Shield,
    ArrowLeft,
    Lock,
    Eye,
    Cookie,
    Database,
    Mail
} from "lucide-react";

import Footer from "@/components/layout/Footer";

export default function PrivacyPage() {

    const lastUpdated = "January 2026";

    return (

        <div className="min-h-screen bg-brand-light flex flex-col">

            {/* TOP BAR */}

            <header className="bg-white border-b border-brand-border sticky top-0 z-30">

                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">

                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2"
                    >

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

                <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-8">

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >

                        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">

                            <Shield size={12} />

                            Privacy Policy

                        </div>

                        <h1 className="text-4xl sm:text-5xl font-black text-brand-dark tracking-tighter mb-4">

                            Your privacy matters

                        </h1>

                        <p className="text-base text-brand-muted font-medium max-w-2xl mx-auto leading-relaxed">

                            We're committed to protecting your personal information and being transparent about what we collect and why.

                        </p>

                        <p className="text-xs font-bold text-brand-muted mt-6 uppercase tracking-widest">

                            Last updated: {lastUpdated}

                        </p>

                    </motion.div>

                </section>

                {/* KEY POINTS */}

                <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                        <QuickFact
                            icon={Lock}
                            title="Encrypted"
                            text="Your data is secured with industry-standard encryption"
                        />

                        <QuickFact
                            icon={Eye}
                            title="No Selling"
                            text="We never sell your personal data to third parties"
                        />

                        <QuickFact
                            icon={Database}
                            title="Your Control"
                            text="Delete your account and data anytime"
                        />

                    </div>

                </section>

                {/* MAIN CONTENT */}

                <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white rounded-3xl p-6 sm:p-10 border border-brand-border space-y-10"
                    >

                        <Section number="1" title="Information We Collect">

                            <p>

                                When you use PrepOS, we collect the following types of information:

                            </p>

                            <ul className="mt-4 space-y-3">

                                <BulletPoint>

                                    <strong>Account Information:</strong> Name, email address, and password (encrypted) when you register.

                                </BulletPoint>

                                <BulletPoint>

                                    <strong>Profile Data:</strong> Your UPSC target exam year, completion date, daily study targets, and preferences.

                                </BulletPoint>

                                <BulletPoint>

                                    <strong>Activity Data:</strong> Questions you attempt, time spent, answers selected, and progress metrics. We use this to provide personalized analytics.

                                </BulletPoint>

                                <BulletPoint>

                                    <strong>Uploaded Content:</strong> Files, notes, PDFs you upload to your personal vault. These remain private unless you choose to share them publicly.

                                </BulletPoint>

                                <BulletPoint>

                                    <strong>Technical Data:</strong> Browser type, device info, IP address (for security), and usage patterns to improve the platform.

                                </BulletPoint>

                            </ul>

                        </Section>

                        <Section number="2" title="How We Use Your Information">

                            <p>We use your information to:</p>

                            <ul className="mt-4 space-y-3">

                                <BulletPoint>Provide and personalize the PrepOS experience</BulletPoint>

                                <BulletPoint>Track your study progress and generate analytics</BulletPoint>

                                <BulletPoint>Send important notifications (streak reminders, announcements) — only if you've opted in</BulletPoint>

                                <BulletPoint>Improve our features based on usage patterns (aggregated and anonymized)</BulletPoint>

                                <BulletPoint>Detect and prevent fraud, abuse, and security issues</BulletPoint>

                                <BulletPoint>Comply with legal obligations</BulletPoint>

                            </ul>

                        </Section>

                        <Section number="3" title="Data Sharing & Disclosure">

                            <p>

                                <strong className="text-brand-dark">We do not sell your personal data.</strong> We may share information only in these limited cases:

                            </p>

                            <ul className="mt-4 space-y-3">

                                <BulletPoint>

                                    <strong>Public Sharing:</strong> Content you explicitly mark as "Public" in Community Library becomes visible to other users. You can make it private again anytime.

                                </BulletPoint>

                                <BulletPoint>

                                    <strong>Service Providers:</strong> We use trusted infrastructure providers (MongoDB Atlas for database, Backblaze B2 for file storage, Vercel for hosting) bound by strict data protection agreements.

                                </BulletPoint>

                                <BulletPoint>

                                    <strong>Legal Requirements:</strong> If required by valid legal process, we may disclose information to authorities.

                                </BulletPoint>

                            </ul>

                        </Section>

                        <Section number="4" title="Data Security">

                            <p>

                                We implement industry-standard security measures including:

                            </p>

                            <ul className="mt-4 space-y-3">

                                <BulletPoint>Password hashing using bcrypt</BulletPoint>

                                <BulletPoint>JWT-based secure authentication</BulletPoint>

                                <BulletPoint>HTTPS encryption for all data transmission</BulletPoint>

                                <BulletPoint>Signed URLs with short expiration for file access</BulletPoint>

                                <BulletPoint>Watermarking and anti-download measures on documents</BulletPoint>

                                <BulletPoint>Regular security audits and updates</BulletPoint>

                            </ul>

                        </Section>

                        <Section number="5" title="Your Rights">

                            <p>You have the right to:</p>

                            <ul className="mt-4 space-y-3">

                                <BulletPoint><strong>Access:</strong> Request a copy of your personal data</BulletPoint>

                                <BulletPoint><strong>Correct:</strong> Update or correct inaccurate information</BulletPoint>

                                <BulletPoint><strong>Delete:</strong> Permanently delete your account and all associated data</BulletPoint>

                                <BulletPoint><strong>Export:</strong> Download your data in a portable format</BulletPoint>

                                <BulletPoint><strong>Opt-out:</strong> Disable email notifications anytime from settings</BulletPoint>

                            </ul>

                            <p className="mt-4">

                                To exercise these rights, contact us at <strong className="text-brand-accent">support@prepos.app</strong>.

                            </p>

                        </Section>

                        <Section number="6" title="Cookies & Local Storage">

                            <p>

                                We use browser localStorage to:

                            </p>

                            <ul className="mt-4 space-y-3">

                                <BulletPoint>Keep you logged in</BulletPoint>

                                <BulletPoint>Remember your preferences (sidebar collapsed, theme, etc.)</BulletPoint>

                                <BulletPoint>Track if you've completed the onboarding tour</BulletPoint>

                            </ul>

                            <p className="mt-4">

                                We don't use third-party tracking cookies or advertising trackers.

                            </p>

                        </Section>

                        <Section number="7" title="Children's Privacy">

                            <p>

                                PrepOS is designed for adult UPSC aspirants (typically 18+). We don't knowingly collect data from children under 13. If you believe we have collected such data, please contact us immediately.

                            </p>

                        </Section>

                        <Section number="8" title="Changes to This Policy">

                            <p>

                                We may update this privacy policy from time to time. We'll notify you of significant changes via email or platform announcements. The "Last Updated" date at the top will reflect when changes were made.

                            </p>

                        </Section>

                        <Section number="9" title="Contact Us">

                            <p>

                                For any privacy-related questions or concerns, please reach out:

                            </p>

                            <div className="mt-4 bg-brand-light rounded-2xl p-5">

                                <div className="flex items-center gap-3 mb-2">

                                    <Mail size={16} className="text-brand-accent" />

                                    <p className="font-black text-brand-dark">support@prepos.app</p>

                                </div>

                                <p className="text-sm text-brand-muted font-medium">

                                    We respond to all privacy queries within 48 hours.

                                </p>

                            </div>

                        </Section>

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

function QuickFact({ icon: Icon, title, text }) {

    return (

        <motion.div
            whileHover={{ y: -2 }}
            className="bg-white border border-brand-border rounded-2xl p-5"
        >

            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3">

                <Icon size={18} className="text-blue-600" />

            </div>

            <p className="font-black text-brand-dark mb-1">{title}</p>

            <p className="text-xs text-brand-muted font-medium leading-relaxed">

                {text}

            </p>

        </motion.div>
    );
}

function Section({ number, title, children }) {

    return (

        <div>

            <div className="flex items-center gap-3 mb-4">

                <div className="w-8 h-8 bg-brand-dark text-white rounded-xl flex items-center justify-center font-black text-sm shrink-0">

                    {number}

                </div>

                <h2 className="text-xl sm:text-2xl font-black text-brand-dark tracking-tight">

                    {title}

                </h2>

            </div>

            <div className="text-sm sm:text-base text-brand-muted font-medium leading-relaxed pl-11">

                {children}

            </div>

        </div>
    );
}

function BulletPoint({ children }) {

    return (

        <li className="flex gap-3">

            <span className="text-brand-accent font-black mt-0.5">•</span>

            <span>{children}</span>

        </li>
    );
}