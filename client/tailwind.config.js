/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#FFF5F0',
          DEFAULT: '#FF671F', // Saffron/Orange
          dark: '#E65100',
        },
        secondary: {
          DEFAULT: '#06038D', // Navy Blue (Ashoka Chakra inspiration)
        },
        accent: {
          DEFAULT: '#046A38', // India Green
        }
      },
    },
  },
  plugins: [],
}
