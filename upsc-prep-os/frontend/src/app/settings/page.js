"use client";

import { useState, useEffect } from "react";

import { motion } from "framer-motion";

import axios from "axios";

import {
    Settings,
    Calendar,
    Target,
    Bell,
    RotateCcw,
    Trash2,
    Loader2,
    Check,
    Moon,
    Sun,
    Sparkles
} from "lucide-react";

import Sidebar from "@/components/layout/Sidebar";

import TopHeader from "@/components/layout/TopHeader";

import Footer from "@/components/layout/Footer";

import MobileNav from "@/components/layout/MobileNav";

import PageHeader from "@/components/ui/PageHeader";

import { showToast } from "@/components/ui/Toast";

import { confirmAction } from "@/components/ui/ConfirmModal";

export default function SettingsPage() {

    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(true);

    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    // Target date

    const [targetDate, setTargetDate] = useState("");

    const [savingTarget, setSavingTarget] = useState(false);

    useEffect(() => {

        const info = localStorage.getItem("userInfo");

        if (!info) {
            window.location.href = "/login";
            return;
        }

        const parsed = JSON.parse(info);

        setUser(parsed);

        if (parsed.targetCompletionDate) {

            setTargetDate(
                new Date(parsed.targetCompletionDate)
                    .toISOString()
                    .split("T")[0]
            );
        }

        setLoading(false);

    }, []);

    // =========================
    // UPDATE TARGET DATE
    // =========================

    const handleUpdateTarget = async () => {

        if (!targetDate) {

            showToast.error("Please select a date");

            return;
        }

        setSavingTarget(true);

        try {

            const { data } = await axios.put(

                `${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`,

                { targetCompletionDate: targetDate },

                {
                    headers: { Authorization: `Bearer ${user.token}` }
                }
            );

            const updatedUser = {

                ...user,

                dailyMcqTarget: data.dailyMcqTarget,

                targetCompletionDate: data.targetCompletionDate
            };

            localStorage.setItem(
                "userInfo",
                JSON.stringify(updatedUser)
            );

            setUser(updatedUser);

            showToast.success(
                `Target updated! ${data.dailyMcqTarget} questions/day`
            );

        } catch (err) {

            showToast.error("Failed to update target");

        } finally {

            setSavingTarget(false);
        }
    };

    // =========================
    // REPLAY TOUR
    // =========================

    const replayTour = () => {

        localStorage.removeItem("prepos-onboarding-completed");

        localStorage.setItem("just-signed-up", "true");

        showToast.success("Tour will replay on next dashboard visit!");
    };

    // =========================
    // CLEAR LOCAL DATA
    // =========================

    const handleClearLocalData = async () => {

        const confirmed = await confirmAction({

            title: "Clear local data?",

            message: "This will clear cached data and preferences from this browser. Your account data on the server is NOT affected. You'll need to log in again.",

            type: "warning",

            confirmText: "Clear & Logout",

            cancelText: "Cancel"
        });

        if (!confirmed) return;

        localStorage.clear();

        showToast.success("Local data cleared!");

        setTimeout(() => {

            window.location.href = "/login";

        }, 1000);
    };

    if (loading || !user) {

        return (

            <div className="min-h-screen bg-brand-light flex items-center justify-center">

                <Loader2 size={24} className="animate-spin text-brand-muted" />

            </div>
        );
    }

    return (

        <div className="min-h-screen bg-brand-light flex">

            <Sidebar isAdmin={user.isAdmin} />

            <MobileNav
                isOpen={mobileNavOpen}
                onClose={() => setMobileNavOpen(false)}
            />

            <div className="flex-1 flex flex-col min-h-screen min-w-0">

                <TopHeader
                    user={user}
                    onMenuClick={() => setMobileNavOpen(true)}
                />

                <main className="flex-1 p-3 sm:p-6 lg:p-10 max-w-4xl w-full mx-auto">

                    <PageHeader
                        icon={Settings}
                        iconBg="bg-brand-accent/10"
                        iconColor="text-brand-accent"
                        title="Settings"
                        description="Customize your preparation experience"
                    />

                    {/* ============== EXAM TARGET ============== */}

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 mb-6"
                    >

                        <div className="flex items-center gap-3 mb-6">

                            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">

                                <Calendar size={18} className="text-blue-600" />

                            </div>

                            <div>

                                <h3 className="font-black text-brand-dark">

                                    Exam Target Date

                                </h3>

                                <p className="text-xs text-brand-muted font-medium">

                                    We'll calculate your daily question target based on this

                                </p>

                            </div>

                        </div>

                        <div className="bg-brand-light rounded-2xl p-4 sm:p-5 border border-brand-border mb-4">

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">

                                <div>

                                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2">

                                        Current Target

                                    </p>

                                    <p className="text-xl font-black text-brand-dark">

                                        {user.targetCompletionDate
                                            ? new Date(user.targetCompletionDate).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric"
                                            })
                                            : "Not set"}

                                    </p>

                                </div>

                                <div>

                                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2">

                                        Daily Question Goal

                                    </p>

                                    <p className="text-xl font-black text-brand-accent">

                                        {user.dailyMcqTarget || 0} questions/day

                                    </p>

                                </div>

                            </div>

                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">

                            <input
                                type="date"
                                value={targetDate}
                                onChange={(e) => setTargetDate(e.target.value)}
                                className="flex-1 p-3 bg-brand-light border border-brand-border rounded-xl font-bold outline-none focus:border-brand-accent text-sm"
                            />

                            <button
                                onClick={handleUpdateTarget}
                                disabled={savingTarget}
                                className="px-6 py-3 bg-brand-dark text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-brand-accent transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {savingTarget ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : (
                                    <Check size={14} />
                                )}
                                Update Target
                            </button>

                        </div>

                    </motion.div>

                    {/* ============== ONBOARDING ============== */}

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 mb-6"
                    >

                        <div className="flex items-center justify-between">

                            <div className="flex items-center gap-3">

                                <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">

                                    <Sparkles size={18} className="text-purple-600" />

                                </div>

                                <div>

                                    <h3 className="font-black text-brand-dark">

                                        Onboarding Tour

                                    </h3>

                                    <p className="text-xs text-brand-muted font-medium">

                                        Replay the platform walkthrough

                                    </p>

                                </div>

                            </div>

                            <button
                                onClick={replayTour}
                                className="px-4 py-2.5 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2"
                            >
                                <RotateCcw size={14} />
                                Replay
                            </button>

                        </div>

                    </motion.div>

                    {/* ============== CLEAR DATA ============== */}

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 mb-6"
                    >

                        <div className="flex items-center justify-between">

                            <div className="flex items-center gap-3">

                                <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">

                                    <Trash2 size={18} className="text-orange-600" />

                                </div>

                                <div>

                                    <h3 className="font-black text-brand-dark">

                                        Clear Local Data

                                    </h3>

                                    <p className="text-xs text-brand-muted font-medium">

                                        Clear browser cache and preferences

                                    </p>

                                </div>

                            </div>

                            <button
                                onClick={handleClearLocalData}
                                className="px-4 py-2.5 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-xl font-black text-xs uppercase tracking-widest transition-all"
                            >
                                Clear
                            </button>

                        </div>

                    </motion.div>

                    {/* ============== APP INFO ============== */}

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-brand-light rounded-3xl border border-brand-border p-6 sm:p-8"
                    >

                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-4">

                            About PrepOS

                        </p>

                        <div className="space-y-3 text-sm font-medium text-brand-dark">

                            <div className="flex justify-between">

                                <span className="text-brand-muted">Version</span>

                                <span className="font-black">1.0.0</span>

                            </div>

                            <div className="flex justify-between">

                                <span className="text-brand-muted">Platform</span>

                                <span className="font-black">Web (PWA Ready)</span>

                            </div>

                            <div className="flex justify-between">

                                <span className="text-brand-muted">Storage Tier</span>

                                <span className="font-black capitalize">

                                    {user.userTier || "Free"}

                                </span>

                            </div>

                            <div className="flex justify-between">

                                <span className="text-brand-muted">Account Type</span>

                                <span className="font-black">

                                    {user.isAdmin ? "Admin" : "User"}

                                </span>

                            </div>

                        </div>

                    </motion.div>

                </main>

                <Footer />

            </div>

        </div>
    );
}