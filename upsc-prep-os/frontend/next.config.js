const withPWA = require("@ducanh2912/next-pwa").default({

    dest: "public",

    register: true,

    disable:
        process.env.NODE_ENV === "development",

    workboxOptions: {

        disableDevLogs: true
    },

    fallbacks: {

        document: "/offline"
    },

    cacheOnFrontEndNav: true,

    aggressiveFrontEndNavCaching: true,

    reloadOnOnline: true
});

const nextConfig = {

    reactStrictMode: true,

    // Tell Next.js where workspace root is

    turbopack: {

        root: __dirname
    },

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