/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          950: '#0b241e',
          900: '#123C32', // Primary Dark
          800: '#154e3f',
          700: '#187B58', // Primary Brand
          600: '#22976c',
          500: '#35A875', // Accent Leaf
          400: '#5dc092',
          300: '#92dbae',
          200: '#bcf0d1',
          100: '#DDF3E6', // Soft Mint
          50: '#F4F7F4',  // Clean Canvas
        },
        carbon: {
          900: '#202B26', // Text Carbon
          800: '#2e3d36',
          700: '#3f5148',
          600: '#546b60',
          500: '#758d81',
          400: '#9ab0a5',
          300: '#c2d1c9',
          200: '#e1e8e4',
          100: '#f0f4f1',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
