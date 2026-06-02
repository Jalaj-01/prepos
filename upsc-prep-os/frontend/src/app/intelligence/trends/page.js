"use client";

import dynamic from "next/dynamic";

const TrendsLogic =
    dynamic(

        () =>
            import(
                "./TrendsLogic"
            ),

        {
            ssr: false
        }
    );

export default function Page() {

    return <TrendsLogic />;
}