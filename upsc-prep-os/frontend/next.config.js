const path = require("path");

const withPWA = require("@ducanh2912/next-pwa").default({

    dest: "public",

    register: true,

    disable:
        process.env.NODE_ENV === "development"
});

const nextConfig = {

    reactStrictMode: true,

    // =========================
    // OUTPUT TRACING (Vercel)
    // =========================

    outputFileTracingRoot:
        path.join(__dirname, "../"),

    // =========================
    // WEBPACK FIX: pdfjs-dist canvas issue
    // =========================

    webpack: (config) => {

        config.resolve.alias = {

            ...config.resolve.alias,

            canvas: false,

            encoding: false
        };

        return config;
    },

    // =========================
    // IMAGES
    // =========================

    images: {

        remotePatterns: [

            {
                protocol: "https",
                hostname: "**"
            }
        ]
    }
};

module.exports = withPWA(nextConfig);