/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        mono: {
          background: "#f5f0e8",
          primary: "#1a1a1a",
          secondary: "#6b6560",
          surface: "#ece7de",
          surfaceContainerLow: "#e5e0d7",
          surfaceContainer: "#ddd8cf",
          surfaceDim: "#d0cbc2",
          outlineVariant: "#b8b3aa",
          primaryContainer: "#2e2e2e",
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
