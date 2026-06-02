"use client";

import { useEffect, useState } from "react";

import axios from "axios";

import {
    Search,
    Star,
    Layers,
    X
} from "lucide-react";

import Sidebar from "@/components/layout/Sidebar";

import TopHeader from "@/components/layout/TopHeader";

import Footer from "@/components/layout/Footer";

import MobileNav from "@/components/layout/MobileNav";

import { showToast } from "@/components/ui/Toast";

import { GridSkeleton } from "@/components/ui/Skeleton";

import EmptyState from "@/components/ui/EmptyState";

import PageHeader from "@/components/ui/PageHeader";

export default function QuestionLibraryLogic() {

    const [user, setUser] = useState(null);

    const [questions, setQuestions] = useState([]);

    const [loading, setLoading] = useState(true);

    const [expandedQuestion, setExpandedQuestion] = useState(null);

    const [selectedYear, setSelectedYear] = useState("");

    const [selectedSubject, setSelectedSubject] = useState("");

    const [selectedTopic, setSelectedTopic] = useState("");

    const [selectedPaper, setSelectedPaper] = useState("");

    const [search, setSearch] = useState("");

    const [repeatedOnly, setRepeatedOnly] = useState(false);

    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    // PER-USER bookmark tracking

    const [bookmarkedIds, setBookmarkedIds] = useState(new Set());

    // =========================
    // AUTH
    // =========================

    useEffect(() => {

        const info = localStorage.getItem("userInfo");

        if (!info) {
            window.location.href = "/login";
            return;
        }

        setUser(JSON.parse(info));

    }, []);

    // =========================
    // FETCH QUESTIONS + BOOKMARKS
    // =========================

    useEffect(() => {

        if (user) {

            fetchQuestions();

            fetchMyBookmarkIds();
        }

    }, [
        user,
        selectedYear,
        selectedSubject,
        selectedTopic,
        selectedPaper,
        search,
        repeatedOnly
    ]);

    const fetchQuestions = async () => {

        try {

            setLoading(true);

            const params = {};

            if (selectedYear) params.year = selectedYear;

            if (selectedSubject) params.subject = selectedSubject;

            if (selectedTopic) params.topic = selectedTopic;

            if (selectedPaper) params.paper = selectedPaper;

            if (search) params.q = search;

            if (repeatedOnly) params.repeated = true;

            const response = await axios.get(

                `${process.env.NEXT_PUBLIC_API_URL}/api/search`,

                { params }
            );

            setQuestions(response.data);

        } catch (error) {

            console.error("Failed to fetch questions", error);

            showToast.error("Failed to load questions");

        } finally {

            setLoading(false);
        }
    };

    // =========================
    // FETCH USER'S BOOKMARKED IDS
    // =========================

    const fetchMyBookmarkIds = async () => {

        try {

            const { data } = await axios.get(

                `${process.env.NEXT_PUBLIC_API_URL}/api/bookmarks`,

                {
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    }
                }
            );

            // Create a Set of bookmarked question IDs for fast lookup

            const ids = new Set(
                data.map(q => q._id)
            );

            setBookmarkedIds(ids);

        } catch (error) {

            console.error("Failed to fetch bookmark IDs", error);
        }
    };

    // =========================
    // TOGGLE BOOKMARK (PER-USER)
    // =========================

  const toggleBookmark = async (questionId) => {

    try {

        const { data } = await axios.put(

            `${process.env.NEXT_PUBLIC_API_URL}/api/bookmarks/${questionId}`,

            {},

            {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            }
        );

        // Update local state

        setBookmarkedIds(prev => {

            const newSet = new Set(prev);

            if (data.isBookmarked) {

                newSet.add(questionId);

            } else {

                newSet.delete(questionId);
            }

            return newSet;
        });

        // Show toast OUTSIDE the state updater

        if (data.isBookmarked) {

            showToast.success("Bookmarked!");

        } else {

            showToast.success("Bookmark removed");
        }

    } catch (error) {

        console.error("Bookmark failed", error);

        showToast.error("Failed to bookmark");
    }
};

    // =========================
    // SAVE TO PRACTICE SET
    // =========================

    const saveToPracticeSet = async (questionId) => {

        const title = prompt("Practice Set Name");

        if (!title) return;

        try {

            await axios.post(

                `${process.env.NEXT_PUBLIC_API_URL}/api/practice-sets`,

                {
                    title,
                    description: "Saved from Question Library",
                    questions: [questionId]
                },

                {
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    }
                }
            );

            showToast.success("Saved to Practice Set!");

        } catch (error) {

            console.error("Save failed", error);

            showToast.error("Failed to save");
        }
    };

    // =========================
    // CHECK IF BOOKMARKED
    // =========================

    const isBookmarked = (questionId) => {

        return bookmarkedIds.has(questionId);
    };

    if (!user) return null;

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

                <main className="flex-1 p-3 sm:p-6 lg:p-10 max-w-[1600px] w-full mx-auto">

                    {/* HEADER */}

                    <PageHeader
                        icon={Search}
                        iconBg="bg-brand-accent/10"
                        iconColor="text-brand-accent"
                        title="Question Library"
                        description="Explore UPSC PYQs by year, subject, topic, and paper."
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">

                        {/* SIDEBAR FILTERS */}

                        <div className="lg:col-span-3">

                            <div className="bg-white rounded-2xl sm:rounded-3xl border border-brand-border p-4 sm:p-6 lg:sticky lg:top-24">

                                <h2 className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-4 sm:mb-6">

                                    Filters

                                </h2>

                                {/* YEAR */}

                                <div className="mb-4 sm:mb-6">

                                    <label className="text-[10px] font-black uppercase text-brand-muted mb-2 block">

                                        Year

                                    </label>

                                    <select
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(e.target.value)}
                                        className="w-full rounded-xl border border-brand-border px-3 py-2.5 bg-brand-light font-bold text-sm"
                                    >
                                        <option value="">All Years</option>
                                        {[2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017].map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>

                                </div>

                                {/* PAPER */}

                                <div className="mb-4 sm:mb-6">

                                    <label className="text-[10px] font-black uppercase text-brand-muted mb-2 block">

                                        Paper

                                    </label>

                                    <select
                                        value={selectedPaper}
                                        onChange={(e) => setSelectedPaper(e.target.value)}
                                        className="w-full rounded-xl border border-brand-border px-3 py-2.5 bg-brand-light font-bold text-sm"
                                    >
                                        <option value="">All Papers</option>
                                        <option value="GS1">GS1</option>
                                        <option value="CSAT">CSAT</option>
                                    </select>

                                </div>

                                {/* SUBJECT */}

                                <div className="mb-4 sm:mb-6">

                                    <label className="text-[10px] font-black uppercase text-brand-muted mb-2 block">

                                        Subject

                                    </label>

                                    <input
                                        value={selectedSubject}
                                        onChange={(e) => setSelectedSubject(e.target.value)}
                                        placeholder="History"
                                        className="w-full rounded-xl border border-brand-border px-3 py-2.5 bg-brand-light font-bold text-sm"
                                    />

                                </div>

                                {/* TOPIC */}

                                <div className="mb-4 sm:mb-6">

                                    <label className="text-[10px] font-black uppercase text-brand-muted mb-2 block">

                                        Topic

                                    </label>

                                    <input
                                        value={selectedTopic}
                                        onChange={(e) => setSelectedTopic(e.target.value)}
                                        placeholder="Buddhism"
                                        className="w-full rounded-xl border border-brand-border px-3 py-2.5 bg-brand-light font-bold text-sm"
                                    />

                                </div>

                                {/* REPEATED ONLY */}

                                <label className="flex items-center gap-3 cursor-pointer p-3 bg-brand-light rounded-xl border border-brand-border">

                                    <input
                                        type="checkbox"
                                        checked={repeatedOnly}
                                        onChange={() => setRepeatedOnly(!repeatedOnly)}
                                        className="w-4 h-4 accent-brand-dark"
                                    />

                                    <span className="font-bold text-xs text-brand-dark uppercase tracking-wider">

                                        Repeated Only

                                    </span>

                                </label>

                            </div>

                        </div>

                        {/* MAIN CONTENT */}

                        <div className="lg:col-span-9">

                            {/* SEARCH */}

                            <div className="bg-white rounded-2xl sm:rounded-3xl border border-brand-border p-3 sm:p-4 mb-4 sm:mb-6 flex items-center gap-3">

                                <Search size={18} className="text-brand-muted shrink-0" />

                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search questions..."
                                    className="w-full outline-none bg-transparent font-bold text-sm min-w-0"
                                />

                                {search && (

                                    <button
                                        onClick={() => setSearch("")}
                                        className="p-1 hover:bg-brand-light rounded-lg"
                                    >
                                        <X size={14} className="text-brand-muted" />
                                    </button>
                                )}

                            </div>

                            {/* QUESTIONS LIST */}

                            {loading ? (

                                <GridSkeleton count={4} columns={2} />

                            ) : questions.length === 0 ? (

                                <EmptyState
                                    emoji="📭"
                                    title="No Questions Found"
                                    description="No questions match the selected filters. Try changing the year, paper, subject, topic, or search query."
                                />

                            ) : (

                                <div className="space-y-4 sm:space-y-6">

                                    {questions.map((q) => (

                                        <div
                                            key={q._id}
                                            className="bg-white rounded-2xl sm:rounded-3xl border border-brand-border p-4 sm:p-6"
                                        >

                                            {/* HEADER */}

                                            <div className="flex items-start justify-between gap-3 mb-4 sm:mb-6">

                                                {/* TAGS */}

                                                <div className="flex items-center gap-2 flex-wrap">

                                                    <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[9px] font-black uppercase tracking-widest">

                                                        {q.year}

                                                    </span>

                                                    <span className="px-2.5 py-1 rounded-full bg-brand-light text-brand-muted text-[9px] font-black uppercase tracking-widest">

                                                        {q.paper || "GS1"}

                                                    </span>

                                                    <span className="px-2.5 py-1 rounded-full bg-brand-light text-brand-dark text-[9px] font-black uppercase tracking-widest">

                                                        {q.subjectName || "General"}

                                                    </span>

                                                    <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-[9px] font-black uppercase tracking-widest">

                                                        {q.topicName || "Mixed"}

                                                    </span>

                                                    {q.isRepeatedConcept && (

                                                        <span className="px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 text-[9px] font-black uppercase tracking-widest">

                                                            Repeated

                                                        </span>
                                                    )}

                                                </div>

                                                {/* BOOKMARK STAR (PER-USER) */}

                                                <button
                                                    onClick={() => toggleBookmark(q._id)}
                                                    title={isBookmarked(q._id) ? "Remove bookmark" : "Bookmark this question"}
                                                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl border flex items-center justify-center transition-all shrink-0 ${
                                                        isBookmarked(q._id)
                                                            ? "bg-yellow-100 border-yellow-300 text-yellow-600"
                                                            : "bg-white border-brand-border text-brand-muted hover:border-yellow-300 hover:text-yellow-600"
                                                    }`}
                                                >
                                                    <Star
                                                        size={18}
                                                        fill={
                                                            isBookmarked(q._id)
                                                                ? "currentColor"
                                                                : "none"
                                                        }
                                                    />
                                                </button>

                                            </div>

                                            {/* QUESTION TEXT */}

                                            <h2 className="text-base sm:text-xl font-black text-brand-dark leading-relaxed mb-4 sm:mb-6">

                                                {q.questionText}

                                            </h2>

                                            {/* OPTIONS */}

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">

                                                {q.options?.map((option) => (

                                                    <div
                                                        key={option.label}
                                                        className="border border-brand-border rounded-xl sm:rounded-2xl p-3 sm:p-4 font-bold text-sm"
                                                    >
                                                        <span className="text-brand-accent mr-2 font-black">

                                                            {option.label}.

                                                        </span>

                                                        {option.text}

                                                    </div>
                                                ))}

                                            </div>

                                            {/* ACTION BUTTONS */}

                                            <div className="mt-4 sm:mt-6 flex flex-wrap gap-2 sm:gap-3">

                                                <button
                                                    onClick={() =>
                                                        setExpandedQuestion(
                                                            expandedQuestion === q._id
                                                                ? null
                                                                : q._id
                                                        )
                                                    }
                                                    className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-brand-dark text-white font-bold text-xs sm:text-sm hover:opacity-90 transition-all"
                                                >
                                                    {expandedQuestion === q._id
                                                        ? "Hide Explanation"
                                                        : "Show Answer & Explanation"}
                                                </button>

                                                <button
                                                    onClick={() => saveToPracticeSet(q._id)}
                                                    className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-brand-accent text-white font-bold text-xs sm:text-sm hover:opacity-90 transition-all inline-flex items-center gap-2"
                                                >
                                                    <Layers size={14} />
                                                    <span className="hidden sm:inline">Save To Practice Set</span>
                                                    <span className="sm:hidden">Save</span>
                                                </button>

                                            </div>

                                            {/* EXPANDED ANSWER */}

                                            {expandedQuestion === q._id && (

                                                <div className="mt-4 border border-brand-border rounded-2xl sm:rounded-3xl p-4 sm:p-6 bg-brand-light">

                                                    <div className="mb-4">

                                                        <span className="text-[10px] uppercase font-black text-brand-muted tracking-widest">

                                                            Correct Answer

                                                        </span>

                                                        <h3 className="text-xl sm:text-2xl font-black text-green-600 mt-1">

                                                            {q.correctOption}

                                                        </h3>

                                                    </div>

                                                    <div>

                                                        <span className="text-[10px] uppercase font-black text-brand-muted tracking-widest">

                                                            Explanation

                                                        </span>

                                                        <p className="mt-2 text-brand-dark leading-relaxed font-medium text-sm">

                                                            {q.explanation || "Explanation not available."}

                                                        </p>

                                                    </div>

                                                </div>
                                            )}

                                        </div>
                                    ))}

                                </div>
                            )}

                        </div>

                    </div>

                </main>

                <Footer />

            </div>

        </div>
    );
}