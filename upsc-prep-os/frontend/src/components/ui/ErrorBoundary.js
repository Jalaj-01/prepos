"use client";

import { Component } from "react";

import {
    AlertTriangle,
    RotateCcw,
    Home
} from "lucide-react";

class ErrorBoundary extends Component {

    constructor(props) {

        super(props);

        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {

        return {
            hasError: true,
            error
        };
    }

    componentDidCatch(error, errorInfo) {

        console.error(
            "Error Boundary caught:",
            error,
            errorInfo
        );

        this.setState({
            errorInfo
        });

        // TODO: Send to Sentry in production
    }

    handleReset = () => {

        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    handleGoHome = () => {

        window.location.href = "/dashboard";
    };

    render() {

        if (this.state.hasError) {

            return (

                <div className="min-h-screen bg-brand-light flex items-center justify-center p-4 sm:p-6">

                    <div className="bg-white max-w-md w-full rounded-3xl p-8 shadow-xl border border-brand-border">

                        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">

                            <AlertTriangle
                                size={28}
                                className="text-red-600"
                            />

                        </div>

                        <h1 className="text-2xl font-black text-brand-dark text-center mb-2 tracking-tight">

                            Oops! Something went wrong

                        </h1>

                        <p className="text-sm text-brand-muted font-medium text-center mb-6 leading-relaxed">

                            Don't worry, your data is safe. Try refreshing the page or go back to dashboard.

                        </p>

                        {this.state.error && process.env.NODE_ENV === "development" && (

                            <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-6 max-h-32 overflow-auto">

                                <p className="text-[10px] font-mono text-red-700 break-words">

                                    {this.state.error.toString()}

                                </p>

                            </div>
                        )}

                        <div className="flex gap-3">

                            <button
                                onClick={this.handleGoHome}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-brand-light hover:bg-brand-border text-brand-dark rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                            >
                                <Home size={14} />
                                Dashboard
                            </button>

                            <button
                                onClick={this.handleReset}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-brand-dark hover:bg-brand-accent text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                            >
                                <RotateCcw size={14} />
                                Try Again
                            </button>

                        </div>

                        <p className="text-[10px] text-brand-muted font-bold text-center mt-4 uppercase tracking-widest">

                            If problem persists, please contact support

                        </p>

                    </div>

                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;