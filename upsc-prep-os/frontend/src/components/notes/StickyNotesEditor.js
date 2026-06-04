// src/components/notes/StickyNotesEditor.js
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useRef, useState } from "react";
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Heading2,
    List,
    ListOrdered,
    Link as LinkIcon,
    Image as ImageIcon,
    Undo,
    Redo,
    X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function StickyNotesEditor({
    content,
    onChange,
    onImageUpload,
}) {
    const fileInputRef = useRef(null);
    const [linkModalOpen, setLinkModalOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bulletList: {
                    keepMarks: true,
                    keepAttributes: false,
                    HTMLAttributes: {
                        class: "list-disc pl-5 my-2 space-y-1",
                    },
                },
                orderedList: {
                    keepMarks: true,
                    keepAttributes: false,
                    HTMLAttributes: {
                        class: "list-decimal pl-5 my-2 space-y-1",
                    },
                },
                listItem: {
                    HTMLAttributes: {
                        class: "leading-relaxed",
                    },
                },
                heading: {
                    levels: [2],
                    HTMLAttributes: {
                        class: "text-lg font-black mt-2 mb-1",
                    },
                },
            }),
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-brand-accent underline cursor-pointer",
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: "rounded-xl my-2 max-w-full",
                },
            }),
            Placeholder.configure({
                placeholder: "Start writing your note...",
            }),
        ],
        content: content || "",
        editorProps: {
            attributes: {
                class:
                    "prose prose-sm max-w-none focus:outline-none min-h-[200px] px-4 py-3",
            },
        },
        onUpdate: ({ editor }) => {
            onChange?.(editor.getHTML());
        },
        // SSR-safe
        immediatelyRender: false,
    });

    // Sync external content changes (e.g. when switching notes)
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content || "", false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [content, editor]);

    if (!editor) return null;

    const openLinkModal = () => {
        const previousUrl = editor.getAttributes("link").href || "";
        setLinkUrl(previousUrl);
        setLinkModalOpen(true);
    };

    const applyLink = () => {
        if (!linkUrl) {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
        } else {
            editor
                .chain()
                .focus()
                .extendMarkRange("link")
                .setLink({ href: linkUrl, target: "_blank" })
                .run();
        }
        setLinkModalOpen(false);
        setLinkUrl("");
    };

    const handleImageClick = () => fileInputRef.current?.click();

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !onImageUpload) return;
        const url = await onImageUpload(file);
        if (url) editor.chain().focus().setImage({ src: url }).run();
        e.target.value = "";
    };

    const Btn = ({ active, onClick, children, title }) => (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`p-1.5 rounded-md transition-all ${
                active
                    ? "bg-brand-dark text-white"
                    : "text-brand-muted hover:bg-brand-light hover:text-brand-dark"
            }`}
        >
            {children}
        </button>
    );

    return (
        <>
            <div className="bg-white border border-brand-border rounded-2xl overflow-hidden focus-within:border-brand-accent focus-within:ring-2 focus-within:ring-brand-accent/20 transition-all">
                {/* TOOLBAR */}
                <div className="flex items-center gap-0.5 flex-wrap p-2 border-b border-brand-border bg-brand-light/50">
                    <Btn
                        active={editor.isActive("bold")}
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        title="Bold"
                    >
                        <Bold size={13} />
                    </Btn>
                    <Btn
                        active={editor.isActive("italic")}
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        title="Italic"
                    >
                        <Italic size={13} />
                    </Btn>
                    <Btn
                        active={editor.isActive("underline")}
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        title="Underline"
                    >
                        <UnderlineIcon size={13} />
                    </Btn>

                    <div className="w-px h-4 bg-brand-border mx-1" />

                    <Btn
                        active={editor.isActive("heading", { level: 2 })}
                        onClick={() =>
                            editor.chain().focus().toggleHeading({ level: 2 }).run()
                        }
                        title="Heading"
                    >
                        <Heading2 size={13} />
                    </Btn>
                    <Btn
                        active={editor.isActive("bulletList")}
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        title="Bullet list"
                    >
                        <List size={13} />
                    </Btn>
                    <Btn
                        active={editor.isActive("orderedList")}
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        title="Numbered list"
                    >
                        <ListOrdered size={13} />
                    </Btn>

                    <div className="w-px h-4 bg-brand-border mx-1" />

                    <Btn
                        active={editor.isActive("link")}
                        onClick={openLinkModal}
                        title="Insert link"
                    >
                        <LinkIcon size={13} />
                    </Btn>
                    <Btn onClick={handleImageClick} title="Insert image">
                        <ImageIcon size={13} />
                    </Btn>

                    <div className="flex-1" />

                    <Btn
                        onClick={() => editor.chain().focus().undo().run()}
                        title="Undo"
                    >
                        <Undo size={13} />
                    </Btn>
                    <Btn
                        onClick={() => editor.chain().focus().redo().run()}
                        title="Redo"
                    >
                        <Redo size={13} />
                    </Btn>
                </div>

                {/* EDITOR */}
                <EditorContent editor={editor} />

                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>

            {/* LINK MODAL */}
            <AnimatePresence>
                {linkModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-brand-dark/70 backdrop-blur-md z-[120] flex items-center justify-center p-4"
                        onClick={() => setLinkModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-black text-brand-dark flex items-center gap-2">
                                    <LinkIcon size={16} className="text-brand-accent" />
                                    {linkUrl ? "Edit Link" : "Insert Link"}
                                </h3>
                                <button
                                    onClick={() => setLinkModalOpen(false)}
                                    className="p-1.5 hover:bg-brand-light rounded-lg text-brand-muted"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
                                URL
                            </label>
                            <input
                                type="url"
                                autoFocus
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && applyLink()}
                                placeholder="https://example.com"
                                className="w-full mt-1.5 px-4 py-3 bg-brand-light border border-brand-border rounded-xl text-sm font-bold outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all"
                            />

                            <div className="flex gap-2 mt-5">
                                <button
                                    onClick={() => setLinkModalOpen(false)}
                                    className="flex-1 py-2.5 bg-brand-light text-brand-dark rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-border/50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={applyLink}
                                    className="flex-1 py-2.5 bg-brand-dark text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-accent transition-colors"
                                >
                                    {linkUrl ? "Apply" : "Remove Link"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}