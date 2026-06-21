import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * P6: Validador de Auditoria Multiempresa
 * Garante que todas as 18 entidades críticas têm group_id + empresa_id válidos
 * Entidades: ContaPagar, ContaReceber, Pedido, NotaFiscal, Entrega, OrdemCompra,
 *            Contrato, Produto, Colaborador, OrdemProducao, FormaPagamento, Oportunidade,
 *            Interacao, Campanha, Evento, Transportadora, Cliente, Fornecedor
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { group_id, limit = 100 } = body;

    if (!group_id) {
      return Response.json({ error: 'group_id obrigatório' }, { status: 400 });
    }

    const entidades = [
      'ContaPagar', 'ContaReceber', 'Pedido', 'NotaFiscal', 'Entrega', 'OrdemCompra',
      'Contrato', 'Produto', 'Colaborador', 'OrdemProducao', 'FormaPagamento', 'Oportunidade',
      'Interacao', 'Campanha', 'Evento', 'Transportadora', 'Cliente', 'Fornecedor'
    ];

    const resultados = {};
    for (const entidade of entidades) {
      try {
        const records = await base44.asServiceRole.entities[entidade].filter({ group_id }, undefined, limit);
        const recordsArr = Array.isArray(records) ? records : [];

        const semEmpresa = recordsArr.filter(r => !r.empresa_id);
        const validos = recordsArr.filter(r => r.empresa_id && r.group_id === group_id);

        resultados[entidade] = {
          total: recordsArr.length,
          validos: validos.length,
          sem_empresa_id: semEmpresa.length,
          problemas_detectados: semEmpresa.length > 0
        };
      } catch (e) {
        resultados[entidade] = { erro: e.message };
      }
    }

    // Audit
    try {
      const totalProblemas = Object.values(resultados).filter(r => r.problemas_detectados).length;
      await base44.asServiceRole.entities.AuditLog.create({
        usuario: user.full_name || user.email,
        usuario_id: user.id,
        modulo: 'Sistema',
        entidade: 'AuditoriaMultiempresa',
        acao: 'Validação',
        tipo_auditoria: 'sistema',
        group_id,
        descricao: `Auditoria multiempresa: ${totalProblemas} entidades com problemas detectados`,
        dados_novos: resultados,
        data_hora: new Date().toISOString(),
      });
    } catch (_) {}

    return Response.json({
      success: true,
      group_id,
      total_entidades_auditadas: entidades.length,
      resultados
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});