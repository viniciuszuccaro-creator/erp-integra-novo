import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * P2.2: Propagação Grupo → Empresas — OrdemCompra
 * OC criada no Grupo distribui para empresas específicas
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { groupId, ocId, empresasDestino } = await req.json();
    if (!groupId || !ocId) {
      return Response.json({ error: 'groupId e ocId obrigatórios' }, { status: 400 });
    }

    const oc = await base44.entities.OrdemCompra.get(ocId);
    if (!oc || oc.group_id !== groupId) {
      return Response.json({ error: 'OrdemCompra grupo não encontrada' }, { status: 404 });
    }

    // Determinar empresas destino
    let empresas = [];
    if (empresasDestino && empresasDestino.length > 0) {
      empresas = await Promise.all(empresasDestino.map(id => base44.entities.Empresa.get(id)));
      empresas = empresas.filter(Boolean);
    } else {
      empresas = await base44.entities.Empresa.filter({ group_id: groupId }, null, 100);
    }

    if (!empresas.length) {
      return Response.json({ success: true, message: 'Nenhuma empresa destino', replicated: [] });
    }

    const replicated = [];
    const valorPorEmpresa = (oc.valor_total || 0) / empresas.length;

    for (const empresa of empresas) {
      try {
        const ocEmpresa = {
          ...oc,
          id: undefined,
          empresa_id: empresa.id,
          e_replicado: true,
          documento_grupo_id: ocId,
          group_id: groupId,
          valor_total: valorPorEmpresa,
          solicitante: user.full_name || user.email,
        };
        delete ocEmpresa.id;

        const nova = await base44.entities.OrdemCompra.create(ocEmpresa);
        replicated.push({ empresa_id: empresa.id, oc_id: nova.id, valor: valorPorEmpresa });
      } catch (err) {
        console.error(`Erro ao replicar OC para ${empresa.id}:`, err.message);
      }
    }

    await base44.entities.OrdemCompra.update(ocId, {
      distribuicao_realizada: replicated.map(r => ({
        empresa_id: r.empresa_id, titulo_id: r.oc_id, valor: r.valor, status: 'Solicitada',
      })),
    });

    return Response.json({ success: true, replicated, message: `OC distribuída para ${replicated.length} empresa(s)` });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});