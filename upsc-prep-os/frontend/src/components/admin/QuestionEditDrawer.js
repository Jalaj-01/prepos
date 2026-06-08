"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QuestionImageGallery from "./QuestionImageGallery";
import {
    X,
    Save,
    Plus,
    Trash2,
    FileText,
} from "lucide-react";
import axios from "axios";
import { showToast } from "@/components/ui/Toast";

const PAPERS = ["GS1", "GS2", "GS3", "GS4", "Essay", "Optional", "CSAT"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];

export default function QuestionEditDrawer({
    open,
    question,
    onClose,
    onSaved,
    token,
}) {
    const [title, setTitle] = useState("");
    const [options, setOptions] = useState([]);
    const [correctOption, setCorrectOption] = useState("");
    const [explanation, setExplanation] = useState("");
    const [year, setYear] = useState("");
    const [paper, setPaper] = useState("GS1");
    const [difficulty, setDifficulty] = useState("Medium");
    const [subjectName, setSubjectName] = useState("");
    const [topicName, setTopicName] = useState("");
    const [subtopicName, setSubtopicName] = useState("");
    const [keywords, setKeywords] = useState("");
    const [saving, setSaving] = useState(false);
    const [images, setImages] = useState([]);

    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {
        if (!question) return;
        setTitle(question.questionText || "");
        setOptions(
            question.options?.length
                ? question.options
                : [
                      { label: "A", text: "" },
                      { label: "B", text: "" },
                      { label: "C", text: "" },
                      { label: "D", text: "" },
                  ]
        );
        setCorrectOption(question.correctOption || "");
        setExplanation(question.explanation || "");
        setYear(question.year || "");
        setPaper(question.paper || "GS1");
        setDifficulty(question.difficulty || "Medium");
        setSubjectName(question.subjectName || "");
        setTopicName(question.topicName || "");
        setSubtopicName(question.subtopicName || "");
        setKeywords((question.keywords || []).join(", "));
        setImages(question.images || []);
    }, [question]);

    const updateOption = (idx, value) => {
        const next = [...options];
        next[idx] = { ...next[idx], text: value };
        setOptions(next);
    };

    const handleSave = async () => {
        if (!title.trim()) {
            showToast.error("Question text is required");
            return;
        }
        if (!correctOption) {
            showToast.error("Select a correct option");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                questionText: title.trim(),
                options,
                correctOption,
                explanation: explanation.trim(),
                year: Number(year),
                paper,
                difficulty,
                subjectName: subjectName.trim(),
                topicName: topicName.trim(),
                subtopicName: subtopicName.trim(),
                keywords: keywords
                    .split(",")
                    .map((k) => k.trim())
                    .filter(Boolean),
                images: images,                                         
                questionFormat: images.length > 0 ? "Image" : "Text",   
            };
            

            const { data } = await axios.put(
                `${baseUrl}/api/questions/${question._id}`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            showToast.success("Question updated");
            onSaved?.(data.question);
            onClose();
        } catch (e) {
            showToast.error(
                e.response?.data?.message || "Failed to update"
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <AnimatePresence>
            {open && question && (
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
                        className="fixed right-0 top-0 bottom-0 w-full sm:w-[520px] bg-white z-[95] flex flex-col shadow-2xl"
                    >
                        {/* Header */}
                        <div className="p-5 border-b border-brand-border flex items-center justify-between bg-gradient-to-br from-white to-brand-light/30">
                            <div className="flex items-center gap-2.5">
                                <div className="bg-brand-accent/10 p-1.5 rounded-lg">
                                    <FileText size={14} className="text-brand-accent" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-brand-muted leading-none">
                                        Edit Prelims Question
                                    </p>
                                    <h2 className="text-sm font-black text-brand-dark mt-0.5">
                                        Question Editor
                                    </h2>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-xl text-brand-muted hover:bg-brand-light"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                            {/* Title */}
                            <Field label="Question Text *">
                                <textarea
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    rows={4}
                                    className="w-full px-3 py-2.5 bg-brand-light border border-brand-border rounded-xl text-sm font-bold outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all resize-none"
                                />
                            </Field>

                            {/* Options */}
                            <Field label="Options *">
                                <div className="space-y-2">
                                    {options.map((opt, i) => (
                                        <div
                                            key={opt.label}
                                            className="flex items-center gap-2"
                                        >
                                            <span className="w-7 h-7 rounded-lg bg-brand-dark text-white text-xs font-black flex items-center justify-center shrink-0">
                                                {opt.label}
                                            </span>
                                            <input
                                                type="text"
                                                value={opt.text}
                                                onChange={(e) =>
                                                    updateOption(i, e.target.value)
                                                }
                                                placeholder={`Option ${opt.label}`}
                                                className="flex-1 px-3 py-2 bg-brand-light border border-brand-border rounded-lg text-sm font-medium outline-none focus:border-brand-accent transition-all"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </Field>

                            {/* Correct Option */}
                            <Field label="Correct Option *">
                                <div className="grid grid-cols-4 gap-2">
                                    {options.map((opt) => (
                                        <button
                                            key={opt.label}
                                            onClick={() => setCorrectOption(opt.label)}
                                            className={`py-2 rounded-lg text-sm font-black transition-all ${
                                                correctOption === opt.label
                                                    ? "bg-green-500 text-white"
                                                    : "bg-brand-light text-brand-muted hover:text-brand-dark"
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </Field>

                            {/* ─── Images ─── */}
                            <Field label="Images (optional)">
                                <QuestionImageGallery
                                    images={images}
                                    onChange={setImages}
                                    token={token}
                                />
                            </Field>


                            {/* Explanation */}
                            <Field label="Explanation">
                                <textarea
                                    value={explanation}
                                    onChange={(e) => setExplanation(e.target.value)}
                                    rows={4}
                                    placeholder="Why this is the correct answer..."
                                    className="w-full px-3 py-2.5 bg-brand-light border border-brand-border rounded-xl text-sm font-medium outline-none focus:border-brand-accent transition-all resize-none"
                                />
                            </Field>

                            {/* Year + Paper + Difficulty */}
                            <div className="grid grid-cols-3 gap-2">
                                <Field label="Year *">
                                    <input
                                        type="number"
                                        value={year}
                                        onChange={(e) => setYear(e.target.value)}
                                        className="w-full px-3 py-2 bg-brand-light border border-brand-border rounded-lg text-sm font-bold outline-none focus:border-brand-accent transition-all"
                                    />
                                </Field>
                                <Field label="Paper">
                                    <select
                                        value={paper}
                                        onChange={(e) => setPaper(e.target.value)}
                                        className="w-full px-3 py-2 bg-brand-light border border-brand-border rounded-lg text-sm font-bold outline-none"
                                    >
                                        {PAPERS.map((p) => (
                                            <option key={p} value={p}>
                                                {p}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                                <Field label="Difficulty">
                                    <select
                                        value={difficulty}
                                        onChange={(e) => setDifficulty(e.target.value)}
                                        className="w-full px-3 py-2 bg-brand-light border border-brand-border rounded-lg text-sm font-bold outline-none"
                                    >
                                        {DIFFICULTIES.map((d) => (
                                            <option key={d} value={d}>
                                                {d}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                            </div>

                            {/* Subject / Topic / Subtopic */}
                            <Field label="Subject">
                                <input
                                    type="text"
                                    value={subjectName}
                                    onChange={(e) => setSubjectName(e.target.value)}
                                    placeholder="History"
                                    className="w-full px-3 py-2 bg-brand-light border border-brand-border rounded-lg text-sm font-bold outline-none focus:border-brand-accent transition-all"
                                />
                            </Field>
                            <Field label="Topic">
                                <input
                                    type="text"
                                    value={topicName}
                                    onChange={(e) => setTopicName(e.target.value)}
                                    placeholder="Modern India"
                                    className="w-full px-3 py-2 bg-brand-light border border-brand-border rounded-lg text-sm font-bold outline-none focus:border-brand-accent transition-all"
                                />
                            </Field>
                            <Field label="Subtopic">
                                <input
                                    type="text"
                                    value={subtopicName}
                                    onChange={(e) => setSubtopicName(e.target.value)}
                                    placeholder="Revolt of 1857"
                                    className="w-full px-3 py-2 bg-brand-light border border-brand-border rounded-lg text-sm font-bold outline-none focus:border-brand-accent transition-all"
                                />
                            </Field>

                            {/* Keywords */}
                            <Field label="Keywords (comma-separated)">
                                <input
                                    type="text"
                                    value={keywords}
                                    onChange={(e) => setKeywords(e.target.value)}
                                    placeholder="freedom, struggle, 1857"
                                    className="w-full px-3 py-2 bg-brand-light border border-brand-border rounded-lg text-sm font-medium outline-none focus:border-brand-accent transition-all"
                                />
                            </Field>
                        </div>

                        {/* Footer */}
                        <div className="p-5 border-t border-brand-border bg-white">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-brand-dark text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-accent transition-all disabled:opacity-50"
                            >
                                <Save size={14} />
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}

function Field({ label, children }) {
    return (
        <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted ml-1">
                {label}
            </label>
            <div className="mt-1">{children}</div>
        </div>
    );
}