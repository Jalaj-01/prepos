import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    expiration: {
      maxEntries: 64,
      maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
    },
  },
});

/** @type {import('next').Next.Config} */
const nextConfig = {
  // Your existing config
};

export default withPWA(nextConfig);