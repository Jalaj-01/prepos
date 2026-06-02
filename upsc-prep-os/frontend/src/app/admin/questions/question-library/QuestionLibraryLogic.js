"use client";

import { useEffect, useState } from "react";

import axios from "axios";

import {
    Search,
    Star,
    Layers
} from "lucide-react";

export default function QuestionLibraryLogic() {

    const [
        questions,
        setQuestions
    ] = useState([]);

    const [
        loading,
        setLoading
    ] = useState(true);

    const [
        expandedQuestion,
        setExpandedQuestion
    ] = useState(null);

    const [
        selectedYear,
        setSelectedYear
    ] = useState("");

    const [
        selectedSubject,
        setSelectedSubject
    ] = useState("");

    const [
        selectedTopic,
        setSelectedTopic
    ] = useState("");

    const [
        selectedPaper,
        setSelectedPaper
    ] = useState("");

    const [
        search,
        setSearch
    ] = useState("");

    const [
    repeatedOnly,
    setRepeatedOnly
] = useState(false);

    // =========================
    // FETCH QUESTIONS
    // =========================

    const fetchQuestions = async () => {

        try {

            setLoading(true);

            const params = {};

            if (selectedYear)
                params.year =
                    selectedYear;

            if (selectedSubject)
                params.subject =
                    selectedSubject;

            if (selectedTopic)
                params.topic =
                    selectedTopic;

            if (selectedPaper)
                params.paper =
                    selectedPaper;

            if (search)
    params.q =
        search;

if (repeatedOnly)
    params.repeated =
        true;

            const response =
                await axios.get(

                     "http://localhost:5000/api/search",

                    { params }
                );

            setQuestions(
                response.data
            );

        } catch (error) {

            console.error(
                "Failed to fetch questions",
                error
            );

        } finally {

            setLoading(false);
        }
    };

    // =========================
// TOGGLE BOOKMARK
// =========================

const toggleBookmark = async (
    questionId
) => {

    try {

        const rawUserInfo =
            localStorage.getItem(
                "userInfo"
            );

        if (!rawUserInfo) {

            console.error(
                "No userInfo found in localStorage"
            );

            return;
        }

        const userInfo =
            JSON.parse(
                rawUserInfo
            );

        const token =
            userInfo?.token;

        if (!token) {

            console.error(
                "No token found"
            );

            return;
        }

        await axios.put(

            `http://localhost:5000/api/bookmarks/${questionId}`,

            {},

            {
                headers: {

                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

        fetchQuestions();

    } catch (error) {

        console.error(
            "Bookmark failed",
            error
        );
    }
};

// =========================
// SAVE TO PRACTICE SET
// =========================

const saveToPracticeSet =
async (
    questionId
) => {

    try {

        const title =
            prompt(
                "Practice Set Name"
            );

        if (!title) return;

        const rawUserInfo =
            localStorage.getItem(
                "userInfo"
            );

        if (!rawUserInfo) {

            console.error(
                "No user info found"
            );

            return;
        }

        const userInfo =
            JSON.parse(
                rawUserInfo
            );

        const token =
            userInfo?.token;

        if (!token) {

            console.error(
                "No token found"
            );

            return;
        }

        await axios.post(

            "http://localhost:5000/api/practice-sets",

            {

                title,

                description:
                    "Saved from Question Library",

                questions: [
                    questionId
                ]
            },

            {
                headers: {

                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

        alert(
            "Question saved to Practice Set"
        );

    } catch (error) {

        console.error(
            "Save failed",
            error
        );

        alert(
            "Failed to save question"
        );
    }
};
    // =========================
    // EFFECT
    // =========================

    
    useEffect(() => {

        fetchQuestions();

    }, [
        selectedYear,
        selectedSubject,
        selectedTopic,
        selectedPaper,
        search,
        repeatedOnly
    ]);

    return (

        <div className="min-h-screen bg-brand-light p-8">

            {/* HEADER */}

            <div className="mb-8">

                <h1 className="text-5xl font-black text-brand-dark">

                    Question Library

                </h1>

                <p className="text-brand-muted mt-2 text-lg">

                    Explore UPSC PYQs by year,
                    subject, topic, and paper.

                </p>

            </div>

            <div className="grid grid-cols-12 gap-6">

                {/* SIDEBAR */}

                <div className="col-span-3 bg-white rounded-[32px] border border-brand-border p-6 h-fit sticky top-6">

                    <h2 className="text-sm font-black uppercase tracking-widest text-brand-muted mb-6">

                        Filters

                    </h2>

                    {/* YEAR */}

                    <div className="mb-6">

                        <label className="text-xs font-black uppercase text-brand-muted mb-2 block">

                            Year

                        </label>

                        <select
                            value={selectedYear}
                            onChange={(e) =>
                                setSelectedYear(
                                    e.target.value
                                )
                            }
                            className="w-full rounded-2xl border border-brand-border px-4 py-3 bg-brand-light font-bold"
                        >

                            <option value="">
                                All Years
                            </option>

                            {
                                [
                                    2024,
                                    2023,
                                    2022,
                                    2021,
                                    2020
                                ].map(year => (

                                    <option
                                        key={year}
                                        value={year}
                                    >

                                        {year}

                                    </option>
                                ))
                            }

                        </select>

                    </div>

                    {/* PAPER */}

                    <div className="mb-6">

                        <label className="text-xs font-black uppercase text-brand-muted mb-2 block">

                            Paper

                        </label>

                        <select
                            value={selectedPaper}
                            onChange={(e) =>
                                setSelectedPaper(
                                    e.target.value
                                )
                            }
                            className="w-full rounded-2xl border border-brand-border px-4 py-3 bg-brand-light font-bold"
                        >

                            <option value="">
                                All Papers
                            </option>

                            <option value="GS1">
                                GS1
                            </option>

                            <option value="CSAT">
                                CSAT
                            </option>

                        </select>

                    </div>

                    {/* SUBJECT */}

                    <div className="mb-6">

                        <label className="text-xs font-black uppercase text-brand-muted mb-2 block">

                            Subject

                        </label>

                        <input
                            value={selectedSubject}
                            onChange={(e) =>
                                setSelectedSubject(
                                    e.target.value
                                )
                            }
                            placeholder="History"
                            className="w-full rounded-2xl border border-brand-border px-4 py-3 bg-brand-light font-bold"
                        />

                    </div>

                    {/* TOPIC */}

                    <div>

                        <label className="text-xs font-black uppercase text-brand-muted mb-2 block">

                            Topic

                        </label>

                        <input
                            value={selectedTopic}
                            onChange={(e) =>
                                setSelectedTopic(
                                    e.target.value
                                )
                            }
                            placeholder="Buddhism"
                            className="w-full rounded-2xl border border-brand-border px-4 py-3 bg-brand-light font-bold"
                        />

                    </div>

                </div>

                {/* MAIN */}

                <div className="col-span-9">

                    {/* SEARCH */}

                    <div className="flex items-center gap-3 mb-6">

    <input
        type="checkbox"
        checked={repeatedOnly}
        onChange={() =>
            setRepeatedOnly(
                !repeatedOnly
            )
        }
        className="w-5 h-5 accent-black"
    />

    <span className="font-bold text-sm text-brand-dark uppercase tracking-wider">

        Only Repeated Themes

    </span>

</div>

                    <div className="bg-white rounded-[32px] border border-brand-border p-4 mb-6 flex items-center gap-3">

                        <Search
                            size={20}
                            className="text-brand-muted"
                        />

                        <input
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                            placeholder="Search questions..."
                            className="w-full outline-none bg-transparent font-bold"
                        />

                    </div>

                    {/* QUESTIONS */}

                    {
                        loading ? (

                            <div className="text-brand-muted font-black uppercase tracking-widest animate-pulse">

                                Loading Questions...

                            </div>

                        ) : (

                           questions.length === 0 ? (

    <div className="bg-white border border-brand-border rounded-[32px] p-16 flex flex-col items-center justify-center text-center">

        <div className="w-20 h-20 rounded-full bg-brand-light flex items-center justify-center mb-6 text-4xl">

            📭

        </div>

        <h2 className="text-3xl font-black text-brand-dark mb-3">

            No Questions Found

        </h2>

        <p className="text-brand-muted font-medium max-w-md leading-relaxed">

            No questions match the selected
            filters. Try changing the year,
            paper, subject, topic, or search query.

        </p>

    </div>

) : (

    <div className="space-y-6">

        {
            questions.map((q) => (

                <div
                    key={q._id}
                    className="bg-white rounded-[32px] border border-brand-border p-6"
                >

                   {/* HEADER */}

<div className="flex items-start justify-between gap-4 mb-6">

    {/* TAGS */}

    <div className="flex items-center gap-3 flex-wrap">

        <div className="px-3 py-1 rounded-full bg-brand-light text-xs font-black uppercase">

            {q.year}

        </div>

        <div className="px-3 py-1 rounded-full bg-brand-light text-xs font-black uppercase">

            {q.paper || "GS1"}

        </div>

        <div className="px-3 py-1 rounded-full bg-brand-light text-xs font-black uppercase">

            {q.subjectName || "General"}

        </div>

        <div className="px-3 py-1 rounded-full bg-brand-light text-xs font-black uppercase">

            {q.topicName || "Mixed"}

        </div>

        {
            q.isRepeatedConcept && (

                <div className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-black uppercase">

                    Repeated Theme

                </div>
            )
        }

    </div>

    {/* BOOKMARK */}

    <button

        onClick={() =>
            toggleBookmark(
                q._id
            )
        }

        className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all ${
            q.isBookmarked
                ? "bg-yellow-100 border-yellow-300 text-yellow-600"
                : "bg-white border-brand-border text-brand-muted"
        }`}
    >

        <Star
            size={20}
            fill={
                q.isBookmarked
                    ? "currentColor"
                    : "none"
            }
        />

    </button>

</div>

                    {/* QUESTION */}

                    <h2 className="text-xl font-black text-brand-dark leading-relaxed mb-6">

                        {q.questionText}

                    </h2>

                    {/* OPTIONS */}

                    <div className="grid grid-cols-2 gap-4">

                        {
                            q.options?.map((option) => (

                                <div
                                    key={option.label}
                                    className="border border-brand-border rounded-2xl p-4 font-bold"
                                >

                                    <span className="text-brand-accent mr-2">

                                        {option.label}.

                                    </span>

                                    {option.text}

                                </div>
                            ))
                        }

                    </div>

                    {/* ANSWER */}

                    <div className="mt-6">

                        <button

                            onClick={() =>

                                setExpandedQuestion(

                                    expandedQuestion === q._id
                                        ? null
                                        : q._id
                                )
                            }

                            className="px-5 py-3 rounded-2xl bg-brand-dark text-white font-bold text-sm hover:opacity-90 transition-all"
                        >

                            {
                                expandedQuestion === q._id
                                    ? "Hide Explanation"
                                    : "Show Answer & Explanation"
                            }

                        </button>
                        <button

    onClick={() =>
        saveToPracticeSet(
            q._id
        )
    }

    className="ml-3 px-5 py-3 rounded-2xl bg-brand-accent text-white font-bold text-sm hover:opacity-90 transition-all inline-flex items-center gap-2"
>

    <Layers size={16} />

    Save To Practice Set

</button>

                        {
                            expandedQuestion === q._id && (

                                <div className="mt-4 border border-brand-border rounded-3xl p-6 bg-brand-light">

                                    <div className="mb-4">

                                        <span className="text-xs uppercase font-black text-brand-muted">

                                            Correct Answer

                                        </span>

                                        <h3 className="text-2xl font-black text-green-600 mt-1">

                                            {q.correctOption}

                                        </h3>

                                    </div>

                                    <div>

                                        <span className="text-xs uppercase font-black text-brand-muted">

                                            Explanation

                                        </span>

                                        <p className="mt-2 text-brand-dark leading-relaxed font-medium">

                                            {
                                                q.explanation
                                                    || "Explanation not available."
                                            }

                                        </p>

                                    </div>

                                </div>
                            )
                        }

                    </div>

                </div>
            ))
        }

    </div>
)
                        )
                    }

                </div>

            </div>

        </div>
    );
}