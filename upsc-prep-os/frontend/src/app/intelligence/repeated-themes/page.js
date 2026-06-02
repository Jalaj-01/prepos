"use client";

import dynamic from "next/dynamic";

const RepeatedThemesLogic =
    dynamic(

        () =>
            import(
                "./RepeatedThemesLogic"
            ),

        {
            ssr: false
        }
    );

export default function Page() {

    return (
        <RepeatedThemesLogic />
    );
}