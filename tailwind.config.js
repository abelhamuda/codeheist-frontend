/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hacker: {
          green: '#00ff00',
          dark: '#0a0a0a',
          darker: '#001100',
          light: '#33ff33',
        }
      },
      fontFamily: {
        mono: ['Monaco', 'Menlo', 'Ubuntu Mono', 'monospace'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'type': 'type 3.5s ease-out .8s infinite alternate both',
      },
      keyframes: {
        glow: {
          'from': { textShadow: '0 0 5px #00ff00' },
          'to': { textShadow: '0 0 10px #00ff00, 0 0 15px #00ff00' }
        },
        type: {
          '0%': { width: '0' },
          '100%': { width: '100%' }
        }
      }
    },
  },
  plugins: [],
}