import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Logo-Inspired Luxury Color System
        'salon': {
          'primary': '#E91E63',
          'secondary': '#8E24AA',
          'accent': '#EC407A',
          'deep-purple': '#4A148C',
          'soft-pink': '#FCE4EC',
          'warm-pink': '#F8BBD9',
          'cream': '#FFF8F5',
          'charcoal': '#2D2D2D',
          'gold': '#FFD700',
          'success': '#4CAF50',
          'islamic': '#16A085',
        }
      },
      fontFamily: {
        'playfair': ['Playfair Display', 'serif'],
        'inter': ['Inter', 'sans-serif'],
        'dancing': ['Dancing Script', 'cursive'],
        'kalam': ['Kalam', 'cursive'],
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'pulse-slow': 'pulse 4s infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'pulse-elegant': 'pulse-elegant 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200px 0' },
          '100%': { backgroundPosition: 'calc(200px + 100%) 0' },
        },
        'pulse-elegant': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.02)' },
        }
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'elegant': '0 10px 25px rgba(216, 27, 96, 0.1)',
        'card': '0 4px 15px rgba(216, 27, 96, 0.08)',
        'luxury': '0 20px 40px rgba(216, 27, 96, 0.1)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
};

export default config;