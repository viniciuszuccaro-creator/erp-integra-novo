import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

/**
 * P2.2: Propagação Grupo → Empresas
 * ContaReceber criada no Grupo (empresa_id=null) replicas para todas as empresas
 * Trigger: ContaReceber.create com origem='grupo'
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { groupId, contaGroupId } = await req.json();
    if (!groupId || !contaGroupId) {
      return Response.json({ error: 'groupId e contaGroupId obrigatórios' }, { status: 400 });
    }

    // 1. Buscar ContaReceber do Grupo
    const contaGrupo = await base44.entities.ContaReceber.get(contaGroupId);
    if (!contaGrupo || contaGrupo.group_id !== groupId || contaGrupo.origem !== 'grupo') {
      return Response.json({ error: 'ContaReceber grupo não encontrada' }, { status: 404 });
    }

    // 2. Buscar todas as empresas do grupo
    const empresas = await base44.entities.Empresa.filter({ group_id: groupId }, null, 100);
    if (!empresas || empresas.length === 0) {
      return Response.json({ success: true, message: 'Nenhuma empresa no grupo', replicated: [] });
    }

    // 3. Replicar para cada empresa
    const replicated = [];
    for (const empresa of empresas) {
      try {
        const contaEmpresa = {
          ...contaGrupo,
          id: undefined,
          empresa_id: empresa.id,
          origem: 'empresa',
          e_replicado: true,
          documento_grupo_id: contaGroupId,
          grupo_id: groupId,
        };
        delete contaEmpresa.id;

        const nova = await base44.entities.ContaReceber.create(contaEmpresa);
        replicated.push({ empresa_id: empresa.id, conta_id: nova.id });
      } catch (err) {
        console.error(`Erro ao replicar para empresa ${empresa.id}:`, err.message);
      }
    }

    // 4. Atualizar Grupo com empresas_replicadas
    await base44.entities.ContaReceber.update(contaGroupId, {
      replicado_para_empresas: true,
      empresas_replicadas: replicated.map(r => r.empresa_id),
    });

    return Response.json({
      success: true,
      message: `ContaReceber replicada para ${replicated.length} empresa(s)`,
      replicated,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});