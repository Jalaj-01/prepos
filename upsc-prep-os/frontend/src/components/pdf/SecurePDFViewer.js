"use client";

import { useEffect, useRef, useState } from "react";

import { Worker, Viewer } from "@react-pdf-viewer/core";

import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";

import "@react-pdf-viewer/core/lib/styles/index.css";

import "@react-pdf-viewer/default-layout/lib/styles/index.css";

import { Loader2, Shield } from "lucide-react";

export default function SecurePDFViewer({
    fileUrl,
    watermark
}) {

    const containerRef = useRef(null);

    const [pdfBlob, setPdfBlob] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState(null);

    // =========================
    // CONVERT URL TO BLOB
    // (Hides original URL from user)
    // =========================

    useEffect(() => {

        if (!fileUrl) return;

        const fetchPdf = async () => {

            try {

                setLoading(true);

                const res = await fetch(fileUrl);

                if (!res.ok) {

                    throw new Error(
                        "Failed to load PDF"
                    );
                }

                const blob = await res.blob();

                setPdfBlob(
                    URL.createObjectURL(blob)
                );

            } catch (err) {

                console.error(
                    "PDF Load Error:",
                    err
                );

                setError(err.message);

            } finally {

                setLoading(false);
            }
        };

        fetchPdf();

        return () => {

            if (pdfBlob) {

                URL.revokeObjectURL(pdfBlob);
            }
        };

    }, [fileUrl]);

    // =========================
    // ANTI-DOWNLOAD PROTECTION
    // =========================

    useEffect(() => {

        const container = containerRef.current;

        if (!container) return;

        // Block right-click

        const blockContext = (e) => {

            e.preventDefault();

            return false;
        };

        // Block keyboard shortcuts

        const blockKeys = (e) => {

            // Ctrl+S, Ctrl+P, Ctrl+A, Cmd+S, Cmd+P

            if (
                (e.ctrlKey || e.metaKey) &&

                ['s', 'p', 'a', 'u'].includes(
                    e.key.toLowerCase()
                )
            ) {

                e.preventDefault();

                alert(
                    "🔒 This action is disabled for protected documents."
                );

                return false;
            }

            // F12 - DevTools (warning only, can't truly block)

            if (e.key === 'F12') {

                e.preventDefault();
            }
        };

        // Block drag

        const blockDrag = (e) => {

            e.preventDefault();

            return false;
        };

        container.addEventListener(
            "contextmenu",
            blockContext
        );

        document.addEventListener(
            "keydown",
            blockKeys
        );

        container.addEventListener(
            "dragstart",
            blockDrag
        );

        return () => {

            container.removeEventListener(
                "contextmenu",
                blockContext
            );

            document.removeEventListener(
                "keydown",
                blockKeys
            );

            container.removeEventListener(
                "dragstart",
                blockDrag
            );
        };

    }, []);

    // =========================
    // PLUGIN: REMOVE DOWNLOAD/PRINT
    // =========================

    const layoutPlugin = defaultLayoutPlugin({

        sidebarTabs: () => [],

        toolbarPlugin: {

            // Remove dangerous buttons

            getFilePlugin: {

                fileNameGenerator: () => "protected.pdf"
            }
        },

        renderToolbar: (Toolbar) => (

            <Toolbar>

                {(slots) => {

                    const {

                        CurrentPageInput,

                        GoToNextPage,

                        GoToPreviousPage,

                        NumberOfPages,

                        ZoomIn,

                        ZoomOut,

                        Zoom

                    } = slots;

                    return (

                        <div className="flex items-center gap-2 w-full justify-center flex-wrap py-2">

                            <div className="flex items-center gap-1 bg-brand-light rounded-xl p-1">

                                <GoToPreviousPage />

                                <CurrentPageInput />

                                <span className="text-xs font-bold text-brand-muted px-2">

                                    / <NumberOfPages />

                                </span>

                                <GoToNextPage />

                            </div>

                            <div className="flex items-center gap-1 bg-brand-light rounded-xl p-1">

                                <ZoomOut />

                                <Zoom />

                                <ZoomIn />

                            </div>

                            <div className="flex items-center gap-1.5 bg-brand-dark text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">

                                <Shield size={12} />

                                Protected View

                            </div>

                        </div>
                    );
                }}

            </Toolbar>
        )
    });

    if (loading) {

        return (

            <div className="h-[80vh] bg-brand-light rounded-2xl flex items-center justify-center">

                <div className="flex items-center gap-3 text-brand-muted">

                    <Loader2 size={20} className="animate-spin" />

                    <span className="font-bold text-sm">

                        Loading secure viewer...

                    </span>

                </div>

            </div>
        );
    }

    if (error) {

        return (

            <div className="h-[80vh] bg-red-50 rounded-2xl flex items-center justify-center">

                <p className="text-red-600 font-bold">

                    Failed to load: {error}

                </p>

            </div>
        );
    }

    return (

        <div
            ref={containerRef}
            className="relative bg-white rounded-2xl border border-brand-border overflow-hidden select-none"
            style={{
                userSelect: "none",
                WebkitUserSelect: "none"
            }}
        >

            {/* WATERMARK OVERLAY */}

            {watermark && (

                <div
                    className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center overflow-hidden"
                    style={{
                        background: "transparent"
                    }}
                >

                    <div
                        className="text-brand-dark opacity-[0.04] font-black tracking-tight whitespace-nowrap"
                        style={{
                            fontSize: "100px",
                            transform: "rotate(-30deg)",
                            userSelect: "none"
                        }}
                    >

                        PrepOS • {watermark.userEmail}

                    </div>

                </div>
            )}

            {/* VIEWER */}

            {pdfBlob && (

                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">

                    <div style={{ height: "80vh" }}>

                        <Viewer
                            fileUrl={pdfBlob}
                            plugins={[layoutPlugin]}
                        />

                    </div>

                </Worker>
            )}

        </div>
    );
}