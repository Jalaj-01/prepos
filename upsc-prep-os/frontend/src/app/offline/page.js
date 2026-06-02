"use client";

import {
    WifiOff,
    RefreshCw
} from "lucide-react";

export default function OfflinePage() {

    return (

        <div className="min-h-screen bg-brand-light flex items-center justify-center p-6">

            <div className="bg-white max-w-md w-full rounded-3xl p-8 sm:p-10 shadow-xl border border-brand-border text-center">

                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">

                    <WifiOff
                        size={28}
                        className="text-orange-600"
                    />

                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-brand-dark mb-3 tracking-tight">

                    You're Offline

                </h1>

                <p className="text-sm text-brand-muted font-medium mb-6 leading-relaxed">

                    Check your internet connection and try again.
                    Don't worry — your data is safe.

                </p>

                <button
                    onClick={() => window.location.reload()}
                    className="w-full bg-brand-dark text-white py-3.5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-brand-accent transition-all flex items-center justify-center gap-2"
                >
                    <RefreshCw size={14} />
                    Try Again
                </button>

                <p className="text-[10px] text-brand-muted font-bold uppercase tracking-widest mt-6">

                    PrepOS works best with internet

                </p>

            </div>

        </div>
    );
}