"use client";

import { useEffect, useState } from "react";

import { motion } from "framer-motion";

import Link from "next/link";

import {
    Clock,
    FileText,
    Image as ImageIcon,
    File,
    Globe,
    Lock,
    ArrowRight
} from "lucide-react";

import axios from "axios";

export default function RecentlyViewedWidget() {

    const [docs, setDocs] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        fetchRecent();

    }, []);

    const fetchRecent = async () => {

        try {

            const info =
                localStorage.getItem("userInfo");

            if (!info) return;

            const parsed = JSON.parse(info);

            const { data } = await axios.get(

                `${process.env.NEXT_PUBLIC_API_URL}/api/documents/recently-viewed?limit=5`,

                {
                    headers: {
                        Authorization:
                            `Bearer ${parsed.token}`
                    }
                }
            );

            setDocs(data);

        } catch (err) {

            console.error("Recent error", err);

        } finally {

            setLoading(false);
        }
    };

    const getFileIcon = (fileType) => {

        switch (fileType) {

            case "pdf":
                return <FileText size={14} className="text-red-500" />;

            case "image":
                return <ImageIcon size={14} className="text-blue-500" />;

            default:
                return <File size={14} className="text-brand-muted" />;
        }
    };

    const getRelativeTime = (date) => {

        const now = new Date();

        const then = new Date(date);

        const diffMs = now - then;

        const mins = Math.floor(diffMs / (1000 * 60));

        if (mins < 1) return "Just now";

        if (mins < 60) return `${mins}m ago`;

        const hrs = Math.floor(mins / 60);

        if (hrs < 24) return `${hrs}h ago`;

        const days = Math.floor(hrs / 24);

        if (days < 7) return `${days}d ago`;

        return `${Math.floor(days / 7)}w ago`;
    };

    if (loading || docs.length === 0) return null;

    return (

        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-brand-border rounded-3xl p-5 sm:p-6"
        >

            <div className="flex items-center justify-between mb-4">

                <div className="flex items-center gap-2">

                    <Clock size={14} className="text-brand-accent" />

                    <p className="text-xs font-black uppercase tracking-widest text-brand-muted">

                        Recently Viewed

                    </p>

                </div>

            </div>

            <div className="space-y-2">

                {docs.map((d) => (

                    <Link
                        key={`${d._id}-${d.viewedAt}`}
                        href={
                            d.isMine
                                ? "/vault"
                                : "/library"
                        }
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-brand-light transition-all group"
                    >

                        {getFileIcon(d.fileType)}

                        <div className="flex-1 min-w-0">

                            <p className="text-xs font-black text-brand-dark truncate">

                                {d.title}

                            </p>

                            <div className="flex items-center gap-2 mt-0.5">

                                {d.visibility === "public" ? (
                                    <Globe size={9} className="text-green-600" />
                                ) : (
                                    <Lock size={9} className="text-brand-muted" />
                                )}

                                <span className="text-[9px] font-bold text-brand-muted">

                                    {getRelativeTime(d.viewedAt)}

                                </span>

                            </div>

                        </div>

                        <ArrowRight
                            size={12}
                            className="text-brand-muted opacity-0 group-hover:opacity-100 transition-all"
                        />

                    </Link>
                ))}

            </div>

        </motion.div>
    );
}