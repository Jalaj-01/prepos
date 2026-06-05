"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronRight,
    Bookmark,
    Check,
    FileText,
    Pencil,
    Trash2,
    GripVertical,
    X as XIcon,
    Check as CheckIcon,
} from "lucide-react";
import { useDraggable, useDroppable } from "@dnd-kit/core";

export default function TopicNode({
    node,
    depth = 0,
    progress = {},
    onMark,
    breadcrumb = "",
    searchHighlight = "",

    // ─── Admin/edit props (only passed when in editable content view) ───
    isEditable = false,
    selectedIds = new Set(),
    onToggleSelect,
    onRename,
    onDelete,
    activeDragId = null,
    parentLevel = null, // helps decide if node is droppable
}) {
    const hasChildren =
        (node.children && node.children.length > 0) ||
        (node.subtopics && node.subtopics.length > 0);

    const [open, setOpen] = useState(depth < 1);
    const [renaming, setRenaming] = useState(false);
    const [draftName, setDraftName] = useState(node.label || "");
    const inputRef = useRef(null);

    const nodeKey = node.nodeKey;
    const prog = progress[nodeKey] || {};
    const covered = !!prog.covered;
    const bookmarked = !!prog.bookmarked;
    const pct = prog.percent ?? null;

    const label = node.label;
    const myBreadcrumb = breadcrumb ? `${breadcrumb} › ${label}` : label;

    // ─── Determine node level for DnD rules ───
    // taxonomy nodes use nodeKey format "taxonomy:<id>" — level is inferred from depth
    const taxonomyId = nodeKey?.startsWith("taxonomy:")
        ? nodeKey.split(":")[1]
        : null;

    const myLevel =
        depth === 0 ? "subject" : depth === 1 ? "topic" : "subtopic";

    const isSelected = selectedIds.has(nodeKey);

    // ─── DnD: Draggable (only topics & subtopics in editable mode) ───
    const canDrag = isEditable && taxonomyId && myLevel !== "subject";
    const {
        attributes,
        listeners,
        setNodeRef: setDragRef,
        isDragging,
    } = useDraggable({
        id: nodeKey,
        disabled: !canDrag,
        data: {
            taxonomyId,
            level: myLevel,
            label,
            // If this node is selected and there are other selected nodes,
            // include them all so the handler can move all together
            selectedIds: isSelected ? Array.from(selectedIds) : [nodeKey],
        },
    });

    // ─── DnD: Droppable (only subject + topic can accept drops) ───
    const canAcceptDrop = isEditable && taxonomyId && myLevel !== "subtopic";
    const { setNodeRef: setDropRef, isOver, active } = useDroppable({
        id: `drop-${nodeKey}`,
        disabled: !canAcceptDrop,
        data: {
            taxonomyId,
            level: myLevel,
        },
    });

    // Check if the drop is valid based on level rules
    const draggedLevel = active?.data?.current?.level;
    const validDrop =
        isOver &&
        ((draggedLevel === "topic" && myLevel === "subject") ||
            (draggedLevel === "subtopic" && myLevel === "topic"));

    // Combine refs
    const setCombinedRef = (el) => {
        setDragRef(el);
        if (canAcceptDrop) setDropRef(el);
    };

    // ─── Rename ───
    useEffect(() => {
        if (renaming) {
            setTimeout(() => inputRef.current?.focus(), 50);
            setTimeout(() => inputRef.current?.select(), 60);
        }
    }, [renaming]);

    const commitRename = () => {
        const next = draftName.trim();
        if (!next || next === label) {
            setRenaming(false);
            setDraftName(label);
            return;
        }
        onRename?.(taxonomyId, next, nodeKey);
        setRenaming(false);
    };

    const cancelRename = () => {
        setDraftName(label);
        setRenaming(false);
    };

    const handleRenameKey = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            commitRename();
        } else if (e.key === "Escape") {
            e.preventDefault();
            cancelRename();
        }
    };

    const highlighted = (text) => {
        if (!searchHighlight || !text) return text;
        const idx = text.toLowerCase().indexOf(searchHighlight.toLowerCase());
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
                ref={setCombinedRef}
                {...(canDrag ? attributes : {})}
                className={`group relative flex items-center gap-2 px-2 py-2 rounded-lg transition-colors ${
                    covered ? "opacity-70" : ""
                } ${
                    isSelected
                        ? "bg-brand-accent/10 ring-1 ring-brand-accent/30"
                        : "hover:bg-brand-light/70"
                } ${isDragging ? "opacity-40" : ""} ${
                    validDrop
                        ? "ring-2 ring-green-400 bg-green-50"
                        : isOver && !validDrop && canAcceptDrop
                        ? "ring-2 ring-red-300 bg-red-50"
                        : ""
                }`}
                style={{ paddingLeft: depth * 14 + 8 }}
            >
                {/* Drag handle — admin only */}
                {canDrag && (
                    <button
                        {...listeners}
                        className="shrink-0 p-0.5 rounded text-brand-muted/40 opacity-0 group-hover:opacity-100 hover:text-brand-dark cursor-grab active:cursor-grabbing transition-opacity"
                        title="Drag to re-parent"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <GripVertical size={12} />
                    </button>
                )}

                {/* Multiselect checkbox — admin only */}
                {isEditable && taxonomyId && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleSelect?.(nodeKey);
                        }}
                        className={`shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                            isSelected
                                ? "bg-brand-dark border-brand-dark text-white"
                                : "border-brand-border opacity-0 group-hover:opacity-100 hover:border-brand-dark"
                        }`}
                        title={isSelected ? "Deselect" : "Select"}
                    >
                        {isSelected && <CheckIcon size={10} strokeWidth={3} />}
                    </button>
                )}

                {/* Expand chevron */}
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

                {/* Label or rename input */}
                {renaming ? (
                    <div className="flex-1 flex items-center gap-1.5">
                        <input
                            ref={inputRef}
                            value={draftName}
                            onChange={(e) => setDraftName(e.target.value)}
                            onKeyDown={handleRenameKey}
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 px-2 py-1 text-[13px] font-bold bg-white border border-brand-accent rounded-md outline-none ring-2 ring-brand-accent/20"
                        />
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                commitRename();
                            }}
                            className="p-1 rounded bg-green-500 text-white hover:bg-green-600"
                            title="Save (Enter)"
                        >
                            <CheckIcon size={11} strokeWidth={3} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                cancelRename();
                            }}
                            className="p-1 rounded bg-brand-light text-brand-muted hover:bg-brand-border/50"
                            title="Cancel (Esc)"
                        >
                            <XIcon size={11} strokeWidth={3} />
                        </button>
                    </div>
                ) : (
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
                )}

                {/* Question count badge */}
                {node.totalCount > 0 && !renaming && (
                    <span
                        className="flex items-center gap-1 text-[10px] font-black text-brand-muted bg-brand-light px-2 py-0.5 rounded-full"
                        title={`${node.prelimsCount} prelims · ${node.mainsCount} mains`}
                    >
                        <FileText size={9} />
                        {node.totalCount}
                    </span>
                )}

                {/* Progress badge */}
                {typeof pct === "number" && pct > 0 && !renaming && (
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

                {/* Admin edit/delete buttons */}
                {isEditable && taxonomyId && !renaming && (
                    <>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setDraftName(label);
                                setRenaming(true);
                            }}
                            className="p-1 rounded text-brand-muted opacity-0 group-hover:opacity-100 hover:text-blue-600 hover:bg-blue-50 transition-all"
                            title="Rename"
                        >
                            <Pencil size={12} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete?.(taxonomyId, label, node);
                            }}
                            className="p-1 rounded text-brand-muted opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 transition-all"
                            title="Delete"
                        >
                            <Trash2 size={12} />
                        </button>
                    </>
                )}

                {/* Bookmark */}
                {!renaming && (
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
                )}

                {/* Covered checkbox */}
                {!renaming && (
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
                )}
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
                        {/* DB taxonomy children */}
                        {node.children?.map((child) => (
                            <TopicNode
                                key={child.nodeKey}
                                node={child}
                                depth={depth + 1}
                                progress={progress}
                                onMark={onMark}
                                breadcrumb={myBreadcrumb}
                                searchHighlight={searchHighlight}
                                isEditable={isEditable}
                                selectedIds={selectedIds}
                                onToggleSelect={onToggleSelect}
                                onRename={onRename}
                                onDelete={onDelete}
                                activeDragId={activeDragId}
                                parentLevel={myLevel}
                            />
                        ))}

                        {/* Official subtopics (leaves only — never editable) */}
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