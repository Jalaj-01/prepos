"use client";

import { useState, useEffect } from "react";

import { motion, AnimatePresence } from "framer-motion";

import {
    Download,
    X,
    Smartphone,
    Sparkles
} from "lucide-react";

export default function InstallPrompt() {

    const [deferredPrompt, setDeferredPrompt] = useState(null);

    const [show, setShow] = useState(false);

    const [isIOS, setIsIOS] = useState(false);

    const [installed, setInstalled] = useState(false);

    useEffect(() => {

        // Check if already installed

        if (
            window.matchMedia("(display-mode: standalone)").matches ||
            window.navigator.standalone === true
        ) {

            setInstalled(true);

            return;
        }

        // Detect iOS

        const isIOSDevice =
            /iPad|iPhone|iPod/.test(navigator.userAgent) &&
            !window.MSStream;

        setIsIOS(isIOSDevice);

        // Check if previously dismissed

        const dismissed =
            localStorage.getItem("pwa-install-dismissed");

        const dismissedTime =
            dismissed ? parseInt(dismissed) : 0;

        const daysSinceDismissed =
            (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

        // Show again after 7 days

        if (dismissedTime && daysSinceDismissed < 7) {

            return;
        }

        // Listen for install prompt (Chrome/Edge)

        const handler = (e) => {

            e.preventDefault();

            setDeferredPrompt(e);

            // Show after 30 seconds of usage

            setTimeout(() => {
                setShow(true);
            }, 30000);
        };

        window.addEventListener("beforeinstallprompt", handler);

        // iOS: show prompt after 30 seconds (no native prompt available)

        if (isIOSDevice) {

            setTimeout(() => {
                setShow(true);
            }, 30000);
        }

        return () =>
            window.removeEventListener("beforeinstallprompt", handler);

    }, []);

    const handleInstall = async () => {

        if (!deferredPrompt) return;

        deferredPrompt.prompt();

        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {

            setInstalled(true);
        }

        setDeferredPrompt(null);

        setShow(false);
    };

    const handleDismiss = () => {

        setShow(false);

        localStorage.setItem(
            "pwa-install-dismissed",
            Date.now().toString()
        );
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

                                        1. Tap the <strong>Share</strong> button ⎙<br />
                                        2. Select <strong>"Add to Home Screen"</strong><br />
                                        3. Tap <strong>"Add"</strong>

                                    </p>

                                </div>

                            ) : (

                                <button
                                    onClick={handleInstall}
                                    className="w-full bg-brand-dark text-white py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-accent transition-all flex items-center justify-center gap-2"
                                >
                                    <Download size={14} />
                                    Install App
                                </button>
                            )}

                            <button
                                onClick={handleDismiss}
                                className="w-full mt-2 py-2 text-brand-muted hover:text-brand-dark text-[11px] font-bold uppercase tracking-widest transition-all"
                            >

                                Maybe later

                            </button>

                        </div>

                    </div>

                </motion.div>
            )}

        </AnimatePresence>
    );
}