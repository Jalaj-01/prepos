"use client";

import { useState, useRef, useEffect } from "react";

import { useRouter } from "next/navigation";

import { motion, AnimatePresence } from "framer-motion";

import {
    Upload,
    ArrowLeft,
    FileText,
    Image as ImageIcon,
    File,
    X,
    Loader2,
    Globe,
    Lock,
    Sparkles,
    CheckCircle,
    AlertCircle,
    FolderPlus,
    Plus,
    Trash2
} from "lucide-react";

import Link from "next/link";

import axios from "axios";

import Sidebar from "@/components/layout/Sidebar";

import TopHeader from "@/components/layout/TopHeader";

import Footer from "@/components/layout/Footer";

import MobileNav from "@/components/layout/MobileNav";

export default function BulkUploadLogic() {

    const router = useRouter();

    const [user, setUser] = useState(null);

    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    const [files, setFiles] = useState([]);

    const [subject, setSubject] = useState("");

    const [topic, setTopic] = useState("");

    const [source, setSource] = useState("");

    const [visibility, setVisibility] = useState("private");

    const [autoOrganize, setAutoOrganize] = useState(true);

    const [uploading, setUploading] = useState(false);

    const [progress, setProgress] = useState(0);

    const [results, setResults] = useState(null);

    const [storageInfo, setStorageInfo] = useState(null);

    const [storageError, setStorageError] = useState(null);

    const fileInputRef = useRef(null);

    useEffect(() => {

        const info =
            localStorage.getItem("userInfo");

        if (!info) {
            router.push("/login");
            return;
        }

        const parsed = JSON.parse(info);

        setUser(parsed);

        fetchStorage(parsed.token);

    }, []);

    const fetchStorage = async (token) => {

        try {

            const { data } = await axios.get(

                `${process.env.NEXT_PUBLIC_API_URL}/api/storage/me`,

                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setStorageInfo(data);

        } catch (err) {

            console.error("Storage fetch error", err);
        }
    };

    // =========================
    // FILE SELECTION
    // =========================

    const handleFileSelect = (e) => {

        const newFiles = Array.from(e.target.files || []);

        if (newFiles.length === 0) return;

        // Max 20 files per batch

        const totalCount = files.length + newFiles.length;

        if (totalCount > 20) {

            showToast.error(
                `Max 20 files per batch. You've selected ${files.length}, trying to add ${newFiles.length}.`
            );

            return;
        }

        // Calculate total size of new + existing

        const existingSize =
            files.reduce(
                (sum, f) => sum + f.size,
                0
            );

        const newSize =
            newFiles.reduce(
                (sum, f) => sum + f.size,
                0
            );

        const totalSize = existingSize + newSize;

        const remainingBytes =
            storageInfo?.remainingBytes || 0;

        if (totalSize > remainingBytes) {

            const totalMB =
                (totalSize / (1024 * 1024)).toFixed(2);

            const remainingMB =
                (remainingBytes / (1024 * 1024)).toFixed(2);

            setStorageError({

                totalMB,

                remainingMB,

                quotaMB:
                    storageInfo?.quotaMB || "0",

                usedMB:
                    storageInfo?.usedMB || "0"
            });

            // Clear input so user can re-select

            e.target.value = "";

            return;
        }

        setStorageError(null);

        // Add unique tag to each file for management

        const tagged =
            newFiles.map(f => ({

                file: f,

                id:
                    `f_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,

                name:
                    f.name,

                size:
                    f.size,

                type:
                    f.type
            }));

        setFiles([...files, ...tagged]);

        e.target.value = "";
    };

    const removeFile = (id) => {

        setFiles(files.filter(f => f.id !== id));

        setStorageError(null);
    };

    const clearAll = async () => {

        const ok = await confirmAction({
            title: "Clear all selected files?",
            type: "warning",
            confirmText: "Clear",
        });
        if (!ok) return;

        setFiles([]);

        setStorageError(null);

        setResults(null);
    };

    // =========================
    // UPLOAD
    // =========================

    const handleBulkUpload = async () => {

        if (files.length === 0) {

           showToast.warning("Please choose files first");


            return;
        }

        setUploading(true);

        setProgress(0);

        setResults(null);

        try {

            const formData = new FormData();

            files.forEach(f => {

                formData.append("files", f.file);
            });

            formData.append("visibility", visibility);

            if (subject)
                formData.append("subject", subject);

            if (topic)
                formData.append("topic", topic);

            if (source)
                formData.append("source", source);

            if (autoOrganize && subject) {

                formData.append("autoOrganize", "true");
            }

            const { data } = await axios.post(

                `${process.env.NEXT_PUBLIC_API_URL}/api/documents/bulk-upload`,

                formData,

                {
                    headers: {

                        Authorization:
                            `Bearer ${user.token}`,

                        "Content-Type":
                            "multipart/form-data"
                    },

                    onUploadProgress: (e) => {

                        if (e.total) {

                            setProgress(
                                Math.round(
                                    (e.loaded / e.total) * 100
                                )
                            );
                        }
                    }
                }
            );

            setResults(data);

            // Refresh storage

            fetchStorage(user.token);

        } catch (err) {

            if (err.response?.status === 413) {

               showToast.error(
                    "❌ Storage quota exceeded!\n\n" +
                    err.response.data.message
                );

            } else {

               showToast.error(
                    err.response?.data?.message ||
                    "Bulk upload failed"
                );
            }

        } finally {

            setUploading(false);

            setProgress(0);
        }
    };

    // =========================
    // HELPERS
    // =========================

    const formatBytes = (bytes) => {

        if (!bytes) return "0 B";

        const k = 1024;

        const sizes = ["B", "KB", "MB", "GB"];

        const i =
            Math.floor(
                Math.log(bytes) / Math.log(k)
            );

        return (
            parseFloat(
                (bytes / Math.pow(k, i)).toFixed(1)
            ) + " " + sizes[i]
        );
    };

    const getFileIcon = (type) => {

        if (type?.includes("pdf"))
            return <FileText size={18} className="text-red-500" />;

        if (type?.startsWith("image/"))
            return <ImageIcon size={18} className="text-blue-500" />;

        return <File size={18} className="text-brand-muted" />;
    };

    const totalSelectedSize =
        files.reduce(
            (sum, f) => sum + f.size,
            0
        );

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

                <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-4xl w-full mx-auto">

                    <Link
                        href="/vault"
                        className="flex items-center gap-2 text-brand-muted hover:text-brand-dark mb-4 font-bold text-sm"
                    >
                        <ArrowLeft size={16} />
                        Back to Vault
                    </Link>

                    <div className="mb-8">

                        <h1 className="text-3xl sm:text-4xl font-black text-brand-dark tracking-tighter">

                            Bulk Upload

                        </h1>

                        <p className="text-brand-muted font-medium text-sm mt-2">

                            Upload up to 20 files at once. Add subject/topic — we'll auto-organize them! ✨

                        </p>

                    </div>

                    {/* RESULTS SHOWN AFTER UPLOAD */}

                    {results ? (

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-3xl border border-brand-border p-8"
                        >

                            <div className="text-center mb-6">

                                <div className="bg-green-100 w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4">

                                    <CheckCircle size={32} className="text-green-600" />

                                </div>

                                <h2 className="text-2xl font-black text-brand-dark mb-2">

                                    Upload Complete!

                                </h2>

                                <p className="text-brand-muted font-bold text-sm">

                                    {results.uploaded.length} succeeded
                                    {results.failed.length > 0 && ` • ${results.failed.length} failed`}

                                </p>

                            </div>

                            {/* SUCCESS LIST */}

                            {results.uploaded.length > 0 && (

                                <div className="mb-6">

                                    <p className="text-[10px] font-black uppercase tracking-widest text-green-700 mb-2">

                                        ✓ Uploaded ({results.uploaded.length})

                                    </p>

                                    <div className="space-y-1 max-h-48 overflow-y-auto">

                                        {results.uploaded.map(u => (

                                            <div
                                                key={u.id}
                                                className="bg-green-50 border border-green-100 rounded-xl px-3 py-2 flex items-center justify-between"
                                            >
                                                <span className="text-xs font-bold text-brand-dark truncate flex-1">

                                                    {u.name}

                                                </span>

                                                <span className="text-[10px] font-bold text-green-700 ml-2">

                                                    {formatBytes(u.size)}

                                                </span>

                                            </div>
                                        ))}

                                    </div>

                                </div>
                            )}

                            {/* FAILED LIST */}

                            {results.failed.length > 0 && (

                                <div className="mb-6">

                                    <p className="text-[10px] font-black uppercase tracking-widest text-red-700 mb-2">

                                        ✗ Failed ({results.failed.length})

                                    </p>

                                    <div className="space-y-1">

                                        {results.failed.map((f, i) => (

                                            <div
                                                key={i}
                                                className="bg-red-50 border border-red-100 rounded-xl px-3 py-2"
                                            >
                                                <p className="text-xs font-bold text-brand-dark truncate">

                                                    {f.name}

                                                </p>

                                                <p className="text-[10px] font-bold text-red-600 mt-0.5">

                                                    {f.error}

                                                </p>

                                            </div>
                                        ))}

                                    </div>

                                </div>
                            )}

                            <div className="flex gap-3">

                                <button
                                    onClick={() => {
                                        setResults(null);
                                        setFiles([]);
                                    }}
                                    className="flex-1 bg-brand-light text-brand-dark py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-accent hover:text-white transition-all"
                                >
                                    Upload More
                                </button>

                                <Link
                                    href={
                                        results.targetFolderId
                                            ? `/vault/${results.targetFolderId}`
                                            : "/vault"
                                    }
                                    className="flex-1 bg-brand-dark text-white py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-accent transition-all text-center"
                                >
                                    View in Vault
                                </Link>

                            </div>

                        </motion.div>

                    ) : (

                        <div className="space-y-6">

                            {/* STORAGE WARNING */}

                            {storageError && (

                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-red-50 border-2 border-red-200 rounded-3xl p-5"
                                >

                                    <div className="flex items-start gap-3">

                                        <AlertCircle
                                            size={20}
                                            className="text-red-500 shrink-0 mt-0.5"
                                        />

                                        <div className="flex-1">

                                            <p className="font-black text-red-700 text-sm mb-1">

                                                Storage Quota Exceeded

                                            </p>

                                            <p className="text-xs text-red-600 font-bold leading-relaxed">

                                                Total size ({storageError.totalMB} MB) exceeds remaining space ({storageError.remainingMB} MB).
                                                You've used {storageError.usedMB} of {storageError.quotaMB} MB.

                                            </p>

                                        </div>

                                    </div>

                                </motion.div>
                            )}

                            {/* FILE DROPZONE */}

                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-white border-2 border-dashed border-brand-border hover:border-brand-accent rounded-3xl p-8 text-center cursor-pointer transition-all"
                            >

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.ppt,.pptx,.txt"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />

                                <div className="bg-brand-accent/10 w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4">

                                    <Upload size={28} className="text-brand-accent" />

                                </div>

                                <h3 className="font-black text-brand-dark text-base mb-1">

                                    {files.length > 0
                                        ? `${files.length} file${files.length === 1 ? "" : "s"} selected`
                                        : "Click to select multiple files"}

                                </h3>

                                <p className="text-xs text-brand-muted font-bold">

                                    {files.length > 0
                                        ? `Total: ${formatBytes(totalSelectedSize)} • Click to add more`
                                        : "PDF, Images, Word, PPT — max 100 MB each, up to 20 files"}

                                </p>

                                {storageInfo && (

                                    <p className="text-[10px] text-brand-muted font-bold mt-3">

                                        💾 You have {storageInfo.remainingMB} MB available

                                    </p>
                                )}

                            </div>

                            {/* SELECTED FILES LIST */}

                            {files.length > 0 && (

                                <div className="bg-white rounded-3xl border border-brand-border p-6">

                                    <div className="flex items-center justify-between mb-4">

                                        <p className="text-xs font-black uppercase tracking-widest text-brand-muted">

                                            Selected Files ({files.length})

                                        </p>

                                        <button
                                            onClick={clearAll}
                                            className="text-xs font-black text-red-500 hover:underline flex items-center gap-1"
                                        >
                                            <X size={12} />
                                            Clear All
                                        </button>

                                    </div>

                                    <div className="space-y-2 max-h-72 overflow-y-auto pr-2">

                                        {files.map(f => (

                                            <div
                                                key={f.id}
                                                className="bg-brand-light rounded-xl p-3 flex items-center gap-3 group"
                                            >

                                                {getFileIcon(f.type)}

                                                <div className="flex-1 min-w-0">

                                                    <p className="text-xs font-black text-brand-dark truncate">

                                                        {f.name}

                                                    </p>

                                                    <p className="text-[10px] font-bold text-brand-muted">

                                                        {formatBytes(f.size)}

                                                    </p>

                                                </div>

                                                <button
                                                    onClick={() => removeFile(f.id)}
                                                    className="text-brand-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <Trash2 size={14} />
                                                </button>

                                            </div>
                                        ))}

                                    </div>

                                </div>
                            )}

                            {/* METADATA FORM */}

                            {files.length > 0 && (

                                <div className="bg-white rounded-3xl border border-brand-border p-6 space-y-4">

                                    <p className="text-xs font-black uppercase tracking-widest text-brand-muted">

                                        Apply to All Files

                                    </p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                                        <div>

                                            <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2 block">

                                                Subject

                                            </label>

                                            <input
                                                type="text"
                                                value={subject}
                                                onChange={(e) => setSubject(e.target.value)}
                                                placeholder="History"
                                                className="w-full p-3 bg-brand-light border border-brand-border rounded-xl font-bold outline-none focus:border-brand-accent transition-all text-sm"
                                            />

                                        </div>

                                        <div>

                                            <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2 block">

                                                Topic

                                            </label>

                                            <input
                                                type="text"
                                                value={topic}
                                                onChange={(e) => setTopic(e.target.value)}
                                                placeholder="Modern History"
                                                className="w-full p-3 bg-brand-light border border-brand-border rounded-xl font-bold outline-none focus:border-brand-accent transition-all text-sm"
                                            />

                                        </div>

                                    </div>

                                    {/* AUTO-ORGANIZE */}

                                    {subject && (

                                        <label className="flex items-center gap-3 bg-purple-50 border border-purple-100 rounded-xl p-3 cursor-pointer">

                                            <input
                                                type="checkbox"
                                                checked={autoOrganize}
                                                onChange={(e) => setAutoOrganize(e.target.checked)}
                                                className="w-4 h-4 accent-purple-600"
                                            />

                                            <div className="flex-1">

                                                <p className="text-xs font-black text-purple-900 flex items-center gap-1.5">

                                                    <Sparkles size={12} />

                                                    Auto-organize all files into folder

                                                </p>

                                                <p className="text-[10px] text-purple-700 font-bold mt-0.5">

                                                    {subject}{topic && ` / ${topic}`}

                                                </p>

                                            </div>

                                        </label>
                                    )}

                                    <div>

                                        <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2 block">

                                            Source (Optional)

                                        </label>

                                        <input
                                            type="text"
                                            value={source}
                                            onChange={(e) => setSource(e.target.value)}
                                            placeholder="Vision IAS, Self-made, Vajiram..."
                                            className="w-full p-3 bg-brand-light border border-brand-border rounded-xl font-bold outline-none focus:border-brand-accent transition-all text-sm"
                                        />

                                    </div>

                                    {/* VISIBILITY */}

                                    <div>

                                        <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2 block">

                                            Visibility

                                        </label>

                                        <div className="grid grid-cols-2 gap-2">

                                            <button
                                                onClick={() => setVisibility("private")}
                                                className={`p-3 rounded-xl border-2 transition-all text-left ${
                                                    visibility === "private"
                                                        ? "border-brand-accent bg-brand-accent/5"
                                                        : "border-brand-border bg-white"
                                                }`}
                                            >
                                                <Lock size={16} className={visibility === "private" ? "text-brand-accent" : "text-brand-muted"} />
                                                <p className="font-black text-xs text-brand-dark mt-1">Private</p>
                                                <p className="text-[9px] text-brand-muted font-bold">Only you</p>
                                            </button>

                                            <button
                                                onClick={() => setVisibility("public")}
                                                className={`p-3 rounded-xl border-2 transition-all text-left ${
                                                    visibility === "public"
                                                        ? "border-brand-accent bg-brand-accent/5"
                                                        : "border-brand-border bg-white"
                                                }`}
                                            >
                                                <Globe size={16} className={visibility === "public" ? "text-brand-accent" : "text-brand-muted"} />
                                                <p className="font-black text-xs text-brand-dark mt-1">Public</p>
                                                <p className="text-[9px] text-brand-muted font-bold">Share community</p>
                                            </button>

                                        </div>

                                    </div>

                                </div>
                            )}

                            {/* PROGRESS BAR */}

                            {uploading && (

                                <div className="bg-white rounded-3xl border border-brand-border p-6">

                                    <div className="flex justify-between text-xs font-bold mb-2">

                                        <span className="text-brand-dark">Uploading {files.length} files...</span>

                                        <span className="text-brand-accent">{progress}%</span>

                                    </div>

                                    <div className="w-full bg-brand-light h-3 rounded-full overflow-hidden">

                                        <motion.div
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 0.2 }}
                                            className="h-full bg-gradient-to-r from-brand-accent to-purple-500"
                                        />

                                    </div>

                                </div>
                            )}

                            {/* UPLOAD BUTTON */}

                            {files.length > 0 && (

                                <button
                                    onClick={handleBulkUpload}
                                    disabled={uploading || files.length === 0}
                                    className="w-full bg-brand-dark text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-brand-accent transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {uploading ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Uploading {files.length} files...
                                        </>
                                    ) : (
                                        <>
                                            <Upload size={16} />
                                            Upload {files.length} File{files.length === 1 ? "" : "s"} ({formatBytes(totalSelectedSize)})
                                        </>
                                    )}
                                </button>
                            )}

                        </div>
                    )}

                </main>

                <Footer />

            </div>

        </div>
    );
}