"use client";

import { motion } from "framer-motion";

import Link from "next/link";

import {
    FileText,
    ArrowLeft,
    CheckCircle,
    AlertCircle,
    Mail
} from "lucide-react";

import Footer from "@/components/layout/Footer";

export default function TermsPage() {

    const lastUpdated = "January 2026";

    return (

        <div className="min-h-screen bg-brand-light flex flex-col">

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

                        <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">

                            <FileText size={12} />

                            Terms of Service

                        </div>

                        <h1 className="text-4xl sm:text-5xl font-black text-brand-dark tracking-tighter mb-4">

                            Our agreement with you

                        </h1>

                        <p className="text-base text-brand-muted font-medium max-w-2xl mx-auto leading-relaxed">

                            Please read these terms carefully before using PrepOS. By accessing or using our service, you agree to be bound by these terms.

                        </p>

                        <p className="text-xs font-bold text-brand-muted mt-6 uppercase tracking-widest">

                            Last updated: {lastUpdated}

                        </p>

                    </motion.div>

                </section>

                {/* MAIN CONTENT */}

                <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white rounded-3xl p-6 sm:p-10 border border-brand-border space-y-10"
                    >

                        <Section number="1" title="Acceptance of Terms">

                            <p>

                                By creating an account or using PrepOS in any way, you confirm that you've read, understood, and agree to be bound by these Terms of Service. If you do not agree, please don't use our platform.

                            </p>

                            <p className="mt-3">

                                You must be at least 13 years old to use PrepOS. If you're under 18, you should have your parent or guardian's permission.

                            </p>

                        </Section>

                        <Section number="2" title="Description of Service">

                            <p>

                                PrepOS is a free online UPSC preparation platform that provides:

                            </p>

                            <ul className="mt-4 space-y-3">

                                <BulletPoint>Question library with PYQ practice and analytics</BulletPoint>

                                <BulletPoint>Mains question library with structured papers</BulletPoint>

                                <BulletPoint>Personal cloud storage (vault) for study materials</BulletPoint>

                                <BulletPoint>Community library for sharing and accessing notes</BulletPoint>

                                <BulletPoint>Performance tracking and smart recommendations</BulletPoint>

                            </ul>

                            <p className="mt-4">

                                We reserve the right to modify, suspend, or discontinue any feature at any time without notice.

                            </p>

                        </Section>

                        <Section number="3" title="User Accounts">

                            <p>You agree to:</p>

                            <ul className="mt-4 space-y-3">

                                <BulletPoint>Provide accurate, current information when registering</BulletPoint>

                                <BulletPoint>Keep your password secure and confidential</BulletPoint>

                                <BulletPoint>Notify us immediately of any unauthorized access</BulletPoint>

                                <BulletPoint>Be responsible for all activities under your account</BulletPoint>

                                <BulletPoint>Not share your account with others</BulletPoint>

                                <BulletPoint>Use only one account per person</BulletPoint>

                            </ul>

                        </Section>

                        <Section number="4" title="Acceptable Use">

                            <p>You agree NOT to:</p>

                            <ul className="mt-4 space-y-3">

                                <BulletPoint>Upload copyrighted material without permission</BulletPoint>

                                <BulletPoint>Share inappropriate, offensive, or illegal content</BulletPoint>

                                <BulletPoint>Use the platform for commercial purposes without permission</BulletPoint>

                                <BulletPoint>Attempt to hack, reverse engineer, or disrupt our services</BulletPoint>

                                <BulletPoint>Scrape, download, or copy content systematically</BulletPoint>

                                <BulletPoint>Impersonate others or create fake accounts</BulletPoint>

                                <BulletPoint>Spam other users or share misleading content</BulletPoint>

                                <BulletPoint>Bypass watermarks or anti-download protections</BulletPoint>

                            </ul>

                            <div className="mt-6 bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3">

                                <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />

                                <p className="text-sm font-bold text-red-900">

                                    Violations may result in account suspension or permanent ban without notice.

                                </p>

                            </div>

                        </Section>

                        <Section number="5" title="Content Ownership">

                            <p>

                                <strong className="text-brand-dark">Your Content:</strong> You retain all rights to content you upload (notes, files, etc.). By marking it "Public," you grant other PrepOS users a non-exclusive right to view it within the platform.

                            </p>

                            <p className="mt-4">

                                <strong className="text-brand-dark">Our Content:</strong> The PrepOS platform, design, features, and original content are owned by us and protected by intellectual property laws.

                            </p>

                            <p className="mt-4">

                                <strong className="text-brand-dark">Community Content:</strong> Content shared by other users in the Community Library is for personal study use only. Don't redistribute, sell, or commercially exploit it.

                            </p>

                        </Section>

                        <Section number="6" title="Storage Limits">

                            <p>

                                Free users get 100MB of cloud storage. We reserve the right to:

                            </p>

                            <ul className="mt-4 space-y-3">

                                <BulletPoint>Compress uploaded files to save space</BulletPoint>

                                <BulletPoint>Delete files from inactive accounts (after 12 months of no login)</BulletPoint>

                                <BulletPoint>Modify storage limits with prior notice</BulletPoint>

                                <BulletPoint>Adjust quotas based on user tier (free/verified/premium)</BulletPoint>

                            </ul>

                        </Section>

                        <Section number="7" title="Service Availability">

                            <p>

                                We strive for 99% uptime but don't guarantee uninterrupted service. We're not liable for:

                            </p>

                            <ul className="mt-4 space-y-3">

                                <BulletPoint>Temporary downtime for maintenance</BulletPoint>

                                <BulletPoint>Loss of data due to user error</BulletPoint>

                                <BulletPoint>Issues caused by third-party services (database, storage providers)</BulletPoint>

                                <BulletPoint>Internet connectivity problems on your end</BulletPoint>

                            </ul>

                            <p className="mt-4">

                                We strongly recommend keeping backups of important files.

                            </p>

                        </Section>

                        <Section number="8" title="Disclaimer">

                            <p>

                                PrepOS is provided "as is" without warranties of any kind. We don't guarantee:

                            </p>

                            <ul className="mt-4 space-y-3">

                                <BulletPoint>That using PrepOS will guarantee UPSC success</BulletPoint>

                                <BulletPoint>That all content is 100% accurate (verify important info)</BulletPoint>

                                <BulletPoint>Compatibility with all devices/browsers</BulletPoint>

                                <BulletPoint>That community-shared content is verified by us</BulletPoint>

                            </ul>

                        </Section>

                        <Section number="9" title="Termination">

                            <p>

                                You can delete your account anytime from settings. We may suspend or terminate your account if you:

                            </p>

                            <ul className="mt-4 space-y-3">

                                <BulletPoint>Violate these terms</BulletPoint>

                                <BulletPoint>Abuse the platform or other users</BulletPoint>

                                <BulletPoint>Engage in illegal activities</BulletPoint>

                                <BulletPoint>Have an inactive account for 24+ months</BulletPoint>

                            </ul>

                            <p className="mt-4">

                                Upon termination, your data will be permanently deleted within 30 days, except where required by law.

                            </p>

                        </Section>

                        <Section number="10" title="Changes to Terms">

                            <p>

                                We may update these terms occasionally. Significant changes will be notified via email or platform announcement. Continued use after changes means you accept the new terms.

                            </p>

                        </Section>

                        <Section number="11" title="Governing Law">

                            <p>

                                These terms are governed by the laws of India. Any disputes will be resolved in the courts of India.

                            </p>

                        </Section>

                        <Section number="12" title="Contact">

                            <p>

                                Questions about these terms?

                            </p>

                            <div className="mt-4 bg-brand-light rounded-2xl p-5">

                                <div className="flex items-center gap-3">

                                    <Mail size={16} className="text-brand-accent" />

                                    <p className="font-black text-brand-dark">support@prepos.app</p>

                                </div>

                            </div>

                        </Section>

                    </motion.div>

                </section>

            </main>

            <Footer />

        </div>
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