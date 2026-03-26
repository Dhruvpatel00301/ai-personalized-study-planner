/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          500: "#a855f7",
          700: "#6d28d9",
        },
      },
      boxShadow: {
        soft: "0 8px 30px rgba(109, 40, 217, 0.18)",
      },
      borderRadius: {
        card: "1rem",
      },
    },
  },
  plugins: [],
};
