import { reservarNumeroDocumento } from './numeracaoPedido.ts';
import { assinaturaOrigem, montarDerivacao, totalItens } from './derivacaoPayload.ts';
const pagina = (v) => Array.isArray(v) ? v : v?.items || [];
const hash = async (v) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(v)))).map((n) => n.toString(16).padStart(2, '0')).join('');

// Saga conservadora no orçamento existente: falha após POST nunca repete criação incerta.
// O endpoint chamador já autorizou usuário, carteira, empresa, grupo e ações criar/editar.
export async function derivarOrcamento(base44, ctx, body, registro, auditar) {
  const api = base44.asServiceRole.entities, user = ctx.user;
  const escopo = { id: registro.id, group_id: registro.group_id, empresa_id: registro.empresa_id };
  const negar = async (error, status = 409) => { await auditar(base44, user, registro, 'Bloqueio', error); return Response.json({ error }, { status }); };
  if (!/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(body.operacao_id || '') || body.revisado !== true) return negar('Operação válida e conferência explícita são obrigatórias.', 400);
  const filtroFilho = { group_id: registro.group_id, empresa_id: registro.empresa_id, 'origem_derivacao.orcamento_id': registro.id, 'origem_derivacao.operacao_id': body.operacao_id };
  const filhos = pagina(await api.OrcamentoCliente.filter(filtroFilho, { limit: 2 }));
  if (filhos.length > 1) return negar('Mais de um orçamento vinculado. Concilie os registros antes de continuar.');
  let controle = registro.derivacao_orcamento;
  const filho = filhos[0];
  if (filho && (filho.cliente_id !== registro.cliente_id || filho.origem_derivacao?.acao !== body.acao)) return negar('O vínculo do orçamento derivado exige revisão.');
  if (filho?.origem_derivacao.confirmada && (controle?.operacao_id !== body.operacao_id || controle.fase === 'concluida')) return Response.json({ ok: true, orcamento: registro, novo_orcamento: filho, repetida: true });
  if (controle?.fase !== 'concluida' && controle && (controle.operacao_id !== body.operacao_id || controle.acao !== body.acao)) return negar(`Existe ${controle.acao} em andamento. Retome essa operação antes de iniciar outra.`);
  const mesma = controle?.operacao_id === body.operacao_id;
  if (mesma && controle.acao !== body.acao) return negar('O identificador da operação não pode trocar de ação.', 400);
  if (mesma && controle.versao_origem !== body.versao) return negar('A versão não corresponde à operação iniciada.');
  const confirmarFilho = async (origem, destino) => {
    if (destino.status !== 'Pendente' || await hash(assinaturaOrigem(destino)) !== controle.assinatura_destino) return negar('O orçamento derivado foi alterado antes da conciliação. Revise os dois registros.');
    const patch = { origem_derivacao: { ...destino.origem_derivacao, confirmada: true } };
    if (!destino.origem_derivacao.confirmada) {
      const gravacao = await api.OrcamentoCliente.updateMany({ ...filtroFilho, id: destino.id, updated_date: destino.updated_date, 'origem_derivacao.confirmada': false }, { $set: patch });
      if (gravacao.updated !== 1) return negar('O destino mudou durante a conciliação. Reabra a origem, sem criar outro orçamento.');
    }
    const confirmado = { ...destino, ...patch };
    await auditar(base44, user, destino, 'Criação', `Orçamento derivado de ${registro.numero_orcamento}; operação ${body.operacao_id}.`, confirmado);
    if (controle.fase !== 'concluida') {
      const fim = await api.OrcamentoCliente.updateMany({ ...escopo, 'derivacao_orcamento.token': controle.token, 'derivacao_orcamento.fase': 'vinculada' }, { $set: { derivacao_orcamento: { ...controle, fase: 'concluida' } } });
      if (fim.updated !== 1) return negar('O destino foi confirmado. Reabra a origem para concluir a conciliação.');
    }
    const atualizado = pagina(await api.OrcamentoCliente.filter(escopo, { limit: 1 }))[0];
    await auditar(base44, user, origem, 'Edição', 'Conciliação do orçamento derivado concluída.', atualizado);
    return Response.json({ ok: true, orcamento: atualizado, novo_orcamento: confirmado, repetida: Boolean(filho) });
  };
  if (mesma && ['vinculada', 'concluida'].includes(controle.fase)) {
    if (!filho || controle.destino_id !== filho.id) return negar('Operação concluída sem destino verificável. Não será recriada.');
    return confirmarFilho(registro, filho);
  }
  let preparo;
  try { preparo = montarDerivacao(registro, user, body.acao, mesma ? controle.indices : body.indices); }
  catch (e) { return negar(e.message, 422); }
  const assinatura = await hash(assinaturaOrigem(registro));
  if (mesma && assinatura !== controle.assinatura_origem) return negar('A origem mudou durante a operação. Nenhum item será removido automaticamente.');
  if (!mesma && registro.updated_date !== body.versao) return negar('O orçamento mudou. Recarregue e confira os itens salvos.');
  if (mesma && body.acao === 'desmembrar' && JSON.stringify((Array.isArray(body.indices) ? [...body.indices] : []).sort((a, b) => a - b)) !== JSON.stringify(controle.indices)) return negar('Retome a seleção original desta operação.', 400);
  const finalizar = async (destino) => {
    if (await hash(assinaturaOrigem(destino)) !== controle.assinatura_destino) return negar('Os dados do orçamento derivado divergem da criação autorizada.');
    const atual = pagina(await api.OrcamentoCliente.filter(escopo, { limit: 1 }))[0];
    if (!atual || atual.derivacao_orcamento?.token !== controle.token || await hash(assinaturaOrigem(atual)) !== controle.assinatura_origem) return negar('A origem mudou antes da conclusão. O destino foi preservado para conciliação.');
    const patch = { ...(body.acao === 'desmembrar' ? { itens: preparo.manter, valor_total: totalItens(preparo.manter) } : {}), derivacao_orcamento: { ...controle, fase: 'vinculada', destino_id: destino.id } };
    const gravacao = await api.OrcamentoCliente.updateMany({ ...escopo, updated_date: atual.updated_date, 'derivacao_orcamento.token': controle.token, 'derivacao_orcamento.fase': { $in: ['criando', 'revisao'] } }, { $set: patch });
    if (gravacao.updated !== 1) return negar('Conflito ao concluir. Retome a mesma operação; nenhum novo orçamento será criado.');
    controle = patch.derivacao_orcamento;
    const depois = pagina(await api.OrcamentoCliente.filter(escopo, { limit: 1 }))[0];
    await auditar(base44, user, registro, 'Edição', `${body.acao === 'duplicar' ? 'Duplicação' : 'Desmembramento'} vinculado a ${destino.numero_orcamento}.`, depois);
    return confirmarFilho(depois, destino);
  };
  if (filho) {
    if (!mesma || !['criando', 'revisao'].includes(controle.fase)) return negar('Destino sem controle de criação verificável.');
    return finalizar(filho);
  }
  if (mesma && ['criando', 'revisao'].includes(controle.fase)) return negar('Criação com resultado incerto. Nenhum reenvio automático; concilie o destino antes de continuar.');
  if (mesma && controle.fase === 'preparando' && Date.parse(controle.iniciada_em) > Date.now() - 180000) return negar('Preparação em andamento. Aguarde três minutos para retomar uma execução interrompida antes da criação.');
  const anterior = controle;
  controle = { ...(mesma ? controle : {}), operacao_id: body.operacao_id, acao: body.acao, token: crypto.randomUUID(), usuario_id: user.id, versao_origem: mesma ? controle.versao_origem : body.versao, indices: preparo.indices, assinatura_origem: assinatura, fase: 'preparando', iniciada_em: new Date().toISOString() };
  const condicao = anterior ? { 'derivacao_orcamento.token': anterior.token, 'derivacao_orcamento.fase': anterior.fase } : { $or: [{ derivacao_orcamento: { $exists: false } }, { derivacao_orcamento: null }] };
  const reserva = await api.OrcamentoCliente.updateMany({ ...escopo, updated_date: registro.updated_date, ...condicao }, { $set: { derivacao_orcamento: controle } });
  if (reserva.updated !== 1) return negar('Outra operação assumiu o orçamento. Recarregue sem repetir a criação.');
  let postIniciado = false;
  try {
    await auditar(base44, user, registro, 'Edição', `Reserva de ${body.acao}; operação ${body.operacao_id}.`, { ...registro, derivacao_orcamento: controle });
    controle.numero_orcamento = controle.numero_orcamento || await reservarNumeroDocumento(base44, registro.group_id, registro.empresa_id, 'orcamento');
    const payload = { ...preparo.payload, numero_orcamento: controle.numero_orcamento, origem_derivacao: { orcamento_id: registro.id, operacao_id: body.operacao_id, acao: body.acao, confirmada: false, indices: preparo.indices } };
    controle.assinatura_destino = await hash(assinaturaOrigem(payload));
    const atual = pagina(await api.OrcamentoCliente.filter(escopo, { limit: 1 }))[0];
    if (!atual || await hash(assinaturaOrigem(atual)) !== assinatura) throw new Error('O orçamento mudou antes da criação.');
    controle.fase = 'criando';
    const inicio = await api.OrcamentoCliente.updateMany({ ...escopo, updated_date: atual.updated_date, 'derivacao_orcamento.token': controle.token, 'derivacao_orcamento.fase': 'preparando' }, { $set: { derivacao_orcamento: controle } });
    if (inicio.updated !== 1) throw new Error('Conflito antes da criação.');
    postIniciado = true;
    // Service role é necessário apenas para gravar o vínculo protegido, após autorização granular.
    const criado = await api.OrcamentoCliente.create(payload);
    return await finalizar(criado);
  } catch (e) {
    await api.OrcamentoCliente.updateMany({ ...escopo, 'derivacao_orcamento.token': controle.token, 'derivacao_orcamento.fase': { $in: ['preparando', 'criando'] } }, { $set: { derivacao_orcamento: { ...controle, fase: postIniciado ? 'revisao' : 'preparada' } } });
    return Response.json({ error: postIniciado ? 'Resultado de criação incerto. Reabra e retome a mesma ação para conciliar o orçamento, sem criar outro.' : e.message }, { status: 409 });
  }
}