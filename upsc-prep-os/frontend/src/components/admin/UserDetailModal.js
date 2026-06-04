"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
    X,
    Mail,
    Calendar,
    Flame,
    Target,
    GraduationCap,
    HardDrive,
    Shield,
    Award,
    Bookmark,
    StickyNote as StickyNoteIcon,
    CheckCircle2,
    BookOpenCheck,
    Clock,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

const formatBytes = (bytes = 0) => {
    if (!bytes) return "0 MB";
    const mb = bytes / 1024 / 1024;
    if (mb < 1) return `${(bytes / 1024).toFixed(1)} KB`;
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    return `${(mb / 1024).toFixed(2)} GB`;
};

export default function UserDetailModal({ open, userId, onClose, token }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open || !userId) return;
        const fetchDetail = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setData(data);
            } catch (e) {
                console.warn(e);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [open, userId, token]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-brand-dark/70 backdrop-blur-md z-[110] flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
                    >
                        {loading || !data ? (
                            <div className="p-12 text-center text-xs font-bold text-brand-muted">
                                Loading...
                            </div>
                        ) : (
                            <>
                                {/* HEADER */}
                                <div className="p-6 border-b border-brand-border bg-gradient-to-br from-brand-light/40 to-white sticky top-0 z-10">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="w-14 h-14 bg-gradient-to-br from-brand-accent to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shrink-0">
                                                {data.user.name
                                                    ?.charAt(0)
                                                    .toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h2 className="text-xl font-black text-brand-dark tracking-tight truncate">
                                                        {data.user.name}
                                                    </h2>
                                                    {data.user.isAdmin && (
                                                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                                                            Admin
                                                        </span>
                                                    )}
                                                    {data.user.isDeleted && (
                                                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                                                            Deleted
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs font-medium text-brand-muted truncate mt-0.5">
                                                    {data.user.email}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={onClose}
                                            className="p-2 rounded-xl text-brand-muted hover:bg-brand-light"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* BODY */}
                                <div className="p-6 space-y-6">
                                    {/* META */}
                                    <Section title="Account Info">
                                        <Row
                                            icon={Calendar}
                                            label="Joined"
                                            value={format(
                                                new Date(data.user.createdAt),
                                                "d MMM yyyy"
                                            )}
                                        />
                                        <Row
                                            icon={Clock}
                                            label="Last Active"
                                            value={
                                                data.user.lastActiveDate
                                                    ? formatDistanceToNow(
                                                          new Date(
                                                              data.user.lastActiveDate
                                                          ),
                                                          { addSuffix: true }
                                                      )
                                                    : "Never"
                                            }
                                        />
                                        <Row
                                            icon={Shield}
                                            label="Auth Provider"
                                            value={
                                                data.user.authProvider ===
                                                "google"
                                                    ? "Google"
                                                    : "Email / Password"
                                            }
                                        />
                                        <Row
                                            icon={Award}
                                            label="Tier"
                                            value={(
                                                data.user.userTier || "free"
                                            ).toUpperCase()}
                                        />
                                    </Section>

                                    {/* PRELIMS */}
                                    <Section title="Prelims Performance">
                                        <StatGrid>
                                            <Stat
                                                label="Attempts"
                                                value={
                                                    data.stats.prelimsAttempts
                                                }
                                                icon={Target}
                                            />
                                            <Stat
                                                label="Correct"
                                                value={
                                                    data.stats.prelimsCorrect
                                                }
                                                icon={CheckCircle2}
                                            />
                                            <Stat
                                                label="Accuracy"
                                                value={`${data.stats.prelimsAccuracy}%`}
                                                icon={Award}
                                            />
                                            <Stat
                                                label="Streak"
                                                value={data.user.streak || 0}
                                                icon={Flame}
                                            />
                                        </StatGrid>
                                    </Section>

                                    {/* MAINS */}
                                    <Section title="Mains Performance">
                                        <StatGrid>
                                            <Stat
                                                label="Answers Written"
                                                value={
                                                    data.stats.mainsAttempts
                                                }
                                                icon={GraduationCap}
                                            />
                                            <Stat
                                                label="Readiness"
                                                value={`${
                                                    data.user
                                                        .upscReadinessScore ||
                                                    0
                                                }%`}
                                                icon={Award}
                                            />
                                        </StatGrid>
                                    </Section>

                                    {/* CONTENT */}
                                    <Section title="Content & Activity">
                                        <StatGrid>
                                            <Stat
                                                label="Sticky Notes"
                                                value={data.stats.stickyNotes}
                                                icon={StickyNoteIcon}
                                            />
                                            <Stat
                                                label="Planner Tasks"
                                                value={data.stats.tasks}
                                                icon={Calendar}
                                            />
                                            <Stat
                                                label="Syllabus Covered"
                                                value={
                                                    data.stats.syllabusCovered
                                                }
                                                icon={BookOpenCheck}
                                            />
                                            <Stat
                                                label="Bookmarks"
                                                value={
                                                    (data.stats
                                                        .syllabusBookmarked ||
                                                        0) +
                                                    (data.stats
                                                        .bookmarkedQuestions ||
                                                        0)
                                                }
                                                icon={Bookmark}
                                            />
                                        </StatGrid>
                                    </Section>

                                    {/* STORAGE */}
                                    <Section title="Storage">
                                        <div className="bg-brand-light rounded-xl p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <HardDrive
                                                        size={14}
                                                        className="text-brand-muted"
                                                    />
                                                    <span className="text-xs font-black text-brand-dark">
                                                        {formatBytes(
                                                            data.user
                                                                .storageUsedBytes
                                                        )}{" "}
                                                        /{" "}
                                                        {formatBytes(
                                                            data.user
                                                                .storageQuotaBytes
                                                        )}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] font-black text-brand-muted">
                                                    {Math.round(
                                                        ((data.user
                                                            .storageUsedBytes ||
                                                            0) /
                                                            (data.user
                                                                .storageQuotaBytes ||
                                                                1)) *
                                                            100
                                                    )}
                                                    %
                                                </span>
                                            </div>
                                            <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-brand-accent rounded-full"
                                                    style={{
                                                        width: `${Math.min(
                                                            ((data.user
                                                                .storageUsedBytes ||
                                                                0) /
                                                                (data.user
                                                                    .storageQuotaBytes ||
                                                                    1)) *
                                                                100,
                                                            100
                                                        )}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </Section>

                                    {/* RECENT */}
                                    <Section title="Recent Attempts">
                                        {data.recentAttempts.length === 0 ? (
                                            <p className="text-xs font-bold text-brand-muted text-center py-6">
                                                No recent attempts
                                            </p>
                                        ) : (
                                            <div className="space-y-1.5">
                                                {data.recentAttempts.map(
                                                    (a) => (
                                                        <div
                                                            key={a._id}
                                                            className="flex items-start gap-2 p-2 bg-brand-light rounded-lg"
                                                        >
                                                            <div
                                                                className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                                                                    a.isCorrect
                                                                        ? "bg-green-500"
                                                                        : "bg-red-500"
                                                                }`}
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[11px] font-bold text-brand-dark line-clamp-1">
                                                                    {a.question
                                                                        ?.questionText ||
                                                                        "Question"}
                                                                </p>
                                                                <p className="text-[10px] text-brand-muted font-medium mt-0.5">
                                                                    {formatDistanceToNow(
                                                                        new Date(
                                                                            a.createdAt
                                                                        ),
                                                                        {
                                                                            addSuffix:
                                                                                true,
                                                                        }
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </Section>
                                </div>
                            </>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function Section({ title, children }) {
    return (
        <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2">
                {title}
            </p>
            <div className="space-y-1.5">{children}</div>
        </div>
    );
}

function Row({ icon: Icon, label, value }) {
    return (
        <div className="flex items-center justify-between p-2.5 bg-brand-light rounded-lg">
            <div className="flex items-center gap-2">
                <Icon size={13} className="text-brand-muted" />
                <span className="text-[11px] font-bold text-brand-muted">
                    {label}
                </span>
            </div>
            <span className="text-xs font-black text-brand-dark">{value}</span>
        </div>
    );
}

function StatGrid({ children }) {
    return <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">{children}</div>;
}

function Stat({ icon: Icon, label, value }) {
    return (
        <div className="bg-brand-light rounded-xl p-3">
            <Icon size={13} className="text-brand-muted mb-1.5" />
            <p className="text-base font-black text-brand-dark leading-none">
                {value}
            </p>
            <p className="text-[9px] font-black uppercase tracking-widest text-brand-muted mt-1">
                {label}
            </p>
        </div>
    );
}