/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Cypherpunk Color System
      colors: {
        // Background & Surface
        void: {
          DEFAULT: '#0B0E27',
          dark: '#060812',
          light: '#0F1333',
        },
        surface: {
          DEFAULT: '#1A1D3A',
          dark: '#12142A',
          light: '#242852',
        },
        border: {
          DEFAULT: '#3D4159',
          active: '#00D9FF',
        },
        
        // Neon Accent Colors
        neon: {
          cyan: '#00D9FF',
          magenta: '#FF00FF',
          green: '#00FF00',
          blue: '#0080FF',
          orange: '#FF5C00',
        },
        
        // Rarity Metals
        metal: {
          gold: '#D4AF37',
          platinum: '#E8E8E8',
          silver: '#C0C0C0',
          gunmetal: '#2C3E50',
          steel: '#70737A',
          chrome: '#A9A9A9',
        },
        
        // Text
        text: {
          primary: '#E3E3E3',
          secondary: '#A8A9AD',
          muted: '#6B6E80',
        },
      },
      
      // Typography
      fontFamily: {
        display: ['Orbitron', 'monospace'],
        heading: ['Space Grotesk', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      
      // Font sizes
      fontSize: {
        'display-lg': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-sm': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
      },
      
      // Animations
      animation: {
        'pulse-glow': 'pulse-glow 4s ease-in-out infinite',
        'glitch': 'glitch 0.2s ease-in-out',
        'scan': 'scan 8s linear infinite',
        'matrix-rain': 'matrix-rain 20s linear infinite',
        'chrome-shimmer': 'chrome-shimmer 3s linear infinite',
        'border-glow': 'border-glow 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { 
            opacity: '1',
            filter: 'drop-shadow(0 0 20px rgba(0, 217, 255, 0.4))',
          },
          '50%': { 
            opacity: '0.8',
            filter: 'drop-shadow(0 0 40px rgba(0, 217, 255, 0.6))',
          },
        },
        'glitch': {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
          '100%': { transform: 'translate(0)' },
        },
        'scan': {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '0 100%' },
        },
        'matrix-rain': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'chrome-shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'border-glow': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0, 217, 255, 0.3), inset 0 0 5px rgba(0, 217, 255, 0.1)' },
          '50%': { boxShadow: '0 0 20px rgba(0, 217, 255, 0.5), inset 0 0 10px rgba(0, 217, 255, 0.2)' },
        },
      },
      
      // Box shadows
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(0, 217, 255, 0.4), 0 0 40px rgba(0, 217, 255, 0.2)',
        'neon-magenta': '0 0 20px rgba(255, 0, 255, 0.4), 0 0 40px rgba(255, 0, 255, 0.2)',
        'neon-green': '0 0 20px rgba(0, 255, 0, 0.4), 0 0 40px rgba(0, 255, 0, 0.2)',
        'glow': 'inset 0 0 20px rgba(0, 217, 255, 0.1), 0 0 30px rgba(0, 217, 255, 0.2)',
      },
      
      // Background images
      backgroundImage: {
        'chrome-gradient': 'linear-gradient(135deg, #999 5%, #fff 20%, #ccc 40%, #ddd 50%, #ccc 60%, #fff 80%, #999 95%)',
        'gold-gradient': 'linear-gradient(135deg, #D4AF37 0%, #F5E6A3 50%, #D4AF37 100%)',
        'terminal-grid': 'linear-gradient(rgba(0, 217, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 217, 255, 0.1) 1px, transparent 1px)',
        'scan-lines': 'linear-gradient(transparent 50%, rgba(0, 217, 255, 0.05) 50%)',
      },
    },
  },
  plugins: [],
};
