import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
// Inlined guard helpers (relative imports break in Deno deploy)
async function getUserAndPerfil(base44) { const user = await base44.auth.me().catch(() => null); let perfil = null; try { if (user?.perfil_acesso_id) perfil = await base44.asServiceRole.entities.PerfilAcesso.get(user.perfil_acesso_id); } catch (permErr) { console.error('PerfilAcesso fetch falhou (onOrcamentoConfirmed):', permErr); } return { user, perfil }; }
function _normAct(a) { if (!a) return 'visualizar'; const s = String(a).toLowerCase(); const map = { ver:'visualizar',view:'visualizar',read:'visualizar',listar:'visualizar',status:'visualizar',delete:'excluir',remove:'excluir',destroy:'excluir',apagar:'excluir',cancel:'cancelar',cancelar:'cancelar',create:'criar',add:'criar',emitir:'criar',enviar:'criar',update:'editar',edit:'editar',carta:'editar',corrigir:'editar',approve:'aprovar',aprovar:'aprovar',export:'exportar',exportar:'exportar' }; return map[s]||s; }
function backendHasPermission(perfil,m,sec,act='visualizar',role=null){if(role==='admin')return true;const perms=perfil?.permissoes;if(!perms)return false;const desired=_normAct(act);const modNode=perms[m];if(!modNode)return false;if(!sec)return Object.values(modNode).some(n=>{if(Array.isArray(n))return n.includes(desired)||(desired==='visualizar'&&n.includes('ver'));if(n&&typeof n==='object')return Object.values(n).some(v=>Array.isArray(v)&&(v.includes(desired)||(desired==='visualizar'&&v.includes('ver'))));return false;});const path=Array.isArray(sec)?sec:String(sec).split('.').filter(Boolean);let cursor=modNode;for(let i=0;i<path.length;i++){if(cursor==null)return false;cursor=cursor[path[i]];}if(!cursor)return false;if(Array.isArray(cursor))return cursor.includes(desired)||(desired==='visualizar'&&cursor.includes('ver'));if(typeof cursor==='object'){const stack=[cursor];while(stack.length){const node=stack.pop();if(Array.isArray(node)){if(node.includes(desired)||(desired==='visualizar'&&node.includes('ver')))return true;}else if(node&&typeof node==='object')Object.values(node).forEach(v=>stack.push(v));}}return false;}
async function assertPermission(base44,{user,perfil},m,sec,act){const allowed=backendHasPermission(perfil,m,sec,act,user?.role||null);if(!allowed){try{await base44.asServiceRole.entities.AuditLog.create({usuario:user?.full_name||user?.email||'Usuário',usuario_id:user?.id,acao:'Bloqueio',modulo:m,entidade:Array.isArray(sec)?sec.join('.'):(sec||'-'),descricao:`Ação negada no backend: ${m}/${sec||'-'} → ${act}`,data_hora:new Date().toISOString()});}catch(auditErr){console.error('AuditLog falhou em assertPermission (onOrcamentoConfirmed):',auditErr);}return Response.json({error:'Forbidden'},{status:403});}return null;}
async function audit(base44,user,{acao='Ação',modulo='Sistema',entidade='-',registro_id=null,descricao='',dados_novos=null,empresa_id=null,empresa_nome=null,duracao_ms=null},meta=null){try{const pd=(dados_novos&&typeof dados_novos==='object')?{...dados_novos}:{};if(meta)pd._meta=meta;await base44.asServiceRole.entities.AuditLog.create({usuario:user?.full_name||user?.email||'Sistema',usuario_id:user?.id,acao,modulo,entidade,registro_id,descricao,empresa_id:empresa_id||null,empresa_nome:empresa_nome||null,duracao_ms:typeof duracao_ms==='number'?duracao_ms:null,dados_novos:Object.keys(pd).length?pd:null,data_hora:new Date().toISOString()});}catch(auditErr){console.error('AuditLog falhou em audit (onOrcamentoConfirmed):',auditErr);}}

const normalizar = (valor) => String(valor || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
const limparTexto = (valor) => String(valor || '').replace(/<[^>]*>/g, '').replace(/javascript\s*:/gi, '').trim();
const pagina = (resultado) => Array.isArray(resultado) ? resultado : resultado?.items || [];

function permiteCentral(ctx, acao) {
  if (ctx.user?.role === 'admin') return true;
  if (ctx.perfil?.ativo === false) return false;
  const permissoes = ctx.perfil?.permissoes || {};
  const modulo = Object.entries(permissoes).find(([chave]) => normalizar(chave) === 'comercial')?.[1];
  const secao = Object.entries(modulo || {}).find(([chave]) => ['pedido', 'pedidos'].includes(normalizar(chave)))?.[1];
  const aliases = { visualizar: ['visualizar', 'ver', 'view', 'read', 'listar', 'consultar'], editar: ['editar', 'update', 'edit', 'corrigir', 'gerenciar', 'atualizar'], aprovar: ['aprovar', 'approve', 'validar'], desconto: ['desconto', 'aprovar_desconto'] };
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
  if (!['salvar', 'fechar', 'validar'].includes(acao)) return Response.json({ error: 'Ação comercial inválida.' }, { status: 400 });
  if (![orcamento_id, group_id, empresa_id, versao].every((valor) => typeof valor === 'string' && valor.trim())) {
    return Response.json({ error: 'Orçamento, grupo, empresa e versão são obrigatórios.' }, { status: 400 });
  }
  if (![orcamento_id, group_id, empresa_id].every((valor) => /^[a-f0-9]{24}$/i.test(valor))) {
    return Response.json({ error: 'Identificadores de orçamento, grupo ou empresa inválidos.' }, { status: 400 });
  }
  const permissao = acao === 'fechar' ? 'aprovar' : acao === 'salvar' ? 'editar' : 'visualizar';
  if (ctx.user.bloqueado || !permiteCentral(ctx, permissao)) return Response.json({ error: 'Sem permissão para esta ação comercial.' }, { status: 403 });
  // Leituras e gravações operacionais mantêm o token do usuário e as regras de acesso existentes.
  const [orcamentos, empresas] = await Promise.all([
    base44.entities.OrcamentoCliente.filter({ id: orcamento_id, group_id, empresa_id }, { limit: 1 }),
    base44.entities.Empresa.filter({ id: empresa_id, group_id }, { limit: 1 }),
  ]);
  const registro = pagina(orcamentos)[0];
  if (!registro || !pagina(empresas).length) return Response.json({ error: 'Orçamento ou empresa não disponível neste grupo.' }, { status: 404 });
  const negar = async (error, status, checagens = []) => {
    await auditarCentral(base44, ctx.user, registro, 'Bloqueio', error);
    return Response.json({ error, checagens }, { status });
  };
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
  const adicionar = (chave, titulo, status, detalhe) => checagens.push({ chave, titulo, status, detalhe });
  const ids = [...new Set(itens.map((item) => item.produto_id).filter(Boolean))];
  const [clientes, produtos] = await Promise.all([
    registro.cliente_id ? base44.entities.Cliente.filter({ id: registro.cliente_id, group_id }, { limit: 1 }) : Promise.resolve([]),
    ids.length ? base44.entities.Produto.filter({ id: { $in: ids }, group_id }, { limit: ids.length }) : Promise.resolve([]),
  ]);
  const cliente = pagina(clientes)[0];
  const disponivelNaEmpresa = (cadastro) => cadastro && (!cadastro.empresa_id || cadastro.empresa_id === empresa_id || (cadastro.empresas_compartilhadas_ids || []).includes(empresa_id));
  const clienteValido = disponivelNaEmpresa(cliente) && !['Inativo', 'Bloqueado'].includes(cliente.status);
  adicionar('cliente', 'Cliente habilitado', clienteValido ? 'ok' : 'erro', clienteValido ? registro.cliente_nome : 'Cliente ausente, bloqueado ou não compartilhado com a empresa.');
  adicionar('itens', 'Itens e preços', itens.length && itens.every((item) => item.descricao && item.quantidade > 0 && item.valor_unitario > 0) ? 'ok' : 'erro', 'O fechamento exige descrição, quantidade e preço positivos em todos os itens.');
  const pagamento = limparTexto(proposta.condicoes_pagamento);
  adicionar('pagamento', 'Condição de pagamento', pagamento && pagamento !== '—' ? 'ok' : 'erro', pagamento || 'Informe a condição de pagamento.');
  const hoje = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const validade = String(proposta.data_validade || '').slice(0, 10);
  adicionar('validade', 'Validade da proposta', /^\d{4}-\d{2}-\d{2}$/.test(validade) && validade >= hoje ? 'ok' : 'erro', validade ? `Validade: ${validade}.` : 'Informe uma validade para a proposta.');
  const produtosPorId = new Map(pagina(produtos).map((produto) => [produto.id, produto]));
  const quantidades = new Map();
  itens.forEach((item) => { if (item.produto_id) quantidades.set(item.produto_id, (quantidades.get(item.produto_id) || 0) + item.quantidade); });
  for (const [id, quantidade] of quantidades) {
    const produto = produtosPorId.get(id);
    if (!disponivelNaEmpresa(produto) || produto.status === 'Inativo') adicionar(`produto-${id}`, 'Produto habilitado', 'erro', 'Produto indisponível no contexto da empresa.');
    else {
      const saldo = Number(produto.estoque_disponivel ?? (Number(produto.estoque_atual || 0) - Number(produto.estoque_reservado || 0)));
      if (saldo < quantidade) adicionar(`estoque-${id}`, 'Disponibilidade em estoque', 'atencao', `${produto.descricao}: disponível ${saldo}, solicitado ${quantidade}. Produção ou compra deverá cobrir o saldo.`);
    }
  }
  if (acao !== 'salvar' && checagens.some((checagem) => checagem.status === 'erro')) return negar('Resolva os bloqueios do fechamento.', 422, checagens);
  if (acao === 'validar') return Response.json({ ok: true, orcamento: registro, checagens });
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
    const { event, data } = body || {};
    if (!event?.type || !data) return Response.json({ error: 'Invalid payload' }, { status: 400 });

    // Somente quando orçamento for confirmado
    const confirmado = data?.status === 'Confirmado' || data?.aprovado === true || data?.confirmado === true;
    if (!confirmado) return Response.json({ ok: true, skipped: true });

    // Permissão para criar Pedido no módulo Comercial
    const perm = await assertPermission(base44, ctx, 'Comercial', 'Pedido', 'criar');
    if (perm) return perm;

    // Monta pedido básico a partir do orçamento
    const pedidoPayload = {
      tipo: 'Pedido',
      origem_pedido: data?.origem || 'Manual',
      cliente_id: data?.cliente_id || null,
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

    const created = await base44.asServiceRole.entities.Pedido.create(pedidoPayload);

    await audit(base44, user, {
      acao: 'Criação',
      modulo: 'Comercial',
      entidade: 'Pedido',
      registro_id: created?.id,
      descricao: 'Pedido gerado automaticamente a partir do Orçamento confirmado',
      dados_novos: pedidoPayload
    });

    return Response.json({ ok: true, pedido_id: created?.id });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}