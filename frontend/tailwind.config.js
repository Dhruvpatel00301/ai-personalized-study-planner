/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef7ff",
          100: "#d8ebff",
          200: "#b4d9ff",
          300: "#84beff",
          500: "#348ef8",
          700: "#2263be",
        },
      },
      boxShadow: {
        soft: "0 8px 30px rgba(52, 142, 248, 0.18)",
      },
      borderRadius: {
        card: "1rem",
      },
    },
  },
  plugins: [],
};
