
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',

  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-background)',
        fg: 'var(--color-text)',
        card: 'var(--color-card)',
        primary: 'var(--color-primary)',
        primarySoft: 'var(--color-primary-transparent)',
        secondary: 'var(--color-secondary)',
        border: 'var(--color-border)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        info: 'var(--color-info)',
        error: 'var(--color-error)',
        brand: {
          50: 'var(--color-primary-transparent)',
          100: 'var(--color-primary-transparent)',
          200: 'var(--color-primary-transparent)',
          300: 'var(--color-primary-transparent)',
          400: 'var(--color-primary-transparent)',
          500: 'var(--color-primary)',
          600: 'var(--color-primary)',
          700: 'var(--color-primary)',
          800: 'var(--color-primary)',
          900: 'var(--color-primary)',
          950: 'var(--color-primary)',
        },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}
