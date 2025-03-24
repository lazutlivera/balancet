/** @type {import('tailwindcss').Config} */
const { colors } = require('./constants/Colors');
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        ...colors
      }

    },
  },
  plugins: [],
}

