"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Type } from "lucide-react";

// Singleton state holder so we can trigger from anywhere
let externalSetState = null;
let externalResolve = null;

/**
 * Promise-based prompt — replacement for native window.prompt()
 *
 * Usage:
 *   const value = await promptModal({
 *     title: "Practice Set Name",
 *     message: "Give this practice set a name",
 *     placeholder: "e.g. Polity Revision",
 *     defaultValue: "",
 *     confirmText: "Create",
 *     mustMatch: "DELETE MY ACCOUNT", // optional — only enables confirm when typed exactly
 *     type: "default" | "danger"
 *   });
 *   if (value === null) return; // user cancelled
 */
export function promptModal(options = {}) {
    return new Promise((resolve) => {
        if (!externalSetState) {
            console.warn("PromptModalProvider not mounted");
            resolve(null);
            return;
        }
        externalResolve = resolve;
        externalSetState({
            open: true,
            options: {
                title: "Enter value",
                message: "",
                placeholder: "",
                defaultValue: "",
                confirmText: "Confirm",
                cancelText: "Cancel",
                mustMatch: null,
                type: "default",
                ...options,
            },
        });
    });
}

export function PromptModalProvider() {
    const [state, setState] = useState({ open: false, options: {} });
    const [value, setValue] = useState("");
    const inputRef = useRef(null);

    useEffect(() => {
        externalSetState = setState;
        return () => {
            externalSetState = null;
        };
    }, []);

    useEffect(() => {
        if (state.open) {
            setValue(state.options.defaultValue || "");
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [state.open]);

    const handleConfirm = () => {
        if (externalResolve) externalResolve(value);
        externalResolve = null;
        setState({ open: false, options: {} });
        setValue("");
    };

    const handleCancel = () => {
        if (externalResolve) externalResolve(null);
        externalResolve = null;
        setState({ open: false, options: {} });
        setValue("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (canSubmit) handleConfirm();
        }
        if (e.key === "Escape") {
            e.preventDefault();
            handleCancel();
        }
    };

    const { title, message, placeholder, confirmText, cancelText, mustMatch, type } =
        state.options;

    const isDanger = type === "danger";
    const canSubmit = mustMatch
        ? value === mustMatch
        : value.trim().length > 0;

    return (
        <AnimatePresence>
            {state.open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleCancel}
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
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                    isDanger
                                        ? "bg-red-100 text-red-600"
                                        : "bg-brand-accent/10 text-brand-accent"
                                }`}
                            >
                                {isDanger ? (
                                    <AlertTriangle size={20} />
                                ) : (
                                    <Type size={20} />
                                )}
                            </div>
                            <button
                                onClick={handleCancel}
                                className="p-1.5 hover:bg-brand-light rounded-lg text-brand-muted"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <h3 className="text-lg font-black text-brand-dark mb-1 tracking-tight">
                            {title}
                        </h3>
                        {message && (
                            <p className="text-xs font-medium text-brand-muted mb-5 leading-relaxed">
                                {message}
                            </p>
                        )}

                        <input
                            ref={inputRef}
                            type="text"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder || ""}
                            className={`w-full px-4 py-3 bg-brand-light border rounded-xl text-sm font-bold outline-none transition-all ${
                                isDanger
                                    ? "border-red-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                                    : "border-brand-border focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20"
                            }`}
                        />

                        {mustMatch && (
                            <p className="text-[10px] font-bold text-brand-muted mt-2 ml-1">
                                Type{" "}
                                <span className={isDanger ? "text-red-600" : "text-brand-accent"}>
                                    {mustMatch}
                                </span>{" "}
                                exactly to confirm
                            </p>
                        )}

                        <div className="flex gap-2 mt-5">
                            <button
                                onClick={handleCancel}
                                className="flex-1 py-2.5 bg-brand-light text-brand-dark rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-border/50 transition-colors"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={!canSubmit}
                                className={`flex-1 py-2.5 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                                    isDanger
                                        ? "bg-red-600 hover:bg-red-700"
                                        : "bg-brand-dark hover:bg-brand-accent"
                                }`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}