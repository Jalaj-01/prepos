"use client";

import dynamic from "next/dynamic";

import Footer from "@/components/layout/Footer";

const RepeatedThemesLogic =
    dynamic(
        () => import("./RepeatedThemesLogic"),
        { ssr: false }
    );

export default function Page() {

    return (

        <div className="min-h-screen bg-brand-light flex flex-col">

            <div className="flex-1">

                <RepeatedThemesLogic />

            </div>

            <Footer />

        </div>
    );
}