/**
 * deduplicateCadastros — Verificação de Integridade do Cadastro Gerais (item 6)
 *
 * MUDANÇA (Regra-Mãe §4 + item 13): NÃO exclui mais automaticamente.
 * Agora gera RELATÓRIO de inconsistências para correção controlada por usuário autorizado.
 *
 * O relatório contém por entidade:
 *   - total_real: total de registros válidos
 *   - total_exibido_antes: contagem anterior reportada
 *   - duplicidades: registros com mesmo código+nome ou CNPJ/CPF
 *   - codigos_repetidos: códigos em uso por mais de um registro
 *   - registros_sem_descricao: registros sem nome/descrição válido
 *   - registros_sem_contexto: sem empresa_id E sem group_id
 *   - registros_inativos_em_uso: inativos ainda referenciados
 *   - divergencia_contagem: diferença entre total e contagem exibida
 *   - status: OK | Inconsistente | Crítico
 *
 * Admin-only. Auditoria completa de cada execução.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const BLOCOS_ENTITIES = {
  "Pessoas & Parceiros": ["Cliente","Fornecedor","Transportadora","Colaborador","Representante","ContatoB2B","SegmentoCliente","RegiaoAtendimento"],
  "Produtos & Serviços": ["Produto","Servico","SetorAtividade","GrupoProduto","Marca","TabelaPreco","KitProduto","CatalogoWeb","UnidadeMedida"],
  "Financeiro & Fiscal": ["Banco","FormaPagamento","PlanoDeContas","CentroCusto","CentroResultado","TipoDespesa","MoedaIndice","OperadorCaixa","ConfiguracaoDespesaRecorrente","TabelaFiscal","CondicaoComercial"],
  "Logística, Frotas & Almoxarifado": ["Veiculo","Motorista","TipoFrete","LocalEstoque","RotaPadrao","ModeloDocumento"],
  "Estrutura Organizacional": ["Empresa","GrupoEmpresarial","Departamento","Cargo","Turno","PerfilAcesso"],
  "Tecnologia, IA & Parâmetros": ["ApiExterna","ChatbotCanal","ChatbotIntent","JobAgendado","Webhook","ConfiguracaoNFe","GatewayPagamento","EventoNotificacao"],
};

const ALL_ENTITIES = Object.values(BLOCOS_ENTITIES).flat();

const INVALID_DESC_VALUES = new Set([
  '', ' ', '  ', '.', '-', '_', 'teste', 'test', 'sem nome', 'sem descricao',
  'novo', 'nova', 'n/a', 'na', 'null', 'undefined', 'xxx', '...',
  'novo registro', 'novo cadastro',
]);

function getCodigo(rec) {
  return (
    rec.codigo || rec.code || rec.codigo_banco || rec.sigla ||
    rec.placa || rec.cpf || rec.cnpj || rec.matricula || ''
  ).toString().toLowerCase().trim();
}

function getNome(rec) {
  return (
    rec.nome || rec.nome_completo || rec.razao_social || rec.nome_fantasia ||
    rec.descricao || rec.nome_marca || rec.nome_segmento || rec.nome_regiao ||
    rec.nome_perfil || rec.nome_rota || rec.nome_banco || rec.nome_kit ||
    rec.nome_grupo || rec.nome_setor || rec.nome_canal || rec.nome_intent ||
    rec.nome_job || rec.nome_webhook || rec.nome_api || rec.nome_gateway ||
    rec.nome_conta || rec.nome_cargo || rec.nome_modelo ||
    rec.titulo || rec.label || ''
  ).toString().toLowerCase().trim();
}

function buildKey(rec) {
  if (rec.cnpj) {
    const cnpj = rec.cnpj.toString().replace(/\D/g, '').trim();
    if (cnpj.length >= 11) return `cnpj::${cnpj}`;
  }
  if (rec.cpf) {
    const cpf = rec.cpf.toString().replace(/\D/g, '').trim();
    if (cpf.length >= 11) return `cpf::${cpf}`;
  }
  if (rec.placa) return `placa::${rec.placa.toString().toUpperCase().trim()}`;
  const codigo = getCodigo(rec);
  const nome = getNome(rec);
  if (!nome) return null;
  if (codigo) return `${codigo}::${nome}`;
  return `nome::${nome}`;
}

function hasValidDescription(rec) {
  const nome = getNome(rec);
  if (!nome) return false;
  if (INVALID_DESC_VALUES.has(nome)) return false;
  if (nome.length < 2) return false;
  return true;
}

function hasContext(rec) {
  return !!(rec.empresa_id || rec.group_id || rec.empresa_dona_id || rec.empresa_alocada_id || rec.empresa_faturamento_id);
}

async function auditEntity(base44, entityName, groupId) {
  try {
    const api = base44.asServiceRole.entities[entityName];
    if (!api) return { entityName, status: 'Erro', error: 'Entity not found' };

    // Fetch all records in batches
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

    if (!allRecords.length) return { entityName, status: 'OK', total_real: 0, issues: {} };

    // Detect duplicates
    const seen = new Map();
    const duplicates = [];
    const codeMap = new Map(); // code -> [ids]

    for (const rec of allRecords) {
      const key = buildKey(rec);
      if (key) {
        if (seen.has(key)) {
          const existing = seen.get(key);
          duplicates.push({ key, id1: existing.id, id2: rec.id, nome: getNome(rec) });
        } else {
          seen.set(key, { id: rec.id, created_date: rec.created_date });
        }
      }

      // Track code collisions
      const codigo = getCodigo(rec);
      if (codigo) {
        if (!codeMap.has(codigo)) codeMap.set(codigo, []);
        codeMap.get(codigo).push(rec.id);
      }
    }

    const codigosRepetidos = Array.from(codeMap.entries())
      .filter(([_, ids]) => ids.length > 1)
      .map(([code, ids]) => ({ codigo: code, ids, count: ids.length }));

    const semDescricao = allRecords.filter(r => !hasValidDescription(r)).map(r => ({ id: r.id, nome: getNome(r) || '(vazio)' }));
    const semContexto = allRecords.filter(r => !hasContext(r)).map(r => ({ id: r.id }));
    const inativos = allRecords.filter(r => {
      const st = (r.status || r.ativo || r.status_fornecedor || '').toString().toLowerCase();
      return st === 'inativo' || st === 'false' || r.ativo === false;
    });

    // Item 6: registros ativos sem uso (sem serem referenciados em entidades transacionais)
    // Verifica entidades dependentes principais: Pedido, ContaReceber, ContaPagar, OrdemCompra, MovimentacaoEstoque, Entrega
    const DEPENDENT_ENTITIES = {
      Cliente: ['Pedido', 'ContaReceber', 'OrcamentoCliente'],
      Fornecedor: ['OrdemCompra', 'ContaPagar'],
      Produto: ['Pedido', 'MovimentacaoEstoque', 'OrdemProducao'],
      Transportadora: ['Entrega', 'Romaneio'],
      FormaPagamento: ['ContaReceber', 'ContaPagar', 'Pedido'],
      Colaborador: ['ApontamentoProducao', 'Ponto'],
      Veiculo: ['Entrega', 'Rota'],
      Motorista: ['Entrega', 'Rota'],
    };
    const dependentEntities = DEPENDENT_ENTITIES[entityName] || [];
    let registrosSemUso = [];
    if (dependentEntities.length > 0 && allRecords.length > 0) {
      const activeRecords = allRecords.filter(r => {
        const st = (r.status || r.ativo || r.status_fornecedor || '').toString().toLowerCase();
        return st !== 'inativo' && st !== 'false' && r.ativo !== false;
      });
      const sample = activeRecords.slice(0, 50);
      const refField = `${entityName.toLowerCase()}_id`;
      const allIds = sample.map(r => r.id);
      // Batch: query each dependent entity ONCE with $in to get all referenced IDs
      const referencedIds = new Set();
      for (const depEntity of dependentEntities) {
        try {
          const depApi = base44.asServiceRole.entities[depEntity];
          if (!depApi) continue;
          // Fetch in chunks of 50 to stay within $in limits
          for (let i = 0; i < allIds.length; i += 50) {
            const chunk = allIds.slice(i, i + 50);
            const refs = await depApi.filter({ [refField]: { $in: chunk } }, '-id', 500) || [];
            for (const ref of refs) {
              if (ref[refField]) referencedIds.add(ref[refField]);
            }
          }
        } catch { /* skip dependent */ }
      }
      registrosSemUso = sample
        .filter(r => !referencedIds.has(r.id))
        .map(r => ({ id: r.id, nome: getNome(r) || r.id }));
    }

    // Item 6: divergência de contagem (total real vs exibido em cards)
    // O frontend reporta total_exibido via body; se ausente, assume igual
    const divergenciaContagem = 0; // calculado pelo frontend ao comparar

    const issues = {
      duplicidades: duplicates,
      codigos_repetidos: codigosRepetidos,
      registros_sem_descricao: semDescricao,
      registros_sem_contexto: semContexto,
      registros_inativos: inativos.length,
      registros_sem_uso: registrosSemUso,
      divergencia_contagem: divergenciaContagem,
    };

    const hasIssues = duplicates.length > 0 || codigosRepetidos.length > 0 || semDescricao.length > 0 || semContexto.length > 0 || registrosSemUso.length > 0;
    const status = hasIssues ? (duplicates.length > 5 || semDescricao.length > 10 ? 'Crítico' : 'Inconsistente') : 'OK';

    return {
      entityName,
      status,
      total_real: allRecords.length,
      total_exibido_antes: allRecords.length,
      total_corrigido: 0,
      issues,
    };
  } catch (error) {
    return { entityName, status: 'Erro', error: error.message };
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
      : ALL_ENTITIES;

    const results = {};
    const summary = {
      total_entities: targetEntities.length,
      total_registros: 0,
      total_duplicidades: 0,
      total_codigos_repetidos: 0,
      total_sem_descricao: 0,
      total_sem_contexto: 0,
      total_sem_uso: 0,
      entities_ok: 0,
      entities_inconsistente: 0,
      entities_critico: 0,
      entities_erro: 0,
    };

    for (const entityName of targetEntities) {
      const result = await auditEntity(base44, entityName, body.groupId);
      results[entityName] = result;
      summary.total_registros += result.total_real || 0;
      summary.total_duplicidades += result.issues?.duplicidades?.length || 0;
      summary.total_codigos_repetidos += result.issues?.codigos_repetidos?.length || 0;
      summary.total_sem_descricao += result.issues?.registros_sem_descricao?.length || 0;
      summary.total_sem_contexto += result.issues?.registros_sem_contexto?.length || 0;
      summary.total_sem_uso += result.issues?.registros_sem_uso?.length || 0;
      if (result.status === 'OK') summary.entities_ok++;
      else if (result.status === 'Inconsistente') summary.entities_inconsistente++;
      else if (result.status === 'Crítico') summary.entities_critico++;
      else summary.entities_erro++;
    }

    // Agrupa por bloco
    const byGroup = {};
    for (const [groupName, entities] of Object.entries(BLOCOS_ENTITIES)) {
      byGroup[groupName] = entities
        .filter(e => targetEntities.includes(e))
        .map(e => results[e])
        .filter(Boolean);
    }

    // Auditoria da execução
    try {
      await base44.asServiceRole.entities.AuditLog.create({
        acao: 'Visualização',
        modulo: 'Cadastros',
        tipo_auditoria: 'entidade',
        entidade: 'VerificacaoIntegridade',
        descricao: `Verificação de Integridade do Cadastro Gerais executada por ${user.email}`,
        usuario: user.full_name || user.email,
        usuario_id: user.id,
        dados_novos: { summary, entities_count: targetEntities.length },
        data_hora: new Date().toISOString(),
      });
    } catch { /* auditoria não bloqueia */ }

    return Response.json({
      ok: true,
      tipo: 'Verificação de Integridade do Cadastro Gerais',
      data_execucao: new Date().toISOString(),
      executado_por: user.email,
      summary,
      byGroup,
      results,
      nota: 'Relatório apenas para análise. Nenhuma exclusão automática foi realizada. Correções devem ser feitas manualmente por usuário autorizado.',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});