"use client";

import { useEffect, useState, useRef } from "react";

import { useParams, useRouter } from "next/navigation";

import { motion, AnimatePresence } from "framer-motion";

import {
    FolderOpen,
    FolderPlus,
    ChevronRight,
    Home,
    Search,
    File,
    FileText,
    Image as ImageIcon,
    MoreVertical,
    Edit3,
    Trash2,
    Eye,
    Upload,
    X,
    Loader2,
    Globe,
    Lock,
    Sparkles,
    Plus,
    AlertCircle,
    Files
} from "lucide-react";

import Link from "next/link";

import axios from "axios";

import Sidebar from "@/components/layout/Sidebar";

import TopHeader from "@/components/layout/TopHeader";

import Footer from "@/components/layout/Footer";

import MobileNav from "@/components/layout/MobileNav";

import SecurePDFViewer from "@/components/pdf/SecurePDFViewer";

import { showToast } from "@/components/ui/Toast";

import { confirmAction } from "@/components/ui/ConfirmModal";

import { GridSkeleton } from "@/components/ui/Skeleton";

import EmptyState from "@/components/ui/EmptyState";

import PageHeader from "@/components/ui/PageHeader";

export default function VaultLogic() {

    const params = useParams();

    const router = useRouter();

    const currentFolderId =
        params?.folderId || "root";

    const [user, setUser] = useState(null);

    const [folders, setFolders] = useState([]);

    const [documents, setDocuments] = useState([]);

    const [breadcrumbs, setBreadcrumbs] = useState([]);

    const [currentFolder, setCurrentFolder] = useState(null);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    const [showNewFolder, setShowNewFolder] = useState(false);

    const [showUpload, setShowUpload] = useState(false);

    const [newFolderName, setNewFolderName] = useState("");

    const [creating, setCreating] = useState(false);

    const [activeMenu, setActiveMenu] = useState(null);

    // Rename

    const [renameTarget, setRenameTarget] = useState(null);

    const [renameValue, setRenameValue] = useState("");

    // Upload state

    const [uploadFiles, setUploadFiles] = useState([]);

    const [uploadProgress, setUploadProgress] = useState(0);

    const [uploading, setUploading] = useState(false);

    const [storageError, setStorageError] = useState(null);

    const [storageInfo, setStorageInfo] = useState(null);

    const fileInputRef = useRef(null);

    // Share modal

    const [shareDoc, setShareDoc] = useState(null);

    const [shareSubject, setShareSubject] = useState("");

    const [shareTopic, setShareTopic] = useState("");

    const [shareDescription, setShareDescription] = useState("");

    const [shareSource, setShareSource] = useState("");

    const [shareTags, setShareTags] = useState([]);

    const [shareTagInput, setShareTagInput] = useState("");

    const [sharing, setSharing] = useState(false);

    const [shareError, setShareError] = useState("");

    // PDF Viewer

    const [viewingDoc, setViewingDoc] = useState(null);

    const [viewUrl, setViewUrl] = useState(null);

    const [watermark, setWatermark] = useState(null);

    // =========================
    // AUTH
    // =========================

    useEffect(() => {

        const info =
            localStorage.getItem("userInfo");

        if (!info) {
            router.push("/login");
            return;
        }

        setUser(JSON.parse(info));

    }, []);

    // =========================
    // LOAD VAULT
    // =========================

    useEffect(() => {

        if (user) {
            loadVault();
            fetchStorage();
        }

    }, [user, currentFolderId]);

    const fetchStorage = async () => {

        try {

            const { data } = await axios.get(

                `${process.env.NEXT_PUBLIC_API_URL}/api/storage/me`,

                {
                    headers: {
                        Authorization:
                            `Bearer ${user.token}`
                    }
                }
            );

            setStorageInfo(data);

        } catch (err) {

            console.error("Storage fetch", err);
        }
    };

    const loadVault = async () => {

        setLoading(true);

        try {

            const config = {
                headers: {
                    Authorization:
                        `Bearer ${user.token}`
                }
            };

            const foldersPromise =
                axios.get(

                    `${process.env.NEXT_PUBLIC_API_URL}/api/folders?parentId=${currentFolderId}`,

                    config
                );

            const docsPromise =
                axios.get(

                    `${process.env.NEXT_PUBLIC_API_URL}/api/documents/my-vault?folderId=${currentFolderId}`,

                    config
                );

            const folderInfoPromise =
                currentFolderId !== "root"

                    ? axios.get(

                        `${process.env.NEXT_PUBLIC_API_URL}/api/folders/${currentFolderId}`,

                        config
                    )

                    : Promise.resolve({
                        data: {
                            folder: null,
                            breadcrumbs: []
                        }
                    });

            const [foldersRes, docsRes, folderInfoRes] =
                await Promise.all([
                    foldersPromise,
                    docsPromise,
                    folderInfoPromise
                ]);

            setFolders(foldersRes.data);

            setDocuments(docsRes.data);

            setBreadcrumbs(folderInfoRes.data.breadcrumbs || []);

            setCurrentFolder(folderInfoRes.data.folder);

        } catch (err) {

            console.error("Vault load", err);

            showToast.error("Failed to load vault");

        } finally {

            setLoading(false);
        }
    };

    // =========================
    // CREATE FOLDER
    // =========================

    const handleCreateFolder = async () => {

        if (!newFolderName.trim()) return;

        setCreating(true);

        try {

            await axios.post(

                `${process.env.NEXT_PUBLIC_API_URL}/api/folders`,

                {
                    name:
                        newFolderName.trim(),

                    parentId:
                        currentFolderId === "root"
                            ? null
                            : currentFolderId
                },

                {
                    headers: {
                        Authorization:
                            `Bearer ${user.token}`
                    }
                }
            );

            setNewFolderName("");

            setShowNewFolder(false);

            showToast.success("Folder created!");

            loadVault();

        } catch (err) {

            showToast.error(
                err.response?.data?.message ||
                "Failed to create folder"
            );

        } finally {

            setCreating(false);
        }
    };

    // =========================
    // FILE SELECT
    // =========================

    const handleFileSelect = (e) => {

        const newFiles = Array.from(e.target.files || []);

        if (newFiles.length === 0) return;

        const totalCount = uploadFiles.length + newFiles.length;

        if (totalCount > 20) {

            showToast.warning(
                `Max 20 files. You have ${uploadFiles.length}.`
            );

            return;
        }

        const existingSize =
            uploadFiles.reduce(
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

            setStorageError({

                totalMB:
                    (totalSize / (1024 * 1024)).toFixed(2),

                remainingMB:
                    (remainingBytes / (1024 * 1024)).toFixed(2)
            });

            e.target.value = "";

            return;
        }

        setStorageError(null);

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

        setUploadFiles([...uploadFiles, ...tagged]);

        e.target.value = "";
    };

    const removeFile = (id) => {

        setUploadFiles(uploadFiles.filter(f => f.id !== id));

        setStorageError(null);
    };

    // =========================
    // UPLOAD
    // =========================

    const handleUpload = async () => {

        if (uploadFiles.length === 0) {

            showToast.warning("Please select files");

            return;
        }

        setUploading(true);

        setUploadProgress(0);

        try {

            const isMulti = uploadFiles.length > 1;

            const endpoint = isMulti

                ? `${process.env.NEXT_PUBLIC_API_URL}/api/documents/bulk-upload`

                : `${process.env.NEXT_PUBLIC_API_URL}/api/documents/upload`;

            const formData = new FormData();

            if (isMulti) {

                uploadFiles.forEach(f => {
                    formData.append("files", f.file);
                });

            } else {

                formData.append("file", uploadFiles[0].file);
            }

            if (currentFolderId !== "root") {

                formData.append("folderId", currentFolderId);
            }

            const { data } = await axios.post(
                endpoint,

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

                            const pct =
                                Math.round(
                                    (e.loaded / e.total) * 100
                                );

                            setUploadProgress(pct);
                        }
                    }
                }
            );

           setUploadFiles([]);

setShowUpload(false);

setStorageError(null);

// Show compression savings if any

if (
    !isMulti &&
    data?.compression?.wasCompressed
) {

    showToast.success(
        `✨ Uploaded! Saved ${data.compression.savings}% storage (${data.compression.savingsFormatted})`
    );

} else if (isMulti) {

    // Calculate total savings for bulk

    const totalSaved =
        data.uploaded?.reduce((sum, u) =>
            sum + ((u.originalSize || u.size) - u.size),
            0
        ) || 0;

    const totalOriginal =
        data.uploaded?.reduce((sum, u) =>
            sum + (u.originalSize || u.size),
            0
        ) || 0;

    const overallSavings =
        totalOriginal > 0
            ? Math.round((totalSaved / totalOriginal) * 100)
            : 0;

    if (overallSavings > 0) {

        showToast.success(
            `✨ ${uploadFiles.length} files uploaded! Saved ${overallSavings}% storage`
        );

    } else {

        showToast.success(
            `${uploadFiles.length} files uploaded!`
        );
    }

} else {

    showToast.success("File uploaded!");
}

fetchStorage();

loadVault();

        } catch (err) {

            if (err.response?.status === 413) {

                showToast.error(
                    "Storage quota exceeded!"
                );

            } else {

                showToast.error(
                    err.response?.data?.message ||
                    "Upload failed"
                );
            }

        } finally {

            setUploading(false);

            setUploadProgress(0);
        }
    };

    // =========================
    // SHARE MODAL
    // =========================

    const openShareModal = (doc) => {

        setShareDoc(doc);

        setShareSubject(doc.subject || "");

        setShareTopic(doc.topic || "");

        setShareDescription(doc.description || "");

        setShareSource(doc.source || "");

        setShareTags(doc.tags || []);

        setShareTagInput("");

        setShareError("");
    };

    const closeShareModal = () => {

        setShareDoc(null);

        setShareSubject("");

        setShareTopic("");

        setShareDescription("");

        setShareSource("");

        setShareTags([]);

        setShareTagInput("");

        setShareError("");
    };

    const addShareTag = () => {

        const t = shareTagInput.trim();

        if (t && !shareTags.includes(t) && shareTags.length < 10) {

            setShareTags([...shareTags, t]);

            setShareTagInput("");
        }
    };

    const removeShareTag = (t) => {

        setShareTags(shareTags.filter(x => x !== t));
    };

    const handlePublish = async () => {

        setShareError("");

        if (!shareSubject.trim()) {

            setShareError("Subject is required");

            return;
        }

        setSharing(true);

        try {

            const { data } = await axios.put(

                `${process.env.NEXT_PUBLIC_API_URL}/api/documents/${shareDoc._id}/publish`,

                {
                    subject: shareSubject.trim(),
                    topic: shareTopic.trim(),
                    description: shareDescription.trim(),
                    source: shareSource.trim(),
                    tags: shareTags
                },

                {
                    headers: {
                        Authorization:
                            `Bearer ${user.token}`
                    }
                }
            );

            setDocuments(prev =>
                prev.map(d =>
                    d._id === shareDoc._id
                        ? data.document
                        : d
                )
            );

            closeShareModal();

            showToast.success("Shared with community!");

        } catch (err) {

            setShareError(
                err.response?.data?.message ||
                "Failed to share"
            );

        } finally {

            setSharing(false);
        }
    };

    const handleUnpublish = async (id) => {

        const confirmed = await confirmAction({
            title: "Make this file private?",
            message: "It will be removed from Community Library.",
            type: "warning",
            confirmText: "Make Private",
            cancelText: "Keep Public"
        });

        if (!confirmed) return;

        try {

            const { data } = await axios.put(

                `${process.env.NEXT_PUBLIC_API_URL}/api/documents/${id}/unpublish`,

                {},

                {
                    headers: {
                        Authorization:
                            `Bearer ${user.token}`
                    }
                }
            );

            setDocuments(prev =>
                prev.map(d =>
                    d._id === id
                        ? data.document
                        : d
                )
            );

            showToast.success("File is now private");

        } catch (err) {

            showToast.error("Failed to update");
        }
    };

    const handleVisibilityToggle = (doc) => {

        if (doc.visibility === "public") {
            handleUnpublish(doc._id);
        } else {
            openShareModal(doc);
        }
    };

    // =========================
    // DELETE FOLDER
    // =========================

    const deleteFolder = async (id, name) => {

        const confirmed = await confirmAction({
            title: `Delete "${name}"?`,
            message: "This permanently deletes the folder and all files inside.",
            type: "danger",
            confirmText: "Delete Forever",
            cancelText: "Keep"
        });

        if (!confirmed) return;

        try {

            await axios.delete(

                `${process.env.NEXT_PUBLIC_API_URL}/api/folders/${id}`,

                {
                    headers: {
                        Authorization:
                            `Bearer ${user.token}`
                    }
                }
            );

            setActiveMenu(null);

            showToast.success("Folder deleted");

            loadVault();

            fetchStorage();

        } catch (err) {

            showToast.error("Failed to delete folder");
        }
    };

    // =========================
    // DELETE DOCUMENT
    // =========================

    const deleteDocument = async (id, title) => {

        const confirmed = await confirmAction({
            title: `Delete "${title}"?`,
            message: "This action cannot be undone.",
            type: "danger",
            confirmText: "Delete",
            cancelText: "Cancel"
        });

        if (!confirmed) return;

        try {

            await axios.delete(

                `${process.env.NEXT_PUBLIC_API_URL}/api/documents/${id}`,

                {
                    headers: {
                        Authorization:
                            `Bearer ${user.token}`
                    }
                }
            );

            setActiveMenu(null);

            showToast.success("File deleted");

            loadVault();

            fetchStorage();

        } catch (err) {

            showToast.error("Failed to delete");
        }
    };

    // =========================
    // RENAME
    // =========================

    const handleRename = async () => {

        if (!renameValue.trim() || !renameTarget) return;

        try {

            const isFolder = renameTarget.type === "folder";

            const endpoint = isFolder

                ? `${process.env.NEXT_PUBLIC_API_URL}/api/folders/${renameTarget._id}/rename`

                : `${process.env.NEXT_PUBLIC_API_URL}/api/documents/${renameTarget._id}`;

            const payload = isFolder

                ? { name: renameValue.trim() }

                : { title: renameValue.trim() };

            await axios.put(
                endpoint,
                payload,
                {
                    headers: {
                        Authorization:
                            `Bearer ${user.token}`
                    }
                }
            );

            setRenameTarget(null);

            setRenameValue("");

            showToast.success("Renamed successfully");

            loadVault();

        } catch (err) {

            showToast.error(
                err.response?.data?.message ||
                "Rename failed"
            );
        }
    };

    // =========================
    // OPEN VIEWER
    // =========================

    const openViewer = async (doc) => {

        const loadingToast = showToast.loading("Loading document...");

        try {

            const { data } = await axios.get(

                `${process.env.NEXT_PUBLIC_API_URL}/api/documents/${doc._id}/view-url`,

                {
                    headers: {
                        Authorization:
                            `Bearer ${user.token}`
                    }
                }
            );

            showToast.dismiss(loadingToast);

            setViewUrl(data.viewUrl);

            setWatermark(data.watermark);

            setViewingDoc(doc);

        } catch (err) {

            showToast.dismiss(loadingToast);

            showToast.error("Failed to load document");
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

    const getFileIcon = (fileType, size = 28) => {

        switch (fileType) {

            case "pdf":
                return <FileText className="text-red-500" size={size} />;

            case "image":
                return <ImageIcon className="text-blue-500" size={size} />;

            case "doc":
                return <FileText className="text-blue-600" size={size} />;

            case "ppt":
                return <FileText className="text-orange-500" size={size} />;

            default:
                return <File className="text-brand-muted" size={size} />;
        }
    };

    const filteredFolders =
        search
            ? folders.filter(f =>
                f.name.toLowerCase().includes(
                    search.toLowerCase()
                )
            )
            : folders;

    const filteredDocs =
        search
            ? documents.filter(d =>
                d.title.toLowerCase().includes(
                    search.toLowerCase()
                )
            )
            : documents;

    const totalUploadSize =
        uploadFiles.reduce(
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

                <main className="flex-1 p-3 sm:p-6 lg:p-10 max-w-[1600px] w-full mx-auto">

                    {/* HEADER */}

                    <PageHeader
                        icon={FolderOpen}
                        iconBg="bg-green-500/10"
                        iconColor="text-green-600"
                        title="My Vault"
                        description="Upload files. Click 🌍 anytime to share with community."
                    />

                    {/* BREADCRUMBS */}

                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-4 sm:mb-6 text-xs sm:text-sm font-bold overflow-x-auto">

                        <Link
                            href="/vault"
                            className="flex items-center gap-1.5 text-brand-muted hover:text-brand-dark transition-all shrink-0"
                        >
                            <Home size={14} />
                            <span className="hidden sm:inline">My Vault</span>
                            <span className="sm:hidden">Vault</span>
                        </Link>

                        {breadcrumbs.map((b) => (

                            <div key={b._id} className="flex items-center gap-1.5 sm:gap-2 shrink-0">

                                <ChevronRight size={12} className="text-brand-muted" />

                                <Link
                                    href={`/vault/${b._id}`}
                                    className="text-brand-muted hover:text-brand-dark transition-all truncate max-w-[100px] sm:max-w-none"
                                >
                                    {b.name}
                                </Link>

                            </div>
                        ))}

                        {currentFolder && (

                            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

                                <ChevronRight size={12} className="text-brand-muted" />

                                <span className="text-brand-dark truncate max-w-[120px] sm:max-w-none">
                                    {currentFolder.name}
                                </span>

                            </div>
                        )}

                    </div>

                    {/* SEARCH + ACTIONS */}

                    <div className="bg-white rounded-2xl sm:rounded-3xl border border-brand-border p-3 sm:p-4 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 flex-wrap">

                        <div className="flex items-center gap-2 flex-1 min-w-[120px]">

                            <Search size={16} className="text-brand-muted shrink-0" />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search..."
                                className="bg-transparent outline-none text-sm font-bold flex-1 min-w-0"
                            />

                        </div>

                        <button
                            onClick={() => setShowNewFolder(true)}
                            className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 bg-brand-light text-brand-dark rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-brand-accent hover:text-white transition-all"
                            title="New Folder"
                        >
                            <FolderPlus size={14} />
                            <span className="hidden sm:inline">New Folder</span>
                            <span className="sm:hidden">Folder</span>
                        </button>

                        <button
                            onClick={() => setShowUpload(true)}
                            className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 bg-brand-dark text-white rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-brand-accent transition-all"
                        >
                            <Upload size={14} />
                            Upload
                        </button>

                    </div>

                    {/* CONTENT */}

                    {loading ? (

                        <GridSkeleton count={8} columns={4} />

                    ) : filteredFolders.length === 0 && filteredDocs.length === 0 ? (

                        <EmptyState
                            emoji="📂"
                            title={search ? "No matches found" : "This folder is empty"}
                            description={
                                search
                                    ? "Try different keywords"
                                    : "Upload files or create folders to organize them"
                            }
                            actionLabel={!search ? "Upload Files" : null}
                            onAction={() => setShowUpload(true)}
                            secondaryLabel={!search ? "New Folder" : null}
                            onSecondary={() => setShowNewFolder(true)}
                        />

                    ) : (

                        <div className="space-y-4 sm:space-y-6">

                            {/* FOLDERS */}

                            {filteredFolders.length > 0 && (

                                <div>

                                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2 sm:mb-3 px-1">

                                        Folders ({filteredFolders.length})

                                    </p>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">

                                        {filteredFolders.map((f) => (

                                            <motion.div
                                                key={f._id}
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-white border border-brand-border rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:border-brand-accent transition-all group relative"
                                            >

                                                <Link
                                                    href={`/vault/${f._id}`}
                                                    className="block"
                                                >

                                                    <div className="flex items-start justify-between mb-2 sm:mb-3">

                                                        <div className="text-2xl sm:text-3xl">

                                                            {f.icon || "📁"}

                                                        </div>

                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                setActiveMenu(
                                                                    activeMenu === f._id
                                                                        ? null
                                                                        : f._id
                                                                );
                                                            }}
                                                            className="p-2 -m-2 rounded-lg hover:bg-brand-light sm:opacity-0 sm:group-hover:opacity-100 transition-all"
                                                            aria-label="More options"
                                                        >
                                                            <MoreVertical size={14} className="text-brand-muted" />
                                                        </button>

                                                    </div>

                                                    <p className="font-black text-xs sm:text-sm text-brand-dark truncate mb-1">

                                                        {f.name}

                                                    </p>

                                                    <p className="text-[9px] sm:text-[10px] font-bold text-brand-muted">

                                                        {f.fileCount} files

                                                        {f.totalSize > 0 && ` • ${formatBytes(f.totalSize)}`}

                                                    </p>

                                                </Link>

                                                {activeMenu === f._id && (

                                                    <>

                                                        <div
                                                            className="fixed inset-0 z-30"
                                                            onClick={() => setActiveMenu(null)}
                                                        />

                                                        <motion.div
                                                            initial={{ opacity: 0, y: -5 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="absolute right-2 top-10 bg-white rounded-xl border border-brand-border shadow-xl z-40 overflow-hidden min-w-[140px]"
                                                        >

                                                            <button
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    setRenameTarget({ ...f, type: "folder" });
                                                                    setRenameValue(f.name);
                                                                    setActiveMenu(null);
                                                                }}
                                                                className="w-full flex items-center gap-2 px-4 py-3 text-xs font-bold text-brand-dark hover:bg-brand-light text-left"
                                                            >
                                                                <Edit3 size={12} />
                                                                Rename
                                                            </button>

                                                            <button
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    deleteFolder(f._id, f.name);
                                                                }}
                                                                className="w-full flex items-center gap-2 px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50 text-left"
                                                            >
                                                                <Trash2 size={12} />
                                                                Delete
                                                            </button>

                                                        </motion.div>

                                                    </>
                                                )}

                                            </motion.div>
                                        ))}

                                    </div>

                                </div>
                            )}

                            {/* DOCUMENTS */}

                            {filteredDocs.length > 0 && (

                                <div>

                                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2 sm:mb-3 px-1">

                                        Files ({filteredDocs.length})

                                    </p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">

                                        {filteredDocs.map((d) => (

                                            <motion.div
                                                key={d._id}
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-white border border-brand-border rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:border-brand-accent transition-all group relative"
                                            >

                                                <div className="flex items-start justify-between mb-3">

                                                    <div className="flex items-center gap-2 flex-wrap">

                                                        {getFileIcon(d.fileType, 24)}

                                                        {d.visibility === "public" && (

                                                            <span
                                                                title="Shared in Community"
                                                                className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1"
                                                            >
                                                                <Globe size={9} />
                                                                Public
                                                            </span>
                                                        )}

                                                        {d.isFeatured && (

                                                            <span
                                                                title="Featured"
                                                                className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1"
                                                            >
                                                                <Sparkles size={9} />
                                                                Featured
                                                            </span>
                                                        )}

                                                    </div>

                                                    <button
                                                        onClick={() =>
                                                            setActiveMenu(
                                                                activeMenu === d._id
                                                                    ? null
                                                                    : d._id
                                                            )
                                                        }
                                                        className="p-2 -m-2 rounded-lg hover:bg-brand-light sm:opacity-0 sm:group-hover:opacity-100 transition-all"
                                                        aria-label="More options"
                                                    >
                                                        <MoreVertical size={14} className="text-brand-muted" />
                                                    </button>

                                                </div>

                                                <p className="font-black text-xs sm:text-sm text-brand-dark truncate mb-1">

                                                    {d.title}

                                                </p>

                                                <p className="text-[9px] sm:text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-3">

                                                    {d.fileType} • {formatBytes(d.fileSize)}

                                                </p>

                                                {d.visibility === "public" && d.subject && (

                                                    <div className="flex gap-1 mb-3 flex-wrap">

                                                        <span className="text-[9px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                                                            {d.subject}
                                                        </span>

                                                        {d.topic && (
                                                            <span className="text-[9px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                                                                {d.topic}
                                                            </span>
                                                        )}

                                                    </div>
                                                )}

                                                <div className="flex gap-1.5 sm:gap-2">

                                                    <button
                                                        onClick={() => openViewer(d)}
                                                        className="flex-1 flex items-center justify-center gap-1.5 px-2 sm:px-3 py-2 bg-brand-light hover:bg-brand-dark hover:text-white text-brand-dark rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all"
                                                    >
                                                        <Eye size={11} />
                                                        Open
                                                    </button>

                                                    <button
                                                        onClick={() => handleVisibilityToggle(d)}
                                                        title={d.visibility === "public" ? "Make Private" : "Share Publicly"}
                                                        className={`px-3 py-2 rounded-xl text-xs font-black transition-all ${
                                                            d.visibility === "public"
                                                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                                : "bg-brand-light text-brand-muted hover:bg-brand-accent hover:text-white"
                                                        }`}
                                                    >
                                                        {d.visibility === "public" ? (
                                                            <Globe size={14} />
                                                        ) : (
                                                            <Lock size={14} />
                                                        )}
                                                    </button>

                                                </div>

                                                {activeMenu === d._id && (

                                                    <>

                                                        <div
                                                            className="fixed inset-0 z-30"
                                                            onClick={() => setActiveMenu(null)}
                                                        />

                                                        <motion.div
                                                            initial={{ opacity: 0, y: -5 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="absolute right-2 top-10 bg-white rounded-xl border border-brand-border shadow-xl z-40 overflow-hidden min-w-[160px]"
                                                        >

                                                            <button
                                                                onClick={() => {
                                                                    setRenameTarget({ ...d, type: "doc" });
                                                                    setRenameValue(d.title);
                                                                    setActiveMenu(null);
                                                                }}
                                                                className="w-full flex items-center gap-2 px-4 py-3 text-xs font-bold text-brand-dark hover:bg-brand-light text-left"
                                                            >
                                                                <Edit3 size={12} />
                                                                Rename
                                                            </button>

                                                            <button
                                                                onClick={() => {
                                                                    handleVisibilityToggle(d);
                                                                    setActiveMenu(null);
                                                                }}
                                                                className="w-full flex items-center gap-2 px-4 py-3 text-xs font-bold text-brand-dark hover:bg-brand-light text-left"
                                                            >
                                                                {d.visibility === "public" ? (
                                                                    <>
                                                                        <Lock size={12} />
                                                                        Make Private
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Globe size={12} />
                                                                        Share Public
                                                                    </>
                                                                )}
                                                            </button>

                                                            <button
                                                                onClick={() => deleteDocument(d._id, d.title)}
                                                                className="w-full flex items-center gap-2 px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50 text-left"
                                                            >
                                                                <Trash2 size={12} />
                                                                Delete
                                                            </button>

                                                        </motion.div>

                                                    </>
                                                )}

                                            </motion.div>
                                        ))}

                                    </div>

                                </div>
                            )}

                        </div>
                    )}

                </main>

                <Footer />

            </div>

            {/* NEW FOLDER MODAL */}

            <AnimatePresence>

                {showNewFolder && (

                    <div className="fixed inset-0 bg-brand-dark/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6">

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white w-full max-w-md rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl relative"
                        >

                            <button
                                onClick={() => {
                                    setShowNewFolder(false);
                                    setNewFolderName("");
                                }}
                                className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 hover:bg-brand-light rounded-xl text-brand-muted"
                            >
                                <X size={18} />
                            </button>

                            <h2 className="text-xl sm:text-2xl font-black mb-2">New Folder</h2>

                            <p className="text-brand-muted text-xs sm:text-sm mb-4 sm:mb-6 font-medium">
                                Create in {currentFolder?.name || "My Vault"}
                            </p>

                            <input
                                type="text"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleCreateFolder();
                                }}
                                placeholder="Folder name..."
                                autoFocus
                                className="w-full p-3 sm:p-4 bg-brand-light border border-brand-border rounded-xl sm:rounded-2xl font-bold outline-none focus:border-brand-accent transition-all text-sm"
                            />

                            <button
                                onClick={handleCreateFolder}
                                disabled={creating || !newFolderName.trim()}
                                className="w-full mt-4 bg-brand-dark text-white py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-xs sm:text-sm hover:bg-brand-accent transition-all disabled:opacity-50"
                            >
                                {creating ? "Creating..." : "Create Folder"}
                            </button>

                        </motion.div>

                    </div>
                )}

            </AnimatePresence>

            {/* UPLOAD MODAL */}

            <AnimatePresence>

                {showUpload && (

                    <div className="fixed inset-0 bg-brand-dark/80 backdrop-blur-md z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">

                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white w-full max-w-lg rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl relative my-4"
                        >

                            <button
                                onClick={() => {
                                    setShowUpload(false);
                                    setUploadFiles([]);
                                    setStorageError(null);
                                }}
                                className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 hover:bg-brand-light rounded-xl text-brand-muted"
                            >
                                <X size={18} />
                            </button>

                            <h2 className="text-xl sm:text-2xl font-black mb-1">
                                Upload Files
                            </h2>

                            <p className="text-brand-muted text-xs sm:text-sm mb-4 sm:mb-6 font-medium">
                                Add files to {currentFolder?.name || "My Vault"}
                            </p>

                            {storageError && (
                                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 mb-4">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-black text-red-700 text-xs">Storage Quota Exceeded</p>
                                            <p className="text-[10px] text-red-600 font-bold mt-1">
                                                Total ({storageError.totalMB} MB) exceeds remaining ({storageError.remainingMB} MB)
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-brand-border hover:border-brand-accent rounded-xl sm:rounded-2xl p-5 sm:p-6 text-center cursor-pointer transition-all mb-4"
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.ppt,.pptx,.txt"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />

                                <div className="bg-brand-accent/10 w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl mx-auto flex items-center justify-center mb-3">
                                    {uploadFiles.length > 0 ? (
                                        <Files size={22} className="text-brand-accent" />
                                    ) : (
                                        <Upload size={22} className="text-brand-accent" />
                                    )}
                                </div>

                                <h3 className="font-black text-brand-dark text-xs sm:text-sm mb-1">
                                    {uploadFiles.length === 0
                                        ? "Click to choose files"
                                        : `${uploadFiles.length} file${uploadFiles.length === 1 ? "" : "s"} — Add more`}
                                </h3>

                                <p className="text-[10px] sm:text-xs text-brand-muted font-bold">
                                    {uploadFiles.length > 0
                                        ? `Total: ${formatBytes(totalUploadSize)} • Max 20 files`
                                        : "PDF, Images, Word, PPT — max 100 MB each"}
                                </p>

                                {storageInfo && uploadFiles.length === 0 && (
                                    <p className="text-[10px] text-brand-muted font-bold mt-2">
                                        💾 {storageInfo.remainingMB} MB available
                                    </p>
                                )}
                            </div>

                            {uploadFiles.length > 0 && (
                                <div className="bg-brand-light rounded-xl p-2 sm:p-3 mb-4 max-h-32 sm:max-h-40 overflow-y-auto space-y-1.5">
                                    {uploadFiles.map(f => (
                                        <div key={f.id} className="bg-white rounded-lg p-2 flex items-center gap-2 group">
                                            {getFileIcon(
                                                f.type?.includes("pdf") ? "pdf"
                                                    : f.type?.startsWith("image") ? "image"
                                                    : "other",
                                                14
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11px] font-black text-brand-dark truncate">{f.name}</p>
                                                <p className="text-[9px] font-bold text-brand-muted">{formatBytes(f.size)}</p>
                                            </div>
                                            <button
                                                onClick={() => removeFile(f.id)}
                                                className="text-brand-muted hover:text-red-500 p-1"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {uploading && (
                                <div className="mb-4">
                                    <div className="flex justify-between text-xs font-bold mb-2">
                                        <span>Uploading...</span>
                                        <span className="text-brand-accent">{uploadProgress}%</span>
                                    </div>
                                    <div className="w-full bg-brand-light h-2 rounded-full overflow-hidden">
                                        <motion.div
                                            animate={{ width: `${uploadProgress}%` }}
                                            className="h-full bg-brand-accent"
                                        />
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleUpload}
                                disabled={uploading || uploadFiles.length === 0}
                                className="w-full bg-brand-dark text-white py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-xs sm:text-sm hover:bg-brand-accent transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload size={14} />
                                        Upload {uploadFiles.length > 0 && `${uploadFiles.length}`}
                                        {totalUploadSize > 0 && ` (${formatBytes(totalUploadSize)})`}
                                    </>
                                )}
                            </button>

                            <p className="text-[10px] text-brand-muted font-bold text-center mt-3">
                                Files are private. Toggle 🌍 later to share.
                            </p>

                        </motion.div>

                    </div>
                )}

            </AnimatePresence>

            {/* SHARE TO COMMUNITY MODAL */}

            <AnimatePresence>

                {shareDoc && (

                    <div className="fixed inset-0 bg-brand-dark/80 backdrop-blur-md z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">

                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white w-full max-w-lg rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl relative my-4"
                        >

                            <button
                                onClick={closeShareModal}
                                className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 hover:bg-brand-light rounded-xl text-brand-muted"
                            >
                                <X size={18} />
                            </button>

                            <div className="flex items-center gap-2 mb-2">
                                <Globe size={18} className="text-blue-600" />
                                <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                                    Share with Community
                                </h2>
                            </div>

                            <p className="text-brand-muted text-xs sm:text-sm mb-5 font-medium leading-relaxed">
                                Help fellow aspirants by adding details about <strong className="text-brand-dark">{shareDoc.title}</strong>
                            </p>

                            <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2 flex items-center gap-1">
                                Subject <span className="text-red-500">*</span>
                            </label>

                            <input
                                type="text"
                                value={shareSubject}
                                onChange={(e) => {
                                    setShareSubject(e.target.value);
                                    setShareError("");
                                }}
                                placeholder="History, Polity, Economy..."
                                autoFocus
                                className={`w-full p-3 bg-brand-light border rounded-xl font-bold outline-none focus:border-brand-accent transition-all text-sm mb-4 ${
                                    shareError && !shareSubject.trim()
                                        ? "border-red-300"
                                        : "border-brand-border"
                                }`}
                            />

                            <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2 block">
                                Topic (Optional)
                            </label>

                            <input
                                type="text"
                                value={shareTopic}
                                onChange={(e) => setShareTopic(e.target.value)}
                                placeholder="Modern History..."
                                className="w-full p-3 bg-brand-light border border-brand-border rounded-xl font-bold outline-none focus:border-brand-accent transition-all text-sm mb-4"
                            />

                            <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2 block">
                                Description (Optional)
                            </label>

                            <textarea
                                value={shareDescription}
                                onChange={(e) => setShareDescription(e.target.value)}
                                placeholder="Brief description..."
                                rows={2}
                                className="w-full p-3 bg-brand-light border border-brand-border rounded-xl font-medium outline-none focus:border-brand-accent transition-all text-sm resize-none mb-4"
                            />

                            <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2 block">
                                Source (Optional)
                            </label>

                            <input
                                type="text"
                                value={shareSource}
                                onChange={(e) => setShareSource(e.target.value)}
                                placeholder="Vision IAS, Self, Vajiram..."
                                className="w-full p-3 bg-brand-light border border-brand-border rounded-xl font-bold outline-none focus:border-brand-accent transition-all text-sm mb-4"
                            />

                            <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2 block">
                                Tags (Optional, max 10)
                            </label>

                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={shareTagInput}
                                    onChange={(e) => setShareTagInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            addShareTag();
                                        }
                                    }}
                                    placeholder="Type tag and Enter..."
                                    className="flex-1 p-3 bg-brand-light border border-brand-border rounded-xl font-bold outline-none focus:border-brand-accent transition-all text-sm"
                                />
                                <button
                                    onClick={addShareTag}
                                    className="px-4 bg-brand-dark text-white rounded-xl hover:bg-brand-accent transition-all"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>

                            {shareTags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {shareTags.map(t => (
                                        <span key={t} className="inline-flex items-center gap-1 px-3 py-1 bg-brand-light text-brand-dark text-xs font-bold rounded-full">
                                            {t}
                                            <button onClick={() => removeShareTag(t)} className="hover:text-red-500">
                                                <X size={11} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}

                            {shareError && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 flex items-center gap-2">
                                    <AlertCircle size={14} className="text-red-500 shrink-0" />
                                    <p className="text-xs font-black text-red-700">{shareError}</p>
                                </div>
                            )}

                            <button
                                onClick={handlePublish}
                                disabled={sharing || !shareSubject.trim()}
                                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-xs sm:text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {sharing ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin" />
                                        Sharing...
                                    </>
                                ) : (
                                    <>
                                        <Globe size={14} />
                                        Share with Community
                                    </>
                                )}
                            </button>

                        </motion.div>

                    </div>
                )}

            </AnimatePresence>

            {/* RENAME MODAL */}

            <AnimatePresence>

                {renameTarget && (

                    <div className="fixed inset-0 bg-brand-dark/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6">

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white w-full max-w-md rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl relative"
                        >

                            <button
                                onClick={() => {
                                    setRenameTarget(null);
                                    setRenameValue("");
                                }}
                                className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 hover:bg-brand-light rounded-xl text-brand-muted"
                            >
                                <X size={18} />
                            </button>

                            <h2 className="text-xl sm:text-2xl font-black mb-4">
                                Rename {renameTarget.type === "folder" ? "Folder" : "File"}
                            </h2>

                            <input
                                type="text"
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleRename();
                                }}
                                autoFocus
                                className="w-full p-3 sm:p-4 bg-brand-light border border-brand-border rounded-xl sm:rounded-2xl font-bold outline-none focus:border-brand-accent transition-all text-sm"
                            />

                            <button
                                onClick={handleRename}
                                disabled={!renameValue.trim()}
                                className="w-full mt-4 bg-brand-dark text-white py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-xs sm:text-sm hover:bg-brand-accent transition-all disabled:opacity-50"
                            >
                                Save
                            </button>

                        </motion.div>

                    </div>
                )}

            </AnimatePresence>

            {/* PDF VIEWER */}

            <AnimatePresence>

                {viewingDoc && (

                    <div className="fixed inset-0 bg-brand-dark/95 z-[100] flex flex-col p-3 sm:p-4 lg:p-8">

                        <div className="flex items-center justify-between mb-3 sm:mb-4">

                            <div className="text-white flex-1 min-w-0 mr-3">

                                <p className="text-[10px] sm:text-xs font-bold opacity-60 uppercase tracking-widest">
                                    Viewing
                                </p>

                                <p className="font-black text-sm sm:text-lg truncate">
                                    {viewingDoc.title}
                                </p>

                            </div>

                            <button
                                onClick={() => {
                                    setViewingDoc(null);
                                    setViewUrl(null);
                                    setWatermark(null);
                                }}
                                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all shrink-0"
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <div className="flex-1 overflow-hidden">

                            {viewingDoc.fileType === "pdf" ? (

                                <SecurePDFViewer
                                    fileUrl={viewUrl}
                                    watermark={watermark}
                                />

                            ) : viewingDoc.fileType === "image" ? (

                                <div className="h-full flex items-center justify-center relative overflow-hidden bg-white rounded-2xl">

                                    {watermark && (
                                        <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center overflow-hidden">
                                            <div
                                                className="text-brand-dark opacity-[0.06] font-black tracking-tight whitespace-nowrap"
                                                style={{
                                                    fontSize: "80px",
                                                    transform: "rotate(-30deg)"
                                                }}
                                            >
                                                PrepOS • {watermark.userEmail}
                                            </div>
                                        </div>
                                    )}

                                    <img
                                        src={viewUrl}
                                        alt={viewingDoc.title}
                                        className="max-h-full max-w-full object-contain select-none pointer-events-none"
                                        draggable={false}
                                        onContextMenu={(e) => e.preventDefault()}
                                    />
                                </div>

                            ) : (

                                <div className="h-full bg-white rounded-2xl flex items-center justify-center">
                                    <div className="text-center">
                                        <File size={48} className="text-brand-muted mx-auto mb-4" />
                                        <p className="font-black text-brand-dark mb-2">
                                            Preview not available
                                        </p>
                                    </div>
                                </div>
                            )}

                        </div>

                    </div>
                )}

            </AnimatePresence>

        </div>
    );
}