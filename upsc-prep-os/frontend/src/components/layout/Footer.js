"use client";

import Link from "next/link";

import {
    Heart
} from "lucide-react";

export default function Footer() {

    const currentYear =
        new Date().getFullYear();

    return (

        <footer className="bg-white border-t border-brand-border mt-auto">

            <div className="max-w-7xl mx-auto px-6 py-8">

                <div className="flex flex-col md:flex-row justify-between items-center gap-4">

                    {/* LEFT — BRAND */}

                    <div className="flex items-center gap-2">

                        <span className="font-black text-lg tracking-tighter text-brand-dark">

                            PrepOS

                        </span>

                        <span className="text-brand-muted text-xs font-medium">

                            © {currentYear} All rights reserved.

                        </span>

                    </div>

                    {/* CENTER — LINKS */}

                    <div className="flex items-center gap-6">

                        <Link
                            href="/about"
                            className="text-xs font-bold text-brand-muted hover:text-brand-dark transition-all"
                        >
                            About
                        </Link>

                        <Link
                            href="/privacy"
                            className="text-xs font-bold text-brand-muted hover:text-brand-dark transition-all"
                        >
                            Privacy
                        </Link>

                        <Link
                            href="/terms"
                            className="text-xs font-bold text-brand-muted hover:text-brand-dark transition-all"
                        >
                            Terms
                        </Link>

                        <Link
                            href="/contact"
                            className="text-xs font-bold text-brand-muted hover:text-brand-dark transition-all"
                        >
                            Contact
                        </Link>

                    </div>

                    {/* RIGHT — TAGLINE */}

                    <div className="flex items-center gap-1.5 text-xs font-medium text-brand-muted">

                        <span>Built with</span>

                        <Heart
                            size={12}
                            className="text-red-500 fill-red-500"
                        />

                        <span>for UPSC aspirants</span>

                    </div>

                </div>

            </div>

        </footer>
    );
}