"use client";

import { motion } from "framer-motion";
import {
    Calendar,
    Clock,
    CheckCircle2,
    Circle,
    Edit3,
    Trash2,
    Repeat,
    Bell,
    Link2,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { format, isToday, isPast, isTomorrow } from "date-fns";
import { useState } from "react";

const priorityColors = {
    low: "border-l-blue-400",
    medium: "border-l-yellow-400",
    high: "border-l-red-500",
};

const categoryBadgeColors = {
    prelims: "bg-blue-100 text-blue-700",
    mains: "bg-purple-100 text-purple-700",
    revision: "bg-yellow-100 text-yellow-700",
    general: "bg-gray-100 text-gray-700",
};

export default function TaskCard({
    task,
    onToggle,
    onEdit,
    onDelete,
    onToggleSubtask,
}) {
    const [expanded, setExpanded] = useState(false);

    const isDone = task.status === "done";
    const due = task.dueDate ? new Date(task.dueDate) : null;
    const isOverdue = due && !isDone && isPast(due) && !isToday(due);

    const formatDue = () => {
        if (!due) return null;
        if (isToday(due)) return `Today${task.dueTime ? " · " + task.dueTime : ""}`;
        if (isTomorrow(due))
            return `Tomorrow${task.dueTime ? " · " + task.dueTime : ""}`;
        return `${format(due, "MMM d")}${task.dueTime ? " · " + task.dueTime : ""}`;
    };

    const subtaskDoneCount = task.subtasks?.filter((s) => s.done).length || 0;
    const subtaskTotal = task.subtasks?.length || 0;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className={`bg-white border border-brand-border border-l-4 ${
                priorityColors[task.priority] || priorityColors.medium
            } rounded-2xl p-3 sm:p-4 transition-all hover:shadow-md ${
                isDone ? "opacity-60" : ""
            }`}
        >
            <div className="flex items-start gap-3">
                <button
                    onClick={() => onToggle && onToggle(task)}
                    className="mt-0.5 shrink-0"
                >
                    {isDone ? (
                        <CheckCircle2
                            size={20}
                            className="text-green-500 fill-green-500/20"
                        />
                    ) : (
                        <Circle
                            size={20}
                            className="text-brand-muted hover:text-brand-dark transition-all"
                        />
                    )}
                </button>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <h3
                            className={`font-black text-sm text-brand-dark ${
                                isDone ? "line-through" : ""
                            }`}
                        >
                            {task.title}
                        </h3>
                        <div className="flex items-center gap-1 shrink-0">
                            <button
                                onClick={() => onEdit && onEdit(task)}
                                className="p-1 rounded-md text-brand-muted hover:bg-brand-light hover:text-brand-dark"
                                title="Edit"
                            >
                                <Edit3 size={12} />
                            </button>
                            <button
                                onClick={() => {
                                    if (window.confirm("Delete this task?"))
                                        onDelete && onDelete(task);
                                }}
                                className="p-1 rounded-md text-brand-muted hover:bg-red-50 hover:text-red-500"
                                title="Delete"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    </div>

                    {task.description && (
                        <p className="text-xs text-brand-muted font-medium mt-1 line-clamp-2">
                            {task.description}
                        </p>
                    )}

                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {due && (
                            <span
                                className={`flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full ${
                                    isOverdue
                                        ? "bg-red-100 text-red-700"
                                        : "bg-brand-light text-brand-muted"
                                }`}
                            >
                                {task.dueTime ? <Clock size={10} /> : <Calendar size={10} />}
                                {formatDue()}
                            </span>
                        )}

                        <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                categoryBadgeColors[task.category] ||
                                categoryBadgeColors.general
                            }`}
                        >
                            {task.category}
                        </span>

                        {task.recurrence?.type && task.recurrence.type !== "none" && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-brand-light text-brand-muted flex items-center gap-1">
                                <Repeat size={10} /> {task.recurrence.type}
                            </span>
                        )}

                        {task.reminder?.enabled && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-brand-light text-brand-muted flex items-center gap-1">
                                <Bell size={10} /> {task.reminder.minutesBefore}m
                            </span>
                        )}

                        {task.linkedQuestion?.questionId && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-brand-light text-brand-muted flex items-center gap-1">
                                <Link2 size={10} /> Linked
                            </span>
                        )}
                    </div>

                    {/* Subtasks */}
                    {subtaskTotal > 0 && (
                        <div className="mt-3">
                            <button
                                onClick={() => setExpanded(!expanded)}
                                className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-brand-muted hover:text-brand-dark"
                            >
                                {expanded ? (
                                    <ChevronUp size={12} />
                                ) : (
                                    <ChevronDown size={12} />
                                )}
                                Subtasks {subtaskDoneCount}/{subtaskTotal}
                            </button>

                            {expanded && (
                                <div className="mt-2 space-y-1.5 pl-1">
                                    {task.subtasks.map((s) => (
                                        <button
                                            key={s._id}
                                            onClick={() => onToggleSubtask && onToggleSubtask(task, s)}
                                            className="flex items-center gap-2 w-full text-left"
                                        >
                                            {s.done ? (
                                                <CheckCircle2
                                                    size={12}
                                                    className="text-green-500 shrink-0"
                                                />
                                            ) : (
                                                <Circle size={12} className="text-brand-muted shrink-0" />
                                            )}
                                            <span
                                                className={`text-xs font-medium ${
                                                    s.done
                                                        ? "line-through text-brand-muted"
                                                        : "text-brand-dark"
                                                }`}
                                            >
                                                {s.title}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}