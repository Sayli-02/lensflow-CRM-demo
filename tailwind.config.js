/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F8F9FB",
        brand: {
          50: "#FFF8ED",
          100: "#FEEDD5",
          200: "#FDD9AA",
          300: "#FBC175",
          400: "#F8A53E",
          500: "#F5A623",
          600: "#D9820C",
          700: "#B46009",
          800: "#904C0F",
          900: "#763F10",
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
