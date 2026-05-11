#!/usr/bin/env node

/**
 * GARANTIDOR FINAL DE LIMPEZA
 * Roda ANTES de qualquer build/lint/dev
 * Propósito: Eliminar 100% dos artefatos injetados pela plataforma
 */

const fs = require('fs');
const path = require('path');

// Padrões absolutamente proibidos
const FORBIDDEN = [
  /\.(md|txt|rst|adoc|json|yaml|yml)\.(jsx?|tsx?)$/i,
  /\.config\.(jsx?|tsx?)$/i,
  /[A-Z][A-Z0-9_]*(CERTIFICADO|MANIFESTO|CHECKLIST|DEBUG|DIAGNOSTICO|INTEGRACAO|RELATORIO|VALIDACAO|ETAPA|FASE|SISTEMA)[^/]*\.(jsx?|tsx?)$/i,
];

const isForbidden = (filePath) => FORBIDDEN.some(p => p.test(filePath));

function purge(dir) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    entries.forEach(entry => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && !['node_modules', '.git', 'dist', '.vite', '.next'].includes(entry.name)) {
        purge(fullPath);
      } else if (entry.isFile() && isForbidden(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
          console.log(`✅ ELIMINADO: ${path.relative(process.cwd(), fullPath)}`);
        } catch (e) {
          console.warn(`⚠️ FALHA ao deletar ${path.relative(process.cwd(), fullPath)}`);
        }
      }
    });
  } catch (e) {
    // Diretório pode não existir ainda
  }
}

console.log('🧹 Iniciando limpeza de artefatos...');
purge(path.resolve('src'));
purge(path.resolve('public'));
console.log('✅ Limpeza concluída. Sistema pronto.');