"use client";

import { useEffect, useState } from "react";

import { motion } from "framer-motion";

import Link from "next/link";

import {
    Trophy,
    ArrowUpRight,
    Crown,
    Medal,
    Award
} from "lucide-react";

import axios from "axios";

export default function LeaderboardWidget() {

    const [leaders, setLeaders] = useState([]);

    const [myRank, setMyRank] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        fetchLeaderboard();

    }, []);

    const fetchLeaderboard = async () => {

        try {

            const info =
                localStorage.getItem("userInfo");

            if (!info) return;

            const parsed = JSON.parse(info);

            const { data } = await axios.get(

                `${process.env.NEXT_PUBLIC_API_URL}/api/leaderboard`,

                {
                    headers: {
                        Authorization:
                            `Bearer ${parsed.token}`
                    }
                }
            );

            // Handle different response structures

            const list =
                Array.isArray(data)
                    ? data
                    : data.leaderboard || data.users || [];

            setLeaders(list.slice(0, 5));

            // Find user's rank

            const myIdx =
                list.findIndex(u =>
                    u._id === parsed._id ||
                    u.email === parsed.email
                );

            if (myIdx !== -1) {

                setMyRank({
                    rank: myIdx + 1,
                    ...list[myIdx]
                });
            }

        } catch (err) {

            console.error("Leaderboard error", err);

        } finally {

            setLoading(false);
        }
    };

    const getRankIcon = (rank) => {

        if (rank === 1)
            return <Crown size={14} className="text-yellow-500 fill-yellow-500" />;

        if (rank === 2)
            return <Medal size={14} className="text-gray-400" />;

        if (rank === 3)
            return <Award size={14} className="text-orange-600" />;

        return (
            <span className="text-[10px] font-black text-brand-muted w-3.5 text-center">

                {rank}

            </span>
        );
    };

    if (loading) return null;

    return (

        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-3xl p-5 sm:p-6"
        >

            <div className="flex items-center justify-between mb-4">

                <div className="flex items-center gap-2">

                    <Trophy size={14} className="text-orange-600" />

                    <p className="text-xs font-black uppercase tracking-widest text-orange-700">

                        Leaderboard

                    </p>

                </div>

                <Link
                    href="/rankings"
                    className="text-[10px] font-black text-orange-600 hover:underline flex items-center gap-1 uppercase tracking-widest"
                >
                    View All
                    <ArrowUpRight size={10} />
                </Link>

            </div>

            {leaders.length === 0 ? (

                <p className="text-xs font-bold text-brand-muted text-center py-4">

                    No rankings yet

                </p>

            ) : (

                <div className="space-y-2">

                    {leaders.map((u, idx) => {

                        const rank = idx + 1;

                        const isMe = myRank?.rank === rank;

                        return (

                            <div
                                key={u._id || idx}
                                className={`flex items-center gap-3 p-2 rounded-xl ${
                                    isMe
                                        ? "bg-orange-100 border border-orange-200"
                                        : "bg-white/60"
                                }`}
                            >

                                <div className="w-6 flex items-center justify-center shrink-0">
                                    {getRankIcon(rank)}
                                </div>

                                <div className="w-7 h-7 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-white font-black text-xs shrink-0">

                                    {(u.name || "?").charAt(0).toUpperCase()}

                                </div>

                                <div className="flex-1 min-w-0">

                                    <p className="text-xs font-black text-brand-dark truncate">

                                        {u.name || "Anonymous"}

                                        {isMe && (
                                            <span className="ml-1 text-[9px] font-bold text-orange-600">
                                                (You)
                                            </span>
                                        )}

                                    </p>

                                </div>

                                <span className="text-xs font-black text-brand-dark shrink-0">

                                    {u.totalQuestionsSolved ||
                                     u.totalSolved ||
                                     u.score ||
                                     0}

                                </span>

                            </div>
                        );
                    })}

                </div>
            )}

            {myRank && myRank.rank > 5 && (

                <div className="mt-3 pt-3 border-t border-orange-200">

                    <div className="flex items-center gap-3 p-2 rounded-xl bg-orange-100 border border-orange-200">

                        <div className="w-6 flex items-center justify-center shrink-0">

                            <span className="text-[10px] font-black text-brand-muted">

                                {myRank.rank}

                            </span>

                        </div>

                        <div className="w-7 h-7 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-white font-black text-xs shrink-0">

                            {(myRank.name || "?").charAt(0).toUpperCase()}

                        </div>

                        <div className="flex-1 min-w-0">

                            <p className="text-xs font-black text-brand-dark">

                                You

                            </p>

                        </div>

                        <span className="text-xs font-black text-orange-700 shrink-0">

                            {myRank.totalQuestionsSolved ||
                             myRank.totalSolved ||
                             myRank.score ||
                             0}

                        </span>

                    </div>

                </div>
            )}

        </motion.div>
    );
}