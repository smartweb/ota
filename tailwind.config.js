/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 暖橙红主色，老年人友好、高对比度
        brand: {
          DEFAULT: "#d9432b",
          dark: "#b8351f",
          light: "#ffe7e2",
        },
        ink: "#1a1a1a",
        paper: "#fffaf6",
      },
      fontSize: {
        // 老年人定制大字号
        base: ["1.125rem", "1.7rem"],   // 18px
        lg: ["1.25rem", "1.9rem"],      // 20px
        xl: ["1.5rem", "2.1rem"],       // 24px
        "2xl": ["1.75rem", "2.3rem"],   // 28px
        "3xl": ["2rem", "2.6rem"],      // 32px
        "4xl": ["2.5rem", "3rem"],      // 40px
      },
      minWidth: {
        touch: "56px",
      },
      minHeight: {
        touch: "56px",
      },
    },
  },
  plugins: [],
};
