const withPWA = require("@ducanh2912/next-pwa").default({

    dest: "public",

    register: true,

    disable:
        process.env.NODE_ENV === "development"
});

const nextConfig = {

    reactStrictMode: true,

    webpack: (config) => {

        config.resolve.alias = {

            ...config.resolve.alias,

            canvas: false,

            encoding: false
        };

        return config;
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