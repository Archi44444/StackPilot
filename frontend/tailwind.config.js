/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: 'rgb(var(--bg-base) / <alpha-value>)',
        surface: 'rgb(var(--bg-surface) / <alpha-value>)',
        elevated: 'rgb(var(--bg-elevated) / <alpha-value>)',
        border: 'rgb(var(--bg-border) / <alpha-value>)',
        brand: { DEFAULT: '#7C3AED', light: '#A855F7' },
        accent: { cyan: '#22D3EE', emerald: '#10B981' },
        text: {
          primary: 'rgb(var(--text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--text-secondary) / <alpha-value>)',
          muted: 'rgb(var(--text-muted) / <alpha-value>)',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #7C3AED, #A855F7)',
        'mesh-bg': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(124, 58, 237, 0.2), transparent)',
      },
      boxShadow: {
        'glow-sm': '0 0 20px rgba(124, 58, 237, 0.25)',
        'glow-md': '0 0 40px rgba(124, 58, 237, 0.35)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
