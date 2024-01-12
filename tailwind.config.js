const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        roboto: ['Roboto', 'sans'],
        serif: ["Noto Serif", ...defaultTheme.fontFamily.serif],
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
      },
      boxShadow: {
        custom: '2px 4px 3px 0px rgba(0, 0, 0, 0.4)',
      },
      colors : {
        "ymeets-gray" : "#D0CFCF",
        "ymeets-med-blue" : "#0056AE",
        "ymeets-light-blue" : "#BEDEFF",
        "ymeets-dark-blue" : "#00356B",
        "selection-made-red" : "#D86969"
      },
      height : {
        "nineteen" :  "70px",
        "17" : "66px",
        "29" : "120px"
      },
      maxHeight : {
        "120" : "28rem"
      }
    },
  },
  safelist: [
    {
      pattern: /grid-cols-.|bg-.|border-.*/,
    }
  ],
  fontFamily: {
    roboto: ['Roboto', 'sans-serif'],
  },
  variants: {
    fill: ['hover', 'focus']
  },
  plugins: [],
}

