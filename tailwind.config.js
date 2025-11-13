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
        'pulse': 'pulse 4s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          'from': { textShadow: '0 0 5px #BF1A1A' },
          'to': { textShadow: '0 0 10px #BF1A1A, 0 0 15px #BF1A1A' }
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' }
        }
      }
    },
  },
  plugins: [],
}