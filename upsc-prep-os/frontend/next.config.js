const withPWA = require("@ducanh2912/next-pwa").default({
    dest: "public",
    register: true,
    disable: process.env.NODE_ENV === "development",
});

const nextConfig = {
    reactStrictMode: true,

    webpack: (config) => {
        config.resolve.alias = {
            ...config.resolve.alias,
            canvas: false,
            encoding: false,
        };
        return config;
    },

    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**",
            },
        ],
    },

    // ─── Security headers (fixes Grade D → A on securityheaders.com) ───
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    {
                        key: "X-Frame-Options",
                        value: "SAMEORIGIN",
                    },
                    {
                        key: "X-Content-Type-Options",
                        value: "nosniff",
                    },
                    {
                        key: "Referrer-Policy",
                        value: "strict-origin-when-cross-origin",
                    },
                    {
                        key: "Permissions-Policy",
                        value: "camera=(), microphone=(), geolocation=()",
                    },
                    {
                        key: "X-DNS-Prefetch-Control",
                        value: "on",
                    },
                ],
            },
        ];
    },
};

module.exports = withPWA(nextConfig);