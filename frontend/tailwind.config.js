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
        kanban: {
          bg: '#1a1f2e',
          surface: '#242938',
          card: '#2d3347',
          border: '#3a4060',
          accent: '#6366f1',
          'accent-hover': '#4f46e5',
          text: '#e2e8f0',
          muted: '#8892a4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-in': 'slideIn 0.2s ease-out',
        'bounce-subtle': 'bounceSubtle 0.3s ease',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.97)' },
        },
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0,0,0,0.3)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.4)',
        'modal': '0 20px 60px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [],
}
