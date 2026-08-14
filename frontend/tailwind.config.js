module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0A0A0A",
        charcoal: "#1C1C1C",
        smoke: "#2E2E2E",
        ash: "#6B6B6B",
        silver: "#B8B8B8",
        fog: "#E8E8E8",
        ghost: "#F4F4F4",
      },
      fontFamily: {
        quicksand: ["Quicksand", "sans-serif"],
        mono: ["Space Mono", "monospace"],
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-110%)" },
          "100%": { transform: "translateX(350%)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
