"use client";

import dynamic from "next/dynamic";

const PracticeSetDetailLogic =
    dynamic(

        () =>
            import(
                "./PracticeSetDetailLogic"
            ),

        {
            ssr: false
        }
    );

export default function Page() {

    return <PracticeSetDetailLogic />;
}