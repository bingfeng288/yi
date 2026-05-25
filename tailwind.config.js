/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        yi: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
          950: '#422006',
        },
        ink: {
          50: '#f8f8f6',
          100: '#f0efe8',
          200: '#dfddd0',
          300: '#c8c4af',
          400: '#b0a88a',
          500: '#9e946e',
          600: '#918462',
          700: '#796c52',
          800: '#645946',
          900: '#524a3b',
          950: '#2c261f',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', '"Source Han Serif SC"', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
