/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          lime: "#B5D04D",
          olive: "#535E25",
          lavender: "#7D7897",
          gray: "#BEBEC1",
          white: "#FEFEFE",
        },
        dark: {
          bg: "#11130F",
          surface: "#181A15",
          elevated: "#20231C",
          border: "#2E3328",
          borderLight: "#3E4535",
        },
        light: {
          bg: "#FEFEFE",
          surface: "#FFFFFF",
          elevated: "#F8F9F7",
          border: "#E2E2E5",
          text: "#1A1C18",
          muted: "#76796E",
        },
        status: {
          safe: "#2E7D32",
          safeLight: "#E8F5E9",
          warning: "#F57C00",
          warningLight: "#FFF3E0",
          alert: "#D32F2F",
          alertLight: "#FFEBEE",
          info: "#7D7897",
        }
      },
      fontFamily: {
        brand: ['var(--font-space-grotesk)', 'Space Grotesk', 'sans-serif'],
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'card': '20px',
        'card-lg': '24px',
        'btn': '12px',
      },
      boxShadow: {
        'soft': '0 2px 12px 0 rgba(0, 0, 0, 0.04)',
        'soft-dark': '0 4px 20px 0 rgba(0, 0, 0, 0.35)',
        'lime-glow': '0 0 20px -3px rgba(181, 208, 77, 0.35)',
        'lavender-glow': '0 0 20px -3px rgba(125, 120, 151, 0.35)',
      },
    },
  },
  plugins: [],
};
