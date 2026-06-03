/**
 * deduplicateCadastros — Remove registros duplicados (mesmo código + descrição)
 * Mantém o registro mais antigo (created_date menor)
 * Executa para todas as 6 categorias
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const BLOCOS_ENTITIES = {
  bloco1: ["Cliente","Fornecedor","Transportadora","Colaborador","Representante","ContatoB2B","SegmentoCliente","RegiaoAtendimento"],
  bloco2: ["Produto","Servico","SetorAtividade","GrupoProduto","Marca","TabelaPreco","KitProduto","CatalogoWeb","UnidadeMedida"],
  bloco3: ["Banco","FormaPagamento","PlanoDeContas","CentroCusto","CentroResultado","TipoDespesa","MoedaIndice","OperadorCaixa","ConfiguracaoDespesaRecorrente","TabelaFiscal","CondicaoComercial"],
  bloco4: ["Veiculo","Motorista","TipoFrete","LocalEstoque","RotaPadrao","ModeloDocumento"],
  bloco5: ["Empresa","GrupoEmpresarial","Departamento","Cargo","Turno","PerfilAcesso"],
  bloco6: ["ApiExterna","ChatbotCanal","ChatbotIntent","JobAgendado","Webhook","ConfiguracaoNFe","GatewayPagamento","EventoNotificacao"],
};

const ALL_ENTITIES = Object.values(BLOCOS_ENTITIES).flat();

async function deduplicateEntity(base44, entityName) {
  try {
    const api = base44.asServiceRole.entities[entityName];
    if (!api) return { entityName, deleted: 0, error: 'Entity not found' };

    // Fetch all records
    let allRecords = [];
    try {
      allRecords = await api.list('', 10000) || [];
    } catch {
      allRecords = [];
    }

    if (!allRecords.length) return { entityName, deleted: 0 };

    // Deduplicate by codigo + descricao
    const seen = new Map(); // key: "codigo::descricao" -> { id, created_date }
    const toDelete = [];

    allRecords.forEach((rec) => {
      const codigo = rec.codigo || rec.code || '';
      const descricao = rec.descricao || rec.description || rec.nome_marca || rec.nome || '';
      const key = `${codigo}::${descricao}`.toLowerCase().trim();

      if (!key || !codigo || !descricao) return; // Skip records without identifiers

      if (seen.has(key)) {
        const existing = seen.get(key);
        const existingDate = new Date(existing.created_date || 0).getTime();
        const currentDate = new Date(rec.created_date || 0).getTime();
        
        // Keep the older one (lower date), delete the newer duplicate
        if (currentDate > existingDate) {
          toDelete.push(rec.id);
        } else {
          toDelete.push(existing.id);
          seen.set(key, { id: rec.id, created_date: rec.created_date });
        }
      } else {
        seen.set(key, { id: rec.id, created_date: rec.created_date });
      }
    });

    // Delete duplicates
    for (const id of toDelete) {
      try {
        await api.delete(id);
      } catch (_) {}
    }

    return { entityName, deleted: toDelete.length, total: allRecords.length };
  } catch (error) {
    return { entityName, deleted: 0, error: error.message };
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const results = {};
    const summary = { total_deleted: 0, entities_processed: 0, errors: [] };

    for (const entityName of ALL_ENTITIES) {
      const result = await deduplicateEntity(base44, entityName);
      results[entityName] = result;
      summary.total_deleted += result.deleted || 0;
      summary.entities_processed += 1;
      if (result.error) summary.errors.push(`${entityName}: ${result.error}`);
    }

    return Response.json({ ok: true, results, summary });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});