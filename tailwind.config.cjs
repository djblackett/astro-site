module.exports = {
  content: ["./src/**/*.{astro,js,ts,jsx,tsx}", "./public/**/*.html"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      "light",
      "dark",
      "dim",
      "valentine",
      "aqua",
      // add more DaisyUI built-in themes if needed
    ],
  },
};
