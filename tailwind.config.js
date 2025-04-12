const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // This is essential
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        roboto: ["Roboto", "sans"],
        serif: ["Noto Serif", ...defaultTheme.fontFamily.serif],
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
      },
      boxShadow: {
        custom: "2px 4px 3px 0px rgba(0, 0, 0, 0.4)",
      },
      colors: {
        background: "#e1e8f7", // Light mode background
        secondary_background: "#ffffff", // Light mode secondary background
        text: "#000000", // Light mode text color
        outline: "#7E7E7E", // Light mode outline
        primary: "#5191F2", // Light mode primary color
        secondary: "#609CF6", // Light mode secondary color
        select: "#afcdfa", // Light mode select color
        submit: "#73dd64", // Light mode submit button color

        // Dark mode colors
        "background-dark": "#1a202c", // Dark mode background
        "secondary_background-dark": "#2d3748", // Dark mode secondary background
        "text-dark": "#f8f9fa", // Dark mode text color
        "primary-dark": "#90cdf4", // Dark mode primary color
        "secondary-dark": "#609CF6", // Dark mode secondary color (same as light)
        "select-dark": "#afcdfa", // Dark mode select color (same as light)
        "submit-dark": "#73dd64", // Dark mode submit button color (same as light)
      },

      height: {
        nineteen: "70px",
        17: "66px",
        29: "120px",
      },
      maxHeight: {
        120: "28rem",
        125: "30rem",
        130: "32rem",
        135: "34rem",
        140: "36rem",
      },
      scale: {
        102: "1.02",
      },
      width: {
        "20vw": "30vw",
        "40vw": "40vw", // add 40vw if you need it for toggling
      },
    },
  },
  safelist: [
    {
      pattern: /grid-cols-.|bg-.|border-.*/,
    },
  ],
  fontFamily: {
    roboto: ["Roboto", "sans-serif"],
  },
  variants: {
    fill: ["hover", "focus"],
  },
  plugins: [require("tailwind-scrollbar")],
};
