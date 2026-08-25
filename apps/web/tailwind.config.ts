import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        aurora: {
          base: "#050810",
          deep: "#060a14",
          violet: "rgba(88, 28, 220, 0.12)",
          cyan: "rgba(6, 182, 212, 0.08)",
          emerald: "rgba(16, 185, 129, 0.06)",
          rose: "rgba(244, 63, 94, 0.06)",
        },
        accent: {
          primary: "#7c3aed",
          cyan: "#06b6d4",
          emerald: "#10b981",
          amber: "#f59e0b",
          rose: "#f43f5e",
          indigo: "#6366f1",
        },
        agent: {
          active: "#7c3aed",
          completed: "#10b981",
          waiting: "#f59e0b",
          reviewing: "#06b6d4",
          failed: "#f43f5e",
        },
      },
      borderRadius: {
        sm: "10px",
        md: "16px",
        lg: "24px",
        xl: "32px",
      },
    },
  },
  plugins: [],
};

export default config;
