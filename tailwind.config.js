/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'gov-blue': '#1a4480',
        'gov-blue-dark': '#112e5a',
        'gov-blue-light': '#2563a8',
        'gov-blue-pale': '#dce9f7',
        'gov-blue-faint': '#eef4fb',
        'gov-gray': '#5a6474',
        'gov-gray-dark': '#3d4551',
        'gov-gray-light': '#8d9aab',
        'gov-gray-border': '#d0d7e0',
        'gov-gray-bg': '#f5f6f8',
        'severity-critical': '#c0392b',
        'severity-critical-bg': '#fdf2f1',
        'severity-high': '#d68910',
        'severity-high-bg': '#fef9ec',
        'severity-medium': '#1d6fa4',
        'severity-medium-bg': '#eaf3fb',
        'severity-low': '#1e7e34',
        'severity-low-bg': '#eef8f0',
        'status-online': '#1e7e34',
        'status-offline': '#c0392b',
        'status-warning': '#d68910',
      },
      fontFamily: {
        sans: ['Noto Sans', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
        devanagari: ['Noto Sans Devanagari', 'sans-serif'],
      }
    },
  },
  plugins: [],
}