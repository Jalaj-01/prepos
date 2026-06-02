"use client";

import {

    useEffect,
    useState

} from "react";

import axios from "axios";

import {

    TrendingUp,
    Calendar,
    Layers

} from "lucide-react";

export default function TrendsLogic() {

    const [

        trends,

        setTrends

    ] = useState([]);

    const [

        loading,

        setLoading

    ] = useState(true);

    // =========================
    // FETCH TRENDS
    // =========================

    const fetchTrends =
    async () => {

        try {

            const response =
                await axios.get(

                    "http://localhost:5000/api/intelligence/trends"
                );

            setTrends(
                response.data
            );

        } catch (error) {

            console.error(
                "Trend fetch failed",
                error
            );

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {

        fetchTrends();

    }, []);

    return (

        <div className="min-h-screen bg-brand-light p-8">

            {/* HEADER */}

            <div className="mb-10">

                <div className="flex items-center gap-4 mb-4">

                    <div className="w-16 h-16 rounded-3xl bg-indigo-100 flex items-center justify-center text-indigo-600">

                        <TrendingUp size={30} />

                    </div>

                    <div>

                        <h1 className="text-5xl font-black text-brand-dark">

                            Trend Heatmaps

                        </h1>

                        <p className="text-brand-muted text-lg mt-2">

                            Analyze UPSC subject
                            evolution across years.

                        </p>

                    </div>

                </div>

            </div>

            {/* LOADING */}

            {
                loading ? (

                    <div className="font-black uppercase tracking-widest animate-pulse text-brand-muted">

                        Analyzing UPSC Trends...

                    </div>

                ) : (

                    trends.length === 0 ? (

                        <div className="bg-white border border-brand-border rounded-[32px] p-16 flex flex-col items-center justify-center text-center">

                            <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center mb-6 text-4xl">

                                📈

                            </div>

                            <h2 className="text-3xl font-black text-brand-dark mb-3">

                                No Trend Data Found

                            </h2>

                            <p className="text-brand-muted max-w-xl leading-relaxed font-medium">

                                Your database currently
                                has insufficient subject
                                intelligence data for
                                heatmap generation.

                            </p>

                        </div>

                    ) : (

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                            {
                                trends.map((item, index) => (

                                    <div

                                        key={index}

                                        className="bg-white rounded-[32px] border border-brand-border p-8"
                                    >

                                        {/* TOP */}

                                        <div className="flex items-center justify-between mb-6">

                                            <div className="flex items-center gap-2">

                                                <Calendar
                                                    size={16}
                                                    className="text-brand-muted"
                                                />

                                                <span className="text-xs uppercase tracking-widest font-black text-brand-muted">

                                                    {item.year}

                                                </span>

                                            </div>

                                            <div className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-600 text-xs font-black uppercase">

                                                {item.count} Questions

                                            </div>

                                        </div>

                                        {/* SUBJECT */}

                                        <div className="flex items-start gap-3">

                                            <Layers
                                                size={20}
                                                className="text-brand-muted mt-1"
                                            />

                                            <div>

                                                <div className="text-xs uppercase tracking-widest font-black text-brand-muted mb-2">

                                                    Subject

                                                </div>

                                                <h2 className="text-3xl font-black text-brand-dark leading-snug">

                                                    {
                                                        item.subject
                                                        || "General"
                                                    }

                                                </h2>

                                            </div>

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