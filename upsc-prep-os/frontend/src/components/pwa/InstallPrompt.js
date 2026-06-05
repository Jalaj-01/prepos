"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Smartphone, Sparkles } from "lucide-react";

const PROMPT_SHOWN_KEY = "prepos-install-prompt-shown";
const PROMPT_DISMISSED_AT_KEY = "prepos-install-prompt-dismissed-at";
const SHOW_AGAIN_AFTER_DAYS = 30; // re-prompt only after 30 days
const SHOW_DELAY_MS = 5000;        // wait 5s after page load before showing

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [show, setShow] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [installed, setInstalled] = useState(false);

    // ─── Decide whether to show ───
    const shouldShow = () => {
        try {
            // Only show if user is logged in
            const userInfo = localStorage.getItem("userInfo");
            if (!userInfo) return false;

            const alreadyShown = localStorage.getItem(PROMPT_SHOWN_KEY);
            const dismissedAt = localStorage.getItem(PROMPT_DISMISSED_AT_KEY);

            // If never shown, allow
            if (!alreadyShown) return true;

            // If previously shown, check cooldown
            if (dismissedAt) {
                const daysSince =
                    (Date.now() - parseInt(dismissedAt, 10)) /
                    (1000 * 60 * 60 * 24);
                return daysSince >= SHOW_AGAIN_AFTER_DAYS;
            }

            return false;
        } catch {
            return false;
        }
    };

    useEffect(() => {
        // Already installed as PWA — never show
        if (
            window.matchMedia("(display-mode: standalone)").matches ||
            window.navigator.standalone === true
        ) {
            setInstalled(true);
            return;
        }

        // Detect iOS (no beforeinstallprompt support)
        const isIOSDevice =
            /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        setIsIOS(isIOSDevice);

        // Listen for the browser install prompt (Chrome/Edge/Android)
        const handleBeforeInstall = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);

            if (shouldShow()) {
                setTimeout(() => setShow(true), SHOW_DELAY_MS);
            }
        };

        // App was installed
        const handleInstalled = () => {
            setInstalled(true);
            setShow(false);
            localStorage.setItem(PROMPT_SHOWN_KEY, "true");
            localStorage.setItem(
                PROMPT_DISMISSED_AT_KEY,
                String(Date.now())
            );
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstall);
        window.addEventListener("appinstalled", handleInstalled);

        // iOS: no native event, show on a timer if eligible
        if (isIOSDevice && shouldShow()) {
            setTimeout(() => setShow(true), SHOW_DELAY_MS);
        }

        return () => {
            window.removeEventListener(
                "beforeinstallprompt",
                handleBeforeInstall
            );
            window.removeEventListener("appinstalled", handleInstalled);
        };
    }, []);

    const markShown = () => {
        try {
            localStorage.setItem(PROMPT_SHOWN_KEY, "true");
            localStorage.setItem(
                PROMPT_DISMISSED_AT_KEY,
                String(Date.now())
            );
        } catch {}
    };

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") setInstalled(true);
        setDeferredPrompt(null);
        setShow(false);
        markShown();
    };

    const handleDismiss = () => {
        setShow(false);
        markShown();
    };

    if (installed) return null;

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="fixed bottom-4 left-4 right-4 sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-sm z-[100]"
                >
                    <div className="bg-white rounded-3xl shadow-2xl border border-brand-border p-5 sm:p-6 relative overflow-hidden">
                        {/* Decorative gradient */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-brand-accent/10 to-purple-500/10 rounded-full blur-2xl -translate-y-16 translate-x-16" />

                        <button
                            onClick={handleDismiss}
                            className="absolute top-3 right-3 p-1.5 hover:bg-brand-light rounded-lg text-brand-muted transition-all z-10"
                            aria-label="Dismiss"
                        >
                            <X size={16} />
                        </button>

                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-gradient-to-br from-brand-accent to-purple-600 rounded-2xl flex items-center justify-center mb-4">
                                <Smartphone size={22} className="text-white" />
                            </div>

                            <h3 className="font-black text-brand-dark text-base sm:text-lg mb-1 flex items-center gap-1.5">
                                Install PrepOS
                                <Sparkles size={14} className="text-yellow-500" />
                            </h3>

                            <p className="text-xs sm:text-sm text-brand-muted font-medium leading-relaxed mb-4">
                                {isIOS
                                    ? "Tap the share button below, then 'Add to Home Screen' for the best experience."
                                    : "Get instant access from your home screen. Works offline too!"}
                            </p>

                            {isIOS ? (
                                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3 mb-3">
                                    <p className="text-[11px] font-bold text-blue-900 leading-relaxed">
                                        1. Tap the <strong>Share</strong> button ⎙
                                        <br />
                                        2. Select <strong>"Add to Home Screen"</strong>
                                        <br />
                                        3. Tap <strong>"Add"</strong>
                                    </p>
                                </div>
                            ) : (
                                <button
                                    onClick={handleInstall}
                                    disabled={!deferredPrompt}
                                    className="w-full bg-brand-dark text-white py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-accent transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <Download size={14} />
                                    Install App
                                </button>
                            )}

                            <button
                                onClick={handleDismiss}
                                className="w-full mt-2 py-2 text-brand-muted hover:text-brand-dark text-[11px] font-bold uppercase tracking-widest transition-all"
                            >
                                Maybe Later
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}