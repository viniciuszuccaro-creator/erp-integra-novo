import { montarPedidoConversao, referenciaOrcamento } from './pedidoConversaoPayload.ts';
import { reservarNumeroPedido } from './numeracaoPedido.ts';
const pagina = (v) => Array.isArray(v) ? v : v?.items || [];
const snapshot = (r) => JSON.stringify([r.cliente_id, r.cliente_nome, r.itens, r.valor_total, r.condicoes_pagamento, r.data_validade, r.prazo_entrega, r.vendedor_responsavel_id]);
const hash = async (v) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(v))))).map((n) => n.toString(16).padStart(2, '0')).join('');

// Saga durável, não transação entre entidades. Uma criação de resultado incerto nunca é reenviada.
// O chamador já verificou autenticação, RBAC, carteira e a empresa pertencente ao grupo.
export async function converterPedido(base44, ctx, body, registro, validar, auditar) {
  const api = base44.asServiceRole.entities;
  const escopo = { id: registro.id, group_id: registro.group_id, empresa_id: registro.empresa_id };
  const negar = async (error, status = 409) => {
    await auditar(base44, ctx.user, registro, 'Bloqueio', error);
    return Response.json({ error }, { status });
  };
  if (!/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(body.operacao_id || '') || body.revisado !== true) return negar('Operação válida e conferência explícita da proposta são obrigatórias.', 400);
  const buscar = async () => pagina(await base44.entities.Pedido.filter({ group_id: registro.group_id, empresa_id: registro.empresa_id, origem_externa_id: referenciaOrcamento(registro.id) }, { limit: 2 }));
  let controle = registro.conversao_pedido;
  const encontrados = await buscar();
  if (encontrados.length > 1) return negar('Há mais de um pedido vinculado à proposta. Revise os vínculos antes de continuar.');
  if (registro.pedido_gerado_id) {
    const pedido = pagina(await base44.entities.Pedido.filter({ id: registro.pedido_gerado_id, group_id: registro.group_id, empresa_id: registro.empresa_id }, { limit: 1 }))[0];
    if (!pedido || pedido.cliente_id !== registro.cliente_id) return negar('O vínculo com o pedido exige revisão no contexto da empresa.');
    return Response.json({ ok: true, pedido, orcamento: registro, repetida: true });
  }
  const concluir = async (pedido) => {
    if (pedido.cliente_id !== registro.cliente_id || pedido.status === 'Cancelado') return negar('O pedido vinculado exige revisão antes de concluir a conversão.');
    const atual = pagina(await api.OrcamentoCliente.filter(escopo, { limit: 1 }))[0];
    if (atual?.pedido_gerado_id === pedido.id) return Response.json({ ok: true, pedido, orcamento: atual, repetida: true });
    if (!atual || atual.status !== 'Aprovado' || snapshot(atual) !== snapshot(registro)) return negar('A proposta mudou durante a conversão. O pedido foi preservado para conciliação, sem segunda criação.');
    const estado = atual.conversao_pedido;
    if (!estado || !['criando', 'revisao'].includes(estado.fase)) return negar('Conversão em processamento; aguarde a conclusão antes de reenviar.');
    // Auditorias explícitas porque o vínculo final usa updateMany, que não dispara efeitos individuais.
    await api.AuditLog.create({
      usuario: ctx.user.full_name || ctx.user.email, usuario_id: ctx.user.id, acao: 'Criação', modulo: 'Comercial', tipo_auditoria: 'entidade',
      entidade: 'Pedido', registro_id: pedido.id, group_id: registro.group_id, empresa_id: registro.empresa_id,
      descricao: `Conversão do orçamento ${registro.numero_orcamento}; operação ${estado.operacao_id}.`,
      dados_anteriores: null, dados_novos: pedido, data_hora: new Date().toISOString(), sucesso: true,
    });
    const patch = { status: 'Convertido', pedido_gerado_id: pedido.id, conversao_pedido: { ...estado, fase: 'concluida', pedido_id: pedido.id } };
    const resultado = await api.OrcamentoCliente.updateMany({ ...escopo, updated_date: atual.updated_date, status: 'Aprovado', 'conversao_pedido.token': estado.token }, { $set: patch });
    if (resultado.updated !== 1) return negar('O pedido já foi criado; o vínculo mudou durante a gravação. Reabra a proposta para conciliar, sem criar outro pedido.');
    const depois = pagina(await api.OrcamentoCliente.filter(escopo, { limit: 1 }))[0];
    await auditar(base44, ctx.user, registro, 'Edição', `Orçamento convertido no pedido ${pedido.numero_pedido}.`, depois);
    return Response.json({ ok: true, pedido, orcamento: depois, repetida: Boolean(encontrados.length) });
  };
  if (encontrados.length) return concluir(encontrados[0]);
  if (registro.status !== 'Aprovado') return negar('Somente uma proposta aprovada pode gerar pedido.');
  if (controle && controle.operacao_id !== body.operacao_id) return negar('Esta proposta já possui uma conversão iniciada. Reabra a proposta e retome a mesma operação.');
  if (controle && ['preparando', 'criando', 'revisao'].includes(controle.fase)) return negar(controle.fase === 'preparando' ? 'Numeração em processamento. Aguarde antes de reenviar.' : 'Criação em processamento ou com resultado incerto. Se o pedido aparecer, a próxima confirmação concilia o vínculo; nenhuma segunda criação será executada.');
  if (!controle && registro.updated_date !== body.versao) return negar('A proposta foi alterada. Recarregue e revise antes de converter.');
  if (controle && controle.versao_origem !== body.versao) return negar('A versão de origem desta operação não corresponde à proposta conferida.');
  if (!body.formulario || typeof body.formulario !== 'object' || Array.isArray(body.formulario)) return negar('Informe os dados conferidos do pedido.', 400);
  let payload;
  try { payload = montarPedidoConversao(registro, ctx.user, body.destino, body.formulario); }
  catch (e) { return negar(e.message, 422); }
  const { data_pedido: dataIgnorada, ...assinaturaPayload } = payload;
  const payloadHash = await hash(assinaturaPayload);
  // Validação integral e atual de cliente, produtos, crédito e liberações, não só a validação visual.
  const validacao = await validar({ ...body, acao: 'validar', versao: registro.updated_date, preparar_pedido: false });
  if (!validacao.ok) return validacao;
  const anterior = controle;
  controle = { ...controle, operacao_id: body.operacao_id, token: crypto.randomUUID(), versao_origem: controle?.versao_origem || body.versao, usuario_id: ctx.user.id, fase: 'preparando', destino: body.destino, iniciada_em: new Date().toISOString(), payload_hash: payloadHash };
  const condicao = anterior ? { 'conversao_pedido.token': anterior.token, 'conversao_pedido.fase': 'preparada' } : { $or: [{ conversao_pedido: { $exists: false } }, { conversao_pedido: null }] };
  const reserva = await api.OrcamentoCliente.updateMany({ ...escopo, status: 'Aprovado', updated_date: registro.updated_date, ...condicao }, { $set: { conversao_pedido: controle } });
  if (reserva.updated !== 1) return negar('Outra confirmação assumiu a proposta. Nenhum segundo pedido foi criado.');
  let criacaoIniciada = false;
  try {
    await auditar(base44, ctx.user, registro, 'Edição', 'Conversão reservada para criação do pedido.', { conversao_pedido: controle });
    controle.numero_pedido = controle.numero_pedido || await reservarNumeroPedido(base44, registro.group_id, registro.empresa_id);
    controle.fase = 'criando';
    const atual = pagina(await api.OrcamentoCliente.filter(escopo, { limit: 1 }))[0];
    if (!atual || snapshot(atual) !== snapshot(registro)) throw new Error('A proposta mudou antes da criação. Revise a negociação.');
    const inicio = await api.OrcamentoCliente.updateMany({ ...escopo, updated_date: atual.updated_date, status: 'Aprovado', 'conversao_pedido.token': controle.token, 'conversao_pedido.fase': 'preparando' }, { $set: { conversao_pedido: controle } });
    if (inicio.updated !== 1) throw new Error('A proposta mudou antes da criação. Nenhum pedido foi enviado.');
    criacaoIniciada = true;
    // Criação individual com token do usuário preserva os gatilhos proprietários do Pedido.
    const pedido = await base44.entities.Pedido.create({ ...payload, numero_pedido: controle.numero_pedido });
    return await concluir(pedido);
  } catch (e) {
    // Antes do POST pode retomar; depois do POST nunca repete uma criação possivelmente efetivada.
    await api.OrcamentoCliente.updateMany({ ...escopo, 'conversao_pedido.token': controle.token, 'conversao_pedido.fase': { $in: ['preparando', 'criando'] } }, { $set: { conversao_pedido: { ...controle, fase: criacaoIniciada ? 'revisao' : 'preparada' } } });
    return Response.json({ error: criacaoIniciada ? 'A confirmação teve resultado incerto. Reabra a proposta para conciliar o pedido existente; a criação não será reenviada automaticamente.' : e.message }, { status: 409 });
  }
}