/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#4CAF82',
          light: '#65be95',
          dark: '#3d9e6e',
        },
        accent: {
          DEFAULT: '#FF7043',
          light: '#ff8c69',
          dark: '#e65c2f',
        },
        darkBg: '#1a1a2e',
        lightBg: '#f8fdf9',
      },
    },
  },
  plugins: [],
}
