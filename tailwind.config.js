module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      fontFamily: {
        fascinate: ['"Fascinate Inline"', 'system-ui'],
      },
      colors: {
        primary: "#ec4899",
        secondary: "#a855f7",
        accent: "#06b6d4",
        darkBg: "#0f0f10",
      },
      boxShadow: {
      neon: "0 0 20px rgba(99,102,241,0.6), 0 0 40px rgba(139,92,246,0.4)",
    }
    },
  },
  plugins: [
    require("tailwindcss-animated")
  ],
};
