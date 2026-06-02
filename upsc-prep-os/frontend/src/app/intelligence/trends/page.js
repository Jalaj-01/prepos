"use client";

import dynamic from "next/dynamic";

import Footer from "@/components/layout/Footer";

const TrendsLogic =
    dynamic(
        () => import("./TrendsLogic"),
        { ssr: false }
    );

export default function Page() {

    return (

        <div className="min-h-screen bg-brand-light flex flex-col">

            <div className="flex-1">

                <TrendsLogic />

            </div>

            <Footer />

        </div>
    );
}