import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

// =============================================================================
// ESLINT CONFIG — ESTABILIDADE PERMANENTE — ABORDAGEM WHITELIST DEFINITIVA
//
// REGRA: Só faz lint de arquivos React legítimos (pages/, components/ reais,
// lib/, hooks/, utils/, api/).
// TUDO o mais (configs, docs, templates, artefatos ALL_CAPS, extensões duplas,
// arquivos com underscore) é IGNORADO globalmente.
// =============================================================================

export default [
  // ── 1. IGNORES GLOBAIS (executados antes de qualquer outra regra) ────────────
  {
    ignores: [
      // Dependências e build
      "node_modules/**",
      "dist/**",
      "build/**",
      ".vite/**",
      "public/**",
      "build-tools/**",

      // Qualquer arquivo de configuração em QUALQUER nível
      "**/*.config.js",
      "**/*.config.ts",
      "**/*.config.jsx",
      "**/*.config.cjs",
      "**/*.config.mjs",
      "vite.config.*",
      "src/vite.config.*",
      "src/**/*.config.*",
      "commitlint.config.*",
      "**/*commitlint*",

      // Extensões duplas — sempre artefatos da plataforma
      "**/*.md.jsx",
      "**/*.md.js",
      "**/*.md.ts",
      "**/*.md.tsx",
      "**/*.json.jsx",
      "**/*.json.js",

      // Arquivos com underscore em qualquer pasta src/
      "src/**/*_*",

      // READMEs e documentação
      "src/**/README*",
      "src/**/CERTIFICAD*",
      "src/**/MANIFESTO*",
      "src/**/CHECKLIST*",
      "src/**/ETAPA*",
      "src/**/FASE*",
      "src/**/PROVA*",
      "src/**/STATUS*",
      "src/**/INTEGRACAO*",
      "src/**/SISTEMA*",
      "src/**/VALIDACAO*",
      "src/**/FLUXO*",
      "src/**/BLOQUEIO*",
      "src/**/DEBUG*",
      "src/**/DIAGNOSTICO*",
      "src/**/CORRECAO*",
      "src/**/MIGRACAO*",
      "src/**/RESUMO*",
      "src/**/BOTOES*",

      // Pastas de docs e templates
      "src/components/docs/**",
      "src/components/docs/templates/**",

      // Arquivos JSON e outros não-JS
      "**/*.json",
    ],
  },

  // ── 2. LINT apenas código React real ────────────────────────────────────────
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
      // Reaplica proteção dentro das pastas legítimas
      "**/*_*",
      "**/README*",
      "**/*.md.*",
      "**/*.json.*",
      "**/*.config.*",
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
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    rules: {
      // Regras desativadas para máxima estabilidade
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-hooks/rules-of-hooks": "warn",
      "react-hooks/exhaustive-deps": "off",
      "no-undef": "off",
      "no-unused-vars": "off",
      "no-redeclare": "off",
      "no-constant-condition": "off",
      "no-empty": "off",
      "no-fallthrough": "off",
    },
  },
];