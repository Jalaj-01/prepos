"use client";

import { useState } from "react";

import { motion } from "framer-motion";

import Link from "next/link";

import {
    Mail,
    MessageSquare,
    ArrowLeft,
    Send,
    MapPin,
    Clock,
    Loader2,
    CheckCircle,
    User,
    AtSign,
    Globe
} from "lucide-react";

import Footer from "@/components/layout/Footer";

import { showToast } from "@/components/ui/Toast";

export default function ContactPage() {

    const [form, setForm] = useState({
        name: "",
        email: "",
        subject: "general",
        message: ""
    });

    const [submitting, setSubmitting] = useState(false);

    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {

            showToast.error("Please fill all required fields");

            return;
        }

        // Basic email validation

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(form.email)) {

            showToast.error("Please enter a valid email");

            return;
        }

        if (form.message.length < 10) {

            showToast.error("Message must be at least 10 characters");

            return;
        }

        setSubmitting(true);

        try {

            const response = await fetch(

                `${process.env.NEXT_PUBLIC_API_URL}/api/contact/submit`,

                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        name: form.name.trim(),

                        email: form.email.trim(),

                        subject: form.subject,

                        message: form.message.trim()
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {

                throw new Error(
                    data.message || "Failed to send message"
                );
            }

            // SUCCESS

            setSubmitted(true);

            showToast.success(
                "Message sent! Check your inbox for confirmation."
            );

            setForm({
                name: "",
                email: "",
                subject: "general",
                message: ""
            });

        } catch (err) {

            console.error("Contact form error:", err);

            showToast.error(
                err.message || "Failed to send. Please try again."
            );

        } finally {

            setSubmitting(false);
        }
    };

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

                <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-8 text-center">

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >

                        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">

                            <MessageSquare size={12} />

                            Get in Touch

                        </div>

                        <h1 className="text-4xl sm:text-5xl font-black text-brand-dark tracking-tighter mb-4">

                            We'd love to hear from you

                        </h1>

                        <p className="text-base text-brand-muted font-medium max-w-2xl mx-auto leading-relaxed">

                            Have a question, suggestion, or just want to say hi? Drop us a message and we'll get back within 48 hours.

                        </p>

                    </motion.div>

                </section>

                {/* CONTACT INFO + FORM */}

                <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* LEFT: Contact info */}

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="lg:col-span-1 space-y-4"
                        >

                            <ContactCard
                                icon={Mail}
                                title="Email Us"
                                value="janug2902@gmail.com"
                                description="For all queries, feedback, or support"
                                color="from-blue-500 to-cyan-500"
                                link="mailto:janug2902@gmail.com"
                            />

                            <ContactCard
                                icon={Clock}
                                title="Response Time"
                                value="Within 48 hours"
                                description="We read every message personally"
                                color="from-orange-500 to-red-500"
                            />

                            <ContactCard
                                icon={MapPin}
                                title="Based In"
                                value="India 🇮🇳"
                                description="Built for Indian UPSC aspirants"
                                color="from-purple-500 to-pink-500"
                            />

                            {/* SOCIAL */}

                            <div className="bg-white border border-brand-border rounded-3xl p-6">

                                <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-4">

                                    Follow Us

                                </p>

                                <div className="flex gap-2">

                                    <SocialButton
                                        href="https://twitter.com/prepos"
                                        label="Twitter"
                                        emoji="𝕏"
                                    />

                                    <SocialButton
                                        href="https://github.com/prepos"
                                        label="GitHub"
                                        emoji="</>"
                                    />

                                    <SocialButton
                                        href="https://linkedin.com/company/prepos"
                                        label="LinkedIn"
                                        emoji="in"
                                    />

                                    <SocialButton
                                        href="https://prepos.app"
                                        label="Website"
                                        icon={Globe}
                                    />

                                </div>

                            </div>

                        </motion.div>

                        {/* RIGHT: Form */}

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="lg:col-span-2"
                        >

                            <div className="bg-white border border-brand-border rounded-3xl p-6 sm:p-8">

                                {submitted ? (

                                    <div className="text-center py-12">

                                        <div className="w-16 h-16 bg-green-100 rounded-2xl mx-auto flex items-center justify-center mb-4">

                                            <CheckCircle size={28} className="text-green-600" />

                                        </div>

                                        <h2 className="text-2xl font-black text-brand-dark mb-2">

                                            Message Sent! 🎉

                                        </h2>

                                        <p className="text-sm text-brand-muted font-medium mb-6">

                                            Thanks for reaching out. We'll reply to you within 48 hours.

                                        </p>

                                        <button
                                            onClick={() => setSubmitted(false)}
                                            className="px-5 py-3 bg-brand-light text-brand-dark rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-dark hover:text-white transition-all"
                                        >
                                            Send Another
                                        </button>

                                    </div>

                                ) : (

                                    <form onSubmit={handleSubmit}>

                                        <h2 className="text-xl sm:text-2xl font-black text-brand-dark mb-1">

                                            Send us a message

                                        </h2>

                                        <p className="text-sm text-brand-muted font-medium mb-6">

                                            Fill out the form and we'll respond shortly.

                                        </p>

                                        <div className="space-y-4">

                                            {/* NAME */}

                                            <div>

                                                <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2 flex items-center gap-1">

                                                    <User size={11} />

                                                    Your Name *

                                                </label>

                                                <input
                                                    type="text"
                                                    value={form.name}
                                                    onChange={(e) =>
                                                        setForm({ ...form, name: e.target.value })
                                                    }
                                                    placeholder="John Doe"
                                                    className="w-full p-3 bg-brand-light border border-brand-border rounded-xl font-bold outline-none focus:border-brand-accent transition-all text-sm"
                                                />

                                            </div>

                                            {/* EMAIL */}

                                            <div>

                                                <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2 flex items-center gap-1">

                                                    <AtSign size={11} />

                                                    Email *

                                                </label>

                                                <input
                                                    type="email"
                                                    value={form.email}
                                                    onChange={(e) =>
                                                        setForm({ ...form, email: e.target.value })
                                                    }
                                                    placeholder="you@example.com"
                                                    className="w-full p-3 bg-brand-light border border-brand-border rounded-xl font-bold outline-none focus:border-brand-accent transition-all text-sm"
                                                />

                                            </div>

                                            {/* SUBJECT */}

                                            <div>

                                                <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2 block">

                                                    Subject

                                                </label>

                                                <select
                                                    value={form.subject}
                                                    onChange={(e) =>
                                                        setForm({ ...form, subject: e.target.value })
                                                    }
                                                    className="w-full p-3 bg-brand-light border border-brand-border rounded-xl font-bold outline-none focus:border-brand-accent transition-all text-sm"
                                                >

                                                    <option value="general">General Inquiry</option>

                                                    <option value="support">Technical Support</option>

                                                    <option value="feedback">Feedback / Suggestion</option>

                                                    <option value="bug">Report a Bug</option>

                                                    <option value="partnership">Partnership</option>

                                                    <option value="privacy">Privacy / Data</option>

                                                </select>

                                            </div>

                                            {/* MESSAGE */}

                                            <div>

                                                <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2 flex items-center gap-1">

                                                    <MessageSquare size={11} />

                                                    Your Message *

                                                </label>

                                                <textarea
                                                    value={form.message}
                                                    onChange={(e) =>
                                                        setForm({ ...form, message: e.target.value })
                                                    }
                                                    placeholder="Tell us how we can help..."
                                                    rows={6}
                                                    className="w-full p-3 bg-brand-light border border-brand-border rounded-xl font-medium outline-none focus:border-brand-accent transition-all text-sm resize-none"
                                                />

                                            </div>

                                            {/* SUBMIT */}

                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className="w-full bg-brand-dark text-white py-3.5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-brand-accent transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                {submitting ? (
                                                    <>
                                                        <Loader2 size={14} className="animate-spin" />
                                                        Sending...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send size={14} />
                                                        Send Message
                                                    </>
                                                )}
                                            </button>

                                            <p className="text-[10px] text-brand-muted font-bold text-center">

                                                We'll never share your email with anyone

                                            </p>

                                        </div>

                                    </form>
                                )}

                            </div>

                        </motion.div>

                    </div>

                </section>

            </main>

            <Footer />

        </div>
    );
}

// =========================
// HELPERS
// =========================

function ContactCard({ icon: Icon, title, value, description, color, link }) {

    const content = (

        <motion.div
            whileHover={{ y: -2 }}
            className="bg-white border border-brand-border rounded-3xl p-5 transition-all hover:border-brand-accent"
        >

            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
                <Icon size={18} className="text-white" />
            </div>

            <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-1">
                {title}
            </p>

            <p className="font-black text-brand-dark text-sm mb-1 break-all">
                {value}
            </p>

            <p className="text-xs text-brand-muted font-medium">
                {description}
            </p>

        </motion.div>
    );

    if (link) {

        return (
            <a href={link} className="block">
                {content}
            </a>
        );
    }

    return content;
}

function SocialButton({ href, label, emoji, icon: Icon }) {

    return (

        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
            className="flex-1 flex items-center justify-center py-3 bg-brand-light hover:bg-brand-dark hover:text-white rounded-xl transition-all font-black text-sm"
        >
            {Icon ? <Icon size={16} /> : <span>{emoji}</span>}
        </a>
    );
}