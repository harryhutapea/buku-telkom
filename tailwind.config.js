/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: ["font-nabla", "font-roboto", "text-primary-red", "text-secondary-red"],
  theme: {
    extend: {
      colors: {
        "primary-red": "#E4262C",
        "secondary-red": "#B60811",
      },
      fontFamily: {
        nabla: ["Nabla", "sans-serif"],
        roboto: ["Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
}
