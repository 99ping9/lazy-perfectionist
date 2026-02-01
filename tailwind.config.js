/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#ffffff",
                foreground: "#0a0a0a",
                primary: {
                    DEFAULT: "#3b82f6", // Blue-500 equivalent, adjustable
                    foreground: "#ffffff"
                },
                muted: "#f3f4f6", // Gray-100
                accent: "#f9fafb", // Gray-50
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
