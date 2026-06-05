"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trash2, X } from "lucide-react";

export default function BulkActionBar({ count, onDelete, onClear }) {
    return (
        <AnimatePresence>
            {count > 0 && (
                <motion.div
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 80, opacity: 0 }}
                    transition={{ type: "spring", damping: 24, stiffness: 280 }}
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] bg-brand-dark text-white rounded-2xl shadow-2xl border border-brand-dark px-4 py-3 flex items-center gap-3"
                >
                    <span className="text-xs font-black uppercase tracking-widest">
                        {count} selected
                    </span>
                    <div className="w-px h-5 bg-white/20" />
                    <button
                        onClick={onDelete}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 rounded-lg text-xs font-black uppercase tracking-widest transition-colors"
                    >
                        <Trash2 size={12} />
                        Delete {count}
                    </button>
                    <button
                        onClick={onClear}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                        title="Clear selection"
                    >
                        <X size={14} />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}