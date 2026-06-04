"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import axios from "axios";
import { showToast } from "@/components/ui/Toast";

export default function FeedbackReplyComposer({ postId, user, onReplied }) {
    const [content, setContent] = useState("");
    const [saving, setSaving] = useState(false);

    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    const submit = async () => {
        if (!content.trim()) return;
        setSaving(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            const { data } = await axios.post(
                `${baseUrl}/api/feedback/${postId}/reply`,
                { content: content.trim() },
                config
            );
            setContent("");
            onReplied?.(data.reply);
        } catch (e) {
            showToast.error("Failed to reply");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex gap-2 mt-3">
            <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        submit();
                    }
                }}
                placeholder={
                    user?.isAdmin
                        ? "Reply as Admin..."
                        : "Add a reply..."
                }
                disabled={saving}
                className="flex-1 px-3 py-2 bg-brand-light border border-brand-border rounded-xl text-xs font-medium outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all disabled:opacity-50"
            />
            <button
                onClick={submit}
                disabled={saving || !content.trim()}
                className={`px-3 rounded-xl text-white transition-all disabled:opacity-40 ${
                    user?.isAdmin
                        ? "bg-gradient-to-r from-purple-600 to-brand-accent hover:opacity-90"
                        : "bg-brand-dark hover:bg-brand-accent"
                }`}
                title={user?.isAdmin ? "Reply as Admin" : "Reply"}
            >
                <Send size={13} />
            </button>
        </div>
    );
}