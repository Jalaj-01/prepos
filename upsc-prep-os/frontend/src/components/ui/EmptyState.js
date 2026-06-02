"use client";

import { motion } from "framer-motion";

import Link from "next/link";

export default function EmptyState({
    emoji = "📭",
    title = "Nothing here yet",
    description = "Get started by adding something",
    actionLabel,
    actionHref,
    onAction,
    secondaryLabel,
    secondaryHref,
    onSecondary
}) {

    return (

        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-brand-border p-8 sm:p-16 text-center"
        >

            <div className="text-5xl sm:text-6xl mb-4">

                {emoji}

            </div>

            <h2 className="text-xl sm:text-2xl font-black text-brand-dark mb-2 tracking-tight">

                {title}

            </h2>

            <p className="text-brand-muted font-bold text-sm max-w-md mx-auto mb-6 leading-relaxed">

                {description}

            </p>

            {(actionLabel || secondaryLabel) && (

                <div className="flex gap-3 justify-center flex-wrap">

                    {actionLabel && (

                        actionHref ? (

                            <Link
                                href={actionHref}
                                className="inline-flex items-center gap-2 px-5 py-3 bg-brand-dark text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-accent transition-all"
                            >
                                {actionLabel}
                            </Link>

                        ) : (

                            <button
                                onClick={onAction}
                                className="inline-flex items-center gap-2 px-5 py-3 bg-brand-dark text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-accent transition-all"
                            >
                                {actionLabel}
                            </button>
                        )
                    )}

                    {secondaryLabel && (

                        secondaryHref ? (

                            <Link
                                href={secondaryHref}
                                className="inline-flex items-center gap-2 px-5 py-3 bg-brand-light text-brand-dark rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-border transition-all"
                            >
                                {secondaryLabel}
                            </Link>

                        ) : (

                            <button
                                onClick={onSecondary}
                                className="inline-flex items-center gap-2 px-5 py-3 bg-brand-light text-brand-dark rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-border transition-all"
                            >
                                {secondaryLabel}
                            </button>
                        )
                    )}

                </div>
            )}

        </motion.div>
    );
}