"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

const PER_PAGE_OPTIONS = [10, 25, 50, 100];

export default function Pagination({
    page,
    totalPages,
    total,
    limit,
    onPageChange,
    onLimitChange,
}) {
    if (totalPages <= 0) return null;

    const canPrev = page > 1;
    const canNext = page < totalPages;

    const start = (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);

    return (
        <div className="bg-white border border-brand-border rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            {/* Range info + per-page selector */}
            <div className="flex items-center gap-3 flex-wrap">
                <p className="text-[11px] font-black text-brand-muted">
                    Showing{" "}
                    <span className="text-brand-dark">
                        {start}–{end}
                    </span>{" "}
                    of <span className="text-brand-dark">{total}</span>
                </p>

                <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
                        Per page:
                    </span>
                    <select
                        value={limit}
                        onChange={(e) => onLimitChange(parseInt(e.target.value))}
                        className="bg-brand-light border border-brand-border rounded-lg px-2 py-1 text-xs font-black outline-none focus:border-brand-accent cursor-pointer"
                    >
                        {PER_PAGE_OPTIONS.map((n) => (
                            <option key={n} value={n}>
                                {n}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Page controls */}
            <div className="flex items-center gap-1">
                {/* First page */}
                <button
                    onClick={() => onPageChange(1)}
                    disabled={!canPrev}
                    className="p-2 rounded-lg bg-brand-light border border-brand-border text-brand-muted hover:text-brand-dark hover:border-brand-dark disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    title="First page"
                >
                    <ChevronsLeft size={14} />
                </button>

                {/* Previous */}
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={!canPrev}
                    className="p-2 rounded-lg bg-brand-light border border-brand-border text-brand-muted hover:text-brand-dark hover:border-brand-dark disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    title="Previous page"
                >
                    <ChevronLeft size={14} />
                </button>

                {/* Page indicator */}
                <span className="px-3 py-1.5 bg-brand-dark text-white rounded-lg text-xs font-black tabular-nums min-w-[70px] text-center">
                    {page} / {totalPages}
                </span>

                {/* Next */}
                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={!canNext}
                    className="p-2 rounded-lg bg-brand-light border border-brand-border text-brand-muted hover:text-brand-dark hover:border-brand-dark disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    title="Next page"
                >
                    <ChevronRight size={14} />
                </button>

                {/* Last page */}
                <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={!canNext}
                    className="p-2 rounded-lg bg-brand-light border border-brand-border text-brand-muted hover:text-brand-dark hover:border-brand-dark disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    title="Last page"
                >
                    <ChevronsRight size={14} />
                </button>
            </div>
        </div>
    );
}