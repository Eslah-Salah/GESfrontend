/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./client/index.html', './client/**/*.ts'],
  safelist: [
    'status-approved',
    'status-pending',
    'status-rejected',
    'status-suspended',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#d4af37',
          light: '#f3e5ab',
          dark: '#aa7c11',
        },
        ink: '#07080a',
        muted: '#8e95a3',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
};
