"use client";

import { motion } from "framer-motion";

import {
    Zap
} from "lucide-react";

export default function CompressionBadge({
    originalSize,
    finalSize,
    savings
}) {

    if (!savings || savings < 1) return null;

    const formatBytes = (bytes) => {

        if (!bytes) return "0 B";

        const k = 1024;

        const sizes = ["B", "KB", "MB", "GB"];

        const i =
            Math.floor(
                Math.log(bytes) / Math.log(k)
            );

        return (
            parseFloat(
                (bytes / Math.pow(k, i)).toFixed(1)
            ) + " " + sizes[i]
        );
    };

    return (

        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl px-4 py-3"
        >

            <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-1.5 rounded-lg">

                <Zap size={14} className="text-white" />

            </div>

            <div>

                <p className="text-xs font-black text-green-800 leading-none">

                    Saved {savings}% storage

                </p>

                <p className="text-[10px] font-bold text-green-600 mt-1">

                    {formatBytes(originalSize)} → {formatBytes(finalSize)}

                </p>

            </div>

        </motion.div>
    );
}