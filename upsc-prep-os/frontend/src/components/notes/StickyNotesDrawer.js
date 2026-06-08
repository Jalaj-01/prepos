// src/components/notes/StickyNotesDrawer.js
"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Plus,
    Search,
    Pin,
    Save,
    Trash2,
    ChevronLeft,
    StickyNote as StickyNoteIcon,
} from "lucide-react";
import axios from "axios";
import StickyNoteCard from "@/components/notes/StickyNoteCard";
import StickyNotesEditor from "@/components/notes/StickyNotesEditor";
import { showToast } from "@/components/ui/Toast";

const COLORS = [
    { id: "yellow", cls: "bg-yellow-300", ring: "ring-yellow-500" },
    { id: "pink", cls: "bg-pink-300", ring: "ring-pink-500" },
    { id: "blue", cls: "bg-blue-300", ring: "ring-blue-500" },
    { id: "green", cls: "bg-green-300", ring: "ring-green-500" },
    { id: "purple", cls: "bg-purple-300", ring: "ring-purple-500" },
    { id: "orange", cls: "bg-orange-300", ring: "ring-orange-500" },
];

export default function StickyNotesDrawer({ open, onClose }) {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [filterColor, setFilterColor] = useState(null);
    const [filterPinned, setFilterPinned] = useState(false);

    const [editing, setEditing] = useState(null);
    const [draftTitle, setDraftTitle] = useState("");
    const [draftBody, setDraftBody] = useState("");
    const [draftColor, setDraftColor] = useState("yellow");
    const [draftPinned, setDraftPinned] = useState(false);
    const [saving, setSaving] = useState(false);

    const [confirmDelete, setConfirmDelete] = useState(null);

    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    const getConfig = () => {
        const info = JSON.parse(localStorage.getItem("userInfo") || "{}");
        return { headers: { Authorization: `Bearer ${info.token}` } };
    };

    const fetchNotes = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterColor) params.append("color", filterColor);
            if (filterPinned) params.append("pinned", "true");
            if (search.trim()) params.append("search", search.trim());

            const { data } = await axios.get(
                `${baseUrl}/api/sticky-notes?${params.toString()}`,
                getConfig()
            );
            setNotes(data.notes || []);
        } catch (e) {
            console.warn("Fetch notes:", e.message);
            showToast.error("Couldn't load your notes");
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterColor, filterPinned, search]);

    useEffect(() => {
        if (!open) return;

        const loadNotes = async () => {
            await fetchNotes();
        };

        void loadNotes();
    }, [open, fetchNotes]);

    const openNew = () => {
        setEditing("new");
        setDraftTitle("");
        setDraftBody("");
        setDraftColor("yellow");
        setDraftPinned(false);
    };

    const openExisting = (note) => {
        setEditing(note);
        setDraftTitle(note.title || "");
        setDraftBody(note.body || "");
        setDraftColor(note.color || "yellow");
        setDraftPinned(!!note.pinned);
    };

    const closeEditor = () => setEditing(null);

    const handleSave = async () => {
        if (!draftTitle.trim() && !draftBody.trim()) {
            closeEditor();
            return;
        }
        setSaving(true);
        try {
            const payload = {
                title: draftTitle,
                body: draftBody,
                color: draftColor,
                pinned: draftPinned,
            };
            if (editing === "new") {
                await axios.post(`${baseUrl}/api/sticky-notes`, payload, getConfig());
                showToast.success("Note created");
            } else {
                await axios.put(
                    `${baseUrl}/api/sticky-notes/${editing._id}`,
                    payload,
                    getConfig()
                );
                showToast.success("Note updated");
            }
            await fetchNotes();
            closeEditor();
        } catch (e) {
            showToast.error("Failed to save note");
        } finally {
            setSaving(false);
        }
    };

    const handlePin = async (note) => {
        try {
            await axios.patch(
                `${baseUrl}/api/sticky-notes/${note._id}/pin`,
                {},
                getConfig()
            );
            showToast.success(note.pinned ? "Unpinned" : "Pinned to top");
            fetchNotes();
        } catch (e) {
            showToast.error("Couldn't update pin");
        }
    };

    const performDelete = async (note) => {
        try {
            await axios.delete(
                `${baseUrl}/api/sticky-notes/${note._id}`,
                getConfig()
            );
            if (editing && editing._id === note._id) closeEditor();
            showToast.success("Note deleted");
            fetchNotes();
        } catch (e) {
            showToast.error("Couldn't delete note");
        } finally {
            setConfirmDelete(null);
        }
    };

    const handleImageUpload = async (file) => {
        try {
            const fd = new FormData();
            fd.append("image", file);
            const info = JSON.parse(localStorage.getItem("userInfo") || "{}");
            const { data } = await axios.post(
                `${baseUrl}/api/sticky-notes/upload-image`,
                fd,
                {
                    headers: {
                        Authorization: `Bearer ${info.token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            showToast.success("Image added");
            return data.url;
        } catch (e) {
            showToast.error("Image upload failed");
            return null;
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* BACKDROP */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-brand-dark/50 backdrop-blur-sm z-[90]"
                    />

                    {/* DRAWER — slimmer (360px), tighter padding */}
                    <motion.aside
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 320 }}
                        className="fixed right-0 top-0 bottom-0 w-full sm:w-[360px] bg-white z-[95] flex flex-col shadow-2xl border-l border-brand-border"
                    >
                        {/* HEADER — compact */}
                        <div className="px-4 py-3 border-b border-brand-border bg-white">
                            {editing ? (
                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={closeEditor}
                                        className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-brand-muted hover:text-brand-dark transition-colors p-1.5 -ml-1.5 rounded-lg"
                                    >
                                        <ChevronLeft size={14} /> Back
                                    </button>
                                    <div className="flex items-center gap-1.5">
                                        {editing !== "new" && (
                                            <button
                                                onClick={() => setConfirmDelete(editing)}
                                                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-dark text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-brand-accent transition-all disabled:opacity-50"
                                        >
                                            <Save size={11} />
                                            {saving ? "Saving" : "Save"}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="bg-yellow-100 p-1.5 rounded-lg shrink-0">
                                            <StickyNoteIcon
                                                size={14}
                                                className="text-amber-700"
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-brand-muted leading-none">
                                                Sticky Notes
                                            </p>
                                            <h2 className="text-sm font-black tracking-tight text-brand-dark leading-tight mt-0.5">
                                                My Notes
                                            </h2>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            onClick={openNew}
                                            className="flex items-center gap-1 px-2.5 py-1.5 bg-brand-dark text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-brand-accent transition-all"
                                            title="New note"
                                        >
                                            <Plus size={11} />
                                            New
                                        </button>
                                        <button
                                            onClick={onClose}
                                            className="p-1.5 rounded-lg text-brand-muted hover:bg-brand-light hover:text-brand-dark transition-colors"
                                        >
                                            <X size={15} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* BODY */}
                        {editing ? (
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                <input
                                    type="text"
                                    value={draftTitle}
                                    onChange={(e) => setDraftTitle(e.target.value)}
                                    placeholder="Note title"
                                    className="w-full px-3.5 py-2.5 bg-brand-light border border-brand-border rounded-xl text-sm font-black outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all"
                                />

                                <StickyNotesEditor
                                    content={draftBody}
                                    onChange={setDraftBody}
                                    onImageUpload={handleImageUpload}
                                />

                                <div className="bg-brand-light border border-brand-border rounded-xl p-2.5 flex items-center justify-between flex-wrap gap-2">
                                    <div className="flex items-center gap-1.5">
                                        {COLORS.map((c) => (
                                            <button
                                                key={c.id}
                                                onClick={() => setDraftColor(c.id)}
                                                className={`w-5 h-5 rounded-full ${c.cls} ${
                                                    draftColor === c.id
                                                        ? `ring-2 ${c.ring} ring-offset-1`
                                                        : "hover:scale-110"
                                                } transition-all`}
                                            />
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setDraftPinned(!draftPinned)}
                                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                            draftPinned
                                                ? "bg-brand-dark text-white"
                                                : "bg-white border border-brand-border text-brand-muted hover:text-brand-dark"
                                        }`}
                                    >
                                        <Pin
                                            size={10}
                                            className={draftPinned ? "fill-white" : ""}
                                        />
                                        {draftPinned ? "Pinned" : "Pin"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* SEARCH + FILTERS — compact */}
                                <div className="p-3 space-y-2.5 border-b border-brand-border bg-white">
                                    <div className="relative">
                                        <Search
                                            size={13}
                                            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-brand-muted"
                                        />
                                        <input
                                            type="text"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder="Search notes..."
                                            className="w-full pl-8 pr-3 py-2 bg-brand-light border border-brand-border rounded-lg text-xs font-bold outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all"
                                        />
                                    </div>

                                    <div className="flex items-center gap-1 flex-wrap">
                                        <button
                                            onClick={() => {
                                                setFilterColor(null);
                                                setFilterPinned(false);
                                            }}
                                            className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                                                !filterColor && !filterPinned
                                                    ? "bg-brand-dark text-white"
                                                    : "bg-brand-light text-brand-muted hover:text-brand-dark"
                                            }`}
                                        >
                                            All
                                        </button>
                                        <button
                                            onClick={() => {
                                                setFilterPinned(!filterPinned);
                                                setFilterColor(null);
                                            }}
                                            className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1 ${
                                                filterPinned
                                                    ? "bg-brand-dark text-white"
                                                    : "bg-brand-light text-brand-muted hover:text-brand-dark"
                                            }`}
                                        >
                                            <Pin size={9} /> Pinned
                                        </button>
                                        <div className="w-px h-3.5 bg-brand-border mx-1" />
                                        {COLORS.map((c) => (
                                            <button
                                                key={c.id}
                                                onClick={() => {
                                                    setFilterColor(
                                                        filterColor === c.id ? null : c.id
                                                    );
                                                    setFilterPinned(false);
                                                }}
                                                className={`w-5 h-5 rounded-full ${c.cls} ${
                                                    filterColor === c.id
                                                        ? `ring-2 ${c.ring} ring-offset-1`
                                                        : "hover:scale-110"
                                                } transition-all`}
                                                title={c.id}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* NOTES — single column for slim drawer */}
                                <div className="flex-1 overflow-y-auto px-4 py-5 bg-gradient-to-b from-brand-light/30 to-white">
                                    {loading ? (
                                        <p className="text-center text-xs font-bold text-brand-muted py-8">
                                            Loading...
                                        </p>
                                    ) : notes.length === 0 ? (
                                        <div className="text-center py-16">
                                            <div className="inline-flex items-center justify-center w-14 h-14 bg-yellow-100 rounded-2xl mb-3 rotate-[-4deg] shadow-sm">
                                                <StickyNoteIcon
                                                    size={24}
                                                    className="text-amber-600"
                                                />
                                            </div>
                                            <p className="text-sm font-black text-brand-dark">
                                                No notes yet
                                            </p>
                                            <p className="text-xs font-bold text-brand-muted mt-1">
                                                Click <span className="font-black">New</span> to
                                                jot something down
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <AnimatePresence>
                                                {notes.map((n) => (
                                                    <StickyNoteCard
                                                        key={n._id}
                                                        note={n}
                                                        onClick={() => openExisting(n)}
                                                        onPin={handlePin}
                                                        onDelete={(note) =>
                                                            setConfirmDelete(note)
                                                        }
                                                    />
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </div>

                                {/* FOOTER — note count */}
                                {notes.length > 0 && (
                                    <div className="px-4 py-2.5 border-t border-brand-border bg-white">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted text-center">
                                            {notes.length} {notes.length === 1 ? "note" : "notes"}
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </motion.aside>

                    {/* CONFIRM DELETE MODAL */}
                    <AnimatePresence>
                        {confirmDelete && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-brand-dark/70 backdrop-blur-md z-[110] flex items-center justify-center p-4"
                                onClick={() => setConfirmDelete(null)}
                            >
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.9, opacity: 0 }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                                >
                                    <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
                                        <Trash2 size={20} className="text-red-600" />
                                    </div>
                                    <h3 className="text-lg font-black text-brand-dark mb-1">
                                        Delete this note?
                                    </h3>
                                        <p className="text-xs font-medium text-brand-muted mb-5 leading-relaxed">
                                            This will permanently remove
                                            <span className="font-black text-brand-dark">
                                                {confirmDelete.title || "Untitled"}
                                            </span>
                                            . This action cannot be undone.
                                        </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setConfirmDelete(null)}
                                            className="flex-1 py-2.5 bg-brand-light text-brand-dark rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-border/50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => performDelete(confirmDelete)}
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