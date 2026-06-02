"use client";

import { useEffect, useState } from "react";

import { motion } from "framer-motion";

import {
    HardDrive,
    AlertTriangle,
    Crown
} from "lucide-react";

import Link from "next/link";

import axios from "axios";

export default function StorageWidget() {

    const [storage, setStorage] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        fetchStorage();

    }, []);

    const fetchStorage = async () => {

        try {

            const info =
                localStorage.getItem("userInfo");

            if (!info) return;

            const parsed = JSON.parse(info);

            const { data } = await axios.get(

                `${process.env.NEXT_PUBLIC_API_URL}/api/storage/me`,

                {
                    headers: {
                        Authorization:
                            `Bearer ${parsed.token}`
                    }
                }
            );

            setStorage(data);

        } catch (err) {

            console.error(
                "Storage fetch error",
                err
            );

        } finally {

            setLoading(false);
        }
    };

    if (loading) {

        return (

            <div className="bg-white border border-brand-border rounded-3xl p-6 animate-pulse">

                <div className="h-4 bg-brand-light rounded w-1/3 mb-4" />

                <div className="h-8 bg-brand-light rounded w-2/3 mb-3" />

                <div className="h-2 bg-brand-light rounded w-full" />

            </div>
        );
    }

    if (!storage) return null;

    // =========================
    // COLOR BY USAGE
    // =========================

    const getProgressColor = () => {

        if (storage.usedPercentage >= 90)
            return "from-red-500 to-red-600";

        if (storage.usedPercentage >= 70)
            return "from-orange-400 to-red-500";

        if (storage.usedPercentage >= 50)
            return "from-yellow-400 to-orange-500";

        return "from-green-400 to-emerald-500";
    };

    const getTierBadge = () => {

        const badges = {

            free: {
                color: "bg-gray-100 text-gray-700",
                label: "Free"
            },

            verified: {
                color: "bg-blue-100 text-blue-700",
                label: "Verified"
            },

            premium: {
                color: "bg-purple-100 text-purple-700",
                label: "Premium"
            },

            admin: {
                color: "bg-red-100 text-red-700",
                label: "Admin"
            }
        };

        return badges[storage.tier] || badges.free;
    };

    const tierBadge = getTierBadge();

    return (

        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-brand-border rounded-3xl p-6 relative overflow-hidden"
        >

            {/* HEADER */}

            <div className="flex items-center justify-between mb-4">

                <div className="flex items-center gap-2">

                    <div className="bg-brand-accent/10 p-2 rounded-xl">

                        <HardDrive
                            size={16}
                            className="text-brand-accent"
                        />

                    </div>

                    <p className="text-xs font-black uppercase tracking-widest text-brand-muted">

                        Storage

                    </p>

                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${tierBadge.color}`}>

                    {tierBadge.label}

                </span>

            </div>

            {/* USAGE NUMBERS */}

            <div className="mb-4">

                <p className="text-2xl font-black text-brand-dark leading-none">

                    {storage.usedMB}
                    <span className="text-brand-muted text-base font-bold ml-1">

                        / {storage.quotaMB} MB

                    </span>

                </p>

                <p className="text-xs font-bold text-brand-muted mt-2">

                    {storage.remainingMB} MB remaining

                </p>

            </div>

            {/* PROGRESS BAR */}

            <div className="w-full bg-brand-light h-2.5 rounded-full overflow-hidden mb-3">

                <motion.div

                    initial={{ width: 0 }}

                    animate={{
                        width:
                            `${Math.min(storage.usedPercentage, 100)}%`
                    }}

                    transition={{
                        duration: 0.8,
                        ease: "easeOut"
                    }}

                    className={`h-full bg-gradient-to-r ${getProgressColor()} rounded-full`}
                />

            </div>

            <div className="flex items-center justify-between text-[10px] font-bold text-brand-muted">

                <span>0 MB</span>

                <span className={
                    storage.usedPercentage >= 80
                        ? "text-red-500"
                        : ""
                }>

                    {storage.usedPercentage}% used

                </span>

                <span>{storage.quotaMB} MB</span>

            </div>

            {/* WARNING */}

            {storage.isNearLimit && !storage.isFull && (

                <div className="mt-4 bg-orange-50 border border-orange-100 rounded-xl p-3 flex items-start gap-2">

                    <AlertTriangle
                        size={14}
                        className="text-orange-500 shrink-0 mt-0.5"
                    />

                    <p className="text-[11px] font-bold text-orange-700 leading-relaxed">

                        You're running low on storage.
                        Consider deleting old files.

                    </p>

                </div>
            )}

            {storage.isFull && (

                <div className="mt-4 bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-2">

                    <AlertTriangle
                        size={14}
                        className="text-red-500 shrink-0 mt-0.5"
                    />

                    <p className="text-[11px] font-bold text-red-700 leading-relaxed">

                        Storage full. Delete files to upload more.

                    </p>

                </div>
            )}

            {/* UPGRADE CTA (Free Users Only) */}

            {storage.tier === "free" && (

                <Link
                    href="/vault"
                    className="mt-4 flex items-center justify-center gap-2 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all"
                >

                    <Crown size={14} />

                    Manage Files

                </Link>
            )}

        </motion.div>
    );
}