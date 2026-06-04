"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Save,
    Trash2,
    Plus,
    Calendar,
    Clock,
    Bell,
    Repeat,
    Tag,
    Flag,
    AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import axios from "axios";
import { showToast } from "@/components/ui/Toast";

const PRIORITY_OPTS = [
    { id: "low", label: "Low", cls: "bg-blue-100 text-blue-700 border-blue-300" },
    {
        id: "medium",
        label: "Medium",
        cls: "bg-yellow-100 text-yellow-700 border-yellow-300",
    },
    { id: "high", label: "High", cls: "bg-red-100 text-red-700 border-red-300" },
];

const CATEGORIES = ["prelims", "mains", "revision", "general"];
const RECUR_OPTS = ["none", "daily", "weekly", "monthly", "custom"];
const REMINDER_OPTS = [
    { v: 0, label: "At due time" },
    { v: 5, label: "5 min before" },
    { v: 15, label: "15 min before" },
    { v: 30, label: "30 min before" },
    { v: 60, label: "1 hour before" },
    { v: 120, label: "2 hours before" },
    { v: 1440, label: "1 day before" },
];

// ─── Helper to detect what kind of "task" we got ───
// "new"                    → blank create
// { presetDate: Date }     → create with pre-filled date
// { _id, ... }             → edit existing
// null / undefined         → blank create (fallback)
const detectMode = (task) => {
    if (!task || task === "new") return { isNew: true, editing: null, preset: null };
    if (task.presetDate && !task._id)
        return { isNew: true, editing: null, preset: task.presetDate };
    return { isNew: false, editing: task, preset: null };
};

export default function TaskDrawer({ open, onClose, task, onSaved }) {
    const { isNew, editing, preset } = detectMode(task);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [dueTime, setDueTime] = useState("");
    const [priority, setPriority] = useState("medium");
    const [category, setCategory] = useState("general");
    const [subtasks, setSubtasks] = useState([]);
    const [subtaskInput, setSubtaskInput] = useState("");
    const [recurrence, setRecurrence] = useState({
        type: "none",
        daysOfWeek: [],
        intervalDays: 1,
    });
    const [reminder, setReminder] = useState({
        enabled: false,
        minutesBefore: 15,
    });
    const [saving, setSaving] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const getConfig = () => {
        const info = JSON.parse(localStorage.getItem("userInfo") || "{}");
        return { headers: { Authorization: `Bearer ${info.token}` } };
    };

    useEffect(() => {
        if (editing) {
            setTitle(editing.title || "");
            setDescription(editing.description || "");
            setDueDate(
                editing.dueDate
                    ? format(new Date(editing.dueDate), "yyyy-MM-dd")
                    : ""
            );
            setDueTime(editing.dueTime || "");
            setPriority(editing.priority || "medium");
            setCategory(editing.category || "general");
            setSubtasks(editing.subtasks || []);
            setRecurrence(
                editing.recurrence || {
                    type: "none",
                    daysOfWeek: [],
                    intervalDays: 1,
                }
            );
            setReminder(
                editing.reminder || { enabled: false, minutesBefore: 15 }
            );
        } else if (isNew) {
            setTitle("");
            setDescription("");
            setDueDate(preset ? format(new Date(preset), "yyyy-MM-dd") : "");
            setDueTime("");
            setPriority("medium");
            setCategory("general");
            setSubtasks([]);
            setRecurrence({ type: "none", daysOfWeek: [], intervalDays: 1 });
            setReminder({ enabled: false, minutesBefore: 15 });
            setSubtaskInput("");
        }
    }, [task, editing, isNew, preset]);

    const addSubtask = () => {
        if (!subtaskInput.trim()) return;
        setSubtasks([
            ...subtasks,
            { title: subtaskInput.trim(), done: false, order: subtasks.length },
        ]);
        setSubtaskInput("");
    };

    const removeSubtask = (idx) => {
        setSubtasks(subtasks.filter((_, i) => i !== idx));
    };

    const handleSave = async () => {
        if (!title.trim()) {
            showToast.error("Title is required");
            return;
        }
        setSaving(true);
        try {
            const payload = {
                title: title.trim(),
                description: description.trim(),
                dueDate: dueDate ? new Date(dueDate).toISOString() : null,
                dueTime: dueTime || null,
                priority,
                category,
                subtasks,
                recurrence,
                reminder,
            };
            if (isNew) {
                await axios.post(`${baseUrl}/api/tasks`, payload, getConfig());
                showToast.success("Task created");
            } else {
                await axios.put(
                    `${baseUrl}/api/tasks/${editing._id}`,
                    payload,
                    getConfig()
                );
                showToast.success("Task updated");
            }
            onSaved && onSaved();
            onClose();
        } catch (e) {
            showToast.error(
                e.response?.data?.message || "Failed to save task"
            );
        } finally {
            setSaving(false);
        }
    };

    const performDelete = async () => {
        if (!editing) return;
        try {
            await axios.delete(
                `${baseUrl}/api/tasks/${editing._id}`,
                getConfig()
            );
            showToast.success("Task deleted");
            onSaved && onSaved();
            setConfirmDelete(false);
            onClose();
        } catch (e) {
            showToast.error("Failed to delete");
            setConfirmDelete(false);
        }
    };

    const toggleDay = (day) => {
        const arr = recurrence.daysOfWeek || [];
        if (arr.includes(day)) {
            setRecurrence({
                ...recurrence,
                daysOfWeek: arr.filter((d) => d !== day),
            });
        } else {
            setRecurrence({ ...recurrence, daysOfWeek: [...arr, day] });
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-brand-dark/60 backdrop-blur-sm z-[90]"
                    />

                    <motion.aside
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 28, stiffness: 280 }}
                        className="fixed right-0 top-0 bottom-0 w-full sm:w-[460px] bg-white z-[95] flex flex-col shadow-2xl"
                    >
                        {/* HEADER */}
                        <div className="p-5 border-b border-brand-border flex items-center justify-between bg-gradient-to-br from-white to-brand-light/30">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
                                    {isNew ? "Create Task" : "Edit Task"}
                                </p>
                                <h2 className="text-lg font-black tracking-tight text-brand-dark">
                                    Day Planner
                                </h2>
                            </div>
                            <div className="flex items-center gap-2">
                                {!isNew && (
                                    <button
                                        onClick={() => setConfirmDelete(true)}
                                        className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                                        title="Delete task"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-xl text-brand-muted hover:bg-brand-light transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* BODY */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-5">
                            {preset && isNew && (
                                <div className="flex items-center gap-2 bg-brand-accent/10 border border-brand-accent/20 rounded-xl px-3 py-2">
                                    <Calendar
                                        size={14}
                                        className="text-brand-accent shrink-0"
                                    />
                                    <p className="text-xs font-black text-brand-dark">
                                        Date pre-filled from calendar:{" "}
                                        <span className="text-brand-accent">
                                            {format(new Date(preset), "EEE, d MMM yyyy")}
                                        </span>
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted ml-1">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Read Indian Polity Chapter 5"
                                    className="w-full mt-1 px-4 py-3 bg-brand-light border border-brand-border rounded-2xl text-sm font-black outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted ml-1">
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    placeholder="Add notes, context, or instructions"
                                    className="w-full mt-1 px-4 py-3 bg-brand-light border border-brand-border rounded-2xl text-sm font-medium outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted ml-1 flex items-center gap-1">
                                        <Calendar size={10} /> Due Date
                                    </label>
                                    <input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="w-full mt-1 px-3 py-2.5 bg-brand-light border border-brand-border rounded-xl text-sm font-bold outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted ml-1 flex items-center gap-1">
                                        <Clock size={10} /> Time
                                    </label>
                                    <input
                                        type="time"
                                        value={dueTime}
                                        onChange={(e) => setDueTime(e.target.value)}
                                        className="w-full mt-1 px-3 py-2.5 bg-brand-light border border-brand-border rounded-xl text-sm font-bold outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted ml-1 flex items-center gap-1">
                                    <Flag size={10} /> Priority
                                </label>
                                <div className="flex gap-2 mt-1">
                                    {PRIORITY_OPTS.map((p) => (
                                        <button
                                            key={p.id}
                                            onClick={() => setPriority(p.id)}
                                            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${
                                                priority === p.id
                                                    ? p.cls + " border"
                                                    : "bg-white border-brand-border text-brand-muted hover:text-brand-dark"
                                            }`}
                                        >
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted ml-1 flex items-center gap-1">
                                    <Tag size={10} /> Category
                                </label>
                                <div className="grid grid-cols-4 gap-2 mt-1">
                                    {CATEGORIES.map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => setCategory(c)}
                                            className={`py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                                category === c
                                                    ? "bg-brand-dark text-white"
                                                    : "bg-brand-light text-brand-muted hover:text-brand-dark"
                                            }`}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* SUBTASKS */}
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted ml-1">
                                    Subtasks
                                </label>
                                <div className="space-y-1.5 mt-1">
                                    {subtasks.map((s, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-2 bg-brand-light rounded-xl px-3 py-2"
                                        >
                                            <span className="text-xs font-medium text-brand-dark flex-1">
                                                {s.title}
                                            </span>
                                            <button
                                                onClick={() => removeSubtask(i)}
                                                className="text-brand-muted hover:text-red-500 transition-colors"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    <div className="flex gap-1.5">
                                        <input
                                            type="text"
                                            value={subtaskInput}
                                            onChange={(e) => setSubtaskInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    addSubtask();
                                                }
                                            }}
                                            placeholder="Add subtask + Enter"
                                            className="flex-1 px-3 py-2 bg-brand-light border border-brand-border rounded-xl text-xs font-medium outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all"
                                        />
                                        <button
                                            onClick={addSubtask}
                                            className="px-3 bg-brand-dark text-white rounded-xl hover:bg-brand-accent transition-colors"
                                        >
                                            <Plus size={12} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* RECURRENCE */}
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted ml-1 flex items-center gap-1">
                                    <Repeat size={10} /> Recurrence
                                </label>
                                <div className="flex gap-1.5 flex-wrap mt-1">
                                    {RECUR_OPTS.map((r) => (
                                        <button
                                            key={r}
                                            onClick={() =>
                                                setRecurrence({ ...recurrence, type: r })
                                            }
                                            className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                                                recurrence.type === r
                                                    ? "bg-brand-dark text-white"
                                                    : "bg-brand-light text-brand-muted hover:text-brand-dark"
                                            }`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>

                                {recurrence.type === "weekly" && (
                                    <div className="flex gap-1 mt-2">
                                        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                                            <button
                                                key={i}
                                                onClick={() => toggleDay(i)}
                                                className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${
                                                    recurrence.daysOfWeek?.includes(i)
                                                        ? "bg-brand-dark text-white"
                                                        : "bg-brand-light text-brand-muted hover:text-brand-dark"
                                                }`}
                                            >
                                                {d}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {recurrence.type === "custom" && (
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-xs font-bold text-brand-muted">
                                            Every
                                        </span>
                                        <input
                                            type="number"
                                            min={1}
                                            value={recurrence.intervalDays}
                                            onChange={(e) =>
                                                setRecurrence({
                                                    ...recurrence,
                                                    intervalDays:
                                                        parseInt(e.target.value) || 1,
                                                })
                                            }
                                            className="w-16 px-2 py-1 bg-brand-light border border-brand-border rounded-lg text-xs font-bold text-center"
                                        />
                                        <span className="text-xs font-bold text-brand-muted">
                                            days
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* REMINDER */}
                            <div>
                                <label className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-brand-muted ml-1">
                                    <span className="flex items-center gap-1">
                                        <Bell size={10} /> Reminder
                                    </span>
                                    <button
                                        onClick={() =>
                                            setReminder({
                                                ...reminder,
                                                enabled: !reminder.enabled,
                                            })
                                        }
                                        className={`px-2 py-0.5 rounded-full text-[10px] transition-all ${
                                            reminder.enabled
                                                ? "bg-brand-dark text-white"
                                                : "bg-brand-light text-brand-muted"
                                        }`}
                                    >
                                        {reminder.enabled ? "ON" : "OFF"}
                                    </button>
                                </label>
                                {reminder.enabled && (
                                    <select
                                        value={reminder.minutesBefore}
                                        onChange={(e) =>
                                            setReminder({
                                                ...reminder,
                                                minutesBefore: parseInt(e.target.value),
                                            })
                                        }
                                        className="w-full mt-1 px-3 py-2 bg-brand-light border border-brand-border rounded-xl text-sm font-bold outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all"
                                    >
                                        {REMINDER_OPTS.map((r) => (
                                            <option key={r.v} value={r.v}>
                                                {r.label}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className="p-5 border-t border-brand-border bg-white">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full bg-brand-dark text-white py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-brand-accent transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <Save size={14} />
                                {saving
                                    ? "Saving..."
                                    : isNew
                                    ? "Create Task"
                                    : "Save Changes"}
                            </button>
                        </div>
                    </motion.aside>

                    {/* CONFIRM DELETE MODAL */}
                    <AnimatePresence>
                        {confirmDelete && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setConfirmDelete(false)}
                                className="fixed inset-0 bg-brand-dark/70 backdrop-blur-md z-[130] flex items-center justify-center p-4"
                            >
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.9, opacity: 0 }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                                >
                                    <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
                                        <AlertTriangle size={20} className="text-red-600" />
                                    </div>
                                    <h3 className="text-lg font-black text-brand-dark mb-1">
                                        Delete this task?
                                    </h3>
                                    <p className="text-xs font-medium text-brand-muted mb-5 leading-relaxed">
                                        This will permanently remove{" "}
                                        <span className="font-black text-brand-dark">
                                            "{editing?.title || "Untitled"}"
                                        </span>
                                        . This action cannot be undone.
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setConfirmDelete(false)}
                                            className="flex-1 py-2.5 bg-brand-light text-brand-dark rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-border/50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={performDelete}
                                            className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>
            )}
        </AnimatePresence>
    );
}