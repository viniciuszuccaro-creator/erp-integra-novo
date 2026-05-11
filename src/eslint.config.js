import globals from "globals";
import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

const appFiles = [
  "App.jsx",
  "main.jsx",
  "src/**/*.{js,jsx,ts,tsx}",
];

const ignorePatterns = [
  "node_modules/**",
  "dist/**",
  "build/**",
  ".vite/**",
  "coverage/**",
  "**/node_modules/**",
  "**/dist/**",
  "**/*.md",
  "**/*.md.jsx",
  "**/*.md.js",
  "**/*.json.jsx",
  "**/*.json.js",
  "**/*.config.jsx",
  "**/*.config.js",
  "**/*.txt.jsx",
  "**/*.txt.js",
  "**/*.rst.jsx",
  "**/*.rst.js",
  "**/*.adoc.jsx",
  "**/*.adoc.js",
  "**/*.yaml.jsx",
  "**/*.yaml.js",
  "**/*.yml.jsx",
  "**/*.yml.js",
  "**/*.jsxe",
  "src/components/**",
  "components/**",
  "public/**",
  "build-tools/**",
];

export default [
  {
    ignores: ignorePatterns,
  },
  {
    files: appFiles,
    ignores: ignorePatterns,
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        React: "readonly",
        ReactDOM: "readonly",
        Deno: "readonly",
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "warn",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "no-undef": "error",
      "no-unused-vars": "warn",
    },
  },
];