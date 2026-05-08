"use client";

import { useEffect, useState } from "react";

import axios from "axios";

import {
    CheckCircle,
    XCircle,
    Clock3
} from "lucide-react";

export default function ReviewDashboard() {

    const [questions, setQuestions] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [status, setStatus] =
        useState("Pending");

    // =========================
    // FETCH QUESTIONS
    // =========================

    const fetchQuestions = async () => {

        try {

            setLoading(true);

            const userInfo = JSON.parse(
                localStorage.getItem("userInfo")
            );

            const response =
                await axios.get(

                    `${process.env.NEXT_PUBLIC_API_URL}/api/questions/review?status=${status}`,

                    {
                        headers: {
                            Authorization:
                                `Bearer ${userInfo.token}`
                        }
                    }
                );

            setQuestions(response.data);

        } catch (err) {

            console.error(err);

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {

        fetchQuestions();

    }, [status]);

    // =========================
    // UPDATE REVIEW STATUS
    // =========================

    const updateStatus = async (
        id,
        reviewStatus
    ) => {

        try {

            const userInfo = JSON.parse(
                localStorage.getItem("userInfo")
            );

            await axios.put(

                `${process.env.NEXT_PUBLIC_API_URL}/api/questions/review/${id}`,

                {
                    reviewStatus
                },

                {
                    headers: {
                        Authorization:
                            `Bearer ${userInfo.token}`
                    }
                }
            );

            fetchQuestions();

        } catch (err) {

            console.error(err);
        }
    };

    return (

        <div className="min-h-screen bg-brand-light p-6 md:p-10">

            <div className="max-w-7xl mx-auto">

                {/* HEADER */}

                <div className="mb-10">

                    <h1 className="text-4xl font-black text-brand-dark tracking-tight">

                        Review Dashboard

                    </h1>

                    <p className="text-brand-muted mt-2 font-medium">

                        Moderate AI extracted UPSC questions.

                    </p>

                </div>

                {/* FILTERS */}

                <div className="flex gap-3 mb-8">

                    {
                        [
                            "Pending",
                            "Approved",
                            "Rejected"
                        ].map(item => (

                            <button
                                key={item}
                                onClick={() =>
                                    setStatus(item)
                                }
                                className={`px-5 py-3 rounded-2xl text-sm font-black transition-all border

                                ${
                                    status === item

                                    ? "bg-brand-dark text-white border-brand-dark"

                                    : "bg-white border-brand-border text-brand-muted"
                                }`}
                            >

                                {item}

                            </button>
                        ))
                    }

                </div>

                {/* CONTENT */}

                {
                    loading ? (

                        <div className="text-brand-muted font-bold">

                            Loading...

                        </div>

                    ) : (

                        <div className="space-y-6">

                            {
                                questions.map((q) => (

                                    <div
                                        key={q._id}
                                        className="bg-white border border-brand-border rounded-[32px] p-6 shadow-sm"
                                    >

                                        {/* QUESTION */}

                                        <div className="mb-5">

                                            <h2 className="font-bold text-brand-dark leading-relaxed text-sm">

                                                {q.questionText}

                                            </h2>

                                        </div>

                                        {/* OPTIONS */}

                                        <div className="grid grid-cols-2 gap-3 mb-5">

                                            {
                                                q.options?.map(o => (

                                                    <div
                                                        key={o.label}
                                                        className="bg-brand-light border border-brand-border rounded-2xl p-3 text-xs font-bold"
                                                    >

                                                        <span className="text-brand-accent mr-1">

                                                            {o.label}:

                                                        </span>

                                                        {o.text}

                                                    </div>
                                                ))
                                            }

                                        </div>

                                        {/* ANSWER */}

                                        <div className="mb-4 text-xs font-black text-brand-accent">

                                            Correct Answer:
                                            {" "}
                                            {q.correctOption}

                                        </div>

                                        {/* METADATA */}

                                        {
                                            q.aiMetadata && (

                                                <div className="mb-5 grid grid-cols-2 md:grid-cols-4 gap-3">

                                                    <div className="bg-brand-light rounded-2xl p-3 text-xs">

                                                        <div className="font-black mb-1">

                                                            Subject

                                                        </div>

                                                        <div>

                                                            {q.aiMetadata.subject}

                                                        </div>

                                                    </div>

                                                    <div className="bg-brand-light rounded-2xl p-3 text-xs">

                                                        <div className="font-black mb-1">

                                                            Topic

                                                        </div>

                                                        <div>

                                                            {q.aiMetadata.topic}

                                                        </div>

                                                    </div>

                                                    <div className="bg-brand-light rounded-2xl p-3 text-xs">

                                                        <div className="font-black mb-1">

                                                            Difficulty

                                                        </div>

                                                        <div>

                                                            {q.aiMetadata.difficultyPrediction}

                                                        </div>

                                                    </div>

                                                    <div className="bg-brand-light rounded-2xl p-3 text-xs">

                                                        <div className="font-black mb-1">

                                                            Type

                                                        </div>

                                                        <div>

                                                            {q.aiMetadata.questionType}

                                                        </div>

                                                    </div>

                                                </div>
                                            )
                                        }

                                        {/* ACTIONS */}

                                        <div className="flex items-center gap-3">

                                            <button
                                                onClick={() =>
                                                    updateStatus(
                                                        q._id,
                                                        "Approved"
                                                    )
                                                }
                                                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-green-600 text-white text-xs font-black"
                                            >

                                                <CheckCircle size={16} />

                                                Approve

                                            </button>

                                            <button
                                                onClick={() =>
                                                    updateStatus(
                                                        q._id,
                                                        "Rejected"
                                                    )
                                                }
                                                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-red-600 text-white text-xs font-black"
                                            >

                                                <XCircle size={16} />

                                                Reject

                                            </button>

                                            <div className="ml-auto flex items-center gap-2 text-xs text-brand-muted font-bold">

                                                <Clock3 size={14} />

                                                {q.reviewStatus}

                                            </div>

                                        </div>

                                    </div>
                                ))
                            }

                        </div>
                    )
                }

            </div>

        </div>
    );
}