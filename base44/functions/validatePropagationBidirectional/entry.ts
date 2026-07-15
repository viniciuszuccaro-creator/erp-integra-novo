import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

/**
 * P6: Validador de Propagação Bidirecional
 * Verifica integridade de documentos grupo↔empresa para as 8 entidades críticas
 * - Contrato, Produto, Colaborador, OrdemCompra, Entrega, OrdemProducao, NotaFiscal, FormaPagamento
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { entity_name, group_id, empresa_id } = body;

    if (!entity_name || !group_id) {
      return Response.json({ error: 'entity_name e group_id obrigatórios' }, { status: 400 });
    }

    const entities = ['Contrato', 'Produto', 'Colaborador', 'OrdemCompra', 'Entrega', 'OrdemProducao', 'NotaFiscal', 'FormaPagamento'];
    if (!entities.includes(entity_name)) {
      return Response.json({ error: `${entity_name} não é entidade crítica` }, { status: 400 });
    }

    // Se tem empresa_id, validar específico; senão, validar todas da empresa
    const empresas = empresa_id 
      ? [{ id: empresa_id }]
      : await base44.asServiceRole.entities.Empresa.filter({ group_id });
    const empresasArr = Array.isArray(empresas) ? empresas : [];

    const resultados = await Promise.allSettled(empresasArr.map(async (emp) => {
      // Buscar registros replicados da empresa
      const replicados = await base44.asServiceRole.entities[entity_name].filter({
        group_id,
        empresa_id: emp.id,
        e_replicado: true
      });

      const replicadosArr = Array.isArray(replicados) ? replicados : [];
      const totalReplicados = replicadosArr.length;

      // Verificar integridade: cada um tem documento_grupo_id válido?
      const orfaos = [];
      for (const rep of replicadosArr) {
        if (!rep.documento_grupo_id) {
          orfaos.push({ id: rep.id, numero_doc: rep.numero_oc || rep.numero_op || rep.numero_contrato || rep.codigo });
        }
      }

      return {
        empresa_id: emp.id,
        total_replicados: totalReplicados,
        orfaos_detectados: orfaos.length,
        orfaos_ids: orfaos.map(o => o.id)
      };
    }));

    const ok = resultados.filter(r => r.status === 'fulfilled').map(r => r.value);
    const fail = resultados.filter(r => r.status === 'rejected').length;
    const totalOrfaos = ok.reduce((s, r) => s + r.orfaos_detectados, 0);

    // Audit
    try {
      await base44.asServiceRole.entities.AuditLog.create({
        usuario: user.full_name || user.email,
        usuario_id: user.id,
        modulo: 'Sistema',
        entidade: 'PropagacaoBidirecional',
        acao: 'Validação',
        tipo_auditoria: 'sistema',
        group_id,
        descricao: `Validação propagação: ${entity_name} – ${ok.length} empresas, ${totalOrfaos} orfãos detectados`,
        dados_novos: { ok, totalOrfaos },
        data_hora: new Date().toISOString(),
      });
    } catch (_) { console.error('[validatePropagationBidirectional] catch:', _); }

    return Response.json({
      success: true,
      entity_name,
      group_id,
      total_empresas: ok.length,
      total_orfaos: totalOrfaos,
      detalhes_empresas: ok,
      falhas_query: fail
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});