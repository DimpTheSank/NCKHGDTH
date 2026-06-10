/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
      },
      colors: {
        primary: '#FF6B35',
        purple: {
          soft: '#9B8EC4',
          light: '#EDE9F8',
        },
        green: {
          soft: '#5BAD8F',
          light: '#E8F5EF',
        },
        red: {
          soft: '#E07070',
          light: '#FAEAEA',
        },
        gold: '#F5A623',
        silver: '#A8B2C1',
        bronze: '#C87941',
      },
    },
  },
  plugins: [],
}
