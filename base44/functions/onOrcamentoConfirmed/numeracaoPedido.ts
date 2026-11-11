const pagina = (v) => Array.isArray(v) ? v : v?.items || [];
// Contador da própria empresa, sem entidade paralela e sem calcular número no navegador.
// Cada tentativa compara o valor anterior no mesmo update; lacunas são permitidas, reutilização não.
export async function reservarNumeroPedido(base44, groupId, empresaId) {
  const api = base44.asServiceRole.entities;
  for (let tentativa = 0; tentativa < 12; tentativa += 1) {
    const empresa = pagina(await api.Empresa.filter({ id: empresaId, group_id: groupId }, { limit: 1 }))[0];
    if (!empresa) throw new Error('Empresa indisponível para reservar a numeração.');
    const anterior = empresa.sequencial_pedido_360;
    if (anterior != null && (!Number.isSafeInteger(anterior) || anterior < 0)) throw new Error('Sequencial de pedidos inválido no cadastro da empresa.');
    const proximo = Number(anterior || 0) + 1;
    if (!Number.isSafeInteger(proximo)) throw new Error('Sequencial de pedidos esgotado.');
    const condicao = anterior == null ? { $or: [{ sequencial_pedido_360: { $exists: false } }, { sequencial_pedido_360: null }] } : { sequencial_pedido_360: anterior };
    const resultado = await api.Empresa.updateMany({ id: empresaId, group_id: groupId, ...condicao }, { $set: { sequencial_pedido_360: proximo } });
    if (resultado.updated !== 1) continue;
    const numero = `PED-${String(proximo).padStart(6, '0')}`;
    if (await api.Pedido.count({ group_id: groupId, empresa_id: empresaId, numero_pedido: numero }) === 0) return numero;
  }
  throw new Error('Numeração concorrente ou sequência legada ocupada. Tente novamente sem reenviar a criação.');
}