/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ngl-orange': '#FF3C3C',
        'ngl-pink': '#FF007F',
        'ngl-purple': '#8000FF',
        'ngl-black': '#1E1E1E',
        'ngl-gray': '#2A2A2A',
      },
      animation: {
        'bounce-soft': 'bounceSoft 2s infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(-5%)' },
          '50%': { transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
