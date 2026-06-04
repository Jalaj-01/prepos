"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Bookmark, Check, FileText } from "lucide-react";

export default function TopicNode({
    node,
    depth = 0,
    progress = {},
    onToggle,
    onMark,
    breadcrumb = "",
    searchHighlight = "",
}) {
    const hasChildren =
        (node.children && node.children.length > 0) ||
        (node.subtopics && node.subtopics.length > 0);

    const [open, setOpen] = useState(depth < 1);

    const nodeKey = node.nodeKey;
    const prog = progress[nodeKey] || {};
    const covered = !!prog.covered;
    const bookmarked = !!prog.bookmarked;
    const pct = prog.percent ?? null;

    const label = node.label;
    const myBreadcrumb = breadcrumb
        ? `${breadcrumb} › ${label}`
        : label;

    const highlighted = (text) => {
        if (!searchHighlight || !text) return text;
        const idx = text
            .toLowerCase()
            .indexOf(searchHighlight.toLowerCase());
        if (idx === -1) return text;
        return (
            <>
                {text.slice(0, idx)}
                <mark className="bg-yellow-200 text-brand-dark rounded px-0.5">
                    {text.slice(idx, idx + searchHighlight.length)}
                </mark>
                {text.slice(idx + searchHighlight.length)}
            </>
        );
    };

    return (
        <div className="select-none">
            <div
                className={`group flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-brand-light/70 transition-colors ${
                    covered ? "opacity-70" : ""
                }`}
                style={{ paddingLeft: depth * 14 + 8 }}
            >
                {hasChildren ? (
                    <button
                        onClick={() => setOpen(!open)}
                        className="shrink-0 p-0.5 rounded hover:bg-brand-border/50 transition-colors"
                    >
                        <ChevronRight
                            size={14}
                            className={`text-brand-muted transition-transform ${
                                open ? "rotate-90" : ""
                            }`}
                        />
                    </button>
                ) : (
                    <span className="w-[18px] shrink-0" />
                )}

                <span
                    className={`flex-1 text-[13px] leading-snug ${
                        depth === 0
                            ? "font-black text-brand-dark"
                            : depth === 1
                            ? "font-bold text-brand-dark"
                            : "font-medium text-brand-dark/80"
                    } ${covered ? "line-through" : ""}`}
                >
                    {highlighted(label)}
                </span>

                {/* Question count badge (DB taxonomy only) */}
                {node.totalCount > 0 && (
                    <span
                        className="flex items-center gap-1 text-[10px] font-black text-brand-muted bg-brand-light px-2 py-0.5 rounded-full"
                        title={`${node.prelimsCount} prelims · ${node.mainsCount} mains`}
                    >
                        <FileText size={9} />
                        {node.totalCount}
                    </span>
                )}

                {/* Progress badge */}
                {typeof pct === "number" && pct > 0 && (
                    <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            pct >= 80
                                ? "bg-green-100 text-green-700"
                                : pct >= 40
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                        }`}
                    >
                        {pct}%
                    </span>
                )}

                {/* Bookmark */}
                <button
                    onClick={() =>
                        onMark?.({
                            nodeKey,
                            nodeLabel: label,
                            breadcrumb: myBreadcrumb,
                            field: "bookmarked",
                            value: !bookmarked,
                        })
                    }
                    className={`p-1 rounded transition-all ${
                        bookmarked
                            ? "text-amber-500 opacity-100"
                            : "text-brand-muted opacity-0 group-hover:opacity-100 hover:text-amber-500"
                    }`}
                    title={bookmarked ? "Remove bookmark" : "Bookmark"}
                >
                    <Bookmark
                        size={13}
                        className={bookmarked ? "fill-current" : ""}
                    />
                </button>

                {/* Covered checkbox */}
                <button
                    onClick={() =>
                        onMark?.({
                            nodeKey,
                            nodeLabel: label,
                            breadcrumb: myBreadcrumb,
                            field: "covered",
                            value: !covered,
                        })
                    }
                    className={`flex items-center justify-center w-5 h-5 rounded-md border-2 transition-all ${
                        covered
                            ? "bg-green-500 border-green-500 text-white"
                            : "border-brand-border hover:border-green-500 text-transparent"
                    }`}
                    title={covered ? "Mark as not covered" : "Mark as covered"}
                >
                    <Check size={12} strokeWidth={3.5} />
                </button>
            </div>

            <AnimatePresence initial={false}>
                {open && hasChildren && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden"
                    >
                        {/* Render DB taxonomy children */}
                        {node.children?.map((child) => (
                            <TopicNode
                                key={child.nodeKey}
                                node={child}
                                depth={depth + 1}
                                progress={progress}
                                onMark={onMark}
                                breadcrumb={myBreadcrumb}
                                searchHighlight={searchHighlight}
                            />
                        ))}

                        {/* Render official subtopics (leaves) */}
                        {node.subtopics?.map((s) => {
                            const childKey = `${nodeKey}.${s
                                .toLowerCase()
                                .replace(/\s+/g, "-")
                                .replace(/[^\w-]+/g, "")}`;
                            return (
                                <TopicNode
                                    key={childKey}
                                    node={{
                                        nodeKey: childKey,
                                        label: s,
                                    }}
                                    depth={depth + 1}
                                    progress={progress}
                                    onMark={onMark}
                                    breadcrumb={myBreadcrumb}
                                    searchHighlight={searchHighlight}
                                />
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}