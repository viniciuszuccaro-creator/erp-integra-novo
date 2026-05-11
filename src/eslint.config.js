import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  // CAMADA 1: BLOQUEIO ABSOLUTO — ignora TUDO por padrão
  {
    ignores: [
      "**/*",
      "build-tools/**",
      "src/build-tools/**",
      "**/*.md.jsx",
      "**/*.md.js",
      "**/*.json.jsx",
      "**/*.json.js",
      "**/*.config.jsx",
      "src/components/**/*",
    ],
  },
  
  // CAMADA 2: WHITELIST EXPLÍCITA — apenas código legítimo da app
  {
    files: [
      "src/App.jsx",
      "src/main.jsx",
      "src/index.jsx",
      "src/pages/**/*.{js,jsx,ts,tsx}",
      "src/lib/**/*.{js,jsx,ts,tsx}",
      "src/api/**/*.{js,jsx,ts,tsx}",
      "src/hooks/**/*.{js,jsx,ts,tsx}",
      "src/utils/**/*.{js,jsx,ts,tsx}",
    ],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: {
        ...globals.browser,
        ...globals.node,
        React: "readonly",
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
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