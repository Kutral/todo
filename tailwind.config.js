/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neo: {
          bg: '#fffdf0', // Very light yellow/cream
          primary: '#FF6B6B', // Red
          secondary: '#4ECDC4', // Teal
          accent: '#FFE66D', // Yellow
          dark: '#1A1A1A', // Black
          white: '#FFFFFF',
          gray: '#f0f0f0',
        }
      },
      boxShadow: {
        'neo': '4px 4px 0px 0px #1A1A1A',
        'neo-sm': '2px 2px 0px 0px #1A1A1A',
        'neo-lg': '6px 6px 0px 0px #1A1A1A',
      },
      borderWidth: {
        '3': '3px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
