/**
 * Guard RBAC + auditoria de exportações (Regra-Mãe 5b/5d)
 * Regra-Mãe 3: extraído de exportacaoExcel.jsx — comportamento preservado
 * Bloqueia exportação sem permissão e registra log com groupId/empresaId
 */
import { base44 } from "@/api/base44Client";

/**
 * Valida permissão e registra auditoria da exportação
 * @param {object} contexto - { enforce, allowed, module, empresa_id, group_id }
 * @param {string} descBloqueio - rótulo usado no log de bloqueio (ex: 'Pedidos')
 * @param {string} descExportacao - rótulo usado no log de exportação (ex: 'ContasReceber')
 * @throws {Error} se sem permissão
 */
export function validarEAuditarExportacao(contexto, descBloqueio, descExportacao) {
  if (contexto?.enforce && contexto?.allowed === false) {
    base44.entities.AuditLog.create({ acao: 'Bloqueio', modulo: contexto.module || 'Sistema', tipo_auditoria: 'seguranca', entidade: 'Exportacao', descricao: `Sem permissão - ${descBloqueio}`, empresa_id: contexto.empresa_id || null, group_id: contexto.group_id || null, data_hora: new Date().toISOString(), sucesso: false });
    throw new Error('Sem permissão para exportar');
  }
  base44.entities.AuditLog.create({ acao: 'Exportação', modulo: contexto.module || 'Sistema', tipo_auditoria: 'ui', entidade: 'Exportacao', descricao: `${descExportacao} → Excel`, empresa_id: contexto.empresa_id || null, group_id: contexto.group_id || null, data_hora: new Date().toISOString(), sucesso: true });
}