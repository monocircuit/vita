const config = {
  plugins: {
    "@tailwindcss/postcss": {
      safelist: [
        {
          pattern: /--[a-zA-Z0-9-]*-sf[a-zA-Z0-9-]*/,
          variants: ["lg", "hover", "focus", "lg:hover", "border"],
        },
      ],
    },
  },
};

export default config;
