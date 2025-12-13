/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary - Vibrant Teal/Cyan (Trust, Modern, Digital)
        cyan: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4', // Base
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        // Secondary - Warm Coral/Rose (Celebration, Joy, Gifting)
        rose: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e', // Base
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
        // Accent - Premium Amber (Luxury, Value, Premium)
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b', // Base
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // Neutral - Modern Slate (Professional, Clean)
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b', // Base
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        // Backward compatibility - map old colors to new ones
        navy: {
          50: '#f8fafc', // slate-50
          100: '#f1f5f9', // slate-100
          200: '#e2e8f0', // slate-200
          300: '#cbd5e1', // slate-300
          400: '#94a3b8', // slate-400
          500: '#64748b', // slate-500
          600: '#475569', // slate-600
          700: '#334155', // slate-700
          800: '#1e293b', // slate-800
          900: '#0f172a', // slate-900
        },
        plum: {
          50: '#fff1f2', // rose-50
          100: '#ffe4e6', // rose-100
          200: '#fecdd3', // rose-200
          300: '#fda4af', // rose-300
          400: '#fb7185', // rose-400
          500: '#f43f5e', // rose-500
          600: '#e11d48', // rose-600
          700: '#be123c', // rose-700
          800: '#9f1239', // rose-800
          900: '#881337', // rose-900
        },
        gold: {
          50: '#fffbeb', // amber-50
          100: '#fef3c7', // amber-100
          200: '#fde68a', // amber-200
          300: '#fcd34d', // amber-300
          400: '#fbbf24', // amber-400
          500: '#f59e0b', // amber-500
          600: '#d97706', // amber-600
          700: '#b45309', // amber-700
          800: '#92400e', // amber-800
          900: '#78350f', // amber-900
        },
        // Primary mapped to cyan for backward compatibility
        primary: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Montserrat', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #f59e0b 100%)',
        'amber-glow': 'radial-gradient(circle, rgba(245, 158, 11, 0.3) 0%, transparent 70%)',
        'cyan-gradient': 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 50%, #06b6d4 100%)',
        'rose-gradient': 'linear-gradient(135deg, #f43f5e 0%, #fb7185 50%, #f43f5e 100%)',
      },
      boxShadow: {
        'gold-glow': '0 0 20px rgba(245, 158, 11, 0.5), 0 0 40px rgba(245, 158, 11, 0.3)',
        'gold-glow-sm': '0 0 10px rgba(245, 158, 11, 0.4)',
        'cyan-glow': '0 0 20px rgba(6, 182, 212, 0.5), 0 0 40px rgba(6, 182, 212, 0.3)',
        'rose-glow': '0 0 20px rgba(244, 63, 94, 0.5), 0 0 40px rgba(244, 63, 94, 0.3)',
        'luxury': '0 10px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}

