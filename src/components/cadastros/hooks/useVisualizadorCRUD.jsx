import { useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { ENTITY_CODE_FIELD } from "@/components/cadastros/config/entityCodeFields";
import { sanitizeOnWrite } from "@/components/lib/sanitizeOnWrite";

// Re-exporta para compatibilidade com importadores existentes
export { ENTITY_CODE_FIELD };

// P3: auditoria silenciosa (não bloqueia)
async function auditarAcao({ acao, ENTITY, registroId, empresaId, groupId, dadosAntes, dadosDepois, descricao }) {
  try {
    const user = await base44.auth.me().catch(() => null);
    await base44.entities.AuditLog.create({
      acao,
      modulo: 'Cadastros',
      tipo_auditoria: 'entidade',
      entidade: ENTITY,
      registro_id: registroId || null,
      descricao: descricao || `${acao} em ${ENTITY}`,
      usuario: user?.full_name || user?.email || 'Usuário',
      usuario_id: user?.id || null,
      empresa_id: empresaId || null,
      group_id: groupId || null,
      dados_anteriores: dadosAntes || null,
      dados_novos: dadosDepois || null,
      data_hora: new Date().toISOString(),
    });
  } catch { /* auditoria nunca bloqueia */ }
}

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
          return `⚠️ Código "${codeValue}" já está em uso pelo registro "${label}". Altere o código antes de salvar.`;
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
        const res = await base44.functions.invoke("entityListSorted", {
          entityName: ENTITY, filter: fiscalOr.length > 1 ? { $or: fiscalOr } : fiscalOr[0],
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
      if (formData.id) {
        const dadosAntes = { id: formData.id, ...formData };
        try { await deleteInContext(ENTITY, formData.id); } catch (_) {}
        auditarAcao({ acao: 'Exclusão', ENTITY, registroId: formData.id, empresaId, groupId, dadosAntes, descricao: `Exclusão via formulário: ${ENTITY}` });
      }
      handleCloseForm(true);
      return;
    }
    if (editItem?.id && !canEditCadastro) throw new Error("Sem permissão para editar.");
    if (!editItem?.id && !canCreateCadastro) throw new Error("Sem permissão para criar.");

    // P2: validar contexto multiempresa antes de salvar — lança para exibição inline no modal
    if (!isSimple && !empresaId && !groupId) {
      throw new Error("⚠️ Selecione uma empresa ou grupo antes de salvar.");
    }

    setIsSaving(true);
    try {
      // P2: sanitização + injeção de contexto multiempresa
      let clean = sanitizeOnWrite({ ...formData });
      delete clean._action;
      if (!isSimple) {
        if (!clean.empresa_id && empresaId) clean.empresa_id = empresaId;
        if (!clean.group_id  && groupId)   clean.group_id   = groupId;
      }
      // P3: verificar duplicata antes de salvar
      const erroDuplicata = await checkDuplicate(clean, !!(editItem?.id), editItem?.id);
      if (erroDuplicata) {
        setIsSaving(false);
        throw new Error(erroDuplicata);
      }
      if (editItem?.id) {
        await updateInContext(ENTITY, editItem.id, clean, "empresa_id");
        auditarAcao({ acao: 'Edição', ENTITY, registroId: editItem.id, empresaId, groupId, dadosAntes: editItem, dadosDepois: clean });
      } else {
        const criado = await createInContext(ENTITY, clean, "empresa_id");
        auditarAcao({ acao: 'Criação', ENTITY, registroId: criado?.id, empresaId, groupId, dadosDepois: clean });
      }
      handleCloseForm(true);
    } catch (e) {
      // Relança para que o formulário possa exibir o erro inline
      throw e;
    } finally { setIsSaving(false); }
  }, [ENTITY, editItem, empresaId, groupId, handleCloseForm, isSimple, canCreateCadastro, canEditCadastro, canDeleteCadastro, createInContext, updateInContext, deleteInContext, checkDuplicate, setIsSaving]);

  return { fetchNextCode, handlePersistSubmit, checkDuplicate };
}