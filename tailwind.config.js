/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        mono: {
          background: "#ffffff",
          primary: "#000000",
          secondary: "#5e5e5e",
          surface: "#f9f9f9",
          surfaceContainerLow: "#f3f3f4",
          surfaceContainer: "#eeeeee",
          surfaceDim: "#dadada",
          outlineVariant: "#c6c6c6",
          primaryContainer: "#3b3b3b",
        },
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
      },
    },
  },
  plugins: [],
};
