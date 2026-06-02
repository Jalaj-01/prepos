"use client";

import dynamic from "next/dynamic";

const PracticeSetsLogic =
    dynamic(

        () =>
            import(
                "./PracticeSetsLogic"
            ),

        {
            ssr: false
        }
    );

export default function Page() {

    return <PracticeSetsLogic />;
}