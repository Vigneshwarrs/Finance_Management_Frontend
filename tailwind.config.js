/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        primary: {
          DEFAULT: '#2563eb', // blue-600
          light: '#3b82f6', // blue-500
          dark: '#1e40af', // blue-800
        },
        accent: {
          DEFAULT: '#f59e42', // orange-400
        },
        background: '#f8fafc', // slate-50
        surface: '#ffffff',
        error: '#ef4444', // red-500
        success: '#22c55e', // green-500
        warning: '#facc15', // yellow-400
      },
    },
  },
  plugins: [],
};
