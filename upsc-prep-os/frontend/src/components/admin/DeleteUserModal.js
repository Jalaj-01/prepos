"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, AlertTriangle, X } from "lucide-react";

export default function DeleteUserModal({
    open,
    user,
    onClose,
    onSoftDelete,
    onHardDelete,
}) {
    const [mode, setMode] = useState("soft"); // soft | hard
    const [confirmText, setConfirmText] = useState("");
    const [loading, setLoading] = useState(false);

    if (!open || !user) return null;

    const submit = async () => {
        setLoading(true);
        try {
            if (mode === "soft") await onSoftDelete(user);
            else await onHardDelete(user, confirmText);
            setConfirmText("");
        } finally {
            setLoading(false);
        }
    };

    const canHardDelete = confirmText === "DELETE";

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-brand-dark/70 backdrop-blur-md z-[120] flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                            <AlertTriangle size={20} className="text-red-600" />
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 hover:bg-brand-light rounded-lg text-brand-muted"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <h3 className="text-lg font-black text-brand-dark mb-1">
                        Delete {user.name}?
                    </h3>
                    <p className="text-xs font-medium text-brand-muted mb-5 leading-relaxed">
                        {user.email}
                    </p>

                    {/* Mode toggle */}
                    <div className="bg-brand-light rounded-xl p-1.5 flex gap-1 mb-4">
                        <button
                            onClick={() => setMode("soft")}
                            className={`flex-1 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                mode === "soft"
                                    ? "bg-white text-brand-dark shadow-sm"
                                    : "text-brand-muted"
                            }`}
                        >
                            Soft Delete
                        </button>
                        <button
                            onClick={() => setMode("hard")}
                            className={`flex-1 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                mode === "hard"
                                    ? "bg-red-600 text-white shadow-sm"
                                    : "text-brand-muted"
                            }`}
                        >
                            Hard Delete
                        </button>
                    </div>

                    {mode === "soft" ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-5">
                            <p className="text-[11px] font-bold text-yellow-900 leading-relaxed">
                                User will be marked as deleted and hidden from
                                the platform. All their data (attempts, notes,
                                files) will be retained. You can restore them
                                later.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                                <p className="text-[11px] font-bold text-red-900 leading-relaxed">
                                    ⚠️ PERMANENT. This will delete the user
                                    plus all their attempts, mains answers,
                                    documents, folders, notes, tasks, syllabus
                                    progress and bookmarks. This cannot be
                                    undone.
                                </p>
                            </div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
                                Type <span className="text-red-600">DELETE</span>{" "}
                                to confirm
                            </label>
                            <input
                                type="text"
                                value={confirmText}
                                onChange={(e) =>
                                    setConfirmText(e.target.value.toUpperCase())
                                }
                                placeholder="DELETE"
                                className="w-full mt-1.5 px-4 py-2.5 bg-brand-light border border-brand-border rounded-xl text-sm font-black tracking-widest outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                            />
                        </>
                    )}

                    <div className="flex gap-2 mt-5">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 py-2.5 bg-brand-light text-brand-dark rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-border/50 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={submit}
                            disabled={
                                loading ||
                                (mode === "hard" && !canHardDelete)
                            }
                            className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-colors disabled:opacity-50 ${
                                mode === "soft"
                                    ? "bg-yellow-500 text-white hover:bg-yellow-600"
                                    : "bg-red-600 text-white hover:bg-red-700"
                            }`}
                        >
                            {loading
                                ? "Working..."
                                : mode === "soft"
                                ? "Soft Delete"
                                : "Delete Forever"}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}