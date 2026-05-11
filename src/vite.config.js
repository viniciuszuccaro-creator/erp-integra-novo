import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'node:fs';
import { isDocumentationArtifactPath } from './src/components/lib/documentationBlockPolicy.js';
import { isBlockedDocumentationArtifact, purgeBuildCaches, purgeDocumentationArtifacts } from './build-tools/purgeDocumentationArtifacts.js';
import { runStableEnvironmentCheck } from './build-tools/stableEnvironmentCheck.js';
import { verifyChatbotComponents } from './build-tools/verifyChatbotComponents.js';
import { forceProjectReindex } from './build-tools/projectReindex.js';
import { viteDefineConfig } from './build-tools/buildRuntimeConfig.js';
import { runPrebuildIntegrityCheck } from './build-tools/prebuildIntegrityCheck.js';
import { guardDocumentationArtifacts } from './build-tools/documentationGuard.js';

const documentationArtifactFilePattern = /(^|\/)(README|CERTIFICADO|CERTIFICACAO|CERTIFIC|MANIFESTO|VALIDACAO|CHECKLIST|PROVA|MIGRACAO|BLOQUEIO|DEBUG|DIAGNOSTICO|INTEGRACAO|RESUMO|CHANGELOG|ROADMAP|GUIA|DOCS?|STATUS|ETAPAS|ETAPA|FASES|FASE|SISTEMA|BOTOES|CORRECAO|RELATORIO|REPORT|MANUAL|VALIDADOR|FLUXO|ZINDEX|rhf_zod_report|UnidadesDeMedida)[^/]*(\.(md|txt|rst|adoc|json|config|yaml|yml|js|jsx|ts|tsx))?$/i;
const documentationExtensionPattern = /\.(md|txt|rst|adoc|json|config|yaml|yml)\.(js|jsx|jsxe|ts|tsx)$/i;
const textDocumentationPattern = /\.(md|txt|rst|adoc|yaml|yml|jsxe)$/i;
const componentDocumentationMirrorPattern = /\/src\/components\/.*(\.md\.jsx|\.md\.jsxe|\.txt\.jsx|\.rst\.jsx|\.adoc\.jsx|\.json\.jsx|\.config\.jsx)$/i;
const buildCacheDirs = ['node_modules/.vite', 'node_modules/.cache', 'dist/.vite', '.vite', '.eslintcache', 'build/.vite'];
const validComponentCodePattern = /\.(js|jsx|ts|tsx|css)$/i;
const blockedComponentDocExtensions = ['.md', '.txt', '.rst', '.adoc', '.json', '.config', '.yaml', '.yml', '.jsxe', '.md.jsx', '.md.jsxe', '.txt.jsx', '.rst.jsx', '.adoc.jsx', '.json.jsx', '.config.jsx', '.md.js', '.json.js', '.config.js'];
const blockedComponentDocPrefixes = /(^|\/)(README|CERTIFICADO|CERTIFICACAO|CERTIFICADO|MANIFESTO|VALIDACAO|CHECKLIST|PROVA|MIGRACAO|BLOQUEIO|DEBUG|DIAGNOSTICO|INTEGRACAO|RESUMO|CHANGELOG|ROADMAP|GUIA|DOCS?|STATUS|ETAPAS|ETAPA|FASES|FASE|SISTEMA|BOTOES|CORRECAO|RELATORIO|REPORT|MANUAL|VALIDADOR|FLUXO|ZINDEX|rhf_zod_report|UnidadesDeMedida)/i;
const chatbotDocumentationPattern = /(^|\/)(src\/)?components\/chatbot\/.*(\.(md|txt|rst|adoc|json|config|yaml|yml)(\.(js|jsx|jsxe|ts|tsx))?|README|CERTIFIC|MANIFESTO|VALIDACAO|CHECKLIST|STATUS|GUIA|DOC)/i;

function neutralDocumentationContent(filePath = '') {
  const safeName = `BlockedDoc_${String(filePath).replace(/[^a-zA-Z0-9_$]/g, '_')}`;
  return `const ${safeName} = () => null;\nexport default ${safeName};\n`;
}

function neutralizeDocumentationFile(filePath) {
  try {
    if (fs.existsSync(filePath)) fs.writeFileSync(filePath, neutralDocumentationContent(filePath));
  } catch {}
}

function blockDocumentation() {
  const isBlockedPath = (input = '') => {
    const normalized = input.replace(/\\/g, '/');
    const fileName = normalized.split('/').pop() || '';
    const isInSrc = normalized.includes('/src/') || normalized.startsWith('src/');
    const isInComponents = /(^|\/)src\/components\//i.test(normalized) || /(^|\/)components\//i.test(normalized);
    const isComponentDocMirror = /(^|\/)src\/components\//i.test(normalized) && /(^|\/)(README|CERTIFICADO|CERTIFICACAO|CERTIFIC|MANIFESTO|VALIDACAO|CHECKLIST|PROVA|MIGRACAO|BLOQUEIO|DEBUG|DIAGNOSTICO|INTEGRACAO|RESUMO|CHANGELOG|ROADMAP|GUIA|DOCS?|STATUS|ETAPAS|ETAPA|FASES|FASE|SISTEMA|BOTOES|CORRECAO|FLUXO|ZINDEX|rhf_zod_report|UnidadesDeMedida)[^/]*\.jsx$/i.test(fileName);

    if (isInComponents && !validComponentCodePattern.test(fileName)) return true;

    return chatbotDocumentationPattern.test(normalized) || isComponentDocMirror || (isInSrc && (
      isBlockedDocumentationArtifact(normalized) ||
      isDocumentationArtifactPath(normalized) ||
      textDocumentationPattern.test(fileName) ||
      documentationExtensionPattern.test(fileName) ||
      componentDocumentationMirrorPattern.test(normalized) ||
      documentationArtifactFilePattern.test(fileName) ||
      blockedComponentDocPrefixes.test(fileName)
    ));
  };

  return {
    name: 'block-documentation-artifacts',
    enforce: 'pre',
    buildStart() {
       guardDocumentationArtifacts(__dirname);
       const cleanup = (dir) => {
         if (!fs.existsSync(dir)) return;
         for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
           const filePath = path.join(dir, entry.name);
           if (entry.isDirectory()) {
             cleanup(filePath);
             try {
               if (fs.existsSync(filePath) && fs.readdirSync(filePath).length === 0) fs.rmdirSync(filePath);
             } catch {}
             continue;
           }
           if (entry.isFile() && isBlockedPath(filePath)) neutralizeDocumentationFile(filePath);
         }
       };
       runPrebuildIntegrityCheck(__dirname);
       forceProjectReindex(__dirname);
       runStableEnvironmentCheck(__dirname);
       verifyChatbotComponents(__dirname);
       purgeDocumentationArtifacts(__dirname);
       cleanup(path.resolve(__dirname, 'src'));
       cleanup(path.resolve(__dirname, 'components'));
     },
    configureServer(server) {
      const purgeBuildCachesLocal = () => purgeBuildCaches(__dirname);
      const purgeDocumentationNow = () => {
        runPrebuildIntegrityCheck(__dirname);
        forceProjectReindex(__dirname);
        runStableEnvironmentCheck(__dirname);
        verifyChatbotComponents(__dirname);
        purgeDocumentationArtifacts(__dirname);
      };
      const blockFile = async (filePath) => {
        if (!isBlockedPath(filePath)) return;
        console.log('🚫 Documentação bloqueada: arquivo neutralizado antes de virar código');
        try { server.watcher.unwatch(filePath); } catch {}
        neutralizeDocumentationFile(filePath);
        purgeBuildCachesLocal();
      };

      purgeDocumentationNow();
      server.watcher.on('ready', purgeDocumentationNow);
      server.watcher.on('add', blockFile);
      server.watcher.on('change', blockFile);
      server.watcher.on('unlink', (filePath) => {
        if (blockedComponentDocExtensions.some((ext) => String(filePath).endsWith(ext)) || blockedComponentDocPrefixes.test(String(filePath).split(/[\\/]/).pop() || '')) {
          purgeBuildCachesLocal();
        }
      });
    },
    handleHotUpdate(ctx) {
      if (!isBlockedPath(ctx.file)) return undefined;
      neutralizeDocumentationFile(ctx.file);
      purgeBuildCaches(__dirname);
      return [];
    },
    resolveId(source) {
      if (isBlockedPath(source)) return '\0blocked-doc-file';
      return null;
    },
    load(id) {
      if (id === '\0blocked-doc-file' || isBlockedPath(id)) return 'export default undefined;';
      return null;
    },
    transform(code, id) {
      if (isBlockedPath(id)) return { code: 'export default undefined;', map: null };
      return null;
    },
    generateBundle(_, bundle) {
      Object.keys(bundle).forEach((fileName) => {
        if (isBlockedPath(fileName) || documentationExtensionPattern.test(fileName) || componentDocumentationMirrorPattern.test(fileName)) {
          delete bundle[fileName];
        }
      });
    }
  };
}

export default defineConfig({
  define: viteDefineConfig,
  plugins: [blockDocumentation(), react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  assetsInclude: ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.webp'],
  optimizeDeps: {
    exclude: [
      '**/*.md.jsx',
      '**/*.json.jsx',
      '**/*.config.jsx',
      '**/README*',
      '**/CERTIFICADO*',
      '**/CERTIFICACAO*',
      '**/CERTIFIC*',
      '**/MANIFESTO*',
      '**/VALIDACAO*',
      '**/CHECKLIST*',
      '**/PROVA*',
      '**/BLOQUEIO*',
      '**/DIAGNOSTICO*',
      '**/INTEGRACAO*',
      '**/rhf_zod_report*',
      '**/UnidadesDeMedida*',
    ],
  },
  server: {
    watch: {
      ignored: [
        '**/*.md',
        '**/*.txt',
        '**/*.rst',
        '**/*.adoc',
        '**/*.md.*',
        '**/*.json.*',
        '**/*.config.*',
        '**/README*',
        '**/CERTIFICADO*',
        '**/CERTIFICACAO*',
        '**/CERTIFIC*',
        '**/MANIFESTO*',
        '**/VALIDACAO*',
        '**/CHECKLIST*',
        '**/PROVA*',
        '**/BLOQUEIO*',
        '**/DIAGNOSTICO*',
        '**/INTEGRACAO*',
        '**/rhf_zod_report*',
        '**/UnidadesDeMedida*',
        '**/*.md.jsx',
        '**/*.md.jsxe',
        '**/*.txt.jsx',
        '**/*.rst.jsx',
        '**/*.adoc.jsx',
        '**/*.md.js',
        '**/*.txt.js',
        '**/*.rst.js',
        '**/*.adoc.js',
        '**/*.json.jsx',
        '**/*.config.jsx',
        '**/*.json.js',
        '**/*.config.js',
      ],
    },
  },
});