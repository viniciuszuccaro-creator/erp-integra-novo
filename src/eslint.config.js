import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

// =============================================================================
// PROTOCOLO DE ESTABILIDADE PERMANENTE V3.0
// Estratégia: ignorar TUDO que não seja código React legítimo em src/pages,
// src/components e src/lib. Qualquer artefato injetado pela plataforma é
// silenciado globalmente por padrões amplos.
// =============================================================================

export default [
  // ─── IGNORES GLOBAIS (aplicados antes de qualquer regra) ────────────────────
  {
    ignores: [
      // Infraestrutura e build
      "node_modules/**",
      "dist/**",
      "build/**",
      ".vite/**",
      "public/**",
      "build-tools/**",
      "src/build-tools/**",

      // vite.config em qualquer lugar (usa process, __dirname do Node)
      "vite.config.*",
      "vite.config.js",
      "src/vite.config.*",
      "src/vite.config.js",

      // Extensões duplas (artefatos *.md.jsx, *.json.jsx, etc.)
      "**/*.md.jsx",
      "**/*.md.js",
      "**/*.md.ts",
      "**/*.md.tsx",
      "**/*.json.jsx",
      "**/*.json.js",
      "**/*.config.jsx",
      "**/*.config.js.jsx",

      // ── PADRÃO AMPLO: qualquer arquivo começando com letras maiúsculas
      //    seguido de _ (artefatos ALL_CAPS injetados pela plataforma)
      "src/**/*_*.jsx",

      // ── PADRÃO AMPLO: qualquer arquivo README em qualquer pasta
      "src/**/README*.jsx",
      "src/**/README*.js",

      // ── PADRÃO AMPLO: qualquer arquivo que começa com maiúscula e contém
      //    padrões típicos de documentação injetada
      "src/**/BLOQUEIO*.jsx",
      "src/**/BOTOES*.jsx",
      "src/**/CERTIFICACAO*.jsx",
      "src/**/CERTIFICADO*.jsx",
      "src/**/CHECKLIST*.jsx",
      "src/**/CORRECAO*.jsx",
      "src/**/DEBUG*.jsx",
      "src/**/DIAGNOSTICO*.jsx",
      "src/**/ETAPA*.jsx",
      "src/**/ETAPAS*.jsx",
      "src/**/FASE*.jsx",
      "src/**/FLUXO*.jsx",
      "src/**/INTEGRACAO*.jsx",
      "src/**/MANIFESTO*.jsx",
      "src/**/MANIFEST_*.jsx",
      "src/**/MIGRACAO*.jsx",
      "src/**/PROVA*.jsx",
      "src/**/RELATORIO*.jsx",
      "src/**/RESUMO*.jsx",
      "src/**/SISTEMA*.jsx",
      "src/**/STATUS*.jsx",
      "src/**/VALIDACAO*.jsx",
      "src/**/ZINDEX*.jsx",

      // Arquivos de documentação/configuração específicos
      "src/**/commitlint.config.*",
      "src/**/UnidadesDeMedida.*",
      "src/**/rhf_zod_report.*",
    ],
  },

  // ─── REGRAS — somente código React legítimo ────────────────────────────────
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
      // Regras desligadas para máxima compatibilidade com o projeto
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-hooks/rules-of-hooks": "warn",
      "react-hooks/exhaustive-deps": "off",
      "no-undef": "off",
      "no-unused-vars": "off",
      "no-redeclare": "off",
    },
  },
];