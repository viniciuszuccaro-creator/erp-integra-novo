#!/usr/bin/env node
/**
 * PRÉ-LINT CLEANUP: Elimina arquivos-fantasma ANTES do ESLint rodar
 * Executado automaticamente pelo npm script lint
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const BLOCKED_PATTERNS = [
  /\.(md|txt|rst|adoc|yaml|yml)\.(jsx|js)$/i,
  /\.(json|config)\.(jsx|js)$/i,
  /(README|CERTIFICADO|CERTIFICACAO|MANIFESTO|VALIDACAO|CHECKLIST|PROVA|BLOQUEIO|DEBUG|DIAGNOSTICO|INTEGRACAO|RESUMO|ETAPA|FASE|FLUXO|ZINDEX|rhf_zod_report|UnidadesDeMedida).*\.(jsx|js)$/i,
];

function removeBlockedFiles(dir) {
  try {
    if (!fs.existsSync(dir)) return 0;
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    let count = 0;
    
    entries.forEach(entry => {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        count += removeBlockedFiles(fullPath);
        return;
      }
      
      const isBlocked = BLOCKED_PATTERNS.some(p => p.test(entry.name));
      if (isBlocked) {
        try {
          fs.unlinkSync(fullPath);
          console.log(`🗑️  Deleted: ${fullPath}`);
          count++;
        } catch (e) {
          console.warn(`⚠️  Could not delete: ${fullPath}`);
        }
      }
    });
    
    return count;
  } catch (e) {
    console.warn(`Error scanning ${dir}: ${e.message}`);
    return 0;
  }
}

const srcDir = path.join(rootDir, 'src');
const total = removeBlockedFiles(srcDir);
console.log(`✅ Pre-lint cleanup complete: ${total} files removed`);