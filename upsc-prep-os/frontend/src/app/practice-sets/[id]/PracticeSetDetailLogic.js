"use client";

import {

    useEffect,
    useState

} from "react";

import {

    useParams

} from "next/navigation";

import axios from "axios";

export default function PracticeSetDetailLogic() {

    // =========================
    // PARAMS
    // =========================

    const params =
        useParams();

    const id =
        params?.id;

    // =========================
    // STATES
    // =========================

    const [

        practiceSet,

        setPracticeSet

    ] = useState(null);

    const [

        loading,

        setLoading

    ] = useState(true);

    const [

        expandedQuestion,

        setExpandedQuestion

    ] = useState(null);

    // =========================
    // FETCH SET
    // =========================

    const fetchSet =
    async () => {

        try {

            const rawUserInfo =
                localStorage.getItem(
                    "userInfo"
                );

            if (!rawUserInfo) {

                console.error(
                    "No user info found"
                );

                setLoading(false);

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

                setLoading(false);

                return;
            }

            const response =
                await axios.get(

                    "http://localhost:5000/api/practice-sets",

                    {
                        headers: {

                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            const foundSet =
                response.data.find(
                    set => set._id === id
                );

            setPracticeSet(
                foundSet || null
            );

        } catch (error) {

            console.error(
                "Failed to fetch practice set",
                error
            );

        } finally {

            setLoading(false);
        }
    };

    // =========================
    // EFFECT
    // =========================

    useEffect(() => {

        if (id) {

            fetchSet();
        }

    }, [id]);

    // =========================
    // LOADING
    // =========================

    if (loading) {

        return (

            <div className="min-h-screen bg-brand-light p-10">

                <div className="font-black uppercase tracking-widest animate-pulse text-brand-muted">

                    Loading Practice Set...

                </div>

            </div>
        );
    }

    // =========================
    // NOT FOUND
    // =========================

    if (!practiceSet) {

        return (

            <div className="min-h-screen bg-brand-light p-10 flex items-center justify-center">

                <div className="bg-white border border-brand-border rounded-[32px] p-16 text-center max-w-2xl w-full">

                    <div className="text-6xl mb-6">

                        📚

                    </div>

                    <h1 className="text-4xl font-black text-brand-dark mb-4">

                        Practice Set Not Found

                    </h1>

                    <p className="text-brand-muted text-lg leading-relaxed">

                        This practice set may have been deleted or is unavailable.

                    </p>

                </div>

            </div>
        );
    }

    // =========================
    // UI
    // =========================

    return (

        <div className="min-h-screen bg-brand-light p-8">

            {/* HEADER */}

            <div className="mb-10">

                <h1 className="text-5xl font-black text-brand-dark mb-3">

                    {practiceSet.title}

                </h1>

                <p className="text-brand-muted text-lg">

                    {
                        practiceSet.description
                    }

                </p>

            </div>

            {/* QUESTIONS */}

            <div className="space-y-8">

                {
                    practiceSet.questions?.map(

                        (q) => (

                            <div

                                key={q._id}

                                className="bg-white border border-brand-border rounded-[36px] p-8"
                            >

                                {/* META */}

                                <div className="flex items-center gap-3 mb-6 flex-wrap">

                                    <div className="px-4 py-2 rounded-full bg-brand-light text-xs font-black uppercase tracking-wider">

                                        {q.year}

                                    </div>

                                    <div className="px-4 py-2 rounded-full bg-brand-light text-xs font-black uppercase tracking-wider">

                                        {q.paper}

                                    </div>

                                </div>

                                {/* QUESTION */}

                                <h2 className="text-3xl font-black text-brand-dark leading-relaxed mb-8">

                                    {q.questionText}

                                </h2>

                                {/* OPTIONS */}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                    {
                                        q.options?.map(

                                            option => (

                                                <div

                                                    key={option.label}

                                                    className="border border-brand-border rounded-3xl p-5 bg-brand-light"
                                                >

                                                    <span className="text-brand-accent font-black mr-2">

                                                        {option.label}.

                                                    </span>

                                                    <span className="font-bold text-brand-dark">

                                                        {option.text}

                                                    </span>

                                                </div>
                                            )
                                        )
                                    }

                                </div>

                                {/* ANSWER */}

                                <div className="mt-8">

                                    <button

                                        onClick={() =>

                                            setExpandedQuestion(

                                                expandedQuestion === q._id
                                                    ? null
                                                    : q._id
                                            )
                                        }

                                        className="px-6 py-4 rounded-2xl bg-brand-dark text-white font-black uppercase tracking-wider text-sm"
                                    >

                                        {
                                            expandedQuestion === q._id

                                                ? "Hide Explanation"

                                                : "Show Answer & Explanation"
                                        }

                                    </button>

                                    {
                                        expandedQuestion === q._id && (

                                            <div className="mt-6 border border-brand-border rounded-[32px] p-8 bg-brand-light">

                                                {/* CORRECT ANSWER */}

                                                <div className="mb-6">

                                                    <span className="text-xs uppercase font-black tracking-widest text-brand-muted">

                                                        Correct Answer

                                                    </span>

                                                    <h3 className="text-4xl font-black text-green-600 mt-2">

                                                        {q.correctOption}

                                                    </h3>

                                                </div>

                                                {/* EXPLANATION */}

                                                <div>

                                                    <span className="text-xs uppercase font-black tracking-widest text-brand-muted">

                                                        Explanation

                                                    </span>

                                                    <p className="mt-3 text-brand-dark leading-relaxed font-medium text-lg">

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
                        )
                    )
                }

            </div>

        </div>
    );
}