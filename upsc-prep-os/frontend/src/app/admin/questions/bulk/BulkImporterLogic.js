import { toDBFormat } from "@/lib/importMapper";
import { mapImportedQuestion } from "@/lib/importMapper";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Wand2,
  Save,
  Trash2,
  CheckCircle,
  FileUp,
  Loader2,
  ArrowLeft,
  AlertTriangle,
  Download,
  ChevronRight,
  ChevronLeft,
  Eye,
  RotateCcw,
} from "lucide-react";
import axios from "axios";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const FILTER_TABS = ["All", "Pending", "Approved", "Rejected", "Malformed"];

const WARNING_LABELS = {
  MISSING_QUESTION_TEXT: "No question text",
  INSUFFICIENT_OPTIONS: "< 2 options",
  INCOMPLETE_OPTIONS: "Incomplete options",
  MISSING_ANSWER: "No correct answer",
  MISSING_EXPLANATION: "No explanation",
  MISSING_YEAR: "No year",
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function countByStatus(questions) {
  return FILTER_TABS.reduce((acc, filter) => {
    if (filter === "All") {
      acc[filter] = questions.length;
    } else if (filter === "Malformed") {
      acc[filter] = questions.filter((q) => q.isMalformed).length;
    } else {
      acc[filter] = questions.filter((q) => q.reviewStatus === filter).length;
    }
    return acc;
  }, {});
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function BulkImporterLogic() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [rawText, setRawText] = useState("");
  const [parsedQuestions, setParsedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reviewFilter, setReviewFilter] = useState("All");
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);

  // Extraction states
  const [extractStatus, setExtractStatus] = useState(null);
  // null | 'extracting' | 'ocr' | 'parsing' | 'done' | 'error'
  const [extractProgress, setExtractProgress] = useState("");


  const listRef = useRef(null);

  // ── Derived ────────────────────────────────────────────────────────────────
  const counts = countByStatus(parsedQuestions);

  const visibleQuestions = parsedQuestions.filter((q) => {
    if (reviewFilter === "All") return true;
    if (reviewFilter === "Malformed") return q.isMalformed;
    return q.reviewStatus === reviewFilter;
  });

  const validateQuestion = (q) => {
  const warnings = [];

  if (!q.questionText?.trim())
    warnings.push("MISSING_QUESTION_TEXT");

  if (!q.options || q.options.length < 4)
    warnings.push("INCOMPLETE_OPTIONS");

  if (!q.correctOption)
    warnings.push("MISSING_ANSWER");

  if (!q.year)
    warnings.push("MISSING_YEAR");

  return warnings;
};

const handleJsonUpload = async (e) => {
  const file = e.target.files?.[0];

  if (!file) return;

  try {
    setExtractStatus("extracting");
    setExtractProgress("Loading JSON...");

    const text = await file.text();

    const json = JSON.parse(text);

    const questions =
      Array.isArray(json)
        ? json
        : json.questions || [];

    const prepared =
      questions.map((q, index) => {
        const mapped =
          mapImportedQuestion(q);

        const warnings =
          validateQuestion(mapped);

        return {
          ...mapped,

          id:
            mapped.id ||
            `json_${Date.now()}_${index}`,

          parseWarnings:
            warnings,

          isMalformed:
            warnings.length > 0,

          reviewStatus:
            warnings.length
              ? "Pending"
              : "Approved"
        };
      });

    setParsedQuestions(prepared);

    setExtractStatus("done");

    setExtractProgress(
      `${prepared.length} questions loaded`
    );
  } catch (err) {
    setExtractStatus("error");

    setExtractProgress(
      err.message
    );
  }
};
  
const handleParse = () => {
  alert(
    "Text extraction will be connected to GPT in the next phase."
  );
};


  // ── Field Updaters ─────────────────────────────────────────────────────────
  const updateField = (index, field, value) => {
    setParsedQuestions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const updateOption = (qIndex, optIndex, value) => {
    setParsedQuestions((prev) => {
      const updated = [...prev];
      const opts = [...updated[qIndex].options];
      opts[optIndex] = { ...opts[optIndex], text: value };
      updated[qIndex] = { ...updated[qIndex], options: opts };
      return updated;
    });
  };

  const updateStatus = (index, status) => updateField(index, "reviewStatus", status);

  const deleteQuestion = (index) => {
    setParsedQuestions((prev) => prev.filter((_, i) => i !== index));
    setSelectedQuestionIndex((prev) => Math.max(0, prev - 1));
  };

  // ── Bulk Actions ───────────────────────────────────────────────────────────
  const approveValid = () => {
    setParsedQuestions((prev) =>
      prev.map((q) => ({
        ...q,
        reviewStatus: q.isMalformed ? q.reviewStatus : "Approved",
      }))
    );
  };

  const rejectAll = () => {
    setParsedQuestions((prev) =>
      prev.map((q) => ({ ...q, reviewStatus: "Rejected" }))
    );
  };

  const reset = () => {
  setParsedQuestions([]);
  setExtractStatus(null);
  setExtractProgress("");
};

  // ── Export to JSON ─────────────────────────────────────────────────────────
  const exportJSON = () => {
    const data = toDBFormat(parsedQuestions);
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `upsc_questions_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Save to DB ─────────────────────────────────────────────────────────────
  const handleUploadToDB = async () => {
    const approved = parsedQuestions.filter(
      (q) => q.reviewStatus === "Approved" && !q.isMalformed
    );

    if (approved.length === 0) {
      alert("No approved questions to upload. Please approve some questions first.");
      return;
    }

    setLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      if (!userInfo.token) throw new Error("Not authenticated.");

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/questions/bulk`,
        { questions: toDBFormat(approved) },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );

      alert(`✅ Successfully uploaded ${approved.length} questions!`);
      reset();
    } catch (err) {
      console.error("[BulkImporter] DB upload error:", err);
      alert("Upload failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // ── Keyboard Shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (parsedQuestions.length === 0) return;
      // Don't hijack shortcuts when user is typing in a textarea/input
      if (
        document.activeElement.tagName === "TEXTAREA" ||
        document.activeElement.tagName === "INPUT" ||
        document.activeElement.tagName === "SELECT"
      )
        return;

      const idx = selectedQuestionIndex;

      if (e.key === "a") updateStatus(idx, "Approved");
      if (e.key === "r") updateStatus(idx, "Rejected");
      if (e.key === "Delete") deleteQuestion(idx);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedQuestionIndex((p) => Math.min(p + 1, parsedQuestions.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedQuestionIndex((p) => Math.max(p - 1, 0));
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [parsedQuestions, selectedQuestionIndex]);

  // ── Auto-scroll selected question into view ────────────────────────────────
  useEffect(() => {
    if (!listRef.current) return;
    const cards = listRef.current.querySelectorAll("[data-question-card]");
    if (cards[selectedQuestionIndex]) {
      cards[selectedQuestionIndex].scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [selectedQuestionIndex]);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-brand-light p-6 md:p-12">
      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <header className="mb-10">
          <Link
            href="/admin"
            className="flex items-center gap-2 text-brand-muted hover:text-brand-dark mb-4 font-bold text-sm transition-all"
          >
            <ArrowLeft size={16} />
            Back to Admin
          </Link>

          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-black text-brand-dark tracking-tight">
                Bulk Question Importer
              </h1>
              <p className="text-brand-muted font-medium mt-1">
                Upload UPSC PDFs, Json · Extract · Review · Save
              </p>
            </div>

            {parsedQuestions.length > 0 && (
              <div className="flex items-center gap-3">
                <button
                  onClick={exportJSON}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black border border-brand-border hover:border-brand-accent text-brand-muted hover:text-brand-accent transition-all"
                >
                  <Download size={14} />
                  Export JSON
                </button>
                <button
                  onClick={reset}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black border border-brand-border hover:border-red-400 text-brand-muted hover:text-red-500 transition-all"
                >
                  <RotateCcw size={14} />
                  Reset
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* ════════════════════════════════ LEFT PANEL ════════════════════ */}
          <div className="space-y-6">

            {/* Upload Zone */}
            <div className="bg-white p-8 rounded-[40px] border-2 border-dashed border-brand-border hover:border-brand-accent transition-all text-center relative group shadow-sm">
              <input
  type="file"
  accept=".json"
  onChange={handleJsonUpload}
  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
/>

              <div className="flex flex-col items-center py-2">
                <div className="bg-brand-accent/5 p-4 rounded-2xl text-brand-accent mb-3 group-hover:scale-110 transition-transform">
                  {extractStatus === "extracting"  ? (
                    <Loader2 className="animate-spin" size={28} />
                  ) : (
                    <FileUp size={28} />
                  )}
                </div>

                <h3 className="font-black text-brand-dark text-sm uppercase tracking-widest">
                  {extractStatus === "extracting"
  ? "Loading JSON..."
  : extractStatus === "done"
  ? "Upload Another File"
  : extractStatus === "error"
  ? "Error - Try Again"
  : "Upload JSON File"}
                </h3>

                {extractProgress && (
                  <p className={`text-xs font-medium mt-2 ${extractStatus === "error" ? "text-red-500" : "text-brand-muted"}`}>
                    {extractProgress}
                  </p>
                )}

      
              </div>
            </div>

            {/* Raw Text Area */}
            <div className="bg-white p-8 rounded-[40px] border border-brand-border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-[10px] font-black text-brand-muted uppercase tracking-widest">
                  <FileText size={14} />
                  Raw Content
                </div>
                <button
                  onClick={() =>
                    setRawText(
                      (prev) =>
                        prev +
                        `\n\n1. Consider the following statements regarding [Topic]:\n1. Statement one here.\n2. Statement two here.\nWhich of the above statements is/are correct?\n(a) 1 only\n(b) 2 only\n(c) Both 1 and 2\n(d) Neither 1 nor 2\nAns: C\nExplanation: Your explanation here.\n`
                    )
                  }
                  className="text-xs font-black text-brand-accent hover:underline"
                >
                  + Template
                </button>
              </div>

              <textarea
                className="w-full h-80 p-6 bg-brand-light border border-brand-border rounded-[32px] font-mono text-xs outline-none focus:border-brand-accent resize-none"
                placeholder="Paste UPSC question text here, or upload a PDF above..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
              />
            </div>

            {/* Parse Button */}
            <button
              onClick={handleParse}
              disabled={!rawText.trim() || extractStatus === "parsing"}
              className="w-full bg-brand-dark text-white p-5 rounded-[24px] font-black flex items-center justify-center gap-3 hover:bg-brand-accent transition-all shadow-lg active:scale-95 cursor-pointer disabled:opacity-30"
            >
              {extractStatus === "parsing" ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Wand2 size={20} />
              )}
              Extract Questions
            </button>

            {/* Keyboard shortcuts hint */}
            {parsedQuestions.length > 0 && (
              <div className="bg-brand-dark/5 rounded-2xl p-4 text-[10px] font-bold text-brand-muted space-y-1">
                <p className="font-black text-brand-dark text-xs uppercase tracking-widest mb-2">⌨ Keyboard Shortcuts</p>
                <p><kbd className="bg-white border border-brand-border px-1.5 py-0.5 rounded text-[10px] mr-1">A</kbd> Approve selected</p>
                <p><kbd className="bg-white border border-brand-border px-1.5 py-0.5 rounded text-[10px] mr-1">R</kbd> Reject selected</p>
                <p><kbd className="bg-white border border-brand-border px-1.5 py-0.5 rounded text-[10px] mr-1">Del</kbd> Delete selected</p>
                <p><kbd className="bg-white border border-brand-border px-1.5 py-0.5 rounded text-[10px] mr-1">↑↓</kbd> Navigate list</p>
              </div>
            )}
          </div>

          {/* ════════════════════════════════ RIGHT PANEL ═══════════════════ */}
          <div className="space-y-4">

            {/* Filter + Bulk Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-1">
              {/* Filter tabs */}
              <div className="flex flex-wrap gap-1.5">
                {FILTER_TABS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setReviewFilter(f)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase transition-all flex items-center gap-1.5 ${
                      reviewFilter === f
                        ? "bg-brand-dark text-white"
                        : "bg-white border border-brand-border text-brand-muted hover:border-brand-accent"
                    }`}
                  >
                    {f}
                    {counts[f] > 0 && (
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                        reviewFilter === f ? "bg-white/20" : "bg-brand-light"
                      }`}>
                        {counts[f]}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Action buttons */}
              {parsedQuestions.length > 0 && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={approveValid}
                    className="text-xs font-black text-green-700 flex items-center gap-1 hover:underline"
                  >
                    <CheckCircle size={12} />
                    Approve Valid
                  </button>

                  <button
                    onClick={handleUploadToDB}
                    disabled={loading || counts.Approved === 0}
                    className="text-xs font-black text-brand-accent flex items-center gap-1 hover:underline disabled:opacity-40"
                  >
                    <Save size={13} />
                    {loading ? "Saving..." : `Save ${counts.Approved} to DB`}
                  </button>
                </div>
              )}
            </div>

            {/* Question List */}
            <div
              ref={listRef}
              className="max-h-[800px] overflow-y-auto pr-1 space-y-4 custom-scrollbar"
            >
              <AnimatePresence>
                {visibleQuestions.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white/40 border-2 border-dashed border-brand-border rounded-[40px] p-24 text-center"
                  >
                    <p className="text-brand-muted font-bold text-sm opacity-50">
                      {parsedQuestions.length === 0
                        ? "No questions parsed yet."
                        : `No ${reviewFilter.toLowerCase()} questions.`}
                    </p>
                  </motion.div>
                ) : (
                  visibleQuestions.map((q, visIdx) => {
                    // Map visible index back to global index
                    const globalIdx = parsedQuestions.indexOf(q);
                    const isSelected = globalIdx === selectedQuestionIndex;

                    return (
                      <motion.div
                        data-question-card
                        key={q.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.15 }}
                        onClick={() => setSelectedQuestionIndex(globalIdx)}
                        className={`bg-white p-6 rounded-[32px] border shadow-sm group transition-all cursor-pointer ${
                          isSelected
                            ? "border-brand-accent ring-2 ring-brand-accent/20"
                            : "border-brand-border hover:border-brand-accent/50"
                        }`}
                      >
                        {/* Card Header */}
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-black text-brand-accent uppercase">
                              Q{globalIdx + 1}
                            </span>

                            {/* Type badge */}
                            <span className="text-[9px] px-2 py-0.5 rounded-full font-black uppercase bg-brand-light text-brand-muted border border-brand-border">
                              {q.type}
                            </span>

                            {/* Status badge */}
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${
                              q.reviewStatus === "Approved"
                                ? "bg-green-100 text-green-700"
                                : q.reviewStatus === "Rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}>
                              {q.reviewStatus}
                            </span>

                            {/* Malformed indicator */}
                            {q.isMalformed && (
                              <span className="text-[9px] px-2 py-0.5 rounded-full font-black uppercase bg-orange-100 text-orange-600 flex items-center gap-1">
                                <AlertTriangle size={8} /> Malformed
                              </span>
                            )}
                          </div>

                          <button
                            onClick={(e) => { e.stopPropagation(); deleteQuestion(globalIdx); }}
                            className="text-brand-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        {/* Subject / Topic chips */}
                        <div className="flex gap-1.5 mb-3 flex-wrap">
                          <span className="text-[9px] px-2 py-0.5 bg-brand-accent/10 text-brand-accent rounded-full font-black">
                            {q.subject}
                          </span>
                          <span className="text-[9px] px-2 py-0.5 bg-brand-light text-brand-muted rounded-full font-bold border border-brand-border">
                            {q.topic}
                          </span>
                          {q.year && (
                            <span className="text-[9px] px-2 py-0.5 bg-brand-light text-brand-muted rounded-full font-bold border border-brand-border">
                              {q.year}
                            </span>
                          )}
                        </div>

                        {/* Question Text */}
                        <textarea
                          value={q.questionText}
                          onChange={(e) => updateField(globalIdx, "questionText", e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full bg-brand-light border border-brand-border rounded-2xl p-4 text-sm font-bold text-brand-dark outline-none focus:border-brand-accent resize-none mb-4"
                          rows={3}
                        />

                        {/* Statements (for statement-type questions) */}
                        {q.statements && q.statements.length > 0 && (
                          <div className="mb-4 space-y-1.5">
                            {q.statements.map((stmt, si) => (
                              <div key={si} className="flex gap-2 items-start bg-brand-light rounded-xl p-3 border border-brand-border">
                                <span className="text-[10px] font-black text-brand-accent mt-0.5 shrink-0">
                                  {si + 1}.
                                </span>
                                <p className="text-xs font-medium text-brand-dark">{stmt}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Match pairs */}
                        {q.matchPairs && q.matchPairs.length > 0 && (
                          <div className="mb-4 overflow-x-auto rounded-2xl border border-brand-border">
                            <table className="min-w-full text-xs">
                              <thead className="bg-brand-light">
                                <tr>
                                  <th className="px-4 py-2 text-left font-black text-brand-muted border-r border-brand-border">List I</th>
                                  <th className="px-4 py-2 text-left font-black text-brand-muted">List II</th>
                                </tr>
                              </thead>
                              <tbody>
                                {q.matchPairs.map((pair, pi) => (
                                  <tr key={pi} className="border-t border-brand-border">
                                    <td className="px-4 py-2 border-r border-brand-border">{pair.leftLabel}. {pair.left}</td>
                                    <td className="px-4 py-2">{pair.rightLabel}. {pair.right}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* Table data */}
                        {q.tableData && (
                          <div className="mb-4 overflow-x-auto rounded-2xl border border-brand-border">
                            <table className="min-w-full text-xs">
                              <thead className="bg-brand-light">
                                <tr>
                                  {q.tableData.headers.map((h, hi) => (
                                    <th key={hi} className="px-4 py-2 text-left font-black border-b border-brand-border">{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {q.tableData.rows.map((row, ri) => (
                                  <tr key={ri} className="border-t border-brand-border">
                                    {row.map((cell, ci) => (
                                      <td key={ci} className="px-4 py-2">{cell}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* Options */}
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          {q.options.map((o, oi) => (
                            <div
                              key={o.label}
                              className={`p-3 rounded-xl border transition-all ${
                                q.correctOption === o.label
                                  ? "bg-green-50 border-green-300"
                                  : "bg-brand-light border-brand-border"
                              }`}
                            >
                              <div className="text-[10px] font-black text-brand-accent mb-1">
                                ({o.label})
                              </div>
                              <textarea
                                value={o.text}
                                onChange={(e) => updateOption(globalIdx, oi, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full bg-transparent text-xs font-bold outline-none resize-none text-brand-dark"
                                rows={2}
                                placeholder={`Option ${o.label}...`}
                              />
                            </div>
                          ))}
                        </div>

                        {/* Correct Answer + Subject/Topic overrides */}
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-brand-accent uppercase">Answer:</span>
                            <select
                              value={q.correctOption}
                              onChange={(e) => updateField(globalIdx, "correctOption", e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className="bg-brand-light border border-brand-border rounded-xl px-3 py-1 text-xs font-bold outline-none"
                            >
                              {["A", "B", "C", "D"].map((v) => (
                                <option key={v} value={v}>{v}</option>
                              ))}
                            </select>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-brand-muted uppercase">Year:</span>
                            <input
                              type="number"
                              value={q.year || ""}
                              onChange={(e) => updateField(globalIdx, "year", parseInt(e.target.value) || null)}
                              onClick={(e) => e.stopPropagation()}
                              className="bg-brand-light border border-brand-border rounded-xl px-3 py-1 text-xs font-bold outline-none w-20"
                              placeholder="Year"
                            />
                          </div>
                        </div>

                        {/* Subject / Topic */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          <input
                            value={q.subject}
                            onChange={(e) => updateField(globalIdx, "subject", e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-brand-light border border-brand-border rounded-xl px-3 py-1.5 text-[11px] font-bold outline-none focus:border-brand-accent"
                            placeholder="Subject"
                          />
                          <input
                            value={q.topic}
                            onChange={(e) => updateField(globalIdx, "topic", e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-brand-light border border-brand-border rounded-xl px-3 py-1.5 text-[11px] font-bold outline-none focus:border-brand-accent"
                            placeholder="Topic"
                          />
                        </div>

                        {/* Approve / Reject */}
                        <div className="flex gap-2 mb-3">
                          <button
                            onClick={(e) => { e.stopPropagation(); updateStatus(globalIdx, "Approved"); }}
                            className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${
                              q.reviewStatus === "Approved"
                                ? "bg-green-600 text-white"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
                            }`}
                          >
                            Approve
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); updateStatus(globalIdx, "Rejected"); }}
                            className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${
                              q.reviewStatus === "Rejected"
                                ? "bg-red-600 text-white"
                                : "bg-red-100 text-red-700 hover:bg-red-200"
                            }`}
                          >
                            Reject
                          </button>
                        </div>

                        {/* Explanation */}
                        <textarea
                          value={q.explanation || ""}
                          onChange={(e) => updateField(globalIdx, "explanation", e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="Explanation (optional but recommended)..."
                          className="w-full bg-brand-light border border-brand-border rounded-2xl p-3 text-xs text-brand-muted outline-none resize-none focus:border-brand-accent"
                          rows={3}
                        />

                        {/* Parse warnings */}
                        {q.parseWarnings && q.parseWarnings.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {q.parseWarnings.map((w, wi) => (
                              <span
                                key={wi}
                                className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-[9px] font-black uppercase flex items-center gap-1"
                              >
                                <AlertTriangle size={8} />
                                {WARNING_LABELS[w] || w}
                              </span>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}