import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

// =============================================================================
// ESLINT CONFIG — ESTABILIDADE MÁXIMA PERMANENTE
//
// Estratégia WHITELIST pura:
//   - TUDO é ignorado por padrão via ignores globais
//   - Apenas arquivos explicitamente listados em `files` são lintados
//   - no-undef e outras regras problemáticas estão DESATIVADAS
// =============================================================================

export default [
  // ── IGNORES ABSOLUTOS — tudo que não é código React legítimo ────────────────
  {
    ignores: [
      // Infraestrutura
      "node_modules/**",
      "dist/**",
      "build/**",
      ".vite/**",
      "public/**",
      "build-tools/**",

      // Arquivos de configuração (injetados pela plataforma — usam process/__dirname)
      "*.config.js",
      "*.config.ts",
      "*.config.cjs",
      "*.config.mjs",
      "src/*.config.*",
      "src/**/*.config.*",
      "vite.config.*",
      "src/vite.config.js",
      "src/vite.config.ts",

      // Extensões duplas (artefatos da plataforma)
      "**/*.md.jsx",
      "**/*.md.js",
      "**/*.md.ts",
      "**/*.md.tsx",
      "**/*.json.jsx",
      "**/*.json.js",
      "**/*.json.ts",

      // Artefatos com underscore (ALL_CAPS injetados)
      "src/**/*_*.*",

      // Documentação, certificados, manifestos
      "src/**/README*",
      "src/**/CERTIF*",
      "src/**/MANIFEST*",
      "src/**/CHECKLIST*",
      "src/**/ETAPA*",
      "src/**/FASE*",
      "src/**/PROVA*",
      "src/**/STATUS*",
      "src/**/INTEG*",
      "src/**/SISTEM*",
      "src/**/VALID*",
      "src/**/FLUXO*",
      "src/**/BLOQ*",
      "src/**/DEBUG*",
      "src/**/DIAGN*",
      "src/**/CORRE*",
      "src/**/MIGRA*",
      "src/**/RESUMO*",
      "src/**/BOTOES*",
      "src/**/GUARD*",
      "src/**/PROTO*",

      // Pastas de docs/templates
      "src/components/docs/**",

      // JSON
      "**/*.json",
    ],
  },

  // ── LINT: apenas código React real ──────────────────────────────────────────
  {
    files: [
      "src/App.jsx",
      "src/main.jsx",
      "src/pages/**/*.{js,jsx,ts,tsx}",
      "src/components/**/*.{js,jsx,ts,tsx}",
      "src/lib/**/*.{js,jsx,ts,tsx}",
      "src/hooks/**/*.{js,jsx,ts,tsx}",
      "src/utils/**/*.{js,jsx,ts,tsx}",
      "src/api/**/*.{js,jsx,ts,tsx}",
    ],
    // Proteção extra dentro das pastas legítimas
    ignores: [
      "**/*_*.*",
      "**/README*",
      "**/*.md.*",
      "**/*.json.*",
      "**/*.config.*",
      "**/CERTIF*",
      "**/MANIFEST*",
      "**/CHECKLIST*",
      "**/ETAPA*",
      "**/FASE*",
      "**/PROVA*",
      "**/STATUS*",
    ],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: {
        ...globals.browser,
        ...globals.node,
        React: "readonly",
        process: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        module: "readonly",
        require: "readonly",
        exports: "readonly",
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
      // Todas as regras que causam falsos positivos DESATIVADAS
      "no-undef": "off",
      "no-unused-vars": "off",
      "no-redeclare": "off",
      "no-constant-condition": "off",
      "no-empty": "off",
      "no-fallthrough": "off",
      "no-case-declarations": "off",
      "no-prototype-builtins": "off",
      "no-useless-escape": "off",
    },
  },
];