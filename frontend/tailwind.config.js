module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      keyframes: {
        'bounce-up': {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-10px)' },
          '60%': { transform: 'translateY(-6px)' },
        },
        movingColor: {
            '0%': { backgroundPosition: '0% 50%' },
            '50%': { backgroundPosition: '100% 50%' },
            '100%': { backgroundPosition: '0% 50%' },
        },
        shine: {
          '0%': { backgroundPosition: 'left bottom' },
          '100%': { backgroundPosition: 'right bottom' },
        },
        leSnake: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        lightningText: {
          '0%, 50%, 100%': { color: 'white' },
          '25%, 75%': { color: '#7fb3d5' },  
        },
      },
      animation: {
        movingColor: 'movingColor 10s infinite',
        'bounce-up': 'bounce-up 1.5s infinite',
        shine: 'shine 12s infinite',
        leSnake: 'leSnake 1.5s ease-in-out infinite',
        lightningText: 'lightningText 3s infinite',
      },
      animationDelay: {
        '0': '0s',
        '100': '0.1s',
        '200': '0.2s',
        '300': '0.3s',
        '400': '0.4s',
        '500': '0.5s',
        '600': '0.6s',
        '700': '0.7s',
        '800': '0.8s',
        '900': '0.9s',
      },
      backgroundSize: {
        'full': '100% 100%',
      },
      boxShadow: {
      },
      colors: {
        'custom-gradient-start': '#00ff00', 
        'custom-gradient-1': '#0000ff', 
        'custom-gradient-2': '#800080', 
        'custom-gradient-3': '#ff0000', 
        'custom-gradient-4': '#00008b', 
        'custom-gradient-5': '#006400', 
        'custom-gradient-6': '#8b0000',
      },
      backgroundImage: {
        'custom-gradient': 'linear-gradient(to right, var(--tw-gradient-stops))',
      },
      textShadow: {
        'error-shadow': '0 10px 250px #00ff00',
      },
    },
  },
  variants: {
    extend: {
      animation: ['hover', 'focus'],
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.delay-0': { 'animation-delay': '0s' },
        '.delay-100': { 'animation-delay': '0.1s' },
        '.delay-200': { 'animation-delay': '0.2s' },
        '.delay-300': { 'animation-delay': '0.3s' },
        '.delay-400': { 'animation-delay': '0.4s' },
        '.delay-500': { 'animation-delay': '0.5s' },
        '.delay-600': { 'animation-delay': '0.6s' },
        '.delay-700': { 'animation-delay': '0.7s' },
        '.delay-800': { 'animation-delay': '0.8s' },
        '.delay-900': { 'animation-delay': '0.9s' },
      });
     },
    require('tailwind-scrollbar')({ nocompatible: true }),
    require('tailwindcss-textshadow'),
  ],
}