import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'node:fs';

const documentationArtifactFilePattern = /(^|\/)(README|CERTIFICADO|CERTIFICACAO|MANIFESTO|VALIDACAO|CHECKLIST|PROVA|MIGRACAO|BLOQUEIO|DEBUG|DIAGNOSTICO|INTEGRACAO|RESUMO|CHANGELOG|ROADMAP|GUIA|DOCS?|rhf_zod_report|UnidadesDeMedida)[^/]*(\.(md|txt|rst|adoc|json|config|js|jsx|ts|tsx))?$/i;
const documentationExtensionPattern = /\.(md|txt|rst|adoc|json|config)\.(js|jsx|ts|tsx)$/i;
const textDocumentationPattern = /\.(md|txt|rst|adoc)$/i;

function blockDocumentation() {
  const isBlockedPath = (input = '') => {
    const normalized = input.replace(/\\/g, '/');
    const fileName = normalized.split('/').pop() || '';
    const isInSrc = normalized.includes('/src/') || normalized.startsWith('src/');

    return isInSrc && (
      textDocumentationPattern.test(fileName) ||
      documentationExtensionPattern.test(fileName) ||
      documentationArtifactFilePattern.test(fileName)
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
      cleanup(path.resolve(__dirname, 'src'));
    },
    configureServer(server) {
      const blockFile = async (filePath) => {
        if (!isBlockedPath(filePath)) return;
        console.log('🚫 Arquivo de documentação ignorado/removido do build');
        try { server.watcher.unwatch(filePath); } catch {}
        try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch {}
      };
      server.watcher.on('add', blockFile);
      server.watcher.on('change', blockFile);
    },
    resolveId(source) {
      if (isBlockedPath(source)) return '\0blocked-doc-file';
      return null;
    },
    load(id) {
      if (id === '\0blocked-doc-file' || isBlockedPath(id)) return 'export default undefined;';
      return null;
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