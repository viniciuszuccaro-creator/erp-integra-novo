import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  {
    // Ignorar TUDO — depois incluímos apenas o que realmente precisa de lint
    ignores: [
      "**/*",
      "!src/pages/**/*.{js,jsx}",
      "src/build-tools/**",
      "build-tools/**",
      "!src/lib/**/*.{js,jsx}",
      "!src/api/**/*.{js,jsx}",
      "!src/hooks/**/*.{js,jsx}",
      "!src/utils/**/*.{js,jsx}",
      "!App.jsx",
      "!main.jsx",
    ],
  },
  {
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