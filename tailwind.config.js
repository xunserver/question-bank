/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans SC',
          'sans-serif',
        ],
      },
      boxShadow: {
        soft: '0 18px 48px rgba(15, 23, 42, 0.12)',
      },
    },
  },
  plugins: [],
};
