"use client";

import {

    useEffect,

    useState

} from "react";

import axios from "axios";

import {

    Star,

    Search

} from "lucide-react";

export default function BookmarksLogic() {

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

        search,

        setSearch

    ] = useState("");

    // =========================
    // AUTH
    // =========================

    const getAuthConfig = () => {

        const userInfo =
            JSON.parse(

                localStorage.getItem(
                    "userInfo"
                )
            );

        const token =
            userInfo?.token;

        return {

            headers: {

                Authorization:
                    `Bearer ${token}`
            }
        };
    };

    // =========================
    // FETCH
    // =========================

    const fetchBookmarks =
    async () => {

        try {

            setLoading(true);

            const response =
                await axios.get(

                    "http://localhost:5000/api/bookmarks",

                    getAuthConfig()
                );

            let data =
                response.data;

            // SEARCH FILTER

            if (search) {

                data =
                    data.filter(q =>

                        q.questionText
                            ?.toLowerCase()
                            .includes(

                                search.toLowerCase()
                            )
                    );
            }

            setQuestions(data);

        } catch (error) {

            console.error(
                "Failed to fetch bookmarks",
                error
            );

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {

        fetchBookmarks();

    }, [search]);

    // =========================
    // TOGGLE BOOKMARK
    // =========================

    const toggleBookmark =
    async (questionId) => {

        try {

            await axios.put(

                `http://localhost:5000/api/bookmarks/${questionId}`,

                {},

                getAuthConfig()
            );

            fetchBookmarks();

        } catch (error) {

            console.error(
                "Bookmark toggle failed",
                error
            );
        }
    };

    return (

        <div className="min-h-screen bg-brand-light p-8">

            {/* HEADER */}

            <div className="mb-8">

                <h1 className="text-5xl font-black text-brand-dark">

                    Bookmarked Questions

                </h1>

                <p className="text-brand-muted mt-2 text-lg">

                    Curated important PYQs
                    and revision-worthy concepts.

                </p>

            </div>

            {/* SEARCH */}

            <div className="bg-white rounded-[32px] border border-brand-border p-4 mb-8 flex items-center gap-3">

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

                    placeholder="Search bookmarked questions..."

                    className="w-full outline-none bg-transparent font-bold"
                />

            </div>

            {/* CONTENT */}

            {
                loading ? (

                    <div className="font-black uppercase tracking-widest text-brand-muted animate-pulse">

                        Loading Bookmarks...

                    </div>

                ) : (

                    questions.length === 0 ? (

                        <div className="bg-white border border-brand-border rounded-[32px] p-16 flex flex-col items-center justify-center text-center">

                            <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mb-6 text-4xl">

                                ⭐

                            </div>

                            <h2 className="text-3xl font-black text-brand-dark mb-3">

                                No Bookmarked Questions

                            </h2>

                            <p className="text-brand-muted font-medium max-w-md leading-relaxed">

                                Bookmark important
                                questions from the
                                Question Library to
                                build revision-ready
                                collections.

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

                                                className="w-12 h-12 rounded-2xl border border-yellow-300 bg-yellow-100 text-yellow-600 flex items-center justify-center"
                                            >

                                                <Star
                                                    size={20}
                                                    fill="currentColor"
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
    );
}