import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { converterPedido } from './conversaoPedido.ts';
import { montarPedidoConversao } from './pedidoConversaoPayload.ts';
import { derivarOrcamento } from './derivacaoOrcamento.ts';
// Guardas existentes preservadas; as ações novas reutilizam o mesmo contexto e validação.
async function getUserAndPerfil(base44) {
  const user = await base44.auth.me().catch((e) => e.status === 401 ? null : Promise.reject(e));
  const perfil = user?.perfil_acesso_id ? await base44.asServiceRole.entities.PerfilAcesso.get(user.perfil_acesso_id).catch((e) => e.status === 404 ? null : Promise.reject(e)) : null;
  return { user, perfil };
}
function possuiContexto(user, groupId, empresaId) {
  if (user?.bloqueado) return false;
  if (user?.role === 'admin') return true;
  const empresa = (user?.empresas_vinculadas || []).some((v) => typeof v === 'string' ? v === empresaId : v?.empresa_id === empresaId && v.ativo !== false);
  const grupo = (user?.grupos_vinculados || []).some((v) => typeof v === 'string' ? v === groupId : v?.grupo_id === groupId && v.ativo !== false);
  return empresa || grupo;
}
function _normAct(a) { if (!a) return 'visualizar'; const s = String(a).toLowerCase(); const map = { ver:'visualizar',view:'visualizar',read:'visualizar',listar:'visualizar',status:'visualizar',delete:'excluir',remove:'excluir',destroy:'excluir',apagar:'excluir',cancel:'cancelar',cancelar:'cancelar',create:'criar',add:'criar',emitir:'criar',enviar:'criar',update:'editar',edit:'editar',carta:'editar',corrigir:'editar',approve:'aprovar',aprovar:'aprovar',export:'exportar',exportar:'exportar' }; return map[s]||s; }
function backendHasPermission(perfil,m,sec,act='visualizar',role=null){if(role==='admin')return true;const perms=perfil?.permissoes;if(!perms)return false;const desired=_normAct(act);const modNode=perms[m];if(!modNode)return false;if(!sec)return Object.values(modNode).some(n=>{if(Array.isArray(n))return n.includes(desired)||(desired==='visualizar'&&n.includes('ver'));if(n&&typeof n==='object')return Object.values(n).some(v=>Array.isArray(v)&&(v.includes(desired)||(desired==='visualizar'&&v.includes('ver'))));return false;});const path=Array.isArray(sec)?sec:String(sec).split('.').filter(Boolean);let cursor=modNode;for(let i=0;i<path.length;i++){if(cursor==null)return false;cursor=cursor[path[i]];}if(!cursor)return false;if(Array.isArray(cursor))return cursor.includes(desired)||(desired==='visualizar'&&cursor.includes('ver'));if(typeof cursor==='object'){const stack=[cursor];while(stack.length){const node=stack.pop();if(Array.isArray(node)){if(node.includes(desired)||(desired==='visualizar'&&node.includes('ver')))return true;}else if(node&&typeof node==='object')Object.values(node).forEach(v=>stack.push(v));}}return false;}
async function assertPermission(base44,{user,perfil},m,sec,act){const allowed=backendHasPermission(perfil,m,sec,act,user?.role||null);if(!allowed){try{await base44.asServiceRole.entities.AuditLog.create({usuario:user?.full_name||user?.email||'Usuário',usuario_id:user?.id,acao:'Bloqueio',modulo:m,entidade:Array.isArray(sec)?sec.join('.'):(sec||'-'),descricao:`Ação negada no backend: ${m}/${sec||'-'} → ${act}`,data_hora:new Date().toISOString()});}catch(auditErr){console.error('AuditLog falhou em assertPermission (onOrcamentoConfirmed):',auditErr);}return Response.json({error:'Forbidden'},{status:403});}return null;}
async function audit(base44,user,{acao='Ação',modulo='Sistema',entidade='-',registro_id=null,descricao='',dados_novos=null,empresa_id=null,empresa_nome=null,duracao_ms=null},meta=null){try{const pd=(dados_novos&&typeof dados_novos==='object')?{...dados_novos}:{};if(meta)pd._meta=meta;await base44.asServiceRole.entities.AuditLog.create({usuario:user?.full_name||user?.email||'Sistema',usuario_id:user?.id,acao,modulo,entidade,registro_id,descricao,empresa_id:empresa_id||null,empresa_nome:empresa_nome||null,duracao_ms:typeof duracao_ms==='number'?duracao_ms:null,dados_novos:Object.keys(pd).length?pd:null,data_hora:new Date().toISOString()});}catch(auditErr){console.error('AuditLog falhou em audit (onOrcamentoConfirmed):',auditErr);}}

const normalizar = (valor) => String(valor || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
const limparTexto = (valor) => String(valor || '').replace(/<[^>]*>/g, '').replace(/javascript\s*:/gi, '').trim();
const pagina = (resultado) => Array.isArray(resultado) ? resultado : resultado?.items || [];

function permiteCentral(ctx, acao) {
  if (ctx.user?.bloqueado) return false;
  if (ctx.user?.role === 'admin') return true;
  if (ctx.perfil?.ativo === false) return false;
  const permissoes = ctx.perfil?.permissoes || {};
  const modulo = Object.entries(permissoes).find(([chave]) => normalizar(chave) === 'comercial')?.[1];
  const secao = Object.entries(modulo || {}).find(([chave]) => ['pedido', 'pedidos'].includes(normalizar(chave)))?.[1];
  const aliases = { criar: ['criar', 'create', 'add', 'adicionar', 'novo', 'incluir'], visualizar: ['visualizar', 'ver', 'view', 'read', 'listar', 'consultar'], editar: ['editar', 'update', 'edit', 'corrigir', 'gerenciar', 'atualizar'], aprovar: ['aprovar', 'approve', 'validar'], desconto: ['desconto', 'aprovar_desconto'] };
  const contem = (no) => Array.isArray(no) ? no.some((valor) => (aliases[acao] || [acao]).includes(normalizar(valor))) : no && typeof no === 'object' && Object.values(no).some(contem);
  return Boolean(contem(secao));
}

async function auditarCentral(base44, user, registro, acao, descricao, depois = null) {
  await base44.asServiceRole.entities.AuditLog.create({
    usuario: user.full_name || user.email, usuario_id: user.id,
    acao, modulo: 'Comercial', tipo_auditoria: acao === 'Bloqueio' ? 'seguranca' : 'entidade',
    entidade: 'OrcamentoCliente', registro_id: registro.id,
    group_id: registro.group_id, empresa_id: registro.empresa_id,
    descricao, dados_anteriores: registro, dados_novos: depois,
    data_hora: new Date().toISOString(), sucesso: acao !== 'Bloqueio',
  });
}

// O mesmo endpoint existente recebe as ações da mesa; nunca confia em totais ou aprovação do navegador.
async function processarCentral(base44, ctx, body) {
  const { acao, orcamento_id, group_id, empresa_id, versao } = body;
  if (!['salvar', 'fechar', 'validar', 'converter', 'duplicar', 'desmembrar'].includes(acao)) return Response.json({ error: 'Ação comercial inválida.' }, { status: 400 });
  if (![orcamento_id, group_id, empresa_id, versao].every((valor) => typeof valor === 'string' && valor.trim())) {
    return Response.json({ error: 'Orçamento, grupo, empresa e versão são obrigatórios.' }, { status: 400 });
  }
  if (![orcamento_id, group_id, empresa_id].every((valor) => /^[a-f0-9]{24}$/i.test(valor))) {
    return Response.json({ error: 'Identificadores de orçamento, grupo ou empresa inválidos.' }, { status: 400 });
  }
  const derivacao = ['duplicar', 'desmembrar'].includes(acao);
  const permissao = derivacao || acao === 'converter' || body.preparar_pedido === true ? 'criar' : acao === 'fechar' ? 'aprovar' : acao === 'salvar' ? 'editar' : 'visualizar';
  if (!possuiContexto(ctx.user, group_id, empresa_id) || !permiteCentral(ctx, permissao)
    || (derivacao && !permiteCentral(ctx, 'visualizar')) || (acao === 'desmembrar' && !permiteCentral(ctx, 'editar'))) {
    await auditarCentral(base44, ctx.user, { id: orcamento_id, group_id, empresa_id }, 'Bloqueio', 'Tentativa comercial sem permissão ou vínculo com o contexto.');
    return Response.json({ error: 'Sem permissão ou vínculo com o grupo/empresa para esta ação comercial.' }, { status: 403 });
  }
  // Leituras e gravações operacionais mantêm o token do usuário e as regras de acesso existentes.
  const [orcamentos, empresas] = await Promise.all([
    base44.entities.OrcamentoCliente.filter({ id: orcamento_id, group_id, empresa_id }, { limit: 1 }),
    base44.entities.Empresa.filter({ id: empresa_id, group_id }, { limit: 1 }),
  ]);
  const registro = pagina(orcamentos)[0];
  if (!registro || !pagina(empresas).length) return Response.json({ error: 'Orçamento ou empresa não disponível neste grupo.' }, { status: 404 });
  if (ctx.user.role !== 'admin' && ctx.user.restricoes_adicionais?.pode_ver_apenas_proprios_registros && registro.vendedor_responsavel_id !== ctx.user.id && registro.created_by_id !== ctx.user.id) {
    await auditarCentral(base44, ctx.user, { id: orcamento_id, group_id, empresa_id }, 'Bloqueio', 'Orçamento atribuído a outro responsável.');
    return Response.json({ error: 'Orçamento atribuído a outro responsável.' }, { status: 403 });
  }
  const negar = async (error, status, checagens = []) => {
    await auditarCentral(base44, ctx.user, registro, 'Bloqueio', error);
    return Response.json({ error, checagens }, { status });
  };
  if (registro.origem_derivacao) {
    const origem = pagina(await base44.entities.OrcamentoCliente.filter({ id: registro.origem_derivacao.orcamento_id, group_id, empresa_id }, { limit: 1 }))[0];
    if (registro.origem_derivacao.confirmada !== true || !origem || (origem.derivacao_orcamento?.operacao_id === registro.origem_derivacao.operacao_id && origem.derivacao_orcamento.fase !== 'concluida')) return negar('A origem deste orçamento ainda está em conciliação. Conclua a operação na proposta de origem.', 409);
  }
  if (derivacao) return derivarOrcamento(base44, ctx, body, registro, auditarCentral);
  if (registro.derivacao_orcamento && registro.derivacao_orcamento.fase !== 'concluida') return negar('Retome a duplicação/desmembramento pendente antes de editar, fechar ou converter a proposta.', 409);
  if (acao === 'converter') return converterPedido(base44, ctx, body, registro, (entrada) => processarCentral(base44, ctx, entrada), auditarCentral);
  if (body.preparar_pedido === true && (acao !== 'validar' || registro.status !== 'Aprovado')) return negar('Aprove a proposta antes de preparar a conversão.', 409);
  if (body.preparar_pedido === true && registro.conversao_pedido) {
    const destino = registro.conversao_pedido.destino;
    try { return Response.json({ ok: true, orcamento: registro, pedido_base: montarPedidoConversao(registro, ctx.user, destino), destino }); }
    catch (e) { return negar(e.message, 422); }
  }
  if (registro.updated_date !== versao) return negar('O orçamento foi alterado. Recarregue e revise antes de continuar.', 409);
  if ((acao !== 'validar' && registro.status !== 'Pendente') || (acao === 'validar' && !['Pendente', 'Aprovado'].includes(registro.status))) {
    return negar('A situação atual do orçamento não permite esta ação.', 409);
  }
  const dados = {};
  if (acao !== 'validar') {
    for (const campo of ['data_validade', 'condicoes_pagamento', 'prazo_entrega']) {
      if (body.dados_orcamento?.[campo] !== undefined) {
        if (typeof body.dados_orcamento[campo] !== 'string') return negar('Validade, condição e prazo devem ser textos válidos.', 422);
        dados[campo] = limparTexto(body.dados_orcamento[campo]);
      }
    }
  }
  const proposta = { ...registro, ...dados };
  const origemItens = acao === 'validar' ? registro.itens : body.itens;
  if (!Array.isArray(origemItens) || origemItens.length > 300 || origemItens.some((item) => !item || typeof item !== 'object' || Array.isArray(item))) return negar('Informe até 300 itens válidos por orçamento.', 422);
  const itens = origemItens.map((item) => {
    const quantidade = Number(item.quantidade);
    const valorUnitario = Number(item.valor_unitario);
    const bruto = quantidade * valorUnitario;
    const desconto = Number(item.desconto_percentual ?? (bruto > 0 && item.valor_total != null ? (1 - Number(item.valor_total) / bruto) * 100 : 0));
    return {
      ...(item.produto_id ? { produto_id: String(item.produto_id) } : {}),
      descricao: limparTexto(item.descricao), unidade: limparTexto(item.unidade || 'UN'),
      tipo: ['revenda', 'fabricacao', 'servico'].includes(item.tipo) ? item.tipo : 'revenda',
      quantidade, valor_unitario: valorUnitario, desconto_percentual: Math.max(0, Math.min(100, desconto)),
      valor_total: Math.round(bruto * (1 - desconto / 100) * 100) / 100,
    };
  });
  if (itens.some((item, indice) => ![item.quantidade, item.valor_unitario, item.desconto_percentual, item.valor_total].every(Number.isFinite)
    || item.quantidade < 0 || item.valor_unitario < 0 || Number(origemItens[indice].desconto_percentual || 0) < 0
    || Number(origemItens[indice].desconto_percentual || 0) > 100 || item.valor_total < 0)) {
    return negar('Quantidades, preços e descontos devem ser válidos; desconto entre 0 e 100%.', 422);
  }
  if (acao === 'fechar' && !permiteCentral(ctx, 'editar')) {
    const assinatura = (lista) => JSON.stringify((lista || []).map((item) => {
      const brutoItem = Number(item.quantidade) * Number(item.valor_unitario);
      const percentual = Number(item.desconto_percentual ?? (brutoItem > 0 && item.valor_total != null ? (1 - Number(item.valor_total) / brutoItem) * 100 : 0));
      return [item.produto_id || '', limparTexto(item.descricao), Number(item.quantidade), limparTexto(item.unidade || 'UN'), Number(item.valor_unitario), Number(percentual.toFixed(6)), item.tipo || 'revenda'];
    }));
    const alterouCondicoes = Object.entries(dados).some(([campo, valor]) => valor !== limparTexto(registro[campo]));
    if (alterouCondicoes || assinatura(itens) !== assinatura(registro.itens)) return negar('Aprovar não permite editar a proposta. Solicite a um usuário com permissão de edição que salve os ajustes.', 403);
  }
  const bruto = itens.reduce((soma, item) => soma + item.quantidade * item.valor_unitario, 0);
  const total = Math.round(itens.reduce((soma, item) => soma + item.valor_total, 0) * 100) / 100;
  const desconto = bruto > 0 ? (bruto - total) / bruto * 100 : 0;
  if ((desconto > 15.001 || itens.some((item) => item.desconto_percentual > 15.001)) && !permiteCentral(ctx, 'desconto') && !permiteCentral(ctx, 'aprovar')) {
    return negar('Desconto acima de 15% exige permissão de aprovação de desconto.', 403);
  }
  const checagens = [];
  const adicionar = (chave, titulo, status, detalhe, acaoNecessaria = '') => checagens.push({ chave, titulo, status, detalhe, acao: acaoNecessaria });
  const ids = [...new Set(itens.map((item) => item.produto_id).filter(Boolean))];
  const hoje = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const filtroFinanceiro = { cliente_id: registro.cliente_id, group_id, empresa_id, status: { $in: ['Pendente', 'Atrasado', 'Parcial'] } };
  const [clientes, produtos, financeiro, financeiroVencido, solicitacoes] = await Promise.all([
    registro.cliente_id ? base44.entities.Cliente.filter({ id: registro.cliente_id, group_id }, { limit: 1 }) : Promise.resolve([]),
    ids.length ? base44.entities.Produto.filter({ id: { $in: ids }, group_id }, { limit: ids.length }) : Promise.resolve([]),
    registro.cliente_id ? base44.entities.ContaReceber.aggregate({ query: filtroFinanceiro, groupBy: 'status', sum: ['valor', 'valor_recebido'] }) : Promise.resolve({ rows: [] }),
    registro.cliente_id ? base44.entities.ContaReceber.aggregate({ query: { ...filtroFinanceiro, data_vencimento: { $lt: hoje } }, groupBy: 'status', sum: ['valor', 'valor_recebido'] }) : Promise.resolve({ rows: [] }),
    base44.entities.SolicitacaoAprovacao.filter({ entidade_alvo: 'OrcamentoCliente', entidade_alvo_id: registro.id, group_id, empresa_id }, { limit: 100 }),
  ]);
  const cliente = pagina(clientes)[0];
  const disponivelNaEmpresa = (cadastro) => cadastro && (!cadastro.empresa_id || cadastro.empresa_id === empresa_id || (cadastro.empresas_compartilhadas_ids || []).includes(empresa_id));
  const clienteValido = disponivelNaEmpresa(cliente) && !['Inativo', 'Bloqueado'].includes(cliente.status) && cliente.condicao_comercial?.situacao_credito !== 'Bloqueado';
  adicionar('cliente', 'Cliente ativo e habilitado', clienteValido ? 'ok' : 'erro', clienteValido ? registro.cliente_nome : 'Cliente ausente, inativo, com crédito bloqueado ou não compartilhado com a empresa.', clienteValido ? '' : 'Regularizar o cadastro do cliente.');

  // 1-4. Documento e cadastro obrigatório (validação real de dígitos, não apenas presença)
  const documento = String(cliente?.cnpj || cliente?.cpf || '').replace(/\D/g, '');
  const validoCnpj = (d) => {
    if (d.length !== 14 || /^(\d)\1+$/.test(d)) return false;
    const calc = (base) => { const pesos = base.length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]; const soma = base.split('').reduce((s, n, i) => s + Number(n) * pesos[i], 0); const resto = soma % 11; return resto < 2 ? 0 : 11 - resto; };
    return calc(d.slice(0, 12)) === Number(d[12]) && calc(d.slice(0, 13)) === Number(d[13]);
  };
  const validoCpf = (d) => {
    if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false;
    const calc = (base) => { const soma = base.split('').reduce((s, n, i) => s + Number(n) * (base.length + 1 - i), 0); const resto = (soma * 10) % 11; return resto === 10 ? 0 : resto; };
    return calc(d.slice(0, 9)) === Number(d[9]) && calc(d.slice(0, 10)) === Number(d[10]);
  };
  const documentoOk = documento.length === 14 ? validoCnpj(documento) : documento.length === 11 ? validoCpf(documento) : false;
  adicionar('documento', 'CNPJ/CPF válido', documentoOk ? 'ok' : 'erro',
    documentoOk ? documento.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4') : 'Documento ausente ou inválido no cadastro do cliente.',
    documentoOk ? '' : 'Corrigir o cadastro em Cadastros Gerais.');

  const endereco = cliente?.endereco_principal || {};
  const enderecoOk = Boolean(endereco.logradouro && endereco.cidade && endereco.estado && (endereco.cep || endereco.numero));
  adicionar('endereco', 'Endereço de faturamento/entrega', enderecoOk ? 'ok' : 'erro',
    enderecoOk ? `${endereco.logradouro}, ${endereco.numero || 's/n'} — ${endereco.cidade}/${endereco.estado}` : 'Endereço incompleto no cadastro do cliente.',
    enderecoOk ? '' : 'Completar o endereço em Cadastros Gerais.');

  adicionar('itens', 'Produtos e quantidades', itens.length && itens.every((item) => item.descricao && item.quantidade > 0 && item.valor_unitario > 0) ? 'ok' : 'erro', 'O fechamento exige descrição, quantidade e preço positivos em todos os itens.', 'Revisar os itens da negociação.');
  const pagamento = limparTexto(proposta.condicoes_pagamento);
  adicionar('pagamento', 'Condição de pagamento', pagamento && pagamento !== '—' ? 'ok' : 'erro', pagamento || 'Informe a condição de pagamento.', 'Definir a condição de pagamento.');
  const validade = String(proposta.data_validade || '').slice(0, 10);
  adicionar('validade', 'Validade da proposta', /^\d{4}-\d{2}-\d{2}$/.test(validade) && validade >= hoje ? 'ok' : 'erro', validade ? `Validade: ${validade}.` : 'Informe uma validade para a proposta.', 'Revalidar a proposta.');

  // 6-13. Produtos oficiais: situação, estoque, produção, tabela, preço e margem
  const produtosPorId = new Map(pagina(produtos).map((produto) => [produto.id, produto]));
  const quantidades = new Map();
  itens.forEach((item) => { if (item.produto_id) quantidades.set(item.produto_id, (quantidades.get(item.produto_id) || 0) + item.quantidade); });
  let requerProducao = 0;
  for (const [id, quantidade] of quantidades) {
    const produto = produtosPorId.get(id);
    if (!disponivelNaEmpresa(produto) || produto.status === 'Inativo') {
      adicionar(`produto-${id}`, 'Produto habilitado', 'erro', 'Produto indisponível no contexto da empresa.', 'Selecionar produto válido.');
      continue;
    }
    const saldo = Number(produto.estoque_disponivel ?? (Number(produto.estoque_atual || 0) - Number(produto.estoque_reservado || 0)));
    if (saldo < quantidade) {
      requerProducao += 1;
      adicionar(`estoque-${id}`, 'Disponibilidade em estoque', 'atencao', `${produto.descricao}: disponível ${saldo}, solicitado ${quantidade}. Cobertura por produção ou compra.`, 'Programar produção/compra — não reserva saldo fictício.');
    }
  }
  const fabricados = itens.filter((item) => item.tipo === 'fabricacao');
  adicionar('producao', 'Necessidade de produção', fabricados.length || requerProducao ? 'atencao' : 'ok',
    fabricados.length || requerProducao
      ? `${fabricados.length} item(ns) de fabricação e ${requerProducao} item(ns) sem saldo seguem para Produção.`
      : 'Todos os itens são de revenda com saldo disponível.', fabricados.length || requerProducao ? 'Direcionar o pedido para Produção.' : '');

  const condicao = cliente?.condicao_comercial || {};
  const semTabela = !condicao.tabela_preco_id && !condicao.tabela_preco_nome;
  adicionar('tabela_preco', 'Tabela de preço do cliente', semTabela ? 'atencao' : 'ok',
    semTabela ? 'Cliente sem tabela de preço vinculada na condição comercial.' : `Tabela: ${condicao.tabela_preco_nome || condicao.tabela_preco_id}.`,
    semTabela ? 'Vincular a tabela em Cadastros Gerais.' : '');

  const abaixoDoCusto = itens.filter((item) => {
    const produto = produtosPorId.get(item.produto_id);
    const custo = Number(produto?.custo_medio ?? produto?.custo_aquisicao ?? 0);
    return custo > 0 && item.valor_unitario < custo;
  });
  const precoOficialDivergente = itens.filter((item) => {
    const produto = produtosPorId.get(item.produto_id);
    const preco = Number(produto?.preco_venda || 0);
    return preco > 0 && item.valor_unitario !== preco;
  });
  adicionar('preco', 'Preço e margem', abaixoDoCusto.length ? 'erro' : precoOficialDivergente.length ? 'atencao' : 'ok',
    abaixoDoCusto.length
      ? `${abaixoDoCusto.length} item(ns) com preço abaixo do custo oficial.`
      : precoOficialDivergente.length ? `${precoOficialDivergente.length} item(ns) fora do preço de venda do cadastro.` : 'Preços alinhados ao cadastro oficial de Produto.',
    abaixoDoCusto.length ? 'Aprovação de preço excedido.' : precoOficialDivergente.length ? 'Confirmar tabela/negociação.' : '');

  // 14-18. Crédito, títulos vencidos, aprovações e fiscal
  const somarSaldo = (resultado) => (resultado.rows || []).reduce((soma, linha) => soma + Math.max(Number(linha.sum_valor || 0) - Number(linha.sum_valor_recebido || 0), 0), 0);
  const quantidadeVencida = (financeiroVencido.rows || []).reduce((soma, linha) => soma + Number(linha.count || 0), 0);
  const valorVencido = somarSaldo(financeiroVencido);
  const limite = Number(condicao.limite_credito || 0);
  const utilizado = somarSaldo(financeiro);
  const aprovacoes = pagina(solicitacoes);
  // Uma liberação não se transfere a outro cliente, valor ou contexto. Dívida nova exige reanálise.
  const aprovacaoValida = (s) => s.status === 'aprovado' && Boolean(s.aprovador_id) && s.solicitante_id !== s.aprovador_id
    && s.dados_propostos?.cliente_id === registro.cliente_id
    && Number(s.dados_propostos?.valor_orcamento) === total
    && (!s.data_expiracao_concessao || Date.parse(s.data_expiracao_concessao) > Date.now());
  const liberaCredito = aprovacoes.some((s) => aprovacaoValida(s) && s.tipo_solicitacao === 'liberar_credito');
  const liberaVencido = aprovacoes.some((s) => aprovacaoValida(s) && s.tipo_solicitacao === 'liberacao_vencido' && Number(s.dados_propostos?.valor_vencido || 0) >= valorVencido);
  const pendentes = aprovacoes.filter((s) => s.status === 'pendente');
  const disponivelCredito = limite > 0 ? limite - utilizado : 0;
  const creditoInsuficiente = limite > 0 && (disponivelCredito < total || condicao.situacao_credito === 'Alerta');
  adicionar('credito', 'Limite de crédito', liberaCredito ? 'ok' : limite === 0 ? 'atencao' : creditoInsuficiente ? 'erro' : 'ok',
    limite === 0
      ? 'Cliente sem limite de crédito cadastrado.'
      : `Limite ${limite.toFixed(2)} · utilizado ${utilizado.toFixed(2)} · disponível ${disponivelCredito.toFixed(2)} · pedido ${total.toFixed(2)}.`,
    liberaCredito ? 'Liberação financeira aprovada para esta proposta.' : limite === 0 ? 'Cadastrar limite em Cadastros Gerais.' : creditoInsuficiente ? 'Aprovação financeira de limite.' : '');
  adicionar('vencidos', 'Títulos vencidos', quantidadeVencida && !liberaVencido ? 'erro' : 'ok',
    quantidadeVencida ? `${quantidadeVencida} título(s) vencido(s), total ${valorVencido.toFixed(2)}.${liberaVencido ? ' Liberação financeira aprovada para esta proposta.' : ''}` : 'Nenhum título vencido do cliente.',
    quantidadeVencida && !liberaVencido ? 'Liberação do Financeiro.' : '');

  adicionar('aprovacoes', 'Aprovações pendentes', pendentes.length ? 'erro' : 'ok',
    pendentes.length ? `${pendentes.length} solicitação(ões) aguardando decisão.` : 'Nenhuma aprovação pendente para esta proposta.',
    pendentes.length ? 'Aguardar a fila de aprovações.' : '');

  const fiscal = cliente?.configuracao_fiscal || {};
  const fiscalOk = Boolean(fiscal.tipo_contribuinte) && (fiscal.contribuinte_icms === false || Boolean(cliente?.inscricao_estadual));
  adicionar('fiscal', 'Dados fiscais', fiscalOk ? 'ok' : 'atencao',
    fiscalOk ? `Contribuinte: ${fiscal.tipo_contribuinte}.` : 'Configuração fiscal ou inscrição estadual incompleta para emissão.',
    fiscalOk ? '' : 'Completar dados fiscais em Cadastros Gerais.');

  const bloqueadoPorCredito = (creditoInsuficiente && !liberaCredito) || (quantidadeVencida > 0 && !liberaVencido);

  // §18: fechar bloqueado por crédito/título abre solicitação real na fila já existente, sem duplicá-la.
  if (acao === 'fechar' && bloqueadoPorCredito && !pendentes.length) {
    const tipo = quantidadeVencida > 0 && !liberaVencido ? 'liberacao_vencido' : 'liberar_credito';
    try {
      await base44.entities.SolicitacaoAprovacao.create({
        group_id, empresa_id, entidade_alvo: 'OrcamentoCliente', entidade_alvo_id: registro.id,
        tipo_solicitacao: tipo, categoria_alcada: 'Financeiro',
        solicitante_id: ctx.user.id, solicitante_nome: ctx.user.full_name || ctx.user.email,
        valor_solicitado: tipo === 'liberar_credito' ? total : valorVencido,
        justificativa: tipo === 'liberar_credito'
          ? `Fechamento do orçamento ${registro.numero_orcamento} excede o limite disponível.`
          : `Fechamento do orçamento ${registro.numero_orcamento} com títulos vencidos.`,
        dados_propostos: { orcamento_id: registro.id, cliente_id: registro.cliente_id, numero_orcamento: registro.numero_orcamento, cliente_nome: registro.cliente_nome, valor_orcamento: total, valor_vencido: valorVencido, limite, utilizado },
        status: 'pendente', data_solicitacao: new Date().toISOString(),
      });
      await auditarCentral(base44, ctx.user, registro, 'Edição', `Solicitação de ${tipo === 'liberar_credito' ? 'liberação de limite' : 'liberação de título vencido'} aberta para ${registro.numero_orcamento}.`);
    } catch (erro) {
      console.error('[onOrcamentoConfirmed] Falha ao abrir solicitação de aprovação:', erro);
    }
  }
  if (acao !== 'salvar' && checagens.some((checagem) => checagem.status === 'erro')) {
    return negar(
      bloqueadoPorCredito ? 'Aprovação financeira necessária: limite ou título vencido.' : 'Resolva os bloqueios do fechamento.',
      422, checagens
    );
  }
  if (acao === 'validar') {
    let pedidoBase;
    if (body.preparar_pedido === true) {
      try { pedidoBase = montarPedidoConversao(registro, ctx.user, body.destino); }
      catch (e) { return negar(e.message, 422); }
    }
    return Response.json({ ok: true, orcamento: registro, checagens, ...(pedidoBase ? { pedido_base: pedidoBase, destino: body.destino } : {}) });
  }
  const patch = {
    ...dados, itens, valor_total: total,
    ...(acao === 'fechar' ? { status: 'Aprovado', aprovado_por: ctx.user.full_name || ctx.user.email, data_aprovacao: new Date().toISOString() } : {}),
  };
  // Atualização condicional atômica: a versão verificada faz parte do filtro da própria gravação.
  const resultado = await base44.entities.OrcamentoCliente.updateMany({ id: registro.id, group_id, empresa_id, status: 'Pendente', updated_date: versao }, { $set: patch });
  if (resultado.updated !== 1) return negar('Conflito de edição: nenhuma alteração foi sobrescrita. Recarregue o orçamento.', 409);
  const atualizado = await base44.entities.OrcamentoCliente.get(registro.id);
  // updateMany não dispara automações por registro: sanitização, validação e auditoria são explícitas aqui.
  await auditarCentral(base44, ctx.user, registro, acao === 'fechar' ? 'Aprovação' : 'Edição', `Orçamento ${registro.numero_orcamento} ${acao === 'fechar' ? 'fechado' : 'salvo'} na Central 360.`, atualizado);
  return Response.json({ ok: true, orcamento: atualizado, checagens });
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const ctx = await getUserAndPerfil(base44);
    const user = ctx.user;
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    if (body?.acao) return await processarCentral(base44, ctx, body);
    // Payload from entity automation
    const { event, data: payload } = body || {};
    if (!event?.type || !payload) return Response.json({ error: 'Invalid payload' }, { status: 400 });
    if (![payload.id, payload.group_id, payload.empresa_id].every((id) => typeof id === 'string' && /^[a-f\d]{24}$/i.test(id))) return Response.json({ error: 'Orçamento, grupo e empresa válidos são obrigatórios.' }, { status: 400 });
    if (user.role !== 'admin' || !possuiContexto(user, payload.group_id, payload.empresa_id)) return Response.json({ error: 'Eventos automáticos exigem administrador e contexto autorizado.' }, { status: 403 });
    // Preserva o contrato legado dos dois workflows: evento identifica, mas não fornece a verdade do registro.
    const filtroOrigem = { id: payload.id, group_id: payload.group_id, empresa_id: payload.empresa_id };
    const [origens, origensSite, empresas] = await Promise.all([
      base44.entities.OrcamentoCliente.filter(filtroOrigem, { limit: 1 }),
      base44.entities.OrcamentoSite.filter(filtroOrigem, { limit: 1 }),
      base44.entities.Empresa.filter({ id: payload.empresa_id, group_id: payload.group_id }, { limit: 1 }),
    ]);
    const fonte = pagina(origens).length ? 'OrcamentoCliente' : 'OrcamentoSite';
    const data = pagina(origens)[0] || pagina(origensSite)[0];
    if (!data || !pagina(empresas).length) return Response.json({ error: 'Orçamento não encontrado neste contexto.' }, { status: 404 });
    const pedidoExistente = data.pedido_gerado_id || data.pedido_erp_id;
    if (pedidoExistente) return Response.json({ ok: true, pedido_id: pedidoExistente, repetida: true });
    const confirmado = data.status === 'Confirmado' || data.aprovado === true || data.confirmado === true;
    // Fechar na mesa não dispara uma segunda conversão automática; o direcionamento continua explícito.
    if (!confirmado) return Response.json({ ok: true, skipped: true });

    // Permissão para criar Pedido no módulo Comercial
    const perm = await assertPermission(base44, ctx, 'Comercial', 'Pedido', 'criar');
    if (perm) return perm;

    // Monta pedido básico a partir do orçamento
    const pedidoPayload = {
      tipo: 'Pedido',
      origem_pedido: data?.origem || 'Manual',
      cliente_id: data?.cliente_id || data?.cliente_erp_id || null,
      cliente_nome: data?.cliente_nome || data?.cliente || null,
      valor_total: data?.valor_total || 0,
      data_pedido: new Date().toISOString().slice(0,10),
      status: 'Aguardando Aprovação',
      orcamento_id: data?.id,
      group_id: data?.group_id || null,
      empresa_id: data?.empresa_id || null,
      vendedor: user?.full_name || user?.email || 'Usuário',
      vendedor_id: user?.id,
    };

    // Copia itens quando existir
    ['itens','itens_revenda','itens_armado_padrao','itens_corte_dobra'].forEach(k => {
      if (Array.isArray(data?.[k]) && (data?.[k].length > 0)) {
        pedidoPayload[k] = data[k];
      }
    });

    const created = await base44.entities.Pedido.create(pedidoPayload);
    await base44.entities[fonte].update(data.id, fonte === 'OrcamentoCliente' ? { status: 'Convertido', pedido_gerado_id: created.id } : { status: 'Convertido em Pedido', pedido_erp_id: created.id });

    await audit(base44, user, {
      acao: 'Criação',
      modulo: 'Comercial',
      entidade: 'Pedido',
      registro_id: created?.id,
      descricao: 'Pedido gerado automaticamente a partir do Orçamento confirmado',
      dados_novos: pedidoPayload,
      empresa_id: data.empresa_id
    }, { group_id: data.group_id, orcamento_id: data.id });

    return Response.json({ ok: true, pedido_id: created?.id });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}