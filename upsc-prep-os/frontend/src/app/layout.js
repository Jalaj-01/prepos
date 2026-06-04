import "./globals.css";

import { GoogleOAuthProvider } from "@react-oauth/google";

import { ToastProvider } from "@/components/ui/Toast";
import { ConfirmModalProvider } from "@/components/ui/ConfirmModal";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import { generateMetadata as genMeta } from "@/lib/seo";

import { FocusTimerProvider } from "@/components/focus/FocusTimerProvider";
import FocusTimer from "@/components/focus/FocusTimer";

export const metadata = {
    ...genMeta({
        title: "PrepOS || Your UPSC Command Center",
        description:
            "PrepOS is the all-in-one operating system for UPSC aspirants — daily MCQs, mains practice, smart revisions, planner, sticky notes and analytics. 100% free.",
    }),

    applicationName: "PrepOS",
    authors: [{ name: "PrepOS", url: "https://prepos-upsc.vercel.app/" }],
    creator: "PrepOS",
    publisher: "PrepOS",

    keywords: [
        "PrepOS",
        "UPSC",
        "UPSC Preparation",
        "UPSC Online",
        "Civil Services",
        "IAS",
        "IPS",
        "IFS",
        "UPSC CSE",
        "UPSC PYQ",
        "UPSC Prelims",
        "UPSC Mains",
        "MCQ Practice",
        "Mains Answer Writing",
        "UPSC Analytics",
        "UPSC Notes",
        "Free UPSC Platform",
        "UPSC Test Series",
        "Daily Current Affairs",
        "UPSC Syllabus Tracker",
    ],

    manifest: "/manifest.json",

    icons: {
        icon: [
            { url: "/favicon.ico", sizes: "any" },
            { url: "/icon.svg", type: "image/svg+xml" },
            { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
            { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
        ],
        apple: [
            { url: "/icon-512x512.png", sizes: "180x180", type: "image/png" },
        ],
        shortcut: "/favicon.ico",
    },

    appleWebApp: {
        capable: true,
        title: "PrepOS",
        statusBarStyle: "default",
    },

    openGraph: {
        title: "PrepOS — Your UPSC Command Center",
        description:
            "Daily MCQs, mains practice, smart revisions, planner & analytics — all in one place. 100% free for aspirants.",
        url: "https://prepos.in",
        siteName: "PrepOS",
        images: [
            {
                url: "/icon-512x512.png",
                width: 512,
                height: 512,
                alt: "PrepOS",
            },
        ],
        locale: "en_IN",
        type: "website",
    },

    twitter: {
        card: "summary_large_image",
        title: "PrepOS — Your UPSC Command Center",
        description:
            "Modern UPSC preparation platform. Daily MCQs, mains, smart revisions, analytics & more. 100% free.",
        images: ["/icon-512x512.png"],
    },

    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
        },
    },

    verification: {
        // google: "your-google-search-console-verification-code",
    },
};

export const viewport = {
    themeColor: "#0A0A0A",
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="true"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
                    rel="stylesheet"
                />

                <meta name="application-name" content="PrepOS" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta
                    name="apple-mobile-web-app-status-bar-style"
                    content="default"
                />
                <meta name="apple-mobile-web-app-title" content="PrepOS" />
                <meta name="mobile-web-app-capable" content="yes" />
                <link rel="apple-touch-icon" href="/icon-512x512.png" />

                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "WebApplication",
                            name: "PrepOS",
                            description:
                                "All-in-one UPSC preparation platform with daily MCQs, mains practice, smart revisions, planner & analytics.",
                            url: "https://prepos.in",
                            applicationCategory: "EducationalApplication",
                            operatingSystem: "Web, iOS, Android",
                            offers: {
                                "@type": "Offer",
                                price: "0",
                                priceCurrency: "INR",
                            },
                            audience: {
                                "@type": "EducationalAudience",
                                educationalRole: "UPSC Aspirant",
                            },
                            inLanguage: "en-IN",
                        }),
                    }}
                />
            </head>

            <body className="bg-brand-light">
                <ErrorBoundary>
                    <GoogleOAuthProvider
                        clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
                    >
                        <FocusTimerProvider>
                            {children}
                            <FocusTimer />
                        </FocusTimerProvider>
                    </GoogleOAuthProvider>

                    <ToastProvider />
                    <ConfirmModalProvider />
                    <InstallPrompt />
                </ErrorBoundary>
            </body>
        </html>
    );
}