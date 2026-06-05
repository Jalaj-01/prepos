"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import {
    LayoutDashboard,
    Target,
    BookOpen,
    BookOpenCheck,
    Trophy,
    Brain,
    TrendingUp,
    Library,
    FolderOpen,
    GraduationCap,
    Layers,
    Bookmark,
    Sparkles,
    BarChart3,
    Zap,
    CalendarDays,
    FileQuestion,
    UserCog,
    Megaphone,
    X,
    LogOut,
} from "lucide-react";

// =========================
// NAV STRUCTURE — mirrors Sidebar.js
// =========================

const navSections = [
    {
        label: "Overview",
        items: [
            { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
            { href: "/planner", icon: CalendarDays, label: "Planner" },
        ],
    },
    {
        label: "Prelims",
        items: [
            { href: "/prelims-dashboard", icon: BarChart3, label: "Prelims Dashboard" },
            { href: "/practice", icon: Target, label: "Daily Practice" },
            { href: "/practice/free", icon: Zap, label: "Free Practice" },
            { href: "/practice-sets", icon: Layers, label: "Practice Sets" },
            { href: "/admin/questions/question-library", icon: BookOpen, label: "Question Library" },
            { href: "/revision", icon: Sparkles, label: "Revision" },
        ],
    },
    {
        label: "Mains",
        items: [
            { href: "/mains", icon: GraduationCap, label: "Mains Dashboard" },
            { href: "/mains/library", icon: BookOpen, label: "Mains Library" },
        ],
    },
    {
        label: "Resources",
        items: [
            { href: "/library", icon: Library, label: "Community Library" },
            { href: "/vault", icon: FolderOpen, label: "My Vault" },
            { href: "/books", icon: BookOpen, label: "Book Tracker" },
            { href: "/admin/bookmarks", icon: Bookmark, label: "Bookmarks" },
        ],
    },
    {
        label: "Insights",
        items: [
            { href: "/analytics", icon: TrendingUp, label: "Analytics" },
            { href: "/intelligence", icon: Brain, label: "PYQ Intelligence" },
            { href: "/syllabus", icon: BookOpenCheck, label: "Syllabus" },
            { href: "/rankings", icon: Trophy, label: "Leaderboard" },
            { href: "/feedback", icon: FileQuestion, label: "Feedback" },
        ],
    },
];

// =========================
// ACTIVE LINK CHECKER
// =========================

const isLinkActive = (pathname, href, allHrefs) => {
    if (pathname === href) return true;

    const moreSpecificMatch = allHrefs.some(
        (otherHref) =>
            otherHref !== href &&
            otherHref.startsWith(href + "/") &&
            (pathname === otherHref || pathname.startsWith(otherHref + "/"))
    );

    if (moreSpecificMatch) return false;
    return pathname.startsWith(href + "/");
};

// =========================
// ANIMATION VARIANTS
// =========================

const drawerVariants = {
    hidden: { x: "-100%" },
    visible: {
        x: 0,
        transition: { type: "spring", damping: 30, stiffness: 320 },
    },
    exit: {
        x: "-100%",
        transition: { type: "tween", duration: 0.2, ease: "easeIn" },
    },
};

const sectionVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: 0.05 + i * 0.04, duration: 0.25 },
    }),
};

// =========================
// COMPONENT
// =========================

export default function MobileNav({ isOpen, onClose }) {
    const pathname = usePathname();
    const [user, setUser] = useState(null);
    const [isSuper, setIsSuper] = useState(false);

    const allHrefs = navSections.flatMap((s) => s.items.map((i) => i.href));

    useEffect(() => {
        const info = localStorage.getItem("userInfo");
        if (info) setUser(JSON.parse(info));
    }, []);

    useEffect(() => {
        if (!user?.isAdmin) return;
        const checkSuper = async () => {
            try {
                const { data } = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/me/super-status`,
                    { headers: { Authorization: `Bearer ${user.token}` } }
                );
                setIsSuper(!!data.isSuperAdmin);
            } catch {
                // silent
            }
        };
        checkSuper();
    }, [user]);

    const handleLogout = () => {
        localStorage.removeItem("userInfo");
        localStorage.removeItem("just-signed-up");
        localStorage.removeItem("prepos-onboarding-completed");
        localStorage.removeItem("dismissed-announcements");
        localStorage.removeItem("sidebar-collapsed");
        window.location.href = "/";
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* BACKDROP */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="lg:hidden fixed inset-0 bg-brand-dark/60 backdrop-blur-sm z-40"
                    />

                    {/* DRAWER */}
                    <motion.aside
                        variants={drawerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="lg:hidden fixed top-0 left-0 bottom-0 w-[280px] bg-white z-50 flex flex-col shadow-2xl"
                    >
                        {/* HEADER */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border bg-white sticky top-0 z-10">
                            <Link
                                href="/dashboard"
                                onClick={onClose}
                                className="flex items-center gap-2"
                            >
                                <div className="w-9 h-9 bg-brand-dark rounded-xl flex items-center justify-center shadow-sm">
                                    <span className="text-white font-black text-base">
                                        P
                                    </span>
                                </div>
                                <div>
                                    <p className="font-black text-base tracking-tighter text-brand-dark leading-none">
                                        PrepOS
                                    </p>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-brand-muted mt-0.5">
                                        Command Center
                                    </p>
                                </div>
                            </Link>

                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-brand-light rounded-xl text-brand-muted transition-colors"
                                aria-label="Close menu"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* USER PILL */}
                        {user && (
                            <div className="mx-3 mt-3 p-3 bg-gradient-to-br from-brand-light to-white border border-brand-border rounded-2xl flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-brand-accent to-purple-600 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0">
                                    {user.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-black text-brand-dark truncate">
                                        {user.name}
                                    </p>
                                    <p className="text-[10px] font-medium text-brand-muted truncate">
                                        {user.email}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* NAV */}
                        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
                            {navSections.map((section, sIdx) => (
                                <motion.div
                                    key={section.label}
                                    custom={sIdx}
                                    initial="hidden"
                                    animate="visible"
                                    variants={sectionVariants}
                                >
                                    <p className="text-[9px] font-black uppercase tracking-widest text-brand-muted mb-2 px-3">
                                        {section.label}
                                    </p>
                                    <div className="space-y-0.5">
                                        {section.items.map((item) => {
                                            const Icon = item.icon;
                                            const isActive = isLinkActive(
                                                pathname,
                                                item.href,
                                                allHrefs
                                            );
                                            return (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    onClick={onClose}
                                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold transition-all ${
                                                        isActive
                                                            ? "bg-brand-dark text-white shadow-sm"
                                                            : "text-brand-muted hover:bg-brand-light hover:text-brand-dark"
                                                    }`}
                                                >
                                                    <Icon
                                                        size={17}
                                                        className="shrink-0"
                                                    />
                                                    <span className="truncate">
                                                        {item.label}
                                                    </span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            ))}

                            {/* ADMIN SECTION */}
                            {user?.isAdmin && (
                                <motion.div
                                    custom={navSections.length}
                                    initial="hidden"
                                    animate="visible"
                                    variants={sectionVariants}
                                >
                                    <p className="text-[9px] font-black uppercase tracking-widest text-brand-muted mb-2 px-3">
                                        Admin
                                    </p>
                                    <div className="space-y-0.5">
                                        <Link
                                            href="/admin"
                                            onClick={onClose}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold transition-all ${
                                                pathname === "/admin"
                                                    ? "bg-brand-dark text-white shadow-sm"
                                                    : "text-brand-muted hover:bg-brand-light hover:text-brand-dark"
                                            }`}
                                        >
                                            <FileQuestion
                                                size={17}
                                                className="shrink-0"
                                            />
                                            <span>Question Center</span>
                                        </Link>

                                        {isSuper && (
                                            <Link
                                                href="/admin/users"
                                                onClick={onClose}
                                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold transition-all ${
                                                    pathname === "/admin/users" ||
                                                    pathname.startsWith("/admin/users/")
                                                        ? "bg-brand-dark text-white shadow-sm"
                                                        : "text-brand-muted hover:bg-brand-light hover:text-brand-dark"
                                                }`}
                                            >
                                                <UserCog
                                                    size={17}
                                                    className="shrink-0"
                                                />
                                                <span>User Management</span>
                                            </Link>
                                        )}

                                        <Link
                                            href="/admin/announcements"
                                            onClick={onClose}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold transition-all ${
                                                pathname.startsWith("/admin/announcements")
                                                    ? "bg-brand-dark text-white shadow-sm"
                                                    : "text-brand-muted hover:bg-brand-light hover:text-brand-dark"
                                            }`}
                                        >
                                            <Megaphone
                                                size={17}
                                                className="shrink-0"
                                            />
                                            <span>Announcements</span>
                                        </Link>
                                    </div>
                                </motion.div>
                            )}
                        </nav>

                        {/* FOOTER — Logout */}
                        <div className="border-t border-brand-border p-3 bg-white">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <LogOut size={17} className="shrink-0" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}