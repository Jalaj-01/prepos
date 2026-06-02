// =========================
// SEO METADATA GENERATOR
// =========================

const SITE_NAME = "PrepOS";

const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://prepos.app";

const DEFAULT_DESCRIPTION =
    "Systematic UPSC preparation platform with PYQ analytics, Mains library, secure note storage, and community-shared resources. Free for all aspirants.";

const DEFAULT_OG_IMAGE =
    `${SITE_URL}/og-image.png`;

export function generateMetadata({
    title,
    description,
    image,
    path = "",
    noIndex = false
} = {}) {

    const fullTitle =
        title
            ? `${title} | ${SITE_NAME}`
            : `${SITE_NAME} — Systematic UPSC Preparation`;

    const desc =
        description || DEFAULT_DESCRIPTION;

    const url = `${SITE_URL}${path}`;

    const ogImage = image || DEFAULT_OG_IMAGE;

    return {

        title: fullTitle,

        description: desc,

        keywords: [
            "UPSC",
            "civil services",
            "IAS preparation",
            "UPSC PYQ",
            "UPSC Mains",
            "UPSC Prelims",
            "UPSC notes",
            "MCQ practice",
            "current affairs",
            "study material"
        ],

        authors: [{ name: SITE_NAME }],

        creator: SITE_NAME,

        publisher: SITE_NAME,

        metadataBase: new URL(SITE_URL),

        alternates: {

            canonical: url
        },

        robots: {

            index: !noIndex,

            follow: !noIndex,

            googleBot: {

                index: !noIndex,

                follow: !noIndex,

                "max-image-preview": "large",

                "max-snippet": -1
            }
        },

        openGraph: {

            type: "website",

            locale: "en_IN",

            url,

            title: fullTitle,

            description: desc,

            siteName: SITE_NAME,

            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: fullTitle
                }
            ]
        },

        twitter: {

            card: "summary_large_image",

            title: fullTitle,

            description: desc,

            images: [ogImage],

            creator: "@prepos"
        },

        icons: {

            icon: [
                { url: "/icons/icon-192.png", sizes: "192x192" },
                { url: "/icons/icon-512.png", sizes: "512x512" }
            ],

            apple: [
                { url: "/icons/icon-192.png", sizes: "192x192" }
            ]
        },

        manifest: "/manifest.json",

        appleWebApp: {

            capable: true,

            statusBarStyle: "default",

            title: SITE_NAME
        },

        formatDetection: {

            telephone: false
        }
    };
}

// =========================
// PAGE-SPECIFIC METADATA
// =========================

export const PAGE_META = {

    dashboard: {
        title: "Dashboard",
        description: "Your UPSC preparation hub — track progress, identify weak areas, and stay consistent."
    },

    practice: {
        title: "Daily Practice",
        description: "Practice UPSC MCQs daily with smart recommendations and detailed analytics."
    },

    mains: {
        title: "Mains Library",
        description: "Browse and practice UPSC Mains questions from GS1, GS2, GS3, GS4, Essay & Optional papers."
    },

    library: {
        title: "Community Library",
        description: "Free UPSC study notes, books, and resources shared by aspirants. Browse by subject."
    },

    vault: {
        title: "My Vault",
        description: "Secure personal storage for your UPSC notes and study materials."
    },

    rankings: {
        title: "Leaderboard",
        description: "Top UPSC aspirants ranked by practice consistency and accuracy."
    },

    analytics: {
        title: "Performance Analytics",
        description: "Deep insights into your UPSC preparation — strengths, weaknesses, and progress trends."
    }
};