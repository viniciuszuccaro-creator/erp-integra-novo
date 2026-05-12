import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

// ============================================================================
// NUCLEAR IGNORE — bloqueia TODOS os artefatos injetados pela plataforma.
// Esta config usa duas estratégias:
// 1. Ignores globais por padrão de nome/extensão (cobertura ampla)
// 2. Whitelist explícita — só processa arquivos de código React legítimos
// ============================================================================

export default [
  // CAMADA 1: Ignores globais — qualquer arquivo que bater nesses padrões
  // é completamente ignorado pelo ESLint, independente do diretório.
  {
    ignores: [
      // Infraestrutura / build
      "node_modules/**",
      "dist/**",
      "build/**",
      ".vite/**",
      "public/**",
      "build-tools/**",
      "src/build-tools/**",

      // Extensões duplas injetadas pela plataforma
      "**/*.md.jsx",
      "**/*.md.js",
      "**/*.json.jsx",
      "**/*.json.js",
      "**/*.config.jsx",
      "**/*.config.js",

      // Arquivos ALL_CAPS com underscores (artefatos de documentação injetados)
      // Cobre tanto *.jsx quanto *.md.jsx — padrão: PALAVRA_PALAVRA*.jsx
      "src/**/[A-Z]*_[A-Z]*.jsx",
      "src/**/[A-Z]*_[A-Z]*.js",

      // Nomes específicos problemáticos não cobertos pelo padrão acima
      "src/**/commitlint.config.*",
      "src/**/UnidadesDeMedida.*",
      "src/**/rhf_zod_report.*",
    ],
  },

  // CAMADA 2: Whitelist explícita — apenas código React legítimo
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],
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