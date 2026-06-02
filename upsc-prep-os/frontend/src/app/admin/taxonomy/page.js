"use client";

import nextDynamic from "next/dynamic";

export const dynamic = "force-dynamic";

const TaxonomyManager =
    nextDynamic(

        () =>
            import(
                "./TaxonomyManager"
            ),

        {
            ssr: false
        }
    );

export default function Page() {

    return <TaxonomyManager />;
}