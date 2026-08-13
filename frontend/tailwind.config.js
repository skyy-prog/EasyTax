module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1a1a1a",
        accent: "#F5C518",
        base: "#F7F5F0",
      },
      fontFamily: {
        quicksand: ["Quicksand", "sans-serif"],
        mono: ["Space Mono", "monospace"],
      },
      boxShadow: {
        brutal: "4px 4px 0px #1a1a1a",
        brutalSm: "2px 2px 0px #1a1a1a",
      },
    },
  },
  plugins: [],
};
