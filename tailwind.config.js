/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        console: {
          bg: '#1C1C2A',
          fg: '#E0E0E0',
          red: '#FF5555',
          green: '#88FF88',
          blue: '#5599FF',
        }
      },
      fontFamily: {
        'pixel': ['Press Start 2P', 'monospace'],
        'console': ['Pixel Emulator', 'monospace'],
      },
      spacing: {
        '11': '2.75rem',
        '13': '3.25rem',
        '15': '3.75rem',
      }
    },
  },
  plugins: [],
}
