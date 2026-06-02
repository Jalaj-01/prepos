"use client";

import dynamic from "next/dynamic";

const BookmarksLogic =
    dynamic(
        () => import("./BookmarksLogic"),
        { ssr: false }
    );

export default function Page() {
    return <BookmarksLogic />;
}