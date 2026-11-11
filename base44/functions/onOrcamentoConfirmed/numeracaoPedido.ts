const pagina = (v) => Array.isArray(v) ? v : v?.items || [];
// Contadores da própria empresa, reservados por comparação atômica; números não são reutilizados.
export async function reservarNumeroDocumento(base44, groupId, empresaId, tipo = 'pedido') {
  const api = base44.asServiceRole.entities;
  const orcamento = tipo === 'orcamento';
  const campo = orcamento ? 'sequencial_orcamento_360' : 'sequencial_pedido_360';
  const entidade = orcamento ? api.OrcamentoCliente : api.Pedido;
  const numeroCampo = orcamento ? 'numero_orcamento' : 'numero_pedido';
  for (let tentativa = 0; tentativa < 12; tentativa += 1) {
    const empresa = pagina(await api.Empresa.filter({ id: empresaId, group_id: groupId }, { limit: 1 }))[0];
    if (!empresa) throw new Error('Empresa indisponível para reservar a numeração.');
    const anterior = empresa[campo];
    if (anterior != null && (!Number.isSafeInteger(anterior) || anterior < 0)) throw new Error('Sequencial inválido no cadastro da empresa.');
    const proximo = Number(anterior || 0) + 1;
    if (!Number.isSafeInteger(proximo)) throw new Error('Sequencial esgotado.');
    const condicao = anterior == null ? { $or: [{ [campo]: { $exists: false } }, { [campo]: null }] } : { [campo]: anterior };
    const resultado = await api.Empresa.updateMany({ id: empresaId, group_id: groupId, ...condicao }, { $set: { [campo]: proximo } });
    if (resultado.updated !== 1) continue;
    const numero = `${orcamento ? 'ORC' : 'PED'}-${String(proximo).padStart(orcamento ? 4 : 6, '0')}`;
    if (await entidade.count({ group_id: groupId, empresa_id: empresaId, [numeroCampo]: numero }) === 0) return numero;
  }
  throw new Error('Numeração concorrente ou sequência legada ocupada. Retome a operação sem reenviar a criação.');
}
export const reservarNumeroPedido = (base44, groupId, empresaId) => reservarNumeroDocumento(base44, groupId, empresaId);