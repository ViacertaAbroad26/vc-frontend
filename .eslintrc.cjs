module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    ecmaFeatures: { jsx: true },
  },
  settings: {
    react: { version: "detect" },
    "import/resolver": {
      typescript: {
        project: ["tsconfig.json", "../../tsconfig.base.json"],
      },
    },
  },
  plugins: ["@typescript-eslint", "react", "react-hooks", "import", "jsx-a11y"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:react/jsx-runtime",
    "plugin:jsx-a11y/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
  ],
  rules: {
    "react/prop-types": "off",
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "import/order": [
      "warn",
      {
        groups: ["builtin", "external", "internal", "parent", "sibling", "index", "object"],
        "newlines-between": "always",
        alphabetize: { order: "asc" },
      },
    ],
    "no-restricted-imports": [
      "error",
      {
        patterns: [{ group: ["axios"], message: "Use @viacerta/api-client instead of raw axios" }],
      },
    ],
  },
  overrides: [
    {
      // packages/api-client is the axios wrapper itself — it's allowed to import axios directly.
      files: ["packages/api-client/**/*.ts"],
      rules: {
        "no-restricted-imports": "off",
      },
    },
  ],
};
