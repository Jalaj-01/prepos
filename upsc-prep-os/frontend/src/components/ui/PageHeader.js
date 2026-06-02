"use client";

import { motion } from "framer-motion";

export default function PageHeader({
    icon: Icon,
    iconBg = "bg-brand-accent/10",
    iconColor = "text-brand-accent",
    title,
    description,
    children
}) {

    return (

        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
        >

            <div className="flex-1 min-w-0">

                <div className="flex items-center gap-3 mb-2">

                    {Icon && (

                        <div className={`${iconBg} p-2.5 sm:p-3 rounded-2xl shrink-0`}>

                            <Icon
                                className={iconColor}
                                size={20}
                            />

                        </div>
                    )}

                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-brand-dark tracking-tighter truncate">

                        {title}

                    </h1>

                </div>

                {description && (

                    <p className="text-brand-muted font-medium text-xs sm:text-sm lg:text-base ml-0">

                        {description}

                    </p>
                )}

            </div>

            {children && (

                <div className="flex gap-2 flex-wrap shrink-0">

                    {children}

                </div>
            )}

        </motion.div>
    );
}