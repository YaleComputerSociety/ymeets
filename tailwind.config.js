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

