"use client";

import { toDBFormat, mapImportedQuestion } from "@/lib/importMapper";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileText, Wand2, Save, Trash2, CheckCircle, FileUp,
    Loader2, ArrowLeft, AlertTriangle, Download, RotateCcw,
    Brain, Image, Type, Upload, X, Sparkles, ChevronDown
} from "lucide-react";
import axios from "axios";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import TopHeader from "@/components/layout/TopHeader";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import { showToast } from "@/components/ui/Toast";
import { confirmAction } from "@/components/ui/ConfirmModal";

// ─── CONSTANTS ───

const FILTER_TABS = ["All", "Pending", "Approved", "Rejected", "Malformed"];

const WARNING_LABELS = {
    MISSING_QUESTION_TEXT: "No question text",
    INCOMPLETE_OPTIONS: "< 4 options",
    MISSING_ANSWER: "No correct answer",
    MISSING_YEAR: "No year",
};

const METHODS = [
    { id: "json", label: "Upload JSON", icon: FileUp, desc: "Upload pre-formatted JSON file" },
    { id: "text", label: "AI Text Extract", icon: Type, desc: "Paste raw text → AI structures it" },
    { id: "vision", label: "AI PDF Vision", icon: Image, desc: "Upload PDF images → AI extracts" },
];

// ─── HELPERS ───

function countByStatus(questions) {
    return FILTER_TABS.reduce((acc, f) => {
        if (f === "All") acc[f] = questions.length;
        else if (f === "Malformed") acc[f] = questions.filter(q => q.isMalformed).length;
        else acc[f] = questions.filter(q => q.reviewStatus === f).length;
        return acc;
    }, {});
}

function validateQuestion(q) {
    const w = [];
    if (!q.questionText?.trim()) w.push("MISSING_QUESTION_TEXT");
    if (!q.options || q.options.length < 4) w.push("INCOMPLETE_OPTIONS");
    if (!q.correctOption) w.push("MISSING_ANSWER");
    if (!q.year) w.push("MISSING_YEAR");
    return w;
}

// ─── MAIN COMPONENT ───

export default function BulkImporterLogic() {

    const [user, setUser] = useState(null);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    // Method
    const [activeMethod, setActiveMethod] = useState("json");

    // Questions
    const [parsedQuestions, setParsedQuestions] = useState([]);
    const [reviewFilter, setReviewFilter] = useState("All");
    const [selectedIdx, setSelectedIdx] = useState(0);

    // States
    const [extracting, setExtracting] = useState(false);
    const [extractProgress, setExtractProgress] = useState("");
    const [saving, setSaving] = useState(false);

    // Text method
    const [rawText, setRawText] = useState("");

    // Vision method
    const [pdfImages, setPdfImages] = useState([]);

    const listRef = useRef(null);
    const fileInputRef = useRef(null);

    // ─── AUTH ───

    useEffect(() => {
        const info = localStorage.getItem("userInfo");
        if (!info) { window.location.href = "/login"; return; }
        const parsed = JSON.parse(info);
        if (!parsed.isAdmin) {
            showToast.error("Admin access only");
            window.location.href = "/dashboard";
            return;
        }
        setUser(parsed);
    }, []);

    const counts = countByStatus(parsedQuestions);

    const visibleQuestions = parsedQuestions.filter(q => {
        if (reviewFilter === "All") return true;
        if (reviewFilter === "Malformed") return q.isMalformed;
        return q.reviewStatus === reviewFilter;
    });

    // ─── PROCESS AI RESPONSE ───

    const processAIResponse = (questions) => {
        return questions.map((q, i) => {
            const mapped = mapImportedQuestion(q);
            const warnings = validateQuestion(mapped);
            return {
                ...mapped,
                id: mapped.id || `ai_${Date.now()}_${i}`,
                parseWarnings: warnings,
                isMalformed: warnings.length > 0,
                reviewStatus: warnings.length ? "Pending" : "Approved"
            };
        });
    };

    // ─── METHOD 1: JSON UPLOAD ───

    const handleJsonUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setExtracting(true);
            setExtractProgress("Reading JSON...");

            const text = await file.text();
            const json = JSON.parse(text);
            const questions = Array.isArray(json) ? json : json.questions || [];
            const prepared = processAIResponse(questions);

            setParsedQuestions(prepared);
            setExtractProgress(`${prepared.length} questions loaded`);
            showToast.success(`${prepared.length} questions loaded from JSON`);

        } catch (err) {
            showToast.error("Invalid JSON: " + err.message);
        } finally {
            setExtracting(false);
        }
    };

    // ─── METHOD 2: AI TEXT EXTRACTION ───

    const handleTextExtract = async () => {
        if (!rawText.trim()) {
            showToast.warning("Please paste some text first");
            return;
        }

        setExtracting(true);
        setExtractProgress("🧠 AI is analyzing your text...");

        try {
            const { data } = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/vision/extract-text`,
                { text: rawText },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );

            if (!data.questions?.length) {
                showToast.error("AI couldn't find any questions in the text");
                return;
            }

            const prepared = processAIResponse(data.questions);
            setParsedQuestions(prev => [...prev, ...prepared]);

            const yearInfo = data.detectedYear ? ` (${data.detectedYear})` : "";
            const paperInfo = data.detectedPaper ? ` ${data.detectedPaper}` : "";

            setExtractProgress(`✅ ${prepared.length} questions extracted${yearInfo}${paperInfo}`);
            showToast.success(`${prepared.length} questions extracted by AI!`);

        } catch (err) {
            showToast.error(err.response?.data?.message || "AI extraction failed");
        } finally {
            setExtracting(false);
        }
    };

    // ─── METHOD 3: AI VISION (PDF IMAGES) ───

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const images = [];
        for (const file of files) {
            const reader = new FileReader();
            const dataUrl = await new Promise((resolve) => {
                reader.onload = () => resolve(reader.result);
                reader.readAsDataURL(file);
            });
            images.push({ pageNumber: images.length + 1, image: dataUrl });
        }
        setPdfImages(prev => [...prev, ...images]);
        showToast.info(`${images.length} images added. Click "Extract" when ready.`);
    };

    const handleVisionExtract = async () => {
        if (pdfImages.length === 0) {
            showToast.warning("Upload some images first");
            return;
        }

        setExtracting(true);
        setExtractProgress(`🧠 Processing ${pdfImages.length} pages...`);

        try {
            const { data } = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/vision/extract-pages`,
                { pages: pdfImages },
                {
                    headers: { Authorization: `Bearer ${user.token}` },
                    timeout: 120000
                }
            );

            if (!data.questions?.length) {
                showToast.error("AI couldn't extract questions from images");
                return;
            }

            const prepared = processAIResponse(data.questions);
            setParsedQuestions(prev => [...prev, ...prepared]);

            const yearInfo = data.detectedYear ? ` (${data.detectedYear})` : "";
            const paperInfo = data.detectedPaper ? ` ${data.detectedPaper}` : "";

            const msg = `✅ ${prepared.length} questions from ${data.successPages}/${data.totalPages} pages${yearInfo}${paperInfo}`;
            setExtractProgress(msg);
            showToast.success(msg);

            if (data.errors?.length) {
                showToast.warning(`${data.errors.length} pages had errors`);
            }

            setPdfImages([]);

        } catch (err) {
            showToast.error(err.response?.data?.message || "Vision extraction failed");
        } finally {
            setExtracting(false);
        }
    };

    // ─── FIELD UPDATERS ───

    const updateField = (idx, field, value) => {
        setParsedQuestions(prev => {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], [field]: value };
            return updated;
        });
    };

    const updateOption = (qIdx, optIdx, value) => {
        setParsedQuestions(prev => {
            const updated = [...prev];
            const opts = [...updated[qIdx].options];
            opts[optIdx] = { ...opts[optIdx], text: value };
            updated[qIdx] = { ...updated[qIdx], options: opts };
            return updated;
        });
    };

    const updateStatus = (idx, status) => updateField(idx, "reviewStatus", status);

    const deleteQuestion = async (idx) => {
        const confirmed = await confirmAction({
            title: "Delete question?",
            message: "Remove this question from the list.",
            type: "warning",
            confirmText: "Delete"
        });
        if (!confirmed) return;
        setParsedQuestions(prev => prev.filter((_, i) => i !== idx));
        setSelectedIdx(prev => Math.max(0, prev - 1));
    };

    // ─── BULK ACTIONS ───

    const approveValid = () => {
        setParsedQuestions(prev =>
            prev.map(q => ({
                ...q,
                reviewStatus: q.isMalformed ? q.reviewStatus : "Approved"
            }))
        );
        showToast.success("All valid questions approved");
    };

    const reset = async () => {
        const confirmed = await confirmAction({
            title: "Reset everything?",
            message: "Clear all extracted questions.",
            type: "warning"
        });
        if (!confirmed) return;
        setParsedQuestions([]);
        setRawText("");
        setPdfImages([]);
        setExtractProgress("");
    };

    const exportJSON = () => {
        const data = toDBFormat(parsedQuestions);
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `upsc_questions_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast.success("JSON exported");
    };

    // ─── UPLOAD APPROVED QUESTIONS TO DB (chunked, no 413 errors) ───

    const handleUploadToDB = async () => {
        const approved = parsedQuestions.filter(
            (q) => q.reviewStatus === "Approved" && !q.isMalformed
        );

        if (approved.length === 0) {
            showToast.warning("No approved questions to upload");
            return;
        }

        const confirmed = await confirmAction({
            title: `Upload ${approved.length} questions?`,
            message: "These will be saved to the question database.",
            type: "info",
            confirmText: "Upload",
        });
        if (!confirmed) return;

        const CHUNK_SIZE = 25;
        const dbReady = toDBFormat(approved);
        const total = dbReady.length;

        let totalInserted = 0;
        let totalSkipped = 0;
        const allSkippedDetails = [];

        setSaving(true);

        try {
            for (let i = 0; i < total; i += CHUNK_SIZE) {
                const chunk = dbReady.slice(i, i + CHUNK_SIZE);

                const { data } = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/questions/bulk`,
                    { questions: chunk },
                    { headers: { Authorization: `Bearer ${user.token}` } }
                );

                totalInserted += data.inserted || 0;
                totalSkipped += data.skipped || 0;

                if (data.skippedDetails?.length) {
                    allSkippedDetails.push(...data.skippedDetails);
                }

                const done = Math.min(i + CHUNK_SIZE, total);
                setExtractProgress(`Uploaded ${done} of ${total}...`);
            }

            // Final summary toast
            if (totalSkipped > 0) {
                showToast.success(
                    `✅ Inserted: ${totalInserted} · Skipped (duplicates): ${totalSkipped}`
                );
                console.warn(
                    "📋 Skipped questions details:",
                    allSkippedDetails
                );
            } else {
                showToast.success(
                    `✅ All ${totalInserted} questions uploaded!`
                );
            }

            // Clear after successful upload
            setParsedQuestions([]);
            setExtractProgress("");
        } catch (err) {
            showToast.error(
                "Upload failed: " +
                    (err.response?.data?.message || err.message)
            );
        } finally {
            setSaving(false);
        }
    };

    // ─── KEYBOARD SHORTCUTS ───

    useEffect(() => {
        const handler = (e) => {
            if (!parsedQuestions.length) return;
            const el = document.activeElement?.tagName;
            if (el === "TEXTAREA" || el === "INPUT" || el === "SELECT") return;
            if (e.key === "a") updateStatus(selectedIdx, "Approved");
            if (e.key === "r") updateStatus(selectedIdx, "Rejected");
            if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx(p => Math.min(p + 1, parsedQuestions.length - 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIdx(p => Math.max(p - 1, 0)); }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [parsedQuestions, selectedIdx]);

    if (!user) return null;

    // ─── RENDER ───

    return (
        <div className="min-h-screen bg-brand-light flex">
            <Sidebar isAdmin={user.isAdmin} />
            <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

            <div className="flex-1 flex flex-col min-h-screen min-w-0">
                <TopHeader user={user} onMenuClick={() => setMobileNavOpen(true)} />

                <main className="flex-1 p-3 sm:p-6 lg:p-10 max-w-[1600px] w-full mx-auto">

                    {/* HEADER */}
                    <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-brand-accent/10 p-3 rounded-2xl">
                                    <Sparkles className="text-brand-accent" size={24} />
                                </div>
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-brand-dark tracking-tighter">
                                    Question Importer
                                </h1>
                            </div>
                            <p className="text-brand-muted font-medium text-sm">
                                Upload JSON, paste text, or use AI vision to extract UPSC questions
                            </p>
                        </div>

                        {parsedQuestions.length > 0 && (
                            <div className="flex gap-2 shrink-0">
                                <button onClick={exportJSON} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black border border-brand-border hover:border-brand-accent text-brand-muted hover:text-brand-accent transition-all">
                                    <Download size={12} /> Export
                                </button>
                                <button onClick={reset} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black border border-brand-border hover:border-red-400 text-brand-muted hover:text-red-500 transition-all">
                                    <RotateCcw size={12} /> Reset
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* ═══════ LEFT: IMPORT METHODS ═══════ */}
                        <div className="space-y-4">

                            {/* METHOD TABS */}
                            <div className="bg-white rounded-2xl border border-brand-border p-3 flex gap-1">
                                {METHODS.map(m => {
                                    const Icon = m.icon;
                                    const isActive = activeMethod === m.id;
                                    return (
                                        <button
                                            key={m.id}
                                            onClick={() => setActiveMethod(m.id)}
                                            className={`flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                                                isActive
                                                    ? "bg-brand-dark text-white"
                                                    : "text-brand-muted hover:bg-brand-light"
                                            }`}
                                        >
                                            <Icon size={18} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{m.label}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* ═══ JSON METHOD ═══ */}
                            {activeMethod === "json" && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                    <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-dashed border-brand-border hover:border-brand-accent transition-all text-center relative group">
                                        <input
                                            type="file"
                                            accept=".json"
                                            onChange={handleJsonUpload}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <div className="flex flex-col items-center">
                                            <div className="bg-brand-accent/10 p-4 rounded-2xl mb-3 group-hover:scale-110 transition-transform">
                                                {extracting ? <Loader2 className="animate-spin text-brand-accent" size={28} /> : <FileUp className="text-brand-accent" size={28} />}
                                            </div>
                                            <h3 className="font-black text-brand-dark text-sm">{extracting ? "Processing..." : "Upload JSON File"}</h3>
                                            <p className="text-xs text-brand-muted font-medium mt-1">Supports any AI-generated JSON format</p>
                                        </div>
                                    </div>

                                    <div className="bg-brand-light rounded-2xl p-4 border border-brand-border">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2">💡 How to get JSON</p>
                                        <ol className="text-xs font-medium text-brand-dark space-y-1.5 list-decimal list-inside">
                                            <li>Give your UPSC PDF to ChatGPT/Claude/Gemini</li>
                                            <li>Ask: "Extract all MCQs as JSON with questionText, options, correctOption, explanation, year, subjectName, topicName"</li>
                                            <li>Copy the JSON output → save as .json file</li>
                                            <li>Upload here → review → save to database</li>
                                        </ol>
                                    </div>
                                </motion.div>
                            )}

                            {/* ═══ TEXT METHOD ═══ */}
                            {activeMethod === "text" && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

                                    <div className="bg-white rounded-2xl border border-brand-border p-5">

                                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4 flex items-start gap-2">
                                            <Brain size={14} className="text-blue-600 shrink-0 mt-0.5" />
                                            <p className="text-[10px] font-bold text-blue-900 leading-relaxed">
                                                <strong>AI auto-detects</strong> the year, paper (GS1/CSAT), subject, topic, correct answer, and difficulty from your text. Just paste and extract!
                                            </p>
                                        </div>

                                        <textarea
                                            value={rawText}
                                            onChange={(e) => setRawText(e.target.value)}
                                            placeholder={"Paste raw question text from PDF here...\n\nThe AI will automatically detect:\n• Exam year (2024, 2023, etc.)\n• Paper type (GS1 or CSAT)\n• Subject & topic\n• Correct answers\n\nJust paste the text and click Extract!"}
                                            className="w-full h-64 sm:h-80 p-4 bg-brand-light border border-brand-border rounded-2xl font-mono text-xs outline-none focus:border-brand-accent resize-none"
                                        />

                                        <div className="flex items-center justify-between mt-3">
                                            <p className="text-[10px] text-brand-muted font-bold">
                                                {rawText.length} chars · {rawText.split('\n').filter(l => l.trim()).length} lines
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleTextExtract}
                                        disabled={extracting || !rawText.trim()}
                                        className="w-full bg-gradient-to-r from-brand-accent to-purple-600 text-white p-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:opacity-90 transition-all disabled:opacity-30"
                                    >
                                        {extracting ? <Loader2 size={18} className="animate-spin" /> : <Brain size={18} />}
                                        {extracting ? "AI is analyzing..." : "Extract with Gemini AI"}
                                    </button>
                                </motion.div>
                            )}

                            {/* ═══ VISION METHOD ═══ */}
                            {activeMethod === "vision" && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

                                    <div className="bg-white rounded-2xl border border-brand-border p-5">

                                        <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 mb-4 flex items-start gap-2">
                                            <Wand2 size={14} className="text-orange-600 shrink-0 mt-0.5" />
                                            <p className="text-[10px] font-bold text-orange-900 leading-relaxed">
                                                <strong>Upload screenshots</strong> of UPSC question paper pages. AI will auto-detect year, paper type, subjects, correct answers, and everything else!
                                            </p>
                                        </div>

                                        <div className="bg-brand-light p-6 rounded-2xl border-2 border-dashed border-brand-border hover:border-brand-accent transition-all text-center relative group">
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handleImageUpload}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            <Image size={24} className="text-brand-muted mx-auto mb-2" />
                                            <p className="text-xs font-black text-brand-dark">{pdfImages.length > 0 ? `${pdfImages.length} images uploaded` : "Upload PDF page images"}</p>
                                            <p className="text-[10px] text-brand-muted font-medium mt-1">PNG, JPG — screenshot each page</p>
                                        </div>

                                        {pdfImages.length > 0 && (
                                            <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                                                {pdfImages.map((p, i) => (
                                                    <div key={i} className="relative shrink-0 w-16 h-20 rounded-lg overflow-hidden border border-brand-border">
                                                        <img src={p.image} alt={`Page ${i + 1}`} className="w-full h-full object-cover" />
                                                        <button
                                                            onClick={() => setPdfImages(prev => prev.filter((_, idx) => idx !== i))}
                                                            className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center"
                                                        >
                                                            <X size={8} />
                                                        </button>
                                                        <span className="absolute bottom-0.5 left-0.5 bg-black/60 text-white text-[8px] font-black px-1 rounded">{i + 1}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={handleVisionExtract}
                                        disabled={extracting || pdfImages.length === 0}
                                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:opacity-90 transition-all disabled:opacity-30"
                                    >
                                        {extracting ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
                                        {extracting ? extractProgress : `Extract from ${pdfImages.length} pages`}
                                    </button>
                                </motion.div>
                            )}

                            {/* PROGRESS */}
                            {extractProgress && !extracting && (
                                <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-center gap-3">
                                    <CheckCircle size={18} className="text-green-600 shrink-0" />
                                    <p className="text-xs font-bold text-green-800">{extractProgress}</p>
                                </div>
                            )}

                            {/* KEYBOARD HINTS */}
                            {parsedQuestions.length > 0 && (
                                <div className="bg-brand-dark/5 rounded-2xl p-4 text-[10px] font-bold text-brand-muted space-y-1">
                                    <p className="font-black text-brand-dark text-xs uppercase tracking-widest mb-2">⌨ Shortcuts</p>
                                    <p><kbd className="bg-white border border-brand-border px-1.5 py-0.5 rounded mr-1">A</kbd> Approve</p>
                                    <p><kbd className="bg-white border border-brand-border px-1.5 py-0.5 rounded mr-1">R</kbd> Reject</p>
                                    <p><kbd className="bg-white border border-brand-border px-1.5 py-0.5 rounded mr-1">↑↓</kbd> Navigate</p>
                                </div>
                            )}
                        </div>

                        {/* ═══════ RIGHT: REVIEW PANEL ═══════ */}
                        <div className="space-y-4">

                            {/* STATS BAR */}

                            {parsedQuestions.length > 0 && (

                                <div className="grid grid-cols-4 gap-2">

                                    <StatBadge
                                        label="Total"
                                        count={counts.All}
                                        color="bg-brand-light text-brand-dark border-brand-border"
                                    />

                                    <StatBadge
                                        label="Approved"
                                        count={counts.Approved}
                                        color="bg-green-50 text-green-700 border-green-200"
                                    />

                                    <StatBadge
                                        label="Pending"
                                        count={counts.Pending}
                                        color="bg-yellow-50 text-yellow-700 border-yellow-200"
                                    />

                                    <StatBadge
                                        label="Malformed"
                                        count={counts.Malformed}
                                        color="bg-red-50 text-red-700 border-red-200"
                                    />

                                </div>
                            )}

                            {/* FILTER + ACTIONS */}

                            <div className="flex flex-wrap items-center justify-between gap-2">

                                <div className="flex flex-wrap gap-1">

                                    {FILTER_TABS.map(f => (

                                        <button
                                            key={f}
                                            onClick={() => setReviewFilter(f)}
                                            className={`px-2.5 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${
                                                reviewFilter === f
                                                    ? "bg-brand-dark text-white"
                                                    : "bg-white border border-brand-border text-brand-muted hover:border-brand-accent"
                                            }`}
                                        >
                                            {f}
                                            {counts[f] > 0 && (
                                                <span className="ml-1 opacity-60">{counts[f]}</span>
                                            )}
                                        </button>
                                    ))}

                                </div>

                                {parsedQuestions.length > 0 && (

                                    <div className="flex gap-2 items-center">

                                        <button
                                            onClick={approveValid}
                                            className="text-[10px] font-black text-green-700 flex items-center gap-1 hover:underline"
                                        >
                                            <CheckCircle size={11} />
                                            Approve Valid
                                        </button>

                                        <span className="text-brand-border">|</span>

                                        <button
                                            onClick={handleUploadToDB}
                                            disabled={saving || counts.Approved === 0}
                                            className="text-[10px] font-black text-brand-accent flex items-center gap-1 hover:underline disabled:opacity-40"
                                        >
                                            {saving ? (
                                                <Loader2 size={11} className="animate-spin" />
                                            ) : (
                                                <Save size={11} />
                                            )}
                                            {saving ? "Saving..." : `Save ${counts.Approved} to DB`}
                                        </button>

                                    </div>
                                )}

                            </div>

                            {/* QUESTION CARDS */}

                            <div
                                ref={listRef}
                                className="max-h-[680px] overflow-y-auto pr-1 space-y-3 custom-scrollbar"
                            >

                                <AnimatePresence>

                                    {visibleQuestions.length === 0 ? (

                                        <motion.div
                                            key="empty"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="bg-white/40 border-2 border-dashed border-brand-border rounded-2xl p-16 text-center"
                                        >
                                            <div className="text-5xl mb-4 opacity-30">📋</div>
                                            <p className="text-brand-muted font-bold text-sm">
                                                {parsedQuestions.length === 0
                                                    ? "No questions yet. Use the left panel to import."
                                                    : `No ${reviewFilter.toLowerCase()} questions.`}
                                            </p>
                                        </motion.div>

                                    ) : (

                                        visibleQuestions.map((q, visIdx) => {

                                            const globalIdx = parsedQuestions.indexOf(q);
                                            const isSelected = globalIdx === selectedIdx;

                                            return (

                                                <QuestionCard
                                                    key={q.id}
                                                    q={q}
                                                    globalIdx={globalIdx}
                                                    isSelected={isSelected}
                                                    onSelect={() => setSelectedIdx(globalIdx)}
                                                    onDelete={() => deleteQuestion(globalIdx)}
                                                    onFieldChange={(field, value) => updateField(globalIdx, field, value)}
                                                    onOptionChange={(optIdx, value) => updateOption(globalIdx, optIdx, value)}
                                                    onStatusChange={(status) => updateStatus(globalIdx, status)}
                                                />
                                            );
                                        })
                                    )}

                                </AnimatePresence>

                            </div>

                        </div>

                    </div>

                </main>

                <Footer />

            </div>

        </div>
    );
}

// =========================
// STAT BADGE
// =========================

function StatBadge({ label, count, color }) {

    return (

        <div className={`rounded-xl border p-2 sm:p-3 text-center ${color}`}>

            <p className="text-lg sm:text-2xl font-black leading-none">
                {count}
            </p>

            <p className="text-[9px] font-black uppercase tracking-widest mt-0.5 opacity-70">
                {label}
            </p>

        </div>
    );
}

// =========================
// QUESTION CARD (Full Detail)
// =========================

function QuestionCard({
    q,
    globalIdx,
    isSelected,
    onSelect,
    onDelete,
    onFieldChange,
    onOptionChange,
    onStatusChange
}) {

    const [showExplanation, setShowExplanation] = useState(false);

    return (

        <motion.div
            data-question-card
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.15 }}
            onClick={onSelect}
            className={`bg-white rounded-2xl border shadow-sm group transition-all cursor-pointer ${
                isSelected
                    ? "border-brand-accent ring-2 ring-brand-accent/20"
                    : "border-brand-border hover:border-brand-accent/50"
            }`}
        >

            {/* ── CARD HEADER ── */}

            <div className="flex justify-between items-start p-4 pb-0">

                <div className="flex items-center gap-1.5 flex-wrap">

                    <span className="text-[10px] font-black text-brand-accent">
                        Q{globalIdx + 1}
                    </span>

                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${
                        q.reviewStatus === "Approved"
                            ? "bg-green-100 text-green-700"
                            : q.reviewStatus === "Rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                    }`}>
                        {q.reviewStatus}
                    </span>

                    {q.isMalformed && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-black bg-orange-100 text-orange-600 flex items-center gap-0.5">
                            <AlertTriangle size={8} /> Fix needed
                        </span>
                    )}

                    {q.correctOption && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-black bg-blue-50 text-blue-700">
                            Ans: {q.correctOption}
                        </span>
                    )}

                </div>

                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="text-brand-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                >
                    <Trash2 size={14} />
                </button>

            </div>

            {/* ── METADATA TAGS ── */}

            <div className="flex gap-1 px-4 mt-2 flex-wrap">

                {q.subject && (
                    <span className="text-[9px] px-2 py-0.5 bg-brand-accent/10 text-brand-accent rounded-full font-black">
                        {q.subject}
                    </span>
                )}

                {q.topic && (
                    <span className="text-[9px] px-2 py-0.5 bg-brand-light text-brand-muted rounded-full font-bold border border-brand-border">
                        {q.topic}
                    </span>
                )}

                {q.year && (
                    <span className="text-[9px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-bold">
                        {q.year}
                    </span>
                )}

                {q.paper && (
                    <span className="text-[9px] px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full font-bold">
                        {q.paper}
                    </span>
                )}

                {q.difficulty && (
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                        q.difficulty === "Hard" ? "bg-red-50 text-red-600" :
                        q.difficulty === "Medium" ? "bg-yellow-50 text-yellow-600" :
                        "bg-green-50 text-green-600"
                    }`}>
                        {q.difficulty}
                    </span>
                )}

            </div>

            {/* ── QUESTION TEXT ── */}

            <div className="px-4 mt-3">

                <label className="text-[9px] font-black uppercase tracking-widest text-brand-muted mb-1 block">
                    Question
                </label>

                <textarea
                    value={q.questionText}
                    onChange={(e) => onFieldChange("questionText", e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full bg-brand-light border border-brand-border rounded-xl p-3 text-xs font-bold text-brand-dark outline-none focus:border-brand-accent resize-none"
                    rows={3}
                />

            </div>

            {/* ── OPTIONS ── */}

            <div className="px-4 mt-3 grid grid-cols-2 gap-1.5">

                {(q.options || []).map((o, oi) => (

                    <div
                        key={o.label || oi}
                        className={`p-2.5 rounded-xl border transition-all ${
                            q.correctOption === o.label
                                ? "bg-green-50 border-green-300"
                                : "bg-brand-light border-brand-border"
                        }`}
                    >
                        <div className="flex items-center gap-1 mb-1">

                            <span className="text-[9px] font-black text-brand-accent">
                                ({o.label || String.fromCharCode(65 + oi)})
                            </span>

                            {q.correctOption === o.label && (
                                <CheckCircle size={10} className="text-green-600" />
                            )}

                        </div>

                        <textarea
                            value={o.text}
                            onChange={(e) => onOptionChange(oi, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full bg-transparent text-[10px] font-bold outline-none resize-none text-brand-dark"
                            rows={2}
                            placeholder={`Option ${o.label || String.fromCharCode(65 + oi)}`}
                        />

                    </div>
                ))}

            </div>

            {/* ── CONTROLS ROW ── */}

            <div className="px-4 mt-3 flex flex-wrap items-center gap-2">

                {/* Correct Answer */}

                <div className="flex items-center gap-1.5 bg-brand-light rounded-lg px-2 py-1.5 border border-brand-border">

                    <span className="text-[9px] font-black text-brand-muted">ANS:</span>

                    <select
                        value={q.correctOption || ""}
                        onChange={(e) => onFieldChange("correctOption", e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-transparent text-[10px] font-black text-brand-dark outline-none"
                    >
                        <option value="">?</option>
                        {["A", "B", "C", "D"].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>

                </div>

                {/* Year */}

                <input
                    type="number"
                    value={q.year || ""}
                    onChange={(e) => onFieldChange("year", parseInt(e.target.value) || null)}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-brand-light border border-brand-border rounded-lg px-2 py-1.5 text-[10px] font-bold outline-none focus:border-brand-accent w-16"
                    placeholder="Year"
                />

                {/* Paper */}

                <select
                    value={q.paper || "GS1"}
                    onChange={(e) => onFieldChange("paper", e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-brand-light border border-brand-border rounded-lg px-2 py-1.5 text-[10px] font-bold outline-none focus:border-brand-accent"
                >
                    <option value="GS1">GS1</option>
                    <option value="CSAT">CSAT</option>
                </select>

                {/* Difficulty */}

                <select
                    value={q.difficulty || "Medium"}
                    onChange={(e) => onFieldChange("difficulty", e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-brand-light border border-brand-border rounded-lg px-2 py-1.5 text-[10px] font-bold outline-none focus:border-brand-accent"
                >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                </select>

            </div>

            {/* ── SUBJECT / TOPIC ── */}

            <div className="px-4 mt-2 flex gap-2">

                <input
                    value={q.subject || ""}
                    onChange={(e) => onFieldChange("subject", e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-brand-light border border-brand-border rounded-lg px-2 py-1.5 text-[10px] font-bold outline-none focus:border-brand-accent flex-1 min-w-0"
                    placeholder="Subject"
                />

                <input
                    value={q.topic || ""}
                    onChange={(e) => onFieldChange("topic", e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-brand-light border border-brand-border rounded-lg px-2 py-1.5 text-[10px] font-bold outline-none focus:border-brand-accent flex-1 min-w-0"
                    placeholder="Topic"
                />

                <input
                    value={q.subTopic || ""}
                    onChange={(e) => onFieldChange("subTopic", e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-brand-light border border-brand-border rounded-lg px-2 py-1.5 text-[10px] font-bold outline-none focus:border-brand-accent flex-1 min-w-0"
                    placeholder="Subtopic"
                />

            </div>

            {/* ── EXPLANATION (TOGGLE) ── */}

            <div className="px-4 mt-3">

                <button
                    onClick={(e) => { e.stopPropagation(); setShowExplanation(!showExplanation); }}
                    className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-brand-muted hover:text-brand-dark transition-all"
                >
                    <ChevronDown
                        size={12}
                        className={`transition-transform ${showExplanation ? "rotate-180" : ""}`}
                    />
                    {showExplanation ? "Hide" : "Show"} Explanation
                </button>

                {showExplanation && (

                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2"
                    >

                        <textarea
                            value={q.explanation || ""}
                            onChange={(e) => onFieldChange("explanation", e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            placeholder="Add explanation for why this answer is correct..."
                            className="w-full bg-brand-light border border-brand-border rounded-xl p-3 text-[10px] text-brand-dark outline-none resize-none focus:border-brand-accent"
                            rows={3}
                        />

                    </motion.div>
                )}

            </div>

            {/* ── APPROVE / REJECT ── */}

            <div className="p-4 pt-3 flex gap-2 border-t border-brand-border mt-3">

                <button
                    onClick={(e) => { e.stopPropagation(); onStatusChange("Approved"); }}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-1 ${
                        q.reviewStatus === "Approved"
                            ? "bg-green-600 text-white"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                    }`}
                >
                    <CheckCircle size={11} />
                    Approve
                </button>

                <button
                    onClick={(e) => { e.stopPropagation(); onStatusChange("Rejected"); }}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-1 ${
                        q.reviewStatus === "Rejected"
                            ? "bg-red-600 text-white"
                            : "bg-red-100 text-red-700 hover:bg-red-200"
                    }`}
                >
                    <Trash2 size={11} />
                    Reject
                </button>

            </div>

            {/* ── WARNINGS ── */}

            {q.parseWarnings?.length > 0 && (

                <div className="px-4 pb-4 flex flex-wrap gap-1">

                    {q.parseWarnings.map((w, wi) => (

                        <span
                            key={wi}
                            className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-[8px] font-black flex items-center gap-0.5"
                        >
                            <AlertTriangle size={7} />
                            {WARNING_LABELS[w] || w}
                        </span>
                    ))}

                </div>
            )}

        </motion.div>
    );
}