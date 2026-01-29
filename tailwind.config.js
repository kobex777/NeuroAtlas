
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#7899B5",
                "accent-light": "#A3BFD9",
                "deep-charcoal": "#0D0D0D",
                "panel-dark": "rgba(18, 18, 18, 0.8)",
                "lab-text": "#2C2C2E",
                "glass-border": "rgba(0, 0, 0, 0.05)",
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ["Space Grotesk", "sans-serif"],
                body: ["Outfit", "sans-serif"],
            },
        },
    },
    plugins: [],
}
