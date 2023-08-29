/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/components/schedulee/timeselect/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        roboto: ['Roboto', 'sans'],
      },
    },
  },
  safelist: [
    {
      pattern: /grid-cols-.|bg-.|border-.*/, // This regex pattern includes grid-cols-*, bg-*, and border-* classes
    }
  ],
  fontFamily: {
    roboto: ['Roboto', 'sans-serif'], // 'Roboto' is the font name
  },
  plugins: [],
}

