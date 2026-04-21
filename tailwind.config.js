/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#f5bc1b',
          glow: 'rgba(245, 188, 27, 0.4)',
        },
        crimson: {
          DEFAULT: '#e32636',
          glow: 'rgba(227, 38, 54, 0.4)',
        },
        accent: {
          primary: '#f5bc1b',
          secondary: '#e32636',
        },
        text: {
          muted: '#888888',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
