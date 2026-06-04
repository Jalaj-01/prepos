"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronDown,
    ChevronUp,
    Trash2,
    MessageSquare,
    ArrowUp,
    Pin,
    Crown,
    Lightbulb,
    Bug,
    HelpCircle,
    Heart,
    Megaphone,
    MoreHorizontal,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import axios from "axios";
import { showToast } from "@/components/ui/Toast";
import AdminBadge from "./AdminBadge";
import FeedbackReplyComposer from "./FeedbackReplyComposer";

const CATEGORY_META = {
    suggestion: { icon: Lightbulb, color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
    bug: { icon: Bug, color: "text-red-600 bg-red-50 border-red-200" },
    question: { icon: HelpCircle, color: "text-blue-600 bg-blue-50 border-blue-200" },
    praise: { icon: Heart, color: "text-pink-600 bg-pink-50 border-pink-200" },
    discussion: { icon: MessageSquare, color: "text-purple-600 bg-purple-50 border-purple-200" },
};

const STATUS_META = {
    open: { label: "Open", color: "bg-gray-100 text-gray-700" },
    planned: { label: "Planned", color: "bg-blue-100 text-blue-700" },
    "in-progress": { label: "In Progress", color: "bg-yellow-100 text-yellow-700" },
    shipped: { label: "Shipped", color: "bg-green-100 text-green-700" },
    resolved: { label: "Resolved", color: "bg-green-100 text-green-700" },
    "wont-fix": { label: "Won't Fix", color: "bg-gray-100 text-gray-500" },
};

const STATUS_OPTIONS = [
    "open",
    "planned",
    "in-progress",
    "shipped",
    "resolved",
    "wont-fix",
];

export default function FeedbackPostCard({ post, user, onChange, onDelete }) {
    const [expanded, setExpanded] = useState(false);
    const [upvoting, setUpvoting] = useState(false);
    const [showAdminMenu, setShowAdminMenu] = useState(false);
    const [hasUp, setHasUp] = useState(post.hasUpvoted);
    const [upCount, setUpCount] = useState(post.upvoteCount || 0);
    const [replies, setReplies] = useState(post.replies || []);

    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const cat = CATEGORY_META[post.category] || CATEGORY_META.discussion;
    const CatIcon = cat.icon;
    const status = STATUS_META[post.status] || STATUS_META.open;
    const isOfficial = post.isOfficial;
    const isAuthor = String(post.author) === String(user?._id);
    const canDelete = isAuthor || user?.isAdmin;

    const toggleUpvote = async () => {
        if (upvoting) return;
        setUpvoting(true);
        // optimistic
        setHasUp(!hasUp);
        setUpCount((c) => (hasUp ? c - 1 : c + 1));
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            const { data } = await axios.post(
                `${baseUrl}/api/feedback/${post._id}/upvote`,
                {},
                config
            );
            setHasUp(data.hasUpvoted);
            setUpCount(data.upvoteCount);
        } catch (e) {
            // rollback
            setHasUp(hasUp);
            setUpCount((c) => (hasUp ? c + 1 : c - 1));
            showToast.error("Couldn't upvote");
        } finally {
            setUpvoting(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Delete this post?")) return;
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            await axios.delete(
                `${baseUrl}/api/feedback/${post._id}`,
                config
            );
            showToast.success("Post deleted");
            onDelete?.(post._id);
        } catch (e) {
            showToast.error("Couldn't delete");
        }
    };

    const handleReplyAdded = (reply) => {
        setReplies((r) => [...r, reply]);
        setExpanded(true);
    };

    const handleDeleteReply = async (replyId) => {
        if (!confirm("Delete this reply?")) return;
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            await axios.delete(
                `${baseUrl}/api/feedback/${post._id}/reply/${replyId}`,
                config
            );
            setReplies((r) => r.filter((x) => x._id !== replyId));
            showToast.success("Reply deleted");
        } catch (e) {
            showToast.error("Couldn't delete reply");
        }
    };

    const adminAction = async (payload) => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            const { data } = await axios.patch(
                `${baseUrl}/api/feedback/${post._id}/admin`,
                payload,
                config
            );
            onChange?.(data.post);
            showToast.success("Updated");
            setShowAdminMenu(false);
        } catch (e) {
            showToast.error("Couldn't update");
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className={`relative rounded-2xl p-4 sm:p-5 transition-all ${
                isOfficial
                    ? "bg-gradient-to-br from-purple-50 via-white to-indigo-50 border-2 border-transparent bg-clip-padding"
                    : "bg-white border border-brand-border"
            }`}
            style={
                isOfficial
                    ? {
                          backgroundImage:
                              "linear-gradient(white, white), linear-gradient(135deg, #9333ea, #6366f1)",
                          backgroundOrigin: "border-box",
                          backgroundClip: "padding-box, border-box",
                      }
                    : undefined
            }
        >
            {/* Pinned ribbon */}
            {post.pinned && (
                <div className="absolute -top-2 left-4 bg-brand-dark text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <Pin size={9} className="fill-white" />
                    Pinned
                </div>
            )}

            <div className="flex items-start gap-3">
                {/* Upvote column */}
                <button
                    onClick={toggleUpvote}
                    disabled={upvoting}
                    className={`shrink-0 flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl border transition-all ${
                        hasUp
                            ? "bg-brand-dark text-white border-brand-dark"
                            : "bg-brand-light text-brand-muted border-brand-border hover:text-brand-dark hover:border-brand-dark"
                    } disabled:opacity-50`}
                >
                    <ArrowUp size={14} className={hasUp ? "fill-white" : ""} />
                    <span className="text-xs font-black tabular-nums">
                        {upCount}
                    </span>
                </button>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                            {isOfficial ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-white px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-brand-accent">
                                    <Crown size={9} className="fill-white" />
                                    Official Update
                                </span>
                            ) : (
                                <span
                                    className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${cat.color}`}
                                >
                                    <CatIcon size={9} />
                                    {post.category}
                                </span>
                            )}
                            {post.status !== "open" && (
                                <span
                                    className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${status.color}`}
                                >
                                    {status.label}
                                </span>
                            )}
                        </div>

                        {/* Actions menu */}
                        <div className="flex items-center gap-0.5">
                            {user?.isAdmin && (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowAdminMenu(!showAdminMenu)}
                                        className="p-1.5 rounded-lg text-brand-muted hover:bg-brand-light hover:text-brand-dark transition-colors"
                                        title="Admin actions"
                                    >
                                        <MoreHorizontal size={14} />
                                    </button>
                                    <AnimatePresence>
                                        {showAdminMenu && (
                                            <>
                                                <div
                                                    className="fixed inset-0 z-30"
                                                    onClick={() => setShowAdminMenu(false)}
                                                />
                                                <motion.div
                                                    initial={{ opacity: 0, y: -4 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -4 }}
                                                    className="absolute right-0 top-8 z-40 bg-white border border-brand-border rounded-xl shadow-xl p-2 min-w-[180px]"
                                                >
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-brand-muted px-2 py-1">
                                                        Status
                                                    </p>
                                                    {STATUS_OPTIONS.map((s) => (
                                                        <button
                                                            key={s}
                                                            onClick={() =>
                                                                adminAction({ status: s })
                                                            }
                                                            className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                                                post.status === s
                                                                    ? "bg-brand-dark text-white"
                                                                    : "text-brand-dark hover:bg-brand-light"
                                                            }`}
                                                        >
                                                            {STATUS_META[s].label}
                                                        </button>
                                                    ))}
                                                    <div className="border-t border-brand-border my-1" />
                                                    <button
                                                        onClick={() =>
                                                            adminAction({
                                                                pinned: !post.pinned,
                                                            })
                                                        }
                                                        className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-bold text-brand-dark hover:bg-brand-light flex items-center gap-2"
                                                    >
                                                        <Pin size={11} />
                                                        {post.pinned ? "Unpin" : "Pin to top"}
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            adminAction({
                                                                isOfficial: !post.isOfficial,
                                                            })
                                                        }
                                                        className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-bold text-brand-dark hover:bg-brand-light flex items-center gap-2"
                                                    >
                                                        <Megaphone size={11} />
                                                        {post.isOfficial
                                                            ? "Remove Official"
                                                            : "Mark Official"}
                                                    </button>
                                                </motion.div>
                                            </>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                            {canDelete && (
                                <button
                                    onClick={handleDelete}
                                    className="p-1.5 rounded-lg text-brand-muted hover:bg-red-50 hover:text-red-500 transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 size={13} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-base sm:text-lg font-black text-brand-dark tracking-tight mt-2 leading-snug">
                        {post.title}
                    </h3>

                    {/* Content */}
                    <p className="text-sm text-brand-muted font-medium mt-1.5 leading-relaxed whitespace-pre-wrap">
                        {post.content}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-2 mt-3 flex-wrap text-[11px]">
                        <span className="font-bold text-brand-dark">
                            {post.authorName || "Anonymous"}
                        </span>
                        <span className="text-brand-muted">·</span>
                        <span className="text-brand-muted font-medium">
                            {formatDistanceToNow(new Date(post.createdAt), {
                                addSuffix: true,
                            })}
                        </span>
                        {replies.length > 0 && (
                            <>
                                <span className="text-brand-muted">·</span>
                                <button
                                    onClick={() => setExpanded(!expanded)}
                                    className="flex items-center gap-1 font-black text-brand-accent hover:text-brand-dark transition-colors"
                                >
                                    <MessageSquare size={11} />
                                    {replies.length}{" "}
                                    {replies.length === 1 ? "reply" : "replies"}
                                    {expanded ? (
                                        <ChevronUp size={11} />
                                    ) : (
                                        <ChevronDown size={11} />
                                    )}
                                </button>
                            </>
                        )}
                    </div>

                    {/* Replies */}
                    <AnimatePresence initial={false}>
                        {expanded && replies.length > 0 && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                            >
                                <div className="mt-4 pl-3 border-l-2 border-brand-border space-y-3">
                                    {replies.map((r) => (
                                        <div
                                            key={r._id}
                                            className={`rounded-xl p-3 ${
                                                r.isAdminReply
                                                    ? "bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200"
                                                    : "bg-brand-light"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between gap-2 mb-1.5">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-xs font-black text-brand-dark">
                                                        {r.authorName}
                                                    </span>
                                                    {r.isAdminReply && <AdminBadge />}
                                                    <span className="text-[10px] text-brand-muted font-medium">
                                                        {formatDistanceToNow(
                                                            new Date(r.createdAt),
                                                            { addSuffix: true }
                                                        )}
                                                    </span>
                                                </div>
                                                {(String(r.author) === String(user?._id) ||
                                                    user?.isAdmin) && (
                                                    <button
                                                        onClick={() =>
                                                            handleDeleteReply(r._id)
                                                        }
                                                        className="p-1 rounded text-brand-muted hover:bg-red-50 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 size={11} />
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-xs text-brand-dark font-medium leading-relaxed whitespace-pre-wrap">
                                                {r.content}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Reply composer */}
                    <FeedbackReplyComposer
                        postId={post._id}
                        user={user}
                        onReplied={handleReplyAdded}
                    />
                </div>
            </div>
        </motion.div>
    );
}