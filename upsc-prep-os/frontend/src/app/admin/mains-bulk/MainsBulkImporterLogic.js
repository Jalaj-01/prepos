"use client";

import { useState } from "react";

import { motion } from "framer-motion";

import {
    FileUp,
    Save,
    Loader2,
    ArrowLeft,
    Trash2,
    CheckCircle,
    AlertCircle,
    Download
} from "lucide-react";

import Link from "next/link";

import axios from "axios";

import Sidebar from "@/components/layout/Sidebar";

import TopHeader from "@/components/layout/TopHeader";

import Footer from "@/components/layout/Footer";

import MobileNav from "@/components/layout/MobileNav";

import { useEffect } from "react";

export default function MainsBulkImporterLogic() {

    const [user, setUser] = useState(null);

    const [questions, setQuestions] = useState([]);

    const [loading, setLoading] = useState(false);

    const [status, setStatus] = useState(null);

    const [statusMessage, setStatusMessage] = useState("");

    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    useEffect(() => {

        const info =
            localStorage.getItem("userInfo");

        if (!info) {
            window.location.href = "/login";
            return;
        }

        const parsed = JSON.parse(info);

        if (!parsed.isAdmin) {

            showToast.error("Admin access required");

            window.location.href = "/dashboard";

            return;
        }

        setUser(parsed);

    }, []);

    // =========================
    // SAMPLE JSON FORMAT
    // =========================

    const sampleJson = [
        {
            questionText: "Discuss the role of women in the Indian freedom struggle.",
            paper: "GS1",
            year: 2023,
            marks: 15,
            wordLimit: 250,
            subjectName: "History",
            topicName: "Modern Indian History",
            subtopicName: "Freedom Struggle",
            keywords: ["women", "freedom struggle", "independence"],
            difficulty: "Medium",
            modelAnswer: "Optional model answer here..."
        }
    ];

    const handleJsonUpload = async (e) => {

        const file = e.target.files?.[0];

        if (!file) return;

        try {

            setStatus("loading");

            setStatusMessage("Reading file...");

            const text = await file.text();

            const json = JSON.parse(text);

            const arr =
                Array.isArray(json)
                    ? json
                    : json.questions || [];

            // Basic validation

            const validated = arr.map((q, i) => ({

                ...q,

                _tempId: `q_${i}`,

                _valid:
                    !!(q.questionText && q.paper && q.year)
            }));

            setQuestions(validated);

            const validCount =
                validated.filter(v => v._valid).length;

            setStatus("ready");

            setStatusMessage(
                `${validCount} valid questions loaded`
            );

        } catch (err) {

            setStatus("error");

            setStatusMessage(err.message);
        }
    };

    const removeQuestion = (tempId) => {

        setQuestions(prev =>
            prev.filter(q => q._tempId !== tempId)
        );
    };

    const uploadToDB = async () => {

        const valid =
            questions

                .filter(q => q._valid)

                .map(({ _tempId, _valid, ...rest }) => rest);

        if (valid.length === 0) {

            showToast.warning("No valid questions to upload");

            return;
        }

        setLoading(true);

        try {

            const { data } = await axios.post(

                `${process.env.NEXT_PUBLIC_API_URL}/api/mains/questions/bulk`,

                { questions: valid },

                {
                    headers: {
                        Authorization:
                            `Bearer ${user.token}`
                    }
                }
            );

           showToast.error(

                `✅ Uploaded ${data.inserted} questions!\n` +

                `Skipped: ${data.skipped} duplicates`
            );

            setQuestions([]);

            setStatus(null);

            setStatusMessage("");

        } catch (err) {

            showToast.success(

                "Upload failed: " +

                (err.response?.data?.message || err.message)
            );

        } finally {

            setLoading(false);
        }
    };

    const downloadSample = () => {

        const blob =
            new Blob(
                [JSON.stringify(sampleJson, null, 2)],
                { type: "application/json" }
            );

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");

        a.href = url;

        a.download = "mains-sample.json";

        a.click();

        URL.revokeObjectURL(url);
    };

    if (!user) {
        return null;
    }

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

                <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-[1200px] w-full mx-auto">

                    <Link
                        href="/mains"
                        className="flex items-center gap-2 text-brand-muted hover:text-brand-dark mb-4 font-bold text-sm"
                    >
                        <ArrowLeft size={16} />
                        Back to Mains
                    </Link>

                    <div className="flex items-end justify-between flex-wrap gap-4 mb-8">

                        <div>

                            <h1 className="text-3xl sm:text-4xl font-black text-brand-dark tracking-tighter">

                                Mains Bulk Import

                            </h1>

                            <p className="text-brand-muted font-medium mt-2">

                                Upload JSON file containing Mains questions

                            </p>

                        </div>

                        <button
                            onClick={downloadSample}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-brand-border rounded-2xl text-xs font-black uppercase tracking-widest text-brand-muted hover:text-brand-dark transition-all"
                        >
                            <Download size={14} />
                            Sample JSON
                        </button>

                    </div>

                    {/* UPLOAD ZONE */}

                    <div className="bg-white p-8 rounded-3xl border-2 border-dashed border-brand-border hover:border-brand-accent transition-all text-center relative mb-6">

                        <input
                            type="file"
                            accept=".json"
                            onChange={handleJsonUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />

                        <div className="flex flex-col items-center">

                            <div className="bg-brand-accent/10 p-4 rounded-2xl text-brand-accent mb-3">

                                {status === "loading" ? (
                                    <Loader2 size={32} className="animate-spin" />
                                ) : (
                                    <FileUp size={32} />
                                )}

                            </div>

                            <h3 className="font-black text-brand-dark text-base mb-1">

                                {status === "loading"
                                    ? "Reading JSON..."
                                    : status === "ready"
                                    ? "Upload Another File"
                                    : status === "error"
                                    ? "Error - Try Again"
                                    : "Upload JSON File"}

                            </h3>

                            <p className="text-brand-muted text-xs font-bold">

                                Click or drag to upload Mains questions JSON

                            </p>

                            {statusMessage && (

                                <p className={`text-xs font-bold mt-3 ${
                                    status === "error"
                                        ? "text-red-500"
                                        : "text-green-600"
                                }`}>
                                    {statusMessage}
                                </p>
                            )}

                        </div>

                    </div>

                    {/* QUESTIONS LIST */}

                    {questions.length > 0 && (

                        <>

                            <div className="flex items-center justify-between mb-4">

                                <p className="font-black text-brand-dark">

                                    {questions.length} Questions Loaded

                                </p>

                                <button
                                    onClick={uploadToDB}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-6 py-3 bg-brand-dark text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-brand-accent transition-all disabled:opacity-50"
                                >
                                    {loading ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <Save size={16} />
                                    )}

                                    {loading ? "Uploading..." : "Save to Database"}
                                </button>

                            </div>

                            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">

                                {questions.map((q) => (

                                    <div
                                        key={q._tempId}
                                        className={`bg-white rounded-2xl p-4 border-2 ${
                                            q._valid
                                                ? "border-green-200"
                                                : "border-red-200"
                                        }`}
                                    >

                                        <div className="flex items-start justify-between gap-3 mb-2">

                                            <div className="flex items-center gap-2 flex-wrap">

                                                {q._valid ? (
                                                    <CheckCircle size={16} className="text-green-500" />
                                                ) : (
                                                    <AlertCircle size={16} className="text-red-500" />
                                                )}

                                                <span className="text-[10px] font-black bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                                                    {q.paper || "NO PAPER"}
                                                </span>

                                                <span className="text-[10px] font-bold text-brand-muted">
                                                    {q.year || "NO YEAR"} • {q.marks || "?"}M
                                                </span>

                                            </div>

                                            <button
                                                onClick={() => removeQuestion(q._tempId)}
                                                className="text-brand-muted hover:text-red-500"
                                            >
                                                <Trash2 size={14} />
                                            </button>

                                        </div>

                                        <p className="text-sm font-bold text-brand-dark line-clamp-2 leading-relaxed">

                                            {q.questionText || "❌ Missing question text"}

                                        </p>

                                        {!q._valid && (

                                            <p className="text-[10px] text-red-500 font-bold mt-2">

                                                Required: questionText, paper, year

                                            </p>
                                        )}

                                    </div>
                                ))}

                            </div>

                        </>
                    )}

                </main>

                <Footer />

            </div>

        </div>
    );
}