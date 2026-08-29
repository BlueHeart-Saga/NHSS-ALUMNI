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
          yellow: '#F4C542',
          yellowHover: '#E0B030',
          yellowSoft: '#FFF7D6',
          dark: '#111111',
          muted: '#6B7280',
          border: '#E5E7EB',
          bg: '#FAFAFA'
        }
      },
      borderRadius: {
        'card': '16px',
        'btn': '12px'
      }
    },
  },
  plugins: [],
}
