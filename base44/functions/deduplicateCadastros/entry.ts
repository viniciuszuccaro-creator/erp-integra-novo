/**
 * deduplicateCadastros — Remove registros duplicados de todas as entidades de cadastro.
 * Lógica: deduplicação por chave composta (codigo + nome/descricao) OU somente por nome
 * quando não existe código. Mantém o registro mais antigo (created_date menor).
 * Admin-only.
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

// Extrai o melhor identificador "código" disponível no registro
function getCodigo(rec) {
  return (
    rec.codigo || rec.code || rec.codigo_banco || rec.sigla ||
    rec.placa || rec.cpf || rec.cnpj || rec.matricula || ''
  ).toString().toLowerCase().trim();
}

// Extrai o melhor identificador "nome/descrição" disponível no registro
function getNome(rec) {
  return (
    rec.nome || rec.nome_completo || rec.razao_social || rec.nome_fantasia ||
    rec.descricao || rec.nome_marca || rec.nome_segmento || rec.nome_regiao ||
    rec.nome_perfil || rec.nome_rota || rec.nome_banco || rec.nome_kit ||
    rec.nome_grupo || rec.nome_setor || rec.nome_canal || rec.nome_intent ||
    rec.nome_job || rec.nome_webhook || rec.nome_api || rec.nome_gateway ||
    rec.titulo || rec.label || ''
  ).toString().toLowerCase().trim();
}

// Monta a chave de deduplicação: prioriza codigo+nome, se não houver codigo usa só nome
function buildKey(rec) {
  const codigo = getCodigo(rec);
  const nome = getNome(rec);
  if (!nome) return null; // sem nome = não deduplica (evitar falso positivo)
  if (codigo) return `${codigo}::${nome}`;
  return `nome::${nome}`; // deduplica por nome quando não há código
}

async function deduplicateEntity(base44, entityName) {
  try {
    const api = base44.asServiceRole.entities[entityName];
    if (!api) return { entityName, deleted: 0, error: 'Entity not found' };

    // Busca em lotes para cobrir bases grandes (Produto tem 828+)
    let allRecords = [];
    let skip = 0;
    const batchSize = 500;
    while (true) {
      let batch = [];
      try {
        batch = await api.list('-created_date', batchSize, skip) || [];
      } catch { break; }
      if (!batch.length) break;
      allRecords = allRecords.concat(batch);
      if (batch.length < batchSize) break;
      skip += batchSize;
    }

    if (!allRecords.length) return { entityName, deleted: 0, total: 0 };

    // Detecta duplicatas
    const seen = new Map(); // key → { id, created_date }
    const toDelete = [];

    for (const rec of allRecords) {
      const key = buildKey(rec);
      if (!key) continue; // registro sem identificador — preserva

      if (seen.has(key)) {
        const existing = seen.get(key);
        const existingDate = new Date(existing.created_date || 0).getTime();
        const currentDate  = new Date(rec.created_date || 0).getTime();
        // Mantém o mais antigo; deleta o mais novo
        if (currentDate >= existingDate) {
          toDelete.push(rec.id);
        } else {
          toDelete.push(existing.id);
          seen.set(key, { id: rec.id, created_date: rec.created_date });
        }
      } else {
        seen.set(key, { id: rec.id, created_date: rec.created_date });
      }
    }

    // Exclui em lotes de 10 para não sobrecarregar
    for (let i = 0; i < toDelete.length; i += 10) {
      await Promise.all(
        toDelete.slice(i, i + 10).map(id => api.delete(id).catch(() => {}))
      );
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

    // Permite filtrar somente um bloco via payload
    const body = await req.json().catch(() => ({}));
    const targetEntities = body.entities
      ? (Array.isArray(body.entities) ? body.entities : [body.entities])
      : ALL_ENTITIES;

    const results = {};
    const summary = { total_deleted: 0, entities_processed: 0, errors: [] };

    for (const entityName of targetEntities) {
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