import { calcularSaldosPedido } from './saldosCalculo.ts';
import { temPermissaoLeitura, usuarioVinculado } from './comprovante.ts';

const itens = (pagina) => Array.isArray(pagina) ? pagina : pagina?.items || [];
// Só os registros deste pedido, em páginas; nunca consulta o banco inteiro nem trunca silenciosamente.
export async function lerVinculados(entidade, filtro) {
  const registros = []; let cursor;
  do {
    const pagina = await entidade.filter(filtro, { sort: 'id', limit: 250, ...(cursor ? { cursor } : {}) });
    registros.push(...itens(pagina));
    if (!pagina?.has_more) break;
    if (!pagina.next_cursor || pagina.next_cursor === cursor) throw new Error('Paginação incompleta. Os saldos não podem ser calculados com segurança.');
    cursor = pagina.next_cursor;
  } while (cursor);
  return registros;
}

export async function consultarSaldosPedido(base44, ctx, body) {
  const { pedido_id, group_id, empresa_id } = body;
  const negar = async (error, status) => {
    await base44.asServiceRole.entities.AuditLog.create({
      usuario: ctx.user.full_name || ctx.user.email, usuario_id: ctx.user.id, acao: 'Bloqueio',
      modulo: 'Comercial', entidade: 'Pedido', tipo_auditoria: 'seguranca', registro_id: typeof pedido_id === 'string' ? pedido_id.slice(0, 100) : null,
      group_id: typeof group_id === 'string' ? group_id.slice(0, 100) : null, empresa_id: typeof empresa_id === 'string' ? empresa_id.slice(0, 100) : null,
      descricao: error, data_hora: new Date().toISOString(), sucesso: false,
    });
    return Response.json({ error }, { status });
  };
  if (![pedido_id, group_id, empresa_id].every((id) => typeof id === 'string' && /^[a-f\d]{24}$/i.test(id))) return negar('Pedido, grupo e empresa válidos são obrigatórios.', 400);
  if (!temPermissaoLeitura(ctx, 'Comercial', ['Pedido', 'Pedidos'])) return negar('Sem permissão de consulta em Comercial / Pedidos.', 403);
  if (!usuarioVinculado(ctx, group_id, empresa_id)) return negar('Usuário sem vínculo ativo com a empresa ou grupo.', 403);
  const contexto = { group_id, empresa_id };
  const [empresas, pedidos] = await Promise.all([
    base44.asServiceRole.entities.Empresa.filter({ id: empresa_id, group_id }, { limit: 1 }),
    base44.asServiceRole.entities.Pedido.filter({ id: pedido_id, ...contexto }, { limit: 1 }),
  ]);
  const pedido = itens(pedidos)[0];
  if (!itens(empresas).length || !pedido) return negar('Pedido não encontrado neste contexto.', 404);
  if (ctx.user.role !== 'admin' && ctx.user.restricoes_adicionais?.pode_ver_apenas_proprios_registros
    && ![pedido.vendedor_id, pedido.vendedor_responsavel_id, pedido.created_by_id].includes(ctx.user.id)) return negar('Pedido atribuído a outro responsável.', 403);
  const permissoes = {
    separacao: temPermissaoLeitura(ctx, 'Expedição', ['SeparacaoConferencia', 'Separação e Conferência', 'separacao', 'conferencia']),
    producao: temPermissaoLeitura(ctx, 'Produção', ['OrdemProducao', 'Ordens de Produção', 'ordens_producao']),
    entregas: temPermissaoLeitura(ctx, 'Expedição', ['Entrega', 'Entregas']),
    fiscal: temPermissaoLeitura(ctx, 'Fiscal', ['NotaFiscal', 'Notas Fiscais', 'notas_fiscais']),
  };
  const filtro = { ...contexto, pedido_id };
  const [separacoes, ops, entregas] = await Promise.all([
    permissoes.separacao ? lerVinculados(base44.asServiceRole.entities.SeparacaoConferencia, filtro) : [],
    permissoes.producao ? lerVinculados(base44.asServiceRole.entities.OrdemProducao, filtro) : [],
    permissoes.entregas ? lerVinculados(base44.asServiceRole.entities.Entrega, filtro) : [],
  ]);
  const itensEntrega = permissoes.entregas ? await lerVinculados(base44.asServiceRole.entities.EntregaItens, {
    ...contexto, $or: [{ pedido_id }, ...(entregas.length ? [{ entrega_id: { $in: entregas.map((e) => e.id) } }] : [])],
  }) : [];
  return Response.json({ ok: true, pedido_id, pedido_versao: pedido.updated_date, permissoes,
    itens: calcularSaldosPedido(pedido, { separacoes, ops, entregas, itensEntrega }, permissoes),
  }, { headers: { 'Cache-Control': 'no-store' } });
}