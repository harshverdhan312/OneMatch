/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7C3AED', // Violet
          light: '#EDE9FE',
          dark: '#5B21B6',
        },
        accent: {
          DEFAULT: '#F43F5E', // Rose
          light: '#FFE4E6',
          gold: '#F59E0B',
        },
        space: {
          DEFAULT: '#1E1B2E',
          lighter: '#2A2640',
        },
        bg: {
          base: '#FAFAFA',
          card: '#FFFFFF',
          surface: '#F4F4F5',
        },
        text: {
          primary: '#18181B',
          secondary: '#71717A',
          muted: '#A1A1AA',
        },
        dark: {
          bg: '#09090B',
          card: '#18181B',
        }
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      backgroundImage: {
        'violet-rose': 'linear-gradient(135deg, #7C3AED 0%, #F43F5E 100%)',
        'space-gradient': 'radial-gradient(circle at top right, #2A2640 0%, #1E1B2E 100%)',
      },
      borderRadius: {
        '2xl': '20px',
        'xl': '14px',
        'lg': '12px',
      },
      boxShadow: {
        'card': '0 4px 24px rgba(0,0,0,0.08)',
        'modal': '0 8px 40px rgba(0,0,0,0.14)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      }
    },
  },
  plugins: [],
}


