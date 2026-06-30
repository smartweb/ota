/** @type {import('tailwindcss').Config} */
// 配色方案基于适老化 UI 实证研究：
// - 老人最偏暖橙色（偏好度 ~60%，远高于其他色）
// - 中等饱和度（避免高饱和刺眼/血压升高，避免大面积红）
// - 高亮度暖色背景（减少压抑感），不用纯白冷色调
// - 深色暖系文字保证高对比度
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 主色：暖橙（中等饱和度，老人偏好色，温暖关怀感）
        brand: {
          DEFAULT: "#F0995A", // 暖橙主色 H28 S84 L65
          dark: "#E07A38",    // 按压/强调态
          deep: "#C2621F",    // 最深，用于文字强调
          light: "#FFF0E2",   // 浅橙背景/标签底
          softer: "#FFE3CC",  // 更柔和的橙
        },
        // 背景：温暖米白（非纯白，减少冰冷感）
        paper: "#FFFBF5",
        paperdeep: "#FBF3E8", // 略深一档，做层次
        // 文字：暖系深色，高对比度但不冷
        ink: "#2B2420",       // 主文字（暖炭黑）
        inksoft: "#6B5D52",   // 次要文字（暖灰）
        inkmute: "#9C8D80",   // 弱化文字
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
      boxShadow: {
        // 暖色调阴影，比黑色阴影更柔和温暖
        soft: "0 4px 16px rgba(224, 122, 56, 0.10)",
        card: "0 2px 12px rgba(180, 140, 100, 0.08)",
      },
    },
  },
  plugins: [],
};
