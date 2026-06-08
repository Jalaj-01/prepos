"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { StickyNote, Plus, Pin } from "lucide-react";
import StickyNotesDrawer from "../notes/StickyNotesDrawer";

const colorMap = {
    yellow: "bg-yellow-200 border-yellow-300",
    pink: "bg-pink-200 border-pink-300",
    blue: "bg-blue-200 border-blue-300",
    green: "bg-green-200 border-green-300",
    purple: "bg-purple-200 border-purple-300",
    orange: "bg-orange-200 border-orange-300",
};

const ROTATIONS = ["-rotate-3", "rotate-2", "-rotate-1", "rotate-3"];

export default function StickyNotesWidget() {
    const [stats, setStats] = useState({ total: 0, pinned: 0, recentNotes: [] });
    const [drawerOpen, setDrawerOpen] = useState(false);

    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    const getConfig = () => {
        const info = JSON.parse(localStorage.getItem("userInfo") || "{}");
        return { headers: { Authorization: `Bearer ${info.token}` } };
    };

    useEffect(() => {
        const loadStats = async () => {
            try {
                const { data } = await axios.get(
                    `${baseUrl}/api/sticky-notes/stats`,
                    getConfig()
                );
                setStats(data);
            } catch (e) {
                console.warn("Notes stats:", e.message);
            }
        };

        void loadStats();
    }, [baseUrl]);

    useEffect(() => {
        if (!drawerOpen) {
            const loadStats = async () => {
                try {
                    const { data } = await axios.get(
                        `${baseUrl}/api/sticky-notes/stats`,
                        getConfig()
                    );
                    setStats(data);
                } catch (e) {
                    console.warn("Notes stats:", e.message);
                }
            };

            void loadStats();
        }
    }, [baseUrl, drawerOpen]);

    const notes = stats.recentNotes || [];

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-brand-border rounded-2xl sm:rounded-3xl p-5 sm:p-6"
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="bg-yellow-100 p-1.5 rounded-lg">
                            <StickyNote size={14} className="text-yellow-700" />
                        </div>
                        <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-brand-muted">
                            Sticky Notes
                        </p>
                    </div>
                    <button
                        onClick={() => setDrawerOpen(true)}
                        className="p-1.5 rounded-lg text-brand-muted hover:bg-brand-light hover:text-brand-dark transition-all"
                        title="Open notes"
                    >
                        <Plus size={14} />
                    </button>
                </div>

                {notes.length === 0 ? (
                    <button
                        onClick={() => setDrawerOpen(true)}
                        className="w-full py-8 border-2 border-dashed border-brand-border rounded-2xl text-center hover:border-brand-accent hover:bg-brand-light transition-all"
                    >
                        <Plus size={20} className="text-brand-muted mx-auto mb-1" />
                        <p className="text-xs font-black text-brand-muted">
                            Create your first note
                        </p>
                    </button>
                ) : (
                    <div className="relative h-44 mb-3">
                        {notes.slice(0, 4).map((n, i) => {
                            const colorCls = colorMap[n.color] || colorMap.yellow;
                            const rot = ROTATIONS[i % ROTATIONS.length];
                            return (
                                <motion.button
                                    key={n._id}
                                    onClick={() => setDrawerOpen(true)}
                                    whileHover={{ y: -4, rotate: 0, zIndex: 50 }}
                                    style={{ zIndex: 10 + i }}
                                    className={`absolute inset-x-0 mx-auto w-[85%] border-2 ${colorCls} rounded-xl p-3 shadow-md text-left transform ${rot} transition-all`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{
                                        opacity: 1,
                                        y: i * 6,
                                    }}
                                    transition={{ delay: i * 0.04 }}
                                >
                                    <div className="flex items-start gap-1.5">
                                        {n.pinned && (
                                            <Pin
                                                size={10}
                                                className="fill-current shrink-0 mt-0.5"
                                            />
                                        )}
                                        <h4 className="text-xs font-black line-clamp-1 text-brand-dark">
                                            {n.title || "Untitled"}
                                        </h4>
                                    </div>
                                    <p className="text-[10px] font-medium text-brand-dark/70 line-clamp-2 mt-0.5">
                                        {n.plainText || "Empty note"}
                                    </p>
                                </motion.button>
                            );
                        })}
                    </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-brand-border">
                    <div className="flex items-center gap-3 text-[10px] font-black text-brand-muted">
                        <span>{stats.total} total</span>
                        <span>·</span>
                        <span>{stats.pinned} pinned</span>
                    </div>
                    <button
                        onClick={() => setDrawerOpen(true)}
                        className="text-[10px] font-black uppercase tracking-widest text-brand-accent hover:text-brand-dark transition-all"
                    >
                        Open All →
                    </button>
                </div>
            </motion.div>

            <StickyNotesDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
            />
        </>
    );
}