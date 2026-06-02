"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Force client-side only to prevent SSR/Vercel build errors
const BulkImporterLogic = dynamic(
    () => import("./BulkImporterLogic"),
    { ssr: false }
);

export default function BulkImporterPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center p-20 font-black animate-pulse text-brand-muted uppercase tracking-widest">
                    Waking up AI Engine...
                </div>
            }
        >
            <BulkImporterLogic />
        </Suspense>
    );
}