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
        darkCanvas: '#131316',
        darkSurface: '#1c1c20',
        darkSubtle: '#25252b',
        darkHover: '#2e2e36',
        darkBorder: '#2d2d34',
        darkBorderFocus: '#3f3f4a',
        darkText: '#f4f4f6',
        darkMuted: '#8c8c96',
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
        '2xl': '12px',
      },
    },
  },
  plugins: [],
};
