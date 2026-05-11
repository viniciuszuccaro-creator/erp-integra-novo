/**
 * Barreira final: Impede QUALQUER documentação-fantasma de virar código
 * Executado antes do build e ESLint
 */
import fs from 'fs';
import path from 'path';

const BLOCKED_PATTERNS = [
  /\.(md|txt|rst|adoc|yaml|yml)\.(jsx|js)$/i,
  /\.(json|config)\.(jsx|js)$/i,
  /(README|CERTIFICADO|CERTIFICACAO|MANIFESTO|VALIDACAO|CHECKLIST|PROVA|BLOQUEIO|DEBUG|DIAGNOSTICO|INTEGRACAO|RESUMO|ETAPA|FASE|FLUXO|ZINDEX|rhf_zod_report|UnidadesDeMedida)/i,
];

export function guardDocumentationArtifacts(rootDir = '.') {
  const componentsDir = path.join(rootDir, 'src', 'components');
  
  if (!fs.existsSync(componentsDir)) return;

  const scan = (dir) => {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      entries.forEach(entry => {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          scan(fullPath);
          return;
        }

        // Se for arquivo bloqueado, delete imediatamente
        const isBlocked = BLOCKED_PATTERNS.some(p => p.test(entry.name));
        if (isBlocked) {
          try {
            fs.unlinkSync(fullPath);
            console.log(`🔥 [DocumentationGuard] Artefato eliminado: ${fullPath}`);
          } catch (e) {
            console.warn(`⚠️ [DocumentationGuard] Falha ao eliminar: ${fullPath}`);
          }
        }
      });
    } catch (e) {
      console.warn(`[DocumentationGuard] Erro ao escanear: ${dir}`);
    }
  };

  scan(componentsDir);
}

guardDocumentationArtifacts();