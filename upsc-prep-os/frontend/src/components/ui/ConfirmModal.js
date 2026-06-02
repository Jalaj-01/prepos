"use client";

import { useState, useEffect, useCallback } from "react";

import { motion, AnimatePresence } from "framer-motion";

import {
    AlertTriangle,
    AlertCircle,
    Info,
    CheckCircle,
    X
} from "lucide-react";

// =========================
// GLOBAL STATE FOR MODAL
// =========================

let modalState = {

    show: false,

    options: {},

    listeners: []
};

const notifyListeners = () => {

    modalState.listeners.forEach(l => l());
};

const subscribe = (listener) => {

    modalState.listeners.push(listener);

    return () => {

        modalState.listeners =
            modalState.listeners.filter(l => l !== listener);
    };
};

// =========================
// PUBLIC API (use this!)
// =========================

export const confirmAction = (options) => {

    return new Promise((resolve) => {

        modalState.show = true;

        modalState.options = {

            title:
                options.title || "Are you sure?",

            message:
                options.message || "This action cannot be undone.",

            confirmText:
                options.confirmText || "Confirm",

            cancelText:
                options.cancelText || "Cancel",

            type:
                options.type || "warning",

            onConfirm: () => {

                resolve(true);

                modalState.show = false;

                notifyListeners();
            },

            onCancel: () => {

                resolve(false);

                modalState.show = false;

                notifyListeners();
            }
        };

        notifyListeners();
    });
};

// =========================
// MODAL COMPONENT
// (Mount once in root layout)
// =========================

export function ConfirmModalProvider() {

    const [, forceUpdate] = useState(0);

    useEffect(() => {

        const unsubscribe =
            subscribe(() => forceUpdate(n => n + 1));

        return unsubscribe;

    }, []);

    const handleKeydown = useCallback((e) => {

        if (!modalState.show) return;

        if (e.key === "Escape") {
            modalState.options.onCancel();
        }

        if (e.key === "Enter") {
            modalState.options.onConfirm();
        }

    }, []);

    useEffect(() => {

        window.addEventListener("keydown", handleKeydown);

        return () =>
            window.removeEventListener("keydown", handleKeydown);

    }, [handleKeydown]);

    const TYPE_STYLES = {

        danger: {
            icon: AlertTriangle,
            iconBg: "bg-red-100",
            iconColor: "text-red-600",
            confirmBg: "bg-red-500 hover:bg-red-600"
        },

        warning: {
            icon: AlertCircle,
            iconBg: "bg-yellow-100",
            iconColor: "text-yellow-600",
            confirmBg: "bg-yellow-500 hover:bg-yellow-600"
        },

        info: {
            icon: Info,
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600",
            confirmBg: "bg-blue-500 hover:bg-blue-600"
        },

        success: {
            icon: CheckCircle,
            iconBg: "bg-green-100",
            iconColor: "text-green-600",
            confirmBg: "bg-green-500 hover:bg-green-600"
        }
    };

    const style =
        TYPE_STYLES[modalState.options.type] ||
        TYPE_STYLES.warning;

    const Icon = style.icon;

    return (

        <AnimatePresence>

            {modalState.show && (

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-brand-dark/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4 sm:p-6"
                    onClick={() => modalState.options.onCancel()}
                >

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 10 }}
                        transition={{ type: "spring", duration: 0.3 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl relative"
                    >

                        <button
                            onClick={() => modalState.options.onCancel()}
                            className="absolute top-4 right-4 p-2 hover:bg-brand-light rounded-xl transition-all text-brand-muted"
                        >
                            <X size={18} />
                        </button>

                        {/* ICON */}

                        <div className={`w-14 h-14 rounded-2xl ${style.iconBg} flex items-center justify-center mb-4`}>

                            <Icon size={24} className={style.iconColor} />

                        </div>

                        {/* TITLE */}

                        <h2 className="text-xl sm:text-2xl font-black text-brand-dark tracking-tight mb-2">

                            {modalState.options.title}

                        </h2>

                        {/* MESSAGE */}

                        <p className="text-sm text-brand-muted font-medium leading-relaxed mb-6 whitespace-pre-line">

                            {modalState.options.message}

                        </p>

                        {/* BUTTONS */}

                        <div className="flex gap-3 flex-col-reverse sm:flex-row">

                            <button
                                onClick={() => modalState.options.onCancel()}
                                className="flex-1 px-4 py-3 bg-brand-light hover:bg-brand-border text-brand-dark rounded-2xl font-black text-sm uppercase tracking-widest transition-all"
                            >
                                {modalState.options.cancelText}
                            </button>

                            <button
                                onClick={() => modalState.options.onConfirm()}
                                className={`flex-1 px-4 py-3 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${style.confirmBg}`}
                                autoFocus
                            >
                                {modalState.options.confirmText}
                            </button>

                        </div>

                        <p className="text-[10px] text-brand-muted text-center mt-4 font-bold uppercase tracking-widest">

                            Press <kbd className="px-1.5 py-0.5 bg-brand-light rounded">Enter</kbd> to confirm
                            • <kbd className="px-1.5 py-0.5 bg-brand-light rounded">Esc</kbd> to cancel

                        </p>

                    </motion.div>

                </motion.div>
            )}

        </AnimatePresence>
    );
}