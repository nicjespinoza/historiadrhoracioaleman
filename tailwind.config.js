/** @type {import('tailwindcss').Config} */
export default {
    darkMode: "class",
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Existing colors
                primary: '#a78bfa',
                secondary: '#E2E8CE',
                accent: '#FF886E',
                background: '#F9FAFB',
                surface: 'rgba(255, 255, 255, 0.7)',
                base: '#083c79',
                'black-pure': '#000000',
                
                // New colors for Landing Page design
                "primary-hover": "#8b5cf6",
                "background-dark": "#0f172a",
                "background-light": "#f8fafc",
                "accent-blue": "#38bdf8",
                "accent-purple": "#c084fc",
                
                // CENLAE Colors
                "cenlae-primary": "#154c8a",
                "cenlae-footer": "#0b3c70",
                "cenlae-bg-dark": "#111827",
            },
            fontFamily: {
                display: ['Open Sans', 'sans-serif'],
                sans: ['Open Sans', 'sans-serif'],
            },
            letterSpacing: {
                tight: '-0.02em',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
                'hero-glow': 'radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.15) 0%, rgba(15, 23, 42, 0) 50%)',
                'mesh-dark': 'radial-gradient(at 0% 0%, rgba(56, 189, 248, 0.15) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(192, 132, 252, 0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(56, 189, 248, 0.15) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(192, 132, 252, 0.15) 0px, transparent 50%)',
            },
        },
    },
    plugins: [
        function ({ addUtilities }) {
            addUtilities({
                '.glass': {
                    'backdrop-filter': 'blur(16px)',
                    'background': 'rgba(255, 255, 255, 0.6)',
                    'border': '1px solid rgba(255, 255, 255, 0.3)',
                }
            })
        }
    ],
}
