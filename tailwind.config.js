/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: {
          bg: '#0a0c0e',
          card: '#111417',
          card2: '#171b1f',
          border: '#23282e',
        },
        accent: {
          cyan: '#22d3ee',
          ice: '#7dd3fc',
          violet: '#a78bfa',
          amber: '#fbbf24',
          rose: '#fb7185',
          green: '#34d399',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 0 0 rgba(255,255,255,0.03) inset, 0 10px 30px -12px rgba(0,0,0,0.55)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pop: {
          '0%': { transform: 'scale(0.6)', opacity: '0.5' },
          '60%': { transform: 'scale(1.12)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        fadeUp: 'fadeUp .35s ease-out both',
        pop: 'pop .3s cubic-bezier(.2,.9,.3,1.4) both',
      },
    },
  },
  plugins: [],
}
