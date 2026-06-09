"use client";

import { CheckCircle2, Circle } from "lucide-react";

export default function QuestionStatusBadge({
    attempted = false,
    size = "sm",
    showLabel = true,
}) {
    const sz =
        size === "lg"
            ? "text-[11px] px-2.5 py-1 gap-1.5"
            : "text-[9px] px-2 py-0.5 gap-1";

    const iconSize = size === "lg" ? 11 : 9;

    if (attempted) {
        return (
            <span
                className={`inline-flex items-center font-black uppercase tracking-widest rounded-full bg-green-100 text-green-700 border border-green-200 ${sz}`}
                title="You've attempted this question"
            >
                <CheckCircle2 size={iconSize} className="fill-green-600 text-white" />
                {showLabel && "Done"}
            </span>
        );
    }

    return (
        <span
            className={`inline-flex items-center font-black uppercase tracking-widest rounded-full bg-brand-light text-brand-muted border border-brand-border ${sz}`}
            title="Not attempted yet"
        >
            <Circle size={iconSize} />
            {showLabel && "New"}
        </span>
    );
}