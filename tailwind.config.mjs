/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{astro,js,ts,jsx,tsx}',
    './public/**/*.js', 
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
