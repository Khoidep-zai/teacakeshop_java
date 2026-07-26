/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#2D6A4F',
          light: '#52B788',
          dark: '#1B4332',
          glow: '#74C69D',
        },
        accent: {
          DEFAULT: '#E76F51',
          light: '#F4A261',
          dark: '#D00000',
          honey: '#E9C46A',
        },
        rose: {
          light: '#FFD6BA',
          DEFAULT: '#E8A598',
        },
        cyber: {
          teal: '#06B6D4',
          violet: '#8B5CF6',
          emerald: '#10B981',
          glow: 'rgba(6, 182, 212, 0.25)',
        },
        darkBg: {
          DEFAULT: '#0F172A',
          card: '#1E293B',
          glass: 'rgba(15, 23, 42, 0.75)',
        },
        lightBg: {
          DEFAULT: '#FAF9F5',
          card: '#FFFFFF',
          glass: 'rgba(255, 255, 255, 0.75)',
        },
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.08)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
        'glow-primary': '0 0 25px rgba(82, 183, 136, 0.4)',
        'glow-accent': '0 0 25px rgba(231, 111, 81, 0.4)',
        'glow-cyber': '0 0 25px rgba(6, 182, 212, 0.35)',
      },
      backdropBlur: {
        'xs': '2px',
        '2xl': '40px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s infinite',
        'spin-slow': 'spin 12s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
}
