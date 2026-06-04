"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, UserCheck, UserX, Info } from "lucide-react";

const ICON_MAP = {
    promote: { Icon: UserCheck, color: "purple" },
    demote: { Icon: UserX, color: "orange" },
    warning: { Icon: AlertTriangle, color: "red" },
    info: { Icon: Info, color: "blue" },
};

const COLOR_MAP = {
    purple: {
        bg: "bg-purple-100",
        text: "text-purple-600",
        btn: "bg-purple-600 hover:bg-purple-700",
    },
    orange: {
        bg: "bg-orange-100",
        text: "text-orange-600",
        btn: "bg-orange-600 hover:bg-orange-700",
    },
    red: {
        bg: "bg-red-100",
        text: "text-red-600",
        btn: "bg-red-600 hover:bg-red-700",
    },
    blue: {
        bg: "bg-blue-100",
        text: "text-blue-600",
        btn: "bg-blue-600 hover:bg-blue-700",
    },
};

export default function ConfirmModal({
    open,
    type = "info",
    title,
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    onConfirm,
    onCancel,
    loading = false,
}) {
    const { Icon, color } = ICON_MAP[type] || ICON_MAP.info;
    const c = COLOR_MAP[color];

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onCancel}
                    className="fixed inset-0 bg-brand-dark/70 backdrop-blur-md z-[130] flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.92, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.92, opacity: 0, y: 10 }}
                        transition={{ duration: 0.18 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div
                                className={`w-12 h-12 ${c.bg} rounded-2xl flex items-center justify-center`}
                            >
                                <Icon size={20} className={c.text} />
                            </div>
                            <button
                                onClick={onCancel}
                                disabled={loading}
                                className="p-1.5 hover:bg-brand-light rounded-lg text-brand-muted disabled:opacity-50"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <h3 className="text-lg font-black text-brand-dark mb-1.5 tracking-tight">
                            {title}
                        </h3>
                        <p className="text-xs font-medium text-brand-muted mb-5 leading-relaxed">
                            {message}
                        </p>

                        <div className="flex gap-2">
                            <button
                                onClick={onCancel}
                                disabled={loading}
                                className="flex-1 py-2.5 bg-brand-light text-brand-dark rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-border/50 transition-colors disabled:opacity-50"
                            >
                                {cancelLabel}
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={loading}
                                className={`flex-1 py-2.5 ${c.btn} text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors disabled:opacity-50`}
                            >
                                {loading ? "Working..." : confirmLabel}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}