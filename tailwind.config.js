/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#6ed17c',
          dark: '#2c2e33',
          gray: '#f5f6f8',
          text: '#4a4d52',
          light: '#ffffff'
        }
      }
    },
  },
  plugins: [],
}
