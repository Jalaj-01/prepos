/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: "#FBFBFA",
          dark: "#191919",
          accent: "#6366F1",
          muted: "#737373",
          border: "#E5E5E5",
        },
        status: {
          success: "#22C55E",
          warning: "#F59E0B",
          error: "#EF4444",
        }
      },
      boxShadow: {
        'premium': '0 1px 3px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.05)',
      },
    },
  },
  plugins: [],
};