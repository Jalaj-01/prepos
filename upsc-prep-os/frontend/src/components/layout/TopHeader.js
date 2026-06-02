"use client";

import { useState, useEffect } from "react";

import Link from "next/link";

import {
    Search,
    Bell,
    Flame,
    TrendingUp,
    LogOut,
    User,
    Settings,
    Menu
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

import GlobalSearch from "@/components/search/GlobalSearch";

export default function TopHeader({
    user,
    readinessScore = 0,
    onMenuClick
}) {

    const [profileOpen, setProfileOpen] = useState(false);

    const [searchOpen, setSearchOpen] = useState(false);

    // =========================
    // KEYBOARD SHORTCUT (Cmd/Ctrl + K)
    // =========================

    useEffect(() => {

        const handleKeyDown = (e) => {

            if (
                (e.metaKey || e.ctrlKey) &&

                e.key.toLowerCase() === "k"
            ) {

                e.preventDefault();

                setSearchOpen(true);
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () =>
            window.removeEventListener("keydown", handleKeyDown);

    }, []);

    const handleLogout = () => {

        localStorage.removeItem("userInfo");

        window.location.href = "/login";
    };

    if (!user) return null;

    return (

        <>

            <header className="bg-white border-b border-brand-border sticky top-0 z-30">

                <div className="flex items-center justify-between px-3 sm:px-4 lg:px-8 h-[64px] sm:h-[72px]">

                    {/* LEFT — MOBILE MENU + SEARCH */}

                    <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-xl min-w-0">

                        <button
                            onClick={onMenuClick}
                            className="lg:hidden p-2 hover:bg-brand-light rounded-xl shrink-0"
                            aria-label="Menu"
                        >
                            <Menu size={20} className="text-brand-dark" />
                        </button>

                        {/* SEARCH BAR (Click to open modal) */}

                        <button
                            data-tour="search"
                            onClick={() => setSearchOpen(true)}
                            className="hidden md:flex items-center gap-2 bg-brand-light hover:bg-brand-border/50 rounded-2xl px-4 py-2.5 flex-1 border border-brand-border transition-all text-left group"
                        >

                            <Search size={16} className="text-brand-muted shrink-0" />

                            <span className="text-sm font-medium text-brand-muted flex-1">

                                Search anything...

                            </span>

                            <kbd className="text-[10px] font-black bg-white border border-brand-border px-2 py-0.5 rounded text-brand-muted shrink-0">

                                ⌘K

                            </kbd>

                        </button>

                        {/* MOBILE: ICON ONLY */}

                        <button
                            onClick={() => setSearchOpen(true)}
                            className="md:hidden p-2 hover:bg-brand-light rounded-xl"
                            aria-label="Search"
                        >
                            <Search size={18} className="text-brand-dark" />
                        </button>

                    </div>

                    {/* RIGHT — STATS + PROFILE */}

                    <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">

                        {/* READINESS (Hide on small) */}

                        <div className="hidden md:flex items-center gap-1.5 bg-brand-dark px-3 py-2 rounded-full">

                            <TrendingUp size={14} className="text-brand-accent" />

                            <span className="text-white font-bold text-xs">

                                {readinessScore}%

                            </span>

                        </div>

                        {/* STREAK */}

                        <div
                            data-tour="streak"
                            className="flex items-center gap-1.5 bg-orange-50 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full border border-orange-100"
                        >

                            <Flame
                                size={14}
                                className="text-orange-500 fill-orange-500"
                            />

                            <span className="text-orange-700 font-bold text-xs">

                                {user.streak || 0}

                            </span>

                        </div>

                        {/* NOTIFICATIONS */}

                        <button className="p-2 hover:bg-brand-light rounded-xl transition-all relative">

                            <Bell size={16} className="text-brand-muted" />

                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />

                        </button>

                        {/* PROFILE */}

                        <div className="relative" data-tour="profile">

                            <button
                                onClick={() => setProfileOpen(!profileOpen)}
                                className="flex items-center gap-2 hover:bg-brand-light p-1.5 rounded-xl transition-all"
                            >

                                <div className="w-8 h-8 bg-gradient-to-br from-brand-accent to-purple-600 rounded-xl flex items-center justify-center text-white font-black text-sm">

                                    {user.name?.charAt(0).toUpperCase()}

                                </div>

                            </button>

                            <AnimatePresence>

                                {profileOpen && (

                                    <>

                                        <div
                                            className="fixed inset-0 z-30"
                                            onClick={() => setProfileOpen(false)}
                                        />

                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute right-0 top-12 w-64 bg-white rounded-2xl border border-brand-border shadow-xl z-40 overflow-hidden"
                                        >

                                            <div className="p-4 border-b border-brand-border">

                                                <p className="font-black text-brand-dark text-sm truncate">

                                                    {user.name}

                                                </p>

                                                <p className="text-xs text-brand-muted font-medium truncate mt-0.5">

                                                    {user.email}

                                                </p>

                                            </div>

                                            <div className="p-2">

                                                <Link
                                                    href="/profile"
                                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-brand-light text-sm font-bold text-brand-dark"
                                                >
                                                    <User size={16} className="text-brand-muted" />
                                                    Profile
                                                </Link>

                                                <Link
                                                    href="/settings"
                                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-brand-light text-sm font-bold text-brand-dark"
                                                >
                                                    <Settings size={16} className="text-brand-muted" />
                                                    Settings
                                                </Link>

                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-sm font-bold text-red-600"
                                                >
                                                    <LogOut size={16} />
                                                    Logout
                                                </button>

                                            </div>

                                        </motion.div>

                                    </>
                                )}

                            </AnimatePresence>

                        </div>

                    </div>

                </div>

            </header>

            {/* GLOBAL SEARCH MODAL */}

            <GlobalSearch
                isOpen={searchOpen}
                onClose={() => setSearchOpen(false)}
            />

        </>
    );
}