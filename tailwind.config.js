/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        roboto: ['Roboto', 'sans'],
      },
      colors : {
        "ymeets-gray" : "#D0CFCF",
        "ymeets-med-blue" : "#0056AE",
        "ymeets-light-blue" : "#BEDEFF",
        "ymeets-dark-blue" : "#00356B",
        "selection-made-red" : "#D86969"

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
  plugins: [],
}
