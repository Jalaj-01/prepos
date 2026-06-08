"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Loader2, Plus } from "lucide-react";
import axios from "axios";
import { showToast } from "@/components/ui/Toast";

export default function QuestionImageGallery({
    images = [],
    onChange,
    token,
    compact = false,
    readOnly = false,
}) {
    const [uploading, setUploading] = useState(false);
    const [urlInputOpen, setUrlInputOpen] = useState(false);
    const [urlInput, setUrlInput] = useState("");
    const inputRef = useRef(null);

    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    const handleUpload = async (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        setUploading(true);
        const uploaded = [];

        try {
            for (const file of files) {
                const fd = new FormData();
                fd.append("image", file);

                const { data } = await axios.post(
                    `${baseUrl}/api/sticky-notes/upload-image`,
                    fd,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );

                if (data?.url) {
                    uploaded.push({
                        url: data.url,
                        caption: "",
                        cloudinaryId: data.cloudinaryId || null,
                        pageNumber: null,
                    });
                }
            }

            if (uploaded.length) {
                onChange?.([...(images || []), ...uploaded]);
                showToast.success(
                    `${uploaded.length} image${
                        uploaded.length > 1 ? "s" : ""
                    } uploaded`
                );
            }
        } catch (err) {
            showToast.error("Upload failed");
            console.error(err);
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = "";
        }
    };

    const removeImage = (idx) => {
        const next = images.filter((_, i) => i !== idx);
        onChange?.(next);
    };

    const updateCaption = (idx, caption) => {
        const next = [...images];
        next[idx] = { ...next[idx], caption };
        onChange?.(next);
    };

    const addByUrl = () => {
        const url = urlInput.trim();
        if (!url) {
            setUrlInputOpen(false);
            return;
        }
        onChange?.([
            ...(images || []),
            { url, caption: "", pageNumber: null },
        ]);
        setUrlInput("");
        setUrlInputOpen(false);
        showToast.success("Image added");
    };

    // ─── Read-only mode (Question Library / Practice) ───
    if (readOnly) {
        if (!images?.length) return null;
        return (
            <div
                className={`grid gap-2 ${
                    compact
                        ? "grid-cols-2 sm:grid-cols-3"
                        : "grid-cols-1 sm:grid-cols-2"
                }`}
            >
                {images.map((img, i) => (
                    <div
                        key={i}
                        className="relative rounded-xl overflow-hidden border border-brand-border bg-brand-light"
                    >
                        <img
                            src={img.url}
                            alt={img.caption || `Image ${i + 1}`}
                            className="w-full h-auto object-contain max-h-[400px]"
                            loading="lazy"
                            onError={(e) => {
                                e.target.style.display = "none";
                            }}
                        />
                        {img.caption && (
                            <p className="text-[10px] font-bold text-brand-muted p-2 bg-white border-t border-brand-border">
                                {img.caption}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        );
    }

    // ─── Editable mode (Admin) ───
    return (
        <div className="space-y-2">
            {/* Image grid */}
            {images?.length > 0 && (
                <div
                    className={`grid gap-2 ${
                        compact ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-3"
                    }`}
                >
                    <AnimatePresence>
                        {images.map((img, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="relative rounded-xl overflow-hidden border border-brand-border bg-brand-light group"
                            >
                                <img
                                    src={img.url}
                                    alt={img.caption || `Image ${i + 1}`}
                                    className="w-full h-24 object-cover"
                                    onError={(e) => {
                                        e.target.src =
                                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23fee2e2' width='100' height='100'/%3E%3Ctext x='50' y='55' font-size='10' text-anchor='middle' fill='%23ef4444'%3EBroken%3C/text%3E%3C/svg%3E";
                                    }}
                                />

                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeImage(i);
                                    }}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                    title="Remove"
                                >
                                    <X size={10} strokeWidth={3} />
                                </button>

                                {!compact && (
                                    <input
                                        type="text"
                                        value={img.caption || ""}
                                        onChange={(e) =>
                                            updateCaption(i, e.target.value)
                                        }
                                        onClick={(e) => e.stopPropagation()}
                                        placeholder="Caption..."
                                        className="w-full px-2 py-1 text-[10px] font-medium bg-white border-t border-brand-border outline-none focus:bg-brand-light"
                                    />
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* URL input (toggleable) */}
            {urlInputOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-1.5"
                    onClick={(e) => e.stopPropagation()}
                >
                    <input
                        type="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                addByUrl();
                            }
                            if (e.key === "Escape") {
                                setUrlInput("");
                                setUrlInputOpen(false);
                            }
                        }}
                        autoFocus
                        placeholder="https://example.com/image.jpg"
                        className="flex-1 px-3 py-2 bg-brand-light border border-brand-border rounded-xl text-xs font-medium outline-none focus:border-brand-accent"
                    />
                    <button
                        type="button"
                        onClick={addByUrl}
                        className="px-3 py-2 bg-brand-dark text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-accent transition-colors"
                    >
                        Add
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setUrlInput("");
                            setUrlInputOpen(false);
                        }}
                        className="px-3 py-2 bg-brand-light text-brand-muted rounded-xl hover:text-brand-dark transition-colors"
                    >
                        <X size={12} />
                    </button>
                </motion.div>
            )}

            {/* Upload buttons */}
            {!urlInputOpen && (
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        disabled={uploading}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-brand-light border-2 border-dashed border-brand-border rounded-xl text-[11px] font-black uppercase tracking-widest text-brand-muted hover:text-brand-dark hover:border-brand-accent transition-all disabled:opacity-50"
                    >
                        {uploading ? (
                            <Loader2 size={12} className="animate-spin" />
                        ) : (
                            <Upload size={12} />
                        )}
                        {uploading ? "Uploading..." : "Upload Image"}
                    </button>
                    <button
                        type="button"
                        onClick={() => setUrlInputOpen(true)}
                        disabled={uploading}
                        className="px-3 py-2 bg-brand-light border border-brand-border rounded-xl text-[11px] font-black uppercase tracking-widest text-brand-muted hover:text-brand-dark transition-all disabled:opacity-50"
                        title="Paste image URL"
                    >
                        <Plus size={12} />
                    </button>

                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleUpload}
                        className="hidden"
                    />
                </div>
            )}
        </div>
    );
}