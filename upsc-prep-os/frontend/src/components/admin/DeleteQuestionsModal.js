"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, AlertTriangle, X } from "lucide-react";

export default function DeleteQuestionsModal({
    open,
    count = 1,
    onClose,
    onConfirm,
    loading = false,
}) {
    const [confirmText, setConfirmText] = useState("");

    if (!open) return null;

    const canDelete = confirmText === "DELETE";

    const handleSubmit = async () => {
        await onConfirm();
        setConfirmText("");
    };

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
                    initial={{ scale: 0.92, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.92, opacity: 0 }}
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
                        Delete {count > 1 ? `${count} questions` : "this question"}?
                    </h3>
                    <p className="text-xs font-medium text-brand-muted mb-5 leading-relaxed">
                        ⚠️ PERMANENT. This will delete{" "}
                        {count > 1 ? "these questions" : "this question"} along
                        with all related user attempts and bookmarks. This cannot be
                        undone.
                    </p>

                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
                        Type <span className="text-red-600">DELETE</span> to confirm
                    </label>
                    <input
                        type="text"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                        placeholder="DELETE"
                        autoFocus
                        className="w-full mt-1.5 px-4 py-2.5 bg-brand-light border border-brand-border rounded-xl text-sm font-black tracking-widest outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                    />

                    <div className="flex gap-2 mt-5">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 py-2.5 bg-brand-light text-brand-dark rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-border/50 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !canDelete}
                            className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                            <Trash2 size={12} className="inline mr-1" />
                            {loading
                                ? "Deleting..."
                                : count > 1
                                ? `Delete ${count}`
                                : "Delete Forever"}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}