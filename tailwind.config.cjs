/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#F8F5F0",
        ink: "#29231F",
        cocoa: "#A87349",
        sand: "#E9D8C6",
        mist: "#F1ECE6",
      },
      boxShadow: {
        soft: "0 12px 30px rgba(83, 60, 42, 0.08)",
        device: "0 32px 80px rgba(71, 50, 34, 0.22)",
      },
    },
  },
  plugins: [],
};
