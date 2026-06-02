"use client";

import { Toaster, toast } from "react-hot-toast";

// =========================
// TOAST PROVIDER
// (Add to root layout once)
// =========================

export function ToastProvider() {

    return (

        <Toaster
            position="top-right"

            toastOptions={{

                duration: 4000,

                style: {
                    background: "#0A0A0A",
                    color: "#fff",
                    fontWeight: "700",
                    fontSize: "14px",
                    padding: "14px 20px",
                    borderRadius: "16px",
                    border: "1px solid #1F2937",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
                    fontFamily: "Inter, sans-serif"
                },

                success: {
                    iconTheme: {
                        primary: "#10B981",
                        secondary: "#0A0A0A"
                    },

                    style: {
                        background: "#0A0A0A",
                        border: "1px solid #10B981"
                    }
                },

                error: {
                    duration: 5000,

                    iconTheme: {
                        primary: "#EF4444",
                        secondary: "#0A0A0A"
                    },

                    style: {
                        background: "#0A0A0A",
                        border: "1px solid #EF4444"
                    }
                },

                loading: {
                    iconTheme: {
                        primary: "#6366F1",
                        secondary: "#0A0A0A"
                    }
                }
            }}
        />
    );
}

// =========================
// TOAST HELPERS
// (Use these instead of alert())
// =========================

export const showToast = {

    success: (message) =>
        toast.success(message),

    error: (message) =>
        toast.error(message),

    info: (message) =>
        toast(message, {
            icon: "ℹ️"
        }),

    warning: (message) =>
        toast(message, {
            icon: "⚠️",
            style: {
                background: "#0A0A0A",
                border: "1px solid #F59E0B"
            }
        }),

    loading: (message) =>
        toast.loading(message),

    promise: (promise, messages) =>
        toast.promise(promise, {
            loading:
                messages.loading || "Loading...",

            success:
                messages.success || "Done!",

            error:
                messages.error || "Something went wrong"
        }),

    dismiss: (id) =>
        toast.dismiss(id),

    custom: (message, options = {}) =>
        toast(message, options)
};