import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  {
    // BLOCK EVERYTHING first
    ignores: [
      "**",
    ],
  },
  {
    // Then WHITELIST only the real app code
    files: [
      "App.jsx",
      "main.jsx",
      "src/pages/**/*.{js,jsx}",
      "src/lib/**/*.{js,jsx}",
      "src/api/**/*.{js,jsx}",
      "src/hooks/**/*.{js,jsx}",
      "src/utils/**/*.{js,jsx}",
    ],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.node, React: "readonly" },
    },
    plugins: { react, "react-hooks": reactHooks },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-hooks/rules-of-hooks": "warn",
      "react-hooks/exhaustive-deps": "off",
      "no-undef": "off",
      "no-unused-vars": "off",
    },
  },
];