import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * P2.2: Propagação Grupo → Empresas — OrdemProducao
 * OP centralizada no Grupo distribui produção entre unidades fabris
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { groupId, opId, empresaDestino } = await req.json();
    if (!groupId || !opId) {
      return Response.json({ error: 'groupId e opId obrigatórios' }, { status: 400 });
    }

    const op = await base44.entities.OrdemProducao.get(opId);
    if (!op || op.group_id !== groupId) {
      return Response.json({ error: 'OrdemProducao do grupo não encontrada' }, { status: 404 });
    }

    // Para produção, geralmente distribui para 1 unidade específica
    let empresa = null;
    if (empresaDestino) {
      empresa = await base44.entities.Empresa.get(empresaDestino);
    }

    if (!empresa) {
      return Response.json({ error: 'Empresa destino não encontrada' }, { status: 404 });
    }

    const opEmpresa = {
      ...op,
      id: undefined,
      empresa_id: empresa.id,
      group_id: groupId,
      documento_grupo_id: opId,
    };
    delete opEmpresa.id;

    const nova = await base44.entities.OrdemProducao.create(opEmpresa);

    await base44.entities.AuditLog.create({
      usuario: user.full_name || user.email,
      usuario_id: user.id,
      modulo: 'Produção',
      entidade: 'OrdemProducao',
      acao: 'Criação',
      tipo_auditoria: 'multiempresa',
      empresa_id: empresa.id,
      group_id: groupId,
      registro_id: nova.id,
      descricao: `OP grupo→empresa ${empresa.id} | OP original: ${opId}`,
      data_hora: new Date().toISOString(),
    });

    return Response.json({
      success: true,
      message: `OP distribuída para empresa ${empresa.nome_fantasia || empresa.id}`,
      op_id: nova.id,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});