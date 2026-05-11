import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  // BLOQUEIO GLOBAL — ignora TODOS os artefatos injetados pela plataforma
  // Este objeto com apenas "ignores" é um ignore global no ESLint flat config
  {
    ignores: [
      // Artefatos de extensão dupla
      "src/**/*.md.jsx",
      "src/**/*.md.js",
      "src/**/*.json.jsx",
      "src/**/*.json.js",
      "src/**/*.config.jsx",
      "src/**/*.config.js",
      // Nomes de documentação ALL-CAPS injetados
      "src/**/CERTIFICAD*.jsx",
      "src/**/CERTIFICAD*.js",
      "src/**/CERTIFICACA*.jsx",
      "src/**/CERTIFICACA*.js",
      "src/**/MANIFESTO*.jsx",
      "src/**/MANIFESTO*.js",
      "src/**/MANIFEST_*.jsx",
      "src/**/MANIFEST_*.js",
      "src/**/VALIDACA*.jsx",
      "src/**/VALIDACA*.js",
      "src/**/CHECKLIST*.jsx",
      "src/**/CHECKLIST*.js",
      "src/**/ETAPA*.jsx",
      "src/**/ETAPA*.js",
      "src/**/ETAPAS*.jsx",
      "src/**/ETAPAS*.js",
      "src/**/FASE*.jsx",
      "src/**/FASE*.js",
      "src/**/README*.jsx",
      "src/**/README*.js",
      "src/**/DEBUG*.jsx",
      "src/**/DEBUG*.js",
      "src/**/DIAGNOSTICO*.jsx",
      "src/**/DIAGNOSTICO*.js",
      "src/**/CORRECAO*.jsx",
      "src/**/CORRECAO*.js",
      "src/**/BLOQUEIO*.jsx",
      "src/**/BLOQUEIO*.js",
      "src/**/BOTOES*.jsx",
      "src/**/BOTOES*.js",
      "src/**/INTEGRACA*.jsx",
      "src/**/INTEGRACA*.js",
      "src/**/PROVA*.jsx",
      "src/**/PROVA*.js",
      "src/**/STATUS*.jsx",
      "src/**/STATUS*.js",
      "src/**/SISTEMA*.jsx",
      "src/**/SISTEMA*.js",
      "src/**/RELATORIO*.jsx",
      "src/**/RELATORIO*.js",
      "src/**/rhf_zod_report*",
      "src/**/UnidadesDeMedida*",
      "src/**/commitlint*",
      // Node.js build scripts não pertencem ao src
      "src/build-tools/**",
      "build-tools/**",
      "public/**",
      "dist/**",
      ".vite/**",
      "node_modules/**",
    ],
  },

  // WHITELIST EXPLÍCITA — apenas código React legítimo
  {
    files: [
      "src/**/*.{js,jsx,ts,tsx}",
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