/**
 * SOLUÇÃO FINAL E PERMANENTE
 * Remove QUALQUER arquivo de documentação que Base44 tente criar
 * Executa em: build time, dev time, post-build
 */

import fs from 'node:fs';
import path from 'node:path';

const BLOCKED_PATTERNS = [
  /\.md\.jsx$/i,
  /\.md\.js$/i,
  /\.json\.jsx$/i,
  /\.json\.js$/i,
  /\.config\.jsx$/i,
  /\.config\.js$/i,
  /\.txt\.jsx$/i,
  /\.yaml\.jsx$/i,
  /\.yml\.jsx$/i,
  /\.rst\.jsx$/i,
  /\.adoc\.jsx$/i,
];

const BLOCKED_PREFIXES = [
  'README',
  'CERTIFICADO',
  'CERTIFICACAO',
  'MANIFESTO',
  'VALIDACAO',
  'CHECKLIST',
  'PROVA',
  'ETAPA',
  'FASE',
  'BLOQUEIO',
  'DEBUG',
  'DIAGNOSTICO',
  'INTEGRACAO',
  'RESUMO',
  'FLUXO',
  'ZINDEX',
  'CORRECAO',
  'BOTOES',
  'RHINO',
  'rhf_zod_report',
  'UnidadesDeMedida',
];

const isBlocked = (filePath) => {
  const fileName = path.basename(filePath);
  
  // Check extension patterns
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(fileName)) return true;
  }
  
  // Check prefix patterns
  const fileNameUpper = fileName.split(/[._-]/)[0].toUpperCase();
  for (const prefix of BLOCKED_PREFIXES) {
    if (fileNameUpper.includes(prefix.toUpperCase())) {
      return true;
    }
  }
  
  return false;
};

export function cleanupBlockedArtifacts(rootDir = '.') {
  const root = path.resolve(rootDir);
  const srcDir = path.join(root, 'src');
  let deletedCount = 0;
  
  const scan = (dir) => {
    if (!fs.existsSync(dir)) return;
    
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          if (!/^(node_modules|dist|build|\.git|\.vite)$/.test(entry.name)) {
            scan(fullPath);
          }
        } else if (entry.isFile() && isBlocked(fullPath)) {
          try {
            fs.unlinkSync(fullPath);
            deletedCount++;
            console.log(`🚫 BLOCKED & DELETED: ${path.relative(root, fullPath)}`);
          } catch (e) {
            console.warn(`⚠️  Failed to delete: ${fullPath}`, e.message);
          }
        }
      }
    } catch (e) {
      console.error(`Error scanning ${dir}:`, e.message);
    }
  };
  
  scan(srcDir);
  return { deletedCount };
}

// Execute immediately on import
const result = cleanupBlockedArtifacts();
console.log(`✅ Artifact Blocker: Removed ${result.deletedCount} files`);