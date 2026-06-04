"use client";

import { useState, useEffect } from "react";

import Link from "next/link";

import { usePathname } from "next/navigation";

import { motion } from "framer-motion";

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
    Lock,
    ChevronLeft,
    ChevronRight,
    Bookmark,
    Layers,
    Sparkles,
    Megaphone,
    Zap,
    BarChart3,
    CalendarDays,
} from "lucide-react";

// =========================
// NAV STRUCTURE
// =========================

const navSections = [

    {
        label: "Overview",

        items: [
            {
                href: "/dashboard",
                icon: LayoutDashboard,
                label: "Dashboard"
            },
            
            {
                href: "/planner",
                icon: CalendarDays,
                label: "Planner"
            }
        ]
    },

    {
        label: "Prelims",

        items: [
            {
                href: "/prelims-dashboard",
                icon: BarChart3,
                label: "Prelims Dashboard"
            },

            {
                href: "/practice",
                icon: Target,
                label: "Daily Practice"
            },

            {
                href: "/practice/free",
                icon: Zap,
                label: "Free Practice"
            },

            {
                href: "/practice-sets",
                icon: Layers,
                label: "Practice Sets"
            },

            {
                href: "/admin/questions/question-library",
                icon: BookOpen,
                label: "Question Library"
            },

            {
                href: "/revision",
                icon: Sparkles,
                label: "Revision"
            }
        ]
    },

    {
        label: "Mains",

        items: [
            {
                href: "/mains",
                icon: GraduationCap,
                label: "Mains Dashboard"
            },

            {
                href: "/mains/library",
                icon: BookOpen,
                label: "Mains Library"
            }
        ]
    },

    {
        label: "Resources",

        items: [
            {
                href: "/library",
                icon: Library,
                label: "Community Library"
            },

            {
                href: "/vault",
                icon: FolderOpen,
                label: "My Vault"
            },

            {
                href: "/books",
                icon: BookOpen,
                label: "Book Tracker"
            },

            {
                href: "/admin/bookmarks",
                icon: Bookmark,
                label: "Bookmarks"
            }
        ]
    },

    {
        label: "Insights",

        items: [
            {
                href: "/analytics",
                icon: TrendingUp,
                label: "Analytics"
            },

            {
                href: "/intelligence",
                icon: Brain,
                label: "PYQ Intelligence"
            },
            {
            href: "/syllabus",                
            icon: BookOpenCheck,              
            label: "Syllabus"                 
            },

            {
                href: "/rankings",
                icon: Trophy,
                label: "Leaderboard"
            }
        ]
    }
];

// =========================
// ACTIVE LINK CHECKER
// =========================

const isLinkActive = (
    pathname,
    href,
    allHrefs
) => {

    if (pathname === href) return true;

    const moreSpecificMatch =
        allHrefs.some(otherHref =>

            otherHref !== href &&

            otherHref.startsWith(href + "/") &&

            (
                pathname === otherHref ||
                pathname.startsWith(otherHref + "/")
            )
        );

    if (moreSpecificMatch) return false;

    return pathname.startsWith(href + "/");
};

export default function Sidebar({
    isAdmin = false
}) {

    const pathname = usePathname();

    const [collapsed, setCollapsed] = useState(false);

    const allHrefs =
        navSections.flatMap(s =>
            s.items.map(i => i.href)
        );

    useEffect(() => {

        const saved =
            localStorage.getItem("sidebar-collapsed");

        if (saved === "true") {
            setCollapsed(true);
        }

    }, []);

    const toggleCollapsed = () => {

        const newState = !collapsed;

        setCollapsed(newState);

        localStorage.setItem(
            "sidebar-collapsed",
            newState
        );
    };

    return (

        <motion.aside

            data-tour="sidebar"

            initial={false}

            animate={{
                width: collapsed ? 80 : 260
            }}

            transition={{
                duration: 0.2,
                ease: "easeInOut"
            }}

            className="hidden lg:flex flex-col bg-white border-r border-brand-border h-screen sticky top-0 overflow-hidden"
        >

            {/* LOGO HEADER */}

            <div className="flex items-center justify-between p-5 border-b border-brand-border min-h-[72px]">

                {!collapsed && (

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
                )}

                {collapsed && (

                    <Link
                        href="/dashboard"
                        className="mx-auto"
                    >

                        <div className="w-8 h-8 bg-brand-dark rounded-xl flex items-center justify-center">

                            <span className="text-white font-black text-sm">P</span>

                        </div>

                    </Link>
                )}

                <button
                    onClick={toggleCollapsed}
                    className={`p-1.5 hover:bg-brand-light rounded-lg transition-all text-brand-muted ${collapsed ? "absolute right-2 top-6" : ""}`}
                >

                    {collapsed ? (
                        <ChevronRight size={16} />
                    ) : (
                        <ChevronLeft size={16} />
                    )}

                </button>

            </div>

            {/* NAV SECTIONS */}

            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">

                {
                    navSections.map((section) => (

                        <div
                            key={section.label}
                            data-tour={`nav-${section.label.toLowerCase()}`}
                        >

                            {!collapsed && (

                                <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2 px-3">

                                    {section.label}

                                </p>
                            )}

                            <div className="space-y-1">

                                {
                                    section.items.map((item) => {

                                        const isActive =
                                            isLinkActive(
                                                pathname,
                                                item.href,
                                                allHrefs
                                            );

                                        const Icon = item.icon;

                                        return (

                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                title={collapsed ? item.label : ""}
                                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                                    isActive
                                                        ? "bg-brand-dark text-white shadow-sm"
                                                        : "text-brand-muted hover:bg-brand-light hover:text-brand-dark"
                                                } ${collapsed ? "justify-center" : ""}`}
                                            >

                                                <Icon
                                                    size={18}
                                                    className="shrink-0"
                                                />

                                                {!collapsed && (
                                                    <span className="truncate">
                                                        {item.label}
                                                    </span>
                                                )}

                                            </Link>
                                        );
                                    })
                                }

                            </div>

                        </div>
                    ))
                }

                {/* ADMIN SECTION */}

                {isAdmin && (

                    <div>

                        {!collapsed && (

                            <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2 px-3">

                                Admin

                            </p>
                        )}

                        <div className="space-y-1">

                            <Link
                                href="/admin"
                                title={collapsed ? "Admin Panel" : ""}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                    pathname === "/admin"
                                        ? "bg-brand-dark text-white"
                                        : "text-brand-muted hover:bg-brand-light hover:text-brand-dark"
                                } ${collapsed ? "justify-center" : ""}`}
                            >
                                <Lock size={18} className="shrink-0" />
                                {!collapsed && <span>Admin Panel</span>}
                            </Link>

                            <Link
                                href="/admin/announcements"
                                title={collapsed ? "Announcements" : ""}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                    pathname.startsWith("/admin/announcements")
                                        ? "bg-brand-dark text-white"
                                        : "text-brand-muted hover:bg-brand-light hover:text-brand-dark"
                                } ${collapsed ? "justify-center" : ""}`}
                            >
                                <Megaphone size={18} className="shrink-0" />
                                {!collapsed && <span>Announcements</span>}
                            </Link>

                        </div>

                    </div>
                )}

            </nav>

        </motion.aside>
    );
}