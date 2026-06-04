"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export default function DateTimeBadge() {
    const [now, setNow] = useState(null);

    useEffect(() => {
        setNow(new Date());
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    if (!now) return null;

    const day = now.toLocaleDateString("en-IN", { weekday: "long" });
    const date = now.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    return (
        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-brand-border rounded-2xl">
            <Clock size={14} className="text-brand-accent shrink-0" />
            <div className="flex flex-col leading-tight">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-brand-muted">
                    {day} · {date}
                </span>
                <span className="text-xs sm:text-sm font-black text-brand-dark tabular-nums">
                    {hours}:{minutes}
                    <span className="text-brand-muted">:{seconds}</span>{" "}
                    <span className="text-brand-accent">{ampm}</span>
                </span>
            </div>
        </div>
    );
}