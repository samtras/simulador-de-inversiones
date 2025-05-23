/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"], // Ensure all relevant paths are included
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: '#ffffff',
        foreground: '#000000',
        card: {
          DEFAULT: '#f9f9f9',
          foreground: '#333333',
        },
        primary: {
          DEFAULT: '#1a73e8',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#f1f3f4',
          foreground: '#333333',
        },
        muted: {
          DEFAULT: '#e0e0e0',
          foreground: '#666666',
        },
        accent: {
          DEFAULT: '#ff5722',
          foreground: '#ffffff',
        },
        destructive: {
          DEFAULT: '#d32f2f',
          foreground: '#ffffff',
        },
        border: '#e0e0e0',
        input: '#ffffff',
        ring: '#1a73e8',
      },
    },
  },
  plugins: [],
};
