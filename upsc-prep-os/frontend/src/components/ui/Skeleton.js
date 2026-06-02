"use client";

// =========================
// SKELETON COMPONENTS
// (Use these for loading states)
// =========================

export function Skeleton({
    className = "",
    rounded = "rounded-xl"
}) {

    return (

        <div
            className={`bg-gradient-to-r from-brand-light via-brand-border to-brand-light bg-[length:200%_100%] animate-shimmer ${rounded} ${className}`}
        />
    );
}

// =========================
// CARD SKELETON
// =========================

export function CardSkeleton({
    showImage = false
}) {

    return (

        <div className="bg-white border border-brand-border rounded-2xl p-5">

            {showImage && (

                <Skeleton
                    className="w-12 h-12 mb-4"
                    rounded="rounded-2xl"
                />
            )}

            <Skeleton className="w-3/4 h-4 mb-3" />

            <Skeleton className="w-1/2 h-3 mb-3" />

            <Skeleton className="w-full h-8 mt-4" />

        </div>
    );
}

// =========================
// KPI SKELETON
// =========================

export function KpiSkeleton() {

    return (

        <div className="bg-white rounded-2xl p-5 border border-brand-border">

            <Skeleton
                className="w-10 h-10 mb-4"
                rounded="rounded-xl"
            />

            <Skeleton className="w-20 h-3 mb-2" />

            <Skeleton className="w-16 h-7 mb-2" />

            <Skeleton className="w-24 h-3" />

        </div>
    );
}

// =========================
// LIST SKELETON
// =========================

export function ListSkeleton({
    count = 3
}) {

    return (

        <div className="space-y-3">

            {Array.from({ length: count }).map((_, i) => (

                <div
                    key={i}
                    className="bg-white border border-brand-border rounded-2xl p-4 flex items-center gap-3"
                >

                    <Skeleton
                        className="w-10 h-10"
                        rounded="rounded-xl"
                    />

                    <div className="flex-1 space-y-2">

                        <Skeleton className="w-2/3 h-3" />

                        <Skeleton className="w-1/3 h-2" />

                    </div>

                </div>
            ))}

        </div>
    );
}

// =========================
// GRID SKELETON
// =========================

export function GridSkeleton({
    count = 8,
    columns = 4
}) {

    const gridCols = {

        2: "grid-cols-2",

        3: "grid-cols-2 sm:grid-cols-3",

        4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",

        5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
    };

    return (

        <div className={`grid ${gridCols[columns] || gridCols[4]} gap-3`}>

            {Array.from({ length: count }).map((_, i) => (

                <CardSkeleton key={i} showImage />
            ))}

        </div>
    );
}

// =========================
// DASHBOARD SKELETON
// =========================

export function DashboardSkeleton() {

    return (

        <div className="space-y-6 animate-pulse">

            {/* Header */}

            <div>

                <Skeleton className="w-32 h-4 mb-2" />

                <Skeleton className="w-64 h-10 mb-2" />

                <Skeleton className="w-96 h-3" />

            </div>

            {/* KPI Grid */}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

                {Array.from({ length: 4 }).map((_, i) => (

                    <KpiSkeleton key={i} />
                ))}

            </div>

            {/* Main Grid */}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                <div className="lg:col-span-8 space-y-6">

                    <Skeleton className="w-full h-64" rounded="rounded-3xl" />

                    <Skeleton className="w-full h-48" rounded="rounded-3xl" />

                </div>

                <div className="lg:col-span-4 space-y-6">

                    <Skeleton className="w-full h-40" rounded="rounded-3xl" />

                    <Skeleton className="w-full h-32" rounded="rounded-3xl" />

                </div>

            </div>

        </div>
    );
}

// =========================
// PAGE SKELETON
// (Generic full page loader)
// =========================

export function PageSkeleton({
    title = true,
    showHeader = true
}) {

    return (

        <div className="space-y-6 animate-pulse">

            {showHeader && (

                <div>

                    {title && (

                        <Skeleton className="w-48 h-10 mb-2" />
                    )}

                    <Skeleton className="w-72 h-3" />

                </div>
            )}

            <GridSkeleton count={8} columns={4} />

        </div>
    );
}