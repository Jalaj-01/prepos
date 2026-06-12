"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { motion, AnimatePresence } from "framer-motion";

import {
    Megaphone,
    Plus,
    Edit3,
    Trash2,
    X,
    ArrowLeft,
    Eye,
    EyeOff,
    Info,
    CheckCircle,
    AlertTriangle,
    AlertCircle,
    Loader2
} from "lucide-react";

import Link from "next/link";

import axios from "axios";

import Sidebar from "@/components/layout/Sidebar";

import TopHeader from "@/components/layout/TopHeader";

import Footer from "@/components/layout/Footer";

import MobileNav from "@/components/layout/MobileNav";

const TYPES = [
    { value: "info", label: "Info", icon: Info, color: "bg-blue-100 text-blue-700" },
    { value: "success", label: "Success", icon: CheckCircle, color: "bg-green-100 text-green-700" },
    { value: "warning", label: "Warning", icon: AlertTriangle, color: "bg-yellow-100 text-yellow-700" },
    { value: "urgent", label: "Urgent", icon: AlertCircle, color: "bg-red-100 text-red-700" },
    { value: "announcement", label: "Announcement", icon: Megaphone, color: "bg-purple-100 text-purple-700" }
];

export default function AnnouncementsAdminLogic() {

    const router = useRouter();

    const [user, setUser] = useState(null);

    const [announcements, setAnnouncements] = useState([]);

    const [loading, setLoading] = useState(true);

    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    const [showModal, setShowModal] = useState(false);

    const [editing, setEditing] = useState(null);

    const [form, setForm] = useState({
        title: "",
        message: "",
        type: "info",
        expiresAt: "",
        actionText: "",
        actionUrl: ""
    });

    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {

        const info =
            localStorage.getItem("userInfo");

        if (!info) {
            router.push("/login");
            return;
        }

        const parsed = JSON.parse(info);

        if (!parsed.isAdmin) {

            showToast.error("Admin access required");

            router.push("/dashboard");

            return;
        }

        setUser(parsed);

        loadAnnouncements(parsed.token);

    }, []);

    const loadAnnouncements = async (token) => {

        try {

            const { data } = await axios.get(

                `${process.env.NEXT_PUBLIC_API_URL}/api/announcements/admin/all`,

                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setAnnouncements(data);

        } catch (err) {

            console.error("Load failed", err);

        } finally {

            setLoading(false);
        }
    };

    const openCreate = () => {

        setEditing(null);

        setForm({
            title: "",
            message: "",
            type: "info",
            expiresAt: "",
            actionText: "",
            actionUrl: ""
        });

        setShowModal(true);
    };

    const openEdit = (ann) => {

        setEditing(ann);

        setForm({
            title: ann.title,
            message: ann.message,
            type: ann.type,
            expiresAt: ann.expiresAt
                ? new Date(ann.expiresAt).toISOString().slice(0, 16)
                : "",
            actionText: ann.actionText || "",
            actionUrl: ann.actionUrl || ""
        });

        setShowModal(true);
    };

    const handleSubmit = async () => {

        if (!form.title.trim() || !form.message.trim()) {

            showToast.warning("Title and message are required");
            return;
        }

        setSubmitting(true);

        try {

            const payload = {
                ...form,
                expiresAt: form.expiresAt || null
            };

            if (editing) {

                await axios.put(

                    `${process.env.NEXT_PUBLIC_API_URL}/api/announcements/admin/${editing._id}`,

                    payload,

                    {
                        headers: {
                            Authorization: `Bearer ${user.token}`
                        }
                    }
                );

            } else {

                await axios.post(

                    `${process.env.NEXT_PUBLIC_API_URL}/api/announcements/admin`,

                    payload,

                    {
                        headers: {
                            Authorization: `Bearer ${user.token}`
                        }
                    }
                );
            }

            setShowModal(false);

            loadAnnouncements(user.token);

        } catch (err) {

            showToast.error(
                err.response?.data?.message ||
                "Failed to save"
            );

        } finally {

            setSubmitting(false);
        }
    };

    const handleToggle = async (id) => {

        try {

            await axios.put(

                `${process.env.NEXT_PUBLIC_API_URL}/api/announcements/admin/${id}/toggle`,

                {},

                {
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    }
                }
            );

            loadAnnouncements(user.token);

        } catch (err) {

            showToast.error("Couldn't update announcement");
        }
    };

    const handleDelete = async (id, title) => {

        const ok = await confirmAction({
    title: `Delete "${title}"?`,
    message: "This announcement will be permanently removed.",
    type: "warning",
    confirmText: "Delete",
});
if (!ok) return;

        try {

            await axios.delete(

                `${process.env.NEXT_PUBLIC_API_URL}/api/announcements/admin/${id}`,

                {
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    }
                }
            );

            loadAnnouncements(user.token);

        } catch (err) {

            showToast.error("Couldn't delete announcement");
        }
    };

    if (!user) return null;

    return (

        <div className="min-h-screen bg-brand-light flex">

            <Sidebar isAdmin={user.isAdmin} />

            <MobileNav
                isOpen={mobileNavOpen}
                onClose={() => setMobileNavOpen(false)}
            />

            <div className="flex-1 flex flex-col min-h-screen min-w-0">

                <TopHeader
                    user={user}
                    onMenuClick={() => setMobileNavOpen(true)}
                />

                <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-5xl w-full mx-auto">

                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-brand-muted hover:text-brand-dark mb-4 font-bold text-sm"
                    >
                        <ArrowLeft size={16} />
                        Back to Dashboard
                    </Link>

                    <div className="flex items-end justify-between flex-wrap gap-4 mb-8">

                        <div>

                            <div className="flex items-center gap-3 mb-2">

                                <div className="bg-purple-500/10 p-3 rounded-2xl">

                                    <Megaphone className="text-purple-600" size={24} />

                                </div>

                                <h1 className="text-3xl sm:text-4xl font-black text-brand-dark tracking-tighter">

                                    Announcements

                                </h1>

                            </div>

                            <p className="text-brand-muted font-medium text-sm mt-2">

                                Post notices that appear on all users' dashboards

                            </p>

                        </div>

                        <button
                            onClick={openCreate}
                            className="flex items-center gap-2 px-5 py-2.5 bg-brand-dark text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-accent transition-all"
                        >
                            <Plus size={14} />
                            New Announcement
                        </button>

                    </div>

                    {loading ? (

                        <div className="bg-white rounded-3xl border border-brand-border p-16 text-center">

                            <Loader2 size={24} className="animate-spin mx-auto text-brand-muted" />

                        </div>

                    ) : announcements.length === 0 ? (

                        <div className="bg-white rounded-3xl border border-brand-border p-16 text-center">

                            <div className="text-6xl mb-4">📢</div>

                            <h2 className="text-2xl font-black text-brand-dark mb-2">

                                No announcements yet

                            </h2>

                            <p className="text-brand-muted font-bold text-sm mb-6">

                                Create your first announcement to notify all users

                            </p>

                            <button
                                onClick={openCreate}
                                className="inline-flex items-center gap-2 px-5 py-3 bg-brand-dark text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-accent transition-all"
                            >
                                <Plus size={14} />
                                Create Announcement
                            </button>

                        </div>

                    ) : (

                        <div className="space-y-3">

                            {announcements.map(ann => {

                                const typeData =
                                    TYPES.find(t => t.value === ann.type) ||
                                    TYPES[0];

                                const TypeIcon = typeData.icon;

                                return (

                                    <motion.div
                                        key={ann._id}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`bg-white border rounded-2xl p-4 ${
                                            ann.isActive
                                                ? "border-brand-border"
                                                : "border-brand-border opacity-60"
                                        }`}
                                    >

                                        <div className="flex items-start gap-3">

                                            <span className={`p-2 rounded-xl ${typeData.color} shrink-0`}>

                                                <TypeIcon size={16} />

                                            </span>

                                            <div className="flex-1 min-w-0">

                                                <div className="flex items-center gap-2 flex-wrap mb-1">

                                                    <p className="font-black text-brand-dark text-sm">

                                                        {ann.title}

                                                    </p>

                                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                                        ann.isActive
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-gray-100 text-gray-700"
                                                    }`}>
                                                        {ann.isActive ? "Active" : "Hidden"}
                                                    </span>

                                                    {ann.expiresAt && (

                                                        <span className="text-[9px] font-bold text-brand-muted">

                                                            Expires: {new Date(ann.expiresAt).toLocaleDateString()}

                                                        </span>
                                                    )}

                                                </div>

                                                <p className="text-xs text-brand-muted font-medium leading-relaxed">

                                                    {ann.message}

                                                </p>

                                                {ann.actionText && (

                                                    <p className="text-[10px] font-black text-brand-accent mt-2">

                                                        Action: {ann.actionText} → {ann.actionUrl}

                                                    </p>
                                                )}

                                            </div>

                                            <div className="flex items-center gap-1">

                                                <button
                                                    onClick={() => handleToggle(ann._id)}
                                                    className="p-2 rounded-xl hover:bg-brand-light transition-all"
                                                    title={ann.isActive ? "Hide" : "Show"}
                                                >
                                                    {ann.isActive ? (
                                                        <Eye size={14} className="text-brand-muted" />
                                                    ) : (
                                                        <EyeOff size={14} className="text-brand-muted" />
                                                    )}
                                                </button>

                                                <button
                                                    onClick={() => openEdit(ann)}
                                                    className="p-2 rounded-xl hover:bg-brand-light transition-all"
                                                    title="Edit"
                                                >
                                                    <Edit3 size={14} className="text-brand-muted" />
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(ann._id, ann.title)}
                                                    className="p-2 rounded-xl hover:bg-red-50 text-red-500 transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={14} />
                                                </button>

                                            </div>

                                        </div>

                                    </motion.div>
                                );
                            })}

                        </div>
                    )}

                </main>

                <Footer />

            </div>

            {/* CREATE/EDIT MODAL */}

            <AnimatePresence>

                {showModal && (

                    <div className="fixed inset-0 bg-brand-dark/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">

                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl relative my-8"
                        >

                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-6 right-6 text-brand-muted hover:text-brand-dark"
                            >
                                <X size={20} />
                            </button>

                            <h2 className="text-2xl font-black mb-2">

                                {editing ? "Edit Announcement" : "New Announcement"}

                            </h2>

                            <p className="text-brand-muted text-sm mb-6 font-medium">

                                This will show on all users' dashboards

                            </p>

                            {/* TYPE */}

                            <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2 block">

                                Type

                            </label>

                            <div className="grid grid-cols-5 gap-2 mb-4">

                                {TYPES.map(t => {

                                    const TIcon = t.icon;

                                    return (

                                        <button
                                            key={t.value}
                                            onClick={() => setForm({ ...form, type: t.value })}
                                            className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                                                form.type === t.value
                                                    ? "border-brand-accent bg-brand-accent/5"
                                                    : "border-brand-border bg-white"
                                            }`}
                                            title={t.label}
                                        >
                                            <TIcon size={16} className={t.color.includes("blue") ? "text-blue-600" : t.color.includes("green") ? "text-green-600" : t.color.includes("yellow") ? "text-yellow-600" : t.color.includes("red") ? "text-red-600" : "text-purple-600"} />
                                            <span className="text-[9px] font-black uppercase">{t.label}</span>
                                        </button>
                                    );
                                })}

                            </div>

                            {/* TITLE */}

                            <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2 block">

                                Title *

                            </label>

                            <input
                                type="text"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                placeholder="New questions added!"
                                className="w-full p-3 bg-brand-light border border-brand-border rounded-xl font-bold outline-none focus:border-brand-accent transition-all text-sm mb-4"
                            />

                            {/* MESSAGE */}

                            <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2 block">

                                Message *

                            </label>

                            <textarea
                                value={form.message}
                                onChange={(e) => setForm({ ...form, message: e.target.value })}
                                placeholder="500 new MCQs from 2024 PYQ have been added to Question Library."
                                rows={3}
                                className="w-full p-3 bg-brand-light border border-brand-border rounded-xl font-medium outline-none focus:border-brand-accent transition-all text-sm resize-none mb-4"
                            />

                            {/* EXPIRES */}

                            <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2 block">

                                Expires (Optional)

                            </label>

                            <input
                                type="datetime-local"
                                value={form.expiresAt}
                                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                                className="w-full p-3 bg-brand-light border border-brand-border rounded-xl font-bold outline-none focus:border-brand-accent transition-all text-sm mb-4"
                            />

                            {/* ACTION */}

                            <div className="grid grid-cols-2 gap-3 mb-6">

                                <div>

                                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2 block">

                                        Action Text (Optional)

                                    </label>

                                    <input
                                        type="text"
                                        value={form.actionText}
                                        onChange={(e) => setForm({ ...form, actionText: e.target.value })}
                                        placeholder="Try Now"
                                        className="w-full p-3 bg-brand-light border border-brand-border rounded-xl font-bold outline-none focus:border-brand-accent transition-all text-sm"
                                    />

                                </div>

                                <div>

                                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2 block">

                                        Action URL

                                    </label>

                                    <input
                                        type="text"
                                        value={form.actionUrl}
                                        onChange={(e) => setForm({ ...form, actionUrl: e.target.value })}
                                        placeholder="/practice"
                                        className="w-full p-3 bg-brand-light border border-brand-border rounded-xl font-bold outline-none focus:border-brand-accent transition-all text-sm"
                                    />

                                </div>

                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={submitting || !form.title.trim() || !form.message.trim()}
                                className="w-full bg-brand-dark text-white py-3.5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-brand-accent transition-all disabled:opacity-50"
                            >
                                {submitting ? "Saving..." : editing ? "Update" : "Create Announcement"}
                            </button>

                        </motion.div>

                    </div>
                )}

            </AnimatePresence>

        </div>
    );
}