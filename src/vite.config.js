import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'node:fs';
import { isDocumentationArtifactPath } from './src/components/lib/documentationBlockPolicy.js';

const documentationArtifactFilePattern = /(^|\/)(README|CERTIFICADO|CERTIFICACAO|CERTIFICADO|MANIFESTO|VALIDACAO|CHECKLIST|PROVA|MIGRACAO|BLOQUEIO|DEBUG|DIAGNOSTICO|INTEGRACAO|RESUMO|CHANGELOG|ROADMAP|GUIA|DOCS?|STATUS|ETAPA|FASE|SISTEMA|rhf_zod_report|UnidadesDeMedida)[^/]*(\.(md|txt|rst|adoc|json|config|js|jsx|ts|tsx))?$/i;
const documentationExtensionPattern = /\.(md|txt|rst|adoc|json|config)\.(js|jsx|ts|tsx)$/i;
const textDocumentationPattern = /\.(md|txt|rst|adoc)$/i;
const componentDocumentationMirrorPattern = /\/src\/components\/.*(\.md\.jsx|\.txt\.jsx|\.rst\.jsx|\.adoc\.jsx|\.json\.jsx|\.config\.jsx)$/i;
const buildCacheDirs = ['node_modules/.vite', 'node_modules/.cache', 'dist/.vite', '.vite', '.eslintcache', 'build/.vite'];
const blockedComponentDocExtensions = ['.md', '.txt', '.rst', '.adoc', '.md.jsx', '.txt.jsx', '.rst.jsx', '.adoc.jsx', '.json.jsx', '.config.jsx', '.md.js', '.json.js', '.config.js'];
const blockedComponentDocPrefixes = /(^|\/)(README|CERTIFICADO|CERTIFICACAO|MANIFESTO|VALIDACAO|CHECKLIST|PROVA|MIGRACAO|BLOQUEIO|DEBUG|DIAGNOSTICO|INTEGRACAO|RESUMO|CHANGELOG|ROADMAP|GUIA|DOCS?|STATUS|ETAPA|FASE|SISTEMA|BOTOES|CORRECAO|rhf_zod_report|UnidadesDeMedida)/i;

function blockDocumentation() {
  const isBlockedPath = (input = '') => {
    const normalized = input.replace(/\\/g, '/');
    const fileName = normalized.split('/').pop() || '';
    const isInSrc = normalized.includes('/src/') || normalized.startsWith('src/');

    return isInSrc && (
      isDocumentationArtifactPath(normalized) ||
      textDocumentationPattern.test(fileName) ||
      documentationExtensionPattern.test(fileName) ||
      componentDocumentationMirrorPattern.test(normalized) ||
      documentationArtifactFilePattern.test(fileName) ||
      blockedComponentDocPrefixes.test(fileName)
    );
  };

  return {
    name: 'block-documentation-artifacts',
    enforce: 'pre',
    buildStart() {
      const cleanup = (dir) => {
        if (!fs.existsSync(dir)) return;
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          const filePath = path.join(dir, entry.name);
          if (entry.isDirectory()) cleanup(filePath);
          if (entry.isFile() && isBlockedPath(filePath)) fs.unlinkSync(filePath);
        }
      };
      buildCacheDirs.forEach((dir) => {
        try { fs.rmSync(path.resolve(__dirname, dir), { recursive: true, force: true }); } catch {}
      });
      cleanup(path.resolve(__dirname, 'src'));
    },
    configureServer(server) {
      const purgeBuildCaches = () => buildCacheDirs.forEach((dir) => {
        try { fs.rmSync(path.resolve(__dirname, dir), { recursive: true, force: true }); } catch {}
      });
      const blockFile = async (filePath) => {
        if (!isBlockedPath(filePath)) return;
        console.log('🚫 Documentação bloqueada: arquivo removido antes de virar código');
        try { server.watcher.unwatch(filePath); } catch {}
        try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch {}
        purgeBuildCaches();
      };
      server.watcher.on('add', blockFile);
      server.watcher.on('change', blockFile);
      server.watcher.on('unlink', (filePath) => {
        if (blockedComponentDocExtensions.some((ext) => String(filePath).endsWith(ext)) || blockedComponentDocPrefixes.test(String(filePath).split(/[\\/]/).pop() || '')) {
          buildCacheDirs.forEach((dir) => {
            try { fs.rmSync(path.resolve(__dirname, dir), { recursive: true, force: true }); } catch {}
          });
        }
      });
    },
    resolveId(source) {
      if (isBlockedPath(source)) return '\0blocked-doc-file';
      return null;
    },
    load(id) {
      if (id === '\0blocked-doc-file' || isBlockedPath(id)) return 'export default undefined;';
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
  define: { 'process.env.VITE_IGNORE_DOCS': 'true' },
  plugins: [react(), blockDocumentation()],
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
  },
});