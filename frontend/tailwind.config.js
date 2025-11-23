/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary/Neutral (60%) - Deep Navy or Dark Charcoal Gray
        navy: {
          50: '#f0f2f5',
          100: '#d1d6e0',
          200: '#a3adc1',
          300: '#7584a2',
          400: '#475b83',
          500: '#193264', // Deep Navy base
          600: '#142850',
          700: '#0f1e3c',
          800: '#0a1428',
          900: '#050a14', // Deepest Navy
        },
        // Secondary (30%) - Deep Purple or Plum
        plum: {
          50: '#f5f0f7',
          100: '#e6d9ed',
          200: '#cdb3db',
          300: '#b48dc9',
          400: '#9b67b7',
          500: '#8241a5', // Deep Purple base
          600: '#683484',
          700: '#4e2763',
          800: '#341a42',
          900: '#1a0d21',
        },
        // Accent (10%) - Metallic Gold
        gold: {
          50: '#fffef5',
          100: '#fffce6',
          200: '#fff9cc',
          300: '#fff6b3',
          400: '#fff399',
          500: '#ffd700', // Metallic Gold base
          600: '#e6c200',
          700: '#ccad00',
          800: '#b39800',
          900: '#998300',
        },
        // Keep primary for backward compatibility, but map to navy
        primary: {
          50: '#f0f2f5',
          100: '#d1d6e0',
          200: '#a3adc1',
          300: '#7584a2',
          400: '#475b83',
          500: '#193264',
          600: '#142850',
          700: '#0f1e3c',
          800: '#0a1428',
          900: '#050a14',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Montserrat', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #ffd700 100%)',
        'gold-glow': 'radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%)',
      },
      boxShadow: {
        'gold-glow': '0 0 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.3)',
        'gold-glow-sm': '0 0 10px rgba(255, 215, 0, 0.4)',
        'luxury': '0 10px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)',
      },
    },
  },
  plugins: [],
}

