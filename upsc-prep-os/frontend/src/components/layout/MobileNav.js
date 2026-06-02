"use client";

import { AnimatePresence, motion } from "framer-motion";

import Link from "next/link";

import { usePathname } from "next/navigation";

import { X } from "lucide-react";

import {
    LayoutDashboard,
    Target,
    BookOpen,
    Trophy,
    Brain,
    TrendingUp,
    Library,
    FolderOpen,
    GraduationCap,
    Layers,
    Bookmark,
    Sparkles
} from "lucide-react";

const navItems = [

    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/practice", icon: Target, label: "Practice" },
    { href: "/practice-sets", icon: Layers, label: "Practice Sets" },
    { href: "/admin/questions/question-library", icon: BookOpen, label: "Question Library" },
    { href: "/revision", icon: Sparkles, label: "Revision" },
    { href: "/mains", icon: GraduationCap, label: "Mains" },
    { href: "/library", icon: Library, label: "Community Library" },
    { href: "/vault", icon: FolderOpen, label: "My Vault" },
    { href: "/books", icon: BookOpen, label: "Books" },
    { href: "/admin/bookmarks", icon: Bookmark, label: "Bookmarks" },
    { href: "/analytics", icon: TrendingUp, label: "Analytics" },
    { href: "/rankings", icon: Trophy, label: "Leaderboard" }
];

export default function MobileNav({
    isOpen,
    onClose
}) {

    const pathname = usePathname();

    return (

        <AnimatePresence>

            {isOpen && (

                <>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="lg:hidden fixed inset-0 bg-brand-dark/60 backdrop-blur-sm z-40"
                    />

                    <motion.aside
                        initial={{ x: -300 }}
                        animate={{ x: 0 }}
                        exit={{ x: -300 }}
                        transition={{ type: "tween", duration: 0.25 }}
                        className="lg:hidden fixed top-0 left-0 bottom-0 w-72 bg-white z-50 overflow-y-auto"
                    >

                        <div className="flex items-center justify-between p-5 border-b border-brand-border">

                            <div className="flex items-center gap-2">

                                <div className="w-8 h-8 bg-brand-dark rounded-xl flex items-center justify-center">
                                    <span className="text-white font-black text-sm">P</span>
                                </div>

                                <span className="font-black text-lg tracking-tighter">

                                    PrepOS

                                </span>

                            </div>

                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-brand-light rounded-xl"
                            >
                                <X size={18} />
                            </button>

                        </div>

                        <nav className="p-3 space-y-1">

                            {
                                navItems.map((item) => {

                                    const Icon = item.icon;

                                    const isActive =
                                        pathname === item.href ||
                                        (item.href !== "/dashboard" &&
                                            pathname.startsWith(item.href));

                                    return (

                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={onClose}
                                            className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all ${
                                                isActive
                                                    ? "bg-brand-dark text-white"
                                                    : "text-brand-muted hover:bg-brand-light hover:text-brand-dark"
                                            }`}
                                        >

                                            <Icon size={18} />

                                            <span>{item.label}</span>

                                        </Link>
                                    );
                                })
                            }

                        </nav>

                    </motion.aside>

                </>
            )}

        </AnimatePresence>
    );
}