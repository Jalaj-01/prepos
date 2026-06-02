"use client";

import {

    useEffect,
    useState

} from "react";

import axios from "axios";

import {

    Flame,
    Calendar,
    Layers,
    Brain

} from "lucide-react";

export default function RepeatedThemesLogic() {

    const [

        themes,

        setThemes

    ] = useState([]);

    const [

        loading,

        setLoading

    ] = useState(true);

    // =========================
    // FETCH THEMES
    // =========================

    const fetchThemes =
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

                return;
            }

            const userInfo =
                JSON.parse(
                    rawUserInfo
                );

            const token =
                userInfo?.token;

            const response =
                await axios.get(

                    "http://localhost:5000/api/intelligence/repeated-themes",

                    {
                        headers: {

                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            setThemes(
                response.data
            );

        } catch (error) {

            console.error(
                "Failed to fetch themes",
                error
            );

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {

        fetchThemes();

    }, []);

    // =========================
    // UI
    // =========================

    return (

        <div className="min-h-screen bg-brand-light p-8">

            {/* HEADER */}

            <div className="mb-10">

                <div className="flex items-center gap-4 mb-4">

                    <div className="w-16 h-16 rounded-3xl bg-orange-100 flex items-center justify-center text-orange-600">

                        <Brain size={30} />

                    </div>

                    <div>

                        <h1 className="text-5xl font-black text-brand-dark">

                            Repeated Themes

                        </h1>

                        <p className="text-brand-muted text-lg mt-2">

                            High-frequency UPSC concepts
                            repeated across years.

                        </p>

                    </div>

                </div>

            </div>

            {/* LOADING */}

            {
                loading ? (

                    <div className="font-black uppercase tracking-widest animate-pulse text-brand-muted">

                        Analyzing UPSC Patterns...

                    </div>

                ) : (

                    themes.length === 0 ? (

                        <div className="bg-white border border-brand-border rounded-[32px] p-16 flex flex-col items-center justify-center text-center">

                            <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mb-6 text-4xl">

                                🔥

                            </div>

                            <h2 className="text-3xl font-black text-brand-dark mb-3">

                                No Repeated Themes Yet

                            </h2>

                            <p className="text-brand-muted max-w-xl leading-relaxed font-medium">

                                The intelligence engine
                                has not detected repeated
                                conceptual patterns yet.

                            </p>

                        </div>

                    ) : (

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {
                                themes.map((theme, idx) => (

                                    <div

                                        key={idx}

                                        className="bg-white rounded-[32px] border border-brand-border p-8"
                                    >

                                        {/* TOP */}

                                        <div className="flex items-start justify-between gap-4 mb-6">

                                            <div>

                                                <div className="flex items-center gap-2 mb-3">

                                                    <Flame
                                                        size={18}
                                                        className="text-orange-500"
                                                    />

                                                    <span className="text-xs uppercase tracking-widest font-black text-orange-600">

                                                        High Yield Theme

                                                    </span>

                                                </div>

                                                <h2 className="text-2xl font-black text-brand-dark leading-snug">

                                                    {
                                                        theme.topics?.[0]
                                                        || "General Theme"
                                                    }

                                                </h2>

                                            </div>

                                            <div className="bg-brand-dark text-white rounded-2xl px-4 py-3 text-center min-w-[90px]">

                                                <div className="text-3xl font-black">

                                                    {
                                                        theme.totalOccurrences
                                                    }

                                                </div>

                                                <div className="text-[10px] uppercase tracking-widest font-bold opacity-70">

                                                    Repeats

                                                </div>

                                            </div>

                                        </div>

                                        {/* META */}

                                        <div className="space-y-4">

                                            {/* YEARS */}

                                            <div className="flex items-start gap-3">

                                                <Calendar
                                                    size={18}
                                                    className="text-brand-muted mt-1"
                                                />

                                                <div>

                                                    <div className="text-xs uppercase tracking-widest font-black text-brand-muted mb-2">

                                                        Appeared In Years

                                                    </div>

                                                    <div className="flex flex-wrap gap-2">

                                                        {
                                                            theme.years?.map((year) => (

                                                                <div

                                                                    key={year}

                                                                    className="px-3 py-1 rounded-full bg-brand-light text-xs font-black"
                                                                >

                                                                    {year}

                                                                </div>
                                                            ))
                                                        }

                                                    </div>

                                                </div>

                                            </div>

                                            {/* SUBJECT */}

                                            <div className="flex items-start gap-3">

                                                <Layers
                                                    size={18}
                                                    className="text-brand-muted mt-1"
                                                />

                                                <div>

                                                    <div className="text-xs uppercase tracking-widest font-black text-brand-muted mb-2">

                                                        Subjects

                                                    </div>

                                                    <div className="flex flex-wrap gap-2">

                                                        {
                                                            theme.subjects?.map((subject, idx) => (

                                                                <div

                                                                    key={idx}

                                                                    className="px-3 py-1 rounded-full bg-brand-light text-xs font-black"
                                                                >

                                                                    {
                                                                        subject
                                                                        || "General"
                                                                    }

                                                                </div>
                                                            ))
                                                        }

                                                    </div>

                                                </div>

                                            </div>

                                        </div>

                                        {/* SAMPLE */}

                                        <div className="mt-8 border-t border-brand-border pt-6">

                                            <div className="text-xs uppercase tracking-widest font-black text-brand-muted mb-3">

                                                Sample Question

                                            </div>

                                            <p className="font-bold leading-relaxed text-brand-dark">

                                                {
                                                    theme.sampleQuestion
                                                }

                                            </p>

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