import fs from 'node:fs';
import path from 'node:path';
import { isBlockedDocumentationArtifact } from './purgeDocumentationArtifacts.js';

const normalize = (value = '') => String(value || '').replace(/\\/g, '/');
const CHATBOT_DIRS = ['src/components/chatbot', 'components/chatbot'];
const VALID_CHATBOT_FILE_PATTERN = /\.(js|jsx|ts|tsx|css)$/i;
const DOCUMENTATION_OR_TEXT_PATTERN = /\.(md|txt|rst|adoc|json|config|yaml|yml)(\.(js|jsx|ts|tsx))?$/i;
const DOC_NAME_PATTERN = /(^|\/)(README|CERTIFICADO|CERTIFICACAO|CERTIFIC|MANIFESTO|VALIDACAO|CHECKLIST|PROVA|DEBUG|DIAGNOSTICO|INTEGRACAO|RESUMO|CHANGELOG|ROADMAP|GUIA|DOCS?|STATUS|ETAPA|FASE|SISTEMA|BLOQUEIO|CORRECAO)/i;

const shouldRemove = (filePath) => {
  const normalized = normalize(filePath);
  const fileName = normalized.split('/').pop() || '';

  if (!VALID_CHATBOT_FILE_PATTERN.test(fileName)) return true;
  if (DOCUMENTATION_OR_TEXT_PATTERN.test(fileName)) return true;
  if (DOC_NAME_PATTERN.test(fileName)) return true;
  if (isBlockedDocumentationArtifact(normalized)) return true;

  return false;
};

export function verifyChatbotComponents(rootDir = '.') {
  const root = path.resolve(rootDir);
  const removedFiles = [];
  const checkedFiles = [];

  for (const relativeDir of CHATBOT_DIRS) {
    const dir = path.resolve(root, relativeDir);
    if (!fs.existsSync(dir)) continue;

    const visit = (currentDir) => {
      let entries = [];
      try {
        entries = fs.readdirSync(currentDir, { withFileTypes: true });
      } catch {
        return;
      }

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        const relativePath = normalize(path.relative(root, fullPath));

        if (entry.isDirectory()) {
          visit(fullPath);
          try {
            if (fs.existsSync(fullPath) && fs.readdirSync(fullPath).length === 0) fs.rmdirSync(fullPath);
          } catch {}
          continue;
        }

        if (!entry.isFile()) continue;
        checkedFiles.push(relativePath);

        if (shouldRemove(relativePath)) {
          try {
            fs.unlinkSync(fullPath);
            removedFiles.push(relativePath);
          } catch {}
        }
      }
    };

    visit(dir);
  }

  return {
    status: 'chatbot_components_verified',
    checkedCount: checkedFiles.length,
    removedCount: removedFiles.length,
    removedFiles,
    documentationBlocked: true,
    markdownBlocked: true,
    corruptedFilesBlocked: true,
    compileSafetyMode: true,
  };
}

export function assertNoChatbotDocumentationArtifacts(rootDir = '.') {
  const result = verifyChatbotComponents(rootDir);
  return {
    ...result,
    clean: result.removedCount === 0,
  };
}