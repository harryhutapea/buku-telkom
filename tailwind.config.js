/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'primary-red': '#E4262C',
                'secondary-red': '#B60811', // Example of a custom purple
            },
            fontFamily: {
                'nabla': ['Nabla', 'sans-serif'],
                'roboto': ['Roboto', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
