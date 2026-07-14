import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

/**
 * completarPropagacao v1.0
 * Script para completar propagação bidirecional
 * Adiciona Fornecedor, NotaFiscal, Entrega ao DOWN
 * Pré-requisito: Todos os registros devem ter documento_grupo_id preenchido
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const { 
      entity_name = 'Fornecedor',
      limit = 100,
      mode = 'sync' // 'sync' ou 'validate'
    } = await req.json();

    // Entidades a completar
    const PROPAGABLE = ['Fornecedor', 'NotaFiscal', 'Entrega'];

    if (!PROPAGABLE.includes(entity_name)) {
      return Response.json({
        error: `${entity_name} não está na lista de propagação`,
        propagable: PROPAGABLE
      }, { status: 400 });
    }

    // ===== VALIDAÇÃO =====
    if (mode === 'validate') {
      return await validatePropagacao(base44, entity_name);
    }

    // ===== SINCRONIZAÇÃO =====
    if (mode === 'sync') {
      return await syncPropagacao(base44, entity_name, limit);
    }

    return Response.json({ error: 'Invalid mode' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function validatePropagacao(base44, entityName) {
  try {
    // Buscar todos os registros de grupo
    const registros = await base44.asServiceRole.entities[entityName].filter(
      { group_id: { $ne: null }, empresa_id: null },
      null,
      1000
    );

    const issues = [];
    const ok = [];

    for (const reg of registros) {
      if (!reg.grupo_origem && !reg.document_grupo_id && !reg.documento_grupo_id) {
        // Não tem origem rastreável
        if (!reg.documento_grupo_id) {
          issues.push({
            id: reg.id,
            problema: 'Falta documento_grupo_id',
            severidade: 'alta'
          });
        }
      } else {
        ok.push({ id: reg.id });
      }
    }

    return Response.json({
      ok: true,
      entity: entityName,
      total: registros.length,
      problemas: issues.length,
      issues: issues.slice(0, 10),
      prontos: ok.length,
      proximos_passos: [
        `${issues.length} registros precisam de documento_grupo_id`,
        `${ok.length} registros podem ser propagados`,
        'Use mode=sync para iniciar propagação'
      ]
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

async function syncPropagacao(base44, entityName, limit) {
  try {
    // 1. Buscar registros de grupo que ainda não foram replicados
    const registros = await base44.asServiceRole.entities[entityName].filter(
      { 
        group_id: { $ne: null }, 
        empresa_id: null,
        e_replicado: { $ne: true }
      },
      null,
      limit
    );

    const results = [];

    for (const reg of registros) {
      try {
        // 2. Buscar empresas do grupo
        const empresas = await base44.asServiceRole.entities.Empresa.filter(
          { group_id: reg.group_id },
          null,
          100
        );

        // 3. Replicar para cada empresa
        for (const emp of empresas) {
          try {
            const newData = {
              ...reg,
              empresa_id: emp.id,
              empresa_dona_id: emp.id,
              documento_grupo_id: reg.id || reg.documento_grupo_id,
              e_replicado: true,
              group_id: reg.group_id,
            };
            delete newData.id;
            delete newData.created_date;
            delete newData.updated_date;

            // Verificar se já existe
            const existing = await base44.asServiceRole.entities[entityName]
              .filter({
                documento_grupo_id: reg.id || reg.documento_grupo_id,
                empresa_id: emp.id
              }, null, 1)
              .catch(() => []);

            if (existing.length === 0) {
              await base44.asServiceRole.entities[entityName].create(newData);
              results.push({
                registro_grupo_id: reg.id,
                empresa_id: emp.id,
                acao: 'criado'
              });
            } else {
              results.push({
                registro_grupo_id: reg.id,
                empresa_id: emp.id,
                acao: 'já_existe'
              });
            }
          } catch (e) {
            results.push({
              registro_grupo_id: reg.id,
              empresa_id: emp.id,
              acao: 'erro',
              erro: e.message
            });
          }
        }
      } catch (e) {
        results.push({
          registro_grupo_id: reg.id,
          acao: 'erro',
          erro: e.message
        });
      }
    }

    // 4. Marcar originais como replicados
    for (const reg of registros) {
      try {
        await base44.asServiceRole.entities[entityName].update(reg.id, {
          e_replicado: true
        });
      } catch (e) {
        // Silent fail — log apenas
      }
    }

    return Response.json({
      ok: true,
      entity: entityName,
      registros_processados: registros.length,
      total_replicas_criadas: results.filter(r => r.acao === 'criado').length,
      total_ja_existentes: results.filter(r => r.acao === 'já_existe').length,
      total_erros: results.filter(r => r.acao === 'erro').length,
      resultados: results.slice(0, 50),
      proximos_passos: [
        `Propagação do ${entityName} completa`,
        'Verificar erros acima se houver',
        'Testar no dashboard: criar registro de grupo → deve aparecer em empresas'
      ]
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}