import { calcularSaldosPedido, selecionarItensEntrega } from './saldosCalculo.ts';
import { lerVinculados } from './saldos.ts';
import { temPermissaoAcao, temPermissaoLeitura, usuarioVinculado } from './permissoes.ts';

// §23 — itens efetivamente entregues: único caminho de gravação de EntregaItens por item.
const pagina = (v) => Array.isArray(v) ? v : v?.items || [];
const idValido = (v) => typeof v === 'string' && /^[a-f\d]{24}$/i.test(v);
const SECOES = ['Entrega', 'Entregas'];

async function auditar(base44, user, registro, acao, descricao, depois = null) {
  await base44.asServiceRole.entities.AuditLog.create({
    usuario: user.full_name || user.email, usuario_id: user.id, acao, modulo: 'Expedição',
    entidade: 'EntregaItens', registro_id: registro.id, group_id: registro.group_id, empresa_id: registro.empresa_id,
    tipo_auditoria: 'entidade', descricao, dados_novos: depois, data_hora: new Date().toISOString(), sucesso: true,
  });
}

async function carregar(base44, ctx, body, acao) {
  const { entrega_id, group_id, empresa_id } = body || {};
  const negar = (error, status) => ({ erro: Response.json({ error }, { status }) });
  if (![entrega_id, group_id, empresa_id].every(idValido)) return negar('Entrega, grupo e empresa válidos são obrigatórios.', 400);
  const permitidoAgora = acao === 'ver' ? temPermissaoLeitura(ctx, 'Expedição', SECOES) : temPermissaoAcao(ctx, 'Expedição', SECOES, 'editar');
  if (!permitidoAgora) return negar('Sem permissão em Expedição / Entrega para esta ação.', 403);
  if (!usuarioVinculado(ctx, group_id, empresa_id)) return negar('Usuário sem vínculo ativo com a empresa ou grupo.', 403);
  const base = { group_id, empresa_id };
  const [entregas, empresas] = await Promise.all([
    base44.asServiceRole.entities.Entrega.filter({ id: entrega_id, ...base }, { limit: 1 }),
    base44.asServiceRole.entities.Empresa.filter({ id: empresa_id, group_id }, { limit: 1 }),
  ]);
  const entrega = pagina(entregas)[0];
  if (!pagina(empresas).length || !entrega) return negar('Entrega não encontrada neste contexto.', 404);
  if (!idValido(entrega.pedido_id)) return negar('Entrega sem vínculo de pedido verificável.', 422);
  const pedido = pagina(await base44.asServiceRole.entities.Pedido.filter({ id: entrega.pedido_id, ...base }, { limit: 1 }))[0];
  if (!pedido) return negar('Pedido da entrega indisponível neste contexto.', 422);
  // A própria entrega é excluída: ela não pode contar como atendida antes de registrar o que levou.
  const entregasPedido = (await lerVinculados(base44.asServiceRole.entities.Entrega, { ...base, pedido_id: pedido.id }))
    .filter((e) => e.id !== entrega.id);
  const itensEntrega = await lerVinculados(base44.asServiceRole.entities.EntregaItens, { ...base, pedido_id: pedido.id });
  const saldos = calcularSaldosPedido(pedido, { entregas: entregasPedido, itensEntrega }, { entregas: true });
  return { entrega, pedido, base, saldos, destaEntrega: itensEntrega.filter((i) => i.entrega_id === entrega.id) };
}

export async function consultarItensEntrega(base44, ctx, body) {
  const carregado = await carregar(base44, ctx, body, 'ver');
  if (carregado.erro) return carregado.erro;
  const registrados = new Map(carregado.destaEntrega.filter((i) => i.pedido_item_id).map((i) => [i.pedido_item_id, i.quantidade]));
  return Response.json({
    ok: true, entrega_id: carregado.entrega.id, status: carregado.entrega.status,
    itens: carregado.saldos.map((i) => ({ ...i, ja_registrado: registrados.get(i.chave) ?? null })),
  }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function registrarItensEntrega(base44, ctx, body) {
  const carregado = await carregar(base44, ctx, body, 'editar');
  if (carregado.erro) return carregado.erro;
  const { entrega, pedido, base, saldos, destaEntrega } = carregado;
  const selecao = Array.isArray(body?.itens) ? body.itens : [];
  const validacao = selecionarItensEntrega(pedido, saldos, selecao);
  if (!validacao.ok) {
    await auditar(base44, ctx.user, entrega, 'Bloqueio', `Itens entregues recusados: ${validacao.erro}`);
    return Response.json({ error: validacao.erro }, { status: 422 });
  }
  const jaRegistrados = new Set(destaEntrega.map((i) => i.pedido_item_id));
  const novas = validacao.linhas
    .filter((linha) => !jaRegistrados.has(linha.pedido_item_id))
    .map((linha) => ({
      ...base, entrega_id: entrega.id, pedido_id: pedido.id, pedido_item_id: linha.pedido_item_id,
      produto_id: linha.produto_id || null, tipo_item: linha.tipo_item, descricao_produto: linha.descricao_produto,
      quantidade: linha.quantidade, quantidade_pedida_original: linha.quantidade_pedida_original, unidade: linha.unidade,
    }));
  if (!novas.length) return Response.json({ ok: true, criados: 0, repetido: true });
  await base44.asServiceRole.entities.EntregaItens.bulkCreate(novas);
  await auditar(base44, ctx.user, entrega, 'Criação', `${novas.length} item(ns) entregues registrados no pedido ${pedido.numero_pedido || pedido.id}`, novas);
  return Response.json({ ok: true, criados: novas.length, itens: novas });
}