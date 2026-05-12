import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

// =============================================================================
// ESTRATÉGIA DEFINITIVA: Ignorar tudo em src/ que NÃO seja código React legítimo
// A plataforma injeta artefatos *.md.jsx, *.json.jsx e arquivos ALL_CAPS_*.jsx
// A solução: NÃO usar "files" amplo — usar ignores globais cobrindo todos os padrões
// =============================================================================

export default [
  // IGNORES GLOBAIS — aplicados antes de qualquer regra
  {
    ignores: [
      // Infraestrutura
      "node_modules/**",
      "dist/**",
      "build/**",
      ".vite/**",
      "public/**",
      "build-tools/**",
      "src/build-tools/**",

      // Extensões duplas (artefatos da plataforma)
      "**/*.md.jsx",
      "**/*.md.js",
      "**/*.json.jsx",
      "**/*.json.js",
      "**/*.config.jsx",

      // Prefixos ALL_CAPS conhecidos (artefatos de documentação injetados)
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
      "src/**/README*.jsx",
      "src/**/RELATORIO*.jsx",
      "src/**/RESUMO*.jsx",
      "src/**/SISTEMA*.jsx",
      "src/**/STATUS*.jsx",
      "src/**/VALIDACAO*.jsx",
      "src/**/ZINDEX*.jsx",

      // vite.config dentro de src/ (não é código React)
      "src/vite.config.*",
      "vite.config.*",

      // Arquivos específicos
      "src/**/commitlint.config.*",
      "src/**/UnidadesDeMedida.*",
      "src/**/rhf_zod_report.*",
    ],
  },

  // REGRAS — aplicadas APENAS a código React legítimo
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