"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
} from "lucide-react";
import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addDays,
    addMonths,
    subMonths,
    isSameMonth,
    isSameDay,
    isToday,
    format,
} from "date-fns";

const CATEGORY_DOT = {
    prelims: "bg-blue-500",
    mains: "bg-purple-500",
    revision: "bg-yellow-500",
    general: "bg-gray-400",
};

export default function PlannerCalendar({
    tasks = [],
    selectedDate,
    onSelectDate,
    onNewTaskOnDate,
}) {
    const [cursor, setCursor] = useState(new Date());

    const days = useMemo(() => {
        const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
        const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
        const arr = [];
        let d = start;
        while (d <= end) {
            arr.push(d);
            d = addDays(d, 1);
        }
        return arr;
    }, [cursor]);

    // Map: yyyy-MM-dd -> tasks[]
    const tasksByDay = useMemo(() => {
        const map = new Map();
        tasks.forEach((t) => {
            if (!t.dueDate) return;
            const k = format(new Date(t.dueDate), "yyyy-MM-dd");
            if (!map.has(k)) map.set(k, []);
            map.get(k).push(t);
        });
        return map;
    }, [tasks]);

    return (
        <div className="bg-white border border-brand-border rounded-2xl p-4 sm:p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="bg-brand-accent/10 p-1.5 rounded-lg">
                        <CalendarIcon size={14} className="text-brand-accent" />
                    </div>
                    <h3 className="text-base font-black text-brand-dark tracking-tight">
                        {format(cursor, "MMMM yyyy")}
                    </h3>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setCursor(subMonths(cursor, 1))}
                        className="p-1.5 rounded-lg text-brand-muted hover:bg-brand-light hover:text-brand-dark transition-colors"
                    >
                        <ChevronLeft size={14} />
                    </button>
                    <button
                        onClick={() => setCursor(new Date())}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-brand-muted hover:bg-brand-light hover:text-brand-dark transition-colors"
                    >
                        Today
                    </button>
                    <button
                        onClick={() => setCursor(addMonths(cursor, 1))}
                        className="p-1.5 rounded-lg text-brand-muted hover:bg-brand-light hover:text-brand-dark transition-colors"
                    >
                        <ChevronRight size={14} />
                    </button>
                </div>
            </div>

            {/* Weekday header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                    <div
                        key={d}
                        className="text-center text-[9px] font-black uppercase tracking-widest text-brand-muted py-1"
                    >
                        {d}
                    </div>
                ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-1.5">
                <AnimatePresence mode="popLayout">
                    {days.map((day) => {
                        const key = format(day, "yyyy-MM-dd");
                        const dayTasks = tasksByDay.get(key) || [];
                        const inMonth = isSameMonth(day, cursor);
                        const selected = selectedDate && isSameDay(day, selectedDate);
                        const today = isToday(day);

                        const cats = Array.from(
                            new Set(dayTasks.map((t) => t.category || "general"))
                        ).slice(0, 4);

                        return (
                            <motion.button
    key={key}
    layout
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    onClick={() => onSelectDate?.(day)}
    onDoubleClick={() => onNewTaskOnDate?.(day)}
    className={`relative h-12 sm:h-14 flex flex-col items-center justify-center p-1 rounded-lg border transition-all ${
        selected
            ? "bg-brand-dark text-white border-brand-dark shadow-sm"
            : today
            ? "bg-brand-accent/10 border-brand-accent/30 text-brand-dark hover:bg-brand-accent/15"
            : "border-transparent text-brand-dark hover:bg-brand-light"
    } ${!inMonth ? "opacity-30" : ""}`}
    title={
        dayTasks.length
            ? `${dayTasks.length} task${
                  dayTasks.length === 1 ? "" : "s"
              } — double click to add another`
            : "Double click to add task"
    }
>
    <span
        className={`text-[11px] sm:text-xs font-black tabular-nums leading-none ${
            today && !selected ? "text-brand-accent" : ""
        }`}
    >
        {format(day, "d")}
    </span>

    {/* Category dots */}
    {cats.length > 0 && (
        <div className="flex gap-0.5 mt-1">
            {cats.map((c, i) => (
                <span
                    key={i}
                    className={`w-1 h-1 rounded-full ${
                        CATEGORY_DOT[c] || CATEGORY_DOT.general
                    } ${selected ? "ring-1 ring-white/40" : ""}`}
                />
            ))}
        </div>
    )}

    {/* Task count badge */}
    {dayTasks.length > 0 && (
        <span
            className={`absolute -top-1 -right-1 min-w-[14px] h-[14px] px-1 text-[8px] font-black rounded-full flex items-center justify-center ${
                selected
                    ? "bg-white text-brand-dark"
                    : "bg-brand-dark text-white"
            }`}
        >
            {dayTasks.length}
        </span>
    )}
</motion.button>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-3 mt-3 pt-3 border-t border-brand-border flex-wrap">
                {Object.entries(CATEGORY_DOT).map(([cat, cls]) => (
                    <div key={cat} className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${cls}`} />
                        <span className="text-[9px] font-black uppercase tracking-widest text-brand-muted">
                            {cat}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}