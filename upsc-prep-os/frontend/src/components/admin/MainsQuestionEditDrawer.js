"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, FileText } from "lucide-react";
import axios from "axios";
import { showToast } from "@/components/ui/Toast";

const PAPERS = ["GS1", "GS2", "GS3", "GS4", "Essay", "Optional"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];

export default function MainsQuestionEditDrawer({
    open,
    question,
    onClose,
    onSaved,
    token,
}) {
    const [title, setTitle] = useState("");
    const [paper, setPaper] = useState("GS1");
    const [year, setYear] = useState("");
    const [marks, setMarks] = useState(10);
    const [wordLimit, setWordLimit] = useState(150);
    const [difficulty, setDifficulty] = useState("Medium");
    const [subjectName, setSubjectName] = useState("");
    const [topicName, setTopicName] = useState("");
    const [subtopicName, setSubtopicName] = useState("");
    const [modelAnswer, setModelAnswer] = useState("");
    const [keyPoints, setKeyPoints] = useState("");
    const [keywords, setKeywords] = useState("");
    const [saving, setSaving] = useState(false);

    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {
        if (!question) return;
        setTitle(question.questionText || "");
        setPaper(question.paper || "GS1");
        setYear(question.year || "");
        setMarks(question.marks || 10);
        setWordLimit(question.wordLimit || 150);
        setDifficulty(question.difficulty || "Medium");
        setSubjectName(question.subjectName || "");
        setTopicName(question.topicName || "");
        setSubtopicName(question.subtopicName || "");
        setModelAnswer(question.modelAnswer || "");
        setKeyPoints((question.answerKeyPoints || []).join("\n"));
        setKeywords((question.keywords || []).join(", "));
    }, [question]);

    const handleSave = async () => {
        if (!title.trim()) {
            showToast.error("Question text is required");
            return;
        }
        if (!year) {
            showToast.error("Year is required");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                questionText: title.trim(),
                paper,
                year: Number(year),
                marks: Number(marks) || 10,
                wordLimit: Number(wordLimit) || 150,
                difficulty,
                subjectName: subjectName.trim(),
                topicName: topicName.trim(),
                subtopicName: subtopicName.trim(),
                modelAnswer: modelAnswer.trim(),
                answerKeyPoints: keyPoints
                    .split("\n")
                    .map((k) => k.trim())
                    .filter(Boolean),
                keywords: keywords
                    .split(",")
                    .map((k) => k.trim())
                    .filter(Boolean),
            };

            const { data } = await axios.put(
                `${baseUrl}/api/mains/questions/${question._id}`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            showToast.success("Question updated");
            onSaved?.(data);
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
                        <div className="p-5 border-b border-brand-border flex items-center justify-between bg-gradient-to-br from-white to-brand-light/30">
                            <div className="flex items-center gap-2.5">
                                <div className="bg-purple-500/10 p-1.5 rounded-lg">
                                    <FileText size={14} className="text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-brand-muted leading-none">
                                        Edit Mains Question
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

                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                            <Field label="Question Text *">
                                <textarea
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    rows={4}
                                    className="w-full px-3 py-2.5 bg-brand-light border border-brand-border rounded-xl text-sm font-bold outline-none focus:border-brand-accent transition-all resize-none"
                                />
                            </Field>

                            <div className="grid grid-cols-2 gap-2">
                                <Field label="Paper *">
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
                                <Field label="Year *">
                                    <input
                                        type="number"
                                        value={year}
                                        onChange={(e) => setYear(e.target.value)}
                                        className="w-full px-3 py-2 bg-brand-light border border-brand-border rounded-lg text-sm font-bold outline-none focus:border-brand-accent transition-all"
                                    />
                                </Field>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <Field label="Marks">
                                    <input
                                        type="number"
                                        value={marks}
                                        onChange={(e) => setMarks(e.target.value)}
                                        className="w-full px-3 py-2 bg-brand-light border border-brand-border rounded-lg text-sm font-bold outline-none"
                                    />
                                </Field>
                                <Field label="Word Limit">
                                    <input
                                        type="number"
                                        value={wordLimit}
                                        onChange={(e) => setWordLimit(e.target.value)}
                                        className="w-full px-3 py-2 bg-brand-light border border-brand-border rounded-lg text-sm font-bold outline-none"
                                    />
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

                            <Field label="Subject">
                                <input
                                    type="text"
                                    value={subjectName}
                                    onChange={(e) => setSubjectName(e.target.value)}
                                    className="w-full px-3 py-2 bg-brand-light border border-brand-border rounded-lg text-sm font-bold outline-none focus:border-brand-accent transition-all"
                                />
                            </Field>
                            <Field label="Topic">
                                <input
                                    type="text"
                                    value={topicName}
                                    onChange={(e) => setTopicName(e.target.value)}
                                    className="w-full px-3 py-2 bg-brand-light border border-brand-border rounded-lg text-sm font-bold outline-none focus:border-brand-accent transition-all"
                                />
                            </Field>
                            <Field label="Subtopic">
                                <input
                                    type="text"
                                    value={subtopicName}
                                    onChange={(e) => setSubtopicName(e.target.value)}
                                    className="w-full px-3 py-2 bg-brand-light border border-brand-border rounded-lg text-sm font-bold outline-none focus:border-brand-accent transition-all"
                                />
                            </Field>

                            <Field label="Model Answer">
                                <textarea
                                    value={modelAnswer}
                                    onChange={(e) => setModelAnswer(e.target.value)}
                                    rows={6}
                                    placeholder="The ideal answer approach..."
                                    className="w-full px-3 py-2.5 bg-brand-light border border-brand-border rounded-xl text-sm font-medium outline-none focus:border-brand-accent transition-all resize-none"
                                />
                            </Field>

                            <Field label="Key Points (one per line)">
                                <textarea
                                    value={keyPoints}
                                    onChange={(e) => setKeyPoints(e.target.value)}
                                    rows={4}
                                    placeholder={"Point 1\nPoint 2\nPoint 3"}
                                    className="w-full px-3 py-2.5 bg-brand-light border border-brand-border rounded-xl text-sm font-medium outline-none focus:border-brand-accent transition-all resize-none"
                                />
                            </Field>

                            <Field label="Keywords (comma-separated)">
                                <input
                                    type="text"
                                    value={keywords}
                                    onChange={(e) => setKeywords(e.target.value)}
                                    className="w-full px-3 py-2 bg-brand-light border border-brand-border rounded-lg text-sm font-medium outline-none focus:border-brand-accent transition-all"
                                />
                            </Field>
                        </div>

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