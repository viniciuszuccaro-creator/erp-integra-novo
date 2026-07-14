import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

function chunk(arr, size) { const out = []; for (let i=0;i<arr.length;i+=size) out.push(arr.slice(i,i+size)); return out; }

async function getEmpresaById(sr, id) {
  if (!id) return null;
  try { const emp = await sr.entities.Empresa.filter({ id }, undefined, 1); return emp?.[0] || null; } catch { return null; }
}

const DEFAULT_ENTITIES = [
  // Core operacional
  'Cliente','Fornecedor','Produto','Pedido','Entrega','ContaPagar','ContaReceber',
  'OrdemCompra','MovimentacaoEstoque','SolicitacaoCompra','Transportadora','Colaborador',
  'CentroCusto','NotaFiscal','OrdemProducao','ApontamentoProducao','Inventario',
  'LancamentoContabil','CaixaMovimento','ConciliacaoBancaria','Romaneio','Rota',
  // Entidades corrigidas na auditoria P2
  'Contrato','OrcamentoCliente','Oportunidade','Interacao','Evento','Chamado',
  'Comissao','Campanha','TransferenciaFilial','Ponto','Ferias',
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user?.role !== 'admin') return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const entities = Array.isArray(body?.entities) && body.entities.length ? body.entities : DEFAULT_ENTITIES;
    const dryRun = body?.dryRun !== false; // default true
    // For execução sob automação: honrar preferência de dry-run via flag forçada
    const forceDryRun = body?.forceDryRun === true;
    const apply = !forceDryRun && (body?.apply === true && dryRun === false); // only when explicitly requested and not dryRun
    const limitPerEntity = Number(body?.limitPerEntity) > 0 ? Number(body.limitPerEntity) : 1000;

    const sr = base44.asServiceRole;
    const summary = [];

    for (const entityName of entities) {
      const result = { entity: entityName, scanned: 0, toUpdate: 0, updated: 0, skipped: 0, errors: 0 };

      // Paginação simples por skip
      let skip = 0; const page = 500;
      while (true) {
        const batch = await sr.entities[entityName].filter({}, '-updated_date', page, skip).catch(() => []);
        if (!batch?.length) break;
        skip += page; result.scanned += batch.length;

        const candidates = batch.filter(r => (r?.empresa_id && !r?.group_id) || (!r?.empresa_id && r?.group_id));
        if (!candidates.length) continue;

        // Hard cap por entidade por execução
        const capped = result.toUpdate + candidates.length > limitPerEntity ? candidates.slice(0, Math.max(0, limitPerEntity - result.toUpdate)) : candidates;
        result.toUpdate += capped.length;

        for (const rec of capped) {
          try {
            // Caso 1: empresa_id presente e group_id ausente -> preencher group_id a partir da Empresa
            if (rec?.empresa_id && !rec?.group_id) {
              const emp = await getEmpresaById(sr, rec.empresa_id);
              if (!emp?.group_id) { result.skipped++; continue; }
              const patch = { group_id: emp.group_id };
              if (!dryRun && apply) {
                await sr.entities[entityName].update(rec.id, patch);
                result.updated++;
              }
              continue;
            }
            // Caso 2: group_id presente e empresa_id ausente -> manter escopo de grupo (não forçar empresa)
            if (rec?.group_id && !rec?.empresa_id) {
              // Sem alteração; apenas contabiliza como válido
              result.skipped++;
              continue;
            }
          } catch (_) {
            result.errors++;
          }
        }

        if (result.toUpdate >= limitPerEntity) break; // respeita limite
      }

      summary.push(result);
      // Auditoria por entidade
      try {
        await sr.entities.AuditLog.create({
          usuario: user.full_name || user.email || 'Admin', usuario_id: user.id,
          acao: apply ? 'Edição' : 'Visualização', modulo: 'Sistema', tipo_auditoria: 'sistema', entidade: 'BackfillMultiempresa',
          descricao: `${entityName}: scanned=${result.scanned} toUpdate=${result.toUpdate} ${apply ? 'updated='+result.updated : '(dry-run)'} skipped=${result.skipped}`,
          data_hora: new Date().toISOString(),
        });
      } catch {}
    }

    return Response.json({ ok: true, dryRun: forceDryRun ? true : dryRun, apply, summary });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});