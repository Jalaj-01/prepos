"use client";

import nextDynamic from "next/dynamic";

export const dynamic = "force-dynamic";

const QuestionLibraryLogic =
    nextDynamic(

        () =>
            import(
                "./QuestionLibraryLogic"
            ),

        {
            ssr: false,

            loading: () => (

                <div className="min-h-screen bg-brand-light flex items-center justify-center font-black text-brand-muted uppercase tracking-widest animate-pulse">

                    Loading Question Library...

                </div>
            )
        }
    );

export default function Page() {

    return <QuestionLibraryLogic />;
}