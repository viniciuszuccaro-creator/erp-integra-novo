/**
 * LayoutRBACWrapper — RBAC entity wrapping, HMR-safe.
 * Usa um único flag de versão para detectar re-execuções e sempre restaurar
 * os métodos originais antes de re-envolver. Nunca empilha wraps.
 */
import { useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { sanitizeOnWrite } from "@/components/lib/sanitizeOnWrite";

// Chave global para armazenar os originais fora do componente (sobrevive HMR)
const ORIG_KEY = "__rbac_orig_methods__";

function restoreEntity(api) {
  if (!api || !api[ORIG_KEY]) return;
  const o = api[ORIG_KEY];
  Object.keys(o).forEach((k) => { if (o[k]) api[k] = o[k]; });
  delete api[ORIG_KEY];
  delete api.__wrappedContext;
  delete api.__origGet;
}

export default function LayoutRBACWrapper({ user, empresaAtual, grupoAtual, contexto, contextRef }) {

  useEffect(() => {
    if (!base44?.entities) return;

    const stamp = (dados) => {
      const out = { ...(dados || {}) };
      try {
        const ctx = contextRef.current;
        if (ctx.grupoAtual?.id && !out.group_id) out.group_id = ctx.grupoAtual.id;
        if (ctx.contexto !== "grupo" && ctx.empresaAtual?.id && !out.empresa_id) out.empresa_id = ctx.empresaAtual.id;
      } catch (e) { console.error('[layout] catch:', e); }
      return out;
    };

    const getScope = () => {
      const scope = {};
      try {
        const ctx = contextRef.current;
        if (ctx.grupoAtual?.id) scope.group_id = ctx.grupoAtual.id;
        if (ctx.contexto !== "grupo" && ctx.empresaAtual?.id) scope.empresa_id = ctx.empresaAtual.id;
        if (ctx.contexto !== "grupo" && !ctx.empresaAtual?.id) scope.__blocked = true;
      } catch (e) { console.error('[layout] catch:', e); }
      return scope;
    };

    const __rbacCache = window.__layoutRbacCache || (window.__layoutRbacCache = new Map());
    const __RBAC_TTL = 5 * 60 * 1000;

    const WRITE_ACTIONS = ["criar", "editar", "excluir"];

    const checkRBAC = async (entityName, action) => {
      try {
        if (entityName === "AuditLog" && WRITE_ACTIONS.includes(action)) throw new Error("RBAC: entidade protegida");
        if (contextRef.current.user?.role === "admin") return;

        // Mapeamento completo entidade → módulo RBAC
        const map = {
          // CRM
          Cliente: "CRM", Oportunidade: "CRM", Interacao: "CRM", Campanha: "CRM", HistoricoCliente: "CRM", ContatoB2B: "CRM",
          // Comercial
          Pedido: "Comercial", Comissao: "Comercial", OrcamentoCliente: "Comercial", TabelaPreco: "Comercial", TabelaPrecoItem: "Comercial",
          OrcamentoSite: "Comercial", PedidoExterno: "Comercial", PedidoEtapa: "Comercial",
          // Fiscal
          NotaFiscal: "Fiscal", ImportacaoXMLNFe: "Fiscal", SPEDFiscal: "Fiscal", LogFiscal: "Fiscal", TabelaFiscal: "Fiscal", TabelaDIFAL: "Fiscal",
          // Expedição
          Entrega: "Expedição", Romaneio: "Expedição", Rota: "Expedição", EntregaItens: "Expedição", SeparacaoConferencia: "Expedição",
          RoteirizacaoInteligente: "Expedição",
          // Compras
          Fornecedor: "Compras", SolicitacaoCompra: "Compras", OrdemCompra: "Compras", Cotacao: "Compras",
          // Estoque
          Produto: "Estoque", MovimentacaoEstoque: "Estoque", Inventario: "Estoque", TransferenciaFilial: "Estoque", LocalEstoque: "Estoque",
          // Financeiro
          ContaPagar: "Financeiro", ContaReceber: "Financeiro", CentroCusto: "Financeiro", CaixaMovimento: "Financeiro",
          ConciliacaoBancaria: "Financeiro", LancamentoContabil: "Financeiro", PlanoDeContas: "Financeiro", DRE: "Financeiro",
          ExtratoBancario: "Financeiro", MovimentoCartao: "Financeiro", RateioFinanceiro: "Financeiro", ContaBancariaEmpresa: "Financeiro",
          CaixaOrdemLiquidacao: "Financeiro", ConciliacaoPedido: "Financeiro", PagamentoOmnichannel: "Financeiro",
          // Produção
          OrdemProducao: "Produção", ApontamentoProducao: "Producao", ConfiguracaoProducao: "Producao", InspecaoQualidade: "Producao",
          // RH
          Colaborador: "RH", Ferias: "RH", Ponto: "RH", Cargo: "RH", Departamento: "RH", Turno: "RH", MonitoramentoRH: "RH",
          // Contratos
          Contrato: "Contratos",
          // Agenda
          Evento: "Agenda",
          // Hub de Atendimento
          Chamado: "HubAtendimento", ConversaOmnicanal: "HubAtendimento", MensagemOmnicanal: "HubAtendimento",
          // Cadastros
          Marca: "Cadastros", GrupoProduto: "Cadastros", UnidadeMedida: "Cadastros", TabelaNCM: "Cadastros",
          CondicaoComercial: "Cadastros", SetorAtividade: "Cadastros", RegiaoAtendimento: "Cadastros", SegmentoCliente: "Cadastros",
          Veiculo: "Cadastros", Motorista: "Cadastros", RotaPadrao: "Cadastros", TipoFrete: "Cadastros", Transportadora: "Cadastros",
          Servico: "Cadastros", KitProduto: "Cadastros", MoedaIndice: "Cadastros", CentroResultado: "Cadastros",
          CentroOperacao: "Cadastros", CatalogoWeb: "Cadastros", OperadorCaixa: "Cadastros", ModeloDocumento: "Cadastros",
          FormaPagamento: "Cadastros", Banco: "Cadastros", GatewayPagamento: "Cadastros", Representante: "Cadastros",
          TipoDespesa: "Cadastros", Empresa: "Cadastros", GrupoEmpresarial: "Cadastros",
          // Sistema (admin-only para escrita — entityGuard bloqueia)
          PerfilAcesso: "Sistema", User: "Sistema", ConfiguracaoSistema: "Sistema", ConfiguracaoNFe: "Sistema",
          ConfiguracaoSeguranca: "Sistema", ConfiguracaoBackup: "Sistema", ConfiguracaoMonitoramento: "Sistema",
          GovernancaEmpresa: "Sistema", PermissaoEmpresaModulo: "Sistema", IAConfig: "Sistema",
          ApiExterna: "Sistema", Webhook: "Sistema", JobAgendado: "Sistema", SessaoUsuario: "Sistema",
          TokenRefresh: "Sistema", ConfiguracaoIntegracaoMarketplace: "Sistema",
          BackupAutomatico: "Sistema", MonitoramentoSistema: "Sistema", EventoNotificacao: "Sistema",
          ChatbotCanal: "Sistema", ChatbotIntent: "Sistema", ChatbotIntents: "Sistema",
          ConfiguracaoWhatsApp: "Sistema", ConfiguracaoBoletos: "Sistema", ConfiguracaoCanal: "Sistema",
          ConfiguracaoCobrancaEmpresa: "Sistema", ConfiguracaoDespesaRecorrente: "Sistema",
          ConfiguracaoGatewayPagamento: "Sistema", TemplateWhatsApp: "Sistema", DocumentacaoTecnica: "Sistema",
          ParametroOrigemPedido: "Sistema", ParametroPortalCliente: "Sistema", ParametroCaixaDiario: "Sistema",
          ParametroConciliacaoBancaria: "Sistema", ParametroRoteirizacao: "Sistema", ParametroRecebimentoNFe: "Sistema",
          ConfigFiscalEmpresa: "Sistema", SyncReport: "Sistema", SyncMap: "Sistema",
          ChatbotInteracao: "Sistema", BaseConhecimento: "Sistema",
        };
        const modName = map[entityName] || "Sistema";
        const scope = getScope();
        const cacheKey = `${modName}|${entityName}|${action}|${scope.empresa_id || ""}|${scope.group_id || ""}`;
        const now = Date.now();
        const cached = __rbacCache.get(cacheKey);
        if (cached && now - cached.ts < __RBAC_TTL) {
          if (!cached.allowed) throw new Error("RBAC backend: ação negada");
          return;
        }
        const res = await base44.functions.invoke("entityGuard", {
          module: modName, section: entityName, action, entity_name: entityName,
          empresa_id: scope.empresa_id || null, group_id: scope.group_id || null,
        });
        const allowed = !(res?.data?.allowed === false);
        __rbacCache.set(cacheKey, { allowed, ts: now });
        if (!allowed) throw new Error("RBAC backend: ação negada");
      } catch (err) {
        // Bloqueios explícitos do entityGuard: sempre re-throw
        if (err?.message === "RBAC backend: ação negada" || err?.response?.status === 403) throw err;
        // Para ações de escrita: fail-closed — qualquer erro inesperado bloqueia a operação
        if (WRITE_ACTIONS.includes(action)) {
          throw new Error(`RBAC: verificação falhou para ${action} em ${entityName}`);
        }
        // Para leitura: permite continuar (fail-open apenas para leitura)
      }
    };

    const wrapEntity = (api, name) => {
      if (!api || name === "AuditLog") return;

      // Sempre restaura antes de re-envolver (HMR-safe, sem empilhamento)
      restoreEntity(api);

      // Salva os métodos originais ANTES de qualquer wrap
      const orig = {};
      ["create", "bulkCreate", "update", "delete", "filter", "list", "get"].forEach((k) => {
        if (typeof api[k] === "function") orig[k] = api[k].bind(api);
      });
      api[ORIG_KEY] = orig;

      const PII_ENTITIES = new Set(["Cliente", "Colaborador", "Fornecedor"]);

      if (orig.create) {
        api.create = async (data) => {
          await checkRBAC(name, "criar");
          const result = await orig.create(stamp(sanitizeOnWrite(data)));
          if (PII_ENTITIES.has(name) && result?.id) {
            try { base44.functions.invoke("piiEncryptor", { entity_name: name, id: result.id, action: "encrypt" }); } catch (e) { console.error('[layout] catch:', e); }
          }
          return result;
        };
      }
      if (orig.bulkCreate) {
        api.bulkCreate = async (arr) => {
          const stamped = Array.isArray(arr) ? arr.map((x) => stamp(sanitizeOnWrite(x))) : arr;
          return await orig.bulkCreate(stamped);
        };
      }
      if (orig.update) {
        api.update = async (id, data) => {
          await checkRBAC(name, "editar");
          const result = await orig.update(id, stamp(sanitizeOnWrite(data)));
          if (PII_ENTITIES.has(name) && id) {
            try { base44.functions.invoke("piiEncryptor", { entity_name: name, id, action: "encrypt" }); } catch (e) { console.error('[layout] catch:', e); }
          }
          return result;
        };
      }
      if (orig.delete) {
        api.delete = async (id) => {
          await checkRBAC(name, "excluir");
          return await orig.delete(id);
        };
      }
      if (orig.filter) {
        api.filter = async (criteria = {}, order, limit, skip) => {
          const scope = getScope();
          const hasScope = !!criteria?.empresa_id || !!criteria?.group_id || !!criteria?.$or || !!criteria?.$and;
          const merged = !hasScope ? { ...criteria, ...scope } : criteria;
          return await orig.filter(merged, order, limit, skip);
        };
      }
      if (orig.list) {
        api.list = async (order, limit, skip) => {
          if (orig.filter) return await orig.filter(getScope(), order, limit, skip);
          return await orig.list(order, limit, skip);
        };
      }
      if (orig.get) {
        api.get = async (id) => {
          const rec = await orig.get(id);
          if (!rec) return rec;
          const scope = getScope();
          if (scope.__blocked) return null;
          const recEmpresa = rec?.empresa_id || rec?.empresa_dona_id || null;
          const recGroup = rec?.group_id || null;
          const ctx = contextRef.current;
          if (recEmpresa && ctx.empresaAtual?.id && recEmpresa !== ctx.empresaAtual.id) {
            if (!recGroup || recGroup !== ctx.grupoAtual?.id) return null;
          }
          return rec;
        };
      }

      api.__wrappedContext = true;
    };

    try {
      Object.keys(base44.entities).forEach((name) => wrapEntity(base44.entities[name], name));
    } catch (e) { console.error('[layout] catch:', e); }

    // Cleanup: restaura todos os métodos originais ao desmontar/re-executar
    return () => {
      try {
        Object.keys(base44.entities).forEach((name) => {
          const api = base44.entities[name];
          if (api) restoreEntity(api);
        });
      } catch (e) { console.error('[layout] catch:', e); }
    };

  }, [user?.id, empresaAtual?.id, grupoAtual?.id, contexto]);

  return null;
}