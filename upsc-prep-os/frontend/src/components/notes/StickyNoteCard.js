// src/components/notes/StickyNoteCard.js
"use client";

import { motion } from "framer-motion";
import { Pin, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const colorMap = {
    yellow: {
        bg: "bg-gradient-to-br from-yellow-100 via-yellow-100 to-yellow-200",
        border: "border-yellow-300/70",
        text: "text-yellow-950",
        tape: "bg-yellow-200/70",
        shadow: "shadow-[0_4px_12px_-2px_rgba(202,138,4,0.25)]",
        meta: "text-yellow-800/60",
    },
    pink: {
        bg: "bg-gradient-to-br from-pink-100 via-pink-100 to-pink-200",
        border: "border-pink-300/70",
        text: "text-pink-950",
        tape: "bg-pink-200/70",
        shadow: "shadow-[0_4px_12px_-2px_rgba(219,39,119,0.25)]",
        meta: "text-pink-800/60",
    },
    blue: {
        bg: "bg-gradient-to-br from-blue-100 via-blue-100 to-blue-200",
        border: "border-blue-300/70",
        text: "text-blue-950",
        tape: "bg-blue-200/70",
        shadow: "shadow-[0_4px_12px_-2px_rgba(37,99,235,0.25)]",
        meta: "text-blue-800/60",
    },
    green: {
        bg: "bg-gradient-to-br from-green-100 via-green-100 to-green-200",
        border: "border-green-300/70",
        text: "text-green-950",
        tape: "bg-green-200/70",
        shadow: "shadow-[0_4px_12px_-2px_rgba(22,163,74,0.25)]",
        meta: "text-green-800/60",
    },
    purple: {
        bg: "bg-gradient-to-br from-purple-100 via-purple-100 to-purple-200",
        border: "border-purple-300/70",
        text: "text-purple-950",
        tape: "bg-purple-200/70",
        shadow: "shadow-[0_4px_12px_-2px_rgba(147,51,234,0.25)]",
        meta: "text-purple-800/60",
    },
    orange: {
        bg: "bg-gradient-to-br from-orange-100 via-orange-100 to-orange-200",
        border: "border-orange-300/70",
        text: "text-orange-950",
        tape: "bg-orange-200/70",
        shadow: "shadow-[0_4px_12px_-2px_rgba(234,88,12,0.25)]",
        meta: "text-orange-800/60",
    },
};

const TILTS = ["-rotate-1", "rotate-1", "-rotate-[0.5deg]", "rotate-[0.5deg]"];

export default function StickyNoteCard({ note, onClick, onPin, onDelete }) {
    const c = colorMap[note.color] || colorMap.yellow;
    const tilt = TILTS[(note._id?.charCodeAt(0) || 0) % TILTS.length];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{
                y: -4,
                rotate: 0,
                scale: 1.02,
                transition: { duration: 0.2 },
            }}
            onClick={onClick}
            className={`relative cursor-pointer ${c.bg} ${c.border} ${c.text} ${c.shadow} ${tilt} border rounded-sm p-4 pt-6 min-h-[140px] transition-shadow hover:shadow-lg group`}
        >
            {/* Tape effect on top */}
            <div
                className={`absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-4 ${c.tape} opacity-80 rotate-[-2deg] shadow-sm`}
                style={{
                    backgroundImage:
                        "repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.15) 2px, rgba(255,255,255,0.15) 4px)",
                }}
            />

            {/* Pin badge */}
            {note.pinned && (
                <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-md ring-2 ring-white">
                    <Pin size={10} className="fill-white text-white" />
                </div>
            )}

            {/* Action icons — hover only */}
            <div className="absolute top-2 right-2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onPin && onPin(note);
                    }}
                    className="p-1 rounded-md hover:bg-black/10"
                    title={note.pinned ? "Unpin" : "Pin"}
                >
                    <Pin
                        size={11}
                        className={note.pinned ? "fill-current" : "opacity-60"}
                    />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete && onDelete(note);
                    }}
                    className="p-1 rounded-md hover:bg-red-500/20 text-red-700"
                    title="Delete"
                >
                    <Trash2 size={11} />
                </button>
            </div>

            {/* Title — clean sans-serif, tight tracking */}
            <h4 className="font-extrabold text-[15px] mb-1.5 leading-snug line-clamp-2 pr-6 tracking-tight">
                {note.title || "Untitled"}
            </h4>

            {/* Body — comfortable reading size, slight transparency for hierarchy */}
            {note.plainText && (
                <p className="text-[13px] font-medium opacity-80 line-clamp-4 leading-relaxed">
                    {note.plainText}
                </p>
            )}

            {/* Meta — subtle, uppercase micro-label */}
            <p
                className={`text-[9px] font-black mt-3 uppercase tracking-[0.15em] ${c.meta}`}
            >
                {note.updatedAt
                    ? formatDistanceToNow(new Date(note.updatedAt), {
                          addSuffix: true,
                      })
                    : ""}
            </p>
        </motion.div>
    );
}