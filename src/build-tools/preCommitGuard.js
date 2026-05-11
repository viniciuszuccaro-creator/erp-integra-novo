#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const BLOCKED_PATTERNS = [
  /\.(md|txt|rst|adoc|json|yaml|yml)\.(jsx?|ts)$/i,
  /(README|CERTIFICADO|CERTIFICACAO|MANIFESTO|VALIDACAO|CHECKLIST|PROVA|MIGRACAO|BLOQUEIO|DEBUG|DIAGNOSTICO|INTEGRACAO|RESUMO|CHANGELOG|ROADMAP|GUIA|DOCS?|STATUS|ETAPA|FASE|SISTEMA|BOTOES|CORRECAO|RELATORIO|REPORT|MANUAL|VALIDADOR|FLUXO|ZINDEX|rhf_zod_report|UnidadesDeMedida)[^/]*\.(jsx?|ts)$/i,
];

const isBlocked = (filePath) => BLOCKED_PATTERNS.some(p => p.test(filePath));

const scanAndPurge = (dir) => {
  try {
    fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanAndPurge(fullPath);
      } else if (isBlocked(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log(`✗ BLOCKED FROM COMMIT: ${fullPath}`);
      }
    });
  } catch (e) {}
};

const srcPath = path.resolve(__dirname, '../src');
scanAndPurge(srcPath);
console.log('✓ Pre-commit guard completed');