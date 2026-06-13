import { useCallback } from "react";
import { base44 } from "@/api/base44Client";

export const ENTITY_CODE_FIELD = {
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
  Banco: 'codigo', UnidadeMedida: 'codigo', Veiculo: 'codigo', Motorista: 'codigo',
};

export default function useVisualizadorCRUD({
  ENTITY, editItem, empresaId, groupId, isSimple,
  canCreateCadastro, canEditCadastro, canDeleteCadastro,
  createInContext, updateInContext, deleteInContext,
  handleCloseForm, setIsSaving,
  readFilter, setNextCode,
}) {
  const checkDuplicate = useCallback(async (formData, isEdit, currentId) => {
    const codeField = ENTITY_CODE_FIELD[ENTITY] || 'codigo';
    const codeValue = formData[codeField] || formData.codigo || formData.sigla || formData.codigo_banco || null;

    if (codeValue && String(codeValue).trim()) {
      const codeFilter = { [codeField]: String(codeValue).trim() };
      try {
        const res = await base44.functions.invoke("entityListSorted", {
          entityName: ENTITY, filter: codeFilter,
          sortField: "created_date", sortDirection: "asc", limit: 5, skip: 0,
        });
        const conflito = (Array.isArray(res?.data) ? res.data : []).find(r => r.id !== currentId);
        if (conflito) {
          const label = conflito.nome || conflito.razao_social || conflito.descricao || conflito.sigla || conflito.id;
          return `⚠️ Código "${codeValue}" já está em uso pelo registro "${label}".\n\nAltere o código antes de salvar.`;
        }
      } catch { /* não bloqueia */ }
    }

    const cnpjClean = formData.cnpj ? String(formData.cnpj).replace(/\D/g,'') : '';
    const cpfClean  = formData.cpf  ? String(formData.cpf).replace(/\D/g,'')  : '';
    const fiscalOr  = [];
    if (cnpjClean.length >= 14) fiscalOr.push({ cnpj: formData.cnpj });
    if (cpfClean.length  >= 11) fiscalOr.push({ cpf: formData.cpf });
    if (fiscalOr.length) {
      try {
        const filter = fiscalOr.length > 1 ? { $or: fiscalOr } : fiscalOr[0];
        const res = await base44.functions.invoke("entityListSorted", {
          entityName: ENTITY, filter,
          sortField: "created_date", sortDirection: "asc", limit: 5, skip: 0,
        });
        const conflito = (Array.isArray(res?.data) ? res.data : []).find(r => r.id !== currentId);
        if (conflito) {
          const label = conflito.nome || conflito.razao_social || conflito.cnpj || conflito.id;
          const docType = cnpjClean.length >= 14 ? 'CNPJ' : 'CPF';
          return `⚠️ ${docType} já cadastrado no registro "${label}". Não é permitido duplicar.`;
        }
      } catch { /* não bloqueia */ }
    }
    return null;
  }, [ENTITY]);

  const fetchNextCode = useCallback(async (rf) => {
    const codeField = ENTITY_CODE_FIELD[ENTITY];
    if (!codeField) return;
    try {
      const res = await base44.functions.invoke("entityListSorted", {
        entityName: ENTITY, filter: rf,
        sortField: codeField, sortDirection: "desc", limit: 1, skip: 0,
      });
      const last = Array.isArray(res?.data) && res.data[0];
      const n = last ? parseInt(String(last[codeField]).replace(/\D/g,''), 10) : 0;
      setNextCode(String(isNaN(n) ? 1 : n + 1).padStart(3, '0'));
    } catch { setNextCode(null); }
  }, [ENTITY, setNextCode]);

  const handlePersistSubmit = useCallback(async (formData) => {
    if (!formData || !ENTITY) return;
    if (formData._action === "delete") {
      if (!canDeleteCadastro) throw new Error("Sem permissão para excluir.");
      if (formData.id) { try { await deleteInContext(ENTITY, formData.id); } catch (_) {} }
      handleCloseForm(true);
      return;
    }
    if (editItem?.id && !canEditCadastro) throw new Error("Sem permissão para editar.");
    if (!editItem?.id && !canCreateCadastro) throw new Error("Sem permissão para criar.");
    setIsSaving(true);
    try {
      const clean = { ...formData };
      delete clean._action;
      if (!isSimple) {
        if (!clean.empresa_id && empresaId) clean.empresa_id = empresaId;
        if (!clean.group_id  && groupId)   clean.group_id   = groupId;
      }
      const erroDuplicata = await checkDuplicate(clean, !!(editItem?.id), editItem?.id);
      if (erroDuplicata) { alert(erroDuplicata); setIsSaving(false); return; }
      if (editItem?.id) {
        await updateInContext(ENTITY, editItem.id, clean, "empresa_id");
      } else {
        await createInContext(ENTITY, clean, "empresa_id");
      }
      handleCloseForm(true);
    } catch (e) {
      alert("Erro ao salvar: " + (e?.message || String(e)));
    } finally { setIsSaving(false); }
  }, [ENTITY, editItem, empresaId, groupId, handleCloseForm, isSimple, canCreateCadastro, canEditCadastro, canDeleteCadastro, createInContext, updateInContext, deleteInContext, checkDuplicate, setIsSaving]);

  return { fetchNextCode, handlePersistSubmit, checkDuplicate };
}