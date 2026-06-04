"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Bookmark } from "lucide-react";

export default function BookmarksDrawer({
    open,
    onClose,
    progress,
    onJump,
}) {
    const bookmarked = Object.entries(progress)
        .filter(([, v]) => v.bookmarked)
        .map(([k, v]) => ({ nodeKey: k, ...v }));

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-brand-dark/50 backdrop-blur-sm z-[90]"
                    />
                    <motion.aside
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{
                            type: "spring",
                            damping: 30,
                            stiffness: 320,
                        }}
                        className="fixed right-0 top-0 bottom-0 w-full sm:w-[360px] bg-white z-[95] flex flex-col shadow-2xl border-l border-brand-border"
                    >
                        <div className="px-4 py-3 border-b border-brand-border flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="bg-amber-100 p-1.5 rounded-lg">
                                    <Bookmark
                                        size={14}
                                        className="text-amber-700 fill-amber-300"
                                    />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-brand-muted leading-none">
                                        Saved
                                    </p>
                                    <h2 className="text-sm font-black tracking-tight text-brand-dark leading-tight mt-0.5">
                                        Bookmarks
                                    </h2>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1.5 rounded-lg text-brand-muted hover:bg-brand-light hover:text-brand-dark transition-colors"
                            >
                                <X size={15} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4">
                            {bookmarked.length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-100 rounded-2xl mb-3 rotate-[-4deg]">
                                        <Bookmark
                                            size={24}
                                            className="text-amber-600"
                                        />
                                    </div>
                                    <p className="text-sm font-black text-brand-dark">
                                        No bookmarks yet
                                    </p>
                                    <p className="text-xs font-bold text-brand-muted mt-1">
                                        Click the bookmark icon on any topic
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {bookmarked.map((b) => (
                                        <button
                                            key={b.nodeKey}
                                            onClick={() => onJump?.(b)}
                                            className="w-full text-left p-3 bg-brand-light hover:bg-amber-50 hover:border-amber-200 border border-transparent rounded-xl transition-colors group"
                                        >
                                            <p className="text-xs font-black text-brand-dark">
                                                {b.nodeLabel || b.nodeKey}
                                            </p>
                                            {b.breadcrumb && (
                                                <p className="text-[10px] font-bold text-brand-muted mt-0.5 line-clamp-2">
                                                    {b.breadcrumb}
                                                </p>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="px-4 py-2.5 border-t border-brand-border bg-white">
                            <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted text-center">
                                {bookmarked.length}{" "}
                                {bookmarked.length === 1
                                    ? "bookmark"
                                    : "bookmarks"}
                            </p>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}