"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Send,
    Lightbulb,
    Bug,
    HelpCircle,
    Heart,
    MessageSquare,
    Megaphone,
} from "lucide-react";
import axios from "axios";
import { showToast } from "@/components/ui/Toast";

const CATEGORIES = [
    { id: "suggestion", label: "Suggestion", icon: Lightbulb, color: "from-yellow-500 to-orange-500" },
    { id: "bug", label: "Bug Report", icon: Bug, color: "from-red-500 to-pink-500" },
    { id: "question", label: "Question", icon: HelpCircle, color: "from-blue-500 to-cyan-500" },
    { id: "praise", label: "Praise", icon: Heart, color: "from-pink-500 to-rose-500" },
    { id: "discussion", label: "Discussion", icon: MessageSquare, color: "from-purple-500 to-indigo-500" },
];

export default function FeedbackComposer({ open, onClose, user, onCreated }) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("suggestion");
    const [isOfficial, setIsOfficial] = useState(false);
    const [saving, setSaving] = useState(false);

    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    const reset = () => {
        setTitle("");
        setContent("");
        setCategory("suggestion");
        setIsOfficial(false);
    };

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim()) {
            showToast.error("Title and content are required");
            return;
        }
        setSaving(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            const { data } = await axios.post(
                `${baseUrl}/api/feedback`,
                {
                    title: title.trim(),
                    content: content.trim(),
                    category,
                    isOfficial,
                },
                config
            );
            showToast.success(
                isOfficial ? "Official update posted" : "Posted to feedback"
            );
            reset();
            onCreated?.(data.post);
            onClose();
        } catch (e) {
            showToast.error(
                e.response?.data?.message || "Failed to post"
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-brand-dark/70 backdrop-blur-md z-[110] flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.92, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.92, opacity: 0, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 hover:bg-brand-light rounded-xl text-brand-muted"
                        >
                            <X size={16} />
                        </button>

                        <div className="flex items-center gap-2 mb-1">
                            <div className="bg-brand-accent/10 p-1.5 rounded-lg">
                                <MessageSquare size={14} className="text-brand-accent" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
                                Share Your Voice
                            </p>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-brand-dark mb-5">
                            New Post
                        </h2>

                        {/* Admin official toggle */}
                        {user?.isAdmin && (
                            <div className="mb-5 p-3 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl">
                                <label className="flex items-start gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isOfficial}
                                        onChange={(e) => setIsOfficial(e.target.checked)}
                                        className="mt-0.5 w-4 h-4 accent-purple-600"
                                    />
                                    <div className="flex-1">
                                        <p className="text-xs font-black text-purple-900 flex items-center gap-1.5">
                                            <Megaphone size={12} />
                                            Post as Official Update
                                        </p>
                                        <p className="text-[11px] font-medium text-purple-700 mt-0.5 leading-relaxed">
                                            Auto-pinned to top with a special crown badge.
                                            Use for announcements, releases, maintenance.
                                        </p>
                                    </div>
                                </label>
                            </div>
                        )}

                        {/* Category */}
                        {!isOfficial && (
                            <div className="mb-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted ml-1">
                                    Category
                                </label>
                                <div className="grid grid-cols-5 gap-1.5 mt-2">
                                    {CATEGORIES.map((c) => {
                                        const Icon = c.icon;
                                        const active = category === c.id;
                                        return (
                                            <button
                                                key={c.id}
                                                onClick={() => setCategory(c.id)}
                                                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all border-2 ${
                                                    active
                                                        ? "border-brand-dark bg-brand-dark text-white"
                                                        : "border-transparent bg-brand-light text-brand-muted hover:text-brand-dark"
                                                }`}
                                            >
                                                <Icon size={14} />
                                                <span className="text-[9px] font-black uppercase tracking-wider">
                                                    {c.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Title */}
                        <div className="mb-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted ml-1">
                                Title
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder={
                                    isOfficial
                                        ? "Maintenance window tonight 10pm–11pm"
                                        : "What's on your mind?"
                                }
                                maxLength={140}
                                className="w-full mt-1 px-4 py-3 bg-brand-light border border-brand-border rounded-xl text-sm font-black outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all"
                            />
                            <p className="text-[10px] text-brand-muted font-bold mt-1 ml-1">
                                {title.length}/140
                            </p>
                        </div>

                        {/* Content */}
                        <div className="mb-5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted ml-1">
                                Details
                            </label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={6}
                                placeholder="Describe in detail..."
                                maxLength={5000}
                                className="w-full mt-1 px-4 py-3 bg-brand-light border border-brand-border rounded-xl text-sm font-medium outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all resize-none"
                            />
                            <p className="text-[10px] text-brand-muted font-bold mt-1 ml-1">
                                {content.length}/5000
                            </p>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={saving || !title.trim() || !content.trim()}
                            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 ${
                                isOfficial
                                    ? "bg-gradient-to-r from-purple-600 to-brand-accent text-white hover:opacity-90"
                                    : "bg-brand-dark text-white hover:bg-brand-accent"
                            }`}
                        >
                            <Send size={14} />
                            {saving
                                ? "Posting..."
                                : isOfficial
                                ? "Post Official Update"
                                : "Post"}
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}