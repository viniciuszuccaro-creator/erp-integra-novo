// Helpers de auditoria e segurança

function getModuleForEntity(entidade) {
  const moduloMap = {
    Cliente: 'CRM', Oportunidade: 'CRM', Interacao: 'CRM',
    Pedido: 'Comercial', Comissao: 'Comercial', NotaFiscal: 'Fiscal',
    Produto: 'Estoque', MovimentacaoEstoque: 'Estoque',
    ContaPagar: 'Financeiro', ContaReceber: 'Financeiro',
    Entrega: 'Expedição', Romaneio: 'Expedição',
    AuditoriaIA: 'IA', ChatbotInteracao: 'Chatbot',
  };
  return moduloMap[entidade] || 'Sistema';
}

function safeTrimPayload(obj, maxKeys = 200) {
  try {
    if (!obj || typeof obj !== 'object') return obj;
    const keys = Object.keys(obj);
    if (keys.length <= maxKeys) return obj;
    const trimmed = {};
    for (let i = 0; i < maxKeys; i++) {
      const k = keys[i];
      trimmed[k] = obj[k];
    }
    trimmed.__trimmed__ = { kept: maxKeys, total: keys.length };
    return trimmed;
  } catch (_) {
    return obj;
  }
}

// Health-check — _lib functions need Deno.serve to deploy
Deno.serve(async (req) => {
  return Response.json({ ok: true, status: 'healthy', module: '_lib/security/auditHelpers' });
});