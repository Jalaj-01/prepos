// =========================
// AUTO-GENERATED SITEMAP
// Next.js reads this and creates /sitemap.xml
// =========================

export default function sitemap() {

    const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        "https://prepos.app";

    const now = new Date();

    return [

        // =========================
        // HOMEPAGE
        // =========================

        {
            url: baseUrl,
            lastModified: now,
            changeFrequency: "daily",
            priority: 1.0
        },

        // =========================
        // PUBLIC PAGES
        // =========================

        {
            url: `${baseUrl}/login`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.8
        },

        {
            url: `${baseUrl}/register`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.8
        },

        // =========================
        // AUTHENTICATED PAGES
        // (Google can list them, but signed-in only)
        // =========================

        {
            url: `${baseUrl}/dashboard`,
            lastModified: now,
            changeFrequency: "daily",
            priority: 0.9
        },

        {
            url: `${baseUrl}/library`,
            lastModified: now,
            changeFrequency: "daily",
            priority: 0.9
        },

        {
            url: `${baseUrl}/mains`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.9
        },

        {
            url: `${baseUrl}/mains/library`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.85
        },

        {
            url: `${baseUrl}/practice`,
            lastModified: now,
            changeFrequency: "daily",
            priority: 0.85
        },

        {
            url: `${baseUrl}/rankings`,
            lastModified: now,
            changeFrequency: "daily",
            priority: 0.7
        },

        {
            url: `${baseUrl}/analytics`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.6
        },

        // =========================
        // STATIC PAGES (future)
        // =========================

        {
            url: `${baseUrl}/about`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.5
        },

        {
            url: `${baseUrl}/privacy`,
            lastModified: now,
            changeFrequency: "yearly",
            priority: 0.3
        },

        {
            url: `${baseUrl}/terms`,
            lastModified: now,
            changeFrequency: "yearly",
            priority: 0.3
        }
    ];
}