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
          dark: '#0b1a30',
          blue: '#2563eb',
          cyan: '#00f2fe',
          red: '#ef4444'
        }
      }
    },
  },
  plugins: [],
}
