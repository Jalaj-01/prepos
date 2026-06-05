"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bell,
    BellRing,
    Check,
    Trash2,
    CheckCheck,
    Inbox,
    Crown,
    MessageSquare,
    Megaphone,
    Sparkles,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import axios from "axios";
import { showToast } from "@/components/ui/Toast";

const TYPE_ICON = {
    feedback_admin_reply: { icon: MessageSquare, color: "text-purple-600 bg-purple-100" },
    feedback_official: { icon: Megaphone, color: "text-indigo-600 bg-indigo-100" },
    feedback_status_change: { icon: Sparkles, color: "text-blue-600 bg-blue-100" },
    default: { icon: Bell, color: "text-brand-muted bg-brand-light" },
};

const POLL_INTERVAL = 120000; // 2m

export default function NotificationBell({ user }) {
    const [open, setOpen] = useState(false);
    const [notes, setNotes] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef(null);
    const router = useRouter();

    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const getConfig = useCallback(
        () => ({
            headers: { Authorization: `Bearer ${user?.token}` },
        }),
        [user]
    );

    // ─── Fetch unread count (light, polls often) ───
    const fetchUnreadCount = useCallback(async () => {
        if (!user?.token) return;
        try {
            const { data } = await axios.get(
                `${baseUrl}/api/notifications/unread-count`,
                getConfig()
            );
            setUnreadCount(data.count || 0);
        } catch {}
    }, [baseUrl, user, getConfig]);

    // ─── Fetch full notification list ───
    const fetchNotes = useCallback(async () => {
        if (!user?.token) return;
        setLoading(true);
        try {
            const { data } = await axios.get(
                `${baseUrl}/api/notifications?limit=10`,
                getConfig()
            );
            setNotes(data.notifications || []);
        } catch {} finally {
            setLoading(false);
        }
    }, [baseUrl, user, getConfig]);

    // Initial + polling
    useEffect(() => {
    if (!user?.token) return;

    let id;
    const start = () => {
        fetchUnreadCount();
        id = setInterval(fetchUnreadCount, POLL_INTERVAL);
    };
    const stop = () => {
        if (id) clearInterval(id);
        id = null;
    };

    const handleVisibility = () => {
        if (document.hidden) {
            stop();
        } else {
            start();
        }
    };

    start();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
        stop();
        document.removeEventListener("visibilitychange", handleVisibility);
    };
}, [user, fetchUnreadCount]);

    // When dropdown opens, fetch full list
    useEffect(() => {
        if (open) fetchNotes();
    }, [open, fetchNotes]);

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        const handleClick = (e) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    const handleClick = async (note) => {
        // Mark as read
        if (!note.read) {
            try {
                await axios.patch(
                    `${baseUrl}/api/notifications/${note._id}/read`,
                    {},
                    getConfig()
                );
                setNotes((ns) =>
                    ns.map((n) =>
                        n._id === note._id ? { ...n, read: true } : n
                    )
                );
                setUnreadCount((c) => Math.max(0, c - 1));
            } catch {}
        }
        setOpen(false);
        if (note.link) router.push(note.link);
    };

    const handleMarkAllRead = async () => {
        if (unreadCount === 0) return;
        try {
            await axios.patch(
                `${baseUrl}/api/notifications/read-all`,
                {},
                getConfig()
            );
            setNotes((ns) => ns.map((n) => ({ ...n, read: true })));
            setUnreadCount(0);
            showToast.success("All marked as read");
        } catch {
            showToast.error("Couldn't mark all read");
        }
    };

    const handleDelete = async (e, noteId) => {
        e.stopPropagation();
        try {
            await axios.delete(
                `${baseUrl}/api/notifications/${noteId}`,
                getConfig()
            );
            const wasUnread = notes.find((n) => n._id === noteId)?.read === false;
            setNotes((ns) => ns.filter((n) => n._id !== noteId));
            if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1));
        } catch {}
    };

    if (!user) return null;

    const showBadge = unreadCount > 0;

    return (
        <div ref={wrapperRef} className="relative">
            {/* BELL BUTTON */}
            <button
                onClick={() => setOpen(!open)}
                className={`relative p-2 rounded-xl transition-all ${
                    open
                        ? "bg-brand-light text-brand-dark"
                        : "hover:bg-brand-light text-brand-muted"
                }`}
                aria-label="Notifications"
            >
                {showBadge ? (
                    <BellRing size={16} className="text-brand-dark" />
                ) : (
                    <Bell size={16} />
                )}
                {showBadge && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border border-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* DROPDOWN */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-12 w-[340px] sm:w-[380px] bg-white rounded-2xl border border-brand-border shadow-2xl z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-brand-border flex items-center justify-between bg-gradient-to-br from-white to-brand-light/30">
                            <div className="flex items-center gap-2">
                                <div className="bg-brand-accent/10 p-1.5 rounded-lg">
                                    <Bell size={13} className="text-brand-accent" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-brand-muted leading-none">
                                        Inbox
                                    </p>
                                    <p className="text-sm font-black text-brand-dark mt-0.5">
                                        Notifications
                                        {unreadCount > 0 && (
                                            <span className="ml-1.5 text-[10px] font-black text-brand-accent">
                                                ({unreadCount} new)
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-brand-muted hover:bg-brand-light hover:text-brand-dark transition-colors"
                                    title="Mark all as read"
                                >
                                    <CheckCheck size={11} />
                                    Mark all
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div className="max-h-[420px] overflow-y-auto">
                            {loading && notes.length === 0 ? (
                                <p className="text-center text-xs font-bold text-brand-muted py-10">
                                    Loading...
                                </p>
                            ) : notes.length === 0 ? (
                                <div className="text-center py-12 px-4">
                                    <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-light rounded-2xl mb-3">
                                        <Inbox
                                            size={22}
                                            className="text-brand-muted"
                                        />
                                    </div>
                                    <p className="text-sm font-black text-brand-dark">
                                        You're all caught up
                                    </p>
                                    <p className="text-[11px] font-bold text-brand-muted mt-1">
                                        No new notifications
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    {notes.map((n) => {
                                        const meta =
                                            TYPE_ICON[n.type] ||
                                            TYPE_ICON.default;
                                        const Icon = meta.icon;
                                        return (
                                            <button
                                                key={n._id}
                                                onClick={() => handleClick(n)}
                                                className={`group w-full text-left px-4 py-3 flex items-start gap-3 border-b border-brand-border last:border-b-0 transition-colors ${
                                                    n.read
                                                        ? "hover:bg-brand-light/60"
                                                        : "bg-brand-accent/5 hover:bg-brand-accent/10"
                                                }`}
                                            >
                                                <div
                                                    className={`relative w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${meta.color}`}
                                                >
                                                    <Icon size={14} />
                                                    {n.actorIsAdmin && (
                                                        <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-purple-600 to-brand-accent rounded-full flex items-center justify-center ring-2 ring-white">
                                                            <Crown
                                                                size={8}
                                                                className="fill-white text-white"
                                                            />
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <p
                                                        className={`text-xs leading-snug ${
                                                            n.read
                                                                ? "font-bold text-brand-dark"
                                                                : "font-black text-brand-dark"
                                                        }`}
                                                    >
                                                        {n.title}
                                                    </p>
                                                    {n.body && (
                                                        <p className="text-[11px] font-medium text-brand-muted mt-0.5 line-clamp-2">
                                                            {n.body}
                                                        </p>
                                                    )}
                                                    <p className="text-[10px] font-bold text-brand-muted/70 mt-1">
                                                        {formatDistanceToNow(
                                                            new Date(n.createdAt),
                                                            { addSuffix: true }
                                                        )}
                                                    </p>
                                                </div>

                                                <div className="flex flex-col items-end gap-1 shrink-0">
                                                    {!n.read && (
                                                        <span className="w-2 h-2 bg-brand-accent rounded-full mt-1" />
                                                    )}
                                                    <button
                                                        onClick={(e) =>
                                                            handleDelete(e, n._id)
                                                        }
                                                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-brand-muted hover:bg-red-50 hover:text-red-500 transition-all"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={10} />
                                                    </button>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {notes.length > 0 && (
                            <div className="px-4 py-2.5 border-t border-brand-border bg-brand-light/30 text-center">
                                <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
                                    Showing last {notes.length}
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}