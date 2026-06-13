/**
 * backfillEntityCodes — Atribui códigos sequenciais a registros sem código.
 * - Detecta o campo correto de código por entidade
 * - Continua a numeração a partir do maior código já existente
 * - Só atualiza registros onde o campo está vazio/nulo
 * - Admin-only
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Campo "código" de cada entidade de cadastro
const ENTITY_CODE_FIELD = {
  Cliente: 'codigo', Fornecedor: 'codigo', Transportadora: 'codigo',
  Colaborador: 'matricula', Representante: 'codigo', ContatoB2B: 'codigo',
  SegmentoCliente: 'codigo', RegiaoAtendimento: 'codigo_regiao',
  Produto: 'codigo', Servico: 'codigo_servico', SetorAtividade: 'codigo',
  GrupoProduto: 'codigo', Marca: 'codigo', TabelaPreco: 'codigo',
  KitProduto: 'codigo_kit', CatalogoWeb: 'codigo',
  FormaPagamento: 'codigo', PlanoDeContas: 'codigo', CentroCusto: 'codigo',
  CentroResultado: 'codigo', TipoDespesa: 'codigo', MoedaIndice: 'codigo',
  OperadorCaixa: 'codigo', ConfiguracaoDespesaRecorrente: 'codigo',
  TabelaFiscal: 'codigo', CondicaoComercial: 'codigo',
  TipoFrete: 'codigo', LocalEstoque: 'codigo', RotaPadrao: 'codigo',
  ModeloDocumento: 'codigo', GrupoEmpresarial: 'codigo',
  Departamento: 'codigo', Cargo: 'codigo', Turno: 'codigo',
  PerfilAcesso: 'codigo', ApiExterna: 'codigo', ChatbotCanal: 'codigo',
  ChatbotIntent: 'codigo', JobAgendado: 'codigo', Webhook: 'codigo',
  ConfiguracaoNFe: 'codigo', GatewayPagamento: 'codigo', EventoNotificacao: 'codigo',
  // Skipped (já têm chave natural): Banco(codigo_banco), Veiculo(placa),
  // Motorista(cnh_numero), Empresa(cnpj), UnidadeMedida(sigla)
};

function padCode(n) {
  return String(n).padStart(3, '0'); // 001, 002, ...
}

async function backfillEntity(base44, entityName, codeField) {
  try {
    const api = base44.asServiceRole.entities[entityName];
    if (!api) return { entityName, updated: 0, error: 'Entity not found' };

    // Busca todos os registros em lotes
    let allRecords = [];
    let skip = 0;
    while (true) {
      let batch = [];
      try { batch = await api.list('-created_date', 500, skip) || []; } catch { break; }
      if (!batch.length) break;
      allRecords = allRecords.concat(batch);
      if (batch.length < 500) break;
      skip += 500;
    }

    if (!allRecords.length) return { entityName, updated: 0, total: 0 };

    // Descobre o maior código numérico já existente
    let maxCode = 0;
    for (const rec of allRecords) {
      const val = rec[codeField];
      if (val && String(val).trim() !== '') {
        const n = parseInt(String(val).replace(/\D/g, ''), 10);
        if (!isNaN(n) && n > maxCode) maxCode = n;
      }
    }

    // Filtra apenas registros sem código
    const semCodigo = allRecords.filter(rec => !rec[codeField] || String(rec[codeField]).trim() === '');

    if (!semCodigo.length) return { entityName, updated: 0, total: allRecords.length, skipped: 'all_have_codes' };

    // Ordena por created_date para numerar na ordem de criação
    semCodigo.sort((a, b) => new Date(a.created_date || 0) - new Date(b.created_date || 0));

    let counter = maxCode;
    const updates = semCodigo.map(rec => {
      counter++;
      return { id: rec.id, [codeField]: padCode(counter) };
    });

    // Atualiza em lotes de 20 para não sobrecarregar
    for (let i = 0; i < updates.length; i += 20) {
      await Promise.all(
        updates.slice(i, i + 20).map(u =>
          api.update(u.id, { [codeField]: u[codeField] }).catch(() => {})
        )
      );
    }

    return { entityName, codeField, updated: updates.length, total: allRecords.length, maxCodeAfter: counter };
  } catch (error) {
    return { entityName, updated: 0, error: error.message };
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const targetEntities = body.entities
      ? (Array.isArray(body.entities) ? body.entities : [body.entities])
      : Object.keys(ENTITY_CODE_FIELD);

    const results = {};
    const summary = { total_updated: 0, entities_processed: 0, errors: [] };

    for (const entityName of targetEntities) {
      const codeField = ENTITY_CODE_FIELD[entityName];
      if (!codeField) continue;
      const result = await backfillEntity(base44, entityName, codeField);
      results[entityName] = result;
      summary.total_updated += result.updated || 0;
      summary.entities_processed++;
      if (result.error) summary.errors.push(`${entityName}: ${result.error}`);
    }

    return Response.json({ ok: true, results, summary });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});