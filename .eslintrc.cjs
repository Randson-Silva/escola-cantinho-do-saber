module.exports = {
  root: true,
  env: { node: true, browser: true, es2023: true },
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "react", "import"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "prettier",
  ],
  settings: { react: { version: "detect" } },
  rules: {
    "react/react-in-jsx-scope": "off",
    "import/order": [
      "warn",
      {
        groups: [["builtin", "external", "internal"]],
        alphabetize: { order: "asc", caseInsensitive: true },
      },
    ],
  },
  ignorePatterns: ["dist", "node_modules"],
};
