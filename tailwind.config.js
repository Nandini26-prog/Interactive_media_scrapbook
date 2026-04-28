/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-serif)", "ui-serif", "Georgia", "Cambria", "Times New Roman", "Times", "serif"],
        handwritten: ["var(--font-handwritten)", "ui-sans-serif", "system-ui"],
        loud: ["var(--font-loud)", "ui-sans-serif", "system-ui"],
        title: ["var(--font-title)", "ui-serif", "Georgia"],
        note: ["var(--font-note)", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
};

