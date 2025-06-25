/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./App.{js,jsx,ts,tsx}",
      "./*.{js,jsx,ts,tsx}",
      "./src/**/*.{js,jsx,ts,tsx}"
    ],
    presets: [require("nativewind/preset")],
    theme: {
      extend: {
        colors: {
          airbnb: {
            primary: "#FF5A5F",      // Airbnb red
            secondary: "#767676",    // Soft gray
            background: "#F7F7F7",   // Light background
            dark: "#484848",         // Deep gray
            accent: "#00A699",       // Teal accent
          },
        },
      },
    },
    plugins: [],
  };