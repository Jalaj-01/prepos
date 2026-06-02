"use client";

import {

    useEffect,
    useState

} from "react";

import axios from "axios";

import {

    Layers,
    Trash2

} from "lucide-react";

export default function PracticeSetsLogic() {

    const [

        sets,

        setSets

    ] = useState([]);

    const [

        loading,

        setLoading

    ] = useState(true);

    // =========================
    // FETCH SETS
    // =========================

    const fetchSets =
    async () => {

        try {

            const userInfo =
                JSON.parse(
                    localStorage.getItem(
                        "userInfo"
                    )
                );

            const response =
                await axios.get(

                    "http://localhost:5000/api/practice-sets",

                    {
                        headers: {

                            Authorization:
                                `Bearer ${userInfo.token}`
                        }
                    }
                );

            setSets(
                response.data
            );

        } catch (error) {

            console.error(
                "Failed to fetch practice sets",
                error
            );

        } finally {

            setLoading(false);
        }
    };

    // =========================
    // DELETE SET
    // =========================

    const deleteSet =
    async (id) => {

        try {

            const userInfo =
                JSON.parse(
                    localStorage.getItem(
                        "userInfo"
                    )
                );

            await axios.delete(

                `http://localhost:5000/api/practice-sets/${id}`,

                {
                    headers: {

                        Authorization:
                            `Bearer ${userInfo.token}`
                    }
                }
            );

            fetchSets();

        } catch (error) {

            console.error(
                "Delete failed",
                error
            );
        }
    };

    useEffect(() => {

        fetchSets();

    }, []);

    return (

        <div className="min-h-screen bg-brand-light p-8">

            <div className="mb-10">

                <h1 className="text-5xl font-black text-brand-dark">

                    Practice Sets

                </h1>

                <p className="text-brand-muted mt-2 text-lg">

                    Your saved revision collections.

                </p>

            </div>

            {
                loading ? (

                    <div className="font-black uppercase tracking-widest animate-pulse text-brand-muted">

                        Loading Practice Sets...

                    </div>

                ) : (

                    sets.length === 0 ? (

                        <div className="bg-white border border-brand-border rounded-[32px] p-16 text-center">

                            <div className="text-5xl mb-5">

                                📚

                            </div>

                            <h2 className="text-3xl font-black text-brand-dark mb-3">

                                No Practice Sets Yet

                            </h2>

                            <p className="text-brand-muted">

                                Save questions from Question Library.

                            </p>

                        </div>

                    ) : (

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {
                                sets.map(set => (

                                    <div

                                        key={set._id}

                                        className="bg-white border border-brand-border rounded-[32px] p-8"
                                    >

                                        <div className="flex items-start justify-between gap-4">

                                            <div>

                                                <div className="flex items-center gap-2 mb-3">

                                                    <Layers
                                                        size={18}
                                                        className="text-brand-muted"
                                                    />

                                                    <span className="text-xs uppercase tracking-widest font-black text-brand-muted">

                                                        Practice Collection

                                                    </span>

                                                </div>

                                                <h2 className="text-3xl font-black text-brand-dark mb-3">

                                                    {set.title}

                                                </h2>

                                                <p className="text-brand-muted leading-relaxed">

                                                    {
                                                        set.description
                                                        || "No description"
                                                    }

                                                </p>

                                            </div>

                                            <button

                                                onClick={() =>
                                                    deleteSet(
                                                        set._id
                                                    )
                                                }

                                                className="w-12 h-12 rounded-2xl bg-red-100 text-red-500 flex items-center justify-center"
                                            >

                                                <Trash2 size={18} />

                                            </button>

                                        </div>

                                        <div className="mt-8 flex items-center justify-between">

    <div className="text-sm font-black uppercase tracking-wider text-brand-muted">

        {
            set.questions?.length
        } Questions

    </div>

    <button

        onClick={() =>

            window.location.href =

                `/practice-sets/${set._id}`
        }

        className="px-5 py-3 rounded-2xl bg-brand-dark text-white text-xs font-black uppercase tracking-widest"
    >

        Open Set

    </button>

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