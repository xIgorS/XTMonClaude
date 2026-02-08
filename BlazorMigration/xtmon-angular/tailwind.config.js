/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Avenir Next"', '"Gill Sans"', '"Trebuchet MS"', 'sans-serif'],
        serif: ['"Palatino Linotype"', '"Book Antiqua"', 'Palatino', 'serif'],
      },
    },
  },
  plugins: [],
}
