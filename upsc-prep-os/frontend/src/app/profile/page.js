"use client";

import { useState, useEffect } from "react";

import { motion } from "framer-motion";

import axios from "axios";

import {
    User,
    Mail,
    Calendar,
    Shield,
    Edit3,
    Check,
    X,
    Key,
    Trash2,
    HardDrive,
    Clock,
    Loader2,
    ArrowLeft,
    Award,
    Flame,
    Target
} from "lucide-react";

import Link from "next/link";

import Sidebar from "@/components/layout/Sidebar";

import TopHeader from "@/components/layout/TopHeader";

import Footer from "@/components/layout/Footer";

import MobileNav from "@/components/layout/MobileNav";

import PageHeader from "@/components/ui/PageHeader";

import { showToast } from "@/components/ui/Toast";

import { confirmAction } from "@/components/ui/ConfirmModal";

export default function ProfilePage() {

    const [user, setUser] = useState(null);

    const [profile, setProfile] = useState(null);

    const [storage, setStorage] = useState(null);

    const [loading, setLoading] = useState(true);

    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    // Edit name

    const [editingName, setEditingName] = useState(false);

    const [newName, setNewName] = useState("");

    const [savingName, setSavingName] = useState(false);

    // Change password

    const [showPassword, setShowPassword] = useState(false);

    const [currentPassword, setCurrentPassword] = useState("");

    const [newPassword, setNewPassword] = useState("");

    const [confirmPassword, setConfirmPassword] = useState("");

    const [changingPassword, setChangingPassword] = useState(false);

    useEffect(() => {

        const info = localStorage.getItem("userInfo");

        if (!info) {
            window.location.href = "/login";
            return;
        }

        const parsed = JSON.parse(info);

        setUser(parsed);

        fetchProfile(parsed.token);

        fetchStorage(parsed.token);

    }, []);

    const fetchProfile = async (token) => {

        try {

            const { data } = await axios.get(

                `${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`,

                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setProfile(data);

            setNewName(data.name);

        } catch (err) {

            console.error("Profile fetch error", err);

        } finally {

            setLoading(false);
        }
    };

    const fetchStorage = async (token) => {

        try {

            const { data } = await axios.get(

                `${process.env.NEXT_PUBLIC_API_URL}/api/storage/me`,

                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setStorage(data);

        } catch (err) {

            console.error("Storage fetch error", err);
        }
    };

    // =========================
    // UPDATE NAME
    // =========================

    const handleSaveName = async () => {

        if (!newName.trim()) {

            showToast.error("Name cannot be empty");

            return;
        }

        if (newName.trim() === profile.name) {

            setEditingName(false);

            return;
        }

        setSavingName(true);

        try {

            const { data } = await axios.put(

                `${process.env.NEXT_PUBLIC_API_URL}/api/auth/update-name`,

                { name: newName.trim() },

                {
                    headers: { Authorization: `Bearer ${user.token}` }
                }
            );

            // Update localStorage

            const updatedUser = { ...user, name: data.name };

            localStorage.setItem("userInfo", JSON.stringify(updatedUser));

            setUser(updatedUser);

            setProfile({ ...profile, name: data.name });

            setEditingName(false);

            showToast.success("Name updated!");

        } catch (err) {

            showToast.error(
                err.response?.data?.message || "Failed to update name"
            );

        } finally {

            setSavingName(false);
        }
    };

    // =========================
    // CHANGE PASSWORD
    // =========================

    const handleChangePassword = async () => {

        if (!currentPassword || !newPassword) {

            showToast.error("Please fill all password fields");

            return;
        }

        if (newPassword.length < 6) {

            showToast.error("New password must be at least 6 characters");

            return;
        }

        if (newPassword !== confirmPassword) {

            showToast.error("New passwords don't match");

            return;
        }

        setChangingPassword(true);

        try {

            await axios.put(

                `${process.env.NEXT_PUBLIC_API_URL}/api/auth/change-password`,

                {
                    currentPassword,
                    newPassword
                },

                {
                    headers: { Authorization: `Bearer ${user.token}` }
                }
            );

            showToast.success("Password changed!");

            setShowPassword(false);

            setCurrentPassword("");

            setNewPassword("");

            setConfirmPassword("");

        } catch (err) {

            showToast.error(
                err.response?.data?.message || "Failed to change password"
            );

        } finally {

            setChangingPassword(false);
        }
    };

    // =========================
    // DELETE ACCOUNT
    // =========================

    const handleDeleteAccount = async () => {

        const confirmed = await confirmAction({

            title: "Delete your account?",

            message: "This will permanently delete:\n\n• All your questions & attempts\n• All uploaded documents\n• All folders & bookmarks\n• Your preparation tracks\n\nThis action CANNOT be undone.",

            type: "danger",

            confirmText: "Delete Forever",

            cancelText: "Keep My Account"
        });

        if (!confirmed) return;

        // Double confirm

       const confirmText = await promptModal({
    title: "Delete your account permanently?",
    message: "This will remove all your data — attempts, notes, files, planner, everything. This cannot be undone.",
    placeholder: "Type DELETE MY ACCOUNT",
    mustMatch: "DELETE MY ACCOUNT",
    confirmText: "Delete Forever",
    type: "danger",
});
if (!confirmText) return;
        

        try {

            await axios.delete(

                `${process.env.NEXT_PUBLIC_API_URL}/api/auth/delete-account`,

                {
                    headers: { Authorization: `Bearer ${user.token}` },

                    data: { confirmText: "DELETE MY ACCOUNT" }
                }
            );

            // Clear everything

            localStorage.clear();

            showToast.success("Account deleted. Goodbye.");

            setTimeout(() => {

                window.location.href = "/";

            }, 1500);

        } catch (err) {

            showToast.error(
                err.response?.data?.message || "Failed to delete account"
            );
        }
    };

    // =========================
    // HELPERS
    // =========================

    const formatDate = (date) => {

        if (!date) return "Not set";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    };

    const getInitials = (name) => {

        if (!name) return "?";

        return name
            .split(" ")
            .map(w => w[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    if (loading || !user) {

        return (

            <div className="min-h-screen bg-brand-light flex items-center justify-center">

                <Loader2 size={24} className="animate-spin text-brand-muted" />

            </div>
        );
    }

    const isGoogleUser =
        profile?.authProvider === "google";

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
                        icon={User}
                        iconBg="bg-brand-accent/10"
                        iconColor="text-brand-accent"
                        title="My Profile"
                        description="Manage your account and preferences"
                    />

                    {/* ============== PROFILE CARD ============== */}

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 mb-6"
                    >

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">

                            {/* Avatar */}

                            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-brand-accent to-purple-600 rounded-3xl flex items-center justify-center text-white font-black text-2xl sm:text-3xl shrink-0">

                                {getInitials(profile?.name)}

                            </div>

                            <div className="flex-1 min-w-0">

                                {/* Name */}

                                {editingName ? (

                                    <div className="flex items-center gap-2 mb-2">

                                        <input
                                            type="text"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") handleSaveName();
                                                if (e.key === "Escape") {
                                                    setEditingName(false);
                                                    setNewName(profile.name);
                                                }
                                            }}
                                            autoFocus
                                            className="text-2xl sm:text-3xl font-black text-brand-dark bg-brand-light border border-brand-border rounded-xl px-3 py-1 outline-none focus:border-brand-accent flex-1 min-w-0"
                                        />

                                        <button
                                            onClick={handleSaveName}
                                            disabled={savingName}
                                            className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-xl transition-all"
                                        >
                                            {savingName ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                        </button>

                                        <button
                                            onClick={() => {
                                                setEditingName(false);
                                                setNewName(profile.name);
                                            }}
                                            className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl transition-all"
                                        >
                                            <X size={16} />
                                        </button>

                                    </div>

                                ) : (

                                    <div className="flex items-center gap-3 mb-2">

                                        <h2 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tight truncate">

                                            {profile?.name}

                                        </h2>

                                        <button
                                            onClick={() => setEditingName(true)}
                                            className="p-1.5 hover:bg-brand-light rounded-lg text-brand-muted hover:text-brand-accent transition-all"
                                        >
                                            <Edit3 size={16} />
                                        </button>

                                    </div>
                                )}

                                <div className="flex items-center gap-2 text-brand-muted">

                                    <Mail size={14} />

                                    <span className="text-sm font-medium truncate">

                                        {profile?.email}

                                    </span>

                                </div>

                                {isGoogleUser && (

                                    <div className="flex items-center gap-2 mt-2">

                                        <span className="text-[9px] font-black uppercase tracking-widest bg-blue-50 text-blue-700 px-2 py-1 rounded-full">

                                            Google Account

                                        </span>

                                    </div>
                                )}

                            </div>

                        </div>

                        {/* Stats Grid */}

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

                            <StatItem
                                icon={Calendar}
                                label="Member Since"
                                value={formatDate(profile?.createdAt)}
                                color="text-blue-600"
                            />

                            <StatItem
                                icon={Target}
                                label="Daily Target"
                                value={`${profile?.dailyMcqTarget || 0} Q/day`}
                                color="text-green-600"
                            />

                            <StatItem
                                icon={Flame}
                                label="Current Streak"
                                value={`${profile?.streak || 0} days`}
                                color="text-orange-600"
                            />

                            <StatItem
                                icon={Award}
                                label="Questions Solved"
                                value={profile?.totalQuestionsSolved || 0}
                                color="text-purple-600"
                            />

                        </div>

                    </motion.div>

                    {/* ============== STORAGE ============== */}

                    {storage && (

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 mb-6"
                        >

                            <div className="flex items-center gap-3 mb-6">

                                <div className="w-10 h-10 bg-brand-accent/10 rounded-xl flex items-center justify-center">

                                    <HardDrive size={18} className="text-brand-accent" />

                                </div>

                                <div>

                                    <h3 className="font-black text-brand-dark">

                                        Storage

                                    </h3>

                                    <p className="text-xs text-brand-muted font-medium">

                                        {storage.usedMB} / {storage.quotaMB} MB used

                                    </p>

                                </div>

                            </div>

                            <div className="w-full bg-brand-light h-3 rounded-full overflow-hidden mb-3">

                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(storage.usedPercentage, 100)}%` }}
                                    className={`h-full rounded-full ${
                                        storage.usedPercentage >= 90
                                            ? "bg-red-500"
                                            : storage.usedPercentage >= 70
                                            ? "bg-yellow-500"
                                            : "bg-green-500"
                                    }`}
                                />

                            </div>

                            <div className="flex justify-between text-xs font-bold text-brand-muted">

                                <span>{storage.usedPercentage}% used</span>

                                <span>{storage.remainingMB} MB remaining</span>

                            </div>

                        </motion.div>
                    )}

                    {/* ============== CHANGE PASSWORD ============== */}

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 mb-6"
                    >

                        <div className="flex items-center justify-between mb-6">

                            <div className="flex items-center gap-3">

                                <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center">

                                    <Key size={18} className="text-yellow-600" />

                                </div>

                                <div>

                                    <h3 className="font-black text-brand-dark">

                                        Password

                                    </h3>

                                    <p className="text-xs text-brand-muted font-medium">

                                        {isGoogleUser ? "Google accounts use Google sign-in" : "Change your password"}

                                    </p>

                                </div>

                            </div>

                            {!isGoogleUser && !showPassword && (

                                <button
                                    onClick={() => setShowPassword(true)}
                                    className="px-4 py-2 bg-brand-light hover:bg-brand-dark hover:text-white text-brand-dark rounded-xl font-black text-xs uppercase tracking-widest transition-all"
                                >
                                    Change
                                </button>
                            )}

                        </div>

                        {showPassword && !isGoogleUser && (

                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="space-y-3"
                            >

                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Current password"
                                    className="w-full p-3 bg-brand-light border border-brand-border rounded-xl font-bold outline-none focus:border-brand-accent text-sm"
                                />

                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="New password (min 6 chars)"
                                    className="w-full p-3 bg-brand-light border border-brand-border rounded-xl font-bold outline-none focus:border-brand-accent text-sm"
                                />

                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                    className="w-full p-3 bg-brand-light border border-brand-border rounded-xl font-bold outline-none focus:border-brand-accent text-sm"
                                />

                                <div className="flex gap-2 pt-2">

                                    <button
                                        onClick={() => {
                                            setShowPassword(false);
                                            setCurrentPassword("");
                                            setNewPassword("");
                                            setConfirmPassword("");
                                        }}
                                        className="flex-1 py-3 bg-brand-light text-brand-dark rounded-xl font-black text-xs uppercase tracking-widest"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        onClick={handleChangePassword}
                                        disabled={changingPassword}
                                        className="flex-1 py-3 bg-brand-dark text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-brand-accent transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {changingPassword ? (
                                            <Loader2 size={14} className="animate-spin" />
                                        ) : (
                                            "Save Password"
                                        )}
                                    </button>

                                </div>

                            </motion.div>
                        )}

                    </motion.div>

                    {/* ============== DANGER ZONE ============== */}

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 border-2 border-red-100 rounded-3xl p-6 sm:p-8"
                    >

                        <div className="flex items-center gap-3 mb-4">

                            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">

                                <Trash2 size={18} className="text-red-600" />

                            </div>

                            <div>

                                <h3 className="font-black text-red-900">

                                    Danger Zone

                                </h3>

                                <p className="text-xs text-red-700 font-medium">

                                    Permanently delete your account and all data

                                </p>

                            </div>

                        </div>

                        <p className="text-sm text-red-800 font-medium leading-relaxed mb-4">

                            Once you delete your account, there is no going back. All your questions, attempts, documents, folders, and preparation data will be permanently removed.

                        </p>

                        <button
                            onClick={handleDeleteAccount}
                            className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all"
                        >
                            Delete My Account
                        </button>

                    </motion.div>

                </main>

                <Footer />

            </div>

        </div>
    );
}

// =========================
// STAT ITEM
// =========================

function StatItem({ icon: Icon, label, value, color }) {

    return (

        <div className="bg-brand-light rounded-2xl p-3 sm:p-4 border border-brand-border">

            <Icon size={16} className={`${color} mb-2`} />

            <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-1">

                {label}

            </p>

            <p className="text-sm font-black text-brand-dark truncate">

                {value}

            </p>

        </div>
    );
}