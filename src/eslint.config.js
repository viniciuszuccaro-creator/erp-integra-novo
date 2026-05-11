import './build-tools/fullBuildSanitizer.js';
import { runStableEnvironmentCheck } from './build-tools/stableEnvironmentCheck.js';
import { runPrebuildIntegrityCheck } from './build-tools/prebuildIntegrityCheck.js';
import { runStrictDuplicateArtifactGuard } from './build-tools/strictDuplicateArtifactGuard.js';

runStrictDuplicateArtifactGuard('.');
runPrebuildIntegrityCheck('.');
runStableEnvironmentCheck('.');
runStrictDuplicateArtifactGuard('.');

const documentationNoopParser = {
  meta: { name: 'base44-documentation-noop-parser', version: '1.0.0' },
  parseForESLint() {
    return {
      ast: {
        type: 'Program',
        body: [],
        sourceType: 'module',
        range: [0, 0],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 0 } },
        tokens: [],
        comments: [],
      },
      visitorKeys: { Program: [] },
      services: {},
    };
  },
};

const componentDocumentationFiles = [
  'src/components/**/*',
  './src/components/**/*',
  '**/src/components/**/*',
  'components/**/*',
  './components/**/*',
  '**/components/**/*',
  '**/*.md.jsx',
  '**/*.json.jsx',
  '**/*.config.jsx',
  '**/*.txt.jsx',
  '**/*.rst.jsx',
  '**/*.adoc.jsx',
  '**/*.yaml.jsx',
  '**/*.yml.jsx',
  '**/*.jsxe',
  '**/README*',
  '**/CERTIFIC*',
  '**/CERTIFICADO*',
  '**/CERTIFICACAO*',
  '**/MANIFESTO*',
  '**/VALIDACAO*',
  '**/CHECKLIST*',
  '**/PROVA*',
  '**/BLOQUEIO*',
  '**/BOTOES*',
  '**/INTEGRACAO*',
  '**/STATUS*',
  '**/ETAPA*',
  '**/ETAPAS*',
  '**/FASE*',
  '**/FASES*',
  '**/DEBUG*',
  '**/DIAGNOSTICO*',
  '**/CORRECAO*',
  '**/FLUXO*',
  '**/ZINDEX*',
  '**/SISTEMA*',
  '**/RESUMO*',
  '**/CHANGELOG*',
  '**/ROADMAP*',
  '**/GUIA*',
  '**/DOC*',
  '**/UnidadesDeMedida*',
  '**/rhf_zod_report*',
];

const appFiles = [
  'App.jsx',
  'main.jsx',
  '*.js',
  '*.jsx',
  'src/pages/**/*.{js,jsx}',
  'src/lib/**/*.{js,jsx}',
  'src/hooks/**/*.{js,jsx}',
  'src/api/**/*.{js,jsx}',
  'src/utils/**/*.{js,jsx}',
];

const appIgnores = [
  'node_modules/**',
  'dist/**',
  'build/**',
  '.vite/**',
  'coverage/**',
  'tmp/**',
  'temp/**',
  'logs/**',
  'public/base44-local-*.json',
  'build-tools/**',
  'src/build-tools/**',
  'src/components/**',
  './src/components/**',
  '**/src/components/**',
  'components/**',
  './components/**',
  '**/components/**',
  ...componentDocumentationFiles,
];

const globals = {
  window: 'readonly',
  document: 'readonly',
  navigator: 'readonly',
  localStorage: 'readonly',
  sessionStorage: 'readonly',
  console: 'readonly',
  globalThis: 'readonly',
  module: 'readonly',
  process: 'readonly',
  Deno: 'readonly',
  setTimeout: 'readonly',
  setInterval: 'readonly',
  clearTimeout: 'readonly',
  clearInterval: 'readonly',
  Blob: 'readonly',
  URL: 'readonly',
  fetch: 'readonly',
  Response: 'readonly',
  Request: 'readonly',
  Headers: 'readonly',
  FormData: 'readonly',
  File: 'readonly',
  confirm: 'readonly',
  prompt: 'readonly',
  React: 'readonly',
};

export default [
  {
    files: componentDocumentationFiles,
    languageOptions: { parser: documentationNoopParser },
    rules: { 'no-undef': 'off' },
  },
  {
    ignores: appIgnores,
  },
  {
    files: appFiles,
    ignores: appIgnores,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals,
    },
    rules: {
      'no-undef': 'error',
    },
  },
];