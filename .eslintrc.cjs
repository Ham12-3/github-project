/** @type {import("eslint").Linter.Config} */
const config = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
  },
  plugins: ["@typescript-eslint", "next"],
  extends: ["plugin:@typescript-eslint/recommended", "plugin:next/recommended"],
};
module.exports = config;
