"use client";

import { Crown } from "lucide-react";

export default function AdminBadge({ size = "sm" }) {
    const sz =
        size === "lg"
            ? "text-[11px] px-2.5 py-1"
            : "text-[9px] px-2 py-0.5";

    return (
        <span
            className={`inline-flex items-center gap-1 font-black uppercase tracking-widest rounded-full bg-gradient-to-r from-purple-600 to-brand-accent text-white ${sz}`}
        >
            <Crown size={size === "lg" ? 12 : 9} className="fill-white" />
            Admin
        </span>
    );
}