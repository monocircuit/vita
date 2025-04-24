/** @type {import('stylelint').Config} */
module.exports = {
  ignoreFiles: [".dist"],
  extends: ["stylelint-config-standard-scss"],
  plugins: ["stylelint-prettier"],
  rules: {
    /* BEM Naming Convention */
    "selector-class-pattern": "^[a-z]+(-[a-z]+)*(__[a-z]+(-[a-z]+)*)?(--[a-z]+(-[a-z]+)*)?$",
    "selector-id-pattern": "^[a-z]+(-[a-z]+)*$",
    "custom-property-pattern": "^--[a-z]+(-[a-z]+)*$",
    /* Formatting */
    "prettier/prettier": [
      true,
      {
        endOfLine: "auto",
        singleQuote: true,
        trailingComma: "all",
        printWidth: 80,
        tabWidth: 2,
      },
    ],
  },
};
