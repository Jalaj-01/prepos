import "./globals.css";

import { GoogleOAuthProvider } from '@react-oauth/google';

import { ToastProvider } from "@/components/ui/Toast";

import { ConfirmModalProvider } from "@/components/ui/ConfirmModal";

import ErrorBoundary from "@/components/ui/ErrorBoundary";

import InstallPrompt from "@/components/pwa/InstallPrompt";

import { generateMetadata as genMeta } from "@/lib/seo";

export const metadata = genMeta({

    title: "Systematic UPSC Preparation",

    description: "Modern UPSC PYQ Analytics, Mains Library, Personal Vault & Community Notes. 100% free for all aspirants."
});

export const viewport = {

    themeColor: "#0A0A0A",

    width: "device-width",

    initialScale: 1,

    maximumScale: 5,

    userScalable: true
};

export default function RootLayout({ children }) {

    return (

        <html lang="en" suppressHydrationWarning>

            <head>

                <link
                    rel="preconnect"
                    href="https://fonts.googleapis.com"
                />

                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="true"
                />

                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
                    rel="stylesheet"
                />

                {/* PWA / Mobile Tags */}

                <meta name="application-name" content="PrepOS" />

                <meta name="apple-mobile-web-app-capable" content="yes" />

                <meta name="apple-mobile-web-app-status-bar-style" content="default" />

                <meta name="apple-mobile-web-app-title" content="PrepOS" />

                <meta name="mobile-web-app-capable" content="yes" />

                <link rel="apple-touch-icon" href="/icon-512x512.png" />

            </head>

            <body className="bg-brand-light">

                <ErrorBoundary>

                    <GoogleOAuthProvider
                        clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
                    >

                        {children}

                    </GoogleOAuthProvider>

                    <ToastProvider />

                    <ConfirmModalProvider />

                    <InstallPrompt />

                </ErrorBoundary>

            </body>

        </html>
    );
}