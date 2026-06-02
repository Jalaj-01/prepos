"use client";

import { useEffect, useState } from "react";

import { motion } from "framer-motion";

import {
    Sparkles,
    ArrowUpRight,
    Star,
    Eye
} from "lucide-react";

import Link from "next/link";

import axios from "axios";

export default function FeaturedNotesWidget() {

    const [featured, setFeatured] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const load = async () => {

            try {

                const info =
                    localStorage.getItem("userInfo");

                if (!info) return;

                const parsed = JSON.parse(info);

                const { data } = await axios.get(

                    `${process.env.NEXT_PUBLIC_API_URL}/api/documents/community/featured?limit=3`,

                    {
                        headers: {
                            Authorization:
                                `Bearer ${parsed.token}`
                        }
                    }
                );

                setFeatured(data);

            } catch (err) {

                console.error("Featured error", err);

            } finally {

                setLoading(false);
            }
        };

        load();

    }, []);

    if (loading) {

        return (

            <div className="bg-white border border-brand-border rounded-3xl p-6 animate-pulse">

                <div className="h-4 bg-brand-light rounded w-1/3 mb-4" />

                <div className="space-y-2">

                    <div className="h-12 bg-brand-light rounded-xl" />

                    <div className="h-12 bg-brand-light rounded-xl" />

                </div>

            </div>
        );
    }

    if (featured.length === 0) return null;

    return (

        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-3xl p-6"
        >

            <div className="flex items-center justify-between mb-4">

                <div className="flex items-center gap-2">

                    <Sparkles size={16} className="text-yellow-600" />

                    <p className="text-xs font-black uppercase tracking-widest text-yellow-900">

                        Editor's Picks

                    </p>

                </div>

                <Link
                    href="/library"
                    className="text-xs font-black text-yellow-700 hover:underline flex items-center gap-1"
                >
                    See all <ArrowUpRight size={12} />
                </Link>

            </div>

            <div className="space-y-2">

                {featured.map((d) => (

                    <Link
                        key={d._id}
                        href="/library"
                        className="block p-3 rounded-2xl bg-white/60 hover:bg-white transition-all group"
                    >

                        <div className="flex items-start gap-2">

                            <Star size={12} className="text-yellow-500 fill-yellow-500 shrink-0 mt-1" />

                            <div className="flex-1 min-w-0">

                                <p className="font-black text-xs text-brand-dark line-clamp-1 leading-snug">

                                    {d.title}

                                </p>

                                <div className="flex items-center gap-2 mt-1">

                                    {d.subject && (

                                        <span className="text-[9px] font-bold bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded-full">

                                            {d.subject}

                                        </span>
                                    )}

                                    {d.viewCount > 0 && (

                                        <span className="text-[9px] font-bold text-brand-muted flex items-center gap-1">

                                            <Eye size={9} />

                                            {d.viewCount}

                                        </span>
                                    )}

                                </div>

                            </div>

                        </div>

                    </Link>
                ))}

            </div>

        </motion.div>
    );
}