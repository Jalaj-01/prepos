"use client";

import { useEffect, useState } from "react";

import { motion, AnimatePresence } from "framer-motion";

import {
    Info,
    CheckCircle,
    AlertTriangle,
    AlertCircle,
    Megaphone,
    X,
    ArrowUpRight
} from "lucide-react";

import Link from "next/link";

import axios from "axios";

const TYPE_STYLES = {

    info: {
        bg: "from-blue-500 to-cyan-500",
        icon: Info,
        light: "bg-blue-50 border-blue-100"
    },

    success: {
        bg: "from-green-500 to-emerald-500",
        icon: CheckCircle,
        light: "bg-green-50 border-green-100"
    },

    warning: {
        bg: "from-yellow-500 to-orange-500",
        icon: AlertTriangle,
        light: "bg-yellow-50 border-yellow-100"
    },

    urgent: {
        bg: "from-red-500 to-pink-500",
        icon: AlertCircle,
        light: "bg-red-50 border-red-100"
    },

    announcement: {
        bg: "from-purple-500 to-pink-500",
        icon: Megaphone,
        light: "bg-purple-50 border-purple-100"
    }
};

export default function AnnouncementBanner() {

    const [announcements, setAnnouncements] = useState([]);

    const [dismissed, setDismissed] = useState([]);

    useEffect(() => {

        const info =
            localStorage.getItem("userInfo");

        if (!info) return;

        const parsed = JSON.parse(info);

        // Load dismissed list

        const stored =
            localStorage.getItem("dismissed-announcements");

        if (stored) {
            setDismissed(JSON.parse(stored));
        }

        // Fetch announcements

        axios.get(

            `${process.env.NEXT_PUBLIC_API_URL}/api/announcements/active`,

            {
                headers: {
                    Authorization:
                        `Bearer ${parsed.token}`
                }
            }
        ).then(({ data }) => {

            setAnnouncements(data);

        }).catch(err => {

            console.error(
                "Announcements load failed",
                err
            );
        });

    }, []);

    const handleDismiss = (id) => {

        const newDismissed = [...dismissed, id];

        setDismissed(newDismissed);

        localStorage.setItem(
            "dismissed-announcements",
            JSON.stringify(newDismissed)
        );
    };

    const visible =
        announcements.filter(a =>
            !dismissed.includes(a._id)
        );

    if (visible.length === 0) return null;

    return (

        <div className="space-y-3 mb-6">

            <AnimatePresence>

                {visible.map((ann) => {

                    const style =
                        TYPE_STYLES[ann.type] ||
                        TYPE_STYLES.info;

                    const Icon = style.icon;

                    return (

                        <motion.div
                            key={ann._id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`relative rounded-2xl border p-4 sm:p-5 ${style.light}`}
                        >

                            <div className="flex items-start gap-3">

                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${style.bg} flex items-center justify-center shrink-0`}>

                                    <Icon size={18} className="text-white" />

                                </div>

                                <div className="flex-1 min-w-0">

                                    <div className="flex items-start justify-between gap-3">

                                        <div className="flex-1 min-w-0">

                                            <p className="font-black text-brand-dark text-sm sm:text-base">

                                                {ann.title}

                                            </p>

                                            <p className="text-xs sm:text-sm text-brand-muted font-medium mt-1 leading-relaxed">

                                                {ann.message}

                                            </p>

                                            {ann.actionText && ann.actionUrl && (

                                                <Link
                                                    href={ann.actionUrl}
                                                    className="inline-flex items-center gap-1 mt-3 text-xs font-black text-brand-accent hover:underline"
                                                >
                                                    {ann.actionText}
                                                    <ArrowUpRight size={12} />
                                                </Link>
                                            )}

                                        </div>

                                        <button
                                            onClick={() => handleDismiss(ann._id)}
                                            className="p-1 hover:bg-white/50 rounded-lg transition-all"
                                            title="Dismiss"
                                        >
                                            <X size={14} className="text-brand-muted" />
                                        </button>

                                    </div>

                                </div>

                            </div>

                        </motion.div>
                    );
                })}

            </AnimatePresence>

        </div>
    );
}