import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

// =============================================================================
// PROTOCOLO DE ESTABILIDADE PERMANENTE — VERSÃO DEFINITIVA
//
// Estratégia: WHITELIST em vez de blacklist.
// Só fazemos lint de arquivos que SABEMOS ser código React legítimo.
// Qualquer artefato injetado pela plataforma fora dessas pastas é ignorado.
// =============================================================================

export default [
  // ─── IGNORES GLOBAIS (máxima cobertura) ─────────────────────────────────────
  {
    ignores: [
      // Build e dependências
      "node_modules/**",
      "dist/**",
      "build/**",
      ".vite/**",
      "public/**",
      "build-tools/**",

      // Configs de build (usam process, __dirname — são Node, não React)
      "vite.config.*",
      "*.config.js",
      "*.config.ts",
      "src/vite.config.*",
      "src/*.config.*",

      // Extensões duplas — SEMPRE artefatos da plataforma
      "**/*.md.jsx",
      "**/*.md.js",
      "**/*.md.ts",
      "**/*.md.tsx",
      "**/*.json.jsx",
      "**/*.json.js",
      "**/*.config.jsx",

      // Qualquer arquivo com underscore em src/ — padrão ALL_CAPS da plataforma
      // (arquivos legítimos usam camelCase ou PascalCase sem underscore)
      "src/**/*_*",

      // Padrões README em qualquer pasta
      "src/**/README*",

      // Pasta docs e templates
      "src/components/docs/**",

      // Arquivos de prova/certificação
      "*.json",
      "src/**/*.proof.*",
    ],
  },

  // ─── LINT apenas em código React legítimo ────────────────────────────────────
  {
    files: [
      "src/pages/*.{js,jsx,ts,tsx}",
      "src/pages/**/*.{js,jsx,ts,tsx}",
      "src/components/*.{js,jsx,ts,tsx}",
      "src/components/**/*.{js,jsx,ts,tsx}",
      "src/lib/*.{js,jsx,ts,tsx}",
      "src/lib/**/*.{js,jsx,ts,tsx}",
      "src/hooks/*.{js,jsx,ts,tsx}",
      "src/utils/*.{js,jsx,ts,tsx}",
      "src/api/*.{js,jsx,ts,tsx}",
      "src/App.jsx",
      "src/main.jsx",
    ],
    ignores: [
      // Re-aplica ignores de artefatos dentro das pastas legítimas
      "**/*_*",
      "**/README*",
      "**/*.md.*",
      "**/*.json.*",
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
      "no-redeclare": "off",
      "no-constant-condition": "off",
    },
  },
];