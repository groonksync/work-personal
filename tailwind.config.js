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
        obsidian: {
          950: '#0c0d0f', // Left slim rail
          900: '#111214', // Main canvas background
          850: '#131416', // Secondary sidebar explorer
          800: '#1a1b1e', // Cards and panels
          750: '#222328', // Card hover / pills
          700: '#24252a', // Borders and dividers
          600: '#2d2f35', // Folder sleeve back
          500: '#35373e', // Folder front flap
          400: '#5e636e', // Subtle placeholders
          300: '#8b8f98', // Muted secondary text
          100: '#f3f4f6', // Crisp white text
        },
        darkCanvas: '#111214',
        darkSurface: '#1a1b1e',
        darkSubtle: '#222328',
        darkHover: '#282a30',
        darkBorder: '#24252a',
        darkBorderFocus: '#393b44',
        darkText: '#f3f4f6',
        darkMuted: '#8b8f98',
        lightCanvas: '#f6f6f8',
        lightSurface: '#ffffff',
        lightSubtle: '#eeeeF2',
        lightHover: '#e5e5ea',
        lightBorder: '#e0e0e6',
        lightBorderFocus: '#c7c7cf',
        lightText: '#18181b',
        lightMuted: '#6e6e76',
      },
      borderRadius: {
        'lg': '8px',
        'xl': '10px',
        '2xl': '14px',
        '3xl': '18px',
      },
    },
  },
  plugins: [],
};
