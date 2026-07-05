import { base44 } from "@/api/base44Client";

/**
 * Helpers de auditoria compartilhados pelos fluxos de pedido
 * Multi-tenant: resolve group_id a partir da empresa informada
 */
export async function getUsuarioAtual() {
  try { return await base44.auth.me(); } catch { return null; }
}

const MODULO_MAP = {
  'Logística': 'Expedição',
  'Logistica': 'Expedição',
  'Expedição': 'Expedição',
  'Produção': 'Produção',
  'Producao': 'Produção',
  'Estoque': 'Estoque',
  'Financeiro': 'Financeiro',
  'Comercial': 'Comercial'
};

export async function auditar(modulo, entidade, acao, registro_id, descricao, empresaId, dados_anteriores = null, dados_novos = null) {
  const user = await getUsuarioAtual();

  let groupId = null;
  if (empresaId) {
    try {
      const empresa = await base44.entities.Empresa.get(empresaId);
      groupId = empresa?.group_id || empresa?.grupo_id || null;
    } catch { /* empresa pode não existir; groupId fica null */ }
  }

  const moduloNorm = MODULO_MAP[modulo] || modulo;
  await base44.entities.AuditLog.create({
    group_id: groupId,
    empresa_id: empresaId,
    usuario: user?.full_name || user?.email || 'Sistema',
    usuario_id: user?.id || '',
    acao,
    action: acao,
    modulo: moduloNorm,
    entidade,
    entity_name: entidade,
    registro_id,
    descricao,
    dados_anteriores: dados_anteriores || undefined,
    dados_novos: dados_novos || undefined,
    data_hora: new Date().toISOString(),
    sucesso: true
  });
}